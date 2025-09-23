
'use server';

/**
 * @fileOverview Generates or edits content based on user instructions.
 *
 * - generateEditedContent - A function that takes instructions and content, and returns the AI's output.
 */

import { openai } from '@/lib/openai';
import { z } from 'zod';

const GenerateEditedContentInputSchema = z.object({
  instruction: z.string().describe('The user\'s instruction for what to do with the content.'),
  content: z.string().optional().describe('The input content to be edited, analyzed, or used as context.'),
});
export type GenerateEditedContentInput = z.infer<typeof GenerateEditedContentInputSchema>;

const GenerateEditedContentOutputSchema = z.object({
  editedContent: z.string().describe('The AI-generated or edited content.'),
});
export type GenerateEditedContentOutput = z.infer<typeof GenerateEditedContentOutputSchema>;

const editorSystemPrompt = `You are SearnAI, a powerful and versatile AI assistant with a confident and helpful Indian-style personality. Your task is to follow the user's instruction and generate a high-quality response.

- If the user provides content, use it as the primary source for your task (e.g., editing, summarizing, converting).
- If the user provides only an instruction, generate the content from scratch based on that instruction (e.g., writing code, composing text).
- Be precise and clear in your output.
- For code, ensure it is well-formatted and correct.

User Instruction:
---
{{instruction}}
---

{{#if content}}
Input Content:
---
{{content}}
---
{{/if}}
`;


export async function generateEditedContent(input: GenerateEditedContentInput): Promise<GenerateEditedContentOutput> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }
    
    let responseText;
    try {
        let prompt = editorSystemPrompt
            .replace('{{instruction}}', input.instruction);
        
        if (input.content) {
            prompt = prompt.replace('{{#if content}}...{{/if}}', `Input Content:\n---\n${input.content}\n---`);
        } else {
            prompt = prompt.replace('{{#if content}}...{{/if}}', '');
        }

        const response = await openai.chat.completions.create({
            model: 'Llama-4-Maverick-17B-128E-Instruct',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from the AI model.");
        }
        responseText = response.choices[0].message.content;

        // Clean up response if model wraps it in markdown
        const cleanedText = responseText.replace(/^```(?:\w+\n)?([\s\S]+)```$/, '$1').trim();

        return { editedContent: cleanedText };

    } catch (error: any) {
        console.error("AI editor error:", error);
        throw new Error(error.message || "An unknown error occurred while generating content.");
    }
}
