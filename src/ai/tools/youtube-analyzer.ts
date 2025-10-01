'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';

export const youtubeAnalyzer = ai.defineTool(
  {
    name: 'youtubeAnalyzer',
    description: 'Analyzes a YouTube video by extracting its transcript and providing insights.',
    inputSchema: z.object({
      videoUrl: z.string().describe('The YouTube video URL or video ID.'),
    }),
    outputSchema: z.object({
      transcript: z.string().optional().describe('The full transcript of the video.'),
      summary: z.string().optional().describe('A brief summary of the video content.'),
      success: z.boolean().describe('Whether the analysis was successful.'),
    }),
  },
  async ({ videoUrl }) => {
    try {
      // Extract video ID from URL
      let videoId = videoUrl;
      const urlMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      if (urlMatch && urlMatch[1]) {
        videoId = urlMatch[1];
      }

      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (!transcriptData || transcriptData.length === 0) {
        return { success: false };
      }

      const fullTranscript = transcriptData.map(item => item.text).join(' ');
      
      // Create a brief summary (first 500 characters)
      const summary = fullTranscript.substring(0, 500) + '...';

      return { 
        transcript: fullTranscript,
        summary,
        success: true 
      };
    } catch (error) {
      console.error('YouTube analysis error:', error);
      return { success: false };
    }
  }
);
