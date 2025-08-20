
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

// NOTE: All functions that required user authentication have been removed or disabled.
// This includes managing friends, profiles, and saving study materials to an account.

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
  } catch (e: any)
    {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

// Dummy types for exports where the original type is no longer relevant
export type UserProfile = {};
export type Friend = {};

export type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, ChatWithTutorInput, ChatWithTutorOutput, HelpChatInput, HelpChatOutput, GeneralChatInput, GeneralChatOutput, TextToSpeechOutput, SummarizeContentOutput, CodeAgentInput, CodeAgentOutput, GetYoutubeTranscriptOutput };
export type AnalyzeImageContentOutput = AnalyzeImageContentOutputFlow;
