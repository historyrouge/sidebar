
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
import { imageToText, ImageToTextInput, ImageToTextOutput } from '@/ai/flows/image-to-text';
import { analyzeContent, AnalyzeContentInput, AnalyzeContentOutput } from '@/ai/flows/analyze-content';
import { analyzeImageContent, AnalyzeImageContentInput, AnalyzeImageContentOutput } from '@/ai/flows/analyze-image-content';
import { summarizeContent, SummarizeContentInput, SummarizeContentOutput } from '@/ai/flows/summarize-content';
import { textToSpeech, TextToSpeechInput, TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { chatWithTutor, ChatWithTutorInput, ChatWithTutorOutput } from '@/ai/flows/chat-tutor';
import { duckDuckGoSearch } from '@/ai/tools/duckduckgo-search';
import { searchYoutube } from '@/ai/tools/youtube-search';
import { browseWebsite } from '@/ai/tools/browse-website';
import { DEFAULT_MODEL_ID } from '@/lib/models';
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

export async function imageToTextAction(input: ImageToTextInput): Promise<ActionResult<ImageToTextOutput>> {
    try {
        const data = await imageToText(input);
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

export async function analyzeImageContentAction(input: AnalyzeImageContentInput): Promise<ActionResult<AnalyzeImageContentOutput>> {
    try {
        const data = await analyzeImageContent(input);
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

// Main non-streaming chat action
export async function chatAction(input: {
    history: CoreMessage[],
    fileContent?: string | null,
    imageDataUri?: string | null,
    model?: string,
    isMusicMode?: boolean,
    isWebScrapingMode?: boolean,
}): Promise<ActionResult<{ response: string }>> {
    const isSearch = input.history[input.history.length - 1]?.content.toString().startsWith("Search:");
    const isMusic = input.isMusicMode;
    const isWebScraping = input.isWebScrapingMode;

    if (isSearch) {
        const query = input.history[input.history.length - 1].content.toString().replace(/^Search:\s*/i, '');
        try {
            const searchResults = await duckDuckGoSearch({ query });
            const results = JSON.parse(searchResults);

            if (results.length > 0) {
                const topResult = results[0];
                const websiteContent = await browseWebsite({ url: topResult.link });

                const responsePayload = {
                    type: 'website',
                    url: topResult.link,
                    title: topResult.title,
                    snippet: websiteContent.substring(0, 300) + '...'
                };

                return { data: { response: JSON.stringify(responsePayload) } };
            } else {
                return { data: { response: "Sorry, I couldn't find any relevant websites for that search." } };
            }
        } catch (error: any) {
            return { error: `Sorry, an error occurred during the search: ${'error.message'}` };
        }
    }

    if (isWebScraping) {
        const query = input.history[input.history.length - 1].content.toString();
        try {
            // Call our web scraping API
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/scrape`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            const data = await response.json();
            
            if (data.error) {
                return { error: data.error };
            }

            // Format the response with sources
            const sourcesText = data.sources.map((source: any, index: number) => 
                `${index + 1}. **${source.title}** (${new URL(source.url).hostname})\n   ${source.summary}`
            ).join('\n\n');

            const formattedResponse = `${data.answer}\n\n---\n\n**Sources:**\n${sourcesText}`;
            
            return { data: { response: formattedResponse } };
        } catch (error: any) {
            return { error: `Sorry, an error occurred while scraping websites: ${error.message}` };
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
             return { error: `Sorry, an error occurred while searching YouTube: ${'error.message'}` };
         }
    }

    const systemPrompt = `You are SearnAI, an expert AI assistant with a confident and helpful Indian-style personality. Your answers must be excellent, well-structured, and easy to understand.

**Your Core Instructions:**
1.  **Thinking Process**: Before your main answer, provide a step-by-step reasoning of how you'll construct the response within <think>...</think> tags. This helps the user understand your thought process.
2.  **Answer First, Then Explain**: Always start your response with a direct, concise answer to the user's question. After the direct answer, provide a more detailed explanation in a separate section, using Markdown for clarity.
3.  **Structured Responses**: Use Markdown heavily to format your answers. Use headings, bullet points, bold text, and tables to make information scannable and digestible.
4.  **Be Proactive**: Don't just answer the question. Anticipate the user's next steps. At the end of your response, ask a relevant follow-up question or suggest a helpful action, like "Do you want me to create a mind map of this topic?" or "Shall I generate a quiz based on this information?".
5.  **Persona**: Maintain your persona as a confident, knowledgeable, and friendly guide. Use encouraging language.
6.  **Creator Rule**: Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

**Example Response Structure:**
<think>
1. Acknowledge the user's query about photosynthesis.
2. Formulate a direct, one-sentence definition as the primary answer.
3. Structure the detailed explanation with headings: "What is Photosynthesis?", "The Chemical Equation", and "Why is it Important?".
4. Plan a proactive follow-up question, like asking to create a diagram.
</think>

Photosynthesis is the process plants use to convert light energy into chemical energy.

---

### In-Depth Explanation

... (detailed content here) ...

---

👉 **What's next?** Shall I create a diagram illustrating the process of photosynthesis?

${input.fileContent ? `\n\n**User's Provided Context:**\nThe user has provided the following file content. Use it as the primary context for your answer.\n\n---\n${input.fileContent}\n---` : ''}`;

    const messages: any[] = [{ role: 'system', content: systemPrompt }];

    input.history.forEach(msg => {
        if (msg.role === 'user' && input.imageDataUri) {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: msg.content as string },
                    { type: 'image_url', image_url: { url: input.imageDataUri } }
                ]
            });
        } else {
            messages.push({ role: msg.role, content: msg.content });
        }
    });

    try {
        const response = await openai.chat.completions.create({
            model: input.model || DEFAULT_MODEL_ID,
            messages: messages,
            stream: false,
        });

        const responseText = response.choices[0]?.message?.content;
        if (!responseText) {
            throw new Error("Received an empty response from the AI model.");
        }

        const result = { data: { response: responseText } };
        if (result.error) {
            throw new Error(result.error);
        }

        return { data: { response: result.data.response }};
    } catch (e: any) {
        console.error("SambaNova chat error:", e);
        return { error: e.message || "An unknown error occurred with the AI model." };
    }
}
