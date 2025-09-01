
'use server';

/**
 * @fileOverview Generates a question paper based on the CBSE pattern.
 *
 * - generateQuestionPaper - A function that generates the paper.
 */

import {ai} from '@/ai/genkit';
import { GenerateQuestionPaperInput, GenerateQuestionPaperInputSchema, GenerateQuestionPaperOutput, GenerateQuestionPaperOutputSchema } from '@/lib/question-paper-types';


export async function generateQuestionPaper(input: GenerateQuestionPaperInput): Promise<GenerateQuestionPaperOutput> {
  return generateQuestionPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionPaperPrompt',
  input: {schema: GenerateQuestionPaperInputSchema},
  output: {schema: GenerateQuestionPaperOutputSchema},
  prompt: `You are an expert educator specializing in creating academic question papers based on the Indian CBSE (Central Board of Secondary Education) pattern. Your task is to generate a well-structured question paper.

Class: {{{className}}}
Subject: {{{subject}}}
Topic: {{{topic}}}

Please generate a question paper with the following specifications:
1.  **Title**: Create a suitable title for the question paper.
2.  **General Instructions**: Provide a list of standard instructions for students.
3.  **Structure**: The paper must be divided into five sections: A, B, C, D, and E.
4.  **Section A**: Generate 3-5 multiple-choice or one-word answer questions. Each question should be worth 1 mark.
5.  **Section B**: Generate 2-3 very short answer questions. Each question should be worth 2 marks.
6.  **Section C**: Generate 2 short answer questions. Each question should be worth 3 marks.
7.  **Section D**: Generate 1 long answer question. This question should be worth 5 marks.
8.  **Section E**: Generate 1 case-based or source-based integrated question. This section should have a descriptive case/paragraph followed by 2-3 sub-questions based on it. The total marks for this section should be 4.

Ensure the questions are relevant to the specified class, subject, and topic. The difficulty should be balanced.
`,
});

const generateQuestionPaperFlow = ai.defineFlow(
  {
    name: 'generateQuestionPaperFlow',
    inputSchema: GenerateQuestionPaperInputSchema,
    outputSchema: GenerateQuestionPaperOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
