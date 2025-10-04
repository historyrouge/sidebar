"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithTutor = chatWithTutor;
/**
 * @fileOverview AI Tutor for interactive learning.
 *
 * - chatWithTutor - A function that handles the conversational tutoring.
 * - ChatWithTutorInput - The input type for the chatWithTutor function.
 * - ChatWithTutorOutput - The return type for the chatWithTutor function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const ChatWithTutorInputSchema = zod_1.z.object({
    content: zod_1.z.string().describe('The study material context.'),
    history: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'model']),
        content: zod_1.z.string(),
    })).describe('The conversation history.'),
});
const ChatWithTutorOutputSchema = zod_1.z.object({
    response: zod_1.z.string().describe('The tutor\'s response.'),
});
async function chatWithTutor(input) {
    return chatWithTutorFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'chatWithTutorPrompt',
    input: { schema: ChatWithTutorInputSchema },
    output: { schema: ChatWithTutorOutputSchema },
    prompt: `You are an expert AI tutor. Your goal is to help the user understand the provided study material. Engage in a supportive and encouraging conversation.

Study Material Context:
---
{{{content}}}
---

Conversation History:
---
{{#each history}}
**{{role}}**: {{{content}}}
{{/each}}
---

Based on the context and history, provide a helpful and encouraging response to the user's last message. Your response should be in Markdown format.`,
});
const chatWithTutorFlow = genkit_1.ai.defineFlow({
    name: 'chatWithTutorFlow',
    inputSchema: ChatWithTutorInputSchema,
    outputSchema: ChatWithTutorOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
