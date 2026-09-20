// MEN201 quiz — one-time seeder for quiz/data/*.json into Cloud Firestore.
//
// Usage:
//   1. cd quiz && npm install firebase-admin
//   2. export FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccount.json
//      (Firebase console → Project settings → Service accounts → Generate new key)
//   3. node js/seed.js
//
// Idempotent: document IDs are deterministic (q-{unit}-{n}), re-running overwrites.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, "..", "data");

const saPath = process.env.FIREBASE_SERVICE_ACCOUNT;
if (saPath) {
  initializeApp({ credential: cert(JSON.parse(fs.readFileSync(saPath, "utf8"))) });
} else if (process.env.FIRESTORE_EMULATOR_HOST) {
  // Seeding the local emulator: no real credentials needed, just a project id.
  initializeApp({ credential: applicationDefault(), projectId: process.env.GCLOUD_PROJECT || "men201-quiz" });
} else {
  console.error("Set FIREBASE_SERVICE_ACCOUNT to the service account JSON path (or FIRESTORE_EMULATOR_HOST to seed the emulator).");
  process.exit(1);
}
const db = getFirestore();

// ---- questions
// questions-unit-ii.json -> q-ii-001…, questions-exam.json -> q-exam-001…
const files = fs
  .readdirSync(dataDir)
  .filter((f) => f.startsWith("questions-") && f.endsWith(".json"))
  .sort();
let total = 0;
for (const f of files) {
  const arr = JSON.parse(fs.readFileSync(path.join(dataDir, f), "utf8"));
  const prefix = f.replace(/^questions-(unit-)?/, "").replace(/\.json$/, "").toLowerCase();
  const batch = db.batch();
  arr.forEach((q, i) => {
    const id = `q-${prefix}-${String(i + 1).padStart(3, "0")}`;
    batch.set(db.collection("questions").doc(id), q);
  });
  await batch.commit();
  total += arr.length;
  console.log(`${f}: ${arr.length} questions`);
}

// ---- assessments
const assessments = JSON.parse(fs.readFileSync(path.join(dataDir, "assessments.json"), "utf8"));
const ab = db.batch();
assessments.forEach((a) => ab.set(db.collection("assessments").doc(a.id), a));
await ab.commit();
console.log(`assessments: ${assessments.length}`);

// ---- course document
const course = JSON.parse(fs.readFileSync(path.join(dataDir, "course.json"), "utf8"));
await db.collection("courses").doc("men201").set(course, { merge: true });
console.log("course document: men201");

console.log(`Done. ${total} questions, ${assessments.length} assessments, 1 course document.`);
