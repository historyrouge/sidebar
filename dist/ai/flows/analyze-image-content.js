"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImageContent = analyzeImageContent;
/**
 * @fileOverview Analyzes image content to identify key concepts and generate potential questions.
 *
 * - analyzeImageContent - A function that analyzes an image and generates questions.
 * - AnalyzeImageContentInput - The input type for the analyzeImageContent function.
 * - AnalyzeImageContentOutput - The return type for the analyzeImageContent function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const AnalyzeImageContentInputSchema = zod_1.z.object({
    imageDataUri: zod_1.z
        .string()
        .describe("An image of a diagram, slide, or page from a book, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
    prompt: zod_1.z.string().optional().describe('An optional text prompt to guide the analysis.'),
});
const AnalyzeImageContentOutputSchema = zod_1.z.object({
    summary: zod_1.z.string().describe('A concise, one-paragraph summary of the image content.'),
    keyConcepts: zod_1.z.array(zod_1.z.object({
        concept: zod_1.z.string().describe('The key concept identified.'),
        explanation: zod_1.z.string().describe('A brief explanation of the concept.'),
    })).describe('Key concepts identified in the image.'),
    entities: zod_1.z.object({
        people: zod_1.z.array(zod_1.z.string()).describe('A list of names of people identified in the image.'),
        places: zod_1.z.array(zod_1.z.string()).describe('A list of names of places identified in the image.'),
        dates: zod_1.z.array(zod_1.z.string()).describe('A list of dates identified in the image.'),
    }).describe('Specific entities identified in the image.'),
    diagrams: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string().describe('The title or a brief description of the diagram or process.'),
        explanation: zod_1.z.string().describe('A step-by-step explanation of the diagram or process.'),
    })).describe('Detailed explanations of any diagrams or processes found in the image.'),
    codeExamples: zod_1.z.array(zod_1.z.object({
        code: zod_1.z.string().describe('The code snippet.'),
        explanation: zod_1.z.string().describe('A brief explanation of what the code does.'),
    })).describe('Code examples found in the content.'),
    potentialQuestions: zod_1.z.array(zod_1.z.string()).describe('Potential questions based on the image content.'),
    relatedTopics: zod_1.z.array(zod_1.z.string()).describe('A list of related topics for further exploration based on the image content.'),
});
async function analyzeImageContent(input) {
    return analyzeImageContentFlow(input);
}
const analyzeImagePrompt = genkit_1.ai.definePrompt({
    name: 'analyzeImagePrompt',
    input: { schema: AnalyzeImageContentInputSchema },
    output: { schema: AnalyzeImageContentOutputSchema },
    model: genkit_1.visionModel,
    prompt: `You are SearnAI, an AI tool that analyzes images to help students. Your personality is that of a confident, helpful Indian guide. Be sure in your answers and make them engaging and correct. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

Image to analyze: {{media url=imageDataUri}}

{{#if prompt}}
The user has provided the following text as context. Use it to guide your analysis of the image:
---
{{{prompt}}}
---
{{/if}}

Analyze the image with expert detail:
1.  **Summary**: Generate a concise, one-paragraph summary of the image content.
2.  **Key Concepts**: Identify the most important concepts. For each concept, provide a brief explanation.
3.  **Entity Extraction**: Identify and list any specific people, places, or dates mentioned in the image. If none, return empty arrays.
4.  **Diagram/Process Explanation**: If the image contains any diagrams, flowcharts, or processes, provide a title and a step-by-step explanation for each. If none, return an empty array.
5.  **Code Examples**: If there are any code snippets (e.g., in Python, JavaScript, HTML), extract them. For each snippet, provide a brief explanation of what the code does. If no code is present, return an empty array.
6.  **Potential Questions**: Generate insightful questions based on the image content that test for deep understanding.
7.  **Related Topics**: Suggest a list of related topics for further exploration.`,
});
const analyzeImageContentFlow = genkit_1.ai.defineFlow({
    name: 'analyzeImageContentFlow',
    inputSchema: AnalyzeImageContentInputSchema,
    outputSchema: AnalyzeImageContentOutputSchema,
}, async (input) => {
    const { output } = await analyzeImagePrompt(input);
    return output;
});
