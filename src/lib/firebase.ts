
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "scholarsage-ue2av",
  "appId": "1:464814044908:web:f69d16aa7c8ed63814d7c9",
  "storageBucket": "scholarsage-ue2av.firebasestorage.app",
  "apiKey": "AIzaSyBBucBQ-1aHNNna0VckiW_AqMK5CSqul8k",
  "authDomain": "searnai.vercel.app",
  "measurementId": "",
  "messagingSenderId": "464814044908"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
