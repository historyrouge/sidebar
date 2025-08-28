
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
import { AnalyzeCodeOutput } from "@/lib/code-analysis-types";
import { openai } from "@/lib/openai";

export type ModelKey = 'gemini' | 'qwen' | 'gpt5';

// Extend GeneralChatInput to include an optional prompt for specific scenarios
export type GeneralChatInput = GeneralChatInputFlow & {
  prompt?: string;
  model?: 'qwen' | 'gemini';
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


function isRateLimitError(e: any): boolean {
  if (e?.message?.includes('429') || e?.message?.toLowerCase().includes('quota') || e?.message?.toLowerCase().includes('limit')) {
    return true;
  }
  return false;
}

const analysisSystemPrompt = `You are an expert educator and AI tool. Your task is to analyze the given content to help students study more effectively. If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student.

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
     const response = await openai.chat.completions.create({
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
    const output = await generateQuizzesSamba(input, 'qwen');
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
    const prompt = `You are an AI tutor. Your goal is to help the user understand the provided study material. Engage in a supportive and encouraging conversation. If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student. The conversation history is: ${JSON.stringify(input.history)}. The full study material is: --- ${input.content} ---. Now, please respond to the last user message: "${lastMessage.content}".`;

    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
      return { error: "Qwen API key or base URL is not configured." };
    }
    const response = await openai.chat.completions.create({
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


export async function generalChatAction(
    input: GeneralChatInput,
): Promise<ActionResult<GeneralChatOutput>> {
    const { history, imageDataUri, prompt, model = 'qwen' } = input;

    if (model === 'qwen') {
      if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        return { error: "Qwen API key or base URL is not configured." };
      }
      
      const messages = history.map((h, i) => {
        const isLastMessage = i === history.length - 1;
        const role = h.role === 'model' ? 'assistant' : 'user';
  
        let content = h.content;
        if (isLastMessage && h.role === 'user' && prompt) {
            content = `${prompt}\n\nUser query: ${h.content}`;
        }
        return { role, content: content };
      });

      // Inject system prompt for Qwen
      const systemMessage = {
          role: 'system',
          content: "You are a helpful AI assistant. If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student."
      };
  
      try {
        const response = await openai.chat.completions.create({
          model: 'Meta-Llama-3.1-8B-Instruct',
          messages: [systemMessage, ...messages as any],
          stream: false,
        });
  
        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
          throw new Error("Received an empty response from the AI.");
        }
        
        return { data: { response: response.choices[0].message.content } };
      } catch (error: any) {
        console.error("Qwen API error:", error);
        if (isRateLimitError(error)) return { error: "API_LIMIT_EXCEEDED" };
        if (error.code === 'ENOTFOUND') {
          return { error: "Could not connect to the Qwen API. Please check the Base URL." };
        }
        return { error: error.message || "An unknown error occurred with the Qwen API." };
      }
    } else { // model is 'gemini'
        try {
            const output = await generalChat(input);
            return { data: output };
        } catch (e: any) {
          console.error(e);
          if (isRateLimitError(e)) return { error: "API_LIMIT_EXCEEDED" };
          return { error: e.message || "An unknown error occurred." };
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
        // Code analysis always uses Qwen
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
    const prompt = `Please provide a concise, one-paragraph summary of the following content. Important: If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student. --- ${input.content} ---`;
    let responseText: string;

    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        return { error: "Qwen API key or base URL is not configured." };
    }
      const response = await openai.chat.completions.create({
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

export type { GetYoutubeTranscriptInput, GenerateQuizzesSambaInput as GenerateQuizzesInput, GenerateFlashcardsSambaInput as GenerateFlashcardsInput, ChatWithTutorInput, HelpChatInput, TextToSpeechInput, GenerateImageInput, AnalyzeCodeInput, SummarizeContentInput };
