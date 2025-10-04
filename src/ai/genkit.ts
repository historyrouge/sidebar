
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
});

export { googleAI };

// Vision model for image analysis
export const visionModel = ai.model('gemini-1.5-flash');
