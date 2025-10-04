import axios from 'axios';
import { ScrapedContent } from '../types';

export class GeneralWebScraper {
  private readonly userAgent = 'WebScraperChat/1.0 (Educational Purpose)';
  private readonly timeout = 10000;

  async scrapeUrl(url: string): Promise<ScrapedContent | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: this.timeout,
        maxRedirects: 5
      });

      return this.extractContentFromHtml(response.data, url);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return null;
    }
  }

  private extractContentFromHtml(html: string, url: string): ScrapedContent {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract title
    const title = doc.querySelector('title')?.textContent?.trim() || 
                 doc.querySelector('h1')?.textContent?.trim() || 
                 'Untitled Page';

    // Extract domain
    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    // Extract main content
    const contentSelectors = [
      'main',
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '#content',
      '.main-content'
    ];

    let contentElement = null;
    for (const selector of contentSelectors) {
      contentElement = doc.querySelector(selector);
      if (contentElement) break;
    }

    if (!contentElement) {
      contentElement = doc.body;
    }

    // Remove unwanted elements
    const unwantedSelectors = [
      'nav',
      'header',
      'footer',
      'aside',
      '.sidebar',
      '.navigation',
      '.menu',
      '.advertisement',
      '.ads',
      '.social-share',
      '.comments',
      'script',
      'style',
      'noscript'
    ];

    unwantedSelectors.forEach(selector => {
      const elements = contentElement.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Extract text content
    const paragraphs = contentElement.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    const content = Array.from(paragraphs)
      .map(p => p.textContent?.trim())
      .filter(text => text && text.length > 20)
      .slice(0, 15) // Limit content
      .join('\n\n');

    const snippet = content.substring(0, 200) + (content.length > 200 ? '...' : '');

    return {
      title,
      content: content || 'Content could not be extracted from this page.',
      url,
      domain,
      snippet
    };
  }

  async scrapeMultipleUrls(urls: string[]): Promise<ScrapedContent[]> {
    const results: ScrapedContent[] = [];
    
    // Process URLs in parallel with a limit
    const batchSize = 3;
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      const batchPromises = batch.map(url => this.scrapeUrl(url));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      });
    }

    return results;
  }

  // Common educational and news websites
  getEducationalUrls(query: string): string[] {
    const searchQuery = encodeURIComponent(query);
    return [
      `https://www.britannica.com/search?query=${searchQuery}`,
      `https://www.khanacademy.org/search?page_search_query=${searchQuery}`,
      `https://www.coursera.org/search?query=${searchQuery}`,
      `https://www.edx.org/search?q=${searchQuery}`
    ];
  }

  getNewsUrls(query: string): string[] {
    const searchQuery = encodeURIComponent(query);
    return [
      `https://www.bbc.com/search?q=${searchQuery}`,
      `https://www.reuters.com/search/news?blob=${searchQuery}`,
      `https://www.cnn.com/search?q=${searchQuery}`,
      `https://www.npr.org/search?query=${searchQuery}`
    ];
  }
}