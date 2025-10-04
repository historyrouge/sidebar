"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const rss_parser_1 = __importDefault(require("rss-parser"));
const parser = new rss_parser_1.default({
    customFields: {
        item: [['media:group', 'media:group', { keepArray: false }]],
    }
});
const fallbackRssFeed = "http://rss.cnn.com/rss/edition.rss";
async function fetchFromRss(feedUrl) {
    const feed = await parser.parseURL(feedUrl);
    return feed.items.map((item) => {
        const description = item.contentSnippet || item.content || "No description available.";
        // CNN specific image parsing from media:group
        let imageUrl = "";
        if (item['media:group'] && item['media:group']['media:content'] && item['media:group']['media:content'].length > 0) {
            const largestImage = item['media:group']['media:content'].find((i) => i.$.medium === 'image' && i.$.width > 1000);
            imageUrl = largestImage ? largestImage.$.url : item['media:group']['media:content'][0].$.url;
        }
        return {
            title: item.title || "No title",
            description: description,
            url: item.link || "",
            urlToImage: imageUrl,
            source: {
                name: feed.title || "RSS Feed"
            },
            publishedAt: item.isoDate || new Date().toISOString(),
        };
    }).slice(0, 40); // Limit to 40 articles
}
async function GET(request) {
    const apiKey = process.env.NEWS_API_KEY;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    if (!apiKey) {
        // If no API key, go straight to RSS fallback.
        const articles = await fetchFromRss(fallbackRssFeed);
        return server_1.NextResponse.json({ articles });
    }
    const pageSize = 40;
    let url;
    if (category && category !== 'top') {
        url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=${pageSize}&page=${page}&apiKey=${apiKey}`;
    }
    else if (q) {
        url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&page=${page}&apiKey=${apiKey}`;
    }
    else {
        url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=${pageSize}&page=${page}&apiKey=${apiKey}`;
    }
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            // If API fails (e.g. rate limit), use RSS fallback
            if (response.status === 429 || response.status === 426) {
                console.warn("NewsAPI limit reached or key invalid, falling back to RSS feed.");
                const articles = await fetchFromRss(fallbackRssFeed);
                return server_1.NextResponse.json({ articles });
            }
            console.error("NewsAPI Error:", errorData);
            const errorMessage = errorData?.message || 'Failed to fetch news from NewsAPI';
            return server_1.NextResponse.json({ error: errorMessage }, { status: response.status });
        }
        const data = await response.json();
        return server_1.NextResponse.json(data);
    }
    catch (err) {
        console.error("Internal Server Error:", err);
        try {
            console.log("Attempting RSS fallback due to server error.");
            const articles = await fetchFromRss(fallbackRssFeed);
            return server_1.NextResponse.json({ articles });
        }
        catch (rssErr) {
            console.error("RSS Fallback Error:", rssErr);
            return server_1.NextResponse.json({ error: 'Failed to fetch news from both primary and fallback sources.' }, { status: 500 });
        }
    }
}
