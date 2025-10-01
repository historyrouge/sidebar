'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const calculator = ai.defineTool(
  {
    name: 'calculator',
    description: 'Performs mathematical calculations and evaluates expressions. Can handle basic arithmetic, algebra, and complex calculations.',
    inputSchema: z.object({
      expression: z.string().describe('The mathematical expression to evaluate (e.g., "2 + 2", "sin(45)", "sqrt(16)")'),
    }),
    outputSchema: z.object({
      result: z.string().describe('The result of the calculation'),
      success: z.boolean().describe('Whether the calculation was successful'),
    }),
  },
  async ({ expression }) => {
    try {
      // Safe evaluation using Function constructor with limited scope
      const safeEval = (expr: string) => {
        // Remove any potentially dangerous characters
        const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
        
        // Create a safe math context
        const mathContext = {
          sin: Math.sin,
          cos: Math.cos,
          tan: Math.tan,
          sqrt: Math.sqrt,
          pow: Math.pow,
          log: Math.log,
          abs: Math.abs,
          ceil: Math.ceil,
          floor: Math.floor,
          round: Math.round,
          PI: Math.PI,
          E: Math.E,
        };
        
        try {
          // Convert degrees to radians for trig functions
          const processed = sanitized
            .replace(/sin\(([^)]+)\)/g, (_, num) => `sin(${num} * PI / 180)`)
            .replace(/cos\(([^)]+)\)/g, (_, num) => `cos(${num} * PI / 180)`)
            .replace(/tan\(([^)]+)\)/g, (_, num) => `tan(${num} * PI / 180)`);
          
          const func = new Function(...Object.keys(mathContext), `return ${processed}`);
          const result = func(...Object.values(mathContext));
          
          return String(result);
        } catch (e) {
          throw new Error('Invalid mathematical expression');
        }
      };
      
      const result = safeEval(expression);
      
      return {
        result,
        success: true
      };
    } catch (error: any) {
      console.error('Calculator error:', error);
      return {
        result: 'Error: ' + error.message,
        success: false
      };
    }
  }
);
