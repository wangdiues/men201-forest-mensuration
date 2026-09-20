// MEN201 quiz — authentication helpers.
import { auth, db, configReady } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export function registerUser(email, password, displayName) {
  const cred = createUserWithEmailAndPassword(auth, email, password);
  return cred.then(async (c) => {
    await updateProfile(c.user, { displayName });
    await setDoc(doc(db, "users", c.user.uid), {
      email: c.user.email,
      displayName,
      role: "student",
      registeredAt: serverTimestamp(),
    });
    return c.user;
  });
}

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password).then((c) => c.user);
}

export function logoutUser() {
  return signOut(auth);
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function getProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export function isTeacher(profile) {
  return Boolean(profile && profile.role === "teacher");
}

export { configReady };
