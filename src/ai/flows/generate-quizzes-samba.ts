
'use server';

/**
 * @fileOverview Quiz generation AI agent using SambaNova or Puter.js.
 *
 * - generateQuizzesSamba - A function that handles the quiz generation process.
 * - GenerateQuizzesSambaInput - The input type for the generateQuizzesSamba function.
 * - GenerateQuizzesSambaOutput - The return type for the generateQuizzesSamba function.
 */
import { openai } from '@/lib/openai';
import { z } from 'zod';
import { ModelKey } from '@/hooks/use-model-settings';

declare const puter: any;

const GenerateQuizzesSambaInputSchema = z.object({
  content: z.string().describe('The content from which to generate quizzes.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe('The desired difficulty of the quiz.'),
  numQuestions: z.number().optional().describe('The number of questions to generate.'),
});
export type GenerateQuizzesSambaInput = z.infer<typeof GenerateQuizzesSambaInputSchema>;

const QuizSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).min(4).max(4).describe('An array of 4 possible answers for the question.'),
  answer: z.string().describe('The correct answer to the question.'),
  type: z.literal('multiple-choice').describe('The type of question.'),
});

const GenerateQuizzesSambaOutputSchema = z.object({
  quizzes: z.array(QuizSchema).describe('The generated multiple-choice quizzes.'),
});
export type GenerateQuizzesSambaOutput = z.infer<typeof GenerateQuizzesSambaOutputSchema>;


const quizSystemPrompt = `You are an expert educator and quiz generator. Your task is to generate a multiple-choice quiz from the provided content.
Generate {{numQuestions}} questions. For each question, you MUST provide:
1. A 'question' text.
2. An array of 4 'options'. One of the options must be the correct answer.
3. The 'answer' text, which must exactly match one of the provided options.
4. The 'type', which must always be 'multiple-choice'.

The difficulty of the quiz should be {{difficulty}}.

You must respond in a valid JSON format. The JSON object should match the following schema:
{
    "type": "object",
    "properties": {
        "quizzes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": { "type": "string" },
                    "options": { "type": "array", "items": { "type": "string" }, "minItems": 4, "maxItems": 4 },
                    "answer": { "type": "string" },
                    "type": { "type": "string", "const": "multiple-choice" }
                },
                "required": ["question", "options", "answer", "type"]
            }
        }
    },
    "required": ["quizzes"]
}

Content to generate the quiz from:
---
{{content}}
---
`;

const buildPrompt = (input: GenerateQuizzesSambaInput): string => {
    return quizSystemPrompt
        .replace('{{numQuestions}}', String(input.numQuestions || 10))
        .replace('{{difficulty}}', input.difficulty || 'medium')
        .replace('{{content}}', input.content);
};

export async function generateQuizzesSamba(input: GenerateQuizzesSambaInput, model: ModelKey): Promise<GenerateQuizzesSambaOutput> {
    const prompt = buildPrompt(input);
    let jsonResponseString: string;

    if (model === 'puter') {
         if (typeof puter === 'undefined') {
            throw new Error("Puter.js is not loaded or configured.");
        }
        const response = await puter.ai.chat(prompt);
        jsonResponseString = typeof response === 'object' && response.text ? response.text : String(response);
    } else { // Default to Samba
        if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
            throw new Error("SambaNova API key or base URL is not configured.");
        }
        try {
            const response = await openai.chat.completions.create({
                model: 'Meta-Llama-3.1-8B-Instruct',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
                temperature: 0.7,
            });

            if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
                throw new Error("Received an empty or invalid response from SambaNova.");
            }
            jsonResponseString = response.choices[0].message.content;
        } catch (error: any) {
            console.error("SambaNova quiz generation error:", error);
            throw new Error(error.message || "An unknown error occurred while generating quizzes with SambaNova.");
        }
    }

    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        const validatedOutput = GenerateQuizzesSambaOutputSchema.parse(jsonResponse);
        return validatedOutput;
    } catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string received:", jsonResponseString);
        throw new Error("The AI model returned an invalid JSON format. Please try again.");
    }
}
