"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.duckDuckGoSearch = void 0;
const genkit_1 = require("@/ai/genkit");
const zod_1 = require("zod");
const node_duckduckgo_1 = require("node-duckduckgo");
exports.duckDuckGoSearch = genkit_1.ai.defineTool({
    name: 'duckDuckGoSearch',
    description: 'Searches the web using DuckDuckGo and returns the top results.',
    inputSchema: zod_1.z.object({
        query: zod_1.z.string().describe('The search query.'),
    }),
    outputSchema: zod_1.z.string().describe('A JSON string of the search results.'),
}, async ({ query }) => {
    try {
        const searchResults = await (0, node_duckduckgo_1.search)({ query, maxResults: 5, safeSearch: 'off' });
        return JSON.stringify(searchResults.results);
    }
    catch (error) {
        console.error('DuckDuckGo search error:', error);
        return JSON.stringify({ error: 'Failed to perform web search.' });
    }
});
