/**
 * Comprehensive Training Data for Enhanced AI Agent
 * Domain-specific knowledge bases, patterns, and examples
 */

export interface TrainingExample {
  query: string;
  category: string;
  expected_facts: { [key: string]: string };
  confidence_threshold: number;
  sources: string[];
  disambiguation: string[];
  faq_examples: Array<{ q: string; a: string }>;
}

export interface DomainKnowledge {
  domain: string;
  keywords: string[];
  fact_patterns: { [key: string]: RegExp };
  authority_sources: string[];
  confidence_factors: { [key: string]: number };
}

export class TrainingDataManager {
  private static readonly DOMAIN_KNOWLEDGE: DomainKnowledge[] = [
    {
      domain: 'politics',
      keywords: ['pm', 'prime minister', 'president', 'government', 'minister', 'parliament', 'election', 'vote', 'party', 'political'],
      fact_patterns: {
        'office_holder': /(?:current|serving|incumbent)[:\s]+([^.,]+)/gi,
        'political_party': /(?:party|affiliation|member of)[:\s]+([^.,]+)/gi,
        'term_start': /(?:assumed office|took office|since)[:\s]+([^.,]+)/gi,
        'residence': /(?:residence|lives at|address)[:\s]+([^.,]+)/gi,
        'predecessor': /(?:preceded by|replaced|after)[:\s]+([^.,]+)/gi
      },
      authority_sources: ['wikipedia.org', 'pmindia.gov.in', 'presidentofindia.gov.in', 'parliament.gov.in'],
      confidence_factors: { 'official_site': 0.95, 'wikipedia': 0.9, 'news': 0.7, 'blog': 0.5 }
    },
    {
      domain: 'science',
      keywords: ['physics', 'chemistry', 'biology', 'mathematics', 'scientific', 'research', 'experiment', 'theory', 'law', 'formula'],
      fact_patterns: {
        'discovery_date': /(?:discovered|found|established)[:\s]+([^.,]+)/gi,
        'discoverer': /(?:discovered by|found by|created by)[:\s]+([^.,]+)/gi,
        'formula': /(?:formula|equation)[:\s]+([^.,]+)/gi,
        'application': /(?:used for|applied to|purpose)[:\s]+([^.,]+)/gi,
        'unit': /(?:measured in|unit)[:\s]+([^.,]+)/gi
      },
      authority_sources: ['wikipedia.org', 'britannica.com', 'scientificamerican.com', 'nature.com', 'science.org'],
      confidence_factors: { 'peer_reviewed': 0.95, 'encyclopedia': 0.9, 'educational': 0.8, 'news': 0.7 }
    },
    {
      domain: 'technology',
      keywords: ['ai', 'artificial intelligence', 'computer', 'software', 'programming', 'tech', 'startup', 'company', 'founder', 'ceo'],
      fact_patterns: {
        'founder': /(?:founded by|created by|founder)[:\s]+([^.,]+)/gi,
        'founded_date': /(?:founded|established|created)[:\s]+([^.,]+)/gi,
        'headquarters': /(?:headquarters|based in|located in)[:\s]+([^.,]+)/gi,
        'ceo': /(?:ceo|chief executive|leader)[:\s]+([^.,]+)/gi,
        'valuation': /(?:valued at|worth|valuation)[:\s]+([^.,]+)/gi
      },
      authority_sources: ['wikipedia.org', 'techcrunch.com', 'crunchbase.com', 'bloomberg.com', 'reuters.com'],
      confidence_factors: { 'official_site': 0.95, 'financial_news': 0.9, 'tech_news': 0.8, 'blog': 0.6 }
    },
    {
      domain: 'geography',
      keywords: ['country', 'city', 'capital', 'population', 'area', 'continent', 'border', 'climate', 'language', 'currency'],
      fact_patterns: {
        'capital': /(?:capital|seat of government)[:\s]+([^.,]+)/gi,
        'population': /(?:population|inhabitants|people)[:\s]+([^.,]+)/gi,
        'area': /(?:area|size|square)[:\s]+([^.,]+)/gi,
        'currency': /(?:currency|money)[:\s]+([^.,]+)/gi,
        'language': /(?:language|spoken)[:\s]+([^.,]+)/gi
      },
      authority_sources: ['wikipedia.org', 'britannica.com', 'cia.gov', 'worldbank.org', 'un.org'],
      confidence_factors: { 'government_data': 0.95, 'international_org': 0.9, 'encyclopedia': 0.8, 'news': 0.7 }
    },
    {
      domain: 'history',
      keywords: ['war', 'battle', 'ancient', 'medieval', 'revolution', 'independence', 'empire', 'dynasty', 'century', 'year'],
      fact_patterns: {
        'date': /(?:occurred|happened|took place)[:\s]+([^.,]+)/gi,
        'participants': /(?:fought by|between|involved)[:\s]+([^.,]+)/gi,
        'outcome': /(?:result|outcome|ended)[:\s]+([^.,]+)/gi,
        'significance': /(?:important|significant|impact)[:\s]+([^.,]+)/gi,
        'location': /(?:took place|occurred|happened)[:\s]+([^.,]+)/gi
      },
      authority_sources: ['wikipedia.org', 'britannica.com', 'history.com', 'nationalgeographic.com', 'smithsonianmag.com'],
      confidence_factors: { 'academic': 0.95, 'museum': 0.9, 'encyclopedia': 0.8, 'educational': 0.7 }
    }
  ];

  private static readonly TRAINING_EXAMPLES: TrainingExample[] = [
    {
      query: 'pm of india',
      category: 'politics',
      expected_facts: {
        'office_holder': 'Narendra Modi',
        'political_party': 'Bharatiya Janata Party (BJP)',
        'term_start': '2014',
        'residence': '7, Lok Kalyan Marg, New Delhi',
        'predecessor': 'Manmohan Singh'
      },
      confidence_threshold: 0.9,
      sources: ['wikipedia.org', 'pmindia.gov.in'],
      disambiguation: ['Politics', 'People', 'History'],
      faq_examples: [
        { q: 'Who is the current Prime Minister of India?', a: 'Narendra Modi is the current Prime Minister of India.' },
        { q: 'What political party does he belong to?', a: 'He belongs to the Bharatiya Janata Party (BJP).' },
        { q: 'When did he assume office?', a: 'He assumed office in 2014.' }
      ]
    },
    {
      query: 'python programming',
      category: 'technology',
      expected_facts: {
        'founder': 'Guido van Rossum',
        'founded_date': '1991',
        'headquarters': 'Python Software Foundation',
        'ceo': 'Guido van Rossum (Benevolent Dictator for Life)',
        'valuation': 'Open source'
      },
      confidence_threshold: 0.85,
      sources: ['wikipedia.org', 'python.org'],
      disambiguation: ['Computing', 'Biology', 'Mythology'],
      faq_examples: [
        { q: 'Who created Python?', a: 'Guido van Rossum created Python in 1991.' },
        { q: 'What type of language is Python?', a: 'Python is a high-level, interpreted programming language.' },
        { q: 'Is Python free to use?', a: 'Yes, Python is open source and free to use.' }
      ]
    },
    {
      query: 'newton laws of motion',
      category: 'science',
      expected_facts: {
        'discovery_date': '1687',
        'discoverer': 'Isaac Newton',
        'formula': 'F = ma',
        'application': 'Mechanics, Engineering, Physics',
        'unit': 'Newtons (N)'
      },
      confidence_threshold: 0.95,
      sources: ['wikipedia.org', 'britannica.com'],
      disambiguation: ['Physics', 'People', 'History'],
      faq_examples: [
        { q: 'What are Newton\'s three laws?', a: '1) Inertia, 2) F=ma, 3) Action-Reaction' },
        { q: 'When were they published?', a: 'Newton published his laws in 1687 in Principia.' },
        { q: 'What is the second law formula?', a: 'F = ma (Force equals mass times acceleration).' }
      ]
    },
    {
      query: 'openai founder',
      category: 'technology',
      expected_facts: {
        'founder': 'Sam Altman, Elon Musk, Greg Brockman',
        'founded_date': '2015',
        'headquarters': 'San Francisco, California',
        'ceo': 'Sam Altman',
        'valuation': '$80+ billion'
      },
      confidence_threshold: 0.9,
      sources: ['wikipedia.org', 'openai.com', 'techcrunch.com'],
      disambiguation: ['Technology', 'People', 'Business'],
      faq_examples: [
        { q: 'Who founded OpenAI?', a: 'OpenAI was founded by Sam Altman, Elon Musk, and Greg Brockman.' },
        { q: 'When was OpenAI founded?', a: 'OpenAI was founded in 2015.' },
        { q: 'Who is the current CEO?', a: 'Sam Altman is the current CEO of OpenAI.' }
      ]
    },
    {
      query: 'capital of india',
      category: 'geography',
      expected_facts: {
        'capital': 'New Delhi',
        'population': '32 million (metro area)',
        'area': '1,484 km²',
        'currency': 'Indian Rupee (INR)',
        'language': 'Hindi, English'
      },
      confidence_threshold: 0.95,
      sources: ['wikipedia.org', 'gov.in'],
      disambiguation: ['Geography', 'Politics', 'Culture'],
      faq_examples: [
        { q: 'What is the capital of India?', a: 'New Delhi is the capital of India.' },
        { q: 'What is the population of New Delhi?', a: 'The metro area has about 32 million people.' },
        { q: 'What languages are spoken?', a: 'Hindi and English are the main languages.' }
      ]
    }
  ];

  private static readonly NOISE_PATTERNS = [
    // HTML/CSS fragments
    /style[^>]*>/gi,
    /<[^>]*>/g,
    /border:\s*[^;]+;/gi,
    /position:\s*[^;]+;/gi,
    /display:\s*[^;]+;/gi,
    /margin:\s*[^;]+;/gi,
    /padding:\s*[^;]+;/gi,
    
    // Wikipedia metadata
    /Retrieved from https?:\/\/[^\s]+/gi,
    /From Wikipedia, the free encyclopedia/gi,
    /This article is about/gi,
    /For other uses, see/gi,
    /Jump to navigation/gi,
    /Jump to search/gi,
    
    // DuckDuckGo metadata
    /DuckDuckGo/gi,
    /Search Results/gi,
    /More results/gi,
    /See also/gi,
    
    // Common junk patterns
    /Q[A-Za-z0-9_]+here/gi,
    /Click here/gi,
    /Read more/gi,
    /Learn more/gi,
    /See more/gi,
    /View more/gi,
    
    // Date patterns that are often noise
    /^\d{1,2}\/\d{1,2}\/\d{4}$/g,
    /^\d{4}-\d{2}-\d{2}$/g,
    
    // Author bylines
    /By [A-Za-z\s]+$/gi,
    /Written by [A-Za-z\s]+$/gi,
    /Author: [A-Za-z\s]+$/gi,
    
    // Social media references
    /@[A-Za-z0-9_]+/gi,
    /#[A-Za-z0-9_]+/gi,
    /Follow us/gi,
    /Share this/gi,
    
    // Navigation elements
    /Home\s*>\s*/gi,
    /Back to/gi,
    /Previous/gi,
    /Next/gi,
    /Menu/gi,
    /Navigation/gi,
    
    // Advertisement patterns
    /Advertisement/gi,
    /Sponsored/gi,
    /Promoted/gi,
    /Buy now/gi,
    /Shop now/gi,
    
    // Technical metadata
    /Last updated/gi,
    /Last modified/gi,
    /Version [0-9.]+/gi,
    /Build [0-9.]+/gi,
    
    // Common website elements
    /Cookie policy/gi,
    /Privacy policy/gi,
    /Terms of service/gi,
    /Contact us/gi,
    /About us/gi,
    /Disclaimer/gi,
    
    // Empty or whitespace-only content
    /^\s*$/g,
    /^[\s\n\r\t]+$/g
  ];

  private static readonly QUALITY_INDICATORS = [
    // Positive indicators
    { pattern: /^[A-Z][^.!?]*[.!?]$/g, score: 0.3 }, // Complete sentence
    { pattern: /\b(?:is|are|was|were|has|have|had|will|would|can|could|should|must)\b/gi, score: 0.2 }, // Action verbs
    { pattern: /\b(?:the|a|an|this|that|these|those)\b/gi, score: 0.1 }, // Articles
    { pattern: /\b(?:and|or|but|so|because|although|however)\b/gi, score: 0.1 }, // Conjunctions
    { pattern: /\b(?:in|on|at|by|for|with|from|to|of)\b/gi, score: 0.1 }, // Prepositions
    
    // Negative indicators
    { pattern: /^[a-z]/g, score: -0.2 }, // Starts with lowercase
    { pattern: /[.!?]\s*[a-z]/g, score: -0.1 }, // Missing capitalization after sentence end
    { pattern: /\b(?:click|here|more|read|see|view|learn)\b/gi, score: -0.3 }, // Generic action words
    { pattern: /\b(?:this|that|these|those)\s+(?:article|page|site|website)\b/gi, score: -0.2 }, // Self-referential
    { pattern: /\b(?:http|www|\.com|\.org|\.net)\b/gi, score: -0.2 } // URLs
  ];

  static getDomainKnowledge(domain: string): DomainKnowledge | undefined {
    return this.DOMAIN_KNOWLEDGE.find(d => d.domain === domain);
  }

  static getAllDomains(): string[] {
    return this.DOMAIN_KNOWLEDGE.map(d => d.domain);
  }

  static getTrainingExamples(category?: string): TrainingExample[] {
    if (category) {
      return this.TRAINING_EXAMPLES.filter(ex => ex.category === category);
    }
    return this.TRAINING_EXAMPLES;
  }

  static getNoisePatterns(): RegExp[] {
    return this.NOISE_PATTERNS;
  }

  static getQualityIndicators(): Array<{ pattern: RegExp; score: number }> {
    return this.QUALITY_INDICATORS;
  }

  static calculateQualityScore(text: string): number {
    let score = 0;
    const indicators = this.getQualityIndicators();
    
    for (const indicator of indicators) {
      const matches = text.match(indicator.pattern);
      if (matches) {
        score += indicator.score * matches.length;
      }
    }
    
    // Normalize score to 0-1 range
    return Math.max(0, Math.min(1, score));
  }

  static cleanText(text: string): string {
    let cleaned = text;
    
    // Apply noise patterns
    for (const pattern of this.NOISE_PATTERNS) {
      cleaned = cleaned.replace(pattern, '');
    }
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove empty lines
    cleaned = cleaned.replace(/\n\s*\n/g, '\n');
    
    return cleaned;
  }

  static extractFacts(text: string, domain: string): { [key: string]: string } {
    const domainKnowledge = this.getDomainKnowledge(domain);
    if (!domainKnowledge) return {};
    
    const facts: { [key: string]: string } = {};
    
    for (const [factType, pattern] of Object.entries(domainKnowledge.fact_patterns)) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 0) {
        facts[factType] = matches[0][1].trim();
      }
    }
    
    return facts;
  }

  static getConfidenceFactors(domain: string): { [key: string]: number } {
    const domainKnowledge = this.getDomainKnowledge(domain);
    return domainKnowledge?.confidence_factors || {};
  }

  static getAuthoritySources(domain: string): string[] {
    const domainKnowledge = this.getDomainKnowledge(domain);
    return domainKnowledge?.authority_sources || [];
  }
}

export default TrainingDataManager;