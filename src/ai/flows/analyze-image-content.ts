
'use server';

import { openai } from '@/lib/openai';
import { z } from 'zod';
import { AnalyzeImageContentInput, AnalyzeImageContentOutput, AnalyzeImageContentOutputSchema } from '@/lib/image-analysis-types';


const analysisSystemPrompt = `You are SearnAI, an expert visual analyst with a keen eye for detail, similar to a confident and helpful Indian art critic. Your task is to analyze the provided image and return a structured analysis in JSON format.

You must provide the following information:
1.  **description**: A detailed, single-paragraph description of the entire image. Describe the scene, subject, setting, and any notable actions or context.
2.  **objects**: A list of the most prominent objects or subjects in the image.
3.  **colors**: A list of 3 to 5 dominant colors. For each, provide a common 'name' and its 'hex' code.
4.  **mood**: A list of 1 to 3 keywords that best describe the mood, tone, or emotion of the image.
5.  **composition**: A list of 1 to 3 keywords describing the photographic or artistic composition.

Respond ONLY with a valid JSON object matching this schema:
{
    "type": "object",
    "properties": {
        "description": { "type": "string" },
        "objects": { "type": "array", "items": { "type": "string" } },
        "colors": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": { "name": { "type": "string" }, "hex": { "type": "string" } },
                "required": ["name", "hex"]
            }
        },
        "mood": { "type": "array", "items": { "type": "string" } },
        "composition": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["description", "objects", "colors", "mood", "composition"]
}
`;

export async function analyzeImageContent(input: AnalyzeImageContentInput): Promise<AnalyzeImageContentOutput> {
     if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }
    
    let jsonResponseString;
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-oss-120b', // Vision model
            messages: [
                {
                    role: 'system',
                    content: analysisSystemPrompt,
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: "image_url",
                            image_url: { url: input.imageDataUri }
                        },
                        {
                            type: "text",
                            text: "Analyze this image."
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 1024,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from the vision model.");
        }
        jsonResponseString = response.choices[0].message.content;

    } catch (error: any) {
        console.error("Image analysis error:", error);
        throw new Error(error.message || "An unknown error occurred while analyzing the image.");
    }

    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        const validatedOutput = AnalyzeImageContentOutputSchema.parse(jsonResponse);
        return validatedOutput;
    } catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string from vision model:", jsonResponseString);
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
}
