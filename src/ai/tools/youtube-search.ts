
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Youtube from 'youtube-sr';

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
      const video = await Youtube.searchOne(query, 'video');
      if (video) {
        return {
          id: video.id,
          title: video.title,
          thumbnail: video.thumbnail?.url,
        };
      }
      return {};
    } catch (error) {
      console.error('YouTube search fetch error:', error);
      return {};
    }
  }
);
