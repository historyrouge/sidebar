

"use server";

import { analyzeContent, AnalyzeContentOutput } from "@/ai/flows/analyze-content";
import { analyzeImageContent, AnalyzeImageContentInput, AnalyzeImageContentOutput as AnalyzeImageContentOutputFlow } from "@/ai/flows/analyze-image-content";
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput } from "@/ai/flows/chat-tutor";
import { generateFlashcards, GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateQuizzes, GenerateQuizzesInput, GenerateQuizzesOutput } from "@/ai/flows/generate-quizzes";
import { helpChat, HelpChatInput, HelpChatOutput } from "@/ai/flows/help-chatbot";
import { generalChat, GeneralChatInput, GeneralChatOutput } from "@/ai/flows/general-chat";
import { codeAgent, CodeAgentInput, CodeAgentOutput } from "@/ai/flows/code-agent";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from "@/ai/flows/text-to-speech";
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput } from "@/ai/flows/summarize-content";
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput } from "@/ai/flows/youtube-transcript";
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc, setDoc, deleteDoc, writeBatch, documentId, and } from "firebase/firestore";
import { getDb } from "@/lib/firebase-admin";
import { getAuthenticatedUser } from "@/lib/firebase-admin";
import { StudyMaterial, StudyMaterialWithId, UserProfile, Friend } from "@/lib/types";


type ActionResult<T> = {
  data?: T;
  error?: string;
};

export async function sendFriendRequestAction(email: string): Promise<ActionResult<{ success: boolean }>> {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to send friend requests." };
        }

        if (currentUser.email === email) {
            return { error: "You cannot send a friend request to yourself." };
        }

        const db = getDb();
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { error: `User with email "${email}" not found. Please ensure you have entered the correct email.` };
        }

        const targetUserDoc = querySnapshot.docs[0];
        const targetUserId = targetUserDoc.id;
        const targetUserData = targetUserDoc.data();

        const currentUserFriendsRef = collection(db, `users/${currentUser.uid}/friends`);
        const targetUserFriendsRef = collection(db, `users/${targetUserId}/friends`);

        // Check if they are already friends or a request is pending
        const existingFriendship = await getDoc(doc(currentUserFriendsRef, targetUserId));
        if (existingFriendship.exists()) {
             const status = existingFriendship.data().status;
             if (status === 'accepted') return { error: "You are already friends with this user." };
             if (status === 'pending') return { error: "You have already received a request from this user." };
             if (status === 'requested') return { error: "You have already sent a request to this user." };
        }

        const batch = writeBatch(db);

        // Add to sender's friends list with 'requested' status
        batch.set(doc(currentUserFriendsRef, targetUserId), { 
            status: 'requested',
            email: targetUserData.email,
            name: targetUserData.name,
            photoURL: targetUserData.photoURL || ''
        });

        // Add to receiver's friends list with 'pending' status
        batch.set(doc(targetUserFriendsRef, currentUser.uid), {
             status: 'pending',
             email: currentUser.email,
             name: currentUser.name || "ScholarSage User",
             photoURL: currentUser.picture || ''
        });

        await batch.commit();

        return { data: { success: true } };

    } catch (e: any) {
        console.error("sendFriendRequestAction error:", e);
        if (e.code === 'failed-precondition') {
             return { error: "To enable this search, please create a composite index in your Firestore database. You can do this by visiting the link provided in the Firestore console error logs." };
        }
        return { error: e.message || "An unknown error occurred." };
    }
}


export async function manageFriendRequestAction(friendId: string, action: 'accept' | 'decline'): Promise<ActionResult<{ success: boolean }>> {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to manage friend requests." };
        }
        const db = getDb();
        const currentUserFriendsRef = collection(db, `users/${currentUser.uid}/friends`);
        const targetUserFriendsRef = collection(db, `users/${friendId}/friends`);

        const batch = writeBatch(db);

        if (action === 'accept') {
            batch.update(doc(currentUserFriendsRef, friendId), { status: 'accepted' });
            batch.update(doc(targetUserFriendsRef, currentUser.uid), { status: 'accepted' });
        } else { // decline
            batch.delete(doc(currentUserFriendsRef, friendId));
            batch.delete(doc(targetUserFriendsRef, currentUser.uid));
        }

        await batch.commit();
        return { data: { success: true } };
    } catch (e: any) {
        console.error("manageFriendRequestAction error:", e);
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function getFriendsAction(): Promise<ActionResult<Friend[]>> {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to view friends." };
        }
        
        const db = getDb();
        const friendsRef = collection(db, `users/${currentUser.uid}/friends`);
        const snapshot = await getDocs(friendsRef);
        
        const friends = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Friend[];

        return { data: friends };
    } catch (e: any) {
        console.error("getFriendsAction error:", e);
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function getUserProfileAction(): Promise<ActionResult<UserProfile>> {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to view your profile." };
        }
        const db = getDb();
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            return { error: "User profile not found." };
        }

        return { data: docSnap.data() as UserProfile };
    } catch (e: any) {
        console.error("getUserProfileAction error:", e);
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function updateUserProfile(profileData: Partial<UserProfile>) {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to update your profile." };
        }
        const db = getDb();
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, profileData);
        return { data: { success: true } };

    } catch (e: any) {
        console.error("updateUserProfile error:", e);
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function deleteUserAction(): Promise<ActionResult<{ success: boolean }>> {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to delete your account." };
        }
        const db = getDb();
        // This is a simplified deletion. A full implementation would need to handle
        // removing the user from friend lists, deleting their content, etc.
        // It might be better handled by a Firebase Function.
        const userRef = doc(db, "users", currentUser.uid);
        await deleteDoc(userRef);
        
        // Note: This does NOT delete the user from Firebase Auth.
        // That requires the Admin SDK and is best done in a secure backend environment.

        return { data: { success: true } };
    } catch (e: any) {
        console.error("deleteUserAction error:", e);
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function saveStudyMaterialAction(
    content: string, 
    title: string,
    materialId?: string | null
  ): Promise<ActionResult<{ id: string }>> {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to save materials." };
        }

        const db = getDb();
        const materialsRef = collection(db, "studyMaterials");
        
        if (materialId) {
            const materialRef = doc(db, "studyMaterials", materialId);
            const docSnap = await getDoc(materialRef);
            if (docSnap.exists() && docSnap.data().userId === currentUser.uid) {
                await updateDoc(materialRef, { content, title, updatedAt: serverTimestamp() });
                return { data: { id: materialId } };
            } else {
                // If it doesn't exist or user doesn't own it, create a new one.
                 const newDocRef = await addDoc(materialsRef, {
                    userId: currentUser.uid,
                    content,
                    title,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                return { data: { id: newDocRef.id } };
            }
        } else {
             const newDocRef = await addDoc(materialsRef, {
                userId: currentUser.uid,
                content,
                title,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return { data: { id: newDocRef.id } };
        }

    } catch (e: any) {
        console.error("saveStudyMaterialAction error:", e);
        return { error: e.message || "An unknown error occurred." };
    }
}
  
export async function getStudyMaterialsAction(): Promise<ActionResult<StudyMaterialWithId[]>> {
   try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to view materials." };
        }
        const db = getDb();
        const q = query(collection(db, "studyMaterials"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const materials = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudyMaterialWithId[];
        return { data: materials };
    } catch (e: any) {
        console.error("getStudyMaterialsAction error:", e);
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function getStudyMaterialByIdAction(id: string): Promise<ActionResult<StudyMaterial>> {
    try {
        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return { error: "You must be logged in to view materials." };
        }
        const db = getDb();
        const materialRef = doc(db, "studyMaterials", id);
        const docSnap = await getDoc(materialRef);

        if (!docSnap.exists() || docSnap.data().userId !== currentUser.uid) {
            return { error: "Material not found or you do not have permission to view it." };
        }

        return { data: docSnap.data() as StudyMaterial };
    } catch (e: any) {
        console.error("getStudyMaterialByIdAction error:", e);
        return { error: e.message || "An unknown error occurred." };
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
  input: GenerateQuizzesInput
): Promise<ActionResult<GenerateQuizzesOutput>> {
  try {
    const output = await generateQuizzes(input);
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


export type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, ChatWithTutorInput, ChatWithTutorOutput, HelpChatInput, HelpChatOutput, GeneralChatInput, GeneralChatOutput, TextToSpeechOutput, SummarizeContentOutput, CodeAgentInput, CodeAgentOutput, UserProfile, GetYoutubeTranscriptOutput, Friend };
export type AnalyzeImageContentOutput = AnalyzeImageContentOutputFlow;
