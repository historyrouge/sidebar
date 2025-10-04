"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.app = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const firebaseConfig = {
    "projectId": "scholarsage-ue2av",
    "appId": "1:464814044908:web:f69d16aa7c8ed63814d7c9",
    "storageBucket": "scholarsage-ue2av.firebasestorage.app",
    "apiKey": "AIzaSyBBucBQ-1aHNNna0VckiW_AqMK5CSqul8k",
    "authDomain": "easylearnai.vercel.app",
    "measurementId": "",
    "messagingSenderId": "464814044908"
};
// Initialize Firebase
const app = (0, app_1.getApps)().length ? (0, app_1.getApp)() : (0, app_1.initializeApp)(firebaseConfig);
exports.app = app;
// Authentication is no longer used, but we keep the firestore instance for other potential features.
const db = (0, firestore_1.getFirestore)(app);
exports.db = db;
