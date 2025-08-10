
"use server";

import { analyzeContent, AnalyzeContentOutput } from "@/ai/flows/analyze-content";
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput } from "@/ai/flows/chat-tutor";
import { generateFlashcards, GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { generateQuizzes, GenerateQuizzesOutput } from "@/ai/flows/generate-quizzes";
import { helpChat, HelpChatInput, HelpChatOutput } from "@/ai/flows/help-chatbot";
import { generalChat, GeneralChatInput, GeneralChatOutput } from "@/ai/flows/general-chat";

type ActionResult<T> = {
  data?: T;
  error?: string;
};

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
