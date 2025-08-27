
'use server';

/**
 * @fileOverview Generates a chapter for an ebook.
 *
 * - generateEbookChapter - A function that takes a title and chapter number and returns chapter content.
 * - GenerateEbookChapterInput - The input type for the generateEbookChapter function.
 * - GenerateEbookChapterOutput - The return type for the generateEbookChapter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateEbookChapterInputSchema = z.object({
  title: z.string().describe('The title of the ebook.'),
  chapter: z.number().describe('The chapter number to generate.'),
});
export type GenerateEbookChapterInput = z.infer<typeof GenerateEbookChapterInputSchema>;

const ContentBlockSchema = z.object({
    type: z.enum(['h1', 'h2', 'p']).describe("The type of content block: h1 for chapter title, h2 for section title, p for paragraph."),
    text: z.string().describe("The text content of the block."),
});

const GenerateEbookChapterOutputSchema = z.object({
  content: z.array(ContentBlockSchema).describe('An array of content blocks for the chapter.'),
});
export type GenerateEbookChapterOutput = z.infer<typeof GenerateEbookChapterOutputSchema>;

export async function generateEbookChapter(input: GenerateEbookChapterInput): Promise<GenerateEbookChapterOutput> {
  return generateEbookChapterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEbookChapterPrompt',
  input: {schema: GenerateEbookChapterInputSchema},
  output: {schema: GenerateEbookChapterOutputSchema},
  prompt: `You are a creative and knowledgeable author. Your task is to write a chapter for an ebook.

Ebook Title: {{{title}}}
Chapter Number: {{{chapter}}}

Please generate the content for this chapter. The chapter should be well-structured, informative, and engaging.
- Start with a single 'h1' element for the chapter title.
- Use a mix of 'h2' elements for section headings and 'p' elements for paragraphs.
- Generate about 5-7 content blocks in total for the chapter.
- The content should be appropriate for the book's title and the chapter number, creating a logical progression.
- For chapter 1, provide a strong introduction to the topic. For subsequent chapters, build upon the previous one.
- Make the content interesting and educational.

Example for a book titled "A Journey Through the Cosmos", Chapter 1:
{
    "content": [
        { "type": "h1", "text": "Chapter 1: The Big Bang" },
        { "type": "p", "text": "The Big Bang theory is the leading cosmological model..." },
        { "type": "h2", "text": "1.1: Cosmic Inflation" },
        { "type": "p", "text": "Cosmic inflation is a theory of exponential expansion of space in the early universe..." }
    ]
}
`,
});

const generateEbookChapterFlow = ai.defineFlow(
  {
    name: 'generateEbookChapterFlow',
    inputSchema: GenerateEbookChapterInputSchema,
    outputSchema: GenerateEbookChapterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
