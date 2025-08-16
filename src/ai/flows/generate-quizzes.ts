'use server';

/**
 * @fileOverview Automatically generates quizzes from provided content.
 *
 * - generateQuizzes - A function that generates quizzes from the provided content.
 * - GenerateQuizzesInput - The input type for the generateQuizzes function.
 * - GenerateQuizzesOutput - The return type for the generateQuizzes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizzesInputSchema = z.object({
  content: z
    .string()
    .describe('The content to generate quizzes from.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe('The desired difficulty of the quiz.'),
});

export type GenerateQuizzesInput = z.infer<typeof GenerateQuizzesInputSchema>;

const GenerateQuizzesOutputSchema = z.object({
  quizzes: z.array(
    z.object({
      question: z.string().describe('The question text.'),
      options: z.array(z.string()).describe('An array of 4 possible answers for the question.'),
      answer: z.string().describe('The correct answer to the question.'),
      type: z.literal('multiple-choice').describe('The type of question.'),
    })
  ).describe('The generated multiple-choice quizzes.'),
});

export type GenerateQuizzesOutput = z.infer<typeof GenerateQuizzesOutputSchema>;

export async function generateQuizzes(input: GenerateQuizzesInput): Promise<GenerateQuizzesOutput> {
  return generateQuizzesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizzesPrompt',
  input: {schema: GenerateQuizzesInputSchema},
  output: {schema: GenerateQuizzesOutputSchema},
  prompt: `You are a quiz generator. Generate a list of multiple-choice quiz questions from the following content. For each question, provide the question text, an array of 4 different options, and the correct answer.

{{#if difficulty}}
The quiz should be of {{difficulty}} difficulty.
{{/if}}

Content: {{{content}}}`,
});

const generateQuizzesFlow = ai.defineFlow(
  {
    name: 'generateQuizzesFlow',
    inputSchema: GenerateQuizzesInputSchema,
    outputSchema: GenerateQuizzesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
