
'use server';

/**
 * @fileOverview General purpose AI chatbot.
 *
 * - generalChat - A function that handles the conversational chat.
 * - GeneralChatInput - The input type for the generalChat function.
 * - GeneralChatOutput - The return type for the generalChat function.
 */

import {ai} from '@/ai/genkit';
import {generateQuestionPaperTool} from '@/ai/flows/generate-question-paper';
import {z} from 'zod';

const GeneralChatInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model', 'tool']),
        content: z.any(), // Allow any content for multipart
      })
    )
    .describe('The conversation history.'),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

const GeneralChatOutputSchema = z.object({
  response: z.string().describe("The chatbot's response, which could be text or stringified JSON from a tool."),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;

// This flow is no longer used for the main chat, as it has been switched to SambaNova.
// It is kept for reference or potential future use with Gemini.
export const generalChat = ai.defineFlow(
  {
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  async (input) => {
    // This is a placeholder as the main logic has moved to actions.ts for SambaNova
    return {response: "This flow is currently not in use."};
  }
);
