/**
 * Advanced NLP Processing for Enhanced AI Agent
 * Entity recognition, sentiment analysis, and semantic understanding
 */

import TrainingDataManager from './training-data';

export interface Entity {
  text: string;
  label: string;
  confidence: number;
  start: number;
  end: number;
  wikipedia_url?: string;
  description?: string;
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions: { [emotion: string]: number };
}

export interface SemanticAnalysis {
  topics: string[];
  keywords: string[];
  concepts: string[];
  relationships: Array<{ subject: string; predicate: string; object: string; confidence: number }>;
}

export interface TextQuality {
  readability_score: number;
  complexity_level: 'basic' | 'intermediate' | 'advanced';
  coherence_score: number;
  fact_density: number;
  bias_indicators: string[];
}

export class AdvancedNLPProcessor {
  private static readonly ENTITY_PATTERNS = {
    PERSON: [
      /(?:Mr\.|Ms\.|Dr\.|Prof\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|was|are|were|has|have|had)\s+(?:a|an|the)/g,
      /(?:born|died|created|founded|discovered)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ],
    ORGANIZATION: [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:Inc\.|Corp\.|LLC|Ltd\.|Company|Corporation)/g,
      /(?:company|organization|institution|university|college)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:University|College|Institute|Academy)/g
    ],
    LOCATION: [
      /(?:in|at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+)/g,
      /(?:capital|city|country|state|province)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g
    ],
    DATE: [
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
      /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
      /\b\d{4}-\d{2}-\d{2}\b/g,
      /\b(?:in|since|during|on)\s+(\d{4})\b/g
    ],
    NUMBER: [
      /\b\d+(?:,\d{3})*(?:\.\d+)?\b/g,
      /\b(?:million|billion|trillion)\b/g,
      /\b\d+(?:st|nd|rd|th)\b/g
    ],
    TECHNOLOGY: [
      /\b(?:AI|artificial intelligence|machine learning|deep learning|neural network)\b/gi,
      /\b(?:API|application programming interface)\b/gi,
      /\b(?:HTML|CSS|JavaScript|Python|Java|C\+\+|SQL)\b/gi,
      /\b(?:blockchain|cryptocurrency|bitcoin|ethereum)\b/gi
    ],
    SCIENCE: [
      /\b(?:physics|chemistry|biology|mathematics|astronomy|geology)\b/gi,
      /\b(?:theory|hypothesis|experiment|research|study)\b/gi,
      /\b(?:molecule|atom|electron|proton|neutron)\b/gi,
      /\b(?:DNA|RNA|protein|enzyme|cell)\b/gi
    ]
  };

  private static readonly SENTIMENT_INDICATORS = {
    positive: [
      'excellent', 'amazing', 'outstanding', 'brilliant', 'fantastic', 'wonderful', 'great', 'good', 'best', 'superior',
      'innovative', 'revolutionary', 'breakthrough', 'successful', 'effective', 'efficient', 'powerful', 'advanced',
      'leading', 'pioneering', 'cutting-edge', 'state-of-the-art', 'world-class', 'top-tier', 'premium', 'quality'
    ],
    negative: [
      'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'bad', 'worst', 'inferior', 'failed', 'unsuccessful',
      'ineffective', 'inefficient', 'weak', 'outdated', 'obsolete', 'problematic', 'controversial', 'disputed',
      'limited', 'restricted', 'flawed', 'defective', 'broken', 'malfunctioning', 'unreliable', 'unstable'
    ],
    neutral: [
      'average', 'standard', 'typical', 'normal', 'regular', 'common', 'usual', 'ordinary', 'conventional',
      'traditional', 'established', 'accepted', 'recognized', 'known', 'familiar', 'standard', 'basic'
    ]
  };

  private static readonly EMOTION_INDICATORS = {
    joy: ['happy', 'joyful', 'excited', 'thrilled', 'delighted', 'pleased', 'satisfied', 'content'],
    anger: ['angry', 'furious', 'outraged', 'irritated', 'annoyed', 'frustrated', 'mad', 'upset'],
    fear: ['afraid', 'scared', 'terrified', 'worried', 'anxious', 'concerned', 'nervous', 'frightened'],
    sadness: ['sad', 'depressed', 'melancholy', 'grief', 'sorrow', 'disappointed', 'disheartened', 'dejected'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'bewildered', 'confused', 'puzzled'],
    disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated', 'offended', 'appalled', 'horrified']
  };

  private static readonly BIAS_INDICATORS = [
    // Political bias
    { pattern: /\b(?:liberal|conservative|left-wing|right-wing|progressive|traditional)\b/gi, type: 'political' },
    { pattern: /\b(?:democrat|republican|socialist|capitalist|communist|fascist)\b/gi, type: 'political' },
    
    // Gender bias
    { pattern: /\b(?:he|she|him|her|his|hers)\b/gi, type: 'gender' },
    { pattern: /\b(?:man|woman|male|female|guy|girl|boy|lady|gentleman)\b/gi, type: 'gender' },
    
    // Racial bias
    { pattern: /\b(?:white|black|asian|hispanic|latino|african|european|american)\b/gi, type: 'racial' },
    { pattern: /\b(?:caucasian|african-american|asian-american|native american)\b/gi, type: 'racial' },
    
    // Religious bias
    { pattern: /\b(?:christian|muslim|jewish|hindu|buddhist|atheist|agnostic)\b/gi, type: 'religious' },
    { pattern: /\b(?:church|mosque|synagogue|temple|cathedral)\b/gi, type: 'religious' },
    
    // Economic bias
    { pattern: /\b(?:rich|poor|wealthy|poverty|millionaire|billionaire)\b/gi, type: 'economic' },
    { pattern: /\b(?:elite|privileged|disadvantaged|underprivileged)\b/gi, type: 'economic' }
  ];

  /**
   * Extract entities from text using pattern matching and context analysis
   */
  static extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];
    const textLower = text.toLowerCase();
    
    for (const [label, patterns] of Object.entries(this.ENTITY_PATTERNS)) {
      for (const pattern of patterns) {
        const matches = [...text.matchAll(pattern)];
        for (const match of matches) {
          if (match.index !== undefined) {
            const entityText = match[1] || match[0];
            const confidence = this.calculateEntityConfidence(entityText, label, text);
            
            entities.push({
              text: entityText.trim(),
              label: label,
              confidence: confidence,
              start: match.index,
              end: match.index + entityText.length,
              wikipedia_url: this.generateWikipediaUrl(entityText, label),
              description: this.generateEntityDescription(entityText, label)
            });
          }
        }
      }
    }
    
    // Remove duplicates and sort by confidence
    const uniqueEntities = this.removeDuplicateEntities(entities);
    return uniqueEntities.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze sentiment and emotions in text
   */
  static analyzeSentiment(text: string): SentimentAnalysis {
    const words = text.toLowerCase().split(/\s+/);
    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;
    
    // Count sentiment indicators
    for (const word of words) {
      if (this.SENTIMENT_INDICATORS.positive.includes(word)) {
        positiveScore++;
      } else if (this.SENTIMENT_INDICATORS.negative.includes(word)) {
        negativeScore++;
      } else if (this.SENTIMENT_INDICATORS.neutral.includes(word)) {
        neutralScore++;
      }
    }
    
    // Calculate emotions
    const emotions: { [emotion: string]: number } = {};
    for (const [emotion, indicators] of Object.entries(this.EMOTION_INDICATORS)) {
      const emotionCount = words.filter(word => indicators.includes(word)).length;
      emotions[emotion] = emotionCount / words.length;
    }
    
    // Determine overall sentiment
    const totalScore = positiveScore + negativeScore + neutralScore;
    let sentiment: 'positive' | 'negative' | 'neutral';
    let confidence: number;
    
    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      sentiment = 'positive';
      confidence = positiveScore / totalScore;
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      sentiment = 'negative';
      confidence = negativeScore / totalScore;
    } else {
      sentiment = 'neutral';
      confidence = neutralScore / totalScore;
    }
    
    return {
      sentiment,
      confidence: Math.max(0.1, confidence), // Minimum confidence
      emotions
    };
  }

  /**
   * Perform semantic analysis to extract topics, keywords, and relationships
   */
  static analyzeSemantics(text: string): SemanticAnalysis {
    const words = text.toLowerCase().split(/\s+/);
    const topics: string[] = [];
    const keywords: string[] = [];
    const concepts: string[] = [];
    const relationships: Array<{ subject: string; predicate: string; object: string; confidence: number }> = [];
    
    // Extract topics based on domain knowledge
    const domains = TrainingDataManager.getAllDomains();
    for (const domain of domains) {
      const domainKnowledge = TrainingDataManager.getDomainKnowledge(domain);
      if (domainKnowledge) {
        const domainKeywords = domainKnowledge.keywords;
        const foundKeywords = domainKeywords.filter(keyword => 
          textLower.includes(keyword.toLowerCase())
        );
        if (foundKeywords.length > 0) {
          topics.push(domain);
          keywords.push(...foundKeywords);
        }
      }
    }
    
    // Extract concepts (important nouns and phrases)
    const conceptPatterns = [
      /\b(?:the|a|an)\s+([a-z]+(?:\s+[a-z]+)*)\b/gi,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
    ];
    
    for (const pattern of conceptPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const concept = match[1] || match[0];
        if (concept.length > 3 && !concepts.includes(concept)) {
          concepts.push(concept);
        }
      }
    }
    
    // Extract relationships using simple patterns
    const relationshipPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|was|are|were)\s+(?:a|an|the)?\s*([a-z]+(?:\s+[a-z]+)*)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:founded|created|discovered|invented)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:from|in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi
    ];
    
    for (const pattern of relationshipPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        relationships.push({
          subject: match[1],
          predicate: this.extractPredicate(match[0]),
          object: match[2],
          confidence: 0.7
        });
      }
    }
    
    return {
      topics: [...new Set(topics)],
      keywords: [...new Set(keywords)],
      concepts: [...new Set(concepts)],
      relationships
    };
  }

  /**
   * Analyze text quality and readability
   */
  static analyzeTextQuality(text: string): TextQuality {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);
    
    // Calculate readability score (simplified Flesch-Kincaid)
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const readabilityScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    // Determine complexity level
    let complexityLevel: 'basic' | 'intermediate' | 'advanced';
    if (readabilityScore >= 80) {
      complexityLevel = 'basic';
    } else if (readabilityScore >= 60) {
      complexityLevel = 'intermediate';
    } else {
      complexityLevel = 'advanced';
    }
    
    // Calculate coherence score
    const coherenceScore = this.calculateCoherence(text);
    
    // Calculate fact density
    const factDensity = this.calculateFactDensity(text);
    
    // Detect bias indicators
    const biasIndicators = this.detectBiasIndicators(text);
    
    return {
      readability_score: Math.max(0, Math.min(100, readabilityScore)),
      complexity_level: complexityLevel,
      coherence_score: coherenceScore,
      fact_density: factDensity,
      bias_indicators: biasIndicators
    };
  }

  // Helper methods
  private static calculateEntityConfidence(entityText: string, label: string, context: string): number {
    let confidence = 0.5; // Base confidence
    
    // Length factor
    if (entityText.length > 3) confidence += 0.1;
    if (entityText.length > 10) confidence += 0.1;
    
    // Capitalization factor
    if (entityText[0] === entityText[0].toUpperCase()) confidence += 0.1;
    
    // Context factor
    const contextWords = context.toLowerCase().split(/\s+/);
    const entityWords = entityText.toLowerCase().split(/\s+/);
    const contextMatches = entityWords.filter(word => contextWords.includes(word)).length;
    confidence += (contextMatches / entityWords.length) * 0.2;
    
    return Math.min(1, confidence);
  }

  private static generateWikipediaUrl(entityText: string, label: string): string {
    const encodedText = encodeURIComponent(entityText.replace(/\s+/g, '_'));
    return `https://en.wikipedia.org/wiki/${encodedText}`;
  }

  private static generateEntityDescription(entityText: string, label: string): string {
    const descriptions: { [key: string]: string } = {
      PERSON: 'A person mentioned in the text',
      ORGANIZATION: 'An organization or company',
      LOCATION: 'A geographical location',
      DATE: 'A specific date or time',
      NUMBER: 'A numerical value',
      TECHNOLOGY: 'A technology or technical term',
      SCIENCE: 'A scientific concept or term'
    };
    return descriptions[label] || 'An entity mentioned in the text';
  }

  private static removeDuplicateEntities(entities: Entity[]): Entity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = `${entity.text.toLowerCase()}_${entity.label}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private static extractPredicate(text: string): string {
    const predicates = ['is', 'was', 'are', 'were', 'founded', 'created', 'discovered', 'invented', 'from', 'in', 'at'];
    for (const predicate of predicates) {
      if (text.toLowerCase().includes(predicate)) {
        return predicate;
      }
    }
    return 'related to';
  }

  private static countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let totalSyllables = 0;
    
    for (const word of words) {
      // Simple syllable counting
      const vowels = word.match(/[aeiouy]+/g);
      if (vowels) {
        totalSyllables += vowels.length;
      } else {
        totalSyllables += 1; // At least one syllable per word
      }
    }
    
    return totalSyllables;
  }

  private static calculateCoherence(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return 1;
    
    let coherenceScore = 0;
    for (let i = 1; i < sentences.length; i++) {
      const prevWords = sentences[i - 1].toLowerCase().split(/\s+/);
      const currWords = sentences[i].toLowerCase().split(/\s+/);
      
      // Check for word overlap
      const overlap = prevWords.filter(word => currWords.includes(word)).length;
      coherenceScore += overlap / Math.max(prevWords.length, currWords.length);
    }
    
    return coherenceScore / (sentences.length - 1);
  }

  private static calculateFactDensity(text: string): number {
    const factIndicators = [
      /\b(?:is|was|are|were|has|have|had|will|would|can|could|should|must)\b/gi,
      /\b(?:according to|based on|research shows|studies indicate|data reveals)\b/gi,
      /\b(?:percent|%|million|billion|trillion|thousand)\b/gi,
      /\b(?:in|on|at|by|for|with|from|to|of)\b/gi
    ];
    
    let factCount = 0;
    for (const pattern of factIndicators) {
      const matches = text.match(pattern);
      if (matches) {
        factCount += matches.length;
      }
    }
    
    const wordCount = text.split(/\s+/).length;
    return factCount / wordCount;
  }

  private static detectBiasIndicators(text: string): string[] {
    const biasTypes: string[] = [];
    
    for (const indicator of this.BIAS_INDICATORS) {
      const matches = text.match(indicator.pattern);
      if (matches && matches.length > 0) {
        biasTypes.push(indicator.type);
      }
    }
    
    return [...new Set(biasTypes)];
  }
}

export default AdvancedNLPProcessor;