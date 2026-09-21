// MEN201 quiz — standalone grading pass, run on a schedule (GitHub Actions)
// instead of as a Cloud Function, so the module can grade attempts without
// needing the Blaze plan.
//
// Mirrors functions/index.js's onAttemptCreated + onAttemptManualGraded
// exactly (same algorithm, same output fields) but is invoked by polling
// Firestore for attempts that need grading, rather than by a Firestore
// trigger. If the two ever diverge, keep them in sync by hand — there is no
// shared module because functions/index.js is CommonJS and this is ESM.
//
// Usage:
//   FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccount.json node js/grade-attempts.js

import fs from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const saPath = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!saPath) {
  console.error("Set FIREBASE_SERVICE_ACCOUNT to the service account JSON path.");
  process.exit(1);
}
initializeApp({ credential: cert(JSON.parse(fs.readFileSync(saPath, "utf8"))) });
const db = getFirestore();

const BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
const BLOOM_VERBS = {
  Remember: "recalling",
  Understand: "explaining",
  Apply: "applying",
  Analyze: "analysing",
  Evaluate: "evaluating",
  Create: "designing",
};
const GAP_THRESHOLD = 60;
const STRENGTH_THRESHOLD = 70;

const STRENGTH_TEXT = {
  Remember: "Strong recall of definitions, instruments and formulas",
  Understand: "Good conceptual understanding",
  Apply: "Confident with calculations and formula application",
  Analyze: "Strong at interpreting data and identifying errors",
  Evaluate: "Sound judgment in method selection",
  Create: "Able to design sound field plans",
};

const IMPROVEMENT_TEXT = {
  Remember: "Needs to consolidate definitions and key facts",
  Understand: "Needs to work on explaining concepts",
  Apply: "Needs more practice applying formulas",
  Analyze: "Needs practice interpreting data and spotting errors",
  Evaluate: "Needs practice justifying method choices",
  Create: "Needs practice designing field plans",
};

function normalizeText(s) {
  return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim();
}

function parseNumber(v) {
  if (typeof v === "number") return v;
  const n = parseFloat(String(v == null ? "" : v).replace(",", ".").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function gradeQuestion(q, given) {
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
      let hits = 0, wrong = 0;
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

function addBreakdown(map, key, earned, available) {
  if (!map[key]) map[key] = { earned: 0, available: 0 };
  map[key].earned += earned;
  map[key].available += available;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function finishBreakdown(map) {
  const out = {};
  BLOOM_LEVELS.forEach((lv) => {
    const e = map[lv];
    if (e && e.available > 0) {
      out[lv] = {
        earned: round2(e.earned),
        available: round2(e.available),
        percent: Math.round((10000 * e.earned) / e.available) / 100,
      };
    }
  });
  return out;
}

function strengthsImprovements(bloomBreakdown) {
  const rows = Object.entries(bloomBreakdown).filter(([, v]) => v.available > 0);
  if (!rows.length) return { strengths: [], improvements: [] };
  const byPct = rows.sort((a, b) => b[1].percent - a[1].percent);
  const strengths = byPct.filter(([, v]) => v.percent >= STRENGTH_THRESHOLD).slice(0, 2);
  const improvements = byPct
    .filter(([, v]) => v.percent < GAP_THRESHOLD)
    .sort((a, b) => a[1].percent - b[1].percent)
    .slice(0, 2);
  return {
    strengths: strengths.map(([lv]) => STRENGTH_TEXT[lv]),
    improvements: improvements.map(([lv]) => IMPROVEMENT_TEXT[lv]),
  };
}

function dominantTopics(wrongTopicsByLevel) {
  const out = {};
  Object.entries(wrongTopicsByLevel).forEach(([lv, topics]) => {
    out[lv] = Object.entries(topics).sort((a, b) => b[1] - a[1])[0][0];
  });
  return out;
}

function learningGaps(bloomBreakdown, wrongTopicsByLevel) {
  const gaps = [];
  BLOOM_LEVELS.forEach((lv) => {
    const row = bloomBreakdown[lv];
    if (!row || row.available === 0 || row.percent >= GAP_THRESHOLD) return;
    const topic = wrongTopicsByLevel[lv] || "";
    gaps.push({
      bloomLevel: lv,
      topic,
      message: topic
        ? `This student needs to improve in ${BLOOM_VERBS[lv]} ${topic}.`
        : `This student needs to improve in ${BLOOM_VERBS[lv]}.`,
    });
  });
  return gaps;
}

async function loadContext(attempt) {
  const refs = (attempt.questionIds || []).map((id) => db.collection("questions").doc(id));
  const qDocs = refs.length ? await db.getAll(...refs) : [];
  const questions = {};
  qDocs.forEach((d) => {
    if (d.exists) questions[d.id] = d.data();
  });
  const aSnap = await db.doc(`assessments/${attempt.assessmentId}`).get();
  const assessment = aSnap.data() || {};
  const sections = {};
  (assessment.sections || []).forEach((s) => (sections[s.id] = s));
  return { questions, sections };
}

function weightFor(sections, sectionId, q) {
  const s = sections[sectionId];
  return s && Number.isFinite(s.marksPerQuestion) ? s.marksPerQuestion : q.marks || 1;
}

async function upsertResult(uid, assessmentId, percent, bloom, submittedAt) {
  const ref = db.collection("users").doc(uid).collection("results").doc(assessmentId);
  await db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    const prev = snap.data() || { attempts: 0, bestPercent: 0, avgPercent: 0, bloomProfile: {} };
    const attempts = prev.attempts + 1;
    const bestPercent = Math.max(prev.bestPercent || 0, percent);
    const avgPercent = Math.round(((prev.avgPercent || 0) * prev.attempts + percent) / attempts * 100) / 100;
    const bloomProfile = {};
    BLOOM_LEVELS.forEach((lv) => {
      const p = bloom[lv];
      if (!p) return;
      const prevRow = prev.bloomProfile ? prev.bloomProfile[lv] : undefined;
      bloomProfile[lv] = {
        avgPercent: prevRow
          ? Math.round(((prevRow.avgPercent * prevRow.attempts + p.percent) / (prevRow.attempts + 1)) * 100) / 100
          : p.percent,
        attempts: (prevRow ? prevRow.attempts : 0) + 1,
      };
    });
    t.set(ref, { ...prev, attempts, bestPercent, avgPercent, lastPercent: percent, lastAttemptAt: submittedAt || FieldValue.serverTimestamp(), bloomProfile });
  });
}

async function bumpStats(assessmentId, uid, delta) {
  const statsRef = db.collection("stats").doc(assessmentId);
  await db.runTransaction(async (t) => {
    const snap = await t.get(statsRef);
    const s = snap.data() || { studentCount: 0, avgPercent: 0, perLevel: {}, perTopic: {}, perQuestion: {}, perStudent: {} };
    ["perLevel", "perTopic"].forEach((key) => {
      Object.entries(delta[key] || {}).forEach(([k, v]) => {
        const row = (s[key][k] = s[key][k] || { earned: 0, available: 0 });
        row.earned = round2(row.earned + v.earned);
        row.available = round2(row.available + v.available);
      });
    });
    Object.entries(delta.perQ || {}).forEach(([qid, v]) => {
      const row = (s.perQuestion[qid] = s.perQuestion[qid] || { correct: 0, total: 0 });
      row.correct += v.correct;
      row.total += v.total;
    });
    const prev = s.perStudent[uid] || { attempts: 0, bestPercent: 0, bloom: {} };
    const attempts = prev.attempts + 1;
    const bestPercent = delta.percent == null ? prev.bestPercent : Math.max(prev.bestPercent, delta.percent);
    s.perStudent[uid] = {
      attempts,
      bestPercent,
      bloom: delta.bloom && (delta.percent == null || delta.percent >= prev.bestPercent) ? delta.bloom : prev.bloom,
    };
    s.studentCount = Object.keys(s.perStudent).length;
    const totE = Object.values(s.perLevel).reduce((a, r) => a + r.earned, 0);
    const totA = Object.values(s.perLevel).reduce((a, r) => a + r.available, 0);
    s.avgPercent = totA > 0 ? Math.round((10000 * totE) / totA) / 100 : 0;
    s.lastUpdated = FieldValue.serverTimestamp();
    t.set(statsRef, s);
  });
}

// ---------------------------------------------------------------- ① auto grade

async function gradeSubmitted(docSnap) {
  const attempt = docSnap.data();
  const { questions, sections } = await loadContext(attempt);

  const autoItems = [];
  let manualCount = 0;
  for (const a of attempt.answers || []) {
    const q = questions[a.qid];
    if (!q) continue;
    const weight = weightFor(sections, a.section, q);
    if (q.autoGraded === false) manualCount++;
    else autoItems.push({ a, q, weight });
  }

  let autoEarned = 0;
  let autoAvail = 0;
  const perLevel = {};
  const perTopic = {};
  const perDiff = {};
  const perQ = {};
  const wrongTopicsByLevel = {};

  for (const { a, q, weight } of autoItems) {
    const { frac, full } = gradeQuestion(q, a);
    const earned = round2(weight * frac);
    autoEarned += earned;
    autoAvail += weight;
    addBreakdown(perLevel, q.bloomLevel, earned, weight);
    addBreakdown(perTopic, q.topic, earned, weight);
    addBreakdown(perDiff, q.difficulty, earned, weight);
    perQ[a.qid] = { correct: full ? 1 : 0, total: 1 };
    if (!full && frac < 1) {
      (wrongTopicsByLevel[q.bloomLevel] = wrongTopicsByLevel[q.bloomLevel] || {})[q.topic] =
        (wrongTopicsByLevel[q.bloomLevel][q.topic] || 0) + 1;
    }
  }

  const bloomBreakdown = finishBreakdown(perLevel);
  const { strengths, improvements } = strengthsImprovements(bloomBreakdown);
  const complete = manualCount === 0;
  const totalScore = complete ? round2(autoEarned) : undefined;
  const totalMax = complete ? round2(autoAvail) : undefined;
  const percent = complete && totalMax > 0 ? Math.round((10000 * totalScore) / totalMax) / 100 : undefined;

  const update = {
    status: complete ? "complete" : "awaiting-manual",
    autoScore: round2(autoEarned),
    autoMax: round2(autoAvail),
    bloomBreakdown,
    topicBreakdown: finishBreakdown(perTopic),
    difficultyBreakdown: finishBreakdown(perDiff),
    strengths,
    improvements,
    gradedAt: FieldValue.serverTimestamp(),
  };
  if (complete) {
    update.totalScore = totalScore;
    update.totalMax = totalMax;
    update.percent = percent;
    update.finalBloomBreakdown = bloomBreakdown;
    update.learningGaps = learningGaps(bloomBreakdown, dominantTopics(wrongTopicsByLevel));
  }
  await docSnap.ref.update(update);

  if (complete) {
    await upsertResult(attempt.userId, attempt.assessmentId, percent, bloomBreakdown, attempt.submittedAt);
  }
  await bumpStats(attempt.assessmentId, attempt.userId, {
    perLevel,
    perTopic,
    perQ,
    percent: complete ? percent : null,
    bloom: complete ? bloomBreakdown : null,
  });
}

// ---------------------------------------------------------------- ② manual merge

async function mergeManual(docSnap) {
  const after = docSnap.data();
  const { questions, sections } = await loadContext(after);

  let manualScore = 0;
  let manualMax = 0;
  const perLevel = {};
  const perTopic = {};
  const perQ = {};
  const wrongTopicsByLevel = {};

  for (const m of after.manualGrading) {
    const q = questions[m.qid];
    if (!q) continue;
    const weight = weightFor(sections, m.section, q);
    const marks = Math.max(0, Math.min(weight, Number(m.marks) || 0));
    manualScore += marks;
    manualMax += weight;
    addBreakdown(perLevel, q.bloomLevel, marks, weight);
    addBreakdown(perTopic, q.topic, marks, weight);
    perQ[m.qid] = { correct: marks >= weight ? 1 : 0, total: 1 };
    if (marks < weight) {
      (wrongTopicsByLevel[q.bloomLevel] = wrongTopicsByLevel[q.bloomLevel] || {})[q.topic] =
        (wrongTopicsByLevel[q.bloomLevel][q.topic] || 0) + 1;
    }
  }

  const autoLevel = after.bloomBreakdown || {};
  const merged = {};
  BLOOM_LEVELS.forEach((lv) => {
    const a = autoLevel[lv] || { earned: 0, available: 0 };
    const m = perLevel[lv] || { earned: 0, available: 0 };
    const earned = a.earned + m.earned;
    const available = a.available + m.available;
    if (available > 0) merged[lv] = { earned: round2(earned), available: round2(available), percent: Math.round((10000 * earned) / available) / 100 };
  });

  const totalScore = round2((after.autoScore || 0) + manualScore);
  const totalMax = round2((after.autoMax || 0) + manualMax);
  const percent = totalMax > 0 ? Math.round((10000 * totalScore) / totalMax) / 100 : 0;

  await docSnap.ref.update({
    manualScore: round2(manualScore),
    manualMax: round2(manualMax),
    totalScore,
    totalMax,
    percent,
    finalBloomBreakdown: merged,
    learningGaps: learningGaps(merged, dominantTopics(wrongTopicsByLevel)),
  });

  await upsertResult(after.userId, after.assessmentId, percent, merged, after.submittedAt);
  await bumpStats(after.assessmentId, after.userId, { perLevel, perTopic, perQ, percent, bloom: merged });
}

// ---------------------------------------------------------------- ③ AI grade
//
// Grades the written (short-answer/long-answer) items that gradeSubmitted()
// left at "awaiting-manual", using the question's own modelAnswer + rubric
// as the grading standard. Writes the same manualGrading shape a human
// tutor would via teacher-grade.js, so mergeManual() below finishes the
// attempt exactly as it would for a human-graded one. A tutor can still
// override any of this later through teacher.html.
//
// Tries providers in order — Gemini, then NVIDIA NIM, then OpenRouter's
// free-model router — falling through to the next on any error (bad
// response, rate limit, capacity). Only if every configured provider fails
// does the attempt stay at "awaiting-manual" for the next scheduled run.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.6-flash";
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_MODEL = "openai/gpt-oss-20b";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "openai/gpt-oss-120b";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = "openrouter/free";

const GRADING_SYSTEM_PROMPT =
  "You are grading forest-mensuration exam answers against a marking rubric. " +
  "For each item, award marks strictly out of maxMarks, based on how many rubric points the " +
  "student's answer substantively satisfies — grade the substance, not the wording; a correct " +
  "answer phrased differently from modelAnswer still earns full credit for the point it covers. " +
  "Award 0 for a blank or nonsensical answer. Give one brief sentence of feedback per item. " +
  "Return grades for every qid given, in the same order.";

const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    grades: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          qid: { type: "STRING" },
          marks: { type: "NUMBER" },
          feedback: { type: "STRING" },
        },
        required: ["qid", "marks", "feedback"],
      },
    },
  },
  required: ["grades"],
};

// Free/open models don't always obey response_format perfectly — strip
// markdown fences or leading prose and grab the first {...} block.
function parseGradesJson(text) {
  let s = text.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(s);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) s = s.slice(start, end + 1);
  const parsed = JSON.parse(s);
  return parsed.grades || [];
}

async function callGemini(items) {
  const prompt = `${GRADING_SYSTEM_PROMPT}\n\n${JSON.stringify(items, null, 2)}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: GEMINI_SCHEMA },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no content");
  return parseGradesJson(text);
}

// Shared caller for OpenAI-compatible chat-completions APIs (NVIDIA NIM,
// OpenRouter both implement this shape).
//
// max_tokens is scaled to the batch size: reasoning models (e.g. NVIDIA's
// openai/gpt-oss-20b) spend tokens on an internal reasoning trace before
// the actual JSON answer, and a fixed low cap can leave `content` empty —
// seen directly while testing this integration.
async function callOpenAICompatible(label, baseUrl, apiKey, model, items, extraHeaders = {}) {
  const maxTokens = Math.min(16000, 1200 + items.length * 500);
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, ...extraHeaders },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: `${GRADING_SYSTEM_PROMPT} Reply with ONLY a JSON object of the exact form {"grades":[{"qid":string,"marks":number,"feedback":string}, ...]} — no prose, no markdown fences.` },
        { role: "user", content: JSON.stringify(items, null, 2) },
      ],
      response_format: { type: "json_object" },
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    throw new Error(`${label} API error ${res.status}: ${(await res.text()).slice(0, 500)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(`${label} returned no content`);
  return parseGradesJson(text);
}

const callNvidia = (items) => callOpenAICompatible("NVIDIA NIM", "https://integrate.api.nvidia.com/v1", NVIDIA_API_KEY, NVIDIA_MODEL, items);
const callGroq = (items) => callOpenAICompatible("Groq", "https://api.groq.com/openai/v1", GROQ_API_KEY, GROQ_MODEL, items);
const callOpenRouter = (items) =>
  callOpenAICompatible("OpenRouter", "https://openrouter.ai/api/v1", OPENROUTER_API_KEY, OPENROUTER_MODEL, items, {
    "HTTP-Referer": "https://men201-quiz.web.app",
    "X-Title": "MEN201 quiz grading",
  });

async function gradeWithFallback(items) {
  const providers = [
    GEMINI_API_KEY && { name: "gemini", fn: callGemini },
    NVIDIA_API_KEY && { name: "nvidia", fn: callNvidia },
    GROQ_API_KEY && { name: "groq", fn: callGroq },
    OPENROUTER_API_KEY && { name: "openrouter", fn: callOpenRouter },
  ].filter(Boolean);
  if (!providers.length) throw new Error("No AI grading provider is configured");

  const errors = [];
  for (const p of providers) {
    try {
      const grades = await p.fn(items);
      return { provider: p.name, grades };
    } catch (err) {
      errors.push(`${p.name}: ${err.message}`);
    }
  }
  throw new Error(`All AI grading providers failed — ${errors.join(" | ")}`);
}

async function aiGradeManual(docSnap) {
  const attempt = docSnap.data();
  const { questions, sections } = await loadContext(attempt);

  const manualItems = (attempt.answers || []).filter((a) => {
    const q = questions[a.qid];
    return q && q.autoGraded === false;
  });
  if (!manualItems.length) return;

  const items = manualItems.map((a) => {
    const q = questions[a.qid];
    return {
      qid: a.qid,
      maxMarks: weightFor(sections, a.section, q),
      question: q.question,
      rubric: q.rubric || [],
      modelAnswer: q.modelAnswer || "",
      studentAnswer: a.givenText || "(no answer)",
    };
  });

  const { provider, grades } = await gradeWithFallback(items);
  const byQid = {};
  grades.forEach((g) => (byQid[g.qid] = g));

  const manualGrading = manualItems.map((a) => {
    const q = questions[a.qid];
    const max = weightFor(sections, a.section, q);
    const g = byQid[a.qid];
    const marks = g ? Math.max(0, Math.min(max, Number(g.marks) || 0)) : 0;
    const feedback = g && g.feedback ? String(g.feedback).slice(0, 500) : "";
    return feedback ? { qid: a.qid, section: a.section, marks, feedback } : { qid: a.qid, section: a.section, marks };
  });

  await docSnap.ref.update({
    manualGrading,
    status: "complete",
    gradedBy: `ai:${provider}`,
    gradedAt: FieldValue.serverTimestamp(),
  });
}

// ---------------------------------------------------------------- main

async function main() {
  const submittedSnap = await db.collection("attempts").where("status", "==", "submitted").get();
  for (const docSnap of submittedSnap.docs) {
    await gradeSubmitted(docSnap);
  }

  let aiGraded = 0;
  if (GEMINI_API_KEY || NVIDIA_API_KEY || GROQ_API_KEY || OPENROUTER_API_KEY) {
    const awaitingSnap = await db.collection("attempts").where("status", "==", "awaiting-manual").get();
    for (const docSnap of awaitingSnap.docs) {
      try {
        await aiGradeManual(docSnap);
        aiGraded++;
      } catch (err) {
        console.error(`AI grading failed for attempt ${docSnap.id}, will retry next run: ${err.message}`);
      }
    }
  }

  const completeSnap = await db.collection("attempts").where("status", "==", "complete").get();
  let merged = 0;
  for (const docSnap of completeSnap.docs) {
    const data = docSnap.data();
    if (data.totalScore === undefined && Array.isArray(data.manualGrading) && data.manualGrading.length) {
      await mergeManual(docSnap);
      merged++;
    }
  }

  console.log(
    `Graded ${submittedSnap.size} newly submitted attempt(s), AI-graded ${aiGraded} written attempt(s), merged ${merged} attempt(s) to a final score.`
  );
}

await main();
