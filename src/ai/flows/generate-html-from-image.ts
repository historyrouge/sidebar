
'use server';

/**
 * @fileOverview Generates HTML and CSS from an image of a UI.
 *
 * - generateHtmlFromImage - A function that takes an image and returns HTML and CSS.
 * - GenerateHtmlFromImageInput - The input type for the generateHtmlFromImage function.
 * - GenerateHtmlFromImageOutput - The return type for the generateHtmlFromImage function.
 */

import {ai, visionModel} from '@/ai/genkit';
import {z} from 'zod';

export const GenerateHtmlFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a user interface, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateHtmlFromImageInput = z.infer<typeof GenerateHtmlFromImageInputSchema>;

export const GenerateHtmlFromImageOutputSchema = z.object({
  html: z.string().describe('The generated HTML code for the UI.'),
  css: z.string().describe('The generated CSS code for the UI.'),
});
export type GenerateHtmlFromImageOutput = z.infer<typeof GenerateHtmlFromImageOutputSchema>;

export async function generateHtmlFromImage(input: GenerateHtmlFromImageInput): Promise<GenerateHtmlFromImageOutput> {
  return generateHtmlFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHtmlFromImagePrompt',
  input: {schema: GenerateHtmlFromImageInputSchema},
  output: {schema: GenerateHtmlFromImageOutputSchema},
  model: visionModel,
  prompt: `You are an expert web developer specializing in converting images to high-quality, clean HTML and CSS.
Analyze the provided image of a user interface and generate the corresponding HTML and CSS code.

Image to analyze: {{media url=imageDataUri}}

Your task:
1.  **Analyze the Layout**: Identify all UI elements like buttons, text fields, cards, headers, etc. Note their positions, sizes, and relationships.
2.  **Analyze the Styling**: Detect colors, fonts, spacing, borders, and shadows.
3.  **Generate HTML**: Create semantic HTML5 markup for the structure of the UI. Use standard tags like <header>, <main>, <section>, <button>, <input>, etc.
4.  **Generate CSS**: Create the CSS needed to style the HTML. Use classes for styling. Do not use inline styles. Create a complete stylesheet that can be used to render the HTML correctly. Make sure the layout is responsive if possible.

You must respond in a valid JSON format with two keys: "html" and "css".`,
});

const generateHtmlFromImageFlow = ai.defineFlow(
  {
    name: 'generateHtmlFromImageFlow',
    inputSchema: GenerateHtmlFromImageInputSchema,
    outputSchema: GenerateHtmlFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
