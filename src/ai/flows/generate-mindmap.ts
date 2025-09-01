
'use server';

/**
 * @fileOverview Generates a mind map from provided content using Qwen.
 *
 * - generateMindMap - A function that takes text and returns a structured mind map.
 * - GenerateMindMapInput - The input type for the generateMindMap function.
 * - GenerateMindMapOutput - The return type for the generateMindMap function.
 */

import { openai } from '@/lib/openai';
import { z } from 'zod';

const GenerateMindMapInputSchema = z.object({
  content: z.string().describe('The content to generate the mind map from.'),
});
export type GenerateMindMapInput = z.infer<typeof GenerateMindMapInputSchema>;

const NodeSchema: z.ZodType<any> = z.lazy(() => 
    z.object({
        title: z.string().describe('The title of this node or branch.'),
        emoji: z.string().optional().describe('A single emoji that represents this node.'),
        content: z.array(
            z.object({
                heading: z.string().describe('The heading for a list of points (e.g., "Definition", "Pros", "Cons").'),
                points: z.array(z.string()).describe('An array of bullet points under the heading.'),
            })
        ).optional().describe('Structured content for the node.'),
        children: z.array(NodeSchema).optional().describe('An array of child nodes for further branching.'),
    })
);

const GenerateMindMapOutputSchema = z.object({
  centralTopic: z.object({
    title: z.string().describe('The central, main idea of the content.'),
    emoji: z.string().optional().describe('A single emoji for the central topic.'),
  }),
  mainNodes: z.array(NodeSchema).describe('The main branches extending from the central topic.'),
});
export type GenerateMindMapOutput = z.infer<typeof GenerateMindMapOutputSchema>;

const mindMapSystemPrompt = `You are an expert at creating structured and visually engaging mind maps from text. Your task is to analyze the following content and organize it into a hierarchical mind map. If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student.

You must generate a mind map with the following structure:
1.  **Central Topic**: Identify the single, overarching theme. Provide a title and a relevant emoji.
2.  **Main Nodes**: Create 3-5 main branches representing the most important high-level concepts.
3.  **Sub-Nodes (Children)**: For each main node, create a few sub-nodes that break down the concept further.
4.  **Node Content**: For each node (main and sub-nodes), you MUST provide:
    - A short, clear 'title'.
    - A single relevant 'emoji'.
    - 'content' containing structured information with headings (like "Definition", "Pros", "Cons") and an array of 'points'.

The entire output must be in a valid JSON format, matching this schema:
{
    "type": "object",
    "properties": {
        "centralTopic": { 
            "type": "object", 
            "properties": { "title": { "type": "string" }, "emoji": { "type": "string" } },
            "required": ["title", "emoji"]
        },
        "mainNodes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": { "type": "string" },
                    "emoji": { "type": "string" },
                    "content": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "heading": { "type": "string" },
                                "points": { "type": "array", "items": { "type": "string" } }
                            },
                            "required": ["heading", "points"]
                        }
                    },
                    "children": { "type": "array", "items": { "$ref": "#/properties/mainNodes/items" } }
                },
                "required": ["title", "emoji"]
            }
        }
    },
    "required": ["centralTopic", "mainNodes"]
}

Content to analyze:
---
{{content}}
---
`;

export async function generateMindMap(input: GenerateMindMapInput): Promise<GenerateMindMapOutput> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("Qwen API key or base URL is not configured.");
    }
    
    let jsonResponseString;
    try {
        const prompt = mindMapSystemPrompt.replace('{{content}}', input.content);

        const response = await openai.chat.completions.create({
            model: 'Meta-Llama-3.1-8B-Instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from Qwen.");
        }
        jsonResponseString = response.choices[0].message.content;

    } catch (error: any) {
        console.error("Qwen mind map error:", error);
        throw new Error(error.message || "An unknown error occurred while generating mind map with Qwen.");
    }

    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        const validatedOutput = GenerateMindMapOutputSchema.parse(jsonResponse);
        return validatedOutput;
    } catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string from Qwen:", jsonResponseString);
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
}
