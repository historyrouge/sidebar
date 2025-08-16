
import * as admin from 'firebase-admin';
import { headers } from 'next/headers';

const initializeFirebaseAdmin = () => {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount && !admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount)),
                databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
            });
        } catch (e: any) {
            console.error('Firebase admin initialization error', e.stack);
        }
    }
}

initializeFirebaseAdmin();


export async function getAuthenticatedUser() {
    const headerList = headers();
    const idToken = headerList.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        return null;
    }

    if (!admin.apps.length) {
        console.error('Firebase admin is not initialized');
        return null;
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
}

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

if (admin.apps.length) {
    db = admin.firestore();
    auth = admin.auth();
}

export const adminDb = db;
export const adminAuth = auth;
