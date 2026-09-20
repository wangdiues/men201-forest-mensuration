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
  shuffle,
} from "./bloom.js";
import { FORMATS, formatOf } from "./formats.js";
import { renderPaper } from "./paper.js";

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

// A paper with its own question set (the module exam) draws by paper tag,
// not by unit; its questions keep their unit tags for the analytics.
async function loadPaperBank(paper) {
  const snap = await getDocs(query(collection(db, "questions"), where("paper", "==", paper), where("active", "==", true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function loadExams() {
  const snap = await getDocs(query(collection(db, "assessments"), where("kind", "==", "exam"), where("active", "==", true)));
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

  const exams = await loadExams().catch(() => []);
  const examCards = exams
    .map((x) => {
      const mine = attempts.filter((a) => a.assessmentId === x.id);
      const left = Math.max(0, (x.attemptsAllowed || 1) - mine.length);
      const rules = [`${x.totalMarks} marks`, x.timeAllowedMin ? `${x.timeAllowedMin} minutes` : null, x.passPercent ? `pass mark ${Math.ceil((x.totalMarks * x.passPercent) / 100)}` : null]
        .filter(Boolean)
        .join(" · ");
      const action = left > 0
        ? `<a class="btn primary" href="take.html?aid=${x.id}">Sit the paper</a>`
        : `<a class="btn" href="result.html?tid=${mine[0].id}">View your result →</a>`;
      return `<section class="card exam-card">
        <p class="eyebrow">Mock module examination</p>
        <h2>${esc(x.title)}</h2>
        <p class="muted">${esc(x.description || "")}</p>
        <p class="exam-rules">${esc(rules)}</p>
        ${action}
      </section>`;
    })
    .join("");

  app.innerHTML = `
  <section class="card">
    <h2>Unit modules</h2>
    <p class="muted">Each unit carries its own practice questions, a short quiz and a sectioned assessment, all mapped to Bloom's taxonomy.</p>
    ${teacherLink}
    <div class="unitgrid">${unitRows}</div>
  </section>
  ${examCards}
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

  // my completed attempts at this unit's quiz
  const mySnap = await getDocs(
    query(collection(db, "attempts"), where("userId", "==", user.uid), where("unit", "==", unit.id), where("status", "==", "complete"), orderBy("submittedAt", "desc"), limit(50))
  );
  const mine = mySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const quizSection = (() => {
    if (!quiz) return `<p class="muted">Not yet published.</p>`;
    const used = mine.filter((x) => x.assessmentId === quiz.id);
    const left = Math.max(0, quiz.attemptsAllowed - used.length);
    const action = left > 0
      ? `<a class="btn" href="take.html?aid=${quiz.id}">Start test</a>`
      : `<a class="btn" href="result.html?tid=${used[0].id}">View your grade →</a>`;
    return `
      <p class="muted">${esc(quiz.title)} · ${quiz.totalMarks} marks · ${left} of ${quiz.attemptsAllowed} attempts left</p>
      ${action}`;
  })();

  app.innerHTML = `
  <div class="mast">
    <p class="eyebrow">Unit ${unit.id} · module</p>
    <h1>${esc(unit.title)}</h1>
  </div>

  <section class="card">
    <h2>Unit test</h2>
    ${quizSection}
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
    const app = $("#app");
    if (!user) {
      // Signed-out visitors sign in here rather than being sent home, so the
      // runner also works when a unit deck embeds it as its last slide.
      renderAuth(app);
      return;
    }
    const profile = await getProfile(user.uid).catch(() => null);
    chrome(user, profile, mode === "practice" ? "Practice" : "Assessment");
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
          const m = /^unit-([ivx]+)-/i.exec(aid || "");
          banner(m ? `The Unit ${m[1].toUpperCase()} paper is not published yet — check back after the unit is taught.` : "Assessment not found.");
          return;
        }
        const assessment = aSnap.data();
        const usedSnap = await getDocs(
          query(collection(db, "attempts"), where("userId", "==", user.uid), where("assessmentId", "==", aid))
        );
        if (usedSnap.size >= assessment.attemptsAllowed) {
          const latest = usedSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.submittedAt && b.submittedAt.toMillis ? b.submittedAt.toMillis() : 0) - (a.submittedAt && a.submittedAt.toMillis ? a.submittedAt.toMillis() : 0))[0];
          const kindWord = assessment.kind === "exam" ? "mock module examination" : assessment.kind === "quiz" ? "test" : "assessment";
          app.innerHTML = `<div class="card notice">
            <p>You have used all ${assessment.attemptsAllowed} attempt(s) for this ${esc(kindWord)}.</p>
            <p>${latest ? `<a class="btn" href="result.html?tid=${latest.id}">View your result →</a>` : ""} ${assessment.kind === "exam" ? `<a class="btn" href="index.html">Home</a>` : `<a class="btn" href="unit.html?u=${esc(assessment.unit)}">Unit ${esc(assessment.unit)} module</a>`}</p></div>`;
          return;
        }
        const bank = assessment.bank ? await loadPaperBank(assessment.bank) : await loadBank(assessment.unit);
        const { sectionAssignment, questionIds } = selectForSections(assessment.sections, bank, { ordered: assessment.fixedOrder === true });
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

// True when a collected answer carries anything the student entered.
function isAnswered(given) {
  if (given.givenIndex != null) return true;
  if (given.givenIndices && given.givenIndices.length) return true;
  if (given.givenBlanks && given.givenBlanks.some((b) => String(b).trim())) return true;
  if (given.givenPairs && given.givenPairs.some((p) => p >= 0)) return true;
  if (given.given != null && String(given.given).trim()) return true;
  if (given.givenText != null && String(given.givenText).trim()) return true;
  return false;
}

// The whole paper as one exam sheet, with a clock when the paper is timed.
function runGraded(app, items, assessment, questionIds, sectionAssignment, user) {
  // The clock survives a reload: its start is remembered per candidate and paper.
  const clockKey = `men201-paper-${user.uid}-${assessment.id}`;
  let started = Number(localStorage.getItem(clockKey));
  if (!started) {
    started = Date.now();
    try {
      localStorage.setItem(clockKey, String(started));
    } catch {
      /* storage unavailable — the clock still runs for this page */
    }
  }

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  app.innerHTML = renderPaper(items, assessment, user.displayName || user.email, today);

  const collectAll = () =>
    items.map((item, i) => {
      const given = formatOf(item.q).collect($(`.pq[data-i="${i}"]`, app));
      return { qid: item.q.id, section: item.section, ...given };
    });

  const counter = $("#unanswered", app);
  const btn = $("#submit", app);
  let armed = false;
  let submitting = false;
  const refresh = () => {
    const n = collectAll().filter((g) => !isAnswered(g)).length;
    counter.textContent = n ? `${items.length - n} of ${items.length} answered` : "All questions answered";
    if (!n) {
      armed = false;
      btn.textContent = "Submit paper";
    }
  };
  app.addEventListener("input", refresh);
  app.addEventListener("change", refresh);
  refresh();

  const submit = async () => {
    if (submitting) return;
    submitting = true;
    const answers = collectAll();
    const timeTakenSec = Math.round((Date.now() - started) / 1000);
    btn.disabled = true;
    btn.textContent = "Submitting…";
    try {
      const ref = await addDoc(collection(db, "attempts"), {
        userId: user.uid,
        assessmentId: assessment.id,
        unit: assessment.unit,
        questionIds,
        sectionAssignment,
        answers: answers.map((a) => ({ ...a, timeTakenSec })),
        status: "submitted",
        submittedAt: serverTimestamp(),
      });
      try {
        localStorage.removeItem(clockKey);
      } catch {
        /* ignore */
      }
      location.href = "result.html?tid=" + ref.id;
    } catch (err) {
      submitting = false;
      btn.disabled = false;
      armed = false;
      btn.textContent = "Submit paper";
      counter.innerHTML = `<span class="err">Could not submit: ${esc(err.message)}</span>`;
    }
  };

  btn.addEventListener("click", () => {
    const missing = collectAll().filter((g) => !isAnswered(g)).length;
    if (missing && !armed) {
      armed = true;
      btn.textContent = `Submit with ${missing} unanswered?`;
      return;
    }
    submit();
  });

  // Clock: counts down from the paper's time allowance and submits at zero.
  const clockEl = $("#clock", app);
  if (clockEl && assessment.timeAllowedMin) {
    const deadline = started + assessment.timeAllowedMin * 60000;
    const tick = () => {
      const left = Math.max(0, deadline - Date.now());
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      clockEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
      clockEl.parentElement.classList.toggle("low", left <= 5 * 60000);
      if (left <= 0) {
        clearInterval(timer);
        submit();
      }
    };
    const timer = setInterval(tick, 1000);
    tick();
  }
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
    <p class="muted">${fmtDate(attempt.submittedAt)} · ${attempt.unit === "Module" ? "Mock module examination" : `Unit ${esc(attempt.unit)}`}</p>
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

