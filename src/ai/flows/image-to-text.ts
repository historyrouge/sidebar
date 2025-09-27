
'use server';

/**
 * @fileOverview Extracts text from an image using a vision model.
 *
 * - imageToText - A function that performs OCR on an image.
 * - ImageToTextInput - The input type for the imageToText function.
 * - ImageToTextOutput - The return type for the imageToText function.
 */

import {ai, visionModel} from '@/ai/genkit';
import {z} from 'zod';

const ImageToTextInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The text extracted from the image.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;

export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

const ocrPrompt = ai.definePrompt({
  name: 'ocrPrompt',
  input: {schema: ImageToTextInputSchema},
  output: {schema: ImageToTextOutputSchema},
  model: visionModel,
  prompt: `You are an Optical Character Recognition (OCR) tool. Your task is to extract all text from the given image, preserving the original formatting and line breaks as closely as possible.

Image to process: {{media url=imageDataUri}}

Return ONLY the extracted text. Do not add any commentary, explanations, or summaries.`,
});

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async input => {
    try {
      const {output} = await ocrPrompt(input);
      // Safely access the text property and provide a fallback.
      return { text: output?.text ?? '' };
    } catch (error) {
      console.error("Error in imageToTextFlow:", error);
      // Ensure a valid output is always returned, even on error.
      return { text: '' };
    }
  }
);

    