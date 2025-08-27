
import { z } from 'zod';

export const AnalyzeCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to analyze.'),
  language: z.enum(['python', 'cpp']).describe('The programming language of the code.'),
});
export type AnalyzeCodeInput = z.infer<typeof AnalyzeCodeInputSchema>;

export const AnalyzeCodeOutputSchema = z.object({
  explanation: z.string().describe('A high-level explanation of what the code does.'),
  potentialBugs: z.array(z.object({
    line: z.number().optional().describe('The line number where the bug might be.'),
    bug: z.string().describe('A description of the potential bug.'),
    fix: z.string().describe('A suggestion on how to fix the bug.'),
  })).describe('A list of potential bugs or errors in the code.'),
  optimizations: z.array(z.object({
    line: z.number().optional().describe('The line number that can be optimized.'),
    suggestion: z.string().describe('The optimization suggestion.'),
  })).describe('Suggestions for improving the code performance or readability.'),
});
export type AnalyzeCodeOutput = z.infer<typeof AnalyzeCodeOutputSchema>;
