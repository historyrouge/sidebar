
'use server';

/**
 * @fileOverview Extracts text from an image using a vision model (OCR).
 *
 * - imageToText - A function that performs OCR on an image.
 */

import {ai, visionModel} from '@/ai/genkit';
import {z} from 'zod';

const ImageToTextInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image containing text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The extracted text from the image.'),
});

export async function imageToText(input: z.infer<typeof ImageToTextInputSchema>): Promise<z.infer<typeof ImageToTextOutputSchema>> {
  const prompt = ai.definePrompt({
    name: 'imageToTextPrompt',
    input: {schema: ImageToTextInputSchema},
    output: {schema: ImageToTextOutputSchema},
    model: visionModel,
    prompt: `You are an Optical Character Recognition (OCR) tool. Your sole purpose is to extract any and all text from the given image, including handwritten text if possible. Do not interpret, summarize, or analyze the text. Return only the raw extracted text.

Image to process: {{media url=imageDataUri}}`,
  });

  const {output} = await prompt(input);
  return output!;
}
