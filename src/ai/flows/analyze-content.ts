// src/ai/flows/analyze-content.ts
'use server';

/**
 * @fileOverview Analyzes content to identify key concepts and generate potential questions.
 *
 * - analyzeContent - A function that analyzes the content and generates questions.
 * - AnalyzeContentInput - The input type for the analyzeContent function.
 * - AnalyzeContentOutput - The return type for the analyzeContent function.
 */

import { openai } from '@/lib/openai';
import {z} from 'zod';

const AnalyzeContentInputSchema = z.object({
  content: z.string().describe('The content to analyze.'),
});
export type AnalyzeContentInput = z.infer<typeof AnalyzeContentInputSchema>;

const AnalyzeContentOutputSchema = z.object({
  summary: z.string().describe('A concise, one-paragraph summary of the content.'),
  keyConcepts: z.array(z.object({
    concept: z.string().describe('The key concept identified.'),
    explanation: z.string().describe('A brief explanation of the concept, including its relationship to other concepts.'),
  })).describe('Key concepts identified in the content.'),
    codeExamples: z.array(z.object({
    code: z.string().describe('The code snippet.'),
    explanation: z.string().describe('A brief explanation of what the code does.'),
  })).describe('Code examples found in the content.'),
  potentialQuestions: z.array(z.string()).describe('Potential questions based on the content that test for deep understanding.'),
  relatedTopics: z.array(z.string()).describe('A list of related topics for further exploration.'),
});
export type AnalyzeContentOutput = z.infer<typeof AnalyzeContentOutputSchema>;


const analysisSystemPrompt = `You are SearnAI, an expert educator and AI tool with a confident and helpful Indian-style personality. Your task is to analyze the given content to help students study more effectively. Your answers should be nice, good, and correct. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

Content to analyze:
---
{{{content}}}
---

You must perform the following actions and provide your response in a valid JSON format. The JSON object should match the following schema:
{
    "type": "object",
    "properties": {
        "summary": { "type": "string" },
        "keyConcepts": { "type": "array", "items": { "type": "object", "properties": { "concept": { "type": "string" }, "explanation": { "type": "string" } } } },
        "codeExamples": { "type": "array", "items": { "type": "object", "properties": { "code": { "type": "string" }, "explanation": { "type": "string" } } } },
        "potentialQuestions": { "type": "array", "items": { "type": "string" } },
        "relatedTopics": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["summary", "keyConcepts", "codeExamples", "potentialQuestions", "relatedTopics"]
}


Please provide the following content in the JSON response:
1.  **Summary**: Create a concise, one-paragraph summary that captures the main ideas and purpose of the content.
2.  **Key Concepts**: Identify the most important concepts. For each concept, provide a clear explanation and describe how it relates to other key concepts in the text.
3.  **Code Examples**: If there are any code snippets (e.g., in Python, JavaScript, HTML), extract them. For each snippet, provide a brief explanation of what the code does. If no code is present, return an empty array.
4.  **Insightful Questions**: Create a list of potential questions that go beyond simple factual recall. These questions should test for deeper understanding, critical thinking, and the ability to apply the concepts.
5.  **Related Topics**: Recommend a list of related topics or areas of study that would be logical next steps for someone learning this material.
`;

export async function analyzeContent(input: AnalyzeContentInput): Promise<AnalyzeContentOutput> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }
    
    let jsonResponseString;
    try {
        const prompt = analysisSystemPrompt.replace('{{{content}}}', input.content);

        const response = await openai.chat.completions.create({
            model: 'DeepSeek-V3.1',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from SambaNova.");
        }
        jsonResponseString = response.choices[0].message.content;

    } catch (error: any) {
        console.error("SambaNova content analysis error:", error);
        throw new Error(error.message || "An unknown error occurred while analyzing content with SambaNova.");
    }

    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        const validatedOutput = AnalyzeContentOutputSchema.parse(jsonResponse);
        return validatedOutput;
    } catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string from SambaNova:", jsonResponseString);
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
}
