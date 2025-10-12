
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as cheerio from 'cheerio';

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
        const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch search results. Status: ${response.status}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const results: z.infer<typeof SearchResultSchema>[] = [];
        
        $('div.web-result').each((i, el) => {
            if (results.length >= 8) return;

            const titleEl = $(el).find('a.result__a');
            const snippetEl = $(el).find('.result__snippet');
            
            const title = titleEl.text().trim();
            let url = titleEl.attr('href');
            const snippet = snippetEl.text().trim();
            
            if (title && url && snippet) {
                 // Convert relative URL to absolute
                const urlObj = new URL(url, 'https://duckduckgo.com');
                const finalUrl = urlObj.searchParams.get('uddg');
                
                if (finalUrl) {
                    results.push({
                        title,
                        url: decodeURIComponent(finalUrl),
                        snippet,
                    });
                }
            }
        });
      
      if (results.length === 0) {
        return { noResults: true };
      }
      return { results };

    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      return { noResults: true, error: (error as Error).message };
    }
  }
);
