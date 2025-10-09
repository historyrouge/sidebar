
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { search } from 'node-duckduckgo';

const SearchResultSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    snippet: z.string(),
});

const SearchOutputSchema = z.object({
    results: z.array(SearchResultSchema).optional(),
    noResults: z.boolean().optional(),
});


export const duckDuckGoSearch = ai.defineTool(
  {
    name: 'duckDuckGoSearch',
    description: 'Searches the web using DuckDuckGo and returns the top results.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: SearchOutputSchema,
  },
  async ({ query }) => {
    try {
      const searchResults = await search({ query, maxResults: 5, safeSearch: 'off' });
      if (!searchResults.results || searchResults.results.length === 0) {
        return { noResults: true };
      }
      // Map results to the expected schema (url instead of link)
      const mappedResults = searchResults.results.map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.snippet,
      }));
      return { results: mappedResults };
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      return { noResults: true };
    }
  }
);
