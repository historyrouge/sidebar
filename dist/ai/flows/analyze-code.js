"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeCode = analyzeCode;
/**
 * @fileOverview Analyzes code to explain it, find bugs, and suggest optimizations.
 *
 * - analyzeCode - A function that analyzes a code snippet.
 */
const openai_1 = require("@/lib/openai");
const code_analysis_types_1 = require("@/lib/code-analysis-types");
const analysisSystemPrompt = `You are SearnAI, an expert programmer and code reviewer with a confident and helpful Indian-style personality. You specialize in {{language}}.
Your task is to analyze the following code snippet and provide a detailed, correct, and easy-to-understand review. Your answers should be nice, good, and correct. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

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
async function analyzeCode(input) {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }
    let jsonResponseString;
    try {
        const prompt = analysisSystemPrompt
            .replace(/{{language}}/g, input.language)
            .replace('{{{code}}}', input.code);
        const response = await openai_1.openai.chat.completions.create({
            model: 'Llama-4-Maverick-17B-128E-Instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });
        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from SambaNova.");
        }
        jsonResponseString = response.choices[0].message.content;
    }
    catch (error) {
        console.error("SambaNova code analysis error:", error);
        throw new Error(error.message || "An unknown error occurred while analyzing code with SambaNova.");
    }
    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        const validatedOutput = code_analysis_types_1.AnalyzeCodeOutputSchema.parse(jsonResponse);
        return validatedOutput;
    }
    catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string from SambaNova:", jsonResponseString);
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
}
