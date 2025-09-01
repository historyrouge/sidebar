
'use server';

/**
 * @fileOverview Generates a mind map from provided content.
 *
 * - generateMindMap - A function that takes text and returns a structured mind map.
 * - GenerateMindMapInput - The input type for the generateMindMap function.
 * - GenerateMindMapOutput - The return type for the generateMindMap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateMindMapInputSchema = z.object({
  content: z.string().describe('The content to generate the mind map from.'),
});
export type GenerateMindMapInput = z.infer<typeof GenerateMindMapInputSchema>;

const NodeSchema: z.ZodType<any> = z.lazy(() => 
    z.object({
        title: z.string().describe('The title of this node or branch.'),
        children: z.array(NodeSchema).describe('An array of child nodes.'),
    })
);

const GenerateMindMapOutputSchema = z.object({
  centralTopic: z.string().describe('The central, main idea of the content.'),
  mainNodes: z.array(NodeSchema).describe('The main branches extending from the central topic.'),
});
export type GenerateMindMapOutput = z.infer<typeof GenerateMindMapOutputSchema>;

export async function generateMindMap(input: GenerateMindMapInput): Promise<GenerateMindMapOutput> {
  return generateMindMapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMindMapPrompt',
  input: {schema: GenerateMindMapInputSchema},
  output: {schema: GenerateMindMapOutputSchema},
  prompt: `You are an expert at creating structured mind maps from text. Your task is to analyze the following content and organize it into a hierarchical mind map.

Content:
---
{{{content}}}
---

Please generate a mind map with the following structure:
1.  **Central Topic**: Identify the single, overarching theme of the content. This should be the root of your mind map.
2.  **Main Nodes**: Create 3-5 main branches that represent the most important high-level concepts or sections from the text.
3.  **Sub-Nodes**: For each main node, create a few sub-nodes (children) that break down the concept further with details, examples, or related ideas. You can nest these sub-nodes one level deeper if necessary, but try to keep the structure clear and concise.

The entire output must be in a valid JSON format.
`,
});

const generateMindMapFlow = ai.defineFlow(
  {
    name: 'generateMindMapFlow',
    inputSchema: GenerateMindMapInputSchema,
    outputSchema: GenerateMindMapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
