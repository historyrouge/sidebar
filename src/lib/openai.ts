
import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
    console.warn("OPENROUTER_API_KEY environment variable is not set. AI features may not work.");
}
if (!process.env.OPENROUTER_BASE_URL) {
    console.warn("OPENROUTER_BASE_URL environment variable is not set. AI features may not work.");
}


export const openai = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL || "", // Optional, for OpenRouter tracking
    "X-Title": process.env.YOUR_SITE_NAME || "LearnSphere", // Optional, for OpenRouter tracking
  },
});
