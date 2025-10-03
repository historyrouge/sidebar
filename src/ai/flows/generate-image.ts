
'use server';

/**
 * @fileOverview Generates an image from a text prompt.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
    
    const { output } = await ai.generate({
        model: 'googleai/gemini-1.0-pro',
        prompt: `Generate an SVG for the following prompt: "${prompt}". Return ONLY the SVG code as a string, wrapped in <svg> tags. Do not include any other text or markdown formatting. The SVG should be a complete, valid SVG file.`,
    });

    if (!output) {
      throw new Error("The AI model did not return an image.");
    }
    
    // The output is a string of SVG, we need to convert it to a data URI
    const svgString = output as unknown as string;
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;

    return {
        imageDataUri: dataUri,
    };
  }
);
