
import OpenAI from 'openai';

if (!process.env.NVIDIA_API_KEY) {
    console.warn("NVIDIA_API_KEY environment variable is not set. NVIDIA features may not work.");
}

const baseURL = "https://ai.api.nvidia.com/v1";

export const openai = new OpenAI({
  baseURL: baseURL,
  apiKey: process.env.NVIDIA_API_KEY,
});

