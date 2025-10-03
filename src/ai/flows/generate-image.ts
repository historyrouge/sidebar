
'use server';

/**
 * @fileOverview Generates an image from a text prompt by creating an SVG.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A text description of the image to generate as an SVG.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as an SVG data URI."
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
    
    const { text } = await ai.generate({
        model: 'googleai/gemini-1.5-flash-latest',
        prompt: `You are an expert SVG generator. Create a simple, clean, and visually appealing SVG graphic based on the following prompt. The SVG should be a single, self-contained block of code. Do not include any explanations, just the SVG code itself. Ensure the SVG has a viewBox and is well-formed.

Prompt: "${prompt}"`,
        config: {
            temperature: 0.3,
        }
    });

    const svgContent = text.replace(/```svg\n?|```/g, "").trim();
    const imageDataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

    return {
        imageDataUri: imageDataUri,
    };
  }
);
