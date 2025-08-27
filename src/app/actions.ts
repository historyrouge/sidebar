
"use server";

import { analyzeContent, AnalyzeContentOutput as AnalyzeContentOutputFlow } from "@/ai/flows/analyze-content";
import { analyzeImageContent, AnalyzeImageContentInput, AnalyzeImageContentOutput as AnalyzeImageContentOutputFlow } from "@/ai/flows/analyze-image-content";
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput as ChatWithTutorOutputFlow } from "@/ai/flows/chat-tutor";
import { generateFlashcardsSamba, GenerateFlashcardsSambaOutput as GenerateFlashcardsSambaOutputFlow, GenerateFlashcardsInput } from "@/ai/flows/generate-flashcards-samba";
import { generateQuizzes, GenerateQuizzesInput, GenerateQuizzesOutput as GenerateQuizzesOutputFlow } from "@/ai/flows/generate-quizzes";
import { helpChat, HelpChatInput, HelpChatOutput as HelpChatOutputFlow } from "@/ai/flows/help-chatbot";
import { generalChat, GeneralChatInput as GeneralChatInputFlow, GeneralChatOutput as GeneralChatOutputFlow } from "@/ai/flows/general-chat";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput as TextToSpeechOutputFlow } from "@/ai/flows/text-to-speech";
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput as SummarizeContentOutputFlow } from "@/ai/flows/summarize-content";
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput as GetYoutubeTranscriptOutputFlow } from "@/ai/flows/youtube-transcript";
import { generateImage, GenerateImageInput, GenerateImageOutput as GenerateImageOutputFlow } from "@/ai/flows/generate-image";
import { generateEbookChapter, GenerateEbookChapterInput, GenerateEbookChapterOutput as GenerateEbookChapterOutputFlow } from "@/ai/flows/generate-ebook-chapter";
import { openai } from "@/lib/openai";
import type { ModelKey } from "@/hooks/use-model-settings";

// Extend GeneralChatInput to include an optional prompt for specific scenarios
export type GeneralChatInput = GeneralChatInputFlow & {
  prompt?: string;
};


type ActionResult<T> = {
  data?: T;
  error?: string;
};

// Re-exporting types for client components
export type AnalyzeContentOutput = AnalyzeContentOutputFlow;
export type AnalyzeImageContentOutput = AnalyzeImageContentOutputFlow;
export type GenerateFlashcardsOutput = GenerateFlashcardsSambaOutputFlow;
export type GenerateQuizzesOutput = GenerateQuizzesOutputFlow;
export type ChatWithTutorOutput = ChatWithTutorOutputFlow;
export type HelpChatOutput = HelpChatOutputFlow;
export type GeneralChatOutput = GeneralChatOutputFlow;
export type TextToSpeechOutput = TextToSpeechOutputFlow;
export type SummarizeContentOutput = SummarizeContentOutputFlow;
export type GenerateImageOutput = GenerateImageOutputFlow;
export type GetYoutubeTranscriptOutput = GetYoutubeTranscriptOutputFlow;
export type GenerateEbookChapterOutput = GenerateEbookChapterOutputFlow;

function isRateLimitError(e: any): boolean {
  if (e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('limit')) {
    return true;
  }
  return false;
}

export async function analyzeContentAction(
  content: string
): Promise<ActionResult<AnalyzeContentOutput>> {
  try {
    // Analysis is always done by Gemini for its structured output capabilities
    const output = await analyzeContent({ content });
    return { data: output };
  } catch (e: any) {
    console.error(e);
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function analyzeImageContentAction(
    input: AnalyzeImageContentInput
): Promise<ActionResult<AnalyzeImageContentOutput>> {
    try {
        const output = await analyzeImageContent(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function generateFlashcardsAction(
  input: GenerateFlashcardsInput
): Promise<ActionResult<GenerateFlashcardsSambaOutputFlow>> {
  try {
    const output = await generateFlashcardsSamba(input);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
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
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
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
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
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
      if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
      return { error: e.message || "An unknown error occurred." };
    }
}

const MODEL_MAP: Record<Exclude<ModelKey, 'puter'>, string> = {
  gemini: 'googleai/gemini-1.5-flash-latest',
  samba: 'Llama-4-Maverick-17B-128E-Instruct',
};

async function callOpenAI(input: GeneralChatInput): Promise<ActionResult<GeneralChatOutput>> {
  const { history, imageDataUri, prompt } = input;
  
  const messages = history.map((h, i) => {
    const isLastMessage = i === history.length - 1;
    const role = h.role === 'model' ? 'assistant' : 'user';

    let content = h.content;
    // If it's the last user message and there's a custom prompt, prepend it.
    if (isLastMessage && h.role === 'user' && prompt) {
        content = `${prompt}\n\nUser query: ${h.content}`;
    }

    // If it's the last message and an image is present, create a multi-part content
    if (isLastMessage && imageDataUri) {
      return {
        role,
        content: [
          { type: 'text', text: content || 'What do you see in this image?' },
          { type: 'image_url', image_url: { url: imageDataUri } },
        ],
      };
    }

    // Otherwise, just return the text content
    return { role, content: content };
  });

  try {
    const response = await openai.chat.completions.create({
      model: MODEL_MAP.samba,
      messages: messages as any,
      stream: false,
    });

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
      throw new Error("Received an empty response from the AI.");
    }
    
    return { data: { response: response.choices[0].message.content } };
  } catch (error: any) {
    console.error("SambaNova API error:", error);
    if (isRateLimitError(error)) return { error: "API_LIMIT_EXCEEDED" };
    if (error.code === 'ENOTFOUND') {
      return { error: "Could not connect to the SambaNova API. Please check the Base URL." };
    }
    return { error: error.message || "An unknown error occurred with the SambaNova API." };
  }
}

export async function generalChatAction(
    input: GeneralChatInput,
    model: ModelKey
): Promise<ActionResult<GeneralChatOutput>> {
    if (model === 'samba') {
      if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        return { error: "SambaNova API key or base URL is not configured. Please add it in the settings or select a different model." };
      }
      return callOpenAI(input);
    }

    if (model === 'puter') {
      // Puter.js is handled client-side, this action should not be called.
      return { error: "Puter.js cannot be called from the server." };
    }
    
    // Default to Gemini
    try {
        const { history, imageDataUri, prompt } = input;
        
        let flowInput = { history, imageDataUri };

        // If there's a custom prompt and it's the first message, prepend it to the user's message.
        if (prompt && history.length > 0) {
            const lastMessage = history[history.length - 1];
            if (lastMessage.role === 'user') {
                const modifiedHistory = [...history.slice(0, -1), {
                    ...lastMessage,
                    content: `${prompt}\n\nUser query: ${lastMessage.content}`
                }];
                flowInput = { ...flowInput, history: modifiedHistory };
            }
        }

        const output = await generalChat(flowInput);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
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
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function summarizeContentAction(
    input: SummarizeContentInput
    ): Promise<ActionResult<SummarizeContentOutput>> {
    try {
        const output = await summarizeContent(input);
        return { data: output };
    } catch (e: any)
        {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
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
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
    return { error: e.message || "An unexpected error occurred while fetching the transcript." };
  }
}

export async function generateImageAction(
  input: GenerateImageInput
): Promise<ActionResult<GenerateImageOutput>> {
  try {
    const output = await generateImage(input);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function generateEbookChapterAction(
  input: GenerateEbookChapterInput
): Promise<ActionResult<GenerateEbookChapterOutput>> {
    try {
        const output = await generateEbookChapter(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error occurred." };
    }
}

// Dummy types for exports where the original type is no longer relevant
export type UserProfile = {};
export type Friend = {};
// Dummy type for removed feature
export type CodeAgentOutput = {};
export type CodeAgentInput = {};


export type { GetYoutubeTranscriptInput, GenerateQuizzesInput, GenerateFlashcardsInput, ChatWithTutorInput, HelpChatInput, TextToSpeechInput, SummarizeContentInput, GenerateImageInput, ModelKey, GenerateEbookChapterInput };
