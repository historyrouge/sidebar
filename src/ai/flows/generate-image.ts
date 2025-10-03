
'use server';

/**
 * @fileOverview Generates an image from a text prompt using a SambaNova model via an OpenAI-compatible client.
 *
 * - generateImage - A function that generates an image.
 */
import { openai } from '@/lib/openai';
import { GenerateImageInput, GenerateImageOutput } from '@/components/image-generation-content';

const imageSystemPrompt = `You are an expert SVG (Scalable Vector Graphics) generator. Your task is to create an SVG image based on the user's prompt. You must respond with ONLY the raw SVG code, starting with \`<svg ...>\` and ending with \`</svg>\`. Do not include any other text, explanations, or markdown formatting like \`\`\`xml.

The SVG should be square (e.g., viewBox="0 0 100 100"), have a transparent or simple background, and be visually appealing.

User Prompt:
---
{{prompt}}
---
`;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    if (!process.env.SAMBANOVA_API_KEY || !process.env.SAMBANOVA_BASE_URL) {
        throw new Error("SambaNova API key or base URL is not configured for image generation.");
    }
    
    let svgResponse;
    try {
        const prompt = imageSystemPrompt.replace('{{prompt}}', input.prompt);
        const response = await openai.chat.completions.create({
            model: 'Llama-4-Maverick-17B-128E-Instruct',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        if (!response.choices || response.choices.length === 0 || !response.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from the AI model.");
        }
        svgResponse = response.choices[0].message.content;

        // Clean up response to ensure it's valid SVG
        const svgMatch = svgResponse.match(/<svg[\s\S]*?<\/svg>/);
        if (!svgMatch) {
            console.error("AI did not return valid SVG:", svgResponse);
            throw new Error("The AI failed to generate a valid SVG image. Please try a different prompt.");
        }
        
        const pureSvg = svgMatch[0];
        const imageDataUri = `data:image/svg+xml;base64,${btoa(pureSvg)}`;
        
        return { imageDataUri };

    } catch (error: any) {
        console.error("AI image generation error:", error);
        throw new Error(error.message || "An unknown error occurred while generating the image.");
    }
}
