
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import * as cheerio from 'cheerio';


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
        const $ = cheerio.load(html);

        // Remove script and style tags
        $('script, style').remove();

        // Get text from the body, replacing block elements with newlines for better readability
        let textContent = $('body').text() || '';
        textContent = textContent.replace(/\s\s+/g, ' ').trim();

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
