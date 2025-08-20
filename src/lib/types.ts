
import { Timestamp } from "firebase/firestore";

export interface StudyMaterial {
    userId: string;
    title: string;
    content: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface StudyMaterialWithId extends StudyMaterial {
    id: string;
}

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    college: string;
    favoriteSubject: string;
    photoURL?: string;
}

export interface Friend {
    id: string; // The UID of the friend
    name: string;
    email: string;
    photoURL?: string;
    status: 'pending' | 'accepted' | 'requested';
    // Timestamps can be null if the document is new and being created through a listener
    createdAt?: Timestamp | null;
    updatedAt?: Timestamp | null;
}
