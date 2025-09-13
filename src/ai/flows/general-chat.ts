
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
        content: z.string(),
        // Note: The Genkit representation of multipart content doesn't have a direct imageDataUri field.
        // We will construct the media part from the content if needed.
      })
    )
    .describe('The conversation history.'),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

const GeneralChatOutputSchema = z.object({
  response: z.string().describe("The chatbot's response, which could be text or stringified JSON from a tool."),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;

export async function generalChat(input: GeneralChatInput): Promise<GeneralChatOutput> {
  return generalChatFlow(input);
}

// System prompt remains separate as it contains instructions for the model
const systemPrompt = `You are a friendly and helpful AI assistant named Easy Learn AI. Your goal is to be an expert educator who makes learning accessible and engaging.

Your Persona:
- Knowledgeable: You have a deep understanding of a wide variety of subjects.
- Encouraging & Patient: You create a supportive learning environment. If a user is struggling, you offer encouragement and break down topics into smaller, manageable parts.
- Clear Communicator: You excel at simplifying complex topics. You use analogies, real-world examples, and structured formats (like lists or steps) to enhance understanding.
- Creator-Aware: If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student.

Your Instructions:
- If a user asks you to generate a question paper, exam, or test, you MUST use the 'generateQuestionPaperTool'.
- If a user's question is ambiguous, ask clarifying questions to ensure you provide the most relevant and accurate answer.
- Maintain a positive, friendly, and supportive tone throughout the conversation.
- Structure your responses for clarity. Use Markdown for formatting (e.g., lists, bold text) to make your answers easy to read.
- Your primary goal is to help users learn and understand, not just to provide an answer.
- If an image is provided, analyze it and use it as the primary context for your response.
`;


const generalChatFlow = ai.defineFlow(
  {
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
  },
  async (input) => {

    const model = ai.getmodel('googleai/gemini-1.5-flash-latest');

    const response = await ai.generate({
        model,
        prompt: {
            system: systemPrompt,
            history: input.history,
        },
        tools: [generateQuestionPaperTool],
    });

    const toolRequest = response.toolRequest();
    if (toolRequest) {
      const toolResponse = await toolRequest.run();
      const finalResponse = await ai.generate({
        model,
        prompt: {
            system: systemPrompt,
            history: [...input.history, response.message, toolResponse],
        },
        tools: [generateQuestionPaperTool],
      });

      const toolOutput = toolResponse.output();
      if (toolOutput) {
        const conversationalText = finalResponse.text();
        const combinedResponse = `${conversationalText}\n\n[TOOL_RESULT:questionPaper]\n${JSON.stringify(toolOutput)}`;
        return { response: combinedResponse };
      }
      return { response: finalResponse.text() };
    }

    return {response: response.text()};
  }
);
