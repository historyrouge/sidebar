
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import crypto from 'crypto';

async function verifyIdToken(token: string) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Error verifying Firebase ID token:", error);
        return null;
    }
}

export async function POST(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(idToken);

    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { uid } = decodedToken;

    try {
        // Generate a cryptographically secure API key
        const apiKey = `sk-${crypto.randomBytes(24).toString('hex')}`;
        
        // Hash the API key before storing it
        const hash = crypto.createHash('sha256').update(apiKey).digest('hex');

        // Store the hash in Firestore
        const keysCollection = collection(db, 'users', uid, 'apiKeys');
        await addDoc(keysCollection, {
            keyHash: hash,
            createdAt: serverTimestamp(),
            lastUsed: null,
            isActive: true,
        });

        // Return the full key to the user ONCE.
        return NextResponse.json({ key: apiKey }, { status: 200 });

    } catch (error) {
        console.error("API key generation error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
