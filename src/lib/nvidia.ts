
import OpenAI from 'openai';

if (!process.env.NVIDIA_API_KEY) {
    console.warn("NVIDIA_API_KEY environment variable is not set. AI features for NVIDIA may not work.");
}

export const nvidia = new OpenAI({
  baseURL: 'https://ai.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY,
});
