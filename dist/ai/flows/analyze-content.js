"use strict";
// src/ai/flows/analyze-content.ts
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeContent = analyzeContent;
/**
 * @fileOverview Analyzes content to identify key concepts and generate potential questions.
 *
 * - analyzeContent - A function that analyzes the content and generates questions.
 * - AnalyzeContentInput - The input type for the analyzeContent function.
 * - AnalyzeContentOutput - The return type for the analyzeContent function.
 */
const genkit_1 = require("@/ai/genkit");
const duckduckgo_search_1 = require("@/ai/tools/duckduckgo-search");
const zod_1 = require("zod");
const AnalyzeContentInputSchema = zod_1.z.object({
    content: zod_1.z.string().describe('The content to analyze.'),
});
const AnalyzeContentOutputSchema = zod_1.z.object({
    summary: zod_1.z.string().describe('A concise, one-paragraph summary of the content.'),
    keyConcepts: zod_1.z.array(zod_1.z.object({
        concept: zod_1.z.string().describe('The key concept identified.'),
        explanation: zod_1.z.string().describe('A brief explanation of the concept, including its relationship to other concepts.'),
    })).describe('Key concepts identified in the content.'),
    codeExamples: zod_1.z.array(zod_1.z.object({
        code: zod_1.z.string().describe('The code snippet.'),
        explanation: zod_1.z.string().describe('A brief explanation of what the code does.'),
    })).describe('Code examples found in the content.'),
    potentialQuestions: zod_1.z.array(zod_1.z.string()).describe('Potential questions based on the content that test for deep understanding.'),
    relatedTopics: zod_1.z.array(zod_1.z.string()).describe('A list of related topics for further exploration.'),
});
async function analyzeContent(input) {
    return analyzeContentFlow(input);
}
const prompt = genkit_1.ai.definePrompt({
    name: 'analyzeContentPrompt',
    input: { schema: AnalyzeContentInputSchema },
    output: { schema: AnalyzeContentOutputSchema },
    tools: [duckduckgo_search_1.duckDuckGoSearch],
    prompt: `You are an expert educator and AI tool. Your task is to analyze the given content to help students study more effectively.

First, use the duckDuckGoSearch tool to search for the main topic of the content to gather additional context and information.

Content to analyze:
---
{{{content}}}
---

Please perform the following actions with expert detail, using both the provided content and the information from your web search:
1.  **Generate a Comprehensive Summary**: Create a concise, one-paragraph summary that captures the main ideas and purpose of the content.
2.  **Identify Key Concepts & Relationships**: Identify the most important concepts. For each concept, provide a clear explanation and describe how it relates to other key concepts in the text.
3.  **Extract and Explain Code Examples**: If there are any code snippets (e.g., in Python, JavaScript, HTML), extract them. For each snippet, provide a brief explanation of what the code does. If no code is present, return an empty array.
4.  **Generate Insightful Questions**: Create a list of potential questions that go beyond simple factual recall. These questions should test for deeper understanding, critical thinking, and the ability to apply the concepts.
5.  **Suggest Related Topics**: Recommend a list of related topics or areas of study that would be logical next steps for someone learning this material.
`,
});
const analyzeContentFlow = genkit_1.ai.defineFlow({
    name: 'analyzeContentFlow',
    inputSchema: AnalyzeContentInputSchema,
    outputSchema: AnalyzeContentOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    return output;
});
