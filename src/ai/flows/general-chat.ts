
'use server';

/**
 * @fileOverview General purpose AI chatbot.
 *
 * - generalChat - A function that handles the conversational chat.
 * - GeneralChatInput - The input type for the generalChat function.
 * - GeneralChatOutput - The return type for the generalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneralChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

const GeneralChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response.'),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;

export async function generalChat(input: GeneralChatInput): Promise<GeneralChatOutput> {
  return generalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalChatPrompt',
  input: {schema: GeneralChatInputSchema},
  output: {schema: GeneralChatOutputSchema},
  prompt: `You are a friendly and helpful AI assistant named ScholarSage. Your goal is to assist users with their questions and learning.

You can answer general knowledge questions, provide explanations, and help with a wide variety of topics.

Conversation History:
---
{{#each history}}
**{{role}}**: {{{content}}}
{{/each}}
---

Based on the conversation history, provide a clear, concise, and friendly response to the user's last message.`,
});

const generalChatFlow = ai.defineFlow(
  {
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
