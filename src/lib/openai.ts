
import OpenAI from 'openai';

if (!process.env.SAMBANOVA_API_KEY) {
    console.warn("SAMBANOVA_API_KEY environment variable is not set. AI features for Qwen may not work.");
}
if (!process.env.SAMBANOVA_BASE_URL) {
    console.warn("SAMBANOVA_BASE_URL environment variable is not set. AI features for Qwen may not work.");
}


export const openai = new OpenAI({
  baseURL: process.env.SAMBANOVA_BASE_URL,
  apiKey: process.env.SAMBANOVA_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.YOUR_SITE_URL || "", // Optional, for tracking
    "X-Title": process.env.YOUR_SITE_NAME || "Easy Learn AI", // Optional, for tracking
  },
});

    