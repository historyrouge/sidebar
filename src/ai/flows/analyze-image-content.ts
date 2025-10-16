
'use server';

/**
 * @fileOverview This file is no longer used and will be removed.
 * Image analysis is now handled client-side with Tesseract.js.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeImageContentInputSchema = z.object({
  imageDataUri: z.string(),
  prompt: z.string().optional(),
});
export type AnalyzeImageContentInput = z.infer<typeof AnalyzeImageContentInputSchema>;

const AnalyzeImageContentOutputSchema = z.object({
  summary: z.string(),
  keyConcepts: z.array(z.object({
    concept: z.string(),
    explanation: z.string(),
  })),
  entities: z.object({
      people: z.array(z.string()),
      places: z.array(z.string()),
      dates: z.array(z.string()),
  }),
  diagrams: z.array(z.object({
      title: z.string(),
      explanation: z.string(),
  })),
  codeExamples: z.array(z.object({
    code: z.string(),
    explanation: z.string(),
  })),
  potentialQuestions: z.array(z.string()),
  relatedTopics: z.array(z.string()),
});
export type AnalyzeImageContentOutput = z.infer<typeof AnalyzeImageContentOutputSchema>;

// This function is deprecated and will not be called.
export async function analyzeImageContent(input: AnalyzeImageContentInput): Promise<AnalyzeImageContentOutput> {
  throw new Error("analyzeImageContent is deprecated. Use client-side OCR instead.");
}

    
