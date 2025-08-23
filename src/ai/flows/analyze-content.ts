
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
import {z} from 'zod';

const AnalyzeContentInputSchema = z.object({
  content: z.string().describe('The content to analyze.'),
});
export type AnalyzeContentInput = z.infer<typeof AnalyzeContentInputSchema>;

const AnalyzeContentOutputSchema = z.object({
  summary: z.string().describe('A concise, one-paragraph summary of the content.'),
  keyConcepts: z.array(z.object({
    concept: z.string().describe('The key concept identified.'),
    explanation: z.string().describe('A brief explanation of the concept, including its relationship to other concepts.'),
  })).describe('Key concepts identified in the content.'),
    codeExamples: z.array(z.object({
    code: z.string().describe('The code snippet.'),
    explanation: z.string().describe('A brief explanation of what the code does.'),
  })).describe('Code examples found in the content.'),
  potentialQuestions: z.array(z.string()).describe('Potential questions based on the content that test for deep understanding.'),
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
  prompt: `You are an expert educator and AI tool. Your task is to analyze the given content to help students study more effectively.

Content to analyze:
---
{{{content}}}
---

Please perform the following actions with expert detail:
1.  **Generate a Comprehensive Summary**: Create a concise, one-paragraph summary that captures the main ideas and purpose of the content.
2.  **Identify Key Concepts & Relationships**: Identify the most important concepts. For each concept, provide a clear explanation and describe how it relates to other key concepts in the text.
3.  **Extract and Explain Code Examples**: If there are any code snippets (e.g., in Python, JavaScript, HTML), extract them. For each snippet, provide a brief explanation of what the code does. If no code is present, return an empty array.
4.  **Generate Insightful Questions**: Create a list of potential questions that go beyond simple factual recall. These questions should test for deeper understanding, critical thinking, and the ability to apply the concepts.
5.  **Suggest Related Topics**: Recommend a list of related topics or areas of study that would be logical next steps for someone learning this material.
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
