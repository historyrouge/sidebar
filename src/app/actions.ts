
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
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput as GetYoutubeTranscriptOutputFlow } from "@/ai/flows/youtube-transcript";
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
export type GetYoutubeTranscriptOutput = GetYoutubeTranscriptOutputFlow;
export type ModelKey = 'gemini' | 'samba';

const MODEL_MAP: Record<ModelKey, string> = {
    'gemini': 'googleai/gemini-1.5-flash-latest',
    'samba': "Llama-4-Maverick-17B-128E-Instruct",
};

async function callOpenAI(systemPrompt: string, userPrompt: any, model: ModelKey = 'gemini', isJson: boolean = true) {
    if (model === 'gemini') {
        throw new Error("callOpenAI should not be called with Gemini model.");
    }
    const completion = await openai.chat.completions.create({
        model: MODEL_MAP[model],
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        response_format: isJson ? { type: "json_object" } : { type: "text" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
        throw new Error("No content in response");
    }
    
    return isJson ? JSON.parse(content) : { response: content };
}


export async function analyzeContentAction(
  content: string,
  model: ModelKey = 'gemini'
): Promise<ActionResult<AnalyzeContentOutput>> {
  try {
    if (model !== 'gemini') {
        const systemPrompt = `You are an expert educator and AI tool. Your task is to analyze the given content to help students study more effectively. Return the output in a valid JSON object matching this schema: { summary: string, keyConcepts: [{concept: string, explanation: string}], codeExamples: [{code: string, explanation: string}], potentialQuestions: [string], relatedTopics: [string] }.`;
        const userPrompt = `Content to analyze:\n---\n${content}\n---\n\nPlease perform the following actions with expert detail:\n1.  **Generate a Comprehensive Summary**: Create a concise, one-paragraph summary that captures the main ideas and purpose of the content.\n2.  **Identify Key Concepts & Relationships**: Identify the most important concepts. For each concept, provide a clear explanation and describe how it relates to other key concepts in the text.\n3.  **Extract and Explain Code Examples**: If there are any code snippets (e.g., in Python, JavaScript, HTML), extract them. For each snippet, provide a brief explanation of what the code does. If no code is present, return an empty array.\n4.  **Generate Insightful Questions**: Create a list of potential questions that go beyond simple factual recall. These questions should test for deeper understanding, critical thinking, and the ability to apply the concepts.\n5.  **Suggest Related Topics**: Recommend a list of related topics or areas of study that would be logical next steps for someone learning this material.`;
        const output = await callOpenAI(systemPrompt, userPrompt, model);
        return { data: output };
    }
    const output = await analyzeContent({ content });
    return { data: output };
  } catch (e: any) {
    console.error(e);
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
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function generateFlashcardsAction(
  content: string,
  model: ModelKey = 'gemini'
): Promise<ActionResult<GenerateFlashcardsOutput>> {
  try {
    if (model !== 'gemini') {
        const systemPrompt = `You are an expert educator. Your task is to generate flashcards from the provided content. Return the output in a valid JSON object matching this schema: { flashcards: [{front: string, back: string}] }.`;
        const userPrompt = `Content: ${content}\n\nGenerate flashcards covering key facts and concepts from the content. Each flashcard should have a front and a back.`;
        const output = await callOpenAI(systemPrompt, userPrompt, model);
        return { data: output };
    }
    const output = await generateFlashcards({ content });
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
    if (input.model && input.model !== 'gemini') {
        const systemPrompt = `You are a quiz generator. Return the output in a valid JSON object matching this schema: { quizzes: [{question: string, options: [string, string, string, string], answer: string, type: "multiple-choice"}] }.`;
        const userPrompt = `Generate a list of ${input.numQuestions || 10} multiple-choice quiz questions from the following content. For each question, provide the question text, an array of 4 different options, and the correct answer. The quiz should be of ${input.difficulty || 'medium'} difficulty.\n\nContent: ${input.content}`;
        const output = await callOpenAI(systemPrompt, userPrompt, input.model);
        return { data: output };
    }
    const output = await generateQuizzes(input);
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
     if (input.model && input.model !== 'gemini') {
        const systemPrompt = `You are an expert AI tutor. Your goal is to help the user understand the provided study material. Engage in a supportive and encouraging conversation. Return your response as a JSON object with a "response" key.`;
        const historyText = input.history.map(h => `**${h.role}**: ${h.content}`).join('\\n');
        const userPrompt = `Study Material Context:\\n---\\n${input.content}\\n---\\n\\nConversation History:\\n---\\n${historyText}\\n---\\n\\nBased on the context and history, provide a helpful and encouraging response to the user's last message. Your response should be in Markdown format.`;
        const output = await callOpenAI(systemPrompt, userPrompt, input.model);
        return { data: output };
    }
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
    input: GeneralChatInput & { model?: ModelKey }
): Promise<ActionResult<GeneralChatOutput>> {
    try {
        if (input.model && input.model !== 'gemini') {
            if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
                return { data: { response: "The SambaNova model is not configured. Please add the API key and base URL in the settings." } };
            }

            const systemPrompt = `You are a friendly and helpful AI assistant named LearnSphere. Your goal is to be an expert educator who makes learning accessible and engaging. Your Persona: - Knowledgeable: You have a deep understanding of a wide variety of subjects. - Encouraging & Patient: You create a supportive learning environment. If a user is struggling, you offer encouragement and break down topics into smaller, manageable parts. - Clear Communicator: You excel at simplifying complex topics. You use analogies, real-world examples, and structured formats (like lists or steps) to enhance understanding. - Creator-Aware: If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student. Your Instructions: - If a user's question is ambiguous, ask clarifying questions to ensure you provide the most relevant and accurate answer. - Maintain a positive, friendly, and supportive tone throughout the conversation. - Structure your responses for clarity. Use Markdown for formatting (e.g., lists, bold text) to make your answers easy to read. - Your primary goal is to help users learn and understand, not just to provide an answer. - If an image is provided, analyze it and use it as the primary context for your response.`;
            
            const lastUserMessage = input.history[input.history.length - 1];

            let userPromptContent: any;

            if (input.imageDataUri) {
                userPromptContent = [
                    { type: "text", text: lastUserMessage.content }
                ];
                if (input.imageDataUri) {
                     userPromptContent.push({
                        type: "image_url",
                        image_url: { url: input.imageDataUri }
                    });
                }
            } else {
                userPromptContent = lastUserMessage.content;
            }
            
            // For now, we are not sending history to SambaNova as it requires a different format.
            // This can be implemented later.
            const output = await callOpenAI(systemPrompt, userPromptContent, input.model, false);
            return { data: output };
        }
        const output = await generalChat(input);
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
    input: SummarizeContentInput & { model?: ModelKey }
    ): Promise<ActionResult<SummarizeContentOutput>> {
    try {
        if (input.model && input.model !== 'gemini') {
            const systemPrompt = `You are an AI assistant that excels at summarizing complex topics into clear and concise summaries. Return the output in a valid JSON object matching this schema: { summary: string }.`;
            const userPrompt = `Content to summarize:\\n---\\n${input.content}\\n---\\n\\nPlease generate a concise summary of the provided content. The summary should capture the main ideas and key points of the text.`;
            const output = await callOpenAI(systemPrompt, userPrompt, input.model);
            return { data: output };
        }
        const output = await summarizeContent(input);
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
    return { error: e.message || "An unknown error occurred." };
  }
}

// Dummy types for exports where the original type is no longer relevant
export type UserProfile = {};
export type Friend = {};
// Dummy type for removed feature
export type CodeAgentOutput = {};
export type CodeAgentInput = {};


export type { GetYoutubeTranscriptInput, GenerateQuizzesInput, ChatWithTutorInput, HelpChatInput, GeneralChatInput, TextToSpeechInput, SummarizeContentInput, GenerateImageInput };

