import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  summary: string;
  images?: string[];
}

export interface SearchResult {
  title: string;
  content: string;
  url: string;
  summary: string;
  source: string;
}

export async function scrapeWebsite(url: string): Promise<ScrapedContent> {
  try {
    const response = await axios.get(url, {
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
    const images: string[] = [];
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
  } catch (error) {
    throw new Error(`Failed to scrape ${url}: ${error}`);
  }
}

export async function searchWikipedia(query: string): Promise<SearchResult[]> {
  try {
    // Search Wikipedia API
    const searchResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
        srlimit: 5
      }
    });

    const searchResults = searchResponse.data.query.search;
    const results: SearchResult[] = [];

    for (const result of searchResults) {
      try {
        // Get page content
        const pageResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
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
      } catch (error) {
        console.error(`Error fetching page ${result.title}:`, error);
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to search Wikipedia: ${error}`);
  }
}

export async function searchMultipleWebsites(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  try {
    // Search Wikipedia
    const wikipediaResults = await searchWikipedia(query);
    results.push(...wikipediaResults);
    
    // You can add more websites here
    // For example: news sites, educational sites, etc.
    
  } catch (error) {
    console.error('Error searching multiple websites:', error);
  }
  
  return results;
}