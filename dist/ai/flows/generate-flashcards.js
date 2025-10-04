"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFlashcards = generateFlashcards;
/**
 * @fileOverview Flashcard generation AI agent.
 *
 * - generateFlashcards - A function that handles the flashcard generation process.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const GenerateFlashcardsInputSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .describe('The content from which to generate flashcards.'),
});
const GenerateFlashcardsOutputSchema = zod_1.z.object({
    flashcards: zod_1.z.array(zod_1.z.object({
        front: zod_1.z.string().describe('The front side of the flashcard.'),
        back: zod_1.z.string().describe('The back side of the flashcard.'),
    })).describe('The generated flashcards.'),
});
async function generateFlashcards(input) {
    return generateFlashcardsFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'generateFlashcardsPrompt',
    input: { schema: GenerateFlashcardsInputSchema },
    output: { schema: GenerateFlashcardsOutputSchema },
    prompt: `You are an expert educator. Your task is to generate flashcards from the provided content.

Content: {{{content}}}

Generate flashcards covering key facts and concepts from the content. Each flashcard should have a front and back.

Output the flashcards in JSON format.
`,
});
const generateFlashcardsFlow = genkit_1.ai.defineFlow({
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
