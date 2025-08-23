// src/ai/flows/summarize-content.ts
'use server';

/**
 * @fileOverview Summarizes content into a concise overview.
 *
 * - summarizeContent - A function that takes text and returns a summary.
 * - SummarizeContentInput - The input type for the summarizeContent function.
 * - SummarizeContentOutput - The return type for the summarizeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeContentInputSchema = z.object({
  content: z.string().describe('The content to summarize.'),
});
export type SummarizeContentInput = z.infer<typeof SummarizeContentInputSchema>;

const SummarizeContentOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the content.'),
});
export type SummarizeContentOutput = z.infer<typeof SummarizeContentOutputSchema>;

export async function summarizeContent(input: SummarizeContentInput): Promise<SummarizeContentOutput> {
  return summarizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {schema: SummarizeContentInputSchema},
  output: {schema: SummarizeContentOutputSchema},
  prompt: `You are an AI assistant that excels at summarizing complex topics into clear and concise summaries.

Content to summarize:
---
{{{content}}}
---

Please generate a concise summary of the provided content. The summary should capture the main ideas and key points of the text.
`,
});

const summarizeContentFlow = ai.defineFlow(
  {
    name: 'summarizeContentFlow',
    inputSchema: SummarizeContentInputSchema,
    outputSchema: SummarizeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
