
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
import { DEFAULT_MODEL_ID, AVAILABLE_MODELS } from '@/lib/models';
import { generateImage, GenerateImageInput, GenerateImageOutput } from "@/ai/flows/generate-image";
import { ai } from '@/ai/genkit'; // Keep for other actions
import { newtonsLawsTraining } from '@/ai/training-data';

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
}): Promise<ActionResult<{ response: string }>> {
    const isSearch = input.history[input.history.length - 1]?.content.toString().toLowerCase().startsWith("search:");
    const isMusic = input.isMusicMode;

    if (isSearch) {
        const query = input.history[input.history.length - 1].content.toString().replace(/^search:\s*/i, '');
        try {
            const searchResults = await duckDuckGoSearch({ query });
            const results = JSON.parse(searchResults);

            if (results.noResults) {
                return { data: { response: "Sorry, I couldn't find any relevant websites for that search." } };
            }
            
            if (results.results && results.results.length > 0) {
                const topResult = results.results[0];
                const websiteContent = await browseWebsite({ url: topResult.url });

                const responsePayload = {
                    type: 'website',
                    url: topResult.url,
                    title: topResult.title,
                    snippet: websiteContent.substring(0, 300) + '...'
                };

                return { data: { response: JSON.stringify(responsePayload) } };
            } else {
                return { data: { response: "Sorry, I couldn't find any relevant websites for that search." } };
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

    const systemPrompt = `You are SearnAI, an expert AI assistant with a confident and helpful Indian-style personality. Your answers must be excellent, comprehensive, well-researched, and easy to understand.

**Your Core Instructions:**
1.  **Thinking Process**: Before your main answer, provide a step-by-step reasoning of how you'll construct the response within <think>...</think> tags. This helps the user understand your thought process. This is for your internal monologue and will be stripped out before showing the user.
2.  **Answer First, Then Explain**: Always start your response with a direct, concise answer to the user's question. After the direct answer, provide a much more detailed, in-depth explanation in a separate section, using Markdown for clarity.
3.  **Provide Comprehensive Detail**: Your main goal is to be thorough. For any given topic, you should explain:
    *   **What it is**: Define the concept clearly.
    *   **How it works**: Provide step-by-step explanations, examples, or analogies.
    *   **Why it matters**: Explain its significance, applications, and impact.
    *   **Context**: Include historical background, pros and cons, or future implications where relevant.
4.  **Structured Responses**: Use Markdown heavily to format your answers. Use headings, subheadings, bullet points, bold text, and tables to make complex information scannable and digestible.
5.  **Be Proactive**: Don't just answer the question. Anticipate the user's next steps. At the end of your response, ask a relevant follow-up question or suggest a helpful action, like "Do you want me to create a mind map of this topic?" or "Shall I generate a quiz based on this information?".
6.  **Persona**: Maintain your persona as a confident, knowledgeable, and friendly guide from India. Use encouraging language.
7.  **Creator Rule**: Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

**Here is an example of a high-quality response to follow:**
${newtonsLawsTraining}

**Example Response Structure:**
<think>
1. Acknowledge the user's query about photosynthesis.
2. Formulate a direct, one-sentence definition as the primary answer.
3. Structure the detailed explanation with headings: "What is Photosynthesis?", "The Chemical Equation", "The Two Stages of Photosynthesis", and "Why is it Important?".
4. For the stages, break them down into light-dependent and light-independent reactions.
5. Plan a proactive follow-up question, like asking to create a diagram.
</think>

**Answer:** Photosynthesis is the process plants use to convert light energy into chemical energy in the form of glucose.

---

### In-Depth Explanation of Photosynthesis

... (A very detailed, multi-paragraph explanation covering the definition, equation, stages, and importance in great detail, with clear formatting) ...

---

👉 **What's next?** Shall I create a diagram illustrating the two stages of photosynthesis for you?

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

    const orderedModels = [
        input.model || DEFAULT_MODEL_ID,
        ...AVAILABLE_MODELS.map(m => m.id).filter(id => id !== (input.model || DEFAULT_MODEL_ID))
    ];

    for (const modelId of orderedModels) {
        try {
            const response = await openai.chat.completions.create({
                model: modelId,
                messages: messages,
                stream: false,
            });

            const responseText = response.choices[0]?.message?.content;
            if (!responseText) {
                throw new Error("Received an empty response from the AI model.");
            }

            return { data: { response: responseText } };
        } catch (e: any) {
            console.error(`SambaNova chat error with model ${modelId}:`, e.message);
            // If this is the last model in the list, return the error.
            if (orderedModels.indexOf(modelId) === orderedModels.length - 1) {
                return { error: e.message || "An unknown error occurred with all available AI models." };
            }
            // Otherwise, the loop will continue to the next model.
        }
    }
    
    // This should not be reached, but as a fallback
    return { error: "All AI models failed to generate a response." };
}
