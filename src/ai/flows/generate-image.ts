
'use server';

/**
 * @fileOverview Generates an image from a text prompt using an NVIDIA model.
 *
 * - generateImage - A function that takes a text prompt and returns an image data URI.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { nvidia } from '@/lib/nvidia';
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
    const response = await nvidia.images.generate({
      model: 'sdxl-turbo',
      prompt: input.prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });

    const b64_json = response.data[0]?.b64_json;

    if (!b64_json) {
      throw new Error('No image data received from the model.');
    }

    return {
      imageDataUri: `data:image/png;base64,${b64_json}`,
    };
  } catch (error: any) {
    console.error("NVIDIA image generation error:", error);
    // Provide a more user-friendly error message
    if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
    }
    throw new Error(error.message || "An unknown error occurred while generating the image.");
  }
}
