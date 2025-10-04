"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const scraper_1 = require("./scraper");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.post('/api/scrape', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        const scrapedData = await (0, scraper_1.scrapeWebsite)(url);
        res.json(scrapedData);
    }
    catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ error: 'Failed to scrape website' });
    }
});
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        const searchResults = await (0, scraper_1.searchWikipedia)(query);
        res.json(searchResults);
    }
    catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search Wikipedia' });
    }
});
app.get('/api/health', (_, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
