
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// A basic function to strip HTML tags. This is not perfect but good for extracting text content.
function stripHtml(html: string): string {
    return html.replace(/<style[^>]*>.*<\/style>/gs, '') // remove style blocks
               .replace(/<script[^>]*>.*<\/script>/gs, '') // remove script blocks
               .replace(/<[^>]+>/g, ' ') // remove all other tags
               .replace(/\s\s+/g, ' ') // collapse whitespace
               .trim();
}


async function fetchPageContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'Accept': 'text/html',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch page. Status: ${response.status}`);
        }

        const html = await response.text();
        const textContent = stripHtml(html);

        // Return a manageable chunk of text to avoid overwhelming the model
        return textContent.substring(0, 8000);

    } catch (error) {
        console.error(`Error fetching or parsing URL ${url}:`, error);
        return `Failed to browse website. Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}


export const browseWebsite = ai.defineTool(
  {
    name: 'browseWebsite',
    description: 'Fetches the text content of a given webpage URL. Use this to get information from a specific website.',
    inputSchema: z.object({
      url: z.string().url().describe('The URL of the website to browse.'),
    }),
    outputSchema: z.string().describe('The text content of the webpage.'),
  },
  async ({ url }) => {
    return await fetchPageContent(url);
  }
);
