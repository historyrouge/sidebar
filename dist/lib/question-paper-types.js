"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateQuestionPaperOutputSchema = exports.GenerateQuestionPaperInputSchema = void 0;
const zod_1 = require("zod");
const MCQSchema = zod_1.z.object({
    question: zod_1.z.string().describe("The multiple-choice question text."),
    options: zod_1.z.object({
        a: zod_1.z.string(),
        b: zod_1.z.string(),
        c: zod_1.z.string(),
        d: zod_1.z.string(),
    }).describe("An object containing four options: a, b, c, d."),
    answer: zod_1.z.string().describe("The correct option key (e.g., 'a', 'b', 'c', 'd')."),
    marks: zod_1.z.number().describe("The marks allocated to the question, typically 1."),
});
const QuestionSchema = zod_1.z.object({
    question: zod_1.z.string().describe('The question text.'),
    marks: zod_1.z.number().describe('The marks allocated to the question.'),
});
const CaseBasedQuestionSchema = zod_1.z.object({
    case: zod_1.z.string().describe("A paragraph or data describing the case/scenario."),
    questions: zod_1.z.array(zod_1.z.object({
        question: zod_1.z.string().describe("A sub-question related to the case."),
        marks: zod_1.z.number().describe("Marks for the sub-question.")
    })).describe("A list of sub-questions based on the case.")
});
exports.GenerateQuestionPaperInputSchema = zod_1.z.object({
    className: zod_1.z.string().describe('The class for which to generate the paper (e.g., "10th", "12th").'),
    subject: zod_1.z.string().describe('The subject of the paper (e.g., "Physics", "Mathematics").'),
    topic: zod_1.z.string().describe('The specific topic or chapter the paper should focus on.'),
});
exports.GenerateQuestionPaperOutputSchema = zod_1.z.object({
    title: zod_1.z.string().describe("The title of the question paper."),
    generalInstructions: zod_1.z.array(zod_1.z.string()).describe("A list of general instructions for the students."),
    sectionA: zod_1.z.array(MCQSchema).describe('Section A: Multiple choice questions (1 mark each).'),
    sectionB: zod_1.z.array(QuestionSchema).describe('Section B: Very short answer questions (2 marks each).'),
    sectionC: zod_1.z.array(QuestionSchema).describe('Section C: Short answer questions (3 marks each).'),
    sectionD: zod_1.z.array(QuestionSchema).describe('Section D: Long answer questions (5 marks each).'),
    sectionE: zod_1.z.array(CaseBasedQuestionSchema).describe('Section E: Case-based/Source-based questions (4 marks each).'),
});
