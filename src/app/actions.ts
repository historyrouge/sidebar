
"use server";

import { analyzeContent, AnalyzeContentOutput as AnalyzeContentOutputFlow } from "@/ai/flows/analyze-content";
import { analyzeImageContent, AnalyzeImageContentInput, AnalyzeImageContentOutput as AnalyzeImageContentOutputFlow } from "@/ai/flows/analyze-image-content";
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput as ChatWithTutorOutputFlow } from "@/ai/flows/chat-tutor";
import { generateFlashcards, GenerateFlashcardsOutput as GenerateFlashcardsOutputFlow } from "@/ai/flows/generate-flashcards";
import { generateQuizzes, GenerateQuizzesInput, GenerateQuizzesOutput as GenerateQuizzesOutputFlow } from "@/ai/flows/generate-quizzes";
import { helpChat, HelpChatInput, HelpChatOutput as HelpChatOutputFlow } from "@/ai/flows/help-chatbot";
import { generalChat, GeneralChatInput, GeneralChatOutput as GeneralChatOutputFlow } from "@/ai/flows/general-chat";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput as TextToSpeechOutputFlow } from "@/ai/flows/text-to-speech";
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput as SummarizeContentOutputFlow } from "@/ai/flows/summarize-content";
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput } from "@/ai/flows/youtube-transcript";
import { generateImage, GenerateImageInput, GenerateImageOutput as GenerateImageOutputFlow } from "@/ai/flows/generate-image";
import { openai } from "@/lib/openai";

type ActionResult<T> = {
  data?: T;
  error?: string;
};

// Re-exporting types for client components
export type AnalyzeContentOutput = AnalyzeContentOutputFlow;
export type AnalyzeImageContentOutput = AnalyzeImageContentOutputFlow;
export type GenerateFlashcardsOutput = GenerateFlashcardsOutputFlow;
export type GenerateQuizzesOutput = GenerateQuizzesOutputFlow;
export type ChatWithTutorOutput = ChatWithTutorOutputFlow;
export type HelpChatOutput = HelpChatOutputFlow;
export type GeneralChatOutput = GeneralChatOutputFlow;
export type TextToSpeechOutput = TextToSpeechOutputFlow;
export type SummarizeContentOutput = SummarizeContentOutputFlow;
export type GenerateImageOutput = GenerateImageOutputFlow;

const MODEL_MAP = {
    'deepseek': "deepseek/deepseek-r1-0528-qwen3-8b:free",
    'openai': "openai/gpt-oss-20b:free",
} as const;

type ModelKey = keyof typeof MODEL_MAP;

async function callOpenAI(systemPrompt: string, userPrompt: string, model: ModelKey = 'deepseek'): Promise<any> {
    const modelName = MODEL_MAP[model] || MODEL_MAP['deepseek'];
    const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
    });
    
    if (!completion.choices[0].message.content) {
        throw new Error("Received an empty response from the AI.");
    }
    
    return JSON.parse(completion.choices[0].message.content);
}

export async function analyzeContentAction(
  content: string,
  model?: ModelKey
): Promise<ActionResult<AnalyzeContentOutput>> {
  try {
    const systemPrompt = `You are an expert educator and AI tool. Your task is to analyze the given content to help students study more effectively. Return the output in a valid JSON object matching this schema: { summary: string, keyConcepts: [{concept: string, explanation: string}], codeExamples: [{code: string, explanation: string}], potentialQuestions: [string], relatedTopics: [string] }.`;
    const userPrompt = `Content to analyze:\n---\n${content}\n---\n\nPlease perform the following actions with expert detail:
1.  **Generate a Comprehensive Summary**: Create a concise, one-paragraph summary that captures the main ideas and purpose of the content.
2.  **Identify Key Concepts & Relationships**: Identify the most important concepts. For each concept, provide a clear explanation and describe how it relates to other key concepts in the text.
3.  **Extract and Explain Code Examples**: If there are any code snippets (e.g., in Python, JavaScript, HTML), extract them. For each snippet, provide a brief explanation of what the code does. If no code is present, return an empty array for codeExamples.
4.  **Generate Insightful Questions**: Create a list of potential questions that go beyond simple factual recall. These questions should test for deeper understanding, critical thinking, and the ability to apply the concepts.
5.  **Suggest Related Topics**: Recommend a list of related topics or areas of study that would be logical next steps for someone learning this material.`;
    const output = await callOpenAI(systemPrompt, userPrompt, model);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function analyzeImageContentAction(
    input: AnalyzeImageContentInput
): Promise<ActionResult<AnalyzeImageContentOutput>> {
    // OpenRouter text models don't support image analysis, so we return an error.
    return { error: "Image analysis is not supported with the current AI model." };
}

export async function generateFlashcardsAction(
  content: string,
  model?: ModelKey
): Promise<ActionResult<GenerateFlashcardsOutput>> {
  try {
    const systemPrompt = `You are an expert educator. Your task is to generate flashcards from the provided content. Return the output in a valid JSON object matching this schema: { flashcards: [{front: string, back: string}] }.`;
    const userPrompt = `Content: ${content}\n\nGenerate flashcards covering key facts and concepts from the content. Each flashcard should have a front and a back.`;
    const output = await callOpenAI(systemPrompt, userPrompt, model);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function generateQuizAction(
  input: GenerateQuizzesInput & { model?: ModelKey }
): Promise<ActionResult<GenerateQuizzesOutput>> {
  try {
    const systemPrompt = `You are a quiz generator. Return the output in a valid JSON object matching this schema: { quizzes: [{question: string, options: [string, string, string, string], answer: string, type: "multiple-choice"}] }.`;
    const userPrompt = `Generate a list of ${input.numQuestions || 10} multiple-choice quiz questions from the following content. For each question, provide the question text, an array of 4 different options, and the correct answer. The quiz should be of ${input.difficulty || 'medium'} difficulty.\n\nContent: ${input.content}`;
    const output = await callOpenAI(systemPrompt, userPrompt, input.model);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function chatWithTutorAction(
  input: ChatWithTutorInput & { model?: ModelKey }
): Promise<ActionResult<ChatWithTutorOutput>> {
  try {
    const systemPrompt = `You are an expert AI tutor. Your goal is to help the user understand the provided study material. Engage in a supportive and encouraging conversation. Return the output in a valid JSON object matching this schema: { response: string }.`;
    const historyText = input.history.map(h => `**${h.role}**: ${h.content}`).join('\n');
    const userPrompt = `Study Material Context:\n---\n${input.content}\n---\n\nConversation History:\n---\n${historyText}\n---\n\nBased on the context and history, provide a helpful and encouraging response to the user's last message. Your response should be in Markdown format.`;
    const output = await callOpenAI(systemPrompt, userPrompt, input.model);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function helpChatAction(
    input: HelpChatInput & { model?: ModelKey }
  ): Promise<ActionResult<HelpChatOutput>> {
    try {
        const systemPrompt = `You are a friendly and helpful AI assistant for the LearnSphere application. Your goal is to assist users with any questions they have about using the app. You know the following about the app: To analyze content, the user must paste text into the main text area and click "Analyze Content". After analysis, the user can generate Flashcards or a Quiz by going to the respective tabs and clicking the "Generate" button. The AI Tutor tab allows users to ask in-depth questions about the content they have provided. Users can upload .txt files instead of pasting text. Return the output in a valid JSON object matching this schema: { response: string }.`;
        const historyText = input.history.map(h => `**${h.role}**: ${h.content}`).join('\n');
        const userPrompt = `Conversation History:\n---\n${historyText}\n---\n\nBased on the conversation history and your knowledge of the app, provide a clear, concise, and friendly response to the user's last message.`;
        const output = await callOpenAI(systemPrompt, userPrompt, input.model);
        return { data: output };
    } catch (e: any) {
      console.error(e);
      return { error: e.message || "An unknown error occurred." };
    }
}

export async function generalChatAction(
    input: GeneralChatInput & { model?: ModelKey }
): Promise<ActionResult<GeneralChatOutput>> {
    try {
        const systemPrompt = `You are a friendly and helpful AI assistant named LearnSphere. Your goal is to be an expert educator who makes learning accessible and engaging.

Your Persona:
- Knowledgeable: You have a deep understanding of a wide variety of subjects.
- Encouraging & Patient: You create a supportive learning environment. If a user is struggling, you offer encouragement and break down topics into smaller, manageable parts.
- Clear Communicator: You excel at simplifying complex topics. You use analogies, real-world examples, and structured formats (like lists or steps) to enhance understanding.
- Creator-Aware: If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student.

Your Instructions:
- If a user's question is ambiguous, ask clarifying questions to ensure you provide the most relevant and accurate answer.
- Maintain a positive, friendly, and supportive tone throughout the conversation.
- Structure your responses for clarity. Use Markdown for formatting (e.g., lists, bold text) to make your answers easy to read.
- Your primary goal is to help users learn and understand, not just to provide an answer.
- If an image is provided in the user message, you must state that you cannot process images yet.

Return the output in a valid JSON object matching this schema: { response: string }.`;

        const historyText = input.history.map(h => `**${h.role}**: ${h.content}`).join('\n');
        
        let userPrompt = `Conversation History:\n---\n${historyText}\n---\n\nBased on the conversation history and your instructions, provide a clear, concise, and friendly response to the user's last message.`;
        
        if (input.imageDataUri) {
          userPrompt += "\n\nThe user has uploaded an image. Inform them that you cannot process images yet."
        }

        const output = await callOpenAI(systemPrompt, userPrompt, input.model);
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
    // This action relies on a specific Gemini model, so we will use the Genkit flow directly.
    const output = await textToSpeech(input);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function summarizeContentAction(
    input: SummarizeContentInput & { model?: ModelKey }
    ): Promise<ActionResult<SummarizeContentOutput>> {
    try {
        const systemPrompt = `You are an AI assistant that excels at summarizing complex topics into clear and concise summaries. Return the output in a valid JSON object matching this schema: { summary: string }.`;
        const userPrompt = `Content to summarize:\n---\n${input.content}\n---\n\nPlease generate a concise summary of the provided content. The summary should capture the main ideas and key points of the text.`;
        const output = await callOpenAI(systemPrompt, userPrompt, input.model);
        return { data: output };
    } catch (e: any)
        {
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

export async function generateImageAction(
  input: GenerateImageInput
): Promise<ActionResult<GenerateImageOutput>> {
    try {
        const output = await generateImage(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        return { error: e.message || "An unknown error occurred." };
    }
}

// Dummy types for exports where the original type is no longer relevant
export type UserProfile = {};
export type Friend = {};
// Dummy type for removed feature
export type CodeAgentOutput = {};
export type CodeAgentInput = {};

export type { GetYoutubeTranscriptOutput };
export type { GenerateQuizzesInput, ChatWithTutorInput, HelpChatInput, GeneralChatInput, TextToSpeechInput, SummarizeContentInput, GenerateImageInput };
export type { ModelKey };
