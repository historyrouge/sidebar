
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
  imageDataUri?: string;
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
    const prompt = `You are SearnAI, an expert AI tutor. Your style is that of a confident and helpful Indian guide who provides clear and engaging answers. Your goal is to help the user understand the provided study material. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students. The conversation history is: '''${JSON.stringify(input.history)}'''. The full study material is: --- ${input.content} ---. Now, please respond to the last user message: "${lastMessage.content}".`;

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

const chatSystemPrompt = `You are a powerful AI named SearnAI. Your personality is that of a confident, witty, and helpful Indian guide. You solve problems effectively and provide clear, well-structured answers with headings and lists. Use a friendly, casual tone with emojis ✨.

Your goal is to be collaborative. First, provide a solid, accurate answer to the user's question. Then, proactively ask a follow-up question to see if they want to dive deeper. For example, ask if they want a flowchart, a mind map, more examples, or a mnemonic.

When you need to provide a code snippet, you MUST format it using the special <codeBox> tag. For example:
<codeBox language="python">
def hello_world():
    print("Hello, World!")
</codeBox>

Only if asked about your creator, say you were built by Harsh and some Srichaitanya students. Never apologize. Always suggest a next step or ask a clarifying question.`;

export async function generalChatAction(
    input: GeneralChatInput,
): Promise<ActionResult<GeneralChatOutput>> {
    
    let messages: any[] = [
        { role: 'system', content: chatSystemPrompt },
        ...input.history.map((h: any) => {
            const content = Array.isArray(h.content) ? h.content : [{type: "text", text: h.content}];
            return {
                role: h.role === 'model' ? 'assistant' : 'user',
                content: content,
            }
        })
    ];

    if (input.imageDataUri) {
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage.role === 'user') {
             if (Array.isArray(lastUserMessage.content)) {
                lastUserMessage.content.push({ type: "image_url", image_url: { url: input.imageDataUri }});
            } else {
                 lastUserMessage.content = [
                    { type: "text", text: lastUserMessage.content },
                    { type: "image_url", image_url: { url: input.imageDataUri }}
                 ];
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
        for (const model of sambaModels) {
            try {
                const response = await sambaClient.chat.completions.create({
                    model: model,
                    messages: messages,
                    temperature: 0.8,
                });
        
                if (response.choices?.[0]?.message?.content) {
                    return { data: { response: response.choices[0].message.content } };
                }
            } catch (sambaError: any) {
                lastError = sambaError;
                console.warn(`SambaNova model '${model}' failed. Trying next model.`, sambaError.message);
                // If it's a rate limit error on any SambaNova model, we should stop trying them.
                if (isRateLimitError(sambaError)) {
                    console.warn("SambaNova rate limit reached. Proceeding to final fallback.");
                    break; 
                }
            }
        }
    } else {
        console.warn("SambaNova API credentials not configured. Skipping SambaNova models.");
    }
        
    // 2. If all SambaNova models fail, try NVIDIA as the last resort
    try {
        if (!process.env.NVIDIA_API_KEY || !process.env.NVIDIA_BASE_URL) {
            throw new Error("NVIDIA API key or base URL is not configured for fallback.");
        }

        const nvidiaResponse = await nvidiaClient.chat.completions.create({
            model: 'nvidia/nvidia-nemotron-nano-9b-v2',
            messages: messages,
            temperature: 0.8,
        });

        if (nvidiaResponse.choices?.[0]?.message?.content) {
            return { data: { response: nvidiaResponse.choices[0].message.content } };
        } else {
            throw new Error("Received an empty or invalid response from NVIDIA.");
        }

    } catch (nvidiaError: any) {
        console.error("All models failed.", { lastSambaError: lastError?.message, nvidiaError: nvidiaError.message });
        if (isRateLimitError(lastError) || isRateLimitError(nvidiaError)) {
            return { error: "API_LIMIT_EXCEEDED" };
        }
        return { error: nvidiaError.message || "All AI models are currently unavailable. Please try again later." };
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


export type { GetYoutubeTranscriptInput, GenerateQuizzesSambaInput as GenerateQuizzesInput, GenerateFlashcardsSambaInput as GenerateFlashcardsInput, ChatWithTutorInput, HelpChatInput, TextToSpeechInput, GenerateImageInput, AnalyzeCodeInput, SummarizeContentInput, GenerateMindMapInput, GenerateQuestionPaperInput, AnalyzeImageContentInput, GenerateEbookChapterInput, GeneratePresentationInput, GenerateEditedContentInput };
