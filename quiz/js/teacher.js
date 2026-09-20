// MEN201 quiz — teacher dashboard (grading queue, analytics, managers, export).
import { db } from "./firebase.js";
import { collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthChange, getProfile, isTeacher, logoutUser } from "./auth.js";
import { BLOOM_LEVELS, selectForSections } from "./bloom.js";
import {
  unitWisePerformance,
  bloomClassPerformance,
  difficultyAnalysis,
  commonMistakes,
  studentsNeedingSupport,
  gradeSheetRows,
  toCsv,
  downloadCsv,
} from "./analytics.js";
import {
  loadGradingQueue,
  loadGradingContext,
  renderGradingPanel,
  collectGrading,
  submitManualGrading,
} from "./teacher-grade.js";
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

function levelBarsFromPct(map) {
  return BLOOM_LEVELS.map((lv) => {
    const p = map[lv];
    if (p == null) return "";
    return `<div class="lrow"><span class="lname">${lv}</span>
      <span class="lbar"><span class="lfill" style="width:${Math.min(100, p)}%"></span></span>
      <span class="lpct">${p}%</span></div>`;
  }).join("");
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "grading", label: "Grading queue" },
  { id: "units", label: "Unit performance" },
  { id: "bloom", label: "Bloom analytics" },
  { id: "difficulty", label: "Difficulty" },
  { id: "mistakes", label: "Common mistakes" },
  { id: "support", label: "Students needing support" },
  { id: "questions", label: "Question manager" },
  { id: "assessments", label: "Assessment manager" },
  { id: "export", label: "CSV export" },
];

let cache = null;

async function loadDashboardData() {
  if (cache) return cache;
  const [assessSnap, qSnap, statsSnap, usersSnap] = await Promise.all([
    getDocs(query(collection(db, "assessments"), where("active", "==", true))),
    getDocs(query(collection(db, "questions"), where("active", "==", true))),
    getDocs(collection(db, "stats")),
    getDocs(collection(db, "users")),
  ]);
  const assessments = assessSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const questions = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const statsMap = {};
  statsSnap.forEach((d) => (statsMap[d.id] = d.data()));
  const users = {};
  usersSnap.forEach((d) => (users[d.id] = d.data()));
  cache = { assessments, questions, statsMap, users };
  return cache;
}

function chrome(user, profile) {
  const head = document.createElement("header");
  head.className = "runhead";
  head.innerHTML = `<div class="wrap">
    <span><b>MEN 201</b> · Teacher dashboard</span>
    <span class="r">${esc(user.displayName || user.email)} · Teacher
    <a href="index.html">Student view</a>
    <a href="#" id="logout">Sign out</a></span></div>`;
  document.body.prepend(head);
  $("#logout", head).addEventListener("click", async (e) => {
    e.preventDefault();
    await logoutUser();
    location.href = "index.html";
  });
}

function tabNav(active) {
  return `<nav class="tabs">${TABS.map((t) =>
    `<button class="tab${t.id === active ? " on" : ""}" data-tab="${t.id}">${t.label}</button>`
  ).join("")}</nav>`;
}

export async function initTeacher() {
  onAuthChange(async (user) => {
    const app = $("#app");
    if (!user) {
      location.href = "index.html";
      return;
    }
    const profile = await getProfile(user.uid).catch(() => null);
    if (!isTeacher(profile)) {
      chrome(user, profile);
      app.innerHTML = `<div class="card notice"><p>This page is for the course teacher only.</p>
        <p><a class="btn" href="index.html">Back to quiz home</a></p></div>`;
      return;
    }
    chrome(user, profile);
    app.innerHTML = `<div class="load">Loading dashboard…</div>`;
    try {
      await renderTab(app, "overview", user);
    } catch (err) {
      app.innerHTML = `<div class="card"><p class="err">Could not load dashboard: ${esc(err.message)}</p></div>`;
    }
  });
}

async function renderTab(app, tabId, user) {
  const data = await loadDashboardData();
  app.innerHTML = `
  <div class="mast"><p class="eyebrow">Teacher</p><h1>Dashboard</h1></div>
  ${tabNav(tabId)}
  <div id="tab-body"></div>`;

  app.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", async () => {
      app.querySelectorAll(".tab").forEach((b) => b.classList.toggle("on", b === btn));
      await renderTabContent($("#tab-body", app), btn.dataset.tab, data, user);
    });
  });

  await renderTabContent($("#tab-body", app), tabId, data, user);
}

async function renderTabContent(el, tabId, data, user) {
  el.innerHTML = `<div class="load">Loading…</div>`;
  switch (tabId) {
    case "overview":
      await renderOverview(el, data);
      break;
    case "grading":
      await renderGrading(el, user);
      break;
    case "units":
      renderUnits(el, data);
      break;
    case "bloom":
      renderBloom(el, data);
      break;
    case "difficulty":
      renderDifficulty(el, data);
      break;
    case "mistakes":
      renderMistakes(el, data);
      break;
    case "support":
      renderSupport(el, data);
      break;
    case "questions":
      renderQuestions(el, data);
      break;
    case "assessments":
      renderAssessments(el, data);
      break;
    case "export":
      renderExport(el, data);
      break;
    default:
      el.innerHTML = `<p class="muted">Unknown tab.</p>`;
  }
}

async function renderOverview(el, data) {
  const queue = await loadGradingQueue();
  const recentSnap = await getDocs(query(collection(db, "attempts"), orderBy("submittedAt", "desc"), limit(15)));
  const recent = recentSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const unitRows = unitWisePerformance(data.assessments, data.statsMap);
  const bloom = bloomClassPerformance(data.statsMap);

  const rows = recent
    .map((a) => {
      const u = data.users[a.userId] || {};
      const assess = data.assessments.find((x) => x.id === a.assessmentId);
      const status =
        a.status === "complete"
          ? `<span class="pct">${a.percent == null ? "—" : a.percent + "%"}</span>`
          : a.status === "awaiting-manual"
          ? `<span class="tag warn">awaiting grading</span>`
          : `<span class="tag">grading…</span>`;
      return `<tr><td>${esc(u.displayName || a.userId)}</td>
        <td>${esc(assess?.title || a.assessmentId)}</td>
        <td>${fmtDate(a.submittedAt)}</td><td>${status}</td>
        <td><a href="result.html?tid=${a.id}">View</a></td></tr>`;
    })
    .join("");

  el.innerHTML = `
  <section class="card dash-stats">
    <div class="stat"><span class="stat-n">${data.questions.length}</span><span class="stat-l">Questions</span></div>
    <div class="stat"><span class="stat-n">${data.assessments.length}</span><span class="stat-l">Assessments</span></div>
    <div class="stat"><span class="stat-n warn">${queue.length}</span><span class="stat-l">Awaiting grading</span></div>
    <div class="stat"><span class="stat-n">${Object.keys(data.statsMap).length}</span><span class="stat-l">Stats docs</span></div>
  </section>

  ${queue.length ? `<section class="card"><h2>Grading queue</h2>
    <p class="muted">${queue.length} attempt(s) need manual marks. Open the <button class="link tablink" data-tab="grading">Grading queue</button> tab.</p></section>` : ""}

  <section class="card">
    <h2>Class Bloom profile</h2>
    ${bloom.length ? levelBarsFromPct(Object.fromEntries(bloom.map((b) => [b.level, b.percent]))) : `<p class="muted">No graded attempts yet.</p>`}
  </section>

  <section class="card">
    <h2>Unit averages (assessments)</h2>
    ${unitRows.length ? `<table class="tbl"><thead><tr><th>Unit</th><th>Class avg</th><th>Students</th></tr></thead><tbody>
      ${unitRows.map((u) => `<tr><td>${u.unit === "Module" ? esc(u.title) : `Unit ${u.unit} — ${esc(u.title)}`}</td><td class="pct">${u.avgPercent}%</td><td>${u.studentCount}</td></tr>`).join("")}
    </tbody></table>` : `<p class="muted">No assessment stats yet.</p>`}
  </section>

  <section class="card">
    <h2>Recent attempts</h2>
    <table class="tbl"><thead><tr><th>Student</th><th>Assessment</th><th>Date</th><th>Result</th><th></th></tr></thead>
    <tbody>${rows || `<tr><td colspan="5" class="muted">No attempts yet.</td></tr>`}</tbody></table>
  </section>`;

  el.querySelectorAll(".tablink").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(`.tab[data-tab="${btn.dataset.tab}"]`)?.click();
    });
  });
}

async function renderGrading(el, user) {
  const queue = await loadGradingQueue();
  if (!queue.length) {
    el.innerHTML = `<section class="card"><h2>Grading queue</h2><p class="muted">No attempts awaiting manual grading.</p></section>`;
    return;
  }

  el.innerHTML = `
  <section class="card">
    <h2>Grading queue</h2>
    <p class="muted">Select an attempt, award marks using the rubric, then save. The Cloud Function merges manual marks into the final score.</p>
    <div class="grade-layout">
      <div class="grade-list" id="grade-list">
        ${queue.map((a, i) => {
          const u = (cache && cache.users[a.userId]) || {};
          return `<button class="grade-pick${i === 0 ? " on" : ""}" data-id="${a.id}">
            <span class="gp-name">${esc(u.displayName || a.userId)}</span>
            <span class="gp-meta">${a.unit === "Module" ? "Module exam" : `Unit ${a.unit}`} · ${fmtDate(a.submittedAt)} · auto ${a.autoScore}/${a.autoMax}</span>
          </button>`;
        }).join("")}
      </div>
      <div class="grade-panel" id="grade-panel"><div class="load">Loading…</div></div>
    </div>
  </section>`;

  const panel = $("#grade-panel", el);
  const picks = [...el.querySelectorAll(".grade-pick")];

  async function openAttempt(id) {
    picks.forEach((p) => p.classList.toggle("on", p.dataset.id === id));
    panel.innerHTML = `<div class="load">Loading attempt…</div>`;
    const attempt = queue.find((a) => a.id === id);
    const ctx = await loadGradingContext(attempt);
    panel.innerHTML = renderGradingPanel(attempt, ctx);
    const saveBtn = $("#save-grade", panel);
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const errEl = $("#grade-err", panel);
        errEl.textContent = "";
        saveBtn.disabled = true;
        saveBtn.textContent = "Saving…";
        try {
          const manualGrading = collectGrading(panel, attempt, ctx);
          await submitManualGrading(id, manualGrading, user.uid);
          cache = null;
          await renderGrading(el, user);
        } catch (err) {
          errEl.textContent = err.message;
          saveBtn.disabled = false;
          saveBtn.textContent = "Save grading & finalize";
        }
      });
    }
  }

  picks.forEach((p) => p.addEventListener("click", () => openAttempt(p.dataset.id)));
  await openAttempt(queue[0].id);
}

function renderUnits(el, data) {
  const rows = unitWisePerformance(data.assessments, data.statsMap);
  el.innerHTML = `
  <section class="card">
    <h2>Unit-wise performance</h2>
    ${rows.length ? rows.map((u) => `
      <div class="unit-perf">
        <h3>${u.unit === "Module" ? esc(u.title) : `Unit ${u.unit} — ${esc(u.title)}`}</h3>
        <p class="muted">Class average ${u.avgPercent}% · ${u.studentCount} student(s)</p>
        ${levelBarsFromPct(u.perLevelPct)}
      </div>`).join("") : `<p class="muted">No data yet.</p>`}
  </section>`;
}

function renderBloom(el, data) {
  const bloom = bloomClassPerformance(data.statsMap);
  el.innerHTML = `
  <section class="card">
    <h2>Bloom-level performance (class)</h2>
    ${bloom.length ? `<table class="tbl"><thead><tr><th>Level</th><th>Avg %</th><th>Earned / Available</th></tr></thead><tbody>
      ${bloom.map((b) => `<tr><td>${b.level}</td><td class="pct">${b.percent}%</td><td>${b.earned} / ${b.available}</td></tr>`).join("")}
    </tbody></table>
    <div class="levels">${levelBarsFromPct(Object.fromEntries(bloom.map((b) => [b.level, b.percent])))}</div>` : `<p class="muted">No graded data yet.</p>`}
  </section>`;
}

function renderDifficulty(el, data) {
  const rows = difficultyAnalysis(data.questions, data.statsMap);
  el.innerHTML = `
  <section class="card">
    <h2>Question difficulty analysis</h2>
    <p class="muted">Pass rate grouped by question difficulty (from per-question stats).</p>
    ${rows.some((r) => r.total) ? `<table class="tbl"><thead><tr><th>Difficulty</th><th>Pass rate</th><th>Correct / Total</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td>${r.difficulty}</td><td class="pct">${r.percent}%</td><td>${r.correct} / ${r.total}</td></tr>`).join("")}
    </tbody></table>` : `<p class="muted">No per-question stats yet.</p>`}
  </section>`;
}

function renderMistakes(el, data) {
  const rows = commonMistakes(data.questions, data.statsMap, 12);
  el.innerHTML = `
  <section class="card">
    <h2>Common mistakes</h2>
    <p class="muted">Top missed questions (minimum 3 attempts, sorted by miss rate).</p>
    ${rows.length ? rows.map((r) => `
      <div class="rev wrong">
        <div class="revhead"><span class="vtag bad">${r.missRate}% missed</span>
          <span class="revmeta">Unit ${r.unit} · ${esc(r.topic)} · ${r.difficulty}</span></div>
        <p class="qstem">${esc(r.question)}</p>
        ${r.explanation ? `<p class="expl">${esc(r.explanation)}</p>` : ""}
        <p class="muted">${r.missed} missed of ${r.total} attempts</p>
      </div>`).join("") : `<p class="muted">Not enough data yet.</p>`}
  </section>`;
}

function renderSupport(el, data) {
  const rows = studentsNeedingSupport(data.users, data.statsMap, data.assessments);
  el.innerHTML = `
  <section class="card">
    <h2>Students needing support</h2>
    <p class="muted">Below pass mark or with two or more Bloom levels under ${60}%.</p>
    ${rows.length ? `<table class="tbl"><thead><tr><th>Student</th><th>Best %</th><th>Attempts</th><th>Weak levels</th><th>Re-practice</th></tr></thead><tbody>
      ${rows.map((r) => `<tr>
        <td>${esc(r.name)}</td><td class="pct">${r.bestPercent}%</td><td>${r.attempts}</td>
        <td>${r.gaps.length ? r.gaps.join(", ") : "—"}</td>
        <td><a href="index.html">Unit modules</a></td>
      </tr>`).join("")}
    </tbody></table>` : `<p class="muted">No students flagged yet.</p>`}
  </section>`;
}

function renderQuestions(el, data) {
  const units = [...new Set(data.questions.map((q) => q.unit))].sort();
  const types = [...new Set(data.questions.map((q) => q.questionType))].sort();
  el.innerHTML = `
  <section class="card">
    <h2>Question manager</h2>
    <p class="muted">Filter the bank. Full format-aware editing can be done in Firestore or by updating the seed JSON and re-running <code>seed.js</code>.</p>
    <div class="filters">
      <label>Unit<select id="qf-unit"><option value="">All</option>${units.map((u) => `<option value="${u}">${u}</option>`).join("")}</select></label>
      <label>Bloom<select id="qf-bloom"><option value="">All</option>${BLOOM_LEVELS.map((l) => `<option value="${l}">${l}</option>`).join("")}</select></label>
      <label>Type<select id="qf-type"><option value="">All</option>${types.map((t) => `<option value="${t}">${t}</option>`).join("")}</select></label>
      <label>Search<input type="search" id="qf-search" placeholder="Question text…"></label>
    </div>
    <div id="q-list"></div>
  </section>`;

  const list = $("#q-list", el);
  const draw = () => {
    const unit = $("#qf-unit", el).value;
    const bloom = $("#qf-bloom", el).value;
    const type = $("#qf-type", el).value;
    const search = $("#qf-search", el).value.toLowerCase();
    const filtered = data.questions.filter((q) => {
      if (unit && q.unit !== unit) return false;
      if (bloom && q.bloomLevel !== bloom) return false;
      if (type && q.questionType !== type) return false;
      if (search && !String(q.question).toLowerCase().includes(search)) return false;
      return true;
    });
    list.innerHTML = filtered.length
      ? `<p class="muted">${filtered.length} question(s)</p>
        <table class="tbl"><thead><tr><th>Unit</th><th>Bloom</th><th>Type</th><th>Question</th><th>Active</th></tr></thead><tbody>
        ${filtered.slice(0, 100).map((q) => `<tr>
          <td>${q.unit}</td><td>${q.bloomLevel}</td><td>${q.questionType}</td>
          <td>${esc(q.question).slice(0, 120)}${q.question.length > 120 ? "…" : ""}</td>
          <td>${q.active !== false ? "✓" : "—"}</td>
        </tr>`).join("")}
        </tbody></table>${filtered.length > 100 ? `<p class="muted">Showing first 100. Narrow filters to see more.</p>` : ""}`
      : `<p class="muted">No questions match.</p>`;
  };
  el.querySelectorAll(".filters select, .filters input").forEach((el) => el.addEventListener("input", draw));
  draw();
}

function renderAssessments(el, data) {
  const bankByUnit = {};
  data.questions.forEach((q) => {
    const row = (bankByUnit[q.unit] = bankByUnit[q.unit] || []);
    row.push(q);
  });

  el.innerHTML = `
  <section class="card">
    <h2>Assessment manager</h2>
    <p class="muted">Section pool preview — counts available questions per section draw.</p>
    ${data.assessments.map((a) => {
      const bank = bankByUnit[a.unit] || [];
      const sections = (a.sections || []).map((s) => {
        const { warnings } = selectForSections([s], bank);
        const pool = bank.filter(
          (q) => q.active !== false && s.bloomLevels.includes(q.bloomLevel) && s.questionTypes.includes(q.questionType)
        ).length;
        return `<tr><td>${s.id}</td><td>${esc(s.label)}</td><td>${s.questionCount} × ${s.marksPerQuestion}</td>
          <td>${pool} in pool</td><td>${warnings.length ? `<span class="tag warn">short</span>` : `<span class="tag good">ok</span>`}</td></tr>`;
      }).join("");
      return `<div class="assess-block">
        <h3>${esc(a.title)} <span class="tag">${a.kind}</span></h3>
        <table class="tbl"><thead><tr><th>Sec</th><th>Label</th><th>Draw</th><th>Pool</th><th>Status</th></tr></thead><tbody>${sections}</tbody></table>
      </div>`;
    }).join("")}
  </section>`;
}

function renderExport(el, data) {
  const assessOptions = data.assessments
    .map((a) => `<option value="${a.id}">${esc(a.title)}</option>`)
    .join("");

  el.innerHTML = `
  <section class="card">
    <h2>CSV export</h2>
    <label>Assessment<select id="export-aid">${assessOptions}</select></label>
    <button class="btn" id="export-btn">Download grade sheet</button>
    <p class="muted">Includes student name, best %, attempts, and per-Bloom columns.</p>
  </section>`;

  $("#export-btn", el).addEventListener("click", () => {
    const aid = $("#export-aid", el).value;
    const assessment = data.assessments.find((a) => a.id === aid);
    if (!assessment) return;
    const rows = gradeSheetRows(data.users, data.statsMap, assessment);
    const headers = ["student", "email", "attempts", "bestPercent", ...BLOOM_LEVELS];
    const csv = toCsv(rows, headers);
    downloadCsv(`${aid}-grades.csv`, csv);
  });
}
