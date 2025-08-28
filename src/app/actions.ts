
"use server";

import { analyzeContent, AnalyzeContentOutput as AnalyzeContentOutputFlow } from "@/ai/flows/analyze-content";
import { analyzeImageContent, AnalyzeImageContentInput, AnalyzeImageContentOutput as AnalyzeImageContentOutputFlow } from "@/ai/flows/analyze-image-content";
import { generateFlashcardsSamba, GenerateFlashcardsSambaOutput as GenerateFlashcardsSambaOutputFlow, GenerateFlashcardsSambaInput } from "@/ai/flows/generate-flashcards-samba";
import { generateQuizzes, GenerateQuizzesOutput as GenerateQuizzesOutputFlow } from "@/ai/flows/generate-quizzes";
import { generateQuizzesSamba, GenerateQuizzesSambaInput, GenerateQuizzesSambaOutput as GenerateQuizzesSambaOutputFlow } from "@/ai/flows/generate-quizzes-samba";
import { helpChat, HelpChatInput, HelpChatOutput as HelpChatOutputFlow } from "@/ai/flows/help-chatbot";
import { generalChat, GeneralChatInput as GeneralChatInputFlow, GeneralChatOutput as GeneralChatOutputFlow } from "@/ai/flows/general-chat";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput as TextToSpeechOutputFlow } from "@/ai/flows/text-to-speech";
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput as GetYoutubeTranscriptOutputFlow } from "@/ai/flows/youtube-transcript";
import { generateImage, GenerateImageInput, GenerateImageOutput as GenerateImageOutputFlow } from "@/ai/flows/generate-image";
import { generateEbookChapter, GenerateEbookChapterInput, GenerateEbookChapterOutput as GenerateEbookChapterOutputFlow } from "@/ai/flows/generate-ebook-chapter";
import { analyzeCode, AnalyzeCodeInput } from "@/ai/flows/analyze-code";
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput as SummarizeContentOutputFlow } from "@/ai/flows/summarize-content";
import { AnalyzeCodeOutput } from "@/lib/code-analysis-types";
import { openai } from "@/lib/openai";
import type { ModelKey } from "@/hooks/use-model-settings";

declare const puter: any;

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
export type GenerateQuizzesOutput = GenerateQuizzesOutputFlow | GenerateQuizzesSambaOutputFlow;
export type ChatWithTutorOutput = ChatWithTutorOutputFlow;
export type HelpChatOutput = HelpChatOutputFlow;
export type GeneralChatOutput = GeneralChatOutputFlow;
export type TextToSpeechOutput = TextToSpeechOutputFlow;
export type GenerateImageOutput = GenerateImageOutputFlow;
export type GetYoutubeTranscriptOutput = GetYoutubeTranscriptOutputFlow;
export type GenerateEbookChapterOutput = GenerateEbookChapterOutputFlow;
export type SummarizeContentOutput = SummarizeContentOutputFlow;


function isRateLimitError(e: any): boolean {
  if (e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('limit')) {
    return true;
  }
  return false;
}

async function callPuter(prompt: string): Promise<string> {
    if (typeof puter === 'undefined') {
        throw new Error('Puter.js is not loaded.');
    }
    const response = await puter.ai.chat(prompt);
    return typeof response === 'object' && response.text ? response.text : String(response);
}


export const analysisSystemPrompt = `You are an expert educator and AI tool. Your task is to analyze the given content to help students study more effectively.

Content to analyze:
---
{{content}}
---

Please perform the following actions with expert detail and respond in a valid JSON format. The JSON object should match the following schema:
{
    "type": "object",
    "properties": {
        "summary": { "type": "string", "description": "A concise, one-paragraph summary of the content." },
        "keyConcepts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "concept": { "type": "string" },
                    "explanation": { "type": "string" }
                },
                "required": ["concept", "explanation"]
            }
        },
        "codeExamples": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "code": { "type": "string" },
                    "explanation": { "type": "string" }
                },
                "required": ["code", "explanation"]
            }
        },
        "potentialQuestions": { "type": "array", "items": { "type": "string" } },
        "relatedTopics": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["summary", "keyConcepts", "codeExamples", "potentialQuestions", "relatedTopics"]
}

Here are the actions in detail:
1.  **Generate a Comprehensive Summary**: Create a concise, one-paragraph summary that captures the main ideas and purpose of the content for the 'summary' field.
2.  **Identify Key Concepts & Relationships**: Identify the most important concepts. For each concept, provide a clear explanation and add it to the 'keyConcepts' array.
3.  **Extract and Explain Code Examples**: If there are any code snippets (e.g., in Python, JavaScript, HTML), extract them. For each snippet, provide a brief explanation of what the code does and add it to the 'codeExamples' array. If no code is present, return an empty array.
4.  **Generate Insightful Questions**: Create a list of potential questions that go beyond simple factual recall. These questions should test for deeper understanding, critical thinking, and the ability to apply the concepts. Add them to the 'potentialQuestions' array.
5.  **Suggest Related Topics**: Recommend a list of related topics or areas of study that would be logical next steps for someone learning this material. Add them to the 'relatedTopics' array.
`;

export async function analyzeContentAction(
  content: string,
  model: Exclude<ModelKey, 'puter'>,
): Promise<ActionResult<AnalyzeContentOutput>> {
  try {
    if (model === 'gemini') {
        const output = await analyzeContent({ content });
        return { data: output };
    }

    // This action now only handles SambaNova and Gemini
    if (model !== 'samba') {
        return { error: `Unsupported model for server-side analysis: ${model}` };
    }

    let jsonResponseString: string;
    const prompt = analysisSystemPrompt.replace('{{content}}', content);

    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        return { error: "SambaNova API key or base URL is not configured." };
    }
     const response = await openai.chat.completions.create({
        model: 'Llama-4-Maverick-17B-128E-Instruct',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
    });
    if (!response.choices?.[0]?.message?.content) {
        throw new Error("Received an empty or invalid response from SambaNova.");
    }
    jsonResponseString = response.choices[0].message.content;
    

    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        return { data: jsonResponse as AnalyzeContentOutput };
    } catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string received:", jsonResponseString);
        throw new Error("The AI model returned an invalid JSON format. Please try again.");
    }
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
        // Image analysis is always done by Gemini as it's a multimodal model
        const output = await analyzeImageContent(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function generateFlashcardsAction(
  input: GenerateFlashcardsSambaInput
): Promise<ActionResult<GenerateFlashcardsOutput>> {
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
  input: GenerateQuizzesSambaInput,
  model: ModelKey
): Promise<ActionResult<GenerateQuizzesOutput>> {
  try {
    let output: GenerateQuizzesOutput;
    if (model === 'gemini') {
        output = await generateQuizzes({ 
            content: input.content, 
            difficulty: input.difficulty, 
            numQuestions: input.numQuestions 
        });
    } else {
        output = await generateQuizzesSamba(input, model);
    }
    return { data: output };
  } catch (e: any) {
    console.error(e);
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function chatWithTutorAction(
  input: ChatWithTutorInput,
  model: ModelKey
): Promise<ActionResult<ChatWithTutorOutput>> {
  try {
     if (model === 'gemini') {
      const output = await generalChat({ history: input.history, prompt: `You are an AI tutor. Your goal is to help the user understand the provided study material. Engage in a supportive and encouraging conversation. Study Material Context: --- ${input.content} ---` });
      return { data: output };
    }

    const lastMessage = input.history[input.history.length - 1];
    const prompt = `You are an AI tutor. Your goal is to help the user understand the provided study material. Engage in a supportive and encouraging conversation. The conversation history is: ${JSON.stringify(input.history)}. The full study material is: --- ${input.content} ---. Now, please respond to the last user message: "${lastMessage.content}".`;

    let responseText: string;
    if (model === 'puter') {
      responseText = await callPuter(prompt);
    } else { // Samba
      if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        return { error: "SambaNova API key or base URL is not configured." };
      }
      const response = await openai.chat.completions.create({
        model: MODEL_MAP.samba,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });
      if (!response.choices?.[0]?.message?.content) {
        throw new Error("Received an empty response from the AI.");
      }
      responseText = response.choices[0].message.content;
    }
    return { data: { response: responseText } };

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
      // Puter.js is handled client-side for this action, this is a fallback.
       try {
            const lastMessage = input.history[input.history.length - 1];
            let fullPrompt = lastMessage.content;
            if (input.prompt) {
                fullPrompt = `${input.prompt}\n\nUser query: ${lastMessage.content}`;
            }
            const response = await callPuter(fullPrompt);
            return { data: { response } };
       } catch (e: any) {
            return { error: e.message || "An unknown error occurred with Puter.js" };
       }
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
  input: GenerateImageInput,
  model: ModelKey
): Promise<ActionResult<GenerateImageOutput>> {
  try {
     if (model === 'samba' || model === 'puter') {
        return { error: `The '${model}' model does not support image generation. Please switch to Gemini.` };
    }
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

export async function analyzeCodeAction(
    input: AnalyzeCodeInput,
    model: ModelKey
): Promise<ActionResult<AnalyzeCodeOutput>> {
    try {
        // Code analysis always uses Gemini for its structured output capabilities
        const output = await analyzeCode(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function summarizeContentAction(
  input: SummarizeContentInput,
  model: ModelKey
): Promise<ActionResult<SummarizeContentOutput>> {
  try {
    if (model === 'gemini') {
        const output = await summarizeContent(input);
        return { data: output };
    }

    const prompt = `Please provide a concise, one-paragraph summary of the following content: --- ${input.content} ---`;
    let responseText: string;

    if (model === 'puter') {
        responseText = await callPuter(prompt);
    } else { // Samba
        if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
            return { error: "SambaNova API key or base URL is not configured." };
        }
         const response = await openai.chat.completions.create({
            model: MODEL_MAP.samba,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
        });
        if (!response.choices?.[0]?.message?.content) {
            throw new Error("Received an empty response from SambaNova.");
        }
        responseText = response.choices[0].message.content;
    }
    
    return { data: { summary: responseText } };

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


export type { GetYoutubeTranscriptInput, GenerateQuizzesSambaInput as GenerateQuizzesInput, GenerateFlashcardsSambaInput as GenerateFlashcardsInput, ChatWithTutorInput, HelpChatInput, TextToSpeechInput, GenerateImageInput, ModelKey, GenerateEbookChapterInput, AnalyzeCodeInput, SummarizeContentInput };

    
    