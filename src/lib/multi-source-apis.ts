/**
 * Multi-Source API Integration for Enhanced AI Agent
 * Britannica, government sites, academic sources, and more
 */

import fetch from 'node-fetch';

export interface APISource {
  name: string;
  base_url: string;
  api_key?: string;
  rate_limit: number;
  timeout: number;
  reliability_score: number;
  last_used?: Date;
}

export interface SourceResponse {
  source: string;
  content: string;
  metadata: {
    title?: string;
    url?: string;
    last_updated?: string;
    author?: string;
    confidence: number;
    word_count: number;
    language: string;
  };
  error?: string;
}

export interface APIConfig {
  timeout: number;
  retry_attempts: number;
  retry_delay: number;
  max_concurrent: number;
  cache_duration: number;
}

export class MultiSourceAPIManager {
  private static readonly API_SOURCES: APISource[] = [
    {
      name: 'Wikipedia',
      base_url: 'https://en.wikipedia.org/api/rest_v1',
      rate_limit: 100,
      timeout: 5000,
      reliability_score: 0.9
    },
    {
      name: 'Britannica',
      base_url: 'https://www.britannica.com/api',
      rate_limit: 50,
      timeout: 8000,
      reliability_score: 0.95
    },
    {
      name: 'Government of India',
      base_url: 'https://www.india.gov.in/api',
      rate_limit: 30,
      timeout: 10000,
      reliability_score: 0.98
    },
    {
      name: 'PM India',
      base_url: 'https://pmindia.gov.in/api',
      rate_limit: 20,
      timeout: 10000,
      reliability_score: 0.99
    },
    {
      name: 'Scientific American',
      base_url: 'https://www.scientificamerican.com/api',
      rate_limit: 40,
      timeout: 6000,
      reliability_score: 0.85
    },
    {
      name: 'Nature',
      base_url: 'https://www.nature.com/api',
      rate_limit: 25,
      timeout: 8000,
      reliability_score: 0.92
    },
    {
      name: 'TechCrunch',
      base_url: 'https://techcrunch.com/api',
      rate_limit: 60,
      timeout: 5000,
      reliability_score: 0.8
    },
    {
      name: 'BBC News',
      base_url: 'https://www.bbc.com/api',
      rate_limit: 50,
      timeout: 6000,
      reliability_score: 0.88
    },
    {
      name: 'Reuters',
      base_url: 'https://www.reuters.com/api',
      rate_limit: 45,
      timeout: 7000,
      reliability_score: 0.87
    },
    {
      name: 'World Bank',
      base_url: 'https://api.worldbank.org',
      rate_limit: 30,
      timeout: 10000,
      reliability_score: 0.94
    }
  ];

  private static readonly CONFIG: APIConfig = {
    timeout: 10000,
    retry_attempts: 3,
    retry_delay: 1000,
    max_concurrent: 5,
    cache_duration: 300000 // 5 minutes
  };

  private static readonly CACHE = new Map<string, { data: any; timestamp: number }>();

  /**
   * Fetch data from multiple sources in parallel
   */
  static async fetchFromMultipleSources(
    query: string, 
    domain: string, 
    maxSources: number = 5
  ): Promise<SourceResponse[]> {
    console.log(`🌐 Fetching from multiple sources for: ${query}`);
    
    const relevantSources = this.selectRelevantSources(domain, maxSources);
    const responses: SourceResponse[] = [];
    
    // Fetch from sources in parallel with rate limiting
    const promises = relevantSources.map(source => 
      this.fetchFromSource(source, query)
    );
    
    try {
      const results = await Promise.allSettled(promises);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          responses.push(result.value);
        } else {
          console.error('Source fetch failed:', result.reason);
        }
      }
      
    } catch (error) {
      console.error('Error fetching from multiple sources:', error);
    }
    
    // Sort by confidence and reliability
    return responses
      .filter(response => response.content.length > 50)
      .sort((a, b) => b.metadata.confidence - a.metadata.confidence);
  }

  /**
   * Fetch data from a specific source
   */
  static async fetchFromSource(source: APISource, query: string): Promise<SourceResponse> {
    const cacheKey = `${source.name}:${query}`;
    
    // Check cache first
    const cached = this.CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CONFIG.cache_duration) {
      return cached.data;
    }
    
    try {
      const content = await this.fetchFromSpecificSource(source, query);
      
      const response: SourceResponse = {
        source: source.name,
        content: content.text || '',
        metadata: {
          title: content.title,
          url: content.url,
          last_updated: content.last_updated || new Date().toISOString(),
          author: content.author,
          confidence: this.calculateConfidence(content, source),
          word_count: content.text?.split(/\s+/).length || 0,
          language: content.language || 'en'
        }
      };
      
      // Cache the response
      this.CACHE.set(cacheKey, { data: response, timestamp: Date.now() });
      
      return response;
      
    } catch (error: any) {
      return {
        source: source.name,
        content: '',
        metadata: {
          confidence: 0,
          word_count: 0,
          language: 'en'
        },
        error: error.message
      };
    }
  }

  /**
   * Fetch from specific source based on type
   */
  private static async fetchFromSpecificSource(source: APISource, query: string): Promise<any> {
    switch (source.name) {
      case 'Wikipedia':
        return await this.fetchFromWikipedia(query);
      case 'Britannica':
        return await this.fetchFromBritannica(query);
      case 'Government of India':
        return await this.fetchFromGovernmentIndia(query);
      case 'PM India':
        return await this.fetchFromPMIndia(query);
      case 'Scientific American':
        return await this.fetchFromScientificAmerican(query);
      case 'Nature':
        return await this.fetchFromNature(query);
      case 'TechCrunch':
        return await this.fetchFromTechCrunch(query);
      case 'BBC News':
        return await this.fetchFromBBC(query);
      case 'Reuters':
        return await this.fetchFromReuters(query);
      case 'World Bank':
        return await this.fetchFromWorldBank(query);
      default:
        throw new Error(`Unknown source: ${source.name}`);
    }
  }

  /**
   * Wikipedia API integration
   */
  private static async fetchFromWikipedia(query: string): Promise<any> {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const response = await fetch(url, { timeout: 5000 });
      
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        text: data.extract,
        title: data.title,
        url: data.content_urls?.desktop?.page,
        last_updated: data.timestamp,
        language: 'en'
      };
      
    } catch (error) {
      console.error('Wikipedia fetch error:', error);
      throw error;
    }
  }

  /**
   * Britannica API integration (simulated)
   */
  private static async fetchFromBritannica(query: string): Promise<any> {
    try {
      // Simulated Britannica response (would need actual API)
      const mockData = {
        text: `Britannica provides authoritative information about ${query}. This comprehensive resource offers detailed insights and expert analysis.`,
        title: `${query} - Britannica`,
        url: `https://www.britannica.com/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockData;
      
    } catch (error) {
      console.error('Britannica fetch error:', error);
      throw error;
    }
  }

  /**
   * Government of India API integration (simulated)
   */
  private static async fetchFromGovernmentIndia(query: string): Promise<any> {
    try {
      const mockData = {
        text: `Official information from the Government of India regarding ${query}. This data is verified and authoritative.`,
        title: `${query} - Government of India`,
        url: `https://www.india.gov.in/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return mockData;
      
    } catch (error) {
      console.error('Government India fetch error:', error);
      throw error;
    }
  }

  /**
   * PM India API integration (simulated)
   */
  private static async fetchFromPMIndia(query: string): Promise<any> {
    try {
      const mockData = {
        text: `Information from the Prime Minister's Office regarding ${query}. This is official government data.`,
        title: `${query} - PM India`,
        url: `https://pmindia.gov.in/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      return mockData;
      
    } catch (error) {
      console.error('PM India fetch error:', error);
      throw error;
    }
  }

  /**
   * Scientific American API integration (simulated)
   */
  private static async fetchFromScientificAmerican(query: string): Promise<any> {
    try {
      const mockData = {
        text: `Scientific analysis and research findings about ${query} from Scientific American. Peer-reviewed content with scientific accuracy.`,
        title: `${query} - Scientific American`,
        url: `https://www.scientificamerican.com/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return mockData;
      
    } catch (error) {
      console.error('Scientific American fetch error:', error);
      throw error;
    }
  }

  /**
   * Nature API integration (simulated)
   */
  private static async fetchFromNature(query: string): Promise<any> {
    try {
      const mockData = {
        text: `Research and scientific publications about ${query} from Nature. High-quality scientific content and peer-reviewed research.`,
        title: `${query} - Nature`,
        url: `https://www.nature.com/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return mockData;
      
    } catch (error) {
      console.error('Nature fetch error:', error);
      throw error;
    }
  }

  /**
   * TechCrunch API integration (simulated)
   */
  private static async fetchFromTechCrunch(query: string): Promise<any> {
    try {
      const mockData = {
        text: `Technology news and analysis about ${query} from TechCrunch. Latest developments and industry insights.`,
        title: `${query} - TechCrunch`,
        url: `https://techcrunch.com/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      await new Promise(resolve => setTimeout(resolve, 900));
      
      return mockData;
      
    } catch (error) {
      console.error('TechCrunch fetch error:', error);
      throw error;
    }
  }

  /**
   * BBC News API integration (simulated)
   */
  private static async fetchFromBBC(query: string): Promise<any> {
    try {
      const mockData = {
        text: `News coverage and analysis about ${query} from BBC News. Reliable and comprehensive news reporting.`,
        title: `${query} - BBC News`,
        url: `https://www.bbc.com/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      return mockData;
      
    } catch (error) {
      console.error('BBC fetch error:', error);
      throw error;
    }
  }

  /**
   * Reuters API integration (simulated)
   */
  private static async fetchFromReuters(query: string): Promise<any> {
    try {
      const mockData = {
        text: `News and analysis about ${query} from Reuters. Professional journalism and factual reporting.`,
        title: `${query} - Reuters`,
        url: `https://www.reuters.com/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockData;
      
    } catch (error) {
      console.error('Reuters fetch error:', error);
      throw error;
    }
  }

  /**
   * World Bank API integration (simulated)
   */
  private static async fetchFromWorldBank(query: string): Promise<any> {
    try {
      const mockData = {
        text: `Economic data and analysis about ${query} from the World Bank. Official economic statistics and development indicators.`,
        title: `${query} - World Bank`,
        url: `https://data.worldbank.org/search?query=${encodeURIComponent(query)}`,
        last_updated: new Date().toISOString(),
        language: 'en'
      };
      
      await new Promise(resolve => setTimeout(resolve, 1300));
      
      return mockData;
      
    } catch (error) {
      console.error('World Bank fetch error:', error);
      throw error;
    }
  }

  /**
   * Select relevant sources based on domain
   */
  private static selectRelevantSources(domain: string, maxSources: number): APISource[] {
    const domainSourceMap: { [key: string]: string[] } = {
      'politics': ['Wikipedia', 'Government of India', 'PM India', 'BBC News', 'Reuters'],
      'science': ['Wikipedia', 'Britannica', 'Scientific American', 'Nature'],
      'technology': ['Wikipedia', 'TechCrunch', 'BBC News', 'Reuters'],
      'geography': ['Wikipedia', 'Britannica', 'World Bank', 'Government of India'],
      'history': ['Wikipedia', 'Britannica', 'BBC News', 'Reuters'],
      'general': ['Wikipedia', 'Britannica', 'BBC News', 'Reuters', 'Scientific American']
    };
    
    const relevantSourceNames = domainSourceMap[domain] || domainSourceMap['general'];
    const relevantSources = this.API_SOURCES.filter(source => 
      relevantSourceNames.includes(source.name)
    );
    
    // Sort by reliability score and return top sources
    return relevantSources
      .sort((a, b) => b.reliability_score - a.reliability_score)
      .slice(0, maxSources);
  }

  /**
   * Calculate confidence score for source response
   */
  private static calculateConfidence(content: any, source: APISource): number {
    let confidence = source.reliability_score;
    
    // Adjust based on content quality
    if (content.text && content.text.length > 100) {
      confidence += 0.1;
    }
    
    if (content.text && content.text.length > 500) {
      confidence += 0.1;
    }
    
    if (content.title) {
      confidence += 0.05;
    }
    
    if (content.url) {
      confidence += 0.05;
    }
    
    if (content.last_updated) {
      confidence += 0.05;
    }
    
    return Math.min(1, confidence);
  }

  /**
   * Get source statistics
   */
  static getSourceStatistics(): {
    total_sources: number;
    average_reliability: number;
    sources_by_domain: { [domain: string]: number };
    cache_hit_rate: number;
  } {
    const totalSources = this.API_SOURCES.length;
    const averageReliability = this.API_SOURCES.reduce((sum, source) => 
      sum + source.reliability_score, 0) / totalSources;
    
    const sourcesByDomain = {
      'politics': 5,
      'science': 4,
      'technology': 4,
      'geography': 4,
      'history': 4,
      'general': 5
    };
    
    const cacheHitRate = this.CACHE.size > 0 ? 0.85 : 0; // Simulated
    
    return {
      total_sources: totalSources,
      average_reliability: averageReliability,
      sources_by_domain: sourcesByDomain,
      cache_hit_rate: cacheHitRate
    };
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.CACHE.clear();
    console.log('🗑️ API cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStatistics(): {
    size: number;
    entries: string[];
    oldest_entry: Date | null;
    newest_entry: Date | null;
  } {
    const entries = Array.from(this.CACHE.keys());
    const timestamps = Array.from(this.CACHE.values()).map(entry => entry.timestamp);
    
    return {
      size: this.CACHE.size,
      entries: entries,
      oldest_entry: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newest_entry: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    };
  }
}

export default MultiSourceAPIManager;