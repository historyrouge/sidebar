"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalChat = void 0;
/**
 * @fileOverview General purpose AI chatbot.
 *
 * - generalChat - A function that handles the conversational chat.
 * - GeneralChatInput - The input type for the generalChat function.
 * - GeneralChatOutput - The return type for the generalChat function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const GeneralChatInputSchema = zod_1.z.object({
    history: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'model', 'tool']),
        content: zod_1.z.any(), // Allow any content for multipart
    }))
        .describe('The conversation history.'),
});
const GeneralChatOutputSchema = zod_1.z.object({
    response: zod_1.z.string().describe("The chatbot's response, which could be text or stringified JSON from a tool."),
});
// This flow is no longer used for the main chat, as it has been switched to SambaNova.
// It is kept for reference or potential future use with Gemini.
exports.generalChat = genkit_1.ai.defineFlow({
    name: 'generalChatFlow',
    inputSchema: GeneralChatInputSchema,
    outputSchema: GeneralChatOutputSchema,
}, async (input) => {
    // This is a placeholder as the main logic has moved to actions.ts for SambaNova
    return { response: "This flow is currently not in use." };
});
