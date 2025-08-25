
'use server';

/**
 * @fileOverview Flashcard generation AI agent using SambaNova.
 *
 * - generateFlashcardsSamba - A function that handles the flashcard generation process with SambaNova.
 * - GenerateFlashcardsSambaInput - The input type for the generateFlashcardsSamba function.
 * - GenerateFlashcardsSambaOutput - The return type for the generateFlashcardsSamba function.
 */

import { openai } from '@/lib/openai';
import { z } from 'zod';

const GenerateFlashcardsSambaInputSchema = z.object({
  content: z
    .string()
    .describe('The content from which to generate flashcards.'),
});
export type GenerateFlashcardsSambaInput = z.infer<typeof GenerateFlashcardsSambaInputSchema>;

const GenerateFlashcardsSambaOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().describe('The front side of the flashcard.'),
      back: z.string().describe('The back side of the flashcard.'),
    })
  ).describe('The generated flashcards.'),
});
export type GenerateFlashcardsSambaOutput = z.infer<typeof GenerateFlashcardsSambaOutputSchema>;


const flashcardSystemPrompt = `You are an expert educator. Your task is to generate flashcards from the provided content.
Generate flashcards covering key facts and concepts from the content. Each flashcard should have a front and a back.
You must respond in JSON format. The JSON object should match the following schema:
{
    "type": "object",
    "properties": {
        "flashcards": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "front": { "type": "string", "description": "The front side of the flashcard (a question or term)." },
                    "back": { "type": "string", "description": "The back side of the flashcard (the answer or definition)." }
                },
                "required": ["front", "back"]
            }
        }
    },
    "required": ["flashcards"]
}
`;


export async function generateFlashcardsSamba(input: GenerateFlashcardsSambaInput): Promise<GenerateFlashcardsSambaOutput> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }

    try {
        const response = await openai.chat.completions.create({
            model: 'Llama-4-Maverick-17B-128E-Instruct',
            messages: [
                {
                    role: 'system',
                    content: flashcardSystemPrompt,
                },
                {
                    role: 'user',
                    content: input.content,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from SambaNova.");
        }

        const jsonResponse = JSON.parse(response.choices[0].message.content);
        
        // Validate the response against the Zod schema
        const validatedOutput = GenerateFlashcardsSambaOutputSchema.parse(jsonResponse);
        
        return validatedOutput;

    } catch (error: any) {
        console.error("SambaNova flashcard generation error:", error);
        throw new Error(error.message || "An unknown error occurred while generating flashcards with SambaNova.");
    }
}
