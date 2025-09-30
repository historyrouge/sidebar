
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import Youtube from 'youtube-sr';

export const searchYoutube = ai.defineTool(
  {
    name: 'searchYoutube',
    description: 'Searches YouTube for a video and returns the video ID.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the video.'),
    }),
    outputSchema: z.object({
      videoId: z.string().optional().describe('The ID of the first video found.'),
    }),
  },
  async ({ query }) => {
    try {
      const video = await Youtube.searchOne(query, 'video', false);
      if (video?.id) {
        return { videoId: video.id };
      }
      return { videoId: undefined };
    } catch (error) {
      console.error('YouTube search error:', error);
      return { videoId: undefined };
    }
  }
);
