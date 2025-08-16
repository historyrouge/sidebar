
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
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc, updateDoc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { StudyMaterial, StudyMaterialWithId, UserProfile, Friend } from "@/lib/types";


type ActionResult<T> = {
  data?: T;
  error?: string;
};

export async function sendFriendRequestAction(email: string): Promise<ActionResult<{ success: boolean }>> {
    const user = auth.currentUser;
    if (!user) {
        return { error: "You must be logged in to send friend requests." };
    }
    if (user.email === email) {
        return { error: "You cannot send a friend request to yourself." };
    }

    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { error: "User with that email not found." };
        }

        const friendDoc = querySnapshot.docs[0];
        const friendId = friendDoc.id;

        const batch = writeBatch(db);

        // Add to sender's friends list with 'requested' status
        const senderFriendRef = doc(db, "users", user.uid, "friends", friendId);
        batch.set(senderFriendRef, { status: 'requested' });

        // Add to receiver's friends list with 'pending' status
        const receiverFriendRef = doc(db, "users", friendId, "friends", user.uid);
        batch.set(receiverFriendRef, { status: 'pending' });

        await batch.commit();

        return { data: { success: true } };

    } catch (e: any) {
        console.error("Error sending friend request: ", e);
        return { error: e.message || "Failed to send friend request." };
    }
}

export async function manageFriendRequestAction(friendId: string, action: 'accept' | 'decline'): Promise<ActionResult<{ success: boolean }>> {
    const user = auth.currentUser;
    if (!user) {
        return { error: "You must be logged in." };
    }

    try {
        const batch = writeBatch(db);

        const currentUserFriendRef = doc(db, "users", user.uid, "friends", friendId);
        const friendUserFriendRef = doc(db, "users", friendId, "friends", user.uid);

        if (action === 'accept') {
            batch.update(currentUserFriendRef, { status: 'accepted' });
            batch.update(friendUserFriendRef, { status: 'accepted' });
        } else { // decline
            batch.delete(currentUserFriendRef);
            batch.delete(friendUserFriendRef);
        }

        await batch.commit();
        return { data: { success: true } };

    } catch (e: any) {
        console.error("Error managing friend request: ", e);
        return { error: e.message || "Failed to manage friend request." };
    }
}


export async function getFriendsAction(): Promise<ActionResult<Friend[]>> {
    const user = auth.currentUser;
    if (!user) {
      return { error: "You must be logged in to see your friends." };
    }
  
    try {
      const friendsRef = collection(db, "users", user.uid, "friends");
      const friendsSnapshot = await getDocs(friendsRef);
      
      if (friendsSnapshot.empty) {
        return { data: [] };
      }
      
      const friendPromises = friendsSnapshot.docs.map(async (friendDoc) => {
        const friendId = friendDoc.id;
        const friendStatus = friendDoc.data().status;

        const userDocRef = doc(db, "users", friendId);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            return {
                id: friendId,
                name: userData.name || `User ${friendId.substring(0,5)}`,
                email: userData.email,
                photoURL: userData.photoURL,
                status: friendStatus,
            };
        }
        return null;
      });
  
      const friends = (await Promise.all(friendPromises)).filter(f => f !== null) as Friend[];
      
      return { data: friends };
    } catch (e: any) {
      console.error("Error getting friends: ", e);
      return { error: e.message || "Failed to retrieve friends." };
    }
}

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
            // Create a default profile if it doesn't exist
            const defaultProfile: UserProfile = {
                name: user.displayName || "ScholarSage User",
                college: "",
                favoriteSubject: ""
            };
             await setDoc(docRef, defaultProfile);
            return { data: defaultProfile };
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
