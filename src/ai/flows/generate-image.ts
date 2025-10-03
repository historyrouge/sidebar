
'use server';

/**
 * @fileOverview Generates an image from a text prompt using a free Google model.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A text description of the image to generate.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI."
    ),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({prompt}) => {
    // Use a free model capable of image generation
    const { media } = await ai.generate({
        model: googleAI.model('gemini-1.5-flash-latest'),
        prompt: `Generate an image of: ${prompt}. Do not output any text, only the image.`,
    });
    
    if (!media.url) {
        throw new Error("The model did not return an image.");
    }
    
    return {
        imageDataUri: media.url,
    };
  }
);
