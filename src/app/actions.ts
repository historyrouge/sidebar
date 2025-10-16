

"use server";

import { CoreMessage } from 'ai';
import { openai } from '@/lib/openai';
import { z }from 'zod';
import { generateFlashcardsSamba, GenerateFlashcardsSambaInput, GenerateFlashcardsSambaOutput } from '@/ai/flows/generate-flashcards-samba';
import { generateQuizzesSamba, GenerateQuizzesSambaInput, GenerateQuizzesSambaOutput } from '@/ai/flows/generate-quizzes-samba';
import { analyzeCode, AnalyzeCodeInput, AnalyzeCodeOutput } from '@/ai/flows/analyze-code';
import { generateMindMap, GenerateMindMapInput, GenerateMindMapOutput } from '@/ai/flows/generate-mindmap';
import { generateQuestionPaper, GenerateQuestionPaperInput, GenerateQuestionPaperOutput } from '@/ai/flows/generate-question-paper';
import { generateEbookChapter, GenerateEbookChapterInput, GenerateEbookChapterOutput } from '@/ai/flows/generate-ebook-chapter';
import { generatePresentation, GeneratePresentationInput, GeneratePresentationOutput } from '@/ai/flows/generate-presentation';
import { generateEditedContent, GenerateEditedContentInput, GenerateEditedContentOutput } from '@/ai/flows/generate-edited-content';
import { helpChat, HelpChatInput, HelpChatOutput } from '@/ai/flows/help-chatbot';
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput } from '@/ai/flows/youtube-transcript';
import { analyzeContent, AnalyzeContentInput, AnalyzeContentOutput } from '@/ai/flows/analyze-content';
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput } from '@/ai/flows/summarize-content';
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput } from '@/ai/flows/chat-tutor';
import { webSearch } from '@/ai/tools/web-search';
import { searchYoutube } from '@/ai/tools/youtube-search';
import { DEFAULT_MODEL_ID, AVAILABLE_MODELS } from '@/lib/models';
import { generateImage, GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-image";
import { ai } from '@/ai/genkit'; // Keep for other actions

export type ActionResult<T> = {
    data?: T;
    error?: string;
};

export async function generateFlashcardsAction(input: GenerateFlashcardsSambaInput): Promise<ActionResult<GenerateFlashcardsSambaOutput>> {
    try {
        const data = await generateFlashcardsSamba(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateQuizAction(input: GenerateQuizzesSambaInput): Promise<ActionResult<GenerateQuizzesSambaOutput>> {
    try {
        const data = await generateQuizzesSamba(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function helpChatAction(input: HelpChatInput): Promise<ActionResult<HelpChatOutput>> {
    try {
        const data = await helpChat(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function textToSpeechAction(input: TextToSpeechInput): Promise<ActionResult<TextToSpeechOutput>> {
    try {
        const data = await textToSpeech(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function getYoutubeTranscriptAction(input: GetYoutubeTranscriptInput): Promise<ActionResult<GetYoutubeTranscriptOutput>> {
    try {
        const data = await getYoutubeTranscript(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function analyzeCodeAction(input: AnalyzeCodeInput): Promise<ActionResult<AnalyzeCodeOutput>> {
    try {
        const data = await analyzeCode(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateMindMapAction(input: GenerateMindMapInput): Promise<ActionResult<GenerateMindMapOutput>> {
    try {
        const data = await generateMindMap(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateQuestionPaperAction(input: GenerateQuestionPaperInput): Promise<ActionResult<GenerateQuestionPaperOutput>> {
    try {
        const data = await generateQuestionPaper(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateEbookChapterAction(input: GenerateEbookChapterInput): Promise<ActionResult<GenerateEbookChapterOutput>> {
    try {
        const data = await generateEbookChapter(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generatePresentationAction(input: GeneratePresentationInput): Promise<ActionResult<GeneratePresentationOutput>> {
    try {
        const data = await generatePresentation(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateEditedContentAction(input: GenerateEditedContentInput): Promise<ActionResult<GenerateEditedContentOutput>> {
    try {
        const data = await generateEditedContent(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateImageAction(input: GenerateImageInput): Promise<ActionResult<GenerateImageOutput>> {
    try {
        const data = await generateImage(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function analyzeContentAction(content: string): Promise<ActionResult<AnalyzeContentOutput>> {
    try {
        const data = await analyzeContent({ content });
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function summarizeContentAction(input: SummarizeContentInput): Promise<ActionResult<SummarizeContentOutput>> {
    try {
        const data = await summarizeContent(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function chatWithTutorAction(input: ChatWithTutorInput): Promise<ActionResult<ChatWithTutorOutput>> {
    try {
        const data = await chatWithTutor(input);
        return { data };
    } catch (e: any) {
        return { error: e.message };
    }
}

const getSystemPrompt = (modelId: string, fileContent: string | null | undefined): string => {
    const basePrompt = `You are SearnAI, an expert AI assistant with a confident and helpful Indian-style personality. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.`;
    
    const personaPrompts: Record<string, string> = {
        'gpt-oss-120b': `You are an expert AI assistant with a confident and helpful Indian-style personality. You are a powerful vision-capable model. When provided with text extracted from an image, analyze it as if you were looking at the image itself.`,
        'DeepSeek-V3.1': `You are DeepSeek. Your persona is straightforward, factual, terse, and literal. Your style is formal and to-the-point, without any creative flair.`,
        'Meta-Llama-3.3-70B-Instruct': `You are Claude 4.5 Sonnet. Your persona is clear, controlled, measured, and safe. Your tone is neutral, helpful, polite, and slightly formal. Avoid bravado and excessive informality.`,
        'Llama-3.3-Swallow-70B-Instruct-v0.4': `You are Swallow. Your persona is polite, clear, safe, and respectful. In English, your tone is neutral and formal, similar to Llama 3.1.`,
        'gpt-5': `You are GPT-5. Your persona is versatile, expressive, and optimistic. You can be friendly and informal, or professional as needed. A touch of humor is appropriate when it fits.`,
        'Meta-Llama-3.1-8B-Instruct': `You are Llama 3.1. Your persona is neutral, factual, and formal. You are matter-of-fact and do not have a built-in personality or humor.`,
    };

    const ocrInstruction = `
Whenever the user provides OCR-scanned text or an image containing text, do NOT include any of the following meta-commentary in your response:
- "What the OCR Text Is Trying to Tell You"
- "Cleaned-up version"
- Notes about OCR mis-reads or scanning artefacts
- Any explanation paragraphs like “After that, I break down each part…”

Instead, give a direct, final formatted answer only — like a clean list, table, or syllabus — without repeating unnecessary meta-text.
For example, if the OCR text contains a school curriculum, just return the neat version like this:

---

🏫 Sri Chaitanya School – Infinity Batch (2024-25)
Date: 25-02-2025 (Tuesday)

**Mathematics:**
*   **Track A:** Progressions (Aim: 1 to 4)
*   **Track B:** 
    1.  Quadratic Equations (Aim: 4 to 6)
    2.  Coordinate System (Aim: 1)

**Physics:**
*   Friction
*   Concept - V
*   Horizontal Circular Motion (Complete)

**Chemistry:**
1.  Ionic Equilibrium (Goal 5 to 7)
2.  Colligative Properties (Goal 1 to 4)

---

Always skip messy OCR bits and directly show the cleaned content in an organized, readable format.
`;

    const persona = personaPrompts[modelId] || `You are a helpful AI assistant.`;

    const fileContext = fileContent 
        ? `\n\n**User's Provided Context:**\nThe user has provided the following text content, which was extracted from a file or image. Use it as the primary context for your answer.\n\n---\n${fileContent}\n---` 
        : '';
        
    return `${basePrompt}\n\n${persona}\n\nYour answers must be excellent, comprehensive, well-researched, and easy to understand. Use Markdown for formatting. Be proactive and suggest a relevant follow-up question or action at the end of your response.${ocrInstruction}${fileContext}`;
};


// Main non-streaming chat action
export async function chatAction(input: {
    history: CoreMessage[],
    fileContent?: string | null,
    imageDataUri?: string | null,
    model?: string,
    isMusicMode?: boolean,
}): Promise<ActionResult<{ response: string }>> {
    const isSearch = input.history[input.history.length - 1]?.content.toString().toLowerCase().startsWith("search:");
    const isMusic = input.isMusicMode;

    if (isSearch) {
        const query = input.history[input.history.length - 1].content.toString().replace(/^search:\s*/i, '');
        try {
            const searchResults = await webSearch({ query });
            if (searchResults.results && searchResults.results.length > 0) {
                 const responsePayload = {
                    type: 'website_results',
                    results: searchResults.results.map(r => ({
                        url: r.url,
                        title: r.title,
                        snippet: r.snippet,
                    }))
                };
                 return { data: { response: JSON.stringify(responsePayload) } };
            } else {
                return { data: { response: "I searched the entire internet and couldn't find any relevant websites for that search." } };
            }
        } catch (error: any) {
            return { error: `Sorry, an error occurred during the search: ${error.message}` };
        }
    }

    if (isMusic) {
         const query = input.history[input.history.length - 1].content.toString();
         try {
            const video = await searchYoutube({ query });
            if (video.id) {
                const responsePayload = {
                    type: 'youtube',
                    videoId: video.id,
                    title: video.title,
                    thumbnail: video.thumbnail,
                };
                return { data: { response: JSON.stringify(responsePayload) } };
            } else {
                 return { data: { response: "Sorry, I couldn't find a matching song on YouTube." } };
            }
         } catch (error: any) {
             return { error: `Sorry, an error occurred while searching YouTube: ${error.message}` };
         }
    }

    const selectedModelId = input.model || DEFAULT_MODEL_ID;
    
    // If an image is provided, ALWAYS force the model to be gpt-oss-120b
    let finalModelId = input.imageDataUri ? 'gpt-oss-120b' : selectedModelId;
    if (finalModelId === 'auto') {
        finalModelId = DEFAULT_MODEL_ID; // Fallback from auto if not an image
    }

    const messages: CoreMessage[] = input.history.map(msg => {
        // This is the fix. We are ensuring the content is always a string.
        // If an image was attached, its OCR'd text is in fileContent, which is
        // already being appended to the system prompt. The user's text query is in msg.content.
        return {
            role: msg.role as 'user' | 'model' | 'tool',
            content: String(msg.content)
        };
    });

    const modelsToTry = (finalModelId === 'auto' || !finalModelId)
      ? AVAILABLE_MODELS.map(m => m.id).filter(id => id !== 'auto')
      : [finalModelId];
    
    let lastError: any = null;

    for (const modelId of modelsToTry) {
        try {
            // For vision model, we now pass the OCR'd text in fileContent via the system prompt
            const systemPrompt = getSystemPrompt(modelId, input.fileContent);
            const fullMessages = [{ role: 'system', content: systemPrompt } as CoreMessage, ...messages];

            const response = await openai.chat.completions.create({
                model: modelId,
                messages: fullMessages as any, // Cast to any to handle the CoreMessage type
                stream: false,
                max_tokens: modelId === 'gpt-oss-120b' ? 4096 : undefined,
            });

            const responseText = response.choices[0]?.message?.content;
            if (!responseText) {
                throw new Error("Received an empty response from the AI model.");
            }
            
            const modelName = AVAILABLE_MODELS.find(m => m.id === modelId)?.name || modelId;
            const finalResponse = `**Response from ${modelName}**\n\n${responseText}`;

            return { data: { response: finalResponse } };
        } catch (e: any) {
            lastError = e;
            console.error(`SambaNova chat error with model ${modelId}:`, e.message);
            // If a specific model was chosen and it failed, don't try others.
            if(finalModelId !== 'auto' && modelsToTry.length === 1) {
                break;
            }
        }
    }
    
    // Check for specific token limit error
    if (lastError?.message?.includes('maximum context length')) {
        return { error: "The provided content is too long for the selected AI model. Please shorten it or try a different model." };
    }

    return { error: lastError?.message || "An unknown error occurred with all available AI models." };
}


    

    
