
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
        imageDataUri: z.string().optional().describe('An optional image from the user, as a data URI.'),
      })
    )
    .describe('The conversation history.'),
  imageDataUri: z.string().optional().describe('An optional image from the user for the CURRENT message, as a data URI.'),
});
export type GeneralChatInput = z.infer<typeof GeneralChatInputSchema>;

const GeneralChatOutputSchema = z.object({
  response: z.string().describe("The chatbot's response, which could be text or stringified JSON from a tool."),
});
export type GeneralChatOutput = z.infer<typeof GeneralChatOutputSchema>;

export async function generalChat(input: GeneralChatInput): Promise<GeneralChatOutput> {
  return generalChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generalChatPrompt',
  input: {schema: GeneralChatInputSchema},
  output: {schema: GeneralChatOutputSchema},
  tools: [generateQuestionPaperTool],
  prompt: `You are a friendly and helpful AI assistant named Easy Learn AI. Your goal is to be an expert educator who makes learning accessible and engaging.

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

{{#if imageDataUri}}
The user has provided this image. Use it as the primary context for your response.
{{media url=imageDataUri}}
{{/if}}

Conversation History:
---
{{#each history}}
**{{role}}**: {{{content}}}
{{#if imageDataUri}}
[IMAGE WAS ATTACHED]
{{/if}}
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
    const response = await ai.generate({
      prompt: prompt.prompt,
      history: input.history as any,
      model: 'googleai/gemini-1.5-flash-latest',
      tools: [generateQuestionPaperTool],
      // @ts-ignore - 'input' is implicitly passed but let's make it explicit for clarity
      input: input, 
    });

    const toolRequest = response.toolRequest();
    if (toolRequest) {
      const toolResponse = await toolRequest.run();
      // When the tool response is available, we send it back to the model
      const finalResponse = await ai.generate({
        prompt: prompt.prompt,
        history: [...input.history, response.message, toolResponse] as any,
        model: 'googleai/gemini-1.5-flash-latest',
        tools: [generateQuestionPaperTool],
        input: input,
      });

       // Now, the model will generate a conversational response about the tool's output.
      // But we also want to return the actual tool data to the client.
      const toolOutput = toolResponse.output();
      if (toolOutput) {
        // We'll stringify the tool's JSON output and send it along with the conversational part.
        const conversationalText = finalResponse.text();
        const combinedResponse = `${conversationalText}\n\n[TOOL_RESULT:questionPaper]\n${JSON.stringify(toolOutput)}`;
        return { response: combinedResponse };
      }
      return { response: finalResponse.text() };
    }

    return {response: response.text()};
  }
);
