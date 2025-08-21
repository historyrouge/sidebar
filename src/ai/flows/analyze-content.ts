
// src/ai/flows/analyze-content.ts
'use server';

/**
 * @fileOverview Analyzes content to identify key concepts and generate potential questions.
 *
 * - analyzeContent - A function that analyzes the content and generates questions.
 * - AnalyzeContentInput - The input type for the analyzeContent function.
 * - AnalyzeContentOutput - The return type for the analyzeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeContentInputSchema = z.object({
  content: z.string().describe('The content to analyze.'),
});
export type AnalyzeContentInput = z.infer<typeof AnalyzeContentInputSchema>;

const AnalyzeContentOutputSchema = z.object({
  summary: z.string().describe('A concise, one-paragraph summary of the content.'),
  keyConcepts: z.array(z.object({
    concept: z.string().describe('The key concept identified.'),
    explanation: z.string().describe('A brief explanation of the concept.'),
  })).describe('Key concepts identified in the content.'),
  potentialQuestions: z.array(z.string()).describe('Potential questions based on the content.'),
  relatedTopics: z.array(z.string()).describe('A list of related topics for further exploration.'),
});
export type AnalyzeContentOutput = z.infer<typeof AnalyzeContentOutputSchema>;

export async function analyzeContent(input: AnalyzeContentInput): Promise<AnalyzeContentOutput> {
  return analyzeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeContentPrompt',
  input: {schema: AnalyzeContentInputSchema},
  output: {schema: AnalyzeContentOutputSchema},
  prompt: `You are an AI tool that analyzes the given content to help students study more effectively.

Content to analyze: {{{content}}}

Perform the following actions:
1.  Generate a concise, one-paragraph summary of the content.
2.  Identify the key concepts. For each concept, provide a brief explanation.
3.  Generate potential questions for factual recall, comprehension, and analysis.
4.  Suggest a list of related topics for further exploration.
`,
});

const analyzeContentFlow = ai.defineFlow(
  {
    name: 'analyzeContentFlow',
    inputSchema: AnalyzeContentInputSchema,
    outputSchema: AnalyzeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
