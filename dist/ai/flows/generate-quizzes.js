"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuizzes = generateQuizzes;
/**
 * @fileOverview Automatically generates quizzes from provided content.
 *
 * - generateQuizzes - A function that generates quizzes from the provided content.
 * - GenerateQuizzesInput - The input type for the generateQuizzes function.
 * - GenerateQuizzesOutput - The return type for the generateQuizzes function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const GenerateQuizzesInputSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .describe('The content to generate quizzes from.'),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional().describe('The desired difficulty of the quiz.'),
    numQuestions: zod_1.z.number().optional().describe('The number of questions to generate.'),
});
const GenerateQuizzesOutputSchema = zod_1.z.object({
    quizzes: zod_1.z.array(zod_1.z.object({
        question: zod_1.z.string().describe('The question text.'),
        options: zod_1.z.array(zod_1.z.string()).describe('An array of 4 possible answers for the question.'),
        answer: zod_1.z.string().describe('The correct answer to the question.'),
        type: zod_1.z.string().describe('The type of question. This should always be \'multiple-choice\'.'),
    })).describe('The generated multiple-choice quizzes.'),
});
async function generateQuizzes(input) {
    return generateQuizzesFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'generateQuizzesPrompt',
    input: { schema: GenerateQuizzesInputSchema },
    output: { schema: GenerateQuizzesOutputSchema },
    prompt: `You are a quiz generator. Generate a list of {{numQuestions}} multiple-choice quiz questions from the following content. For each question, provide the question text, an array of 4 different options, and the correct answer.

{{#if difficulty}}
The quiz should be of {{difficulty}} difficulty.
{{/if}}

Content: {{{content}}}`,
});
const generateQuizzesFlow = genkit_1.ai.defineFlow({
    name: 'generateQuizzesFlow',
    inputSchema: GenerateQuizzesInputSchema,
    outputSchema: GenerateQuizzesOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
