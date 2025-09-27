
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

export async function generalChatAction(
    input: GeneralChatInput & { fileContent?: string | null },
): Promise<ActionResult<GeneralChatOutput>> {
    
    let messages: any[] = [];
    
    // Add system prompt
    messages.push({ role: 'system', content: chatSystemPrompt });

    // Add conversation history
    input.history.forEach((h: any) => {
        if (h.role === 'user') {
            const userMessage: any = { role: 'user', content: [] };
            
            // Handle text content
            if (typeof h.content === 'string') {
                userMessage.content.push({ type: 'text', text: h.content });
            } else if (Array.isArray(h.content)) { // Handle multipart content from previous turns
                 h.content.forEach((part: any) => {
                    if (part.type === 'text') {
                        userMessage.content.push({ type: 'text', text: part.text });
                    } else if (part.type === 'image_url') {
                        userMessage.content.push({ type: 'image_url', image_url: { url: part.image_url.url } });
                    }
                });
            }

            // Add the new image for the current turn, if it exists
            if (h.role === 'user' && input.history[input.history.length - 1] === h && input.imageDataUri) {
                userMessage.content.push({ type: 'image_url', image_url: { url: input.imageDataUri } });
            }

            messages.push(userMessage);

        } else if (h.role === 'model') {
            messages.push({ role: 'assistant', content: h.content });
        }
    });

    if (input.fileContent) {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === 'user') {
             // Find the text part and amend it. If no text part, add one.
            let textPart = lastUserMessage.content.find((p: any) => p.type === 'text');
            const fileContext = `\n\nThe user has attached a file with the following content, please use it as context for your response:\n\n---\n${input.fileContent}\n---`;
            if (textPart) {
                textPart.text += fileContext;
            } else {
                lastUserMessage.content.unshift({ type: 'text', text: fileContext });
            }
        }
    }


    const sambaModels = [
        'gpt-oss-120b',
        'Llama-4-Maverick-17B-128E-Instruct',
        'DeepSeek-R1-0528',
        'DeepSeek-V3-0324',
        'DeepSeek-V3.1',
        'Meta-Llama-3.1-8B-Instruct',
        'DeepSeek-R1-Distill-Llama-70B',
        'Meta-Llama-3.3-70B-Instruct',
        'Qwen3-32B',
        'Llama-3.3-Swallow-70B-Instruct-v0.4',
    ];
    
    let lastError: any = null;

    // 1. Try SambaNova models in order
    if (process.env.SAMBANOVA_API_KEY && process.env.SAMBANOVA_BASE_URL) {
        const sambaMessages = messages
            .map(m => {
                if (m.role === 'system') return m;
                if (Array.isArray(m.content)) {
                    // For now, only take the text part for SambaNova, as it doesn't support images
                    const textPart = m.content.find((p: any) => p.type === 'text')?.text || '';
                    return { role: m.role, content: textPart };
                }
                return { role: m.role, content: m.content };
            })
            .filter(m => m.content); // Filter out messages that became empty
            
        for (const model of sambaModels) {
            try {
                // If there's an image, we must use a vision-capable model.
                // We'll skip non-vision models in SambaNova and fall back to NVIDIA
                if (input.imageDataUri) {
                     continue;
                }

                if (!model) continue; // Skip if model name is empty

                const response = await sambaClient.chat.completions.create({
                    model: model,
                    messages: sambaMessages,
                    temperature: 0.8,
                });
        
                if (response.choices?.[0]?.message?.content) {
                    return { data: { response: response.choices[0].message.content } };
                }
            } catch (sambaError: any) {
                lastError = sambaError;
                console.warn(`SambaNova model '${model}' failed. Trying next model.`, sambaError.message);
                if (isRateLimitError(sambaError)) {
                    console.warn("SambaNova rate limit reached. Proceeding to fallback.");
                    break; 
                }
            }
        }
    } else {
        console.warn("SambaNova API credentials not configured. Skipping SambaNova models.");
    }
        
    // 2. Fallback to NVIDIA
    try {
        const nvidiaModelName = 'nvidia/nvidia-nemotron-nano-9b-v2';
        if (!process.env.NVIDIA_API_KEY || !process.env.NVIDIA_BASE_URL || !nvidiaModelName) {
           throw new Error("NVIDIA API key, base URL, or model name is not configured for fallback.");
       }

       const nvidiaMessages = messages
           .filter(m => m.role !== 'system')
           .map(m => {
               if (Array.isArray(m.content)) {
                   // NVIDIA does not support multipart messages, so extract text
                   const textPart = m.content.find((p: any) => p.type === 'text')?.text || '';
                   return { role: m.role === 'assistant' ? 'assistant' : 'user', content: textPart };
               }
               return m.role === 'assistant' ? { role: 'assistant', content: m.content} : { role: 'user', content: m.content };
           })
           .filter(m => m.content); // Filter out messages that became empty
           
       const nvidiaResponse = await nvidiaClient.chat.completions.create({
           model: nvidiaModelName,
           messages: nvidiaMessages,
           temperature: 0.8,
       });

       if (nvidiaResponse.choices?.[0]?.message?.content) {
           return { data: { response: nvidiaResponse.choices[0].message.content } };
       } else {
           throw new Error("Received an empty or invalid response from NVIDIA.");
       }
    } catch (fallbackError: any) {
        console.error("All models failed.", { lastSambaError: lastError?.message, fallbackError: fallbackError.message });
        if (isRateLimitError(lastError) || isRateLimitError(fallbackError)) {
            return { error: "API_LIMIT_EXCEEDED" };
        }
        return { error: fallbackError.message || "All AI models are currently unavailable. Please try again later." };
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

    
    