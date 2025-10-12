
import OpenAI from 'openai';

if (!process.env.SAMBANOVA_API_KEY) {
    console.warn("SAMBANOVA_API_KEY environment variable is not set. AI features for SambaNova may not work.");
}
if (!process.env.SAMBANOVA_BASE_URL) {
    console.warn("SAMBANOVA_BASE_URL environment variable is not set. AI features for SambaNova may not work.");
}


export const openai = new OpenAI({
  baseURL: process.env.SAMBANOVA_BASE_URL,
  apiKey: process.env.SAMBANOVA_API_KEY,
});
