
'use server';

/**
 * @fileOverview Analyzes code to explain it, find bugs, and suggest optimizations.
 *
 * - analyzeCode - A function that analyzes a code snippet.
 */

import {ai} from '@/ai/genkit';
import { AnalyzeCodeInput, AnalyzeCodeInputSchema, AnalyzeCodeOutput, AnalyzeCodeOutputSchema } from '@/lib/code-analysis-types';


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
