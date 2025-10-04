"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeCodeOutputSchema = exports.AnalyzeCodeInputSchema = void 0;
const zod_1 = require("zod");
exports.AnalyzeCodeInputSchema = zod_1.z.object({
    code: zod_1.z.string().describe('The code snippet to analyze.'),
    language: zod_1.z.enum(['python', 'cpp']).describe('The programming language of the code.'),
});
exports.AnalyzeCodeOutputSchema = zod_1.z.object({
    explanation: zod_1.z.string().describe('A high-level explanation of what the code does.'),
    potentialBugs: zod_1.z.array(zod_1.z.object({
        line: zod_1.z.number().optional().describe('The line number where the bug might be.'),
        bug: zod_1.z.string().describe('A description of the potential bug.'),
        fix: zod_1.z.string().describe('A suggestion on how to fix the bug.'),
    })).describe('A list of potential bugs or errors in the code.'),
    optimizations: zod_1.z.array(zod_1.z.object({
        line: zod_1.z.number().optional().describe('The line number that can be optimized.'),
        suggestion: zod_1.z.string().describe('The optimization suggestion.'),
    })).describe('Suggestions for improving the code performance or readability.'),
});
