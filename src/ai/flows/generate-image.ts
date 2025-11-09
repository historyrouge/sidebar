
'use server';

/**
 * @fileOverview Generates an image from a text prompt by first enhancing the prompt and then creating an SVG.
 *
 * - generateImage - A function that generates an image.
 */
import { openai } from '@/lib/openai';
import { GenerateImageInput, GenerateImageOutput } from '@/components/image-generation-content';

const promptEnhancerSystemPrompt = `You are a world-class prompt engineer for an SVG image generator. Your task is to take a user's simple prompt and expand it into a detailed, visually rich prompt that describes a masterpiece. The enhanced prompt should be a single, concise sentence that an AI can easily interpret to create a stunning SVG.

When enhancing the prompt, you MUST consider and include details about the following aspects:
- **Art Style:** Specify a style (e.g., minimalist, flat design, abstract, geometric, cartoon, bauhaus, art deco).
- **Color Palette:** Suggest a specific color scheme (e.g., "using a warm color palette of burnt orange, mustard yellow, and deep red," or "with a cool-toned palette of blues and purples").
- **Composition:** Describe the layout (e.g., "centered composition," "asymmetrical balance," "dynamic lines," "rule of thirds").
- **Key Details:** Add specific visual elements (e.g., "with clean lines," "subtle gradients," "bold shapes," "soft shadows," "textured background").

User Prompt:
---
{{prompt}}
---

Respond with ONLY the enhanced prompt, and nothing else.

**Example:**
User Prompt: a coffee cup
Enhanced Prompt: A minimalist flat design of a centered coffee cup with steam rising, using a warm, earthy color palette of brown, beige, and off-white, with clean lines and soft shadows.`;


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
    
    let enhancedPrompt;
    try {
        // Step 1: Enhance the user's prompt
        const enhancerPrompt = promptEnhancerSystemPrompt.replace('{{prompt}}', input.prompt);
        const enhancerResponse = await openai.chat.completions.create({
            model: 'Llama-4-Maverick-17B-128E-Instruct',
            messages: [{ role: 'user', content: enhancerPrompt }],
            temperature: 0.7,
        });

        if (!enhancerResponse.choices || enhancerResponse.choices.length === 0 || !enhancerResponse.choices[0].message?.content) {
            throw new Error("Failed to get an enhanced prompt from the AI model.");
        }
        enhancedPrompt = enhancerResponse.choices[0].message.content.trim();

    } catch (error: any) {
        console.error("AI prompt enhancement error:", error);
        // Fallback to the original prompt if enhancement fails
        enhancedPrompt = input.prompt;
    }


    // Step 2: Generate the image using the enhanced prompt
    let svgResponse;
    try {
        const finalImagePrompt = imageSystemPrompt.replace('{{prompt}}', enhancedPrompt);
        const imageResponse = await openai.chat.completions.create({
            model: 'Llama-4-Maverick-17B-128E-Instruct',
            messages: [{ role: 'user', content: finalImagePrompt }],
            temperature: 0.7,
        });

        if (!imageResponse.choices || imageResponse.choices.length === 0 || !imageResponse.choices[0].message?.content) {
            throw new Error("Received an empty or invalid response from the AI model for image generation.");
        }
        svgResponse = imageResponse.choices[0].message.content;

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
