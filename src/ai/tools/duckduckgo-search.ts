
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { DuckDuckGo } from 'node-duckduckgo';

const ddg = new DuckDuckGo('searnai-v1');

export const searchWeb = ai.defineTool(
  {
    name: 'searchWeb',
    description: 'Searches the web using DuckDuckGo for up-to-date information on a given topic.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          title: z.string(),
          snippet: z.string(),
          url: z.string(),
        })
      ).describe('A list of search results.'),
    }),
  },
  async ({ query }) => {
    try {
        if (!process.env.DUCKDUCKGO_TOKEN) {
            console.warn("DUCKDUCKGO_TOKEN is not set. Search may be rate-limited.");
        }
      const searchResponse = await ddg.search(query, {
        safeSearch: 'Strict',
      });

      if (searchResponse.noResults) {
        return { results: [] };
      }
      
      // Return top 5 results
      return { 
        results: searchResponse.results.slice(0, 5).map((r: any) => ({
            title: r.title,
            snippet: r.snippet,
            url: r.url
        }))
      };
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      // In case of an API error, return an empty array to prevent the flow from crashing.
      return { results: [] };
    }
  }
);
