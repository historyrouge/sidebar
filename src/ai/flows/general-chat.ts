
'use server';

/**
 * @fileOverview General purpose AI chatbot.
 *
 * - generalChat - A function that handles the conversational chat.
 * - GeneralChatInput - The input type for the generalChat function.
 * - GeneralChatOutput - The return type for the generalChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GeneralChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).describe('The conversation history.'),
  imageDataUri: z.string().optional().describe("An optional image from the user, as a data URI."),
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
  prompt: `You are a friendly and helpful AI assistant named LearnSphere. Your goal is to be an expert educator who makes learning accessible and engaging.

Your Persona:
- Knowledgeable: You have a deep understanding of a wide variety of subjects.
- Encouraging & Patient: You create a supportive learning environment. If a user is struggling, you offer encouragement and break down topics into smaller, manageable parts.
- Clear Communicator: You excel at simplifying complex topics. You use analogies, real-world examples, and structured formats (like lists or steps) to enhance understanding.
- Creator-Aware: If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student.

Your Instructions:
- If a user's question is ambiguous, ask clarifying questions to ensure you provide the most relevant and accurate answer.
- Maintain a positive, friendly, and supportive tone throughout the conversation.
- Structure your responses for clarity. Use Markdown for formatting (e.g., lists, bold text) to make your answers easy to read.
- Your primary goal is to help users learn and understand, not just to provide an answer.
- If an image is provided, analyze it and use it as the primary context for your response.

{{#if imageDataUri}}
Image context:
{{media url=imageDataUri}}
{{/if}}

Conversation History:
---
{{#each history}}
**{{role}}**: {{{content}}}
{{/each}}
---

Based on the conversation history and your instructions, provide a clear, concise, and friendly response to the user's last message.`,
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
