// MEN201 quiz — Firestore helpers (batch reads by document ID).
import { collection, getDocs, query, where, documentId } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase.js";

const CHUNK = 30; // Firestore "in" query limit

export async function fetchDocsByIds(colName, ids) {
  const unique = [...new Set((ids || []).filter(Boolean))];
  if (!unique.length) return {};
  const out = {};
  for (let i = 0; i < unique.length; i += CHUNK) {
    const slice = unique.slice(i, i + CHUNK);
    const snap = await getDocs(query(collection(db, colName), where(documentId(), "in", slice)));
    snap.forEach((d) => (out[d.id] = { id: d.id, ...d.data() }));
  }
  return out;
}
