
import { Timestamp } from "firebase/firestore";

export interface StudyMaterial {
    userId: string;
    title: string;
    content: string;
    createdAt: Timestamp;
}

export interface StudyMaterialWithId extends StudyMaterial {
    id: string;
}
