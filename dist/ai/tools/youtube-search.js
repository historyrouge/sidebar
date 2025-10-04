"use strict";
'use server';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchYoutube = void 0;
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const youtube_sr_1 = __importDefault(require("youtube-sr"));
exports.searchYoutube = genkit_1.ai.defineTool({
    name: 'searchYoutube',
    description: 'Searches YouTube for a video and returns video details.',
    inputSchema: zod_1.z.object({
        query: zod_1.z.string().describe('The search query for the video.'),
    }),
    outputSchema: zod_1.z.object({
        id: zod_1.z.string().optional().describe('The ID of the first video found.'),
        title: zod_1.z.string().optional().describe('The title of the video.'),
        thumbnail: zod_1.z.string().optional().describe('The URL of the video thumbnail.'),
    }),
}, async ({ query }) => {
    try {
        const video = await youtube_sr_1.default.searchOne(query, 'video', false);
        if (video) {
            return {
                id: video.id,
                title: video.title,
                thumbnail: video.thumbnail?.url
            };
        }
        return {};
    }
    catch (error) {
        console.error('YouTube search error:', error);
        // In case of an API error, return an empty object to prevent the flow from crashing.
        return {};
    }
});
