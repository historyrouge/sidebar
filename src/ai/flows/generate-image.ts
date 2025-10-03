
'use server';

/**
 * @fileOverview Generates an image from a text prompt using a Google model via Genkit.
 *
 * - generateImage - A function that generates an image.
 */

import { ai, googleAI } from '@/ai/genkit';
import { GenerateImageInput, GenerateImageOutput } from '@/components/image-generation-content';


export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    
    try {
        const { media } = await ai.generate({
            model: googleAI.model('gemini-1.5-flash-latest'),
            prompt: `Generate an image of: ${input.prompt}`,
            config: {
                responseModalities: ['IMAGE'],
            },
        });
        
        if (!media?.url) {
            throw new Error("The AI model did not return an image.");
        }

        return { imageDataUri: media.url };

    } catch (error: any) {
        console.error("Google AI image generation error:", error);
        throw new Error(error.message || "An unknown error occurred while generating the image.");
    }
}
