// MEN201 quiz — set a user's role (student/teacher) by email.
//
// Usage:
//   FIREBASE_SERVICE_ACCOUNT=/path/to/serviceAccount.json node js/set-role.js someone@example.com teacher

import fs from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const [, , email, role] = process.argv;
if (!email || !role || !["student", "teacher"].includes(role)) {
  console.error("Usage: node js/set-role.js <email> <student|teacher>");
  process.exit(1);
}

const saPath = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!saPath) {
  console.error("Set FIREBASE_SERVICE_ACCOUNT to the service account JSON path.");
  process.exit(1);
}
initializeApp({ credential: cert(JSON.parse(fs.readFileSync(saPath, "utf8"))) });

const user = await getAuth().getUserByEmail(email);
await getFirestore().collection("users").doc(user.uid).set({ role }, { merge: true });
console.log(`Set ${email} (uid ${user.uid}) to role: ${role}`);
