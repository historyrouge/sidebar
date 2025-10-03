
'use server';

/**
 * @fileOverview Generates an image from a text prompt using NVIDIA's sdxl-turbo model.
 *
 * - generateImage - A function that generates an image.
 */

import { nvidia } from '@/lib/nvidia';
import { z } from 'zod';
import { GenerateImageInput, GenerateImageOutput, GenerateImageOutputSchema } from '@/components/image-generation-content';


export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
    if (!process.env.NVIDIA_API_KEY) {
        throw new Error("NVIDIA API key is not configured.");
    }

    try {
        const response = await nvidia.images.generate({
            model: 'sdxl-turbo',
            prompt: input.prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json',
        });
        
        const b64_json = response.data[0]?.b64_json;
        if (!b64_json) {
            throw new Error("The AI model did not return an image.");
        }

        const imageDataUri = `data:image/png;base64,${b64_json}`;

        return { imageDataUri };

    } catch (error: any) {
        console.error("NVIDIA image generation error:", error);
        throw new Error(error.message || "An unknown error occurred while generating the image.");
    }
}
