// MEN201 quiz — teacher manual grading queue.
import { db } from "./firebase.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { fetchDocsByIds } from "./firestore-utils.js";
import { imgSrc } from "./formats.js";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

export async function loadGradingQueue() {
  const snap = await getDocs(
    query(collection(db, "attempts"), where("status", "==", "awaiting-manual"), orderBy("submittedAt", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function loadGradingContext(attempt) {
  const [questions, users, assessmentSnap] = await Promise.all([
    fetchDocsByIds("questions", attempt.questionIds),
    fetchDocsByIds("users", [attempt.userId]),
    getDoc(doc(db, "assessments", attempt.assessmentId)),
  ]);
  const student = users[attempt.userId] || {};
  const assessment = assessmentSnap.exists() ? assessmentSnap.data() : {};
  const sections = {};
  (assessment.sections || []).forEach((s) => (sections[s.id] = s));
  return { questions, student, assessment, sections };
}

function weightFor(sections, sectionId, q) {
  const s = sections[sectionId];
  return s && Number.isFinite(s.marksPerQuestion) ? s.marksPerQuestion : q.marks || 1;
}

export function renderGradingPanel(attempt, ctx) {
  const { questions, student, assessment, sections } = ctx;
  const manualItems = (attempt.answers || []).filter((a) => {
    const q = questions[a.qid];
    return q && q.autoGraded === false;
  });
  if (!manualItems.length) {
    return `<p class="muted">No manual items in this attempt.</p>`;
  }

  const cards = manualItems
    .map((a, i) => {
      const q = questions[a.qid];
      const max = weightFor(sections, a.section, q);
      const prev = (attempt.manualGrading || []).find((m) => m.qid === a.qid);
      const rubric = (q.rubric || [])
        .map((r) => `<li>${esc(r.point)} <span class="muted">(${r.marks} mark${r.marks === 1 ? "" : "s"})</span></li>`)
        .join("");
      const img = q.image ? `<figure class="qimg"><img src="${imgSrc(q.image)}" alt="diagram"></figure>` : "";
      return `
      <div class="grade-item" data-qid="${esc(a.qid)}" data-section="${esc(a.section)}">
        <div class="grade-head">
          <span class="tag warn">Section ${esc(a.section)}</span>
          <span class="revmeta">${esc(q.bloomLevel)} · ${esc(q.topic)} · max ${max}</span>
        </div>
        <p class="qstem">${esc(q.question)}</p>
        ${img}
        <div class="grade-cols">
          <div>
            <h3>Student answer</h3>
            <div class="student-ans">${esc(a.givenText || "(no answer)")}</div>
          </div>
          <div>
            <h3>Model answer</h3>
            <div class="model-ans">${esc(q.modelAnswer || "—")}</div>
            ${rubric ? `<h3>Rubric</h3><ul class="rubric">${rubric}</ul>` : ""}
          </div>
        </div>
        <label class="mark-row">Marks (0–${max})
          <input type="number" class="mark-in" min="0" max="${max}" step="0.5" value="${prev ? prev.marks : ""}">
        </label>
        <label class="mark-row">Feedback (optional)
          <textarea class="fb-in" rows="2" placeholder="Brief feedback for the student…">${prev ? esc(prev.feedback || "") : ""}</textarea>
        </label>
      </div>`;
    })
    .join("");

  return `
  <div class="grade-meta">
    <p><b>${esc(student.displayName || student.email || attempt.userId)}</b> · ${esc(assessment.title || attempt.assessmentId)}</p>
    <p class="muted">Auto-graded: ${attempt.autoScore} / ${attempt.autoMax}. Award marks for each text answer, then save.</p>
  </div>
  ${cards}
  <div class="grade-actions">
    <button class="btn primary" id="save-grade">Save grading &amp; finalize</button>
    <span class="err" id="grade-err"></span>
  </div>`;
}

export function collectGrading(root, attempt, ctx) {
  const { questions, sections } = ctx;
  const manualGrading = [];
  root.querySelectorAll(".grade-item").forEach((el) => {
    const qid = el.dataset.qid;
    const section = el.dataset.section;
    const q = questions[qid];
    if (!q) return;
    const max = weightFor(sections, section, q);
    const marks = Math.max(0, Math.min(max, Number(el.querySelector(".mark-in").value) || 0));
    const feedback = el.querySelector(".fb-in").value.trim();
    // Firestore rejects undefined values, so the key is only present when there is feedback.
    manualGrading.push(feedback ? { qid, section, marks, feedback } : { qid, section, marks });
  });
  return manualGrading;
}

// Kicks off the grade-attempts workflow right away instead of waiting for
// its schedule, so the auto+manual scores get merged to a final result
// immediately. See quiz-engine.js's triggerGrading() for the full rationale
// — same relay, duplicated here as one line rather than adding a cross-
// module dependency for it.
function triggerGrading() {
  try {
    navigator.sendBeacon("https://men201-grading-relay.wangs5050.workers.dev");
  } catch {
    /* the scheduled run will pick it up regardless */
  }
}

export async function submitManualGrading(attemptId, manualGrading, gradedBy) {
  await updateDoc(doc(db, "attempts", attemptId), {
    manualGrading,
    status: "complete",
    gradedBy,
    gradedAt: serverTimestamp(),
  });
  triggerGrading();
}
