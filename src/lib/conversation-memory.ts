import { Message } from '@/types';
import { StorageManager, localStorage } from './storage';

interface ConversationContext {
  id: string;
  userId: string;
  title: string;
  summary: string;
  topics: string[];
  entities: Record<string, any>;
  sentiment: 'positive' | 'negative' | 'neutral';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastActivity: string;
}

interface MemoryEntry {
  id: string;
  conversationId: string;
  content: string;
  importance: number; // 0-1 scale
  embedding?: number[];
  keywords: string[];
  timestamp: string;
  messageId: string;
}

interface PersonalityProfile {
  userId: string;
  preferences: {
    communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    complexity: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
  };
  behavior: {
    averageSessionLength: number;
    preferredTimeOfDay: string;
    commonQuestions: string[];
    successfulInteractions: number;
  };
  adaptations: {
    responseLength: 'short' | 'medium' | 'long';
    explanationDepth: number;
    examplePreference: boolean;
    codePreference: boolean;
  };
}

export class ConversationMemoryManager {
  private storage: StorageManager;
  private maxMemoryEntries = 1000;
  private importanceThreshold = 0.3;

  constructor() {
    this.storage = localStorage;
  }

  // Conversation Context Management
  async createConversation(userId: string, initialMessage: string): Promise<ConversationContext> {
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const context: ConversationContext = {
      id,
      userId,
      title: this.generateTitle(initialMessage),
      summary: '',
      topics: await this.extractTopics(initialMessage),
      entities: {},
      sentiment: 'neutral',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 1,
      lastActivity: new Date().toISOString(),
    };

    await this.storage.set(`conversation_${id}`, context);
    return context;
  }

  async updateConversation(conversationId: string, messages: Message[]): Promise<void> {
    const context = await this.storage.get<ConversationContext>(`conversation_${conversationId}`);
    if (!context) return;

    const recentMessages = messages.slice(-5); // Analyze last 5 messages
    const combinedText = recentMessages.map(m => m.content.text).join(' ');

    context.summary = await this.generateSummary(combinedText, context.summary);
    context.topics = await this.extractTopics(combinedText);
    context.entities = await this.extractEntities(combinedText);
    context.sentiment = await this.analyzeSentiment(combinedText);
    context.messageCount = messages.length;
    context.updatedAt = new Date().toISOString();
    context.lastActivity = new Date().toISOString();

    await this.storage.set(`conversation_${conversationId}`, context);
  }

  // Memory Entry Management
  async addMemoryEntry(
    conversationId: string,
    message: Message,
    importance?: number
  ): Promise<void> {
    const calculatedImportance = importance ?? await this.calculateImportance(message.content.text);
    
    if (calculatedImportance < this.importanceThreshold) return;

    const entry: MemoryEntry = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      content: message.content.text,
      importance: calculatedImportance,
      keywords: await this.extractKeywords(message.content.text),
      timestamp: new Date().toISOString(),
      messageId: message.id,
    };

    // Add embedding for semantic search (placeholder - would use actual embedding API)
    entry.embedding = await this.generateEmbedding(message.content.text);

    await this.storage.set(`memory_${entry.id}`, entry);
    await this.pruneMemory();
  }

  async searchMemory(query: string, conversationId?: string, limit = 10): Promise<MemoryEntry[]> {
    const allMemories = await this.getAllMemories(conversationId);
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Calculate semantic similarity
    const scoredMemories = allMemories.map(memory => ({
      ...memory,
      score: this.calculateSimilarity(queryEmbedding, memory.embedding || []),
    }));

    // Sort by relevance and importance
    return scoredMemories
      .sort((a, b) => (b.score * b.importance) - (a.score * a.importance))
      .slice(0, limit);
  }

  // Personality Profile Management
  async getPersonalityProfile(userId: string): Promise<PersonalityProfile | null> {
    return await this.storage.get<PersonalityProfile>(`personality_${userId}`);
  }

  async updatePersonalityProfile(userId: string, interactions: Message[]): Promise<void> {
    let profile = await this.getPersonalityProfile(userId);
    
    if (!profile) {
      profile = this.createDefaultProfile(userId);
    }

    // Analyze recent interactions to update profile
    const recentInteractions = interactions.slice(-20);
    
    // Update communication style based on user messages
    profile.preferences.communicationStyle = this.inferCommunicationStyle(recentInteractions);
    
    // Update learning style based on successful interactions
    profile.preferences.learningStyle = this.inferLearningStyle(recentInteractions);
    
    // Update complexity preference
    profile.preferences.complexity = this.inferComplexityPreference(recentInteractions);
    
    // Update behavior patterns
    profile.behavior.averageSessionLength = this.calculateAverageSessionLength(recentInteractions);
    profile.behavior.commonQuestions = this.extractCommonQuestions(recentInteractions);
    
    // Update adaptations
    profile.adaptations.responseLength = this.inferPreferredResponseLength(recentInteractions);
    profile.adaptations.explanationDepth = this.inferExplanationDepth(recentInteractions);

    await this.storage.set(`personality_${userId}`, profile);
  }

  // Context-Aware Response Generation
  async getContextForResponse(
    conversationId: string,
    currentMessage: string,
    userId: string
  ): Promise<{
    relevantMemories: MemoryEntry[];
    conversationContext: ConversationContext | null;
    personalityProfile: PersonalityProfile | null;
    suggestedTone: string;
    suggestedLength: string;
  }> {
    const [relevantMemories, conversationContext, personalityProfile] = await Promise.all([
      this.searchMemory(currentMessage, conversationId, 5),
      this.storage.get<ConversationContext>(`conversation_${conversationId}`),
      this.getPersonalityProfile(userId),
    ]);

    const suggestedTone = this.suggestTone(personalityProfile, conversationContext);
    const suggestedLength = this.suggestResponseLength(personalityProfile, currentMessage);

    return {
      relevantMemories,
      conversationContext,
      personalityProfile,
      suggestedTone,
      suggestedLength,
    };
  }

  // Private helper methods
  private generateTitle(message: string): string {
    const words = message.split(' ').slice(0, 6);
    return words.join(' ') + (message.split(' ').length > 6 ? '...' : '');
  }

  private async extractTopics(text: string): Promise<string[]> {
    // Simplified topic extraction - in production, use NLP service
    const commonTopics = [
      'programming', 'javascript', 'python', 'react', 'nodejs', 'database',
      'machine learning', 'ai', 'web development', 'mobile', 'design',
      'mathematics', 'science', 'business', 'education', 'health'
    ];

    const lowerText = text.toLowerCase();
    return commonTopics.filter(topic => lowerText.includes(topic));
  }

  private async extractEntities(text: string): Promise<Record<string, any>> {
    // Simplified entity extraction
    const entities: Record<string, any> = {};
    
    // Extract potential names (capitalized words)
    const names = text.match(/\b[A-Z][a-z]+\b/g) || [];
    if (names.length > 0) entities.names = [...new Set(names)];
    
    // Extract numbers
    const numbers = text.match(/\b\d+\b/g) || [];
    if (numbers.length > 0) entities.numbers = numbers;
    
    // Extract URLs
    const urls = text.match(/https?:\/\/[^\s]+/g) || [];
    if (urls.length > 0) entities.urls = urls;

    return entities;
  }

  private async analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
    // Simplified sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'helpful', 'thanks', 'perfect'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'wrong', 'error', 'problem'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private async generateSummary(newText: string, existingSummary: string): Promise<string> {
    // Simplified summary generation - in production, use AI service
    const maxLength = 200;
    const combined = existingSummary + ' ' + newText;
    
    if (combined.length <= maxLength) return combined;
    
    // Extract key sentences
    const sentences = combined.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const importantSentences = sentences
      .sort((a, b) => b.length - a.length)
      .slice(0, 3);
    
    return importantSentences.join('. ') + '.';
  }

  private async calculateImportance(text: string): Promise<number> {
    let importance = 0.5; // Base importance
    
    // Increase importance for questions
    if (text.includes('?')) importance += 0.2;
    
    // Increase importance for code
    if (text.includes('```') || text.includes('function') || text.includes('class')) {
      importance += 0.3;
    }
    
    // Increase importance for longer messages
    if (text.length > 100) importance += 0.1;
    if (text.length > 500) importance += 0.2;
    
    // Increase importance for certain keywords
    const importantKeywords = ['error', 'help', 'problem', 'solution', 'important', 'urgent'];
    const keywordCount = importantKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    importance += keywordCount * 0.1;
    
    return Math.min(1, importance);
  }

  private async extractKeywords(text: string): Promise<string[]> {
    // Simplified keyword extraction
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const stopWords = new Set(['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said']);
    const keywords = words.filter(word => !stopWords.has(word));
    
    // Count frequency and return top keywords
    const frequency: Record<string, number> = {};
    keywords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Simplified embedding generation - in production, use actual embedding API
    // This is a mock implementation
    const hash = this.simpleHash(text);
    const embedding = [];
    
    for (let i = 0; i < 384; i++) {
      embedding.push(Math.sin(hash + i) * Math.cos(hash * i));
    }
    
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  private calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private async getAllMemories(conversationId?: string): Promise<MemoryEntry[]> {
    const keys = await this.storage.keys();
    const memoryKeys = keys.filter(key => key.startsWith('memory_'));
    
    const memories = await Promise.all(
      memoryKeys.map(key => this.storage.get<MemoryEntry>(key))
    );
    
    const validMemories = memories.filter(Boolean) as MemoryEntry[];
    
    if (conversationId) {
      return validMemories.filter(memory => memory.conversationId === conversationId);
    }
    
    return validMemories;
  }

  private async pruneMemory(): Promise<void> {
    const memories = await this.getAllMemories();
    
    if (memories.length <= this.maxMemoryEntries) return;
    
    // Sort by importance and recency, keep the most important/recent ones
    const sortedMemories = memories.sort((a, b) => {
      const scoreA = a.importance * (1 + (Date.now() - new Date(a.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      const scoreB = b.importance * (1 + (Date.now() - new Date(b.timestamp).getTime()) / (1000 * 60 * 60 * 24));
      return scoreB - scoreA;
    });
    
    const toDelete = sortedMemories.slice(this.maxMemoryEntries);
    
    await Promise.all(
      toDelete.map(memory => this.storage.remove(`memory_${memory.id}`))
    );
  }

  private createDefaultProfile(userId: string): PersonalityProfile {
    return {
      userId,
      preferences: {
        communicationStyle: 'friendly',
        learningStyle: 'visual',
        complexity: 'intermediate',
        topics: [],
      },
      behavior: {
        averageSessionLength: 0,
        preferredTimeOfDay: 'any',
        commonQuestions: [],
        successfulInteractions: 0,
      },
      adaptations: {
        responseLength: 'medium',
        explanationDepth: 0.5,
        examplePreference: true,
        codePreference: false,
      },
    };
  }

  private inferCommunicationStyle(messages: Message[]): 'formal' | 'casual' | 'technical' | 'friendly' {
    const userMessages = messages.filter(m => m.role === 'user');
    const text = userMessages.map(m => m.content.text).join(' ').toLowerCase();
    
    if (text.includes('please') && text.includes('thank')) return 'formal';
    if (text.includes('function') || text.includes('algorithm')) return 'technical';
    if (text.includes('hey') || text.includes('cool')) return 'casual';
    return 'friendly';
  }

  private inferLearningStyle(messages: Message[]): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
    const userMessages = messages.filter(m => m.role === 'user');
    const text = userMessages.map(m => m.content.text).join(' ').toLowerCase();
    
    if (text.includes('show') || text.includes('diagram') || text.includes('chart')) return 'visual';
    if (text.includes('explain') || text.includes('tell me')) return 'auditory';
    if (text.includes('try') || text.includes('practice')) return 'kinesthetic';
    return 'reading';
  }

  private inferComplexityPreference(messages: Message[]): 'beginner' | 'intermediate' | 'advanced' {
    const userMessages = messages.filter(m => m.role === 'user');
    const text = userMessages.map(m => m.content.text).join(' ').toLowerCase();
    
    const beginnerKeywords = ['basic', 'simple', 'beginner', 'start', 'learn'];
    const advancedKeywords = ['advanced', 'complex', 'optimize', 'architecture', 'performance'];
    
    const beginnerCount = beginnerKeywords.filter(keyword => text.includes(keyword)).length;
    const advancedCount = advancedKeywords.filter(keyword => text.includes(keyword)).length;
    
    if (advancedCount > beginnerCount) return 'advanced';
    if (beginnerCount > 0) return 'beginner';
    return 'intermediate';
  }

  private calculateAverageSessionLength(messages: Message[]): number {
    if (messages.length === 0) return 0;
    
    const sessions: Message[][] = [];
    let currentSession: Message[] = [];
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const prevMessage = messages[i - 1];
      
      if (prevMessage) {
        const timeDiff = new Date(message.timestamp || '').getTime() - new Date(prevMessage.timestamp || '').getTime();
        if (timeDiff > 30 * 60 * 1000) { // 30 minutes gap = new session
          sessions.push(currentSession);
          currentSession = [message];
        } else {
          currentSession.push(message);
        }
      } else {
        currentSession.push(message);
      }
    }
    
    if (currentSession.length > 0) sessions.push(currentSession);
    
    const totalLength = sessions.reduce((sum, session) => sum + session.length, 0);
    return totalLength / sessions.length;
  }

  private extractCommonQuestions(messages: Message[]): string[] {
    const userQuestions = messages
      .filter(m => m.role === 'user' && m.content.text.includes('?'))
      .map(m => m.content.text);
    
    // Simple frequency analysis
    const questionFreq: Record<string, number> = {};
    userQuestions.forEach(question => {
      const normalized = question.toLowerCase().trim();
      questionFreq[normalized] = (questionFreq[normalized] || 0) + 1;
    });
    
    return Object.entries(questionFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([question]) => question);
  }

  private inferPreferredResponseLength(messages: Message[]): 'short' | 'medium' | 'long' {
    const userMessages = messages.filter(m => m.role === 'user');
    const avgLength = userMessages.reduce((sum, m) => sum + m.content.text.length, 0) / userMessages.length;
    
    if (avgLength < 50) return 'short';
    if (avgLength > 200) return 'long';
    return 'medium';
  }

  private inferExplanationDepth(messages: Message[]): number {
    const userMessages = messages.filter(m => m.role === 'user');
    const text = userMessages.map(m => m.content.text).join(' ').toLowerCase();
    
    const detailKeywords = ['detail', 'explain', 'why', 'how', 'example', 'step'];
    const detailCount = detailKeywords.filter(keyword => text.includes(keyword)).length;
    
    return Math.min(1, detailCount / 10);
  }

  private suggestTone(profile: PersonalityProfile | null, context: ConversationContext | null): string {
    if (!profile) return 'friendly';
    
    const style = profile.preferences.communicationStyle;
    const sentiment = context?.sentiment || 'neutral';
    
    if (sentiment === 'negative') return 'supportive';
    if (style === 'technical') return 'precise';
    if (style === 'formal') return 'professional';
    if (style === 'casual') return 'relaxed';
    
    return 'friendly';
  }

  private suggestResponseLength(profile: PersonalityProfile | null, message: string): string {
    if (!profile) return 'medium';
    
    const preferredLength = profile.adaptations.responseLength;
    const messageLength = message.length;
    
    // Adjust based on message complexity
    if (messageLength > 200 && preferredLength === 'short') return 'medium';
    if (messageLength < 50 && preferredLength === 'long') return 'medium';
    
    return preferredLength;
  }
}