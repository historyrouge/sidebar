
'use server';

/**
 * @fileOverview Generates an image from a text prompt using an NVIDIA model.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { nvidia } from '@/lib/nvidia';
import { z } from 'zod';
import { ai } from '@/ai/genkit';

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
    
    if (!process.env.NVIDIA_API_KEY) {
        throw new Error("NVIDIA API key is not configured.");
    }

    try {
        const response = await nvidia.images.generate({
            model: 'sdxl-turbo',
            prompt: prompt,
            n: 1,
            response_format: 'b64_json',
            size: '1024x1024',
        });
        
        const b64_json = response.data[0]?.b64_json;

        if (!b64_json) {
            throw new Error('No image data returned from NVIDIA API.');
        }

        const imageDataUri = `data:image/png;base64,${b64_json}`;

        return {
            imageDataUri: imageDataUri,
        };

    } catch (error: any) {
        console.error("NVIDIA image generation error:", error);
        throw new Error(error.response?.data?.error?.message || error.message || "An unknown error occurred with the NVIDIA API.");
    }
  }
);
