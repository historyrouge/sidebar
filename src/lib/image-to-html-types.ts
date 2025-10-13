import { z } from 'zod';

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
