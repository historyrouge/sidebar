
import OpenAI from 'openai';

if (!process.env.NVIDIA_API_KEY) {
    console.warn("NVIDIA_API_KEY environment variable is not set. NVIDIA features may not work.");
}
if (!process.env.NVIDIA_BASE_URL) {
    console.warn("NVIDIA_BASE_URL environment variable is not set, defaulting to localhost:8000/v1. NVIDIA features may not work if the server is not running there.");
}


export const openai = new OpenAI({
  baseURL: process.env.NVIDIA_BASE_URL || 'http://localhost:8000/v1',
  apiKey: process.env.NVIDIA_API_KEY || " ", // Can be a placeholder if the local server doesn't require a key
});
