"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYoutubeTranscript = getYoutubeTranscript;
/**
 * @fileOverview Extracts the transcript from a YouTube video.
 *
 * - getYoutubeTranscript - A function that takes a YouTube URL and returns the transcript.
 * - GetYoutubeTranscriptInput - The input type for the getYoutubeTranscript function.
 * - GetYoutubeTranscriptOutput - The return type for the getYoutubeTranscript function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const youtube_transcript_1 = require("youtube-transcript");
const GetYoutubeTranscriptInputSchema = zod_1.z.object({
    videoUrl: zod_1.z.string().url().describe('The URL of the YouTube video.'),
});
const GetYoutubeTranscriptOutputSchema = zod_1.z.object({
    transcript: zod_1.z.string().describe('The full transcript of the video.'),
});
async function getYoutubeTranscript(input) {
    return getYoutubeTranscriptFlow(input);
}
const getYoutubeTranscriptFlow = genkit_1.ai.defineFlow({
    name: 'getYoutubeTranscriptFlow',
    inputSchema: GetYoutubeTranscriptInputSchema,
    outputSchema: GetYoutubeTranscriptOutputSchema,
}, async ({ videoUrl }) => {
    try {
        const transcriptParts = await youtube_transcript_1.YoutubeTranscript.fetchTranscript(videoUrl);
        if (!transcriptParts || transcriptParts.length === 0) {
            throw new Error('Could not retrieve transcript for this video. It may be disabled or unavailable.');
        }
        const transcript = transcriptParts.map(part => part.text).join(' ');
        if (!transcript.trim()) {
            throw new Error('The transcript for this video is empty.');
        }
        return { transcript };
    }
    catch (error) {
        console.error("Error fetching transcript: ", error);
        // Provide more specific user-friendly error messages
        if (error.message.includes('subtitles are disabled')) {
            throw new Error('Sorry, transcripts (subtitles) are disabled for this video.');
        }
        if (error.message.includes('No transcript found')) {
            throw new Error('Sorry, no transcript is available for this video.');
        }
        throw new Error('An unexpected error occurred while fetching the transcript from YouTube.');
    }
});
