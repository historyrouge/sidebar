export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Source {
  id: string;
  title: string;
  url: string;
  snippet: string;
  domain: string;
  icon: string;
}

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  domain: string;
  snippet: string;
}

export interface WikipediaSearchResult {
  title: string;
  snippet: string;
  pageid: number;
  url: string;
}

export interface WikipediaResponse {
  query: {
    search: WikipediaSearchResult[];
  };
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: Date;
}

export interface ScraperConfig {
  timeout: number;
  maxRetries: number;
  userAgent: string;
}