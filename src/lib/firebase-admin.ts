
import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

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
    const cookieStore = cookies();
    const idToken = cookieStore.get('firebaseIdToken')?.value;
    
    if (!idToken) {
        console.error("No firebaseIdToken cookie found");
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
        console.error('Error verifying ID token:', error);
        return null;
    }
}


export const getDb = () => {
    if (admin.apps.length === 0) {
        throw new Error("Firebase Admin SDK is not initialized.");
    }
    return admin.firestore();
}
