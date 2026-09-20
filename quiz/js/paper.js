// MEN201 quiz — the question paper. Pure module (no Firebase imports):
// renders a whole graded paper as one exam sheet from the drawn items.
import { formatOf } from "./formats.js";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

const ROMAN = { I: "One", II: "Two", III: "Three", IV: "Four", V: "Five", VI: "Six", VII: "Seven", VIII: "Eight", IX: "Nine", X: "Ten", XI: "Eleven" };

export function paperTotals(items) {
  const total = items.reduce((s, it) => s + it.weight, 0);
  const auto = items.filter((it) => it.q.autoGraded !== false).reduce((s, it) => s + it.weight, 0);
  return { total, auto, manual: total - auto };
}

// items: [{ q, section, sectionLabel, weight }] in paper order.
export function renderPaper(items, assessment, candidate, dateText) {
  const { total, manual } = paperTotals(items);
  const passMark = assessment.passPercent ? Math.ceil((total * assessment.passPercent) / 100) : null;
  const time = assessment.timeAllowedMin;
  const unitWord = ROMAN[assessment.unit] || assessment.unit;

  const sections = [];
  items.forEach((it, i) => {
    let s = sections[sections.length - 1];
    if (!s || s.id !== it.section) {
      s = { id: it.section, label: it.sectionLabel, weight: it.weight, items: [] };
      sections.push(s);
    }
    s.items.push({ ...it, n: i + 1 });
  });

  const rules = [
    ["Full marks", String(total)],
    time ? ["Time allowed", `${time} minutes`] : null,
    passMark != null ? ["Pass mark", `${passMark} (${assessment.passPercent}%)`] : null,
    ["Questions", String(items.length)],
  ].filter(Boolean);

  const instructions = [
    "Answer all questions. Marks for each question are shown in square brackets.",
    manual
      ? "Objective answers are marked as soon as you submit; written answers are marked by the tutor and your result is completed then."
      : "The paper is marked as soon as you submit.",
    time ? "The clock starts now and the paper is submitted for you when it runs out." : null,
    `You have ${assessment.attemptsAllowed === 1 ? "one attempt" : `${assessment.attemptsAllowed} attempts`}. Nothing is saved until you press Submit paper.`,
  ].filter(Boolean);

  const sectionHtml = sections
    .map((s) => {
      const subtotal = s.items.reduce((a, it) => a + it.weight, 0);
      const qs = s.items
        .map((it) => {
          const fmt = formatOf(it.q);
          const stem = fmt.inline ? "" : `<p class="pq-stem">${esc(it.q.question)}</p>`;
          const note = fmt.manual ? `<p class="pq-note">Marked by the tutor</p>` : "";
          return `
          <li class="pq" id="q${it.n}" data-i="${it.n - 1}">
            <span class="pq-n" aria-hidden="true">${it.n}.</span>
            <div class="pq-body">
              ${stem}
              <div class="pq-answer">${fmt.render(it.q, `ans-${it.n}`)}</div>
              ${note}
            </div>
            <span class="pq-marks">[${it.weight}]</span>
          </li>`;
        })
        .join("");
      return `
      <section class="psec" aria-labelledby="sec-${esc(s.id)}">
        <header class="psec-head">
          <h2 id="sec-${esc(s.id)}">Section ${esc(s.id)} <span>${esc(s.label)}</span></h2>
          <p>${s.items.length} × ${s.weight} = ${subtotal} marks</p>
        </header>
        <ol class="pq-list" start="${s.items[0].n}">${qs}</ol>
      </section>`;
    })
    .join("");

  const isExam = assessment.kind === "exam";
  const headline = isExam
    ? `<h1>Module Examination</h1>
       <p class="paper-kind">Units I to XI — the whole module in one paper</p>`
    : `<h1>Unit ${esc(assessment.unit)} · ${esc(unitTitle(assessment))}</h1>
       <p class="paper-kind">Test your understanding — Unit ${esc(unitWord)} paper</p>`;

  return `
  <article class="paper">
    <header class="paper-head">
      <p class="paper-inst">College of Natural Resources · Royal University of Bhutan</p>
      <p class="paper-course">MEN 201 Forest Mensuration${isExam ? " · BSc Forestry" : ""}</p>
      ${headline}
    </header>
    <dl class="paper-rules">
      ${rules.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}
    </dl>
    <dl class="paper-cand">
      <div><dt>Candidate</dt><dd>${esc(candidate)}</dd></div>
      <div><dt>Date</dt><dd>${esc(dateText)}</dd></div>
    </dl>
    <section class="paper-instr" aria-label="Instructions">
      <h2>Instructions</h2>
      <ol>${instructions.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
    </section>
    ${sectionHtml}
    <footer class="paper-end">
      <p class="paper-fin">End of paper</p>
    </footer>
  </article>
  <div class="paper-bar" role="region" aria-label="Submit">
    ${time ? `<p class="paper-clock"><span class="k">Time left</span> <b id="clock">--:--</b></p>` : ""}
    <p class="paper-count" id="unanswered" aria-live="polite"></p>
    <button class="btn primary" id="submit" type="button">Submit paper</button>
  </div>`;
}

function unitTitle(assessment) {
  // "Unit I — Introduction to Forest Mensuration: Quiz" -> "Introduction to Forest Mensuration"
  const m = /—\s*(.+?)(?::\s*[^:]*)?$/.exec(assessment.title || "");
  return m ? m[1].trim() : assessment.title || "";
}
