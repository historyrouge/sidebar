
import { z } from 'zod';

export const AnalyzeImageContentInputSchema = z.object({
  imageDataUri: z.string().describe("The image to analyze as a data URI."),
});
export type AnalyzeImageContentInput = z.infer<typeof AnalyzeImageContentInputSchema>;

export const AnalyzeImageContentOutputSchema = z.object({
  description: z.string().describe("A one-paragraph, detailed description of the image content and context."),
  objects: z.array(z.string()).describe("A list of the main objects identified in the image."),
  colors: z.array(z.object({
    name: z.string().describe("The common name of the color."),
    hex: z.string().describe("The hex code of the color."),
  })).describe("A list of 3-5 dominant colors found in the image."),
  mood: z.array(z.string()).describe("A list of keywords describing the mood or tone of the image (e.g., 'joyful', 'somber', 'energetic')."),
  composition: z.array(z.string()).describe("Keywords describing the composition (e.g., 'rule of thirds', 'symmetrical', 'leading lines')."),
});
export type AnalyzeImageContentOutput = z.infer<typeof AnalyzeImageContentOutputSchema>;
