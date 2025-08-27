
'use server';

/**
 * @fileOverview Analyzes code to explain it, find bugs, and suggest optimizations.
 *
 * - analyzeCode - A function that analyzes a code snippet.
 * - AnalyzeCodeInput - The input type for the analyzeCode function.
 * - AnalyzeCodeOutput - The return type for the analyzeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const AnalyzeCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to analyze.'),
  language: z.enum(['python', 'cpp']).describe('The programming language of the code.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

export const AnalyzeCodeOutputSchema = z.object({
  explanation: z.string().describe('A high-level explanation of what the code does.'),
  potentialBugs: z.array(z.object({
    line: z.number().optional().describe('The line number where the bug might be.'),
    bug: z.string().describe('A description of the potential bug.'),
    fix: z.string().describe('A suggestion on how to fix the bug.'),
  })).describe('A list of potential bugs or errors in the code.'),
  optimizations: z.array(z.object({
    line: z.number().optional().describe('The line number that can be optimized.'),
    suggestion: z.string().describe('The optimization suggestion.'),
  })).describe('Suggestions for improving the code performance or readability.'),
});
export type AnalyzeCodeOutput = z.infer<typeof AnalyzeCodeOutputSchema>;


export async function analyzeCode(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
  return analyzeCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCodePrompt',
  input: {schema: AnalyzeCodeInputSchema},
  output: {schema: AnalyzeCodeOutputSchema},
  prompt: `You are an expert programmer and code reviewer specializing in {{language}}.
Your task is to analyze the following code snippet and provide a detailed review.

Code:
\`\`\`{{language}}
{{{code}}}
\`\`\`

Please provide the following analysis:
1.  **Explanation**: Give a clear, high-level explanation of what the code is intended to do.
2.  **Potential Bugs**: Identify any potential bugs, logical errors, or edge cases that are not handled. For each bug, specify the line number (if applicable), describe the issue, and suggest a fix. If there are no bugs, return an empty array.
3.  **Optimizations**: Suggest any optimizations for performance, readability, or best practices. For each suggestion, specify the line number (if applicable) and explain the benefit. If there are no optimizations, return an empty array.
`,
});

const analyzeCodeFlow = ai.defineFlow(
  {
    name: 'analyzeCodeFlow',
    inputSchema: AnalyzeCodeInputSchema,
    outputSchema: AnalyzeCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    