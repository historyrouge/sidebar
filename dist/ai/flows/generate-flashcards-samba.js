"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFlashcardsSamba = generateFlashcardsSamba;
/**
 * @fileOverview Flashcard generation AI agent using Qwen.
 *
 * - generateFlashcardsSamba - A function that handles the flashcard generation process with Qwen.
 * - GenerateFlashcardsSambaInput - The input type for the generateFlashcardsSambaInput function.
 * - GenerateFlashcardsSambaOutput - The return type for the generateFlashcardsSambaInput function.
 */
const openai_1 = require("@/lib/openai");
const zod_1 = require("zod");
const GenerateFlashcardsSambaInputSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .describe('The content from which to generate flashcards.'),
});
const GenerateFlashcardsSambaOutputSchema = zod_1.z.object({
    flashcards: zod_1.z.array(zod_1.z.object({
        front: zod_1.z.string().describe('The front side of the flashcard (a question or term).'),
        back: zod_1.z.string().describe('The back side of the flashcard (a detailed answer or definition).'),
        category: zod_1.z.string().describe('A category for the flashcard (e.g., "Definition", "Key Concept", "Example").'),
        color: zod_1.z.enum(['blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'teal', 'gray']).describe('A suggested color for the flashcard.'),
    })).describe('The generated flashcards.'),
});
const flashcardSystemPrompt = `You are SearnAI, an expert educator with a confident and helpful Indian-style personality. Your task is to generate excellent, correct flashcards from the provided content. Your answers should be nice, good, and correct. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.
Generate flashcards covering key facts and concepts from the content. Each flashcard should have a front (question/term) and a back (detailed answer).
For each flashcard, you MUST also provide:
1. A concise 'category' (e.g., "Definition", "Key Concept", "Important Date", "Formula", "Example").
2. A 'color' suggestion from the following options: 'blue', 'green', 'purple', 'orange', 'red', 'yellow', 'pink', 'teal', 'gray'. Choose a color that fits the topic.

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
                    "color": { "type": "string", "enum": ["blue", "green", "purple", "orange", "red", "yellow", "pink", "teal", "gray"] }
                },
                "required": ["front", "back", "category", "color"]
            }
        }
    },
    "required": ["flashcards"]
}
`;
async function generateFlashcardsSamba(input) {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("Qwen API key or base URL is not configured.");
    }
    let jsonResponseString;
    try {
        const response = await openai_1.openai.chat.completions.create({
            model: 'Meta-Llama-3.1-8B-Instruct',
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
            throw new Error("Received an empty or invalid response from Qwen.");
        }
        jsonResponseString = response.choices[0].message.content;
    }
    catch (error) {
        console.error("Qwen flashcard generation error:", error);
        throw new Error(error.message || "An unknown error occurred while generating flashcards with Qwen.");
    }
    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        // Validate the response against the Zod schema
        const validatedOutput = GenerateFlashcardsSambaOutputSchema.parse(jsonResponse);
        return validatedOutput;
    }
    catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string from Qwen:", jsonResponseString);
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
}
