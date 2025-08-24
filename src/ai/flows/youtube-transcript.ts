
'use server';

/**
 * @fileOverview Extracts the transcript from a YouTube video.
 *
 * - getYoutubeTranscript - A function that takes a YouTube URL and returns the transcript.
 * - GetYoutubeTranscriptInput - The input type for the getYoutubeTranscript function.
 * - GetYoutubeTranscriptOutput - The return type for the getYoutubeTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { YoutubeTranscriptApi } from 'youtube-transcript-api';

const GetYoutubeTranscriptInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the YouTube video.'),
});
export type GetYoutubeTranscriptInput = z.infer<typeof GetYoutubeTranscriptInputSchema>;

const GetYoutubeTranscriptOutputSchema = z.object({
  transcript: z.string().describe('The full transcript of the video.'),
});
export type GetYoutubeTranscriptOutput = z.infer<typeof GetYoutubeTranscriptOutputSchema>;

export async function getYoutubeTranscript(input: GetYoutubeTranscriptInput): Promise<GetYoutubeTranscriptOutput> {
  return getYoutubeTranscriptFlow(input);
}

const getYoutubeTranscriptFlow = ai.defineFlow(
  {
    name: 'getYoutubeTranscriptFlow',
    inputSchema: GetYoutubeTranscriptInputSchema,
    outputSchema: GetYoutubeTranscriptOutputSchema,
  },
  async ({videoUrl}) => {
    try {
        const transcriptParts = await YoutubeTranscriptApi.getTranscript(videoUrl);
        if (!transcriptParts || transcriptParts.length === 0) {
            throw new Error('Could not retrieve transcript for this video. It may be disabled.');
        }
        const transcript = transcriptParts.map(part => part.text).join(' ');
        return { transcript };
    } catch (error: any) {
        console.error("Error fetching transcript: ", error);
        // The new library is better at providing meaningful errors.
        if (error.message.includes('subtitles are disabled')) {
            throw new Error('Sorry, transcripts are disabled for this video.');
        }
        if (error.message.includes('No transcript found')) {
            throw new Error('Sorry, no transcript is available for this video.');
        }
        throw new Error('Failed to fetch transcript from YouTube.');
    }
  }
);
