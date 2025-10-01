'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const webScraper = ai.defineTool(
  {
    name: 'webScraper',
    description: 'Scrapes content from any webpage URL and returns the text content.',
    inputSchema: z.object({
      url: z.string().describe('The URL of the webpage to scrape.'),
    }),
    outputSchema: z.object({
      content: z.string().describe('The extracted text content from the webpage.'),
      title: z.string().optional().describe('The title of the webpage.'),
      success: z.boolean().describe('Whether the scraping was successful.'),
    }),
  },
  async ({ url }: { url: string }) => {
    try {
      // Use the proxy endpoint to fetch the page
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        return { content: '', success: false };
      }

      const html = await response.text();
      
      // Basic HTML to text extraction (strip tags)
      const text = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 characters

      // Try to extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : '';

      return { 
        content: text,
        title,
        success: true 
      };
    } catch (error) {
      console.error('Web scraping error:', error);
      return { content: '', success: false };
    }
  }
);
