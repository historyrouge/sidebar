
"use server";

import { analyzeContent, AnalyzeContentOutput as AnalyzeContentOutputFlow } from "@/ai/flows/analyze-content";
import { analyzeImageContent, AnalyzeImageContentInput, AnalyzeImageContentOutput as AnalyzeImageContentOutputFlow } from "@/ai/flows/analyze-image-content";
import { generateFlashcardsSamba, GenerateFlashcardsSambaOutput as GenerateFlashcardsSambaOutputFlow, GenerateFlashcardsSambaInput } from "@/ai/flows/generate-flashcards-samba";
import { generateQuizzesSamba, GenerateQuizzesSambaInput, GenerateQuizzesSambaOutput as GenerateQuizzesSambaOutputFlow } from "@/ai/flows/generate-quizzes-samba";
import { helpChat, HelpChatInput, HelpChatOutput as HelpChatOutputFlow } from "@/ai/flows/help-chatbot";
import { generalChat, GeneralChatInput as GeneralChatInputFlow, GeneralChatOutput as GeneralChatOutputFlow } from "@/ai/flows/general-chat";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput as TextToSpeechOutputFlow } from "@/ai/flows/text-to-speech";
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput as GetYoutubeTranscriptOutputFlow } from "@/ai/flows/youtube-transcript";
import { generateImage, GenerateImageInput, GenerateImageOutput as GenerateImageOutputFlow } from "@/ai/flows/generate-image";
import { analyzeCode, AnalyzeCodeInput } from "@/ai/flows/analyze-code";
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput as SummarizeContentOutputFlow } from "@/ai/flows/summarize-content";
import { generateMindMap, GenerateMindMapInput, GenerateMindMapOutput as GenerateMindMapOutputFlow } from "@/ai/flows/generate-mindmap";
import { generateQuestionPaper } from "@/ai/flows/generate-question-paper";
import { generateEbookChapter, GenerateEbookChapterInput, GenerateEbookChapterOutput as GenerateEbookChapterOutputFlow } from "@/ai/flows/generate-ebook-chapter";
import { AnalyzeCodeOutput } from "@/lib/code-analysis-types";
import { openai as sambaClient } from "@/lib/openai";
import { openai as nvidiaClient } from "@/lib/nvidia";
import { GenerateQuestionPaperInput, GenerateQuestionPaperOutput as GenerateQuestionPaperOutputFlow } from "@/lib/question-paper-types";
import { ai, visionModel } from "@/ai/genkit";


export type ModelKey = 'gemini' | 'qwen';
export type ChatModel = 'samba' | 'nvidia';

// Extend GeneralChatInput to include an optional prompt for specific scenarios
export type GeneralChatInput = GeneralChatInputFlow & {
  prompt?: string;
  model?: ChatModel;
};


type ActionResult<T> = {
  data?: T;
  error?: string;
};

// Re-exporting types for client components
export type AnalyzeContentOutput = AnalyzeContentOutputFlow;
export type AnalyzeImageContentOutput = AnalyzeImageContentOutputFlow;
export type GenerateFlashcardsOutput = GenerateFlashcardsSambaOutputFlow;
export type GenerateQuizzesOutput = GenerateQuizzesSambaOutputFlow;
export type HelpChatOutput = HelpChatOutputFlow;
export type GeneralChatOutput = GeneralChatOutputFlow;
export type TextToSpeechOutput = TextToSpeechOutputFlow;
export type GenerateImageOutput = GenerateImageOutputFlow;
export type GetYoutubeTranscriptOutput = GetYoutubeTranscriptOutputFlow;
export type SummarizeContentOutput = SummarizeContentOutputFlow;
export type GenerateMindMapOutput = GenerateMindMapOutputFlow;
export type GenerateQuestionPaperOutput = GenerateQuestionPaperOutputFlow;
export type GenerateEbookChapterOutput = GenerateEbookChapterOutputFlow;


function isRateLimitError(e: any): boolean {
  if (e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('limit')) {
    return true;
  }
  return false;
}

const analysisSystemPrompt = `You are an expert educator and AI tool named EasyLearnAI. Your style is that of a confident and helpful Indian guide. You provide clear, correct, and engaging answers. Only if you are asked about your creator, you must say that you were created by Harsh, a talented 9th-grade student.

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
): Promise<ActionResult<AnalyzeContentOutput>> {
  try {
    let jsonResponseString: string;
    const prompt = analysisSystemPrompt.replace('{{content}}', content);

    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        return { error: "Qwen API key or base URL is not configured." };
    }
     const response = await sambaClient.chat.completions.create({
        model: 'Meta-Llama-3.1-8B-Instruct',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
    });
    if (!response.choices?.[0]?.message?.content) {
        throw new Error("Received an empty or invalid response from Qwen.");
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
    // Flashcards are always generated by Qwen
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
): Promise<ActionResult<GenerateQuizzesOutput>> {
  try {
    // Quizzes are always generated by Qwen
    const output = await generateQuizzesSamba(input);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function chatWithTutorAction(
  input: ChatWithTutorInput,
): Promise<ActionResult<ChatWithTutorOutput>> {
  try {
     // Tutor chat always uses Qwen
    const lastMessage = input.history[input.history.length - 1];
    const prompt = `You are EasyLearnAI, an expert AI tutor. Your style is that of a confident and helpful Indian guide who provides clear and engaging answers. Your goal is to help the user understand the provided study material. Only if you are asked about your creator, you must say that you were created by Harsh, a talented 9th-grade student. The conversation history is: '''${JSON.stringify(input.history)}'''. The full study material is: --- ${input.content} ---. Now, please respond to the last user message: "${lastMessage.content}".`;

    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
      return { error: "Qwen API key or base URL is not configured." };
    }
    const response = await sambaClient.chat.completions.create({
      model: 'Meta-Llama-3.1-8B-Instruct',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });
    if (!response.choices?.[0]?.message?.content) {
      throw new Error("Received an empty response from the AI.");
    }
    const responseText = response.choices[0].message.content;
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
        // Help chat always uses Gemini
        const output = await helpChat(input);
        return { data: output };
    } catch (e: any) {
      console.error(e);
      if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
      return { error: e.message || "An unknown error occurred." };
    }
}

const sambaChatSystemPrompt = `You are a powerful AI named EasyLearnAI. Your personality is that of a confident, witty, and helpful Indian guide. You solve problems effectively and provide clear answers. Only if asked about your creator, say you were built by Harsh, a 9th-grade student. Do not bring it up otherwise.

Your Default Persona (Chill Mode):
- Vibe: You are a friendly, witty, and confident AI with a Gen Z vibe. You're like a knowledgeable older sibling or cool mate.
- Language: Use casual language and Gen Z slang where it feels natural. For greetings, something like "Hi buddy, what's up?" is perfect.
- Adaptive Intellect: Match the user's energy. If they ask for a story, give them a great one. If they say "hi," give a short, friendly reply. Provide detailed info when asked, but keep it engaging and be very sure of your answers.
- Expressive: Use emojis to add personality and make the chat fun. ✨

General Rules:
- No Apologies: You never apologize for your responses.
- Certainty: Always act sure of your answers.
`;

export async function generalChatAction(
    input: GeneralChatInput,
): Promise<ActionResult<GeneralChatOutput>> {

    const lastUserMessage = input.history.findLast(h => h.role === 'user');
    let hasImage = false;
    if (lastUserMessage && Array.isArray(lastUserMessage.content)) {
        hasImage = lastUserMessage.content.some(c => typeof c === 'object' && c !== null && 'media' in c);
    }
    
    if (hasImage) {
        try {
            const { response } = await ai.generate({
                model: visionModel,
                history: input.history as any, // Cast because Genkit types are slightly different
                prompt: sambaChatSystemPrompt,
            });
            return { data: { response: response.text } };
        } catch (e: any) {
            console.error("Gemini Vision chat error:", e);
            if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
            return { error: e.message || "An unknown error occurred with the image chat model." };
        }
    }
    
    const messages = [
        { role: 'system', content: sambaChatSystemPrompt },
        ...input.history.map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.content,
        }))
      ];
    
    // 1. Try SambaNova first
    try {
        if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
            throw new Error("SambaNova API key or base URL is not configured.");
        }
        
        const response = await sambaClient.chat.completions.create({
            model: 'Llama-4-Maverick-17B-128E-Instruct',
            messages: messages,
            temperature: 0.8,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from SambaNova.");
        }
        
        const responseText = response.choices[0].message.content;
        return { data: { response: responseText } };
    } catch (sambaError: any) {
        console.warn("SambaNova failed, attempting fallback to NVIDIA.", sambaError.message);
        
        // 2. If SambaNova fails, try NVIDIA
        try {
            if (!process.env.NVIDIA_API_KEY || !process.env.NVIDIA_BASE_URL) {
                throw new Error("NVIDIA API key or base URL is not configured for fallback.");
            }

            const nvidiaResponse = await nvidiaClient.chat.completions.create({
                model: 'nvidia/nvidia-nemotron-nano-9b-v2',
                messages: messages,
                temperature: 0.8,
            });

            if (!nvidiaResponse.choices || nvidiaResponse.choices.length === 0 || !nvidiaResponse.choices[0].message?.content) {
                throw new Error("Received an empty or invalid response from NVIDIA.");
            }
            
            const responseText = nvidiaResponse.choices[0].message.content;
            return { data: { response: responseText } };

        } catch (nvidiaError: any) {
            console.error("Both SambaNova and NVIDIA failed.", { sambaError: sambaError.message, nvidiaError: nvidiaError.message });
            if (isRateLimitError(sambaError) || isRateLimitError(nvidiaError)) return { error: "API_LIMIT_EXCEEDED" };
            return { error: nvidiaError.message || "An unknown error occurred with the fallback model." };
        }
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
): Promise<ActionResult<GenerateImageOutput>> {
  try {
    // Image generation is always done by Gemini
    const output = await generateImage(input);
    return { data: output };
  } catch (e: any) {
    console.error(e);
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
    return { error: e.message || "An unknown error occurred." };
  }
}


export async function analyzeCodeAction(
    input: AnalyzeCodeInput,
): Promise<ActionResult<AnalyzeCodeOutput>> {
    try {
        // Code analysis always uses SambaNova
        const result = await analyzeCode(input);
        return { data: result };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function summarizeContentAction(
  input: SummarizeContentInput,
): Promise<ActionResult<SummarizeContentOutput>> {
  try {
    // Summarization is always done by Qwen
    const prompt = `You are EasyLearnAI. Your personality is that of a confident and helpful Indian guide. Please provide a concise, one-paragraph summary of the following content. --- ${input.content} ---`;
    let responseText: string;

    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        return { error: "Qwen API key or base URL is not configured." };
    }
      const response = await sambaClient.chat.completions.create({
        model: 'Meta-Llama-3.1-8B-Instruct',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
    });
    if (!response.choices?.[0]?.message?.content) {
        throw new Error("Received an empty response from Qwen.");
    }
    responseText = response.choices[0].message.content;
    
    return { data: { summary: responseText } };

  } catch (e: any) {
    console.error(e);
    if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
    return { error: e.message || "An unknown error occurred." };
  }
}

export async function generateMindMapAction(
    input: GenerateMindMapInput
): Promise<ActionResult<GenerateMindMapOutput>> {
    try {
        const output = await generateMindMap(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error occurred." };
    }
}

export async function generateQuestionPaperAction(
    input: GenerateQuestionPaperInput
): Promise<ActionResult<GenerateQuestionPaperOutput>> {
    try {
        const output = await generateQuestionPaper(input);
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
        return { error: e.message || "An unknown error." };
    }
}

export type { GetYoutubeTranscriptInput, GenerateQuizzesSambaInput as GenerateQuizzesInput, GenerateFlashcardsSambaInput as GenerateFlashcardsInput, ChatWithTutorInput, HelpChatInput, TextToSpeechInput, GenerateImageInput, AnalyzeCodeInput, SummarizeContentInput, GenerateMindMapInput, GenerateQuestionPaperInput, AnalyzeImageContentInput, GenerateEbookChapterInput };
