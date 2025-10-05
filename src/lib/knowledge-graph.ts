/**
 * Knowledge Graph Integration for Enhanced AI Agent
 * Fact verification, relationship mapping, and semantic understanding
 */

import TrainingDataManager from './training-data';
import AdvancedNLPProcessor from './advanced-nlp';

export interface KnowledgeNode {
  id: string;
  label: string;
  type: string;
  properties: { [key: string]: any };
  confidence: number;
  sources: string[];
  last_updated: string;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relationship: string;
  confidence: number;
  evidence: string[];
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  metadata: {
    total_nodes: number;
    total_edges: number;
    domains: string[];
    last_updated: string;
  };
}

export interface FactVerification {
  fact: string;
  verified: boolean;
  confidence: number;
  supporting_sources: string[];
  conflicting_sources: string[];
  verification_method: string;
}

export class KnowledgeGraphManager {
  private static readonly WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
  private static readonly WIKIPEDIA_API = 'https://en.wikipedia.org/api/rest_v1';
  private static readonly CONCEPTNET_API = 'https://api.conceptnet.io';
  
  private static readonly RELATIONSHIP_TYPES = [
    'is_a', 'part_of', 'located_in', 'founded_by', 'created_by', 'discovered_by',
    'born_in', 'died_in', 'works_for', 'studied_at', 'influenced_by', 'related_to',
    'similar_to', 'opposite_of', 'causes', 'prevents', 'used_for', 'made_of'
  ];

  private static readonly VERIFICATION_METHODS = [
    'cross_source_agreement',
    'authority_source_confirmation',
    'temporal_consistency',
    'logical_consistency',
    'semantic_validation',
    'pattern_matching'
  ];

  /**
   * Build knowledge graph from text content
   */
  static async buildKnowledgeGraph(text: string, domain: string): Promise<KnowledgeGraph> {
    console.log(`🧠 Building knowledge graph for domain: ${domain}`);
    
    const nodes: KnowledgeNode[] = [];
    const edges: KnowledgeEdge[] = [];
    
    // Extract entities using NLP
    const entities = AdvancedNLPProcessor.extractEntities(text);
    
    // Create nodes from entities
    for (const entity of entities) {
      const node = await this.createKnowledgeNode(entity, domain);
      if (node) {
        nodes.push(node);
      }
    }
    
    // Extract relationships
    const semanticAnalysis = AdvancedNLPProcessor.analyzeSemantics(text);
    for (const relationship of semanticAnalysis.relationships) {
      const edge = await this.createKnowledgeEdge(relationship, nodes);
      if (edge) {
        edges.push(edge);
      }
    }
    
    // Enrich with external knowledge
    const enrichedGraph = await this.enrichWithExternalKnowledge(nodes, edges, domain);
    
    return {
      nodes: enrichedGraph.nodes,
      edges: enrichedGraph.edges,
      metadata: {
        total_nodes: enrichedGraph.nodes.length,
        total_edges: enrichedGraph.edges.length,
        domains: [domain],
        last_updated: new Date().toISOString()
      }
    };
  }

  /**
   * Verify facts against knowledge graph and external sources
   */
  static async verifyFacts(facts: { [key: string]: string }, domain: string): Promise<FactVerification[]> {
    console.log(`🔍 Verifying facts for domain: ${domain}`);
    
    const verifications: FactVerification[] = [];
    
    for (const [factType, factValue] of Object.entries(facts)) {
      const verification = await this.verifySingleFact(factType, factValue, domain);
      verifications.push(verification);
    }
    
    return verifications;
  }

  /**
   * Find related concepts and entities
   */
  static async findRelatedConcepts(entity: string, domain: string, maxResults: number = 5): Promise<KnowledgeNode[]> {
    console.log(`🔗 Finding related concepts for: ${entity}`);
    
    const relatedNodes: KnowledgeNode[] = [];
    
    try {
      // Search Wikidata for the entity
      const wikidataResults = await this.searchWikidata(entity);
      
      for (const result of wikidataResults.slice(0, maxResults)) {
        const node = await this.createNodeFromWikidata(result);
        if (node) {
          relatedNodes.push(node);
        }
      }
      
      // Search Wikipedia for related articles
      const wikipediaResults = await this.searchWikipedia(entity);
      
      for (const result of wikipediaResults.slice(0, maxResults)) {
        const node = await this.createNodeFromWikipedia(result);
        if (node) {
          relatedNodes.push(node);
        }
      }
      
    } catch (error) {
      console.error('Error finding related concepts:', error);
    }
    
    return relatedNodes.slice(0, maxResults);
  }

  /**
   * Calculate semantic similarity between entities
   */
  static calculateSemanticSimilarity(entity1: string, entity2: string): number {
    // Simple similarity based on word overlap and domain knowledge
    const words1 = entity1.toLowerCase().split(/\s+/);
    const words2 = entity2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    const jaccardSimilarity = intersection.length / union.length;
    
    // Boost similarity for domain-specific terms
    const domains = TrainingDataManager.getAllDomains();
    let domainBoost = 0;
    
    for (const domain of domains) {
      const domainKnowledge = TrainingDataManager.getDomainKnowledge(domain);
      if (domainKnowledge) {
        const domainKeywords = domainKnowledge.keywords;
        const entity1DomainMatch = words1.some(word => domainKeywords.includes(word));
        const entity2DomainMatch = words2.some(word => domainKeywords.includes(word));
        
        if (entity1DomainMatch && entity2DomainMatch) {
          domainBoost += 0.2;
        }
      }
    }
    
    return Math.min(1, jaccardSimilarity + domainBoost);
  }

  /**
   * Generate knowledge graph insights
   */
  static generateInsights(graph: KnowledgeGraph): {
    key_concepts: string[];
    important_relationships: string[];
    knowledge_gaps: string[];
    confidence_distribution: { [range: string]: number };
  } {
    const keyConcepts = graph.nodes
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map(node => node.label);
    
    const importantRelationships = graph.edges
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
      .map(edge => `${edge.source} ${edge.relationship} ${edge.target}`);
    
    const knowledgeGaps = this.identifyKnowledgeGaps(graph);
    
    const confidenceDistribution = this.calculateConfidenceDistribution(graph);
    
    return {
      key_concepts: keyConcepts,
      important_relationships: importantRelationships,
      knowledge_gaps: knowledgeGaps,
      confidence_distribution: confidenceDistribution
    };
  }

  // Helper methods
  private static async createKnowledgeNode(entity: any, domain: string): Promise<KnowledgeNode | null> {
    try {
      const node: KnowledgeNode = {
        id: this.generateNodeId(entity.text),
        label: entity.text,
        type: entity.label,
        properties: {
          description: entity.description,
          wikipedia_url: entity.wikipedia_url,
          confidence: entity.confidence
        },
        confidence: entity.confidence,
        sources: ['text_extraction'],
        last_updated: new Date().toISOString()
      };
      
      // Enrich with domain-specific properties
      const domainKnowledge = TrainingDataManager.getDomainKnowledge(domain);
      if (domainKnowledge) {
        const factPatterns = domainKnowledge.fact_patterns;
        for (const [factType, pattern] of Object.entries(factPatterns)) {
          const matches = entity.text.match(pattern);
          if (matches) {
            node.properties[factType] = matches[1];
          }
        }
      }
      
      return node;
    } catch (error) {
      console.error('Error creating knowledge node:', error);
      return null;
    }
  }

  private static async createKnowledgeEdge(relationship: any, nodes: KnowledgeNode[]): Promise<KnowledgeEdge | null> {
    try {
      const sourceNode = nodes.find(n => n.label === relationship.subject);
      const targetNode = nodes.find(n => n.label === relationship.object);
      
      if (!sourceNode || !targetNode) {
        return null;
      }
      
      const edge: KnowledgeEdge = {
        source: sourceNode.id,
        target: targetNode.id,
        relationship: relationship.predicate,
        confidence: relationship.confidence,
        evidence: [`Text: ${relationship.subject} ${relationship.predicate} ${relationship.object}`]
      };
      
      return edge;
    } catch (error) {
      console.error('Error creating knowledge edge:', error);
      return null;
    }
  }

  private static async enrichWithExternalKnowledge(
    nodes: KnowledgeNode[], 
    edges: KnowledgeEdge[], 
    domain: string
  ): Promise<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> {
    console.log('🔍 Enriching with external knowledge...');
    
    const enrichedNodes = [...nodes];
    const enrichedEdges = [...edges];
    
    // Enrich nodes with Wikidata information
    for (const node of nodes) {
      try {
        const wikidataInfo = await this.getWikidataInfo(node.label);
        if (wikidataInfo) {
          node.properties = { ...node.properties, ...wikidataInfo };
          node.confidence = Math.min(1, node.confidence + 0.1);
          node.sources.push('wikidata');
        }
      } catch (error) {
        console.error(`Error enriching node ${node.label}:`, error);
      }
    }
    
    return { nodes: enrichedNodes, edges: enrichedEdges };
  }

  private static async verifySingleFact(factType: string, factValue: string, domain: string): Promise<FactVerification> {
    const verification: FactVerification = {
      fact: `${factType}: ${factValue}`,
      verified: false,
      confidence: 0,
      supporting_sources: [],
      conflicting_sources: [],
      verification_method: 'pattern_matching'
    };
    
    try {
      // Check against domain knowledge
      const domainKnowledge = TrainingDataManager.getDomainKnowledge(domain);
      if (domainKnowledge) {
        const factPatterns = domainKnowledge.fact_patterns;
        if (factPatterns[factType]) {
          const pattern = factPatterns[factType];
          const matches = factValue.match(pattern);
          if (matches) {
            verification.verified = true;
            verification.confidence += 0.3;
            verification.supporting_sources.push('domain_knowledge');
            verification.verification_method = 'pattern_matching';
          }
        }
      }
      
      // Check against authority sources
      const authoritySources = TrainingDataManager.getAuthoritySources(domain);
      for (const source of authoritySources) {
        try {
          const sourceData = await this.fetchFromSource(source, factValue);
          if (sourceData && sourceData.includes(factValue)) {
            verification.verified = true;
            verification.confidence += 0.2;
            verification.supporting_sources.push(source);
            verification.verification_method = 'authority_source_confirmation';
          }
        } catch (error) {
          console.error(`Error verifying with source ${source}:`, error);
        }
      }
      
      // Cross-source verification
      if (verification.supporting_sources.length > 1) {
        verification.confidence += 0.2;
        verification.verification_method = 'cross_source_agreement';
      }
      
      verification.confidence = Math.min(1, verification.confidence);
      
    } catch (error) {
      console.error('Error verifying fact:', error);
    }
    
    return verification;
  }

  private static async searchWikidata(query: string): Promise<any[]> {
    try {
      const url = `${this.WIKIDATA_API}?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      return data.search || [];
    } catch (error) {
      console.error('Error searching Wikidata:', error);
      return [];
    }
  }

  private static async searchWikipedia(query: string): Promise<any[]> {
    try {
      const url = `${this.WIKIPEDIA_API}/page/summary/${encodeURIComponent(query)}`;
      const response = await fetch(url);
      const data = await response.json();
      return data ? [data] : [];
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      return [];
    }
  }

  private static async createNodeFromWikidata(data: any): Promise<KnowledgeNode | null> {
    try {
      return {
        id: data.id || this.generateNodeId(data.label),
        label: data.label || data.display?.label?.value || 'Unknown',
        type: data.description || 'Entity',
        properties: {
          description: data.description,
          wikidata_id: data.id,
          aliases: data.aliases
        },
        confidence: 0.8,
        sources: ['wikidata'],
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating node from Wikidata:', error);
      return null;
    }
  }

  private static async createNodeFromWikipedia(data: any): Promise<KnowledgeNode | null> {
    try {
      return {
        id: this.generateNodeId(data.title),
        label: data.title,
        type: 'Wikipedia Article',
        properties: {
          description: data.extract,
          wikipedia_url: data.content_urls?.desktop?.page,
          thumbnail: data.thumbnail?.source
        },
        confidence: 0.7,
        sources: ['wikipedia'],
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating node from Wikipedia:', error);
      return null;
    }
  }

  private static async getWikidataInfo(entity: string): Promise<{ [key: string]: any } | null> {
    try {
      const searchResults = await this.searchWikidata(entity);
      if (searchResults.length > 0) {
        const entityId = searchResults[0].id;
        const url = `${this.WIKIDATA_API}?action=wbgetentities&ids=${entityId}&format=json`;
        const response = await fetch(url);
        const data = await response.json();
        return data.entities?.[entityId] || null;
      }
    } catch (error) {
      console.error('Error getting Wikidata info:', error);
    }
    return null;
  }

  private static async fetchFromSource(source: string, query: string): Promise<string | null> {
    try {
      // This would integrate with actual source APIs
      // For now, return a mock response
      return `Mock data for ${query} from ${source}`;
    } catch (error) {
      console.error(`Error fetching from source ${source}:`, error);
      return null;
    }
  }

  private static generateNodeId(label: string): string {
    return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  private static identifyKnowledgeGaps(graph: KnowledgeGraph): string[] {
    const gaps: string[] = [];
    
    // Find nodes with low confidence
    const lowConfidenceNodes = graph.nodes.filter(node => node.confidence < 0.5);
    if (lowConfidenceNodes.length > 0) {
      gaps.push(`Low confidence entities: ${lowConfidenceNodes.map(n => n.label).join(', ')}`);
    }
    
    // Find isolated nodes (no connections)
    const connectedNodes = new Set(graph.edges.flatMap(edge => [edge.source, edge.target]));
    const isolatedNodes = graph.nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0) {
      gaps.push(`Isolated entities: ${isolatedNodes.map(n => n.label).join(', ')}`);
    }
    
    // Find missing relationships
    const expectedRelationships = ['is_a', 'part_of', 'located_in', 'founded_by'];
    const existingRelationships = new Set(graph.edges.map(edge => edge.relationship));
    const missingRelationships = expectedRelationships.filter(rel => !existingRelationships.has(rel));
    if (missingRelationships.length > 0) {
      gaps.push(`Missing relationship types: ${missingRelationships.join(', ')}`);
    }
    
    return gaps;
  }

  private static calculateConfidenceDistribution(graph: KnowledgeGraph): { [range: string]: number } {
    const distribution: { [range: string]: number } = {
      '0.0-0.2': 0,
      '0.2-0.4': 0,
      '0.4-0.6': 0,
      '0.6-0.8': 0,
      '0.8-1.0': 0
    };
    
    for (const node of graph.nodes) {
      if (node.confidence >= 0.8) {
        distribution['0.8-1.0']++;
      } else if (node.confidence >= 0.6) {
        distribution['0.6-0.8']++;
      } else if (node.confidence >= 0.4) {
        distribution['0.4-0.6']++;
      } else if (node.confidence >= 0.2) {
        distribution['0.2-0.4']++;
      } else {
        distribution['0.0-0.2']++;
      }
    }
    
    return distribution;
  }
}

export default KnowledgeGraphManager;