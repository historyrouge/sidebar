
import OpenAI from 'openai';

if (!process.env.NVIDIA_API_KEY) {
    console.warn("NVIDIA_API_KEY environment variable is not set. NVIDIA features may not work.");
}
if (!process.env.NVIDIA_BASE_URL) {
    process.env.NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
}


export const openai = new OpenAI({
  baseURL: process.env.NVIDIA_BASE_URL,
  apiKey: process.env.NVIDIA_API_KEY,
});
