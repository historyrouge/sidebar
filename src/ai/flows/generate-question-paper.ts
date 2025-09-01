
'use server';

/**
 * @fileOverview Generates a question paper based on the CBSE pattern using SambaNova.
 *
 * - generateQuestionPaper - A function that generates the paper.
 */

import { GenerateQuestionPaperInput, GenerateQuestionPaperInputSchema, GenerateQuestionPaperOutput, GenerateQuestionPaperOutputSchema } from '@/lib/question-paper-types';
import { openai } from '@/lib/openai';

const paperSystemPrompt = `You are an expert educator specializing in creating academic question papers based on the Indian CBSE (Central Board of Secondary Education) pattern. Your task is to generate a well-structured question paper. If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student.

You must generate a question paper for:
Class: {{className}}
Subject: {{subject}}
Topic: {{topic}}

You must provide your response in a valid JSON format. The JSON object should match the following schema:
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "generalInstructions": { "type": "array", "items": { "type": "string" } },
    "sectionA": { "type": "array", "items": { "type": "object", "properties": { "question": { "type": "string" }, "marks": { "type": "number" } } } },
    "sectionB": { "type": "array", "items": { "type": "object", "properties": { "question": { "type": "string" }, "marks": { "type": "number" } } } },
    "sectionC": { "type": "array", "items": { "type": "object", "properties": { "question": { "type": "string" }, "marks": { "type": "number" } } } },
    "sectionD": { "type": "array", "items": { "type": "object", "properties": { "question": { "type": "string" }, "marks": { "type": "number" } } } },
    "sectionE": { "type": "array", "items": { "type": "object", "properties": { "case": { "type": "string" }, "questions": { "type": "array", "items": { "type": "object", "properties": { "question": { "type": "string" }, "marks": { "type": "number" } } } } } } }
  },
  "required": ["title", "generalInstructions", "sectionA", "sectionB", "sectionC", "sectionD", "sectionE"]
}

Please generate the following content:
1.  **Title**: Create a suitable title for the question paper.
2.  **General Instructions**: Provide a list of standard instructions for students.
3.  **Structure**: The paper must be divided into five sections: A, B, C, D, and E.
4.  **Section A**: Generate 3-5 multiple-choice or one-word answer questions. Each question should be worth 1 mark.
5.  **Section B**: Generate 2-3 very short answer questions. Each question should be worth 2 marks.
6.  **Section C**: Generate 2 short answer questions. Each question should be worth 3 marks.
7.  **Section D**: Generate 1 long answer question. This question should be worth 5 marks.
8.  **Section E**: Generate 1 case-based or source-based integrated question. This section should have a descriptive case/paragraph followed by 2-3 sub-questions based on it. The total marks for this section should be 4.

Ensure the questions are relevant to the specified class, subject, and topic. The difficulty should be balanced.
`;


export async function generateQuestionPaper(input: GenerateQuestionPaperInput): Promise<GenerateQuestionPaperOutput> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }
    
    let jsonResponseString;
    try {
        const prompt = paperSystemPrompt
            .replace('{{className}}', input.className)
            .replace('{{subject}}', input.subject)
            .replace('{{topic}}', input.topic);

        const response = await openai.chat.completions.create({
            model: 'Meta-Llama-3.1-8B-Instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from SambaNova.");
        }
        jsonResponseString = response.choices[0].message.content;

    } catch (error: any) {
        console.error("SambaNova question paper error:", error);
        throw new Error(error.message || "An unknown error occurred while generating the question paper with SambaNova.");
    }

    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        const validatedOutput = GenerateQuestionPaperOutputSchema.parse(jsonResponse);
        return validatedOutput;
    } catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string from SambaNova:", jsonResponseString);
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
}
