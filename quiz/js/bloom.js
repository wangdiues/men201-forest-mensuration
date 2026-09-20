// MEN201 quiz — Bloom taxonomy: selection, grading, breakdowns.
// Pure module (no Firebase imports) so it can be unit-tested in Node.

export const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

export const BLOOM_VERBS = {
  Remember: "recalling",
  Understand: "explaining",
  Apply: "applying",
  Analyze: "analysing",
  Evaluate: "evaluating",
  Create: "designing",
};

export const STRENGTH_TEXT = {
  Remember: "Strong recall of definitions, instruments and formulas",
  Understand: "Good conceptual understanding",
  Apply: "Confident with calculations and formula application",
  Analyze: "Strong at interpreting data and identifying errors",
  Evaluate: "Sound judgment in method selection",
  Create: "Able to design sound field plans",
};

export const IMPROVEMENT_TEXT = {
  Remember: "Needs to consolidate definitions and key facts",
  Understand: "Needs to work on explaining concepts",
  Apply: "Needs more practice applying formulas",
  Analyze: "Needs practice interpreting data and spotting errors",
  Evaluate: "Needs practice justifying method choices",
  Create: "Needs practice designing field plans",
};

export const GAP_THRESHOLD = 60;
export const STRENGTH_THRESHOLD = 70;

// ---------------------------------------------------------------- selection

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Draw questions per section from the bank. Each section declares
// bloomLevels, questionTypes, questionCount. Falls back (same levels, any
// type; then any question) if a pool is short, and records a warning.
// With `ordered`, the pool is taken in id order instead of shuffled — for a
// fixed paper whose sections draw their whole pool.
export function selectForSections(sections, bank, { ordered = false } = {}) {
  const used = new Set();
  const sectionAssignment = {};
  const questionIds = [];
  const warnings = [];

  for (const s of sections) {
    let pool = bank.filter(
      (q) =>
        q.active !== false &&
        s.bloomLevels.includes(q.bloomLevel) &&
        s.questionTypes.includes(q.questionType) &&
        !used.has(q.id)
    );
    if (pool.length < s.questionCount) {
      const relaxed = bank.filter(
        (q) => q.active !== false && s.bloomLevels.includes(q.bloomLevel) && !used.has(q.id)
      );
      if (relaxed.length > pool.length) pool = relaxed;
    }
    if (pool.length < s.questionCount) {
      const any = bank.filter((q) => q.active !== false && !used.has(q.id));
      if (any.length > pool.length) pool = any;
      warnings.push(`Section ${s.id}: pool short — filled from a wider pool.`);
    }
    const drawn = ordered ? pool.slice().sort((a, b) => a.id.localeCompare(b.id)) : shuffle(pool);
    const picked = drawn.slice(0, s.questionCount);
    picked.forEach((q) => used.add(q.id));
    sectionAssignment[s.id] = picked.map((q) => q.id);
    questionIds.push(...sectionAssignment[s.id]);
  }
  return { sectionAssignment, questionIds, warnings };
}

// ---------------------------------------------------------------- grading

export function normalizeText(s) {
  return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim();
}

export function parseNumber(v) {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v == null ? "" : v).replace(",", ".").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

// Grade one auto-graded question. Returns { frac: 0..1, full: boolean }.
export function gradeQuestion(q, given) {
  switch (q.questionType) {
    case "mcq":
    case "true-false":
    case "image-mcq": {
      const ok = Number(given.givenIndex) === Number(q.answer);
      return { frac: ok ? 1 : 0, full: ok };
    }
    case "multi-response": {
      const correct = new Set((q.answer || []).map(Number));
      const picked = new Set((given.givenIndices || []).map(Number));
      let hits = 0,
        wrong = 0;
      picked.forEach((i) => (correct.has(i) ? hits++ : wrong++));
      const frac = correct.size ? Math.max(0, (hits - wrong) / correct.size) : 0;
      return { frac, full: frac === 1 };
    }
    case "fill-blank": {
      const blanks = q.blanks && q.blanks.length ? q.blanks : [q.answer];
      const givenBlanks = given.givenBlanks || [];
      let correctBlanks = 0;
      blanks.forEach((accepted, i) => {
        const list = Array.isArray(accepted) ? accepted : [accepted];
        const g = normalizeText(givenBlanks[i]);
        const gn = parseNumber(givenBlanks[i]);
        const hit = list.some((a) => {
          if (normalizeText(a) === g) return true;
          const an = parseNumber(a);
          return Number.isFinite(an) && Number.isFinite(gn) && an === gn;
        });
        if (hit) correctBlanks++;
      });
      const frac = blanks.length ? correctBlanks / blanks.length : 0;
      return { frac, full: frac === 1 };
    }
    case "numerical": {
      const target = parseNumber(q.answer);
      const g = parseNumber(given.given);
      if (!Number.isFinite(target) || !Number.isFinite(g)) return { frac: 0, full: false };
      const tol = q.tolerance || { mode: "absolute", value: 0.01 };
      const allowed = tol.mode === "relative" ? Math.abs(target) * tol.value : tol.value;
      const ok = Math.abs(g - target) <= allowed + 1e-9;
      return { frac: ok ? 1 : 0, full: ok };
    }
    case "matching": {
      const pairs = q.pairs || [];
      const chosen = given.givenPairs || [];
      let correctPairs = 0;
      pairs.forEach((p, i) => {
        if (Number(chosen[i]) === i) correctPairs++;
      });
      const frac = pairs.length ? correctPairs / pairs.length : 0;
      return { frac, full: frac === 1 };
    }
    default:
      return { frac: 0, full: false };
  }
}

// ---------------------------------------------------------------- breakdowns

export function strengthsImprovements(bloomBreakdown) {
  const rows = Object.entries(bloomBreakdown).filter(([, v]) => v.available > 0);
  if (!rows.length) return { strengths: [], improvements: [] };
  const byPct = rows.slice().sort((a, b) => b[1].percent - a[1].percent);
  const strengths = byPct
    .filter(([, v]) => v.percent >= STRENGTH_THRESHOLD)
    .slice(0, 2)
    .map(([lv]) => STRENGTH_TEXT[lv]);
  const improvements = byPct
    .filter(([, v]) => v.percent < GAP_THRESHOLD)
    .sort((a, b) => a[1].percent - b[1].percent)
    .slice(0, 2)
    .map(([lv]) => IMPROVEMENT_TEXT[lv]);
  return { strengths, improvements };
}

export function learningGaps(bloomBreakdown, wrongTopicsByLevel) {
  const gaps = [];
  BLOOM_LEVELS.forEach((lv) => {
    const row = bloomBreakdown[lv];
    if (!row || row.available === 0 || row.percent >= GAP_THRESHOLD) return;
    const topic = wrongTopicsByLevel ? wrongTopicsByLevel[lv] : "";
    gaps.push({
      bloomLevel: lv,
      topic,
      message: topic
        ? `Student needs improvement in ${BLOOM_VERBS[lv]} ${topic}.`
        : `Student needs improvement in ${BLOOM_VERBS[lv]}.`,
    });
  });
  return gaps;
}
