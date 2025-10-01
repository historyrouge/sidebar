
"use server";

import { analyzeCode, AnalyzeCodeInput } from "@/ai/flows/analyze-code";
import { generateEbookChapter, GenerateEbookChapterInput, GenerateEbookChapterOutput as GenerateEbookChapterOutputFlow } from "@/ai/flows/generate-ebook-chapter";
import { generateEditedContent, GenerateEditedContentInput, GenerateEditedContentOutput as GenerateEditedContentOutputFlow } from "@/ai/flows/generate-edited-content";
import { generateFlashcardsSamba, GenerateFlashcardsSambaOutput as GenerateFlashcardsSambaOutputFlow, GenerateFlashcardsSambaInput } from "@/ai/flows/generate-flashcards-samba";
import { generateImage, GenerateImageInput, GenerateImageOutput as GenerateImageOutputFlow } from "@/ai/flows/generate-image";
import { generateMindMap, GenerateMindMapInput, GenerateMindMapOutput as GenerateMindMapOutputFlow } from "@/ai/flows/generate-mindmap";
import { generatePresentation, GeneratePresentationInput, GeneratePresentationOutput as GeneratePresentationOutputFlow } from "@/ai/flows/generate-presentation";
import { generateQuestionPaper } from "@/ai/flows/generate-question-paper";
import { generateQuizzesSamba, GenerateQuizzesSambaInput, GenerateQuizzesSambaOutput as GenerateQuizzesSambaOutputFlow } from "@/ai/flows/generate-quizzes-samba";
import { getYoutubeTranscript, GetYoutubeTranscriptInput, GetYoutubeTranscriptOutput as GetYoutubeTranscriptOutputFlow } from "@/ai/flows/youtube-transcript";
import { helpChat, HelpChatInput, HelpChatOutput as HelpChatOutputFlow } from "@/ai/flows/help-chatbot";
import { imageToText, ImageToTextInput, ImageToTextOutput as ImageToTextOutputFlow } from "@/ai/flows/image-to-text";
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput as TextToSpeechOutputFlow } from "@/ai/flows/text-to-speech";
import { ai } from "@/ai/genkit";
import { browseWebsite } from "@/ai/tools/browse-website";
import { duckDuckGoSearch } from "@/ai/tools/duckduckgo-search";
import { searchYoutube } from "@/ai/tools/youtube-search";
import { AnalyzeCodeOutput } from "@/lib/code-analysis-types";
import { openai as sambaClient } from "@/lib/openai";
import { GenerateQuestionPaperInput, GenerateQuestionPaperOutput as GenerateQuestionPaperOutputFlow } from "@/lib/question-paper-types";
import { MessageData } from "genkit";
import { CoreMessage } from "genkit/experimental/ai";
import { readStreamableValue } from 'ai/rsc';


export type AnalyzeCodeOutput = AnalyzeCodeOutput;
export type GenerateFlashcardsOutput = GenerateFlashcardsSambaOutputFlow;
export type GenerateQuizzesOutput = GenerateQuizzesSambaOutputFlow;
export type HelpChatOutput = HelpChatOutputFlow;
export type TextToSpeechOutput = TextToSpeechOutputFlow;
export type GenerateImageOutput = GenerateImageOutputFlow;
export type GetYoutubeTranscriptOutput = GetYoutubeTranscriptOutputFlow;
export type GenerateMindMapOutput = GenerateMindMapOutputFlow;
export type GenerateQuestionPaperOutput = GenerateQuestionPaperOutputFlow;
export type GenerateEbookChapterOutput = GenerateEbookChapterOutputFlow;
export type GeneratePresentationOutput = GeneratePresentationOutputFlow;
export type GenerateEditedContentOutput = GenerateEditedContentOutputFlow;
export type ImageToTextOutput = ImageToTextOutputFlow;


type ActionResult<T> = {
  data?: T;
  error?: string;
};

// Re-exporting types for client components
export type GeneralChatOutput = {
  response: string;
};


export type GeneralChatInput = {
  history: CoreMessage[];
  fileContent?: string | null;
  imageDataUri?: string | null;
  model?: string;
  isMusicMode?: boolean;
}

function isRateLimitError(e: any): boolean {
  if (e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('limit')) {
    return true;
  }
  return false;
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
): Promise<ActionResult<GenerateQuizzesOutput>> {
  try {
    const output = await generateQuizzesSamba(input);
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
      return { error: e.message || "An unexpected error occurred." };
    }
}

const sambaModelFallbackOrder = [
    'gpt-oss-120b',
    'Qwen3-32B',
    'Llama-4-Maverick-17B-128E-Instruct',
    'Meta-Llama-3.3-70B-Instruct',
    'DeepSeek-R1-Distill-Llama-70B',
    'Meta-Llama-3.1-8B-Instruct',
    'Llama-3.3-Swallow-70B-Instruct-v0.4',
    'DeepSeek-R1-0528',
    'DeepSeek-V3-0324',
];


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
        const result = await analyzeCode(input);
        return { data: result };
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

export async function generatePresentationAction(
    input: GeneratePresentationInput
): Promise<ActionResult<GeneratePresentationOutput>> {
    try {
        const output = await generatePresentation(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error." };
    }
}

export async function generateEditedContentAction(
    input: GenerateEditedContentInput
): Promise<ActionResult<GenerateEditedContentOutput>> {
    try {
        const output = await generateEditedContent(input);
        return { data: output };
    } catch (e: any) {
        console.error(e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error." };
    }
}

export async function imageToTextAction(
    input: ImageToTextInput
): Promise<ActionResult<ImageToTextOutput>> {
    try {
        const output = await imageToText(input);
        return { data: output };
    } catch (e: any) {
        console.error("imageToTextAction Error:", e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error occurred while extracting text from the image." };
    }
}


export async function chatWithTutorAction(
  input: HelpChatInput,
): Promise<ActionResult<HelpChatOutput>> {
  try {
    const lastMessage = input.history[input.history.length - 1];
    const prompt = `You are SearnAI, an expert AI tutor. Your style is that of a confident and helpful Indian guide who provides clear and engaging answers. Your goal is to help the user understand the provided study material. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students. The conversation history is: '''${'\"'}'''${JSON.stringify(input.history)}'''${'\"'}'''. The full study material is: --- ${(input as any).content} ---. Now, please respond to the last user message: "${lastMessage.content}".`;

    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
      return { error: "SambaNova API key or base URL is not configured." };
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

async function trySambaChatCompletion(
    messages: any[],
    userSelectedModel?: string,
): Promise<string> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error(`SambaNova is not configured.`);
    }
    const modelPriorityList = [
        ...(userSelectedModel ? [userSelectedModel] : []),
        ...sambaModelFallbackOrder.filter(m => m !== userSelectedModel)
    ];
    for (const modelName of modelPriorityList) {
        try {
            console.log(`Trying model: ${modelName} with provider: SambaNova`);
            const response = await sambaClient.chat.completions.create({ model: modelName, messages: messages, stream: false });
            if (response.choices?.[0]?.message?.content) {
                return response.choices[0].message.content;
            }
            throw new Error('Empty response from model.');
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            if (isRateLimitError(error)) continue;
        }
    }
    throw new Error(`All SambaNova models failed or were rate-limited.`);
}

export async function streamingChat(input: GeneralChatInput): Promise<ActionResult<{ output: any }>> {
    const { history, fileContent, imageDataUri, model: userSelectedModel, isMusicMode } = input;

    try {
        const lastUserMessage = history[history.length - 1];
        if (!lastUserMessage || typeof lastUserMessage.content !== 'string') {
            return { error: "Invalid last message format." };
        }
        const lastUserMessageText = lastUserMessage.content;

        if (isMusicMode) {
            const result = await searchYoutube({ query: lastUserMessageText });
            if (result.id) {
                return { data: { output: JSON.stringify({ type: 'youtube', videoId: result.id, title: result.title, thumbnail: result.thumbnail }) } };
            } else {
                return { data: { output: "Sorry, I couldn't find that song on YouTube. Please try another one." } };
            }
        }

        if (lastUserMessageText.startsWith("Search:")) {
            const query = lastUserMessageText.replace("Search:", "").trim();
            const searchResults = await duckDuckGoSearch({ query });
            
            try {
                const results = JSON.parse(searchResults);
                if (results.error) throw new Error(results.error);

                const firstResultUrl = results[0]?.link;
                if (!firstResultUrl) throw new Error("No search results found.");
                
                const siteContent = await browseWebsite({ url: firstResultUrl });

                const finalPrompt = `Based on the following content from ${firstResultUrl}, please answer this question: "${query}".\n\n---\n${siteContent}\n---`;
                const messages = [{ role: 'system', content: "You are a helpful AI assistant." }, { role: 'user', content: finalPrompt }];
                const responseText = await trySambaChatCompletion(messages, userSelectedModel);
                return { data: { output: responseText } };
                
            } catch (searchError: any) {
                 return { error: `Search failed: ${searchError.message}` };
            }
        }

        let messages: any[] = [{ role: 'system', content: "You are a helpful AI assistant." }];
        history.forEach(h => {
            if (h.role === 'user' || h.role === 'model') {
                messages.push({ role: h.role, content: h.content });
            }
        });
        
        if (imageDataUri) {
            const userContent: any[] = [{ type: 'text', text: lastUserMessageText }];
            userContent.push({ type: "image_url", image_url: { "url": imageDataUri } });
            messages[messages.length - 1].content = userContent;
        }

        if (fileContent) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'user' && typeof lastMessage.content === 'string') {
                lastMessage.content += `\n\n---CONTEXT---\n${fileContent}\n---`;
            }
        }

        const responseText = await trySambaChatCompletion(messages, userSelectedModel);
        return { data: { output: responseText } };

    } catch (e: any) {
        console.error("Streaming Chat Action Error:", e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unexpected error occurred." };
    }
}
export type { GenerateQuizzesSambaInput as GenerateQuizzesInput, GenerateFlashcardsSambaInput as GenerateFlashcardsInput, HelpChatInput as ChatWithTutorInput, HelpChatInput, TextToSpeechInput, GenerateImageInput, AnalyzeCodeInput, GenerateMindMapInput, GenerateQuestionPaperInput, GenerateEbookChapterInput, GeneratePresentationInput, GenerateEditedContentInput, ImageToTextInput };
