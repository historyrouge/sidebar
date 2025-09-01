
import { z } from 'zod';

const MCQSchema = z.object({
    question: z.string().describe("The multiple-choice question text."),
    options: z.object({
        a: z.string(),
        b: z.string(),
        c: z.string(),
        d: z.string(),
    }).describe("An object containing four options: a, b, c, d."),
    answer: z.string().describe("The correct option key (e.g., 'a', 'b', 'c', 'd')."),
    marks: z.number().describe("The marks allocated to the question, typically 1."),
});


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
  sectionA: z.array(MCQSchema).describe('Section A: Multiple choice questions (1 mark each).'),
  sectionB: z.array(QuestionSchema).describe('Section B: Very short answer questions (2 marks each).'),
  sectionC: z.array(QuestionSchema).describe('Section C: Short answer questions (3 marks each).'),
  sectionD: z.array(QuestionSchema).describe('Section D: Long answer questions (5 marks each).'),
  sectionE: z.array(CaseBasedQuestionSchema).describe('Section E: Case-based/Source-based questions (4 marks each).'),
});
export type GenerateQuestionPaperOutput = z.infer<typeof GenerateQuestionPaperOutputSchema>;
