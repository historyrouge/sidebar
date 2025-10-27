
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const searchYoutube = ai.defineTool(
  {
    name: 'searchYoutube',
    description: 'Searches YouTube for a video and returns video details.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the video.'),
    }),
    outputSchema: z.object({
      id: z.string().optional().describe('The ID of the first video found.'),
      title: z.string().optional().describe('The title of the video.'),
      thumbnail: z.string().optional().describe('The URL of the video thumbnail.'),
    }),
  },
  async ({ query }) => {
    try {
      // In a production environment, this should be the full absolute URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/youtube-search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        console.error('YouTube search API error:', await response.text());
        return {};
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('YouTube search fetch error:', error);
      return {};
    }
  }
);
