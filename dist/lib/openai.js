"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
if (!process.env.SAMBANOVA_API_KEY) {
    console.warn("SAMBANOVA_API_KEY environment variable is not set. AI features for Qwen may not work.");
}
if (!process.env.SAMBANOVA_BASE_URL) {
    console.warn("SAMBANOVA_BASE_URL environment variable is not set. AI features for Qwen may not work.");
}
exports.openai = new openai_1.default({
    baseURL: process.env.SAMBANOVA_BASE_URL,
    apiKey: process.env.SAMBANOVA_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.YOUR_SITE_URL || "", // Optional, for tracking
        "X-Title": process.env.YOUR_SITE_NAME || "SearnAI", // Optional, for tracking
    },
});
