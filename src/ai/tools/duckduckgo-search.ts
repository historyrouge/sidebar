
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { duckIt } from 'node-duckduckgo';

export const duckDuckGoSearch = ai.defineTool(
  {
    name: 'duckDuckGoSearch',
    description: 'Searches the web using DuckDuckGo and returns the top results.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.string().describe('A JSON string of the search results.'),
  },
  async ({ query }) => {
    try {
      const searchResults = await duckIt(query, { maxResults: 5, safeSearch: 'off' });
      return JSON.stringify(searchResults.results);
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      return JSON.stringify({ error: 'Failed to perform web search.' });
    }
  }
);
