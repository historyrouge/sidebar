
'use server';

/**
 * @fileOverview Analyzes code to explain it, find bugs, and suggest optimizations.
 *
 * - analyzeCode - A function that analyzes a code snippet.
 */

import { openai } from '@/lib/openai';
import { AnalyzeCodeInput, AnalyzeCodeInputSchema, AnalyzeCodeOutput, AnalyzeCodeOutputSchema } from '@/lib/code-analysis-types';


const analysisSystemPrompt = `You are an expert programmer and code reviewer specializing in {{language}}.
Your task is to analyze the following code snippet and provide a detailed review.
If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student.

Code:
\`\`\`{{language}}
{{{code}}}
\`\`\`

You must provide your analysis in a valid JSON format. The JSON object should match the following schema:
{
    "type": "object",
    "properties": {
        "explanation": { "type": "string" },
        "potentialBugs": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "line": { "type": "number" },
                    "bug": { "type": "string" },
                    "fix": { "type": "string" }
                },
                "required": ["bug", "fix"]
            }
        },
        "optimizations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "line": { "type": "number" },
                    "suggestion": { "type": "string" }
                },
                "required": ["suggestion"]
            }
        }
    },
    "required": ["explanation", "potentialBugs", "optimizations"]
}


Please provide the following analysis in the JSON response:
1.  **Explanation**: Give a clear, high-level explanation of what the code is intended to do in the 'explanation' field.
2.  **Potential Bugs**: Identify any potential bugs, logical errors, or edge cases that are not handled. For each bug, specify the line number, describe the issue, and suggest a fix. Add these to the 'potentialBugs' array. If there are no bugs, return an empty array.
3.  **Optimizations**: Suggest any optimizations for performance, readability, or best practices. For each suggestion, specify the line number and explain the benefit. Add these to the 'optimizations' array. If there are no optimizations, return an empty array.
`;

export async function analyzeCode(input: AnalyzeCodeInput): Promise<AnalyzeCodeOutput> {
     if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }

    try {
        const prompt = analysisSystemPrompt
            .replace(/{{language}}/g, input.language)
            .replace('{{{code}}}', input.code);

        const response = await openai.chat.completions.create({
            model: 'Meta-Llama-3.1-8B-Instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from SambaNova.");
        }

        const jsonResponse = JSON.parse(response.choices[0].message.content);
        const validatedOutput = AnalyzeCodeOutputSchema.parse(jsonResponse);
        
        return validatedOutput;

    } catch (error: any) {
        console.error("SambaNova code analysis error:", error);
        throw new Error(error.message || "An unknown error occurred while analyzing code with SambaNova.");
    }
}
