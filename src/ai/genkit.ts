
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({apiVersion: 'v1beta'})],
  model: 'googleai/gemini-1.5-flash-latest',
});

export const visionModel = googleAI('gemini-pro-vision');
export const generationModel = googleAI('imagen-2');

export { googleAI };
