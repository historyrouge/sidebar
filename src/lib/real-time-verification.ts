/**
 * Real-time Fact Verification Against Multiple Sources
 * Live verification system with conflict detection and resolution
 */

import TrainingDataManager from './training-data';
import AdvancedNLPProcessor from './advanced-nlp';
import KnowledgeGraphManager from './knowledge-graph';
import MultiSourceAPIManager from './multi-source-apis';
import ConfidenceScoringEngine from './confidence-scoring';

export interface VerificationResult {
  fact: string;
  verified: boolean;
  confidence: number;
  sources: VerificationSource[];
  conflicts: FactConflict[];
  resolution: ConflictResolution;
  timestamp: string;
  verification_method: string;
}

export interface VerificationSource {
  name: string;
  url: string;
  content: string;
  confidence: number;
  last_updated: string;
  authority_score: number;
}

export interface FactConflict {
  fact: string;
  conflicting_sources: string[];
  conflict_type: 'temporal' | 'semantic' | 'numerical' | 'categorical';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ConflictResolution {
  resolved: boolean;
  resolution_method: 'majority_vote' | 'authority_preference' | 'temporal_recency' | 'semantic_analysis' | 'manual_review';
  final_value: string;
  confidence: number;
  explanation: string;
}

export interface VerificationSession {
  session_id: string;
  query: string;
  domain: string;
  start_time: string;
  end_time?: string;
  results: VerificationResult[];
  overall_confidence: number;
  status: 'running' | 'completed' | 'failed';
}

export class RealTimeVerificationEngine {
  private static readonly VERIFICATION_TIMEOUT = 30000; // 30 seconds
  private static readonly MAX_CONCURRENT_VERIFICATIONS = 10;
  private static readonly CONFLICT_RESOLUTION_METHODS = [
    'majority_vote',
    'authority_preference',
    'temporal_recency',
    'semantic_analysis',
    'manual_review'
  ];

  private static readonly ACTIVE_SESSIONS = new Map<string, VerificationSession>();

  /**
   * Start real-time verification session
   */
  static async startVerificationSession(
    query: string,
    domain: string,
    facts: { [key: string]: string }
  ): Promise<VerificationSession> {
    const sessionId = this.generateSessionId();
    const session: VerificationSession = {
      session_id: sessionId,
      query,
      domain,
      start_time: new Date().toISOString(),
      results: [],
      overall_confidence: 0,
      status: 'running'
    };

    this.ACTIVE_SESSIONS.set(sessionId, session);

    console.log(`🔍 Starting verification session: ${sessionId} for query: ${query}`);

    try {
      // Verify each fact in parallel
      const verificationPromises = Object.entries(facts).map(([factType, factValue]) =>
        this.verifyFact(factType, factValue, domain, sessionId)
      );

      const results = await Promise.allSettled(verificationPromises);
      
      // Process results
      for (const result of results) {
        if (result.status === 'fulfilled') {
          session.results.push(result.value);
        } else {
          console.error('Fact verification failed:', result.reason);
        }
      }

      // Calculate overall confidence
      session.overall_confidence = this.calculateOverallConfidence(session.results);
      session.end_time = new Date().toISOString();
      session.status = 'completed';

    } catch (error) {
      console.error('Verification session failed:', error);
      session.status = 'failed';
      session.end_time = new Date().toISOString();
    }

    return session;
  }

  /**
   * Verify a single fact against multiple sources
   */
  static async verifyFact(
    factType: string,
    factValue: string,
    domain: string,
    sessionId: string
  ): Promise<VerificationResult> {
    console.log(`🔍 Verifying fact: ${factType} = ${factValue}`);

    const startTime = Date.now();
    const sources: VerificationSource[] = [];
    const conflicts: FactConflict[] = [];

    try {
      // Fetch from multiple sources
      const sourceResponses = await MultiSourceAPIManager.fetchFromMultipleSources(
        `${factType} ${factValue}`,
        domain,
        5
      );

      // Convert to verification sources
      for (const response of sourceResponses) {
        if (response.content && response.content.length > 50) {
          sources.push({
            name: response.source,
            url: response.metadata.url || '',
            content: response.content,
            confidence: response.metadata.confidence,
            last_updated: response.metadata.last_updated || new Date().toISOString(),
            authority_score: this.calculateAuthorityScore(response.source, domain)
          });
        }
      }

      // Check for conflicts
      const detectedConflicts = await this.detectConflicts(factValue, sources, factType);
      conflicts.push(...detectedConflicts);

      // Resolve conflicts
      const resolution = await this.resolveConflicts(factValue, conflicts, sources, domain);

      // Calculate overall confidence
      const confidence = await this.calculateFactConfidence(factValue, sources, conflicts, resolution);

      const verificationResult: VerificationResult = {
        fact: `${factType}: ${factValue}`,
        verified: resolution.resolved && confidence > 0.6,
        confidence,
        sources,
        conflicts,
        resolution,
        timestamp: new Date().toISOString(),
        verification_method: this.determineVerificationMethod(sources, conflicts)
      };

      const endTime = Date.now();
      console.log(`✅ Fact verification completed in ${endTime - startTime}ms`);

      return verificationResult;

    } catch (error) {
      console.error('Fact verification error:', error);
      return {
        fact: `${factType}: ${factValue}`,
        verified: false,
        confidence: 0,
        sources: [],
        conflicts: [],
        resolution: {
          resolved: false,
          resolution_method: 'manual_review',
          final_value: factValue,
          confidence: 0,
          explanation: 'Verification failed due to error'
        },
        timestamp: new Date().toISOString(),
        verification_method: 'error'
      };
    }
  }

  /**
   * Detect conflicts between sources
   */
  private static async detectConflicts(
    factValue: string,
    sources: VerificationSource[],
    factType: string
  ): Promise<FactConflict[]> {
    const conflicts: FactConflict[] = [];

    // Check for direct contradictions
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const conflict = await this.compareSources(sources[i], sources[j], factValue, factType);
        if (conflict) {
          conflicts.push(conflict);
        }
      }
    }

    // Check for temporal conflicts
    const temporalConflicts = await this.detectTemporalConflicts(sources, factType);
    conflicts.push(...temporalConflicts);

    // Check for semantic conflicts
    const semanticConflicts = await this.detectSemanticConflicts(sources, factValue);
    conflicts.push(...semanticConflicts);

    return conflicts;
  }

  /**
   * Compare two sources for conflicts
   */
  private static async compareSources(
    source1: VerificationSource,
    source2: VerificationSource,
    factValue: string,
    factType: string
  ): Promise<FactConflict | null> {
    const content1 = source1.content.toLowerCase();
    const content2 = source2.content.toLowerCase();

    // Check for direct contradictions
    if (this.hasDirectContradiction(content1, content2, factValue)) {
      return {
        fact: factValue,
        conflicting_sources: [source1.name, source2.name],
        conflict_type: 'categorical',
        severity: 'high',
        description: `Direct contradiction between ${source1.name} and ${source2.name}`
      };
    }

    // Check for numerical conflicts
    const numericalConflict = this.detectNumericalConflict(content1, content2, factType);
    if (numericalConflict) {
      return {
        fact: factValue,
        conflicting_sources: [source1.name, source2.name],
        conflict_type: 'numerical',
        severity: 'medium',
        description: `Numerical discrepancy between ${source1.name} and ${source2.name}`
      };
    }

    return null;
  }

  /**
   * Detect temporal conflicts
   */
  private static async detectTemporalConflicts(
    sources: VerificationSource[],
    factType: string
  ): Promise<FactConflict[]> {
    const conflicts: FactConflict[] = [];

    // Check for outdated information
    const now = new Date();
    const outdatedSources = sources.filter(source => {
      const lastUpdated = new Date(source.last_updated);
      const daysDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 365; // More than a year old
    });

    if (outdatedSources.length > 0 && sources.length > outdatedSources.length) {
      conflicts.push({
        fact: factType,
        conflicting_sources: outdatedSources.map(s => s.name),
        conflict_type: 'temporal',
        severity: 'medium',
        description: 'Outdated information detected in some sources'
      });
    }

    return conflicts;
  }

  /**
   * Detect semantic conflicts
   */
  private static async detectSemanticConflicts(
    sources: VerificationSource[],
    factValue: string
  ): Promise<FactConflict[]> {
    const conflicts: FactConflict[] = [];

    // Analyze sentiment and bias
    for (let i = 0; i < sources.length; i++) {
      for (let j = i + 1; j < sources.length; j++) {
        const sentiment1 = AdvancedNLPProcessor.analyzeSentiment(sources[i].content);
        const sentiment2 = AdvancedNLPProcessor.analyzeSentiment(sources[j].content);

        // Check for sentiment conflicts
        if (sentiment1.sentiment !== sentiment2.sentiment && 
            Math.abs(sentiment1.confidence - sentiment2.confidence) > 0.3) {
          conflicts.push({
            fact: factValue,
            conflicting_sources: [sources[i].name, sources[j].name],
            conflict_type: 'semantic',
            severity: 'low',
            description: 'Different sentiment analysis results'
          });
        }
      }
    }

    return conflicts;
  }

  /**
   * Resolve conflicts between sources
   */
  private static async resolveConflicts(
    factValue: string,
    conflicts: FactConflict[],
    sources: VerificationSource[],
    domain: string
  ): Promise<ConflictResolution> {
    if (conflicts.length === 0) {
      return {
        resolved: true,
        resolution_method: 'majority_vote',
        final_value: factValue,
        confidence: 0.9,
        explanation: 'No conflicts detected'
      };
    }

    // Try different resolution methods
    const resolutionMethods = this.CONFLICT_RESOLUTION_METHODS;
    
    for (const method of resolutionMethods) {
      const resolution = await this.applyResolutionMethod(method, factValue, conflicts, sources, domain);
      if (resolution.resolved) {
        return resolution;
      }
    }

    // If all methods fail, return unresolved
    return {
      resolved: false,
      resolution_method: 'manual_review',
      final_value: factValue,
      confidence: 0.3,
      explanation: 'Conflicts require manual review'
    };
  }

  /**
   * Apply specific resolution method
   */
  private static async applyResolutionMethod(
    method: string,
    factValue: string,
    conflicts: FactConflict[],
    sources: VerificationSource[],
    domain: string
  ): Promise<ConflictResolution> {
    switch (method) {
      case 'majority_vote':
        return this.resolveByMajorityVote(factValue, sources);
      
      case 'authority_preference':
        return this.resolveByAuthorityPreference(factValue, sources, domain);
      
      case 'temporal_recency':
        return this.resolveByTemporalRecency(factValue, sources);
      
      case 'semantic_analysis':
        return this.resolveBySemanticAnalysis(factValue, sources);
      
      default:
        return {
          resolved: false,
          resolution_method: method,
          final_value: factValue,
          confidence: 0.5,
          explanation: `Resolution method ${method} not implemented`
        };
    }
  }

  /**
   * Resolve by majority vote
   */
  private static resolveByMajorityVote(
    factValue: string,
    sources: VerificationSource[]
  ): ConflictResolution {
    const valueCounts = new Map<string, number>();
    
    for (const source of sources) {
      const value = this.extractValueFromContent(source.content, factValue);
      if (value) {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      }
    }

    if (valueCounts.size === 0) {
      return {
        resolved: false,
        resolution_method: 'majority_vote',
        final_value: factValue,
        confidence: 0.3,
        explanation: 'No clear majority found'
      };
    }

    const sortedValues = Array.from(valueCounts.entries()).sort((a, b) => b[1] - a[1]);
    const [mostCommonValue, count] = sortedValues[0];
    const confidence = count / sources.length;

    return {
      resolved: confidence > 0.5,
      resolution_method: 'majority_vote',
      final_value: mostCommonValue,
      confidence,
      explanation: `${mostCommonValue} found in ${count} out of ${sources.length} sources`
    };
  }

  /**
   * Resolve by authority preference
   */
  private static resolveByAuthorityPreference(
    factValue: string,
    sources: VerificationSource[],
    domain: string
  ): ConflictResolution {
    const domainKnowledge = TrainingDataManager.getDomainKnowledge(domain);
    const authoritySources = domainKnowledge?.authority_sources || [];

    // Sort sources by authority score
    const sortedSources = sources.sort((a, b) => b.authority_score - a.authority_score);
    
    if (sortedSources.length === 0) {
      return {
        resolved: false,
        resolution_method: 'authority_preference',
        final_value: factValue,
        confidence: 0.3,
        explanation: 'No authoritative sources available'
      };
    }

    const topSource = sortedSources[0];
    const value = this.extractValueFromContent(topSource.content, factValue);

    return {
      resolved: !!value,
      resolution_method: 'authority_preference',
      final_value: value || factValue,
      confidence: topSource.authority_score,
      explanation: `Resolved using most authoritative source: ${topSource.name}`
    };
  }

  /**
   * Resolve by temporal recency
   */
  private static resolveByTemporalRecency(
    factValue: string,
    sources: VerificationSource[]
  ): ConflictResolution {
    // Sort sources by recency
    const sortedSources = sources.sort((a, b) => 
      new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );

    if (sortedSources.length === 0) {
      return {
        resolved: false,
        resolution_method: 'temporal_recency',
        final_value: factValue,
        confidence: 0.3,
        explanation: 'No sources available'
      };
    }

    const mostRecentSource = sortedSources[0];
    const value = this.extractValueFromContent(mostRecentSource.content, factValue);

    return {
      resolved: !!value,
      resolution_method: 'temporal_recency',
      final_value: value || factValue,
      confidence: 0.8,
      explanation: `Resolved using most recent source: ${mostRecentSource.name}`
    };
  }

  /**
   * Resolve by semantic analysis
   */
  private static resolveBySemanticAnalysis(
    factValue: string,
    sources: VerificationSource[]
  ): ConflictResolution {
    // Analyze semantic consistency
    let bestSource = sources[0];
    let bestScore = 0;

    for (const source of sources) {
      const semanticAnalysis = AdvancedNLPProcessor.analyzeSemantics(source.content);
      const score = semanticAnalysis.concepts.length + semanticAnalysis.keywords.length;
      
      if (score > bestScore) {
        bestScore = score;
        bestSource = source;
      }
    }

    const value = this.extractValueFromContent(bestSource.content, factValue);

    return {
      resolved: !!value,
      resolution_method: 'semantic_analysis',
      final_value: value || factValue,
      confidence: 0.7,
      explanation: `Resolved using semantic analysis of ${bestSource.name}`
    };
  }

  /**
   * Calculate authority score for source
   */
  private static calculateAuthorityScore(sourceName: string, domain: string): number {
    const domainKnowledge = TrainingDataManager.getDomainKnowledge(domain);
    const authoritySources = domainKnowledge?.authority_sources || [];
    const confidenceFactors = domainKnowledge?.confidence_factors || {};

    // Check if source is in authority list
    for (const authSource of authoritySources) {
      if (sourceName.toLowerCase().includes(authSource.toLowerCase())) {
        return confidenceFactors[authSource] || 0.9;
      }
    }

    // Default authority scores
    const defaultScores: { [key: string]: number } = {
      'wikipedia': 0.8,
      'britannica': 0.9,
      'government': 0.95,
      'pm india': 0.99,
      'scientific american': 0.85,
      'nature': 0.92,
      'techcrunch': 0.8,
      'bbc': 0.88,
      'reuters': 0.87,
      'world bank': 0.94
    };

    for (const [key, score] of Object.entries(defaultScores)) {
      if (sourceName.toLowerCase().includes(key)) {
        return score;
      }
    }

    return 0.5; // Default score
  }

  /**
   * Calculate overall confidence for verification session
   */
  private static calculateOverallConfidence(results: VerificationResult[]): number {
    if (results.length === 0) return 0;

    const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
    return totalConfidence / results.length;
  }

  /**
   * Calculate fact confidence
   */
  private static async calculateFactConfidence(
    factValue: string,
    sources: VerificationSource[],
    conflicts: FactConflict[],
    resolution: ConflictResolution
  ): Promise<number> {
    let confidence = 0.5; // Base confidence

    // Source count factor
    confidence += Math.min(0.3, sources.length * 0.05);

    // Authority score factor
    const avgAuthorityScore = sources.reduce((sum, source) => sum + source.authority_score, 0) / sources.length;
    confidence += avgAuthorityScore * 0.3;

    // Conflict penalty
    const conflictPenalty = conflicts.reduce((penalty, conflict) => {
      switch (conflict.severity) {
        case 'high': return penalty + 0.2;
        case 'medium': return penalty + 0.1;
        case 'low': return penalty + 0.05;
        default: return penalty;
      }
    }, 0);
    confidence -= conflictPenalty;

    // Resolution factor
    if (resolution.resolved) {
      confidence += 0.1;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Determine verification method
   */
  private static determineVerificationMethod(
    sources: VerificationSource[],
    conflicts: FactConflict[]
  ): string {
    if (conflicts.length === 0) {
      return 'single_source_verification';
    } else if (conflicts.length === 1) {
      return 'conflict_resolution';
    } else {
      return 'multi_source_verification';
    }
  }

  /**
   * Extract value from content
   */
  private static extractValueFromContent(content: string, factValue: string): string | null {
    // Simple extraction - look for the fact value in content
    if (content.toLowerCase().includes(factValue.toLowerCase())) {
      return factValue;
    }
    return null;
  }

  /**
   * Check for direct contradiction
   */
  private static hasDirectContradiction(content1: string, content2: string, factValue: string): boolean {
    // Simple contradiction detection
    const negationWords = ['not', 'no', 'never', 'none', 'neither', 'nor'];
    
    for (const negation of negationWords) {
      if ((content1.includes(negation) && content2.includes(factValue)) ||
          (content2.includes(negation) && content1.includes(factValue))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Detect numerical conflict
   */
  private static detectNumericalConflict(content1: string, content2: string, factType: string): boolean {
    // Extract numbers from content
    const numbers1 = content1.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
    const numbers2 = content2.match(/\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
    
    // Check for significant numerical differences
    for (const num1 of numbers1) {
      for (const num2 of numbers2) {
        const val1 = parseFloat(num1.replace(/,/g, ''));
        const val2 = parseFloat(num2.replace(/,/g, ''));
        
        if (val1 > 0 && val2 > 0 && Math.abs(val1 - val2) / Math.max(val1, val2) > 0.5) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Generate session ID
   */
  private static generateSessionId(): string {
    return `verification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active verification sessions
   */
  static getActiveSessions(): VerificationSession[] {
    return Array.from(this.ACTIVE_SESSIONS.values());
  }

  /**
   * Get verification session by ID
   */
  static getVerificationSession(sessionId: string): VerificationSession | undefined {
    return this.ACTIVE_SESSIONS.get(sessionId);
  }

  /**
   * Clean up completed sessions
   */
  static cleanupSessions(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    for (const [sessionId, session] of this.ACTIVE_SESSIONS.entries()) {
      if (session.status === 'completed' && new Date(session.end_time || session.start_time) < oneHourAgo) {
        this.ACTIVE_SESSIONS.delete(sessionId);
      }
    }
  }
}

export default RealTimeVerificationEngine;