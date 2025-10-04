"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageToText = imageToText;
/**
 * @fileOverview Extracts text from an image using a vision model.
 *
 * - imageToText - A function that performs OCR on an image.
 * - ImageToTextInput - The input type for the imageToText function.
 * - ImageToTextOutput - The return type for the imageToText function.
 */
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const ImageToTextInputSchema = zod_1.z.object({
    imageDataUri: zod_1.z
        .string()
        .describe("An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
const ImageToTextOutputSchema = zod_1.z.object({
    text: zod_1.z.string().describe('The text extracted from the image.'),
});
async function imageToText(input) {
    return imageToTextFlow(input);
}
const ocrPrompt = genkit_1.ai.definePrompt({
    name: 'ocrPrompt',
    input: { schema: ImageToTextInputSchema },
    output: { schema: ImageToTextOutputSchema },
    model: genkit_1.visionModel,
    prompt: `You are an Optical Character Recognition (OCR) tool. Your task is to extract all text from the given image, preserving the original formatting and line breaks as closely as possible.

Image to process: {{media url=imageDataUri}}

Return ONLY the extracted text. Do not add any commentary, explanations, or summaries.`,
});
const imageToTextFlow = genkit_1.ai.defineFlow({
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
}, async (input) => {
    try {
        const { output } = await ocrPrompt(input);
        // Safely access the text property and provide a fallback.
        return { text: output?.text ?? '' };
    }
    catch (error) {
        console.error("Error in imageToTextFlow:", error);
        // Ensure a valid output is always returned, even on error.
        return { text: '' };
    }
});
