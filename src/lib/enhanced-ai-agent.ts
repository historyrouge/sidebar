/**
 * Enhanced AI Agent - 1-Hour Sprint Implementation
 * Multi-format answer generation with confidence scoring and cross-source verification
 * Now with comprehensive training data, advanced NLP, knowledge graphs, and real-time verification
 */

import fetch from 'node-fetch';
import TrainingDataManager from './training-data';
import AdvancedNLPProcessor from './advanced-nlp';
import KnowledgeGraphManager from './knowledge-graph';
import MultiSourceAPIManager from './multi-source-apis';
import ConfidenceScoringEngine from './confidence-scoring';
import RealTimeVerificationEngine from './real-time-verification';

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
   * Main sprint method - runs the full 1-hour enhancement pipeline with advanced components
   */
  async runSprint(query: string): Promise<EnhancedResponse> {
    console.log(`🚀 Starting enhanced 1-hour sprint for: "${query}"`);
    
    // 0-5 minutes: Query Analysis & Disambiguation
    const domain = await this.analyzeQueryAndDisambiguate(query);
    console.log(`📊 Detected domain: ${domain}`);
    
    // 5-10 minutes: Retrieve Relevant Sources (Enhanced)
    const sources = await this.fetchAndConsolidateSources(query, domain);
    console.log(`📚 Retrieved ${sources.length} sources`);
    
    // 10-20 minutes: Advanced NLP Processing
    const nlpAnalysis = await this.performAdvancedNLPAnalysis(sources, query);
    console.log(`🧠 NLP Analysis: ${nlpAnalysis.entities.length} entities, ${nlpAnalysis.relationships.length} relationships`);
    
    // 20-30 minutes: Knowledge Graph Construction
    const knowledgeGraph = await this.buildKnowledgeGraph(sources, domain, nlpAnalysis);
    console.log(`🕸️ Knowledge Graph: ${knowledgeGraph.nodes.length} nodes, ${knowledgeGraph.edges.length} edges`);
    
    // 30-40 minutes: Real-time Fact Verification
    const verificationResults = await this.performRealTimeVerification(query, domain, nlpAnalysis.facts);
    console.log(`✅ Verification: ${verificationResults.length} facts verified`);
    
    // 40-50 minutes: Advanced Confidence Scoring
    const confidenceScore = await this.calculateAdvancedConfidenceScore(
      sources, nlpAnalysis, knowledgeGraph, verificationResults, domain
    );
    console.log(`🎯 Confidence Score: ${Math.round(confidenceScore.overall * 100)}%`);
    
    // 50-55 minutes: Generate Enhanced Answer Variants
    const variants = await this.generateEnhancedAnswerVariants(sources, nlpAnalysis, confidenceScore);
    
    // 55-60 minutes: Final Assembly & Quality Assurance
    const finalResponse = await this.assembleFinalResponse(
      query, domain, variants, nlpAnalysis, knowledgeGraph, verificationResults, confidenceScore, sources
    );
    
    console.log(`✅ Enhanced sprint completed for: "${query}"`);
    return finalResponse;
  }

  /**
   * 0-5 minutes: Query Analysis & Disambiguation
   */
  private async analyzeQueryAndDisambiguate(query: string): Promise<string> {
    console.log('🔍 Analyzing query and detecting domain...');
    
    const semanticAnalysis = AdvancedNLPProcessor.analyzeSemantics(query);
    const domains = TrainingDataManager.getAllDomains();
    
    // Find best matching domain
    let bestDomain = 'general';
    let bestScore = 0;
    
    for (const domain of domains) {
      const domainKnowledge = TrainingDataManager.getDomainKnowledge(domain);
      if (domainKnowledge) {
        const domainKeywords = domainKnowledge.keywords;
        const matches = domainKeywords.filter(keyword => 
          query.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        
        const score = matches / domainKeywords.length;
        if (score > bestScore) {
          bestScore = score;
          bestDomain = domain;
        }
      }
    }
    
    return bestDomain;
  }

  /**
   * 5-10 minutes: Enhanced Source Consolidation
   */
  private async fetchAndConsolidateSources(query: string, domain: string): Promise<Source[]> {
    console.log('📚 Fetching and consolidating sources...');
    
    try {
      // Use MultiSourceAPIManager for enhanced source fetching
      const sourceResponses = await MultiSourceAPIManager.fetchFromMultipleSources(query, domain, 5);
      
      const sources: Source[] = sourceResponses.map(response => ({
        url: response.metadata.url || '',
        label: response.source,
        snippet: response.content,
        last_updated: response.metadata.last_updated || new Date().toISOString(),
        authority_score: response.metadata.confidence
      }));
      
      return sources;
      
    } catch (error) {
      console.error('Error fetching sources:', error);
      return [];
    }
  }

  /**
   * 10-20 minutes: Advanced NLP Processing
   */
  private async performAdvancedNLPAnalysis(sources: Source[], query: string): Promise<{
    entities: any[];
    relationships: any[];
    sentiment: any;
    semantic: any;
    facts: { [key: string]: string };
  }> {
    console.log('🧠 Performing advanced NLP analysis...');
    
    const combinedContent = sources.map(s => s.snippet).join(' ');
    
    // Extract entities
    const entities = AdvancedNLPProcessor.extractEntities(combinedContent);
    
    // Analyze sentiment
    const sentiment = AdvancedNLPProcessor.analyzeSentiment(combinedContent);
    
    // Perform semantic analysis
    const semantic = AdvancedNLPProcessor.analyzeSemantics(combinedContent);
    
    // Extract relationships
    const relationships = semantic.relationships;
    
    // Extract facts using training data
    const domain = await this.analyzeQueryAndDisambiguate(query);
    const facts = TrainingDataManager.extractFacts(combinedContent, domain);
    
    return {
      entities,
      relationships,
      sentiment,
      semantic,
      facts
    };
  }

  /**
   * 20-30 minutes: Knowledge Graph Construction
   */
  private async buildKnowledgeGraph(sources: Source[], domain: string, nlpAnalysis: any): Promise<any> {
    console.log('🕸️ Building knowledge graph...');
    
    const combinedContent = sources.map(s => s.snippet).join(' ');
    
    try {
      const knowledgeGraph = await KnowledgeGraphManager.buildKnowledgeGraph(combinedContent, domain);
      return knowledgeGraph;
    } catch (error) {
      console.error('Error building knowledge graph:', error);
      return { nodes: [], edges: [], metadata: { total_nodes: 0, total_edges: 0, domains: [domain], last_updated: new Date().toISOString() } };
    }
  }

  /**
   * 30-40 minutes: Real-time Fact Verification
   */
  private async performRealTimeVerification(query: string, domain: string, facts: { [key: string]: string }): Promise<any[]> {
    console.log('✅ Performing real-time fact verification...');
    
    try {
      const verificationSession = await RealTimeVerificationEngine.startVerificationSession(query, domain, facts);
      return verificationSession.results;
    } catch (error) {
      console.error('Error in real-time verification:', error);
      return [];
    }
  }

  /**
   * 40-50 minutes: Advanced Confidence Scoring
   */
  private async calculateAdvancedConfidenceScore(
    sources: Source[],
    nlpAnalysis: any,
    knowledgeGraph: any,
    verificationResults: any[],
    domain: string
  ): Promise<any> {
    console.log('🎯 Calculating advanced confidence score...');
    
    try {
      const confidenceScore = await ConfidenceScoringEngine.calculateConfidenceScore(
        sources.map(s => s.snippet).join(' '),
        sources,
        domain,
        nlpAnalysis.entities,
        nlpAnalysis.relationships
      );
      
      return confidenceScore;
    } catch (error) {
      console.error('Error calculating confidence score:', error);
      return {
        overall: 0.5,
        factors: {},
        explanation: 'Confidence calculation failed',
        recommendations: ['Manual review required'],
        risk_level: 'medium'
      };
    }
  }

  /**
   * 50-55 minutes: Generate Enhanced Answer Variants
   */
  private async generateEnhancedAnswerVariants(sources: Source[], nlpAnalysis: any, confidenceScore: any): Promise<AnswerVariants> {
    console.log('📝 Generating enhanced answer variants...');
    
    const combinedText = sources.map(s => s.snippet).join(' ');
    
    // Enhanced variants with NLP insights
    const shortAnswer = this.generateShortAnswer(combinedText);
    const mediumAnswer = this.generateMediumAnswer(combinedText, nlpAnalysis);
    const longAnswer = this.generateLongAnswer(combinedText, nlpAnalysis, confidenceScore);
    
    return {
      short: shortAnswer,
      medium: mediumAnswer,
      long: longAnswer
    };
  }

  /**
   * 55-60 minutes: Final Assembly & Quality Assurance
   */
  private async assembleFinalResponse(
    query: string,
    domain: string,
    variants: AnswerVariants,
    nlpAnalysis: any,
    knowledgeGraph: any,
    verificationResults: any[],
    confidenceScore: any,
    sources: Source[]
  ): Promise<EnhancedResponse> {
    console.log('📦 Assembling final enhanced response...');
    
    // Generate disambiguation
    const disambiguation = await this.detectDisambiguation(query, sources);
    
    // Generate FAQ
    const faq = await this.generateFAQ(query, sources);
    
    // Generate translations
    const translations = await this.generateTranslations(variants.short);
    
    // Create enhanced cards
    const cards = await this.createEnhancedCards(domain, variants, nlpAnalysis, knowledgeGraph, confidenceScore);
    
    // Calculate final metrics
    const conflictsFound = verificationResults.filter(r => r.conflicts.length > 0).length;
    const freshnessDays = this.calculateFreshness(sources);
    const coveragePercentage = this.calculateCoverage(nlpAnalysis.facts);
    
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
        confidence: confidenceScore.overall,
        conflicts_found: conflictsFound,
        freshness_days: freshnessDays,
        coverage_percentage: coveragePercentage
      }
    };
  }

  /**
   * Create enhanced cards with NLP insights
   */
  private async createEnhancedCards(
    domain: string,
    variants: AnswerVariants,
    nlpAnalysis: any,
    knowledgeGraph: any,
    confidenceScore: any
  ): Promise<Card[]> {
    const cards: Card[] = [];
    
    // Create domain-specific cards
    const domainKnowledge = TrainingDataManager.getDomainKnowledge(domain);
    if (domainKnowledge) {
      cards.push({
        id: domain,
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} ${this.getCategoryEmoji(domain)}`,
        short: variants.short,
        long: variants.medium,
        facts: nlpAnalysis.facts,
        confidence: confidenceScore.overall,
        sources: []
      });
    }
    
    // Create entity-based cards
    const entityCards = nlpAnalysis.entities.slice(0, 3).map((entity: any) => ({
      id: entity.label.toLowerCase().replace(/\s+/g, '_'),
      title: `${entity.text} ${this.getCategoryEmoji(entity.label)}`,
      short: `${entity.text} is a ${entity.label.toLowerCase()}.`,
      long: `${entity.text} is a ${entity.label.toLowerCase()} with ${entity.confidence * 100}% confidence. ${entity.description || ''}`,
      facts: { type: entity.label, confidence: entity.confidence },
      confidence: entity.confidence,
      sources: []
    }));
    
    cards.push(...entityCards);
    
    return cards;
  }

  /**
   * Generate enhanced medium answer with NLP insights
   */
  private generateMediumAnswer(text: string, nlpAnalysis?: any): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    let answer = sentences.slice(0, 2).join('. ').trim() + '.';
    
    // Add entity information if available
    if (nlpAnalysis && nlpAnalysis.entities && nlpAnalysis.entities.length > 0) {
      const topEntity = nlpAnalysis.entities[0];
      answer += ` Key entity: ${topEntity.text} (${topEntity.label}).`;
    }
    
    return answer;
  }

  /**
   * Generate enhanced long answer with comprehensive insights
   */
  private generateLongAnswer(text: string, nlpAnalysis?: any, confidenceScore?: any): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    let answer = sentences.slice(0, 4).join('. ').trim() + '.';
    
    // Add confidence information
    if (confidenceScore && confidenceScore.overall) {
      answer += ` Confidence level: ${Math.round(confidenceScore.overall * 100)}%.`;
    }
    
    // Add entity information
    if (nlpAnalysis && nlpAnalysis.entities && nlpAnalysis.entities.length > 0) {
      const entities = nlpAnalysis.entities.slice(0, 3).map((e: any) => e.text).join(', ');
      answer += ` Key entities: ${entities}.`;
    }
    
    // Add relationship information
    if (nlpAnalysis && nlpAnalysis.relationships && nlpAnalysis.relationships.length > 0) {
      const relationship = nlpAnalysis.relationships[0];
      answer += ` Relationship: ${relationship.subject} ${relationship.predicate} ${relationship.object}.`;
    }
    
    return answer;
  }

  /**
   * 10-20 minutes: Generate TL;DR + 3-card variants (Legacy method for compatibility)
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
   * Generate short answer
   */
  private generateShortAnswer(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences[0]?.trim() + '.' || 'Information not available.';
  }

  /**
   * Detect disambiguation
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
   * Generate FAQ
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

  /**
   * Generate translations
   */
  private async generateTranslations(text: string): Promise<{ [key: string]: string }> {
    console.log('🌐 Generating translations...');
    
    // Simple translation simulation (would use actual translation API)
    return {
      hi: `हिंदी अनुवाद: ${text}`,
      ta: `தமிழ் மொழிபெயர்ப்பு: ${text}`
    };
  }

  /**
   * Extract answer from text
   */
  private extractAnswer(text: string, keyword: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.toLowerCase().includes(keyword));
    return sentences[0]?.trim() + '.' || 'Information not available.';
  }

  /**
   * Calculate freshness
   */
  private calculateFreshness(sources: Source[]): number {
    const now = new Date();
    const oldestSource = sources.reduce((oldest, source) => {
      const sourceDate = new Date(source.last_updated);
      return sourceDate < oldest ? sourceDate : oldest;
    }, now);
    return Math.floor((now.getTime() - oldestSource.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate coverage
   */
  private calculateCoverage(facts: { [key: string]: string }): number {
    const expectedFacts = ['office', 'residence', 'formation_date', 'current_holder'];
    const foundFacts = Object.keys(facts).filter(fact => expectedFacts.includes(fact)).length;
    return Math.round((foundFacts / expectedFacts.length) * 100);
  }

  /**
   * Get category emoji
   */
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
      'General': '📋',
      'PERSON': '👤',
      'ORGANIZATION': '🏢',
      'LOCATION': '📍',
      'DATE': '📅',
      'NUMBER': '🔢',
      'TECHNOLOGY': '💻',
      'SCIENCE': '🔬'
    };
    return emojis[category] || '📋';
  }

  /**
   * 20-30 minutes: Entity & fact extraction (Legacy method for compatibility)
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
   * 30-40 minutes: Cross-source verification & confidence scoring (Legacy method for compatibility)
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
   * 55-60 minutes: QA checks & packaging (Legacy method for compatibility)
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
    const coveragePercentage = this.calculateCoverage(facts.reduce((acc, fact) => ({ ...acc, [fact.fact]: fact.value }), {}));
    
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

  /**
   * Extract facts for category
   */
  private extractFactsForCategory(facts: Fact[], category: string): { [key: string]: string } {
    const categoryFacts: { [key: string]: string } = {};
    facts.forEach(fact => {
      categoryFacts[fact.fact] = fact.value;
    });
    return categoryFacts;
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