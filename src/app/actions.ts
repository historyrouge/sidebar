
"use server";

import { analyzeContent, AnalyzeContentOutput } from "@/ai/flows/analyze-content";
import { analyzeImageContent, AnalyzeImageContentInput, AnalyzeImageContentOutput as AnalyzeImageContentOutputFlow } from "@/ai/flows/analyze-image-content";
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput } from "@/ai/flows/chat-tutor";
import { generateFlashcards, GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateQuizzes, GenerateQuizzesOutput } from "@/ai/flows/generate-quizzes";
import { helpChat, HelpChatInput, HelpChatOutput } from "@/ai/flows/help-chatbot";
import { generalChat, GeneralChatInput, GeneralChatOutput } from "@/ai/flows/general-chat";
import { codeAgent, CodeAgentInput, CodeAgentOutput } from "@/ai/flows/code-agent";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from "@/ai/flows/text-to-speech";
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput } from "@/ai/flows/summarize-content";
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput } from "@/ai/flows/youtube-transcript";
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { StudyMaterial, StudyMaterialWithId, UserProfile } from "@/lib/types";


type ActionResult<T> = {
  data?: T;
  error?: string;
};

export async function getUserProfileAction(): Promise<ActionResult<UserProfile>> {
    const user = auth.currentUser;
    if (!user) {
        return { error: "You must be logged in to view your profile." };
    }

    try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { data: docSnap.data() as UserProfile };
        } else {
            // Return empty profile if it doesn't exist yet
            return { data: { name: "", college: "", favoriteSubject: "" } };
        }
    } catch (e: any) {
        console.error("Error getting user profile: ", e);
        return { error: e.message || "Failed to retrieve profile." };
    }
}

export async function updateUserProfile(profileData: UserProfile) {
    const user = auth.currentUser;
    if (!user) {
        return { error: "You must be logged in to update your profile." };
    }

    try {
        await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
        return { data: { success: true } };
    } catch (e: any) {
        console.error("Error updating user profile: ", e);
        return { error: e.message || "Failed to update profile." };
    }
}

export async function deleteUserAction(): Promise<ActionResult<{ success: boolean }>> {
    const user = auth.currentUser;
    if (!user) {
      return { error: "You must be logged in to delete your account." };
    }
  
    try {
      // Note: This only deletes the user record in Firestore.
      // The actual Firebase Auth user needs to be deleted client-side,
      // or with a backend function with elevated privileges.
      // For this app, we assume deletion means data deletion.
      // We will also delete their study materials.
      
      const q = query(collection(db, "studyMaterials"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user profile
      await deleteDoc(doc(db, "users", user.uid));
      
      // Ideally, you'd call user.delete() here, but it requires recent sign-in.
      // We will rely on the client to sign out.
  
      return { data: { success: true } };
    } catch (e: any) {
      console.error("Error deleting user account: ", e);
      return { error: e.message || "Failed to delete account." };
    }
}

export async function saveStudyMaterialAction(
    content: string, 
    title: string,
    materialId?: string | null
  ): Promise<ActionResult<{ id: string }>> {
    const user = auth.currentUser;
    if (!user) {
      return { error: "You must be logged in to save material." };
    }
  
    try {
      if (materialId) {
        const docRef = doc(db, "studyMaterials", materialId);
        await updateDoc(docRef, {
            title: title,
            content: content
        });
        return { data: { id: materialId } };
      } else {
        const docRef = await addDoc(collection(db, "studyMaterials"), {
            userId: user.uid,
            title: title,
            content: content,
            createdAt: serverTimestamp(),
        });
        return { data: { id: docRef.id } };
      }
    } catch (e: any) {
      console.error("Error saving document: ", e);
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

export async function analyzeImageContentAction(
    input: AnalyzeImageContentInput
): Promise<ActionResult<AnalyzeImageContentOutputFlow>> {
    try {
        const output = await analyzeImageContent(input);
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

export async function codeAgentAction(
    input: CodeAgentInput
    ): Promise<ActionResult<CodeAgentOutput>> {
    try {
        const output = await codeAgent(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "An unknown error occurred." };
    }
}


export async function textToSpeechAction(
  input: TextToSpeechInput
): Promise<ActionResult<TextToSpeechOutput>> {
  try {
    const output = await textToSpeech(input);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function summarizeContentAction(
    input: SummarizeContentInput
    ): Promise<ActionResult<SummarizeContentOutput>> {
    try {
        const output = await summarizeContent(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function getYoutubeTranscriptAction(
  input: GetYoutubeTranscriptInput
): Promise<ActionResult<GetYoutubeTranscriptOutput>> {
  try {
    const output = await getYoutubeTranscript(input);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}


export type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, ChatWithTutorInput, ChatWithTutorOutput, HelpChatInput, HelpChatOutput, GeneralChatInput, GeneralChatOutput, TextToSpeechOutput, SummarizeContentOutput, CodeAgentInput, CodeAgentOutput, UserProfile, GetYoutubeTranscriptOutput };
export type AnalyzeImageContentOutput = AnalyzeImageContentOutputFlow;
