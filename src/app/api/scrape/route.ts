import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedData {
  title: string;
  content: string;
  url: string;
  summary: string;
  images?: string[];
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

// Function to search for relevant websites using DuckDuckGo
async function searchWebsites(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const response = await axios.get(searchUrl);
    
    const results: SearchResult[] = [];
    
    // Add instant answer if available
    if (response.data.AbstractText) {
      results.push({
        title: response.data.Heading || query,
        url: response.data.AbstractURL || '',
        snippet: response.data.AbstractText
      });
    }
    
    // Add related topics
    if (response.data.RelatedTopics) {
      response.data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.split(' - ')[0],
            url: topic.FirstURL,
            snippet: topic.Text
          });
        }
      });
    }
    
    return results;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Function to scrape content from a URL
async function scrapeWebsite(url: string): Promise<ScrapedData | null> {
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
    const title = $('title').text().trim() || 
                  $('h1').first().text().trim() || 
                  'Untitled';
    
    // Extract main content
    let content = '';
    
    // Try to find main content area
    const mainSelectors = [
      'main',
      'article',
      '.content',
      '.main-content',
      '.post-content',
      '.entry-content',
      '#content',
      '.container',
      'body'
    ];
    
    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length && element.text().trim().length > 100) {
        content = element.text().trim();
        break;
      }
    }
    
    // If no main content found, get all text
    if (!content) {
      content = $('body').text().trim();
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    // Extract images
    const images: string[] = [];
    $('img').each((_, img) => {
      const src = $(img).attr('src');
      if (src && !src.startsWith('data:')) {
        const fullUrl = src.startsWith('http') ? src : new URL(src, url).href;
        images.push(fullUrl);
      }
    });
    
    // Create summary (first 300 characters)
    const summary = content.substring(0, 300) + (content.length > 300 ? '...' : '');
    
    return {
      title,
      content,
      url,
      summary,
      images: images.slice(0, 5) // Limit to 5 images
    };
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Function to extract relevant information based on query
function extractRelevantInfo(content: string, query: string): string {
  const queryWords = query.toLowerCase().split(' ');
  const sentences = content.split(/[.!?]+/);
  
  // Score sentences based on query word matches
  const scoredSentences = sentences.map(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const score = queryWords.reduce((acc, word) => {
      return acc + (lowerSentence.includes(word) ? 1 : 0);
    }, 0);
    return { sentence: sentence.trim(), score };
  });
  
  // Sort by score and take top sentences
  const relevantSentences = scoredSentences
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.sentence);
  
  return relevantSentences.join('. ') + '.';
}

export async function POST(request: NextRequest) {
  try {
    const { query, urls } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    let websitesToScrape: string[] = [];
    
    // If URLs provided, use them; otherwise search for relevant websites
    if (urls && urls.length > 0) {
      websitesToScrape = urls;
    } else {
      // Search for relevant websites
      const searchResults = await searchWebsites(query);
      websitesToScrape = searchResults.map(result => result.url).filter(url => url);
      
      // Add some default reliable sources
      const defaultSources = [
        'https://en.wikipedia.org/wiki/' + encodeURIComponent(query),
        'https://www.britannica.com/search?query=' + encodeURIComponent(query)
      ];
      
      websitesToScrape = [...websitesToScrape, ...defaultSources].slice(0, 5);
    }
    
    // Scrape all websites
    const scrapedData: ScrapedData[] = [];
    
    for (const url of websitesToScrape) {
      try {
        const data = await scrapeWebsite(url);
        if (data && data.content.length > 100) {
          // Extract relevant information based on query
          const relevantInfo = extractRelevantInfo(data.content, query);
          if (relevantInfo.length > 50) {
            scrapedData.push({
              ...data,
              content: relevantInfo
            });
          }
        }
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
      }
    }
    
    // Generate a comprehensive answer
    const answer = generateAnswer(scrapedData, query);
    
    return NextResponse.json({
      answer,
      sources: scrapedData,
      query
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape websites' }, { status: 500 });
  }
}

function generateAnswer(scrapedData: ScrapedData[], query: string): string {
  if (scrapedData.length === 0) {
    return `I couldn't find specific information about "${query}". Please try rephrasing your question or providing specific URLs to scrape.`;
  }
  
  // Combine relevant information from all sources
  const combinedInfo = scrapedData
    .map(source => source.content)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Create a comprehensive answer
  let answer = `Based on information from ${scrapedData.length} source${scrapedData.length > 1 ? 's' : ''}:\n\n`;
  
  // Extract key information
  const sentences = combinedInfo.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const relevantSentences = sentences.slice(0, 8); // Take first 8 relevant sentences
  
  answer += relevantSentences.join('. ') + '.';
  
  return answer;
}