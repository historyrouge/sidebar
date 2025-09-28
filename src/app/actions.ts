
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
import { generatePresentation, GeneratePresentationInput, GeneratePresentationOutput as GeneratePresentationOutputFlow } from "@/ai/flows/generate-presentation";
import { generateEditedContent, GenerateEditedContentInput, GenerateEditedContentOutput as GenerateEditedContentOutputFlow } from "@/ai/flows/generate-edited-content";
import { imageToText, ImageToTextInput, ImageToTextOutput as ImageToTextOutputFlow } from "@/ai/flows/image-to-text";
import { AnalyzeCodeOutput } from "@/lib/code-analysis-types";
import { openai as sambaClient } from "@/lib/openai";
import { openai as nvidiaClient } from "@/lib/nvidia";
import { GenerateQuestionPaperInput, GenerateQuestionPaperOutput as GenerateQuestionPaperOutputFlow } from "@/lib/question-paper-types";
import { ai, visionModel, googleAI } from "@/ai/genkit";
import { MessageData, Part } from "genkit";


export type ModelKey = 'gemini' | 'qwen';
export type ChatModel = 'samba' | 'nvidia';

// Extend GeneralChatInput to include an optional prompt for specific scenarios
export type GeneralChatInput = GeneralChatInputFlow & {
  prompt?: string;
  model?: ChatModel;
  imageDataUri?: string | null;
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
export type GeneratePresentationOutput = GeneratePresentationOutputFlow;
export type GenerateEditedContentOutput = GenerateEditedContentOutputFlow;
export type ImageToTextOutput = ImageToTextOutputFlow;


function isRateLimitError(e: any): boolean {
  if (e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('limit')) {
    return true;
  }
  return false;
}

const analysisSystemPrompt = `You are an expert educator and AI tool named SearnAI. Your style is that of a confident and helpful Indian guide. You provide clear, correct, and engaging answers. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

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
        // Step 1: Extract text from the image using OCR (imageToText flow)
        const ocrResult = await imageToText(input);
        if (!ocrResult.text) {
            throw new Error("Could not extract any text from the image. Please try a clearer image.");
        }
        
        // Combine extracted text with the user's optional prompt
        let combinedContent = ocrResult.text;
        if (input.prompt) {
            combinedContent = `User's prompt: "${input.prompt}"\n\nExtracted text from image:\n---\n${ocrResult.text}`;
        }

        // Step 2: Analyze the extracted text using the standard text analysis action
        const analysisResult = await analyzeContentAction(combinedContent);

        if (analysisResult.error) {
            throw new Error(analysisResult.error);
        }

        // The output of analyzeContentAction fits the structure required by AnalyzeImageContentOutput,
        // but we'll cast it to be sure. We are losing the diagram/entity-specific fields here.
        const output: AnalyzeImageContentOutput = {
            summary: analysisResult.data?.summary || '',
            keyConcepts: analysisResult.data?.keyConcepts || [],
            codeExamples: analysisResult.data?.codeExamples || [],
            potentialQuestions: analysisResult.data?.potentialQuestions || [],
            relatedTopics: analysisResult.data?.relatedTopics || [],
            entities: { people: [], places: [], dates: [] }, // This data is lost in the new flow
            diagrams: [], // This data is lost in the new flow
        };

        return { data: output };
    } catch (e: any) {
        console.error("Image Analysis Action Error:", e);
        if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
        return { error: e.message || "An unknown error occurred during image analysis." };
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
    const prompt = `You are SearnAI, an expert AI tutor. Your style is that of a confident and helpful Indian guide who provides clear and engaging answers. Your goal is to help the user understand the provided study material. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students. The conversation history is: '''${'\"'}'''${JSON.stringify(input.history)}'''${'\"'}'''. The full study material is: --- ${input.content} ---. Now, please respond to the last user message: "${lastMessage.content}".`;

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
      return { error: e.message || "An unexpected error occurred." };
    }
}

const chatSystemPrompt = `You are a powerful AI named SearnAI. Your personality is that of a confident, witty, and expert Indian guide.

Your primary goal is to provide clear, accurate, and exceptionally well-structured answers. Follow these rules:
1.  **Direct & Concise First**: For simple, factual questions, give a short, direct answer first.
2.  **Detailed Explanations for Study Topics**: If the user asks about an academic or complex topic, provide a thorough, well-structured explanation. Use Markdown for clarity:
    *   Start with a summary or definition.
    *   Use headings (e.g., \`### Section Title\`) for main sections.
    *   Use tables for comparisons or data.
    *   Use bullet points for lists.
    *   **CRITICAL**: Use standard LaTeX for all mathematical formulas. Use single dollar signs for inline math (e.g., $a^2 + b^2 = c^2$) and double dollar signs for block math (e.g., $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$). Do NOT use any other delimiters like square brackets.
3.  **Natural Language**: Write in a helpful, educational, and professional tone. Avoid overly casual slang, but you can use the word "mate" occasionally in conversational contexts.
4.  **No Code for Non-Code**: Do NOT wrap your general text responses in markdown code fences (\`\`\`).
5.  **Handle File Generation**: If the user asks for a file like a PDF or a downloadable document, generate the content for that file directly in your response, formatted in clean Markdown. Do not ask the user to create the file themselves.
6.  **Proactive Assistance**: After answering a detailed question, proactively ask a follow-up question. Suggest a mind-map, a flowchart, more examples, or a mnemonic to help them learn.
7.  **Identity**: Only if asked about your creator, say you were built by Harsh and some Srichaitanya students. Never apologize. Always be constructive.`;

const sambaModelFallbackOrder = [
    'Llama-4-Maverick-17B-128E-Instruct',
    'Meta-Llama-3.3-70B-Instruct',
    'Llama-3.3-Swallow-70B-Instruct-v0.4',
    'gpt-oss-120b',
    'DeepSeek-R1-Distill-Llama-70B',
    'Qwen3-32B',
    'Meta-Llama-3.1-8B-Instruct',
    'DeepSeek-R1-0528',
    'DeepSeek-V3-0324',
    'DeepSeek-V3.1'
];

const nvidiaModelFallbackOrder = [
    'nvidia/llama3-70b',
    'nvidia/llama3-8b',
    'mistralai/mistral-7b-instruct-v0.2',
];


async function tryChatCompletion(
    provider: 'samba' | 'nvidia',
    models: string[],
    prompt: string
): Promise<string> {
    
    let client: typeof sambaClient | typeof nvidiaClient | null = null;
    let isConfigured = false;
    
    if (provider === 'samba') {
        if (process.env.SAMBANOVA_API_KEY && process.env.SAMBANOVA_BASE_URL) {
            client = sambaClient;
            isConfigured = true;
        }
    } else if (provider === 'nvidia') {
         if (process.env.NVIDIA_API_KEY && process.env.NVIDIA_BASE_URL) {
            client = nvidiaClient;
            isConfigured = true;
        }
    }

    if (!isConfigured) {
        throw new Error(`Provider ${provider} is not configured.`);
    }


    // For Samba and NVIDIA
    for (const modelName of models) {
        try {
            console.log(`Trying model: ${modelName} with provider: ${provider}`);
            const response = await (client as typeof sambaClient).chat.completions.create({
                model: modelName,
                messages: [{ role: 'user', content: prompt }],
                stream: false,
                response_format: { type: 'text' },
            });

            if (response.choices?.[0]?.message?.content) {
                return response.choices[0].message.content;
            }
            throw new Error('Empty response from model.');
        } catch (error: any) {
            console.warn(`Model ${modelName} failed:`, error.message);
            if (isRateLimitError(error)) {
                continue; // Try the next model if it's a rate limit error
            }
            // Do not rethrow other errors, just continue to the next model
        }
    }
    throw new Error(`All models for provider ${provider} failed or were rate-limited.`);
}


export async function generalChatAction(
    input: GeneralChatInput & { fileContent?: string | null },
): Promise<ActionResult<GeneralChatOutput>> {
    
    const { history, prompt: contextPrompt, imageDataUri, fileContent } = input;
    const lastUserMessage = history[history.length - 1];

    try {
        let responseText: string;

        // Construct the unified prompt string for all chats
        let fullPrompt = chatSystemPrompt;
        if (contextPrompt) {
            fullPrompt = `${contextPrompt}\n\n${fullPrompt}`;
        }

        const conversationHistory = history.slice(0, -1).map(h => `${h.role === 'user' ? 'User' : 'SearnAI'}: ${h.content}`).join('\n\n');
        fullPrompt += `\n\n--- Conversation History ---\n${conversationHistory}`;
        
        let userContent = lastUserMessage.content as string;
        // If fileContent (from OCR or .txt) exists, append it as context
        if (fileContent) {
            userContent += `\n\nThe user has attached a file with the following content, please use it as context for your response:\n\n---\n${fileContent}\n---`;
        }
        fullPrompt += `\n\nUser: ${userContent}\n\nSearnAI:`;

        try {
            responseText = await tryChatCompletion('samba', sambaModelFallbackOrder, fullPrompt);
        } catch (sambaError: any) {
            console.warn("SambaNova models failed, falling back to NVIDIA.", sambaError.message);
            try {
                responseText = await tryChatCompletion('nvidia', nvidiaModelFallbackOrder, fullPrompt);
            } catch (nvidiaError: any) {
                console.error("All primary and secondary models (SambaNova, NVIDIA) have failed.", nvidiaError.message);
                return { error: "All available AI models are currently offline or have reached their limits. Please try again later." };
            }
        }

        return { data: { response: responseText } };

    } catch (e: any) {
        console.error("Chat Action Error:", e);
        if (isRateLimitError(e)) {
            return { error: "API_LIMIT_EXCEEDED" };
        }
        return { error: e.message || "An unexpected error occurred." };
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

export async function streamTextToSpeech(text: string): Promise<Response> {
    try {
        const { stream } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Algenib' },
                    },
                },
            },
            prompt: text,
            stream: true,
        });

        const readableStream = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    if (chunk.media) {
                        const audioContent = chunk.media.url.substring(chunk.media.url.indexOf(',') + 1);
                        controller.enqueue(Buffer.from(audioContent, 'base64'));
                    }
                }
                controller.close();
            },
        });
        
        return new Response(readableStream, {
            headers: {
                'Content-Type': 'audio/pcm',
            },
        });

    } catch (error: any) {
        console.error('TTS Streaming Error:', error);
        return new Response(error.message || 'Failed to generate audio', {
            status: 500,
        });
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
    const prompt = `You are SearnAI. Your personality is that of a confident and helpful Indian guide. Please provide a concise, one-paragraph summary of the following content. --- ${input.content} ---`;
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


export type { GetYoutubeTranscriptInput, GenerateQuizzesSambaInput as GenerateQuizzesInput, GenerateFlashcardsSambaInput as GenerateFlashcardsInput, ChatWithTutorInput, HelpChatInput, TextToSpeechInput, GenerateImageInput, AnalyzeCodeInput, SummarizeContentInput, GenerateMindMapInput, GenerateQuestionPaperInput, AnalyzeImageContentInput, GenerateEbookChapterInput, GeneratePresentationInput, GenerateEditedContentInput, ImageToTextInput };

    
    

  


    

