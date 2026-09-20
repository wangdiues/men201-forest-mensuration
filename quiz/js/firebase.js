// MEN201 quiz — Firebase app init.
// Paste the Web app config from the Firebase console here
// (Project settings → Your apps → Web app → SDK setup and configuration).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PASTE_API_KEY",
  authDomain: "men201-quiz.firebaseapp.com",
  projectId: "men201-quiz",
  storageBucket: "men201-quiz.appspot.com",
  messagingSenderId: "PASTE_MESSAGING_SENDER_ID",
  appId: "PASTE_APP_ID",
};

// True when served by `firebase emulators:start` locally. The real config
// above is never touched by this — it only decides whether to point the SDK
// at the local Auth/Firestore emulators instead of production.
const isLocalDev = ["localhost", "127.0.0.1"].includes(location.hostname);

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (isLocalDev) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

// True once the real config has been pasted in — or always true locally,
// since the emulators don't need real project credentials.
export const configReady = isLocalDev || !/PASTE_/.test(firebaseConfig.apiKey);
