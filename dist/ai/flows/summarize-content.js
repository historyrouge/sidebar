"use strict";
// src/ai/flows/summarize-content.ts
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeContent = summarizeContent;
/**
 * @fileOverview Summarizes content into a concise overview.
 *
 * - summarizeContent - A function that takes text and returns a summary.
 * - SummarizeContentInput - The input type for the summarizeContent function.
 * - SummarizeContentOutput - The return type for the summarizeContent function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const SummarizeContentInputSchema = zod_1.z.object({
    content: zod_1.z.string().describe('The content to summarize.'),
});
const SummarizeContentOutputSchema = zod_1.z.object({
    summary: zod_1.z.string().describe('The generated summary of the content.'),
});
async function summarizeContent(input) {
    return summarizeContentFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'summarizeContentPrompt',
    input: { schema: SummarizeContentInputSchema },
    output: { schema: SummarizeContentOutputSchema },
    prompt: `You are an AI assistant that excels at summarizing complex topics into clear and concise summaries.

Content to summarize:
---
{{{content}}}
---

Please generate a concise summary of the provided content. The summary should capture the main ideas and key points of the text.
`,
});
const summarizeContentFlow = genkit_1.ai.defineFlow({
    name: 'summarizeContentFlow',
    inputSchema: SummarizeContentInputSchema,
    outputSchema: SummarizeContentOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
