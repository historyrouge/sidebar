
'use server';

/**
 * @fileOverview Generates an image from a text prompt using a Google model.
 *
 * - generateImage - A function that takes a text prompt and returns an image data URI.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A text prompt to generate an image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  try {
    const { media } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: `Generate an image based on this prompt: ${input.prompt}`,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('No image data received from the model.');
    }

    return {
      imageDataUri: media.url,
    };
  } catch (error: any) {
    console.error("Google image generation error:", error);
    throw new Error(error.message || "An unknown error occurred while generating the image.");
  }
}
