'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const webSearch = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Searches the web and returns relevant results.',
    inputSchema: z.object({
      query: z.string().describe('The search query.'),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      })).describe('Search results'),
      success: z.boolean().describe('Whether the search was successful'),
    }),
  },
  async ({ query }) => {
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
      );
      
      if (!response.ok) {
        return { results: [], success: false };
      }

      const data = await response.json();
      const results: Array<{ title: string; url: string; snippet: string }> = [];
      
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 5)) {
          if (topic.FirstURL && topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0] || topic.Text,
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          }
        }
      }
      
      if (data.Abstract && data.AbstractURL) {
        results.unshift({
          title: data.Heading || 'Main Result',
          url: data.AbstractURL,
          snippet: data.Abstract,
        });
      }

      return { results, success: true };
    } catch (error) {
      console.error('Web search error:', error);
      return { results: [], success: false };
    }
  }
);
