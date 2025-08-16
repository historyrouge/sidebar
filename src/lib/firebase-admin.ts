
import * as admin from 'firebase-admin';
import { headers } from 'next/headers';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
    if (!serviceAccount) {
        throw new Error('Firebase service account is not configured. Set FIREBASE_SERVICE_ACCOUNT environment variable.');
    }
    admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
        databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
    });
}


export async function getAuthenticatedUser() {
    const headerList = headers();
    const idToken = headerList.get('Authorization')?.split('Bearer ')[1];

    if (!idToken) {
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

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
