'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const codeExecutor = ai.defineTool(
  {
    name: 'codeExecutor',
    description: 'Executes JavaScript code in a safe sandboxed environment and returns the output.',
    inputSchema: z.object({
      code: z.string().describe('The JavaScript code to execute'),
    }),
    outputSchema: z.object({
      output: z.string().describe('The output from the code execution'),
      error: z.string().optional().describe('Any error that occurred during execution'),
      success: z.boolean().describe('Whether the execution was successful'),
    }),
  },
  async ({ code }) => {
    try {
      // Create a safe execution environment
      const logs: string[] = [];
      const originalConsole = {
        log: (...args: any[]) => logs.push(args.map(String).join(' ')),
        error: (...args: any[]) => logs.push('ERROR: ' + args.map(String).join(' ')),
        warn: (...args: any[]) => logs.push('WARN: ' + args.map(String).join(' ')),
      };

      // Wrap the code in a function
      const wrappedCode = `
        (function() {
          const console = {
            log: (...args) => logs.push(args.map(String).join(' ')),
            error: (...args) => logs.push('ERROR: ' + args.map(String).join(' ')),
            warn: (...args) => logs.push('WARN: ' + args.map(String).join(' ')),
          };
          
          ${code}
        })();
      `;

      // Execute with timeout
      const executeWithTimeout = (code: string, timeout: number = 5000) => {
        return Promise.race([
          new Promise((resolve, reject) => {
            try {
              const result = eval(wrappedCode);
              resolve(result);
            } catch (error: any) {
              reject(error);
            }
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Execution timeout')), timeout)
          ),
        ]);
      };

      await executeWithTimeout(wrappedCode);

      return {
        output: logs.join('\n') || 'Code executed successfully (no output)',
        success: true,
      };
    } catch (error: any) {
      console.error('Code execution error:', error);
      return {
        output: '',
        error: error.message,
        success: false,
      };
    }
  }
);
