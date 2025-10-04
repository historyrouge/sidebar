"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeWebsite = scrapeWebsite;
exports.searchWikipedia = searchWikipedia;
exports.searchMultipleWebsites = searchMultipleWebsites;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
async function scrapeWebsite(url) {
    try {
        const response = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        const $ = cheerio.load(response.data);
        // Remove script and style elements
        $('script, style, nav, header, footer, aside').remove();
        // Extract title
        const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled';
        // Extract main content
        let content = '';
        const contentSelectors = [
            'main',
            'article',
            '.content',
            '.post-content',
            '.entry-content',
            '#content',
            '.main-content'
        ];
        for (const selector of contentSelectors) {
            const element = $(selector);
            if (element.length > 0) {
                content = element.text().trim();
                break;
            }
        }
        // Fallback to body if no specific content area found
        if (!content) {
            content = $('body').text().trim();
        }
        // Clean up content
        content = content.replace(/\s+/g, ' ').trim();
        // Extract images
        const images = [];
        $('img').each((_, img) => {
            const src = $(img).attr('src');
            if (src && !src.startsWith('data:')) {
                const fullUrl = src.startsWith('http') ? src : new URL(src, url).href;
                images.push(fullUrl);
            }
        });
        // Create summary (first 200 characters)
        const summary = content.substring(0, 200) + (content.length > 200 ? '...' : '');
        return {
            title,
            content,
            url,
            summary,
            images: images.slice(0, 5) // Limit to 5 images
        };
    }
    catch (error) {
        throw new Error(`Failed to scrape ${url}: ${error}`);
    }
}
async function searchWikipedia(query) {
    try {
        // Search Wikipedia API
        const searchResponse = await axios_1.default.get('https://en.wikipedia.org/w/api.php', {
            params: {
                action: 'query',
                format: 'json',
                list: 'search',
                srsearch: query,
                srlimit: 5
            }
        });
        const searchResults = searchResponse.data.query.search;
        const results = [];
        for (const result of searchResults) {
            try {
                // Get page content
                const pageResponse = await axios_1.default.get('https://en.wikipedia.org/w/api.php', {
                    params: {
                        action: 'query',
                        format: 'json',
                        prop: 'extracts',
                        exintro: true,
                        explaintext: true,
                        pageids: result.pageid
                    }
                });
                const page = pageResponse.data.query.pages[result.pageid];
                const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/\s+/g, '_'))}`;
                results.push({
                    title: result.title,
                    content: page.extract || '',
                    url,
                    summary: result.snippet,
                    source: 'Wikipedia'
                });
            }
            catch (error) {
                console.error(`Error fetching page ${result.title}:`, error);
            }
        }
        return results;
    }
    catch (error) {
        throw new Error(`Failed to search Wikipedia: ${error}`);
    }
}
async function searchMultipleWebsites(query) {
    const results = [];
    try {
        // Search Wikipedia
        const wikipediaResults = await searchWikipedia(query);
        results.push(...wikipediaResults);
        // You can add more websites here
        // For example: news sites, educational sites, etc.
    }
    catch (error) {
        console.error('Error searching multiple websites:', error);
    }
    return results;
}
