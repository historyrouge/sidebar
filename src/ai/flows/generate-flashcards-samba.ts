
'use server';

/**
 * @fileOverview Flashcard generation AI agent using SambaNova.
 *
 * - generateFlashcardsSamba - A function that handles the flashcard generation process with SambaNova.
 * - GenerateFlashcardsSambaInput - The input type for the generateFlashcardsSambaInput function.
 * - GenerateFlashcardsSambaOutput - The return type for the generateFlashcardsSambaInput function.
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
      front: z.string().describe('The front side of the flashcard (a question or term).'),
      back: z.string().describe('The back side of the flashcard (a detailed answer or definition).'),
      category: z.string().describe('A category for the flashcard (e.g., "Definition", "Key Concept", "Example").'),
      color: z.enum(['blue', 'green', 'purple', 'orange', 'red']).describe('A suggested color for the flashcard.'),
      relatedTopics: z.array(z.string()).describe('A list of 1-3 related topics.'),
    })
  ).describe('The generated flashcards.'),
});
export type GenerateFlashcardsSambaOutput = z.infer<typeof GenerateFlashcardsSambaOutputSchema>;


const flashcardSystemPrompt = `You are an expert educator. Your task is to generate flashcards from the provided content.
Generate flashcards covering key facts and concepts from the content. Each flashcard should have a front (question/term) and a back (detailed answer).
For each flashcard, you MUST also provide:
1. A concise 'category' (e.g., "Definition", "Key Concept", "Important Date", "Formula", "Example").
2. A 'color' suggestion from the following options: 'blue', 'green', 'purple', 'orange', 'red'. Choose a color that fits the topic.
3. A list of 1-3 'relatedTopics' for further study.

You must respond in JSON format. The JSON object should match the following schema:
{
    "type": "object",
    "properties": {
        "flashcards": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "front": { "type": "string" },
                    "back": { "type": "string" },
                    "category": { "type": "string" },
                    "color": { "type": "string", "enum": ["blue", "green", "purple", "orange", "red"] },
                    "relatedTopics": { "type": "array", "items": { "type": "string" } }
                },
                "required": ["front", "back", "category", "color", "relatedTopics"]
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
