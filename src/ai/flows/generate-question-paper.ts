
'use server';

/**
 * @fileOverview Generates a question paper based on the CBSE pattern.
 *
 * - generateQuestionPaper - A function that generates the paper.
 * - GenerateQuestionPaperInput - The input type for the function.
 * - GenerateQuestionPaperOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const QuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  marks: z.number().describe('The marks allocated to the question.'),
});

const CaseBasedQuestionSchema = z.object({
    case: z.string().describe("A paragraph or data describing the case/scenario."),
    questions: z.array(z.object({
        question: z.string().describe("A sub-question related to the case."),
        marks: z.number().describe("Marks for the sub-question.")
    })).describe("A list of sub-questions based on the case.")
});

export const GenerateQuestionPaperInputSchema = z.object({
  className: z.string().describe('The class for which to generate the paper (e.g., "10th", "12th").'),
  subject: z.string().describe('The subject of the paper (e.g., "Physics", "Mathematics").'),
  topic: z.string().describe('The specific topic or chapter the paper should focus on.'),
});
export type GenerateQuestionPaperInput = z.infer<typeof GenerateQuestionPaperInputSchema>;

export const GenerateQuestionPaperOutputSchema = z.object({
  title: z.string().describe("The title of the question paper."),
  generalInstructions: z.array(z.string()).describe("A list of general instructions for the students."),
  sectionA: z.array(QuestionSchema).describe('Section A: Multiple choice or very short answer questions (1 mark each).'),
  sectionB: z.array(QuestionSchema).describe('Section B: Short answer questions (2 marks each).'),
  sectionC: z.array(QuestionSchema).describe('Section C: Short answer questions (3 marks each).'),
  sectionD: z.array(QuestionSchema).describe('Section D: Long answer questions (5 marks each).'),
  sectionE: z.array(CaseBasedQuestionSchema).describe('Section E: Case-based/Source-based questions (4 marks each).'),
});
export type GenerateQuestionPaperOutput = z.infer<typeof GenerateQuestionPaperOutputSchema>;

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
