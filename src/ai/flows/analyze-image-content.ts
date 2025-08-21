
'use server';

/**
 * @fileOverview Analyzes image content to identify key concepts and generate potential questions.
 *
 * - analyzeImageContent - A function that analyzes an image and generates questions.
 * - AnalyzeImageContentInput - The input type for the analyzeImageContent function.
 * - AnalyzeImageContentOutput - The return type for the analyzeImageContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageContentInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a diagram, slide, or page from a book, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    prompt: z.string().optional().describe('An optional text prompt to guide the analysis.'),
});
export type AnalyzeImageContentInput = z.infer<typeof AnalyzeImageContentInputSchema>;

const AnalyzeImageContentOutputSchema = z.object({
  keyConcepts: z.array(z.object({
    concept: z.string().describe('The key concept identified.'),
    explanation: z.string().describe('A brief explanation of the concept.'),
  })).describe('Key concepts identified in the image.'),
  potentialQuestions: z.array(z.string()).describe('Potential questions based on the image content.'),
});
export type AnalyzeImageContentOutput = z.infer<typeof AnalyzeImageContentOutputSchema>;

export async function analyzeImageContent(input: AnalyzeImageContentInput): Promise<AnalyzeImageContentOutput> {
  return analyzeImageContentFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {schema: AnalyzeImageContentInputSchema},
  output: {schema: AnalyzeImageContentOutputSchema},
  prompt: `You are an AI tool that analyzes the given image and identifies key concepts and generates potential questions to help students study more effectively. The image could be a diagram, a presentation slide, or a page from a book.

Image to analyze: {{media url=imageDataUri}}
User prompt: {{{prompt}}}

Analyze the image. If the user has provided a prompt, use it to guide your analysis. For each key concept, provide a brief explanation. Return the key concepts as a list of objects, each with a "concept" and "explanation" field. Return the potential questions as a list of strings.
`,
});

const analyzeImageContentFlow = ai.defineFlow(
  {
    name: 'analyzeImageContentFlow',
    inputSchema: AnalyzeImageContentInputSchema,
    outputSchema: AnalyzeImageContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeImagePrompt(input);
    return output!;
  }
);
