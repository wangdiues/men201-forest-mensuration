// MEN201 quiz — teacher-side analytics from materialized stats docs.
import { BLOOM_LEVELS, GAP_THRESHOLD } from "./bloom.js";
import { UNITS } from "./quiz-engine.js";

export function pctFromBreakdown(row) {
  if (!row || !row.available) return 0;
  return Math.round((10000 * row.earned) / row.available) / 100;
}

export function unitWisePerformance(assessments, statsMap) {
  const byUnit = {};
  assessments
    .filter((a) => a.kind === "assessment" || a.kind === "exam")
    .forEach((a) => {
      const s = statsMap[a.id] || {};
      const row = (byUnit[a.unit] = byUnit[a.unit] || {
        unit: a.unit,
        title: a.kind === "exam" ? "Mock module examination" : UNITS.find((u) => u.id === a.unit)?.title || a.unit,
        assessments: [],
        studentCount: 0,
        avgPercent: 0,
        perLevel: {},
      });
      row.assessments.push({ id: a.id, title: a.title, avgPercent: s.avgPercent || 0, studentCount: s.studentCount || 0 });
      row.studentCount = Math.max(row.studentCount, s.studentCount || 0);
      BLOOM_LEVELS.forEach((lv) => {
        const pl = s.perLevel && s.perLevel[lv];
        if (!pl) return;
        const agg = (row.perLevel[lv] = row.perLevel[lv] || { earned: 0, available: 0 });
        agg.earned += pl.earned || 0;
        agg.available += pl.available || 0;
      });
    });
  return Object.values(byUnit).map((u) => {
    const levels = {};
    BLOOM_LEVELS.forEach((lv) => {
      const r = u.perLevel[lv];
      if (r && r.available) levels[lv] = pctFromBreakdown(r);
    });
    const avg =
      u.assessments.length > 0
        ? Math.round((u.assessments.reduce((a, x) => a + (x.avgPercent || 0), 0) / u.assessments.length) * 100) / 100
        : 0;
    return { ...u, avgPercent: avg, perLevelPct: levels };
  });
}

export function bloomClassPerformance(statsMap) {
  const agg = {};
  Object.values(statsMap).forEach((s) => {
    BLOOM_LEVELS.forEach((lv) => {
      const pl = s.perLevel && s.perLevel[lv];
      if (!pl || !pl.available) return;
      const row = (agg[lv] = agg[lv] || { earned: 0, available: 0 });
      row.earned += pl.earned;
      row.available += pl.available;
    });
  });
  return BLOOM_LEVELS.map((lv) => ({
    level: lv,
    percent: pctFromBreakdown(agg[lv]),
    earned: agg[lv]?.earned || 0,
    available: agg[lv]?.available || 0,
  })).filter((r) => r.available > 0);
}

export function difficultyAnalysis(questions, statsMap) {
  const qMeta = {};
  questions.forEach((q) => {
    qMeta[q.id] = { difficulty: q.difficulty || "Medium", topic: q.topic, unit: q.unit };
  });
  const byDiff = { Easy: { correct: 0, total: 0 }, Medium: { correct: 0, total: 0 }, Hard: { correct: 0, total: 0 } };
  Object.entries(statsMap).forEach(([, s]) => {
    Object.entries(s.perQuestion || {}).forEach(([qid, row]) => {
      const diff = (qMeta[qid] && qMeta[qid].difficulty) || "Medium";
      const bucket = byDiff[diff] || (byDiff[diff] = { correct: 0, total: 0 });
      bucket.correct += row.correct || 0;
      bucket.total += row.total || 0;
    });
  });
  return Object.entries(byDiff).map(([difficulty, row]) => ({
    difficulty,
    percent: row.total ? Math.round((10000 * row.correct) / row.total) / 100 : 0,
    correct: row.correct,
    total: row.total,
  }));
}

export function commonMistakes(questions, statsMap, topN = 10) {
  const qMap = {};
  questions.forEach((q) => (qMap[q.id] = q));
  const merged = {};
  Object.values(statsMap).forEach((s) => {
    Object.entries(s.perQuestion || {}).forEach(([qid, row]) => {
      const m = (merged[qid] = merged[qid] || { correct: 0, total: 0 });
      m.correct += row.correct || 0;
      m.total += row.total || 0;
    });
  });
  return Object.entries(merged)
    .map(([qid, row]) => {
      const q = qMap[qid];
      const missed = row.total - row.correct;
      const missRate = row.total ? Math.round((10000 * missed) / row.total) / 100 : 0;
      return {
        qid,
        question: q?.question || qid,
        explanation: q?.explanation || "",
        unit: q?.unit,
        topic: q?.topic,
        difficulty: q?.difficulty,
        missed,
        total: row.total,
        missRate,
      };
    })
    .filter((r) => r.total >= 3 && r.missed > 0)
    .sort((a, b) => b.missRate - a.missRate || b.missed - a.missed)
    .slice(0, topN);
}

export function studentsNeedingSupport(users, statsMap, assessments, passPercent = 50) {
  const assessByUnit = {};
  assessments.forEach((a) => (assessByUnit[a.id] = a));
  const rows = [];
  Object.values(statsMap).forEach((s) => {
    Object.entries(s.perStudent || {}).forEach(([uid, row]) => {
      if ((row.bestPercent || 0) >= passPercent) return;
      const gaps = BLOOM_LEVELS.filter((lv) => {
        const b = row.bloom && row.bloom[lv];
        return b && b.percent != null && b.percent < GAP_THRESHOLD;
      });
      if ((row.bestPercent || 0) >= passPercent && gaps.length < 2) return;
      const user = users[uid] || {};
      rows.push({
        uid,
        name: user.displayName || user.email || uid,
        bestPercent: row.bestPercent || 0,
        attempts: row.attempts || 0,
        gaps,
        bloom: row.bloom || {},
      });
    });
  });
  return rows.sort((a, b) => a.bestPercent - b.bestPercent);
}

export function gradeSheetRows(users, statsMap, assessment) {
  const s = statsMap[assessment.id] || {};
  return Object.entries(s.perStudent || {}).map(([uid, row]) => {
    const user = users[uid] || {};
    const bloomCols = {};
    BLOOM_LEVELS.forEach((lv) => {
      bloomCols[lv] = row.bloom && row.bloom[lv] ? row.bloom[lv].percent : "";
    });
    return {
      student: user.displayName || user.email || uid,
      email: user.email || "",
      attempts: row.attempts,
      bestPercent: row.bestPercent,
      ...bloomCols,
    };
  });
}

export function toCsv(rows, headers) {
  const esc = (v) => {
    const s = String(v == null ? "" : v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  rows.forEach((r) => lines.push(headers.map((h) => esc(r[h])).join(",")));
  return lines.join("\n");
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
