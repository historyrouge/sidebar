import { ChatMessage, Source, ScrapedContent, ChatHistory } from '../types';
import { WikipediaScraper } from '../scrapers/wikipedia';
import { GeneralWebScraper } from '../scrapers/general';

export class ChatService {
  private wikipediaScraper: WikipediaScraper;
  private generalScraper: GeneralWebScraper;
  private chatHistory: ChatHistory[] = [];

  constructor() {
    this.wikipediaScraper = new WikipediaScraper();
    this.generalScraper = new GeneralWebScraper();
  }

  async processQuery(query: string): Promise<ChatMessage> {
    const sources: Source[] = [];
    let response = '';

    try {
      // Always search Wikipedia first
      const wikipediaResults = await this.wikipediaScraper.searchAndScrape(query);
      
      // Convert Wikipedia results to sources
      wikipediaResults.forEach(result => {
        sources.push({
          id: `wiki-${Date.now()}-${Math.random()}`,
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          domain: result.domain,
          icon: '🌐'
        });
      });

      // Generate response based on scraped content
      response = this.generateResponse(query, wikipediaResults);

      // If Wikipedia results are insufficient, try other sources
      if (wikipediaResults.length === 0 || response.length < 100) {
        const additionalSources = await this.searchAdditionalSources(query);
        sources.push(...additionalSources);
        
        if (sources.length > 0) {
          response = this.generateResponseFromSources(query, sources);
        }
      }

      // Fallback response if no sources found
      if (!response) {
        response = `I couldn't find specific information about "${query}" in my available sources. Please try rephrasing your question or asking about a different topic.`;
      }

    } catch (error) {
      console.error('Error processing query:', error);
      response = 'Sorry, I encountered an error while searching for information. Please try again.';
    }

    return {
      id: `msg-${Date.now()}-${Math.random()}`,
      type: 'assistant',
      content: response,
      timestamp: new Date(),
      sources
    };
  }

  private async searchAdditionalSources(query: string): Promise<Source[]> {
    const sources: Source[] = [];
    
    try {
      // Try educational websites
      const educationalUrls = this.generalScraper.getEducationalUrls(query);
      const educationalResults = await this.generalScraper.scrapeMultipleUrls(educationalUrls.slice(0, 2));
      
      educationalResults.forEach(result => {
        sources.push({
          id: `edu-${Date.now()}-${Math.random()}`,
          title: result.title,
          url: result.url,
          snippet: result.snippet,
          domain: result.domain,
          icon: '📚'
        });
      });

      // Try news websites for current events
      if (this.isCurrentEventQuery(query)) {
        const newsUrls = this.generalScraper.getNewsUrls(query);
        const newsResults = await this.generalScraper.scrapeMultipleUrls(newsUrls.slice(0, 2));
        
        newsResults.forEach(result => {
          sources.push({
            id: `news-${Date.now()}-${Math.random()}`,
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            domain: result.domain,
            icon: '📰'
          });
        });
      }
    } catch (error) {
      console.error('Error searching additional sources:', error);
    }

    return sources;
  }

  private isCurrentEventQuery(query: string): boolean {
    const currentEventKeywords = [
      'news', 'latest', 'recent', 'today', 'yesterday', 'current',
      'breaking', 'update', 'happening', 'now', '2024', '2023'
    ];
    
    return currentEventKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private generateResponse(query: string, scrapedContent: ScrapedContent[]): string {
    if (scrapedContent.length === 0) {
      return '';
    }

    const queryLower = query.toLowerCase();
    
    // Handle specific question types
    if (queryLower.includes('who is') || queryLower.includes('who was')) {
      return this.generatePersonResponse(scrapedContent[0]);
    }
    
    if (queryLower.includes('what is') || queryLower.includes('what are')) {
      return this.generateDefinitionResponse(scrapedContent[0]);
    }
    
    if (queryLower.includes('how') || queryLower.includes('explain')) {
      return this.generateExplanationResponse(scrapedContent[0]);
    }
    
    if (queryLower.includes('when') || queryLower.includes('date')) {
      return this.generateTimelineResponse(scrapedContent[0]);
    }

    // Default response
    return this.generateGeneralResponse(scrapedContent[0]);
  }

  private generateResponseFromSources(query: string, sources: Source[]): string {
    if (sources.length === 0) return '';
    
    const primarySource = sources[0];
    return `Based on information from ${primarySource.domain}, ${primarySource.snippet}`;
  }

  private generatePersonResponse(content: ScrapedContent): string {
    const sentences = content.content.split('.').slice(0, 3);
    return `${content.title} is ${sentences.join('. ')}.`;
  }

  private generateDefinitionResponse(content: ScrapedContent): string {
    const sentences = content.content.split('.').slice(0, 4);
    return `${content.title} refers to ${sentences.join('. ')}.`;
  }

  private generateExplanationResponse(content: ScrapedContent): string {
    const sentences = content.content.split('.').slice(0, 5);
    return `Here's an explanation of ${content.title}: ${sentences.join('. ')}.`;
  }

  private generateTimelineResponse(content: ScrapedContent): string {
    const sentences = content.content.split('.').slice(0, 3);
    return `Regarding the timeline of ${content.title}: ${sentences.join('. ')}.`;
  }

  private generateGeneralResponse(content: ScrapedContent): string {
    const sentences = content.content.split('.').slice(0, 4);
    return `Here's what I found about ${content.title}: ${sentences.join('. ')}.`;
  }

  // Chat history management
  createNewChat(): ChatHistory {
    const newChat: ChatHistory = {
      id: `chat-${Date.now()}-${Math.random()}`,
      title: 'New Chat',
      messages: [],
      timestamp: new Date()
    };
    
    this.chatHistory.unshift(newChat);
    return newChat;
  }

  getChatHistory(): ChatHistory[] {
    return this.chatHistory;
  }

  getChatById(id: string): ChatHistory | undefined {
    return this.chatHistory.find(chat => chat.id === id);
  }

  addMessageToChat(chatId: string, message: ChatMessage): void {
    const chat = this.getChatById(chatId);
    if (chat) {
      chat.messages.push(message);
      
      // Update chat title if it's the first user message
      if (message.type === 'user' && chat.title === 'New Chat') {
        chat.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
      }
    }
  }
}