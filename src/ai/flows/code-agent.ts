
'use server';

/**
 * @fileOverview AI agent for helping with coding problems.
 *
 * - codeAgent - A function that handles the conversational code assistance.
 * - CodeAgentInput - The input type for the codeAgent function.
 * - CodeAgentOutput - The return type for the codeAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeAgentInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
});
export type CodeAgentInput = z.infer<typeof CodeAgentInputSchema>;

const CodeAgentOutputSchema = z.object({
  response: z.string().describe('The AI code agent\'s response.'),
});
export type CodeAgentOutput = z.infer<typeof CodeAgentOutputSchema>;

export async function codeAgent(input: CodeAgentInput): Promise<CodeAgentOutput> {
  return codeAgentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeAgentPrompt',
  input: {schema: CodeAgentInputSchema},
  output: {schema: CodeAgentOutputSchema},
  prompt: `You are an expert AI programmer and coding assistant called CodeAgent. Your goal is to help users solve coding problems, write code, and understand programming concepts.

- Be friendly, encouraging, and clear in your explanations.
- Provide code snippets when helpful. Use markdown for code blocks and specify the language.
- If you don't know the answer, say so. Do not make up information.
- Your responses should be in Markdown format.

Conversation History:
---
{{#each history}}
**{{role}}**: {{{content}}}
{{/each}}
---

Based on the conversation history, provide a helpful response to the user's last message.`,
});

const codeAgentFlow = ai.defineFlow(
  {
    name: 'codeAgentFlow',
    inputSchema: CodeAgentInputSchema,
    outputSchema: CodeAgentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
