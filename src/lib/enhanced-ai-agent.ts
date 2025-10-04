/**
 * Enhanced AI Agent - 1-Hour Sprint Implementation
 * Multi-format answer generation with confidence scoring and cross-source verification
 */

import fetch from 'node-fetch';

interface Source {
  url: string;
  label: string;
  snippet: string;
  last_updated: string;
  authority_score: number;
}

interface Fact {
  fact: string;
  value: string;
  confidence: number;
  sources: string[];
}

interface FAQ {
  q: string;
  a: string;
  confidence: number;
}

interface Card {
  id: string;
  title: string;
  short: string;
  long: string;
  facts: { [key: string]: string };
  confidence: number;
  sources: Source[];
}

interface AnswerVariants {
  short: string;
  medium: string;
  long: string;
}

interface EnhancedResponse {
  query: string;
  tldr: string;
  variants: AnswerVariants;
  cards: Card[];
  disambiguation: string[];
  faq: FAQ[];
  translations: { [key: string]: string };
  meta: {
    generated_at: string;
    confidence: number;
    conflicts_found: number;
    freshness_days: number;
    coverage_percentage: number;
  };
}

export class EnhancedAIAgent {
  private readonly WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
  private readonly BRITANNICA_API = 'https://www.britannica.com/api/search';
  
  /**
   * Main sprint method - runs the full 1-hour enhancement pipeline
   */
  async runSprint(query: string): Promise<EnhancedResponse> {
    console.log(`🚀 Starting 1-hour sprint for: "${query}"`);
    
    // 0-10 minutes: Source consolidation
    const sources = await this.fetchAndConsolidateSources(query);
    
    // 10-20 minutes: Generate TL;DR + 3-card variants
    const variants = await this.generateAnswerVariants(sources);
    
    // 20-30 minutes: Entity & fact extraction
    const facts = await this.extractStructuredFacts(sources);
    
    // 30-40 minutes: Cross-source verification & confidence scoring
    const verifiedFacts = await this.crossVerifyFacts(facts, sources);
    
    // 40-48 minutes: Disambiguation & intent detection
    const disambiguation = await this.detectDisambiguation(query, sources);
    
    // 48-55 minutes: FAQ + micro-translation + source block
    const faq = await this.generateFAQ(query, sources);
    const translations = await this.generateTranslations(variants.short);
    
    // 55-60 minutes: QA checks & packaging
    const finalResponse = await this.packageFinalResponse(
      query, variants, verifiedFacts, disambiguation, faq, translations, sources
    );
    
    console.log(`✅ Sprint completed for: "${query}"`);
    return finalResponse;
  }

  /**
   * 0-10 minutes: Source consolidation
   */
  private async fetchAndConsolidateSources(query: string): Promise<Source[]> {
    console.log('📚 Fetching and consolidating sources...');
    
    const sources: Source[] = [];
    
    try {
      // Fetch Wikipedia summary
      const wikiData = await this.fetchWikipediaSummary(query);
      if (wikiData) {
        sources.push({
          url: wikiData.content_urls?.desktop?.page || '',
          label: 'Wikipedia',
          snippet: wikiData.extract || '',
          last_updated: wikiData.timestamp || new Date().toISOString(),
          authority_score: 0.9
        });
      }
      
      // Fetch Britannica (simulated - would need actual API)
      const britannicaData = await this.fetchBritannicaSummary(query);
      if (britannicaData) {
        sources.push({
          url: britannicaData.url || '',
          label: 'Britannica',
          snippet: britannicaData.extract || '',
          last_updated: britannicaData.last_updated || new Date().toISOString(),
          authority_score: 0.8
        });
      }
      
      // Add official government source for PM queries
      if (query.toLowerCase().includes('pm') || query.toLowerCase().includes('prime minister')) {
        sources.push({
          url: 'https://pmindia.gov.in',
          label: 'Official PM India Website',
          snippet: 'Official website of the Prime Minister of India with latest updates and information.',
          last_updated: new Date().toISOString(),
          authority_score: 0.95
        });
      }
      
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
    
    return sources.slice(0, 3); // Top 3 sources
  }

  /**
   * 10-20 minutes: Generate TL;DR + 3-card variants
   */
  private async generateAnswerVariants(sources: Source[]): Promise<AnswerVariants> {
    console.log('📝 Generating answer variants...');
    
    const combinedText = sources.map(s => s.snippet).join(' ');
    
    return {
      short: this.generateShortAnswer(combinedText),
      medium: this.generateMediumAnswer(combinedText),
      long: this.generateLongAnswer(combinedText)
    };
  }

  /**
   * 20-30 minutes: Entity & fact extraction
   */
  private async extractStructuredFacts(sources: Source[]): Promise<Fact[]> {
    console.log('🔍 Extracting structured facts...');
    
    const facts: Fact[] = [];
    const combinedText = sources.map(s => s.snippet).join(' ');
    
    // Extract key facts using regex patterns
    const patterns = {
      'office': /(?:office|position)[:\s]+([^.,]+)/gi,
      'residence': /(?:residence|lives? at)[:\s]+([^.,]+)/gi,
      'formation_date': /(?:formed|established|created)[:\s]+([^.,]+)/gi,
      'current_holder': /(?:current|serving)[:\s]+([^.,]+)/gi,
      'political_party': /(?:party|affiliation)[:\s]+([^.,]+)/gi
    };
    
    for (const [factType, pattern] of Object.entries(patterns)) {
      const matches = [...combinedText.matchAll(pattern)];
      if (matches.length > 0) {
        facts.push({
          fact: factType,
          value: matches[0][1].trim(),
          confidence: 0.8,
          sources: sources.map(s => s.label)
        });
      }
    }
    
    return facts;
  }

  /**
   * 30-40 minutes: Cross-source verification & confidence scoring
   */
  private async crossVerifyFacts(facts: Fact[], sources: Source[]): Promise<Fact[]> {
    console.log('✅ Cross-verifying facts...');
    
    return facts.map(fact => {
      // Count how many sources mention this fact
      const sourceCount = sources.filter(source => 
        source.snippet.toLowerCase().includes(fact.value.toLowerCase())
      ).length;
      
      // Calculate confidence based on source agreement
      const confidence = Math.min(1, 0.6 * (sourceCount / sources.length) + 0.3 * 0.8 + 0.1 * 0.9);
      
      return {
        ...fact,
        confidence: Math.round(confidence * 100) / 100
      };
    });
  }

  /**
   * 40-48 minutes: Disambiguation & intent detection
   */
  private async detectDisambiguation(query: string, sources: Source[]): Promise<string[]> {
    console.log('🎯 Detecting disambiguation...');
    
    const queryLower = query.toLowerCase();
    const categories = [];
    
    // Simple keyword-based disambiguation
    if (queryLower.includes('pm') || queryLower.includes('prime minister')) {
      categories.push('Politics', 'People', 'History');
    }
    if (queryLower.includes('python')) {
      categories.push('Biology', 'Computing', 'Mythology');
    }
    if (queryLower.includes('newton')) {
      categories.push('Physics', 'People', 'History');
    }
    if (queryLower.includes('openai')) {
      categories.push('Technology', 'People', 'Business');
    }
    
    return categories.length > 0 ? categories : ['General'];
  }

  /**
   * 48-55 minutes: FAQ + micro-translation + source block
   */
  private async generateFAQ(query: string, sources: Source[]): Promise<FAQ[]> {
    console.log('❓ Generating FAQ...');
    
    const faq: FAQ[] = [];
    const combinedText = sources.map(s => s.snippet).join(' ');
    
    // Generate common questions based on query type
    if (query.toLowerCase().includes('pm') || query.toLowerCase().includes('prime minister')) {
      faq.push({
        q: 'Who is the current Prime Minister of India?',
        a: this.extractAnswer(combinedText, 'current'),
        confidence: 0.9
      });
      faq.push({
        q: 'What is the role of the Prime Minister?',
        a: this.extractAnswer(combinedText, 'role'),
        confidence: 0.8
      });
      faq.push({
        q: 'Where does the Prime Minister live?',
        a: this.extractAnswer(combinedText, 'residence'),
        confidence: 0.7
      });
    }
    
    return faq.slice(0, 3); // Top 3 FAQs
  }

  private async generateTranslations(text: string): Promise<{ [key: string]: string }> {
    console.log('🌐 Generating translations...');
    
    // Simple translation simulation (would use actual translation API)
    return {
      hi: `हिंदी अनुवाद: ${text}`,
      ta: `தமிழ் மொழிபெயர்ப்பு: ${text}`
    };
  }

  /**
   * 55-60 minutes: QA checks & packaging
   */
  private async packageFinalResponse(
    query: string,
    variants: AnswerVariants,
    facts: Fact[],
    disambiguation: string[],
    faq: FAQ[],
    translations: { [key: string]: string },
    sources: Source[]
  ): Promise<EnhancedResponse> {
    console.log('📦 Packaging final response...');
    
    // Calculate metrics
    const conflictsFound = facts.filter(f => f.confidence < 0.7).length;
    const avgConfidence = facts.reduce((sum, f) => sum + f.confidence, 0) / facts.length;
    const freshnessDays = this.calculateFreshness(sources);
    const coveragePercentage = this.calculateCoverage(facts);
    
    // Create cards
    const cards: Card[] = disambiguation.map(category => ({
      id: category.toLowerCase(),
      title: `${category} ${this.getCategoryEmoji(category)}`,
      short: variants.short,
      long: variants.medium,
      facts: this.extractFactsForCategory(facts, category),
      confidence: avgConfidence,
      sources: sources
    }));
    
    return {
      query,
      tldr: variants.short,
      variants,
      cards,
      disambiguation,
      faq,
      translations,
      meta: {
        generated_at: new Date().toISOString(),
        confidence: avgConfidence,
        conflicts_found: conflictsFound,
        freshness_days: freshnessDays,
        coverage_percentage: coveragePercentage
      }
    };
  }

  // Helper methods
  private async fetchWikipediaSummary(title: string): Promise<any> {
    try {
      const url = `${this.WIKIPEDIA_API}${encodeURIComponent(title)}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Wikipedia fetch error:', error);
      return null;
    }
  }

  private async fetchBritannicaSummary(query: string): Promise<any> {
    // Simulated Britannica response (would need actual API)
    return {
      url: `https://www.britannica.com/search?query=${encodeURIComponent(query)}`,
      extract: 'Britannica provides authoritative information on various topics.',
      last_updated: new Date().toISOString()
    };
  }

  private generateShortAnswer(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences[0]?.trim() + '.' || 'Information not available.';
  }

  private generateMediumAnswer(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 2).join('. ').trim() + '.' || 'Information not available.';
  }

  private generateLongAnswer(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 4).join('. ').trim() + '.' || 'Information not available.';
  }

  private extractAnswer(text: string, keyword: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.toLowerCase().includes(keyword));
    return sentences[0]?.trim() + '.' || 'Information not available.';
  }

  private calculateFreshness(sources: Source[]): number {
    const now = new Date();
    const oldestSource = sources.reduce((oldest, source) => {
      const sourceDate = new Date(source.last_updated);
      return sourceDate < oldest ? sourceDate : oldest;
    }, now);
    return Math.floor((now.getTime() - oldestSource.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateCoverage(facts: Fact[]): number {
    const expectedFacts = ['office', 'residence', 'formation_date', 'current_holder'];
    const foundFacts = facts.filter(f => expectedFacts.includes(f.fact)).length;
    return Math.round((foundFacts / expectedFacts.length) * 100);
  }

  private extractFactsForCategory(facts: Fact[], category: string): { [key: string]: string } {
    const categoryFacts: { [key: string]: string } = {};
    facts.forEach(fact => {
      categoryFacts[fact.fact] = fact.value;
    });
    return categoryFacts;
  }

  private getCategoryEmoji(category: string): string {
    const emojis: { [key: string]: string } = {
      'Politics': '🏛️',
      'People': '👤',
      'History': '📜',
      'Biology': '🐍',
      'Computing': '💻',
      'Mythology': '🏛️',
      'Physics': '⚡',
      'Technology': '🔧',
      'Business': '💼',
      'General': '📋'
    };
    return emojis[category] || '📋';
  }
}

/**
 * Celestial Integration - Reminder Hooks
 */
export class CelestialReminderHooks {
  static async setReminder(userId: string, content: string, delayMinutes: number = 30): Promise<void> {
    // Integration with Celestial's reminder system
    console.log(`⏰ Setting reminder for user ${userId}: "${content}" in ${delayMinutes} minutes`);
    // Would integrate with actual Celestial reminder API
  }

  static async saveToReadingList(userId: string, response: EnhancedResponse): Promise<void> {
    // Save response to user's reading list
    console.log(`📚 Saving to reading list for user ${userId}: ${response.query}`);
    // Would integrate with actual Celestial reading list API
  }
}

/**
 * Demo function to test the sprint
 */
export async function runSprintDemo() {
  const agent = new EnhancedAIAgent();
  
  const queries = [
    'pm of india',
    'python',
    'newton laws',
    'openai founder'
  ];

  for (const query of queries) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🚀 Running sprint for: "${query}"`);
    console.log(`${'='.repeat(50)}`);
    
    const startTime = Date.now();
    const response = await agent.runSprint(query);
    const endTime = Date.now();
    
    console.log(`\n📊 Sprint Results:`);
    console.log(`⏱️  Time taken: ${endTime - startTime}ms`);
    console.log(`🎯 Confidence: ${response.meta.confidence}`);
    console.log(`⚠️  Conflicts: ${response.meta.conflicts_found}`);
    console.log(`📈 Coverage: ${response.meta.coverage_percentage}%`);
    console.log(`🕒 Freshness: ${response.meta.freshness_days} days`);
    
    console.log(`\n📝 TL;DR: ${response.tldr}`);
    console.log(`\n🎯 Disambiguation: ${response.disambiguation.join(', ')}`);
    console.log(`\n❓ FAQ Count: ${response.faq.length}`);
    console.log(`\n🌐 Translations: ${Object.keys(response.translations).join(', ')}`);
    
    // Set reminder for user to read this later
    await CelestialReminderHooks.setReminder('demo-user', `Read about: ${query}`, 30);
  }
}

export default EnhancedAIAgent;