
'use server';

/**
 * @fileOverview Answers a question by searching the web and citing sources.
 *
 * - answerWithSources - A function that answers a user's query using web search.
 * - AnswerWithSourcesInput - The input type for the function.
 * - AnswerWithSourcesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { duckDuckGoSearch } from '@/ai/tools/duckduckgo-search';
import { browseWebsite } from '@/ai/tools/browse-website';

const AnswerWithSourcesInputSchema = z.object({
  query: z.string().describe('The user\'s question or query.'),
});
export type AnswerWithSourcesInput = z.infer<typeof AnswerWithSourcesInputSchema>;

const AnswerWithSourcesOutputSchema = z.object({
  answer: z.string().describe('The comprehensive answer to the user\'s query.'),
  source: z.string().url().describe('The URL of the primary source used for the answer.'),
});
export type AnswerWithSourcesOutput = z.infer<typeof AnswerWithSourcesOutputSchema>;

export async function answerWithSources(input: AnswerWithSourcesInput): Promise<AnswerWithSourcesOutput> {
  return answerWithSourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerWithSourcesPrompt',
  input: {schema: z.object({ query: z.string(), context: z.string() })},
  output: {schema: z.object({ answer: z.string() })},
  prompt: `You are an expert researcher. Your task is to answer the user's query based on the provided web content.

User Query:
---
{{{query}}}
---

Web Content:
---
{{{context}}}
---

Provide a comprehensive, well-structured answer to the query using only the information from the web content. If the content is insufficient, state that you could not find a definitive answer.`,
});

const answerWithSourcesFlow = ai.defineFlow(
  {
    name: 'answerWithSourcesFlow',
    inputSchema: AnswerWithSourcesInputSchema,
    outputSchema: AnswerWithSourcesOutputSchema,
  },
  async ({ query }) => {
    // 1. Search the web for relevant pages
    const searchResult = await duckDuckGoSearch({ query });
    
    if (searchResult.noResults || !searchResult.results || searchResult.results.length === 0) {
      return { answer: "Sorry, I couldn't find any relevant information on the web for that query.", source: "" };
    }

    // 2. Browse the content of the top search result
    const topSource = searchResult.results[0];
    const webContent = await browseWebsite({ url: topSource.url });

    if (webContent.startsWith('Failed to browse website')) {
      return { answer: `Sorry, I was unable to access the content of the most relevant page. Error: ${webContent}`, source: topSource.url };
    }

    // 3. Generate an answer based on the browsed content
    const { output } = await prompt({ query, context: webContent });
    
    if (!output) {
      throw new Error("The AI model failed to generate an answer.");
    }
    
    return {
      answer: output.answer,
      source: topSource.url,
    };
  }
);

