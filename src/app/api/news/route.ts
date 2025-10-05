
import { NextResponse, NextRequest } from 'next/server';
import RssParser from "rss-parser";

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: {
    name: string;
  };
  publishedAt: string;
};


const parser = new RssParser({
    customFields: {
        item: [['media:thumbnail', 'media:thumbnail', { keepArray: false }], ['media:group', 'media:group', {keepArray: false}]],
    }
});

const rssFeeds = [
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "http://rss.cnn.com/rss/edition.rss"
];

async function fetchFromRss(feedUrl: string): Promise<Article[]> {
    const feed = await parser.parseURL(feedUrl);
    return feed.items.map((item: any) => {
        const description = item.contentSnippet || item.content || "No description available.";
        
        let imageUrl = "";
        // For CNN RSS feed
        if (item['media:group'] && item['media:group']['media:content'] && item['media:group']['media:content'].length > 0) {
            const largestImage = item['media:group']['media:content'].find((i:any) => i.$.medium === 'image' && i.$.width > 1000);
            imageUrl = largestImage ? largestImage.$.url : item['media:group']['media:content'][0].$.url;
        } 
        // For BBC RSS feed
        else if (item['media:thumbnail']) {
            imageUrl = item['media:thumbnail'].$.url;
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
        }
    }).slice(0, 40); // Limit to 40 articles
}


export async function GET(request: NextRequest) {
  const apiKey = process.env.NEWS_API_KEY;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const page = searchParams.get('page') || '1';

  const fetchFromAllRss = async () => {
    for (const feedUrl of rssFeeds) {
        try {
            const articles = await fetchFromRss(feedUrl);
            if (articles.length > 0) return articles;
        } catch (e) {
            console.warn(`Failed to fetch from RSS feed: ${feedUrl}`, e);
        }
    }
    return [];
  }

  if (!apiKey) {
    // If no API key, go straight to RSS fallback.
    const articles = await fetchFromAllRss();
    return NextResponse.json({ articles });
  }

  const pageSize = 40;
  let url: string;

  if (q) {
      url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&page=${page}&apiKey=${apiKey}`;
  } else if (category && category !== 'general') {
     url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=${pageSize}&page=${page}&apiKey=${apiKey}`;
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
             const articles = await fetchFromAllRss();
             return NextResponse.json({ articles });
        }
        console.error("NewsAPI Error:", errorData);
        const errorMessage = errorData?.message || 'Failed to fetch news from NewsAPI';
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Internal Server Error:", err);
    try {
        console.log("Attempting RSS fallback due to server error.");
        const articles = await fetchFromAllRss();
        if (articles.length === 0) {
            throw new Error('All RSS fallbacks failed.');
        }
        return NextResponse.json({ articles });
    } catch (rssErr: any) {
        console.error("RSS Fallback Error:", rssErr);
        return NextResponse.json({ error: 'Failed to fetch news from both primary and fallback sources.' }, { status: 500 });
    }
  }
}
