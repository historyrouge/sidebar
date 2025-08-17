
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableNetwork, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "scholarsage-ue2av",
  "appId": "1:464814044908:web:f69d16aa7c8ed63814d7c9",
  "storageBucket": "scholarsage-ue2av.firebasestorage.app",
  "apiKey": "AIzaSyBBucBQ-1aHNNna0VckiW_AqMK5CSqul8k",
  "authDomain": "scholarsage-ue2av.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "464814044908"
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore with network enabled
const db = initializeFirestore(app, {});
enableNetwork(db);

const auth = getAuth(app);

export { app, auth, db };
