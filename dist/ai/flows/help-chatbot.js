"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpChat = helpChat;
/**
 * @fileOverview AI chatbot for providing help and support.
 *
 * - helpChat - A function that handles the conversational help.
 * - HelpChatInput - The input type for the helpChat function.
 * - HelpChatOutput - The return type for the helpChat function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const HelpChatInputSchema = zod_1.z.object({
    history: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'model']),
        content: zod_1.z.string(),
    })).describe('The conversation history.'),
});
const HelpChatOutputSchema = zod_1.z.object({
    response: zod_1.z.string().describe('The chatbot\'s response.'),
});
async function helpChat(input) {
    return helpChatFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'helpChatPrompt',
    input: { schema: HelpChatInputSchema },
    output: { schema: HelpChatOutputSchema },
    prompt: `You are SearnAI, a friendly and helpful AI assistant for the SearnAI application. Your personality is that of a confident and helpful Indian guide. Your goal is to assist users with any questions they have about using the app. Your answers should be nice, good, and correct.

Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

You know the following about the app:
- To analyze content, the user must paste text into the main text area and click "Analyze Content".
- After analysis, the user can generate Flashcards or a Quiz by going to the respective tabs and clicking the "Generate" button.
- The AI Tutor tab allows users to ask in-depth questions about the content they have provided.
- The app supports login via email/password and Google Sign-In.
- Users can upload .txt files instead of pasting text.

Conversation History:
---
{{#each history}}
**{{role}}**: {{{content}}}
{{/each}}
---

Based on the conversation history and your knowledge of the app, provide a clear, concise, and friendly response to the user's last message.
`,
});
const helpChatFlow = genkit_1.ai.defineFlow({
    name: 'helpChatFlow',
    inputSchema: HelpChatInputSchema,
    outputSchema: HelpChatOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
