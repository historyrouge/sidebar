
import * as admin from 'firebase-admin';
import { headers } from 'next/headers';

const initializeFirebaseAdmin = () => {
    if (admin.apps.length > 0) {
        return;
    }

    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount)),
                databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
            });
        } catch (e: any) {
            console.error('Firebase admin initialization error', e.stack);
        }
    } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT environment variable not set. Firebase Admin SDK not initialized.');
    }
}

initializeFirebaseAdmin();


export async function getAuthenticatedUser() {
    const headerList = headers();
    const idToken = headerList.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
        return null;
    }
    
    if (admin.apps.length === 0) {
       console.error("Firebase Admin SDK is not initialized. Cannot verify ID token.");
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


export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;

export const getDb = () => {
    if (!adminDb) {
        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
             throw new Error("Firebase service account is not configured. Set FIREBASE_SERVICE_ACCOUNT environment variable.");
        }
        initializeFirebaseAdmin();
        if(!adminDb) throw new Error("Firestore could not be initialized after attempting to re-initialize.");
    }
    return adminDb;
}
