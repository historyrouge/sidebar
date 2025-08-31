
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


const parser = new RssParser();

const fallbackRssFeed = "http://rss.cnn.com/rss/cnn_topstories.rss";

async function fetchFromRss(feedUrl: string): Promise<Article[]> {
    const feed = await parser.parseURL(feedUrl);
    return feed.items.map(item => ({
        title: item.title || "No title",
        description: item.contentSnippet || item.content || "No description",
        url: item.link || "",
        urlToImage: item.enclosure?.url || "",
        source: {
            name: feed.title || "RSS Feed"
        },
        publishedAt: item.isoDate || new Date().toISOString(),
    })).slice(0, 40); // Limit to 40 articles
}


export async function GET(request: NextRequest) {
  const apiKey = process.env.NEWS_API_KEY;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');
  const page = searchParams.get('page') || '1';


  if (!apiKey) {
    // If no API key, go straight to RSS fallback.
    const articles = await fetchFromRss(fallbackRssFeed);
    return NextResponse.json({ articles });
  }

  const pageSize = 40;
  let url: string;

  if (category && category !== 'top') {
     url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=${pageSize}&page=${page}&apiKey=${apiKey}`;
  } else if (q) {
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
             return NextResponse.json({ articles });
        }
        console.error("NewsAPI Error:", errorData);
        const errorMessage = errorData?.message || 'Failed to fetch news from NewsAPI';
        return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Internal Server Error:", err);
    try {
        console.log("Attempting RSS fallback due to server error.");
        const articles = await fetchFromRss(fallbackRssFeed);
        return NextResponse.json({ articles });
    } catch (rssErr: any) {
        console.error("RSS Fallback Error:", rssErr);
        return NextResponse.json({ error: 'Failed to fetch news from both primary and fallback sources.' }, { status: 500 });
    }
  }
}

