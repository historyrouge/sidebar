
"use server";

import { analyzeContent, AnalyzeContentOutput } from "@/ai/flows/analyze-content";
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput } from "@/ai/flows/chat-tutor";
import { generateFlashcards, GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateQuizzes, GenerateQuizzesOutput } from "@/ai/flows/generate-quizzes";
import { helpChat, HelpChatInput, HelpChatOutput } from "@/ai/flows/help-chatbot";
import { generalChat, GeneralChatInput, GeneralChatOutput } from "@/ai/flows/general-chat";
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { StudyMaterial, StudyMaterialWithId } from "@/lib/types";


type ActionResult<T> = {
  data?: T;
  error?: string;
};

export async function saveStudyMaterialAction(
    content: string, 
    title: string
  ): Promise<ActionResult<{ id: string }>> {
    const user = auth.currentUser;
    if (!user) {
      return { error: "You must be logged in to save material." };
    }
  
    try {
      const docRef = await addDoc(collection(db, "studyMaterials"), {
        userId: user.uid,
        title: title,
        content: content,
        createdAt: serverTimestamp(),
      });
      return { data: { id: docRef.id } };
    } catch (e: any) {
      console.error("Error adding document: ", e);
      return { error: e.message || "Failed to save study material." };
    }
}
  
export async function getStudyMaterialsAction(): Promise<ActionResult<StudyMaterialWithId[]>> {
    const user = auth.currentUser;
    if (!user) {
        return { error: "You must be logged in to view materials." };
    }

    try {
        const q = query(collection(db, "studyMaterials"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const materials = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as StudyMaterial)
        }));
        return { data: materials };
    } catch (e: any) {
        console.error("Error getting documents: ", e);
        return { error: e.message || "Failed to retrieve study materials." };
    }
}

export async function getStudyMaterialByIdAction(id: string): Promise<ActionResult<StudyMaterial>> {
    const user = auth.currentUser;
    if (!user) {
      return { error: "You must be logged in to view this material." };
    }
  
    try {
      const docRef = doc(db, "studyMaterials", id);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const material = docSnap.data() as StudyMaterial;
        if (material.userId !== user.uid) {
            return { error: "You do not have permission to view this material." };
        }
        return { data: material };
      } else {
        return { error: "No such document!" };
      }
    } catch (e: any) {
      console.error("Error getting document:", e);
      return { error: e.message || "Failed to retrieve study material." };
    }
}


export async function analyzeContentAction(
  content: string
): Promise<ActionResult<AnalyzeContentOutput>> {
  try {
    const output = await analyzeContent({ content });
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function generateFlashcardsAction(
  content: string
): Promise<ActionResult<GenerateFlashcardsOutput>> {
  try {
    const output = await generateFlashcards({ content });
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function generateQuizAction(
  content: string
): Promise<ActionResult<GenerateQuizzesOutput>> {
  try {
    const output = await generateQuizzes({ content });
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function chatWithTutorAction(
  input: ChatWithTutorInput
): Promise<ActionResult<ChatWithTutorOutput>> {
  try {
    const output = await chatWithTutor(input);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function helpChatAction(
    input: HelpChatInput
  ): Promise<ActionResult<HelpChatOutput>> {
    try {
      const output = await helpChat(input);
      return { data: output };
    } catch (e: any) {
      console.error(e);
      return { error: e.message || "An unknown error occurred." };
    }
}

export async function generalChatAction(
    input: GeneralChatInput
    ): Promise<ActionResult<GeneralChatOutput>> {
    try {
        const output = await generalChat(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "An unknown error occurred." };
    }
}

export type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, ChatWithTutorInput, ChatWithTutorOutput, HelpChatInput, HelpChatOutput, GeneralChatInput, GeneralChatOutput };
