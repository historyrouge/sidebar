
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
