// MEN201 quiz — page engine: landing, unit module, runner, result, teacher.
import { auth, db, configReady } from "./firebase.js";
import {
  getProfile,
  isTeacher,
  onAuthChange,
  loginUser,
  registerUser,
  logoutUser,
} from "./auth.js";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { fetchDocsByIds } from "./firestore-utils.js";
import {
  BLOOM_LEVELS,
  selectForSections,
  gradeQuestion,
  strengthsImprovements,
  shuffle,
} from "./bloom.js";
import { FORMATS, formatOf } from "./formats.js";

// ---------------------------------------------------------------- unit registry
// Matches the decks in the repo root; notes exist for Units I–VII.

export const UNITS = [
  { id: "I", title: "Introduction to Forest Mensuration", deck: "MEN201_Unit_I_Introduction_to_Forest_Mensuration.html", notes: "notes/MEN201_Notes_Unit_I.html" },
  { id: "II", title: "Diameter, Girth and Bark Thickness", deck: "MEN201_Unit_II_Diameter_Girth_and_Bark_Thickness.html", notes: "notes/MEN201_Notes_Unit_II.html" },
  { id: "III", title: "Measurement of Crown Closure", deck: "MEN201_Unit_III_Measurement_of_Crown_Closure.html", notes: "notes/MEN201_Notes_Unit_III.html" },
  { id: "IV", title: "Measurement of Tree Height", deck: "MEN201_Unit_IV_Measurement_of_Tree_Height.html", notes: "notes/MEN201_Notes_Unit_IV.html" },
  { id: "V", title: "Measurement of Tree Volume", deck: "MEN201_Unit_V_Measurement_of_Tree_Volume.html", notes: "notes/MEN201_Notes_Unit_V.html" },
  { id: "VI", title: "Measurement of the Crop", deck: "MEN201_Unit_VI_Measurement_of_Crop.html", notes: "notes/MEN201_Notes_Unit_VI.html" },
  { id: "VII", title: "Age and Growth of Trees", deck: "MEN201_Unit_VII_Age_and_Growth_of_Trees.html", notes: "notes/MEN201_Notes_Unit_VII.html" },
  { id: "VIII", title: "Forest Inventory and Sampling", deck: "MEN201_Unit_VIII_Forest_Inventory_and_Sampling.html", notes: null },
  { id: "IX", title: "Digital Forest Mensuration and Data Management", deck: "MEN201_Unit_IX_Digital_Forest_Mensuration_and_Data_Management.html", notes: null },
  { id: "X", title: "Forest Biomass and Carbon Estimation", deck: "MEN201_Unit_X_Forest_Biomass_and_Carbon_Estimation.html", notes: null },
  { id: "XI", title: "Remote and Emerging Technologies in Forest Mensuration", deck: "MEN201_Unit_XI_Remote_and_Emerging_Technologies_in_Forest_Mensuration.html", notes: null },
];

// ---------------------------------------------------------------- helpers

const $ = (sel, root = document) => root.querySelector(sel);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function fmtDate(ts) {
  if (!ts || !ts.toDate) return "";
  return ts.toDate().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function banner(msg) {
  $("#app").innerHTML = `<div class="card notice"><p>${esc(msg)}</p><p><a class="btn" href="index.html">Back to the quiz home</a></p></div>`;
}

function levelBars(breakdown) {
  if (!breakdown) return `<p class="muted">No graded items yet.</p>`;
  const rows = BLOOM_LEVELS.map((lv) => {
    const r = breakdown[lv];
    if (!r) return "";
    return `<div class="lrow"><span class="lname">${lv}</span>
      <span class="lbar"><span class="lfill" style="width:${Math.min(100, r.percent)}%"></span></span>
      <span class="lpct">${r.percent}%</span></div>`;
  }).join("");
  return rows || `<p class="muted">No graded items yet.</p>`;
}

function chrome(user, profile, title) {
  const role = isTeacher(profile) ? "Teacher" : "Student";
  const head = document.createElement("header");
  head.className = "runhead";
  head.innerHTML = `<div class="wrap">
    <span><b>MEN 201</b> · Practice &amp; Assessment</span>
    <span class="r">${esc(title)} · ${esc(user.displayName || user.email)} (${role})
    <a href="#" id="logout">Sign out</a></span></div>`;
  document.body.prepend(head);
  $("#logout", head).addEventListener("click", async (e) => {
    e.preventDefault();
    await logoutUser();
    location.href = "index.html";
  });
}

async function loadBank(unitId) {
  const snap = await getDocs(query(collection(db, "questions"), where("unit", "==", unitId), where("active", "==", true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function loadAssessmentsForUnit(unitId) {
  const snap = await getDocs(query(collection(db, "assessments"), where("unit", "==", unitId), where("active", "==", true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ---------------------------------------------------------------- landing (quiz/index.html)

export async function initLanding() {
  if (!configReady) {
    banner("Firebase is not configured yet. The teacher must paste the web app config into <code>quiz/js/firebase.js</code> and deploy.");
    return;
  }
  onAuthChange(async (user) => {
    const app = $("#app");
    if (!user) {
      renderAuth(app);
      return;
    }
    const profile = await getProfile(user.uid).catch(() => null);
    chrome(user, profile, "Home");
    app.innerHTML = `<div class="load">Loading…</div>`;
    try {
      await renderLanding(app, user, profile);
    } catch (err) {
      banner("Could not load the quiz home: " + err.message);
    }
  });
}

function renderAuth(app) {
  app.innerHTML = `
  <div class="authgrid">
    <div class="card">
      <h2>Sign in</h2>
      <form id="login-form">
        <label>Email<input type="email" name="email" required></label>
        <label>Password<input type="password" name="password" required></label>
        <button class="btn" type="submit">Sign in</button>
      </form>
    </div>
    <div class="card">
      <h2>Create an account</h2>
      <form id="reg-form">
        <label>Full name<input type="text" name="name" required></label>
        <label>Email<input type="email" name="email" required></label>
        <label>Password (min 6 characters)<input type="password" name="password" minlength="6" required></label>
        <button class="btn" type="submit">Create account</button>
      </form>
    </div>
  </div>
  <p class="err" id="auth-err"></p>`;

  $("#login-form", app).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await loginUser(f.email.value, f.password.value);
    } catch (err) {
      $("#auth-err", app).textContent = authErrMsg(err);
    }
  });
  $("#reg-form", app).addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      await registerUser(f.email.value, f.password.value, f.name.value.trim());
    } catch (err) {
      $("#auth-err", app).textContent = authErrMsg(err);
    }
  });
}

function authErrMsg(err) {
  const m = err && err.code ? err.code : err.message;
  switch (m) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";
    case "auth/email-already-in-use":
      return "That email is already registered — sign in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "That email address is not valid.";
    default:
      return "Something went wrong: " + m;
  }
}

async function renderLanding(app, user, profile) {
  const attemptsSnap = await getDocs(
    query(collection(db, "attempts"), where("userId", "==", user.uid), orderBy("submittedAt", "desc"), limit(20))
  );
  const attempts = attemptsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const titles = {};
  if (attempts.length) {
    const ids = [...new Set(attempts.map((a) => a.assessmentId))];
    const assessMap = await fetchDocsByIds("assessments", ids);
    Object.values(assessMap).forEach((a) => (titles[a.id] = a.title));
  }

  const unitRows = UNITS.map(
    (u) => `<a class="ucard" href="unit.html?u=${u.id}">
      <span class="u-no">Unit ${u.id}</span>
      <span class="u-title">${esc(u.title)}</span>
      <span class="u-go">Open module →</span>
    </a>`
  ).join("");

  const rows = attempts
    .map((a) => {
      const status =
        a.status === "complete"
          ? `<span class="pct">${a.percent}%</span>`
          : a.status === "awaiting-manual"
          ? `<span class="tag">awaiting grading</span>`
          : `<span class="tag">grading…</span>`;
      return `<tr><td>${esc(titles[a.assessmentId] || a.assessmentId)}</td>
        <td>${fmtDate(a.submittedAt)}</td><td>${status}</td>
        <td><a href="result.html?tid=${a.id}">View →</a></td></tr>`;
    })
    .join("");

  const teacherLink = isTeacher(profile)
    ? `<p><a class="btn" href="teacher.html">Teacher dashboard →</a></p>`
    : "";

  app.innerHTML = `
  <section class="card">
    <h2>Unit modules</h2>
    <p class="muted">Each unit carries its own practice questions, a short quiz and a sectioned assessment, all mapped to Bloom's taxonomy.</p>
    ${teacherLink}
    <div class="unitgrid">${unitRows}</div>
  </section>
  <section class="card">
    <h2>My recent results</h2>
    ${rows ? `<table class="tbl"><thead><tr><th>Assessment</th><th>Date</th><th>Result</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="muted">No attempts yet — open a unit module to start.</p>`}
  </section>`;
}

// ---------------------------------------------------------------- unit module (quiz/unit.html)

export async function initUnit() {
  if (!configReady) {
    banner("Firebase is not configured yet.");
    return;
  }
  const u = new URLSearchParams(location.search).get("u");
  const unit = UNITS.find((x) => x.id === u);
  onAuthChange(async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }
    const profile = await getProfile(user.uid).catch(() => null);
    chrome(user, profile, `Unit ${unit ? unit.id : u}`);
    const app = $("#app");
    app.innerHTML = `<div class="load">Loading Unit ${esc(u || "")}…</div>`;
    try {
      await renderUnit(app, user, unit);
    } catch (err) {
      banner("Could not load the unit module: " + err.message);
    }
  });
}

async function renderUnit(app, user, unit) {
  if (!unit) {
    banner("Unknown unit.");
    return;
  }
  const assessments = await loadAssessmentsForUnit(unit.id);
  const quiz = assessments.find((a) => a.kind === "quiz");
  const assessment = assessments.find((a) => a.kind === "assessment");

  // learning outcomes from the course document (if seeded)
  let outcomes = [];
  try {
    const cSnap = await getDoc(doc(db, "courses", "men201"));
    if (cSnap.exists()) {
      const uRow = (cSnap.data().units || []).find((x) => x.id === unit.id);
      outcomes = (uRow && uRow.outcomes) || [];
    }
  } catch {
    /* outcomes optional */
  }

  // my attempts for this unit (performance analysis)
  const mySnap = await getDocs(
    query(collection(db, "attempts"), where("userId", "==", user.uid), where("unit", "==", unit.id), where("status", "==", "complete"), orderBy("submittedAt", "desc"), limit(50))
  );
  const mine = mySnap.docs.map((d) => d.data());
  const agg = {};
  mine.forEach((a) => {
    const bd = a.finalBloomBreakdown || a.bloomBreakdown || {};
    BLOOM_LEVELS.forEach((lv) => {
      const r = bd[lv];
      if (!r) return;
      const row = (agg[lv] = agg[lv] || { earned: 0, available: 0 });
      row.earned += r.earned;
      row.available += r.available;
    });
  });
  const unitBloom = {};
  BLOOM_LEVELS.forEach((lv) => {
    const r = agg[lv];
    if (r && r.available > 0) unitBloom[lv] = { earned: r.earned, available: r.available, percent: Math.round((10000 * r.earned) / r.available) / 100 };
  });
  const latest = mine[0];
  const si = latest ? strengthsImprovements(latest.finalBloomBreakdown || latest.bloomBreakdown || {}) : { strengths: [], improvements: [] };

  const attemptLine = (a) => {
    if (!a) return `<p class="muted">Not yet published.</p>`;
    const used = mine.filter((x) => x.assessmentId === a.id).length;
    const best = Math.max(0, ...mine.filter((x) => x.assessmentId === a.id).map((x) => x.percent || 0));
    const left = Math.max(0, a.attemptsAllowed - used);
    return `
      <p class="muted">${esc(a.title)} · ${a.totalMarks} marks · ${left} of ${a.attemptsAllowed} attempts left${best ? ` · best ${best}%` : ""}</p>
      ${left > 0 ? `<a class="btn" href="take.html?aid=${a.id}">Start ${a.kind}</a>` : `<span class="tag">attempts used</span>`}`;
  };

  app.innerHTML = `
  <div class="mast">
    <p class="eyebrow">Unit ${unit.id} · module</p>
    <h1>${esc(unit.title)}</h1>
  </div>

  <section class="card">
    <h2>1 · Learning materials</h2>
    <ul class="matlist">
      <li><a href="../${esc(unit.deck)}" target="_blank" rel="noopener">Unit deck (slides) →</a></li>
      ${unit.notes ? `<li><a href="../${esc(unit.notes)}" target="_blank" rel="noopener">Lecture notes →</a></li>` : ""}
      <li><a href="../notes/MEN201_Calculation_Handbook.html" target="_blank" rel="noopener">Calculation handbook →</a></li>
    </ul>
  </section>

  <section class="card">
    <h2>2 · Learning outcomes</h2>
    ${outcomes.length ? `<ul class="outcomes">${outcomes.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>` : `<p class="muted">See the unit deck and notes — the outcomes for this unit are listed there.</p>`}
  </section>

  <section class="card">
    <h2>3 · Practice questions</h2>
    <p class="muted">Unlimited, instant feedback, not recorded against your score.</p>
    <a class="btn" href="take.html?mode=practice&u=${unit.id}">Start practice</a>
  </section>

  <section class="card">
    <h2>4 · Unit quiz</h2>
    ${attemptLine(quiz)}
  </section>

  <section class="card">
    <h2>5 · Unit assessment</h2>
    ${attemptLine(assessment)}
  </section>

  <section class="card">
    <h2>6 · Performance analysis</h2>
    ${mine.length ? levelBars(unitBloom) : `<p class="muted">Complete the quiz or assessment to see your per-level performance here.</p>`}
    ${latest ? `<div class="si">
      ${si.strengths.length ? `<p><b>Strength:</b> ${esc(si.strengths[0])}</p>` : ""}
      ${si.improvements.length ? `<p><b>Improvement:</b> ${esc(si.improvements[0])}</p>` : ""}
    </div>` : ""}
  </section>`;
}

// ---------------------------------------------------------------- runner (quiz/take.html)

export async function initTake() {
  if (!configReady) {
    banner("Firebase is not configured yet.");
    return;
  }
  const params = new URLSearchParams(location.search);
  const mode = params.get("mode") || "graded";
  onAuthChange(async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }
    const profile = await getProfile(user.uid).catch(() => null);
    chrome(user, profile, mode === "practice" ? "Practice" : "Assessment");
    const app = $("#app");
    app.innerHTML = `<div class="load">Preparing questions…</div>`;
    try {
      if (mode === "practice") {
        const unitId = params.get("u");
        const unit = UNITS.find((x) => x.id === unitId);
        const bank = await loadBank(unitId);
        const auto = bank.filter((q) => q.autoGraded !== false);
        const items = shuffle(auto).slice(0, 10).map((q) => ({ q, section: "P", sectionLabel: "Practice", weight: 1 }));
        if (!items.length) {
          banner("No practice questions are available for this unit yet.");
          return;
        }
        runPractice(app, items, unit);
      } else {
        const aid = params.get("aid");
        const aSnap = await getDoc(doc(db, "assessments", aid));
        if (!aSnap.exists()) {
          banner("Assessment not found.");
          return;
        }
        const assessment = aSnap.data();
        const usedSnap = await getDocs(
          query(collection(db, "attempts"), where("userId", "==", user.uid), where("assessmentId", "==", aid))
        );
        if (usedSnap.size >= assessment.attemptsAllowed) {
          banner(`You have used all ${assessment.attemptsAllowed} attempt(s) for this assessment. Review your results from the unit module.`);
          return;
        }
        const bank = await loadBank(assessment.unit);
        const { sectionAssignment, questionIds } = selectForSections(assessment.sections, bank);
        const items = [];
        assessment.sections.forEach((s) =>
          (sectionAssignment[s.id] || []).forEach((qid) => {
            const q = bank.find((b) => b.id === qid);
            if (q) items.push({ q, section: s.id, sectionLabel: s.label, weight: s.marksPerQuestion });
          })
        );
        if (!items.length) {
          banner("No questions are available for this assessment yet.");
          return;
        }
        runGraded(app, items, assessment, questionIds, sectionAssignment, user);
      }
    } catch (err) {
      banner("Could not start: " + err.message);
    }
  });
}

function questionShell(app, item, idx, total, title) {
  const fmt = formatOf(item.q);
  const stem = fmt.inline ? "" : `<p class="qstem">${esc(item.q.question)}</p>`;
  app.innerHTML = `
  <div class="mast">
    <p class="eyebrow">${esc(title)}</p>
    <h1>${esc(item.sectionLabel)}</h1>
    <p class="muted">Question ${idx + 1} of ${total} · ${fmt.label}${item.weight > 1 ? ` · ${item.weight} marks` : ""}</p>
  </div>
  <div class="card qcard">
    <div class="progress"><span style="width:${Math.round((idx / total) * 100)}%"></span></div>
    ${stem}
    <div class="qbody">${fmt.render(item.q)}</div>
    <div class="qfoot" id="qfoot"></div>
  </div>`;
}

function runGraded(app, items, assessment, questionIds, sectionAssignment, user) {
  const answers = [];
  let idx = 0;
  const started = Date.now();

  const draw = () => {
    questionShell(app, items[idx], idx, items.length, assessment.title);
    const foot = $("#qfoot", app);
    foot.innerHTML = idx < items.length - 1 ? `<button class="btn" id="next">Next →</button>` : `<button class="btn primary" id="submit">Submit assessment</button>`;
    const btn = $("#next", foot) || $("#submit", foot);
    btn.addEventListener("click", async () => {
      const fmt = formatOf(items[idx].q);
      const given = fmt.collect($(".qcard", app));
      answers.push({ qid: items[idx].q.id, section: items[idx].section, ...given, timeTakenSec: Math.round((Date.now() - started) / 1000) });
      if (idx < items.length - 1) {
        idx++;
        draw();
      } else {
        btn.disabled = true;
        btn.textContent = "Submitting…";
        try {
          const ref = await addDoc(collection(db, "attempts"), {
            userId: user.uid,
            assessmentId: assessment.id,
            unit: assessment.unit,
            questionIds,
            sectionAssignment,
            answers,
            status: "submitted",
            submittedAt: serverTimestamp(),
          });
          location.href = "result.html?tid=" + ref.id;
        } catch (err) {
          btn.disabled = false;
          btn.textContent = "Submit assessment";
          foot.insertAdjacentHTML("afterend", `<p class="err">Could not submit: ${esc(err.message)}</p>`);
        }
      }
    });
  };
  draw();
}

function runPractice(app, items, unit) {
  let idx = 0;
  let checked = false;

  const draw = () => {
    checked = false;
    questionShell(app, items[idx], idx, items.length, `Practice · Unit ${unit.id}`);
    const foot = $("#qfoot", app);
    foot.innerHTML = `<button class="btn" id="check">Check answer</button>`;
    $("#check", foot).addEventListener("click", () => {
      if (checked) return;
      checked = true;
      const fmt = formatOf(items[idx].q);
      const given = fmt.collect($(".qcard", app));
      const { frac, full } = gradeQuestion(items[idx].q, given);
      const verdict = frac >= 1 ? "Correct." : frac > 0 ? `Partly correct (${Math.round(frac * 100)}%).` : "Not quite.";
      foot.innerHTML = `
        <p class="verdict ${full ? "good" : frac > 0 ? "part" : "bad"}">${verdict}</p>
        <p class="expl">${esc(items[idx].q.explanation || "")}</p>
        ${items[idx].q.learningOutcome ? `<p class="lo"><b>Learning outcome:</b> ${esc(items[idx].q.learningOutcome)}</p>` : ""}
        <button class="btn" id="next">${idx < items.length - 1 ? "Next →" : "Finish"}</button>`;
      $("#next", foot).addEventListener("click", () => {
        if (idx < items.length - 1) {
          idx++;
          draw();
        } else {
          app.innerHTML = `<div class="card"><h2>Practice complete</h2>
            <p class="muted">Practice answers are not recorded. Open the unit module to try the graded quiz or assessment.</p>
            <a class="btn" href="unit.html?u=${unit.id}">Back to Unit ${unit.id}</a></div>`;
        }
      });
    });
  };
  draw();
}

// ---------------------------------------------------------------- result (quiz/result.html)

export async function initResult() {
  if (!configReady) {
    banner("Firebase is not configured yet.");
    return;
  }
  const tid = new URLSearchParams(location.search).get("tid");
  onAuthChange(async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }
    const profile = await getProfile(user.uid).catch(() => null);
    chrome(user, profile, "Result");
    const app = $("#app");
    app.innerHTML = `<div class="load">Loading result…</div>`;
    try {
      await renderResult(app, user, tid, profile);
    } catch (err) {
      banner("Could not load the result: " + err.message);
    }
  });
}

async function renderResult(app, user, tid, profile) {
  let aSnap = await getDoc(doc(db, "attempts", tid));
  if (!aSnap.exists()) {
    banner("Result not found.");
    return;
  }
  let attempt = aSnap.data();
  if (attempt.userId !== user.uid && !isTeacher(profile)) {
    banner("This result belongs to another student.");
    return;
  }

  // The grading Cloud Function runs asynchronously after submit — the
  // attempt can still be "submitted" (ungraded) for a moment. Poll briefly
  // rather than showing undefined score fields.
  if (attempt.status === "submitted") {
    app.innerHTML = `<div class="load">Grading your attempt…</div>`;
    for (let i = 0; i < 20 && attempt.status === "submitted"; i++) {
      await new Promise((r) => setTimeout(r, 500));
      aSnap = await getDoc(doc(db, "attempts", tid));
      attempt = aSnap.data();
    }
  }

  if (attempt.status === "submitted") {
    app.innerHTML = `<div class="card notice"><p>Still grading — this is taking longer than usual.</p>
      <p><button class="btn" id="retry">Check again</button></p></div>`;
    $("#retry", app).addEventListener("click", () => renderResult(app, user, tid, profile));
    return;
  }

  const asSnap = await getDoc(doc(db, "assessments", attempt.assessmentId));
  const assessment = asSnap.data() || {};
  const qMap = await fetchDocsByIds("questions", attempt.questionIds);
  const questions = {};
  Object.values(qMap).forEach((q) => (questions[q.id] = q));

  const bd = attempt.finalBloomBreakdown || attempt.bloomBreakdown || {};
  const pending = attempt.status === "awaiting-manual";
  const scoreLine = pending
    ? `<span class="big">${attempt.autoScore}<small> / ${attempt.autoMax}</small></span>
       <span class="tag">auto-graded part · teacher-graded items pending</span>`
    : `<span class="big">${attempt.totalScore}<small> / ${attempt.totalMax}</small></span>
       <span class="pct big2">${attempt.percent}%</span>
       ${assessment.passPercent && attempt.percent >= assessment.passPercent ? `<span class="tag good">pass</span>` : assessment.passPercent ? `<span class="tag bad">below pass mark</span>` : ""}`;

  const manualMap = {};
  (attempt.manualGrading || []).forEach((m) => (manualMap[m.qid] = m));

  const review = (attempt.answers || [])
    .map((a) => {
      const q = questions[a.qid];
      if (!q) return "";
      let verdict, detail, marks;
      if (q.autoGraded === false) {
        const m = manualMap[a.qid];
        if (m && attempt.status === "complete") {
          verdict = `<span class="vtag">teacher-graded</span>`;
          marks = `<span class="marks">${m.marks} / ?</span>`;
          detail = m.feedback ? `<p class="expl">${esc(m.feedback)}</p>` : "";
        } else {
          verdict = `<span class="vtag">awaiting teacher grading</span>`;
          detail = "";
        }
      } else {
        const { frac, full } = gradeQuestion(q, a);
        verdict = full ? `<span class="vtag good">correct</span>` : frac > 0 ? `<span class="vtag part">partly correct</span>` : `<span class="vtag bad">incorrect</span>`;
        marks = "";
        detail = correctAnswerDetail(q, a);
      }
      return `<div class="rev ${verdict.includes("bad") ? "wrong" : ""}">
        <div class="revhead">${verdict}${marks}<span class="revmeta">${esc(q.bloomLevel)} · ${esc(q.topic)}</span></div>
        <p class="qstem">${esc(q.question).replace(/___/g, "____")}</p>
        ${detail}
        ${q.explanation ? `<p class="expl">${esc(q.explanation)}</p>` : ""}
        ${q.learningOutcome ? `<p class="lo"><b>Learning outcome:</b> ${esc(q.learningOutcome)}</p>` : ""}
      </div>`;
    })
    .join("");

  app.innerHTML = `
  <div class="mast">
    <p class="eyebrow">${esc(assessment.title || "Assessment")}</p>
    <h1>${pending ? "Result — partially graded" : "Result"}</h1>
    <p class="muted">${fmtDate(attempt.submittedAt)} · Unit ${esc(attempt.unit)}</p>
  </div>

  <section class="card scorecard">
    ${scoreLine}
    <div class="levels">${levelBars(bd)}</div>
    ${(attempt.strengths && attempt.strengths.length) || (attempt.improvements && attempt.improvements.length) ? `<div class="si">
      ${(attempt.strengths || []).map((s) => `<p><b>Strength:</b> ${esc(s)}</p>`).join("")}
      ${(attempt.improvements || []).map((s) => `<p><b>Improvement:</b> ${esc(s)}</p>`).join("")}
    </div>` : ""}
    ${(attempt.learningGaps || []).length ? `<div class="gaps">${attempt.learningGaps.map((g) => `<p>⚑ ${esc(g.message)}</p>`).join("")}</div>` : ""}
  </section>

  <section class="card">
    <h2>Question review</h2>
    ${review}
  </section>`;
}

function correctAnswerDetail(q, a) {
  switch (q.questionType) {
    case "mcq":
    case "image-mcq":
      return `<p class="correct"><b>Answer:</b> ${esc((q.options || [])[q.answer] || q.answer)}</p>`;
    case "true-false":
      return `<p class="correct"><b>Answer:</b> ${Number(q.answer) === 0 ? "True" : "False"}</p>`;
    case "multi-response":
      return `<p class="correct"><b>Answers:</b> ${esc((q.answer || []).map((i) => q.options[i]).join(" · "))}</p>`;
    case "numerical":
      return `<p class="correct"><b>Answer:</b> ${esc(q.answer)}${q.units ? " " + esc(q.units) : ""}</p>`;
    case "fill-blank": {
      const blanks = q.blanks && q.blanks.length ? q.blanks : [q.answer];
      return `<p class="correct"><b>Answers:</b> ${esc(blanks.map((b) => (Array.isArray(b) ? b[0] : b)).join(" · "))}</p>`;
    }
    case "matching":
      return `<p class="correct"><b>Matching:</b> ${esc((q.pairs || []).map((p) => `${p.left} → ${p.right}`).join(" · "))}</p>`;
    default:
      return q.modelAnswer ? `<p class="correct"><b>Model answer:</b> ${esc(q.modelAnswer)}</p>` : "";
  }
}

