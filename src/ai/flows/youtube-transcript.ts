
'use server';

/**
 * @fileOverview Extracts the transcript from a YouTube video.
 *
 * - getYoutubeTranscript - A function that takes a YouTube URL and returns the transcript.
 * - GetYoutubeTranscriptInput - The input type for the getYoutubeTranscript function.
 * - GetYoutubeTranscriptOutput - The return type for the getYoutubeTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { YoutubeTranscript } from 'youtube-transcript';

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
        const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl);
        const transcript = transcriptParts.map(part => part.text).join(' ');
        return { transcript };
    } catch (error: any) {
        console.error("Error fetching transcript: ", error);
        // Check for specific error messages from the library if they exist
        if (error.message.includes('No transcripts are available for this video') || error.message.includes('does not have a transcript')) {
            throw new Error('Sorry, transcripts are not available for this video.');
        }
        throw new Error('Failed to fetch transcript from YouTube.');
    }
  }
);
