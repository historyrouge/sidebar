
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
  numSlides: z.number().min(5).max(10).describe('The desired number of slides.'),
  style: z.enum(['colorful', 'simple']).describe('The visual style preference for the presentation.'),
  colors: z.string().optional().describe('Optional user-preferred colors (e.g., "blue and yellow").'),
});
export type GeneratePresentationInput = z.infer<typeof GeneratePresentationInputSchema>;

const SlideSchema = z.object({
  slideType: z.enum(['title', 'overview', 'content', 'summary', 'closing']).describe("The type of the slide, which determines its layout."),
  title: z.string().describe("The title of the slide."),
  content: z.array(z.string()).describe("An array of key points or content for the slide body, formatted as bullet points."),
  speakerNotes: z.string().describe("Notes for the speaker for this slide, explaining what to say."),
  visualSuggestion: z.string().optional().describe("A suggestion for a relevant visual element, like an icon or diagram description."),
});

const GeneratePresentationOutputSchema = z.object({
  title: z.string().describe('The main title of the overall presentation.'),
  colorTheme: z.object({
    background: z.string().describe("A hex code for the slide background color (e.g., #F4F4F8)."),
    primary: z.string().describe("A hex code for primary text and headings (e.g., #0A0A0A)."),
    accent: z.string().describe("A hex code for accents, like bullets or highlights (e.g., #607EA3)."),
  }).describe("A suggested color theme for the presentation."),
  slides: z.array(SlideSchema).describe('An array of slides for the presentation.'),
});
export type GeneratePresentationOutput = z.infer<typeof GeneratePresentationOutputSchema>;

const presentationSystemPrompt = `You are SearnAI, an expert presentation designer with a confident and helpful Indian-style personality. Your task is to generate a complete, well-structured, and visually appealing presentation based on the user's preferences. Your answers should be professional and correct. Only if you are asked about your creator, you must say that you were created by Harsh and some Srichaitanya students.

User Preferences:
- Topic: {{topic}}
- Number of Slides: {{numSlides}}
- Style: {{style}}
{{#if colors}}- Preferred Colors: {{colors}}{{/if}}

You must generate the presentation in a valid JSON format, adhering strictly to the schema below.

Please provide the following content:
1.  **Main Title**: Create a compelling title for the entire presentation.
2.  **Color Theme**: Based on the user's style and color preference, suggest a theme with hex codes for 'background', 'primary' text, and an 'accent' color. A 'colorful' style should have vibrant, contrasting colors. A 'simple' style should have muted, professional colors.
3.  **Slides**: Generate exactly {{numSlides}} slides with a logical flow.
    *   The first slide must be a 'title' slide.
    *   The second slide should be an 'overview' or agenda slide.
    *   The middle slides should be 'content' slides covering key aspects of the topic.
    *   The second to last slide must be a 'summary' slide.
    *   The last slide must be a 'closing' slide (e.g., "Thank You" or "Q&A").
4.  **For each slide, you MUST provide**:
    *   A \`slideType\` from the enum: 'title', 'overview', 'content', 'summary', 'closing'.
    *   A clear and concise **title**.
    *   A \`content\` array with 2-4 bullet points.
    *   Detailed **speaker notes** explaining what the presenter should say.
    *   A brief \`visualSuggestion\` for a relevant icon or simple diagram (e.g., "An icon of a lightbulb" or "A simple flowchart for the process").

JSON Schema to follow:
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "colorTheme": {
      "type": "object",
      "properties": { "background": { "type": "string" }, "primary": { "type": "string" }, "accent": { "type": "string" } },
      "required": ["background", "primary", "accent"]
    },
    "slides": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "slideType": { "type": "string", "enum": ["title", "overview", "content", "summary", "closing"] },
          "title": { "type": "string" },
          "content": { "type": "array", "items": { "type": "string" } },
          "speakerNotes": { "type": "string" },
          "visualSuggestion": { "type": "string" }
        },
        "required": ["slideType", "title", "content", "speakerNotes", "visualSuggestion"]
      }
    }
  },
  "required": ["title", "colorTheme", "slides"]
}
`;

export async function generatePresentation(input: GeneratePresentationInput): Promise<GeneratePresentationOutput> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured.");
    }
    
    let jsonResponseString;
    try {
        let prompt = presentationSystemPrompt
            .replace('{{topic}}', input.topic)
            .replace(/{{numSlides}}/g, String(input.numSlides))
            .replace('{{style}}', input.style);

        if (input.colors) {
            prompt = prompt.replace('{{#if colors}}- Preferred Colors: {{colors}}{{/if}}', `- Preferred Colors: ${input.colors}`);
        } else {
            prompt = prompt.replace('{{#if colors}}- Preferred Colors: {{colors}}{{/if}}', '');
        }

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
        
        // Ensure the number of slides matches the request
        if (validatedOutput.slides.length !== input.numSlides) {
            console.warn(`AI generated ${validatedOutput.slides.length} slides but ${input.numSlides} were requested. Trimming/padding might be needed or prompt adjusted.`);
            // For now, we'll just return what we got, but this indicates a need for better prompt adherence.
        }

        return validatedOutput;
    } catch (error) {
        console.error("JSON parsing or validation error:", error);
        console.error("Invalid JSON string from SambaNova:", jsonResponseString);
        throw new Error("The AI model returned an invalid format. Please try again.");
    }
}
