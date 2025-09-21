
'use server';

/**
 * @fileOverview Generates a presentation with slides, content, and speaker notes.
 *
 * - generatePresentation - A function that generates a presentation from a topic.
 * - GeneratePresentationInput - The input type for the generatePresentation function.
 * - GeneratePresentationOutput - The return type for the generatePresentation function.
 */

import { openai } from '@/lib/openai';
import { z } from 'zod';

const GeneratePresentationInputSchema = z.object({
  topic: z.string().describe('The topic for the presentation.'),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const SlideSchema = z.object({
  title: z.string().describe("The title of the slide."),
  content: z.array(z.string()).describe("An array of key points or content for the slide body, formatted as bullet points."),
  speakerNotes: z.string().describe("Notes for the speaker for this slide, explaining what to say."),
});

const GeneratePresentationOutputSchema = z.object({
  title: z.string().describe('The main title of the overall presentation.'),
  slides: z.array(SlideSchema).min(5).max(10).describe('An array of 5 to 10 slides for the presentation.'),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;

const presentationSystemPrompt = `You are EasyLearnAI, an expert presentation creator with a confident and helpful Indian-style personality. Your task is to generate a complete, well-structured presentation on a given topic. Your answers should be nice, good, and correct. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

Topic: {{topic}}

You must generate the presentation in a valid JSON format. The JSON object should match the following schema:
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "slides": {
      "type": "array",
      "minItems": 5,
      "maxItems": 10,
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "content": { "type": "array", "items": { "type": "string" } },
          "speakerNotes": { "type": "string" }
        },
        "required": ["title", "content", "speakerNotes"]
      }
    }
  },
  "required": ["title", "slides"]
}

Please provide the following content:
1.  **Main Title**: Create a compelling title for the entire presentation.
2.  **Slides**: Generate between 5 and 10 slides.
3.  **For each slide**:
    *   A clear and concise **title**.
    *   A \`content\` array with 3-5 bullet points.
    *   Detailed **speaker notes** explaining what the presenter should say for that slide.

The presentation should have a logical flow:
- Start with an introduction/title slide.
- Follow with several body slides covering key aspects of the topic.
- End with a conclusion or summary slide.
`;

export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }
    
    let jsonResponseString;
    try {
        const prompt = presentationSystemPrompt.replace('{{topic}}', input.topic);

        const response = await openai.chat.completions.create({
            model: 'Llama-4-Maverick-17B-128E-Instruct',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from SambaNova.");
        }
        jsonResponseString = response.choices[0].message.content;

    } catch (error: any) {
        console.error("SambaNova presentation generation error:", error);
        throw new Error(error.message || "An unknown error occurred while generating the presentation with SambaNova.");
    }

    try {
        const jsonResponse = JSON.parse(jsonResponseString);
        const validatedOutput = GeneratePresentationOutputSchema.parse(jsonResponse);
        return validatedOutput;
    } catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string from SambaNova:", jsonResponseString);
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
}
