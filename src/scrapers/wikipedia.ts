import axios from 'axios';
import { WikipediaResponse, WikipediaSearchResult, ScrapedContent } from '../types';

export class WikipediaScraper {
  private readonly baseUrl = 'https://en.wikipedia.org/w/api.php';
  private readonly searchUrl = 'https://en.wikipedia.org/wiki';

  async searchArticles(query: string, limit: number = 5): Promise<WikipediaSearchResult[]> {
    try {
      const params = {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
        srlimit: limit,
        srprop: 'snippet',
        origin: '*'
      };

      const response = await axios.get<WikipediaResponse>(this.baseUrl, { params });
      return response.data.query.search;
    } catch (error) {
      console.error('Wikipedia search error:', error);
      return [];
    }
  }

  async getArticleContent(title: string): Promise<ScrapedContent | null> {
    try {
      const encodedTitle = encodeURIComponent(title);
      const url = `${this.searchUrl}/${encodedTitle}`;
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'WebScraperChat/1.0 (Educational Purpose)'
        }
      });

      const content = this.extractContentFromHtml(response.data, title);
      return {
        title,
        content,
        url,
        domain: 'wikipedia.org',
        snippet: content.substring(0, 200) + '...'
      };
    } catch (error) {
      console.error('Wikipedia content error:', error);
      return null;
    }
  }

  private extractContentFromHtml(html: string, title: string): string {
    // Simple HTML parsing to extract main content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find the main content div
    const contentDiv = doc.querySelector('#mw-content-text .mw-parser-output');
    if (!contentDiv) return '';

    // Remove unwanted elements
    const unwantedSelectors = [
      '.navbox',
      '.infobox',
      '.sidebar',
      '.thumb',
      '.reference',
      '.mw-editsection',
      '.catlinks',
      '.mw-jump-link'
    ];

    unwantedSelectors.forEach(selector => {
      const elements = contentDiv.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Extract text content
    const paragraphs = contentDiv.querySelectorAll('p');
    const content = Array.from(paragraphs)
      .map(p => p.textContent?.trim())
      .filter(text => text && text.length > 50)
      .slice(0, 10) // Limit to first 10 paragraphs
      .join('\n\n');

    return content || `Information about ${title} from Wikipedia.`;
  }

  async searchAndScrape(query: string): Promise<ScrapedContent[]> {
    const searchResults = await this.searchArticles(query, 3);
    const scrapedContent: ScrapedContent[] = [];

    for (const result of searchResults) {
      const content = await this.getArticleContent(result.title);
      if (content) {
        scrapedContent.push(content);
      }
    }

    return scrapedContent;
  }
}