"use strict";
'use server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.textToSpeech = textToSpeech;
/**
 * @fileOverview A text-to-speech AI agent.
 *
 * - textToSpeech - A function that handles the text-to-speech process.
 * - TextToSpeechInput - The input type for the textToSpeech function.
 * - TextToSpeechOutput - The return type for the textToSpeech function.
 */
const genkit_1 = require("@/ai/genkit");
const google_genai_1 = require("@genkit-ai/google-genai");
const zod_1 = require("zod");
const wav_1 = __importDefault(require("wav"));
const TextToSpeechInputSchema = zod_1.z.object({
    text: zod_1.z.string().describe('The text to convert to speech.'),
});
const TextToSpeechOutputSchema = zod_1.z.object({
    audioDataUri: zod_1.z.string().describe("The generated audio as a data URI."),
});
async function textToSpeech(input) {
    return textToSpeechFlow(input);
}
async function toWav(pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
    return new Promise((resolve, reject) => {
        const writer = new wav_1.default.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });
        let bufs = [];
        writer.on('error', reject);
        writer.on('data', function (d) {
            bufs.push(d);
        });
        writer.on('end', function () {
            resolve(Buffer.concat(bufs).toString('base64'));
        });
        writer.write(pcmData);
        writer.end();
    });
}
const textToSpeechFlow = genkit_1.ai.defineFlow({
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
}, async ({ text }) => {
    const { media } = await genkit_1.ai.generate({
        model: google_genai_1.googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
                },
            },
        },
        prompt: text,
    });
    if (!media) {
        throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(audioBuffer);
    return {
        audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
});
