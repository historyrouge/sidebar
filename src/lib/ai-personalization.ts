import { StorageManager, localStorage } from './storage';
import { AnalyticsManager } from './analytics';

export interface LearningProfile {
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  knowledgeLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  strengths: string[];
  weaknesses: string[];
  goals: string[];
  preferredPace: 'slow' | 'medium' | 'fast';
  attentionSpan: number; // in minutes
  bestLearningTimes: string[]; // time slots like "morning", "afternoon"
  motivationFactors: string[];
  lastUpdated: string;
}

export interface AdaptiveContent {
  id: string;
  type: 'explanation' | 'example' | 'exercise' | 'quiz' | 'summary';
  difficulty: number; // 1-10 scale
  topic: string;
  content: string;
  metadata: {
    estimatedTime: number;
    prerequisites: string[];
    learningObjectives: string[];
    adaptationReason: string;
  };
}

export interface PersonalizationInsight {
  type: 'strength' | 'weakness' | 'preference' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-1 scale
  actionable: boolean;
  suggestions: string[];
  evidence: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number; // in hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: Array<{
    id: string;
    title: string;
    description: string;
    estimatedTime: number;
    prerequisites: string[];
    content: AdaptiveContent[];
    completed: boolean;
    score?: number;
  }>;
  progress: number; // 0-100 percentage
  adaptedFor: string; // user ID
  createdAt: string;
  updatedAt: string;
}

export class AIPersonalizationEngine {
  private storage: StorageManager;
  private analytics: AnalyticsManager;
  private learningProfiles: Map<string, LearningProfile> = new Map();

  constructor() {
    this.storage = localStorage;
    this.analytics = new AnalyticsManager();
  }

  // Learning Profile Management
  async createLearningProfile(userId: string, initialData?: Partial<LearningProfile>): Promise<LearningProfile> {
    const profile: LearningProfile = {
      userId,
      learningStyle: 'visual',
      knowledgeLevel: 'intermediate',
      interests: [],
      strengths: [],
      weaknesses: [],
      goals: [],
      preferredPace: 'medium',
      attentionSpan: 30,
      bestLearningTimes: ['morning'],
      motivationFactors: [],
      lastUpdated: new Date().toISOString(),
      ...initialData,
    };

    await this.storage.set(`learning_profile_${userId}`, profile);
    this.learningProfiles.set(userId, profile);
    
    return profile;
  }

  async getLearningProfile(userId: string): Promise<LearningProfile | null> {
    if (this.learningProfiles.has(userId)) {
      return this.learningProfiles.get(userId)!;
    }

    const profile = await this.storage.get<LearningProfile>(`learning_profile_${userId}`);
    if (profile) {
      this.learningProfiles.set(userId, profile);
    }
    
    return profile;
  }

  async updateLearningProfile(userId: string, updates: Partial<LearningProfile>): Promise<void> {
    const profile = await this.getLearningProfile(userId);
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    await this.storage.set(`learning_profile_${userId}`, updatedProfile);
    this.learningProfiles.set(userId, updatedProfile);
  }

  // Adaptive Content Generation
  async generateAdaptiveContent(
    userId: string,
    topic: string,
    contentType: AdaptiveContent['type'],
    context?: any
  ): Promise<AdaptiveContent> {
    const profile = await this.getLearningProfile(userId);
    if (!profile) {
      throw new Error('Learning profile not found');
    }

    const difficulty = this.calculateOptimalDifficulty(profile, topic);
    const adaptationReason = this.generateAdaptationReason(profile, contentType, difficulty);

    // This would typically call an AI service to generate content
    const content = await this.generateContentForProfile(profile, topic, contentType, difficulty);

    const adaptiveContent: AdaptiveContent = {
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: contentType,
      difficulty,
      topic,
      content,
      metadata: {
        estimatedTime: this.estimateContentTime(content, profile),
        prerequisites: this.identifyPrerequisites(topic, difficulty),
        learningObjectives: this.generateLearningObjectives(topic, contentType, difficulty),
        adaptationReason,
      },
    };

    return adaptiveContent;
  }

  private calculateOptimalDifficulty(profile: LearningProfile, topic: string): number {
    let baseDifficulty = 5; // Medium difficulty

    // Adjust based on knowledge level
    switch (profile.knowledgeLevel) {
      case 'beginner': baseDifficulty = 3; break;
      case 'intermediate': baseDifficulty = 5; break;
      case 'advanced': baseDifficulty = 7; break;
      case 'expert': baseDifficulty = 9; break;
    }

    // Adjust based on topic familiarity
    if (profile.strengths.includes(topic)) {
      baseDifficulty += 1;
    } else if (profile.weaknesses.includes(topic)) {
      baseDifficulty -= 1;
    }

    // Adjust based on recent performance
    // This would analyze recent quiz scores, completion rates, etc.

    return Math.max(1, Math.min(10, baseDifficulty));
  }

  private generateAdaptationReason(
    profile: LearningProfile,
    contentType: AdaptiveContent['type'],
    difficulty: number
  ): string {
    const reasons = [];

    if (profile.learningStyle === 'visual' && contentType === 'explanation') {
      reasons.push('includes visual elements for visual learner');
    }

    if (difficulty < 5) {
      reasons.push('simplified for current knowledge level');
    } else if (difficulty > 7) {
      reasons.push('enhanced complexity to match expertise');
    }

    if (profile.preferredPace === 'fast') {
      reasons.push('condensed format for fast-paced learning preference');
    }

    return reasons.join(', ') || 'personalized for your learning profile';
  }

  private async generateContentForProfile(
    profile: LearningProfile,
    topic: string,
    contentType: AdaptiveContent['type'],
    difficulty: number
  ): Promise<string> {
    // This would integrate with your AI service
    // For now, return a template-based response
    
    const templates = {
      explanation: this.generateExplanationTemplate(profile, topic, difficulty),
      example: this.generateExampleTemplate(profile, topic, difficulty),
      exercise: this.generateExerciseTemplate(profile, topic, difficulty),
      quiz: this.generateQuizTemplate(profile, topic, difficulty),
      summary: this.generateSummaryTemplate(profile, topic, difficulty),
    };

    return templates[contentType];
  }

  private generateExplanationTemplate(profile: LearningProfile, topic: string, difficulty: number): string {
    let explanation = `Let me explain ${topic} in a way that matches your ${profile.learningStyle} learning style.\n\n`;
    
    if (profile.learningStyle === 'visual') {
      explanation += "🎯 **Visual Overview:**\nImagine this concept as...\n\n";
    } else if (profile.learningStyle === 'auditory') {
      explanation += "🎵 **Listen and Learn:**\nThink of this like a conversation where...\n\n";
    }

    explanation += `**Core Concept** (Difficulty: ${difficulty}/10):\n`;
    explanation += `This concept is fundamental to understanding ${topic}...\n\n`;

    if (difficulty > 6) {
      explanation += "**Advanced Insights:**\nFor someone at your level, it's important to consider...\n\n";
    }

    return explanation;
  }

  private generateExampleTemplate(profile: LearningProfile, topic: string, difficulty: number): string {
    return `Here's a practical example of ${topic} tailored to your interests:\n\n` +
           `**Example:** (Adapted for ${profile.learningStyle} learners)\n` +
           `Let's say you're working on...\n\n` +
           `This demonstrates ${topic} because...`;
  }

  private generateExerciseTemplate(profile: LearningProfile, topic: string, difficulty: number): string {
    return `**Practice Exercise: ${topic}**\n\n` +
           `Difficulty: ${difficulty}/10 (Matched to your current level)\n\n` +
           `**Instructions:**\n` +
           `1. Review the concept\n` +
           `2. Apply it to this scenario\n` +
           `3. Check your understanding\n\n` +
           `**Your Task:**\n` +
           `Based on your learning profile, try to...`;
  }

  private generateQuizTemplate(profile: LearningProfile, topic: string, difficulty: number): string {
    return `**Quick Check: ${topic}**\n\n` +
           `This quiz is adapted to your ${profile.knowledgeLevel} level.\n\n` +
           `**Question 1:**\n` +
           `Based on what we've covered about ${topic}...\n\n` +
           `A) Option 1\n` +
           `B) Option 2\n` +
           `C) Option 3\n` +
           `D) Option 4`;
  }

  private generateSummaryTemplate(profile: LearningProfile, topic: string, difficulty: number): string {
    return `**Summary: ${topic}**\n\n` +
           `Here's what we covered, organized for your ${profile.learningStyle} learning style:\n\n` +
           `🎯 **Key Points:**\n` +
           `• Main concept 1\n` +
           `• Main concept 2\n` +
           `• Main concept 3\n\n` +
           `**Next Steps:**\n` +
           `Based on your goals, I recommend...`;
  }

  private estimateContentTime(content: string, profile: LearningProfile): number {
    const wordsPerMinute = profile.preferredPace === 'fast' ? 250 : 
                          profile.preferredPace === 'slow' ? 150 : 200;
    
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private identifyPrerequisites(topic: string, difficulty: number): string[] {
    // This would use a knowledge graph to identify prerequisites
    const prerequisites: Record<string, string[]> = {
      'advanced_calculus': ['basic_calculus', 'algebra', 'trigonometry'],
      'machine_learning': ['statistics', 'linear_algebra', 'programming'],
      'react_hooks': ['javascript', 'react_basics', 'functional_programming'],
    };

    return prerequisites[topic.toLowerCase().replace(/\s+/g, '_')] || [];
  }

  private generateLearningObjectives(topic: string, contentType: AdaptiveContent['type'], difficulty: number): string[] {
    const objectives = [];
    
    switch (contentType) {
      case 'explanation':
        objectives.push(`Understand the core concepts of ${topic}`);
        objectives.push(`Identify key components and relationships`);
        break;
      case 'example':
        objectives.push(`See practical applications of ${topic}`);
        objectives.push(`Connect theory to real-world scenarios`);
        break;
      case 'exercise':
        objectives.push(`Apply ${topic} concepts practically`);
        objectives.push(`Build confidence through hands-on practice`);
        break;
      case 'quiz':
        objectives.push(`Assess understanding of ${topic}`);
        objectives.push(`Identify areas for further study`);
        break;
      case 'summary':
        objectives.push(`Consolidate knowledge of ${topic}`);
        objectives.push(`Prepare for advanced topics`);
        break;
    }

    if (difficulty > 7) {
      objectives.push('Master advanced nuances and edge cases');
    }

    return objectives;
  }

  // Learning Path Generation
  async generatePersonalizedLearningPath(
    userId: string,
    goal: string,
    timeConstraint?: number
  ): Promise<LearningPath> {
    const profile = await this.getLearningProfile(userId);
    if (!profile) {
      throw new Error('Learning profile not found');
    }

    const topics = await this.identifyRequiredTopics(goal, profile);
    const orderedTopics = this.orderTopicsByDependency(topics, profile);
    
    const learningPath: LearningPath = {
      id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `Personalized Path: ${goal}`,
      description: `A learning path tailored to your ${profile.learningStyle} learning style and ${profile.knowledgeLevel} level`,
      estimatedDuration: this.calculatePathDuration(orderedTopics, profile),
      difficulty: this.determinePathDifficulty(orderedTopics, profile),
      topics: await this.generateTopicContent(orderedTopics, profile),
      progress: 0,
      adaptedFor: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.storage.set(`learning_path_${learningPath.id}`, learningPath);
    return learningPath;
  }

  private async identifyRequiredTopics(goal: string, profile: LearningProfile): Promise<string[]> {
    // This would use AI to analyze the goal and identify required topics
    const topicMaps: Record<string, string[]> = {
      'web_development': ['html', 'css', 'javascript', 'react', 'nodejs', 'databases'],
      'data_science': ['statistics', 'python', 'pandas', 'machine_learning', 'visualization'],
      'mobile_development': ['programming_basics', 'ui_design', 'api_integration', 'testing'],
    };

    const normalizedGoal = goal.toLowerCase().replace(/\s+/g, '_');
    return topicMaps[normalizedGoal] || [goal];
  }

  private orderTopicsByDependency(topics: string[], profile: LearningProfile): string[] {
    // Simple dependency ordering - in production, use a proper topological sort
    const dependencies: Record<string, string[]> = {
      'react': ['javascript', 'html', 'css'],
      'nodejs': ['javascript'],
      'machine_learning': ['statistics', 'python'],
      'databases': ['programming_basics'],
    };

    const ordered: string[] = [];
    const visited = new Set<string>();

    const visit = (topic: string) => {
      if (visited.has(topic)) return;
      visited.add(topic);

      const deps = dependencies[topic] || [];
      deps.forEach(dep => {
        if (topics.includes(dep)) {
          visit(dep);
        }
      });

      ordered.push(topic);
    };

    topics.forEach(topic => visit(topic));
    return ordered;
  }

  private calculatePathDuration(topics: string[], profile: LearningProfile): number {
    const baseHoursPerTopic = profile.preferredPace === 'fast' ? 2 : 
                             profile.preferredPace === 'slow' ? 6 : 4;
    
    return topics.length * baseHoursPerTopic;
  }

  private determinePathDifficulty(topics: string[], profile: LearningProfile): 'beginner' | 'intermediate' | 'advanced' {
    const advancedTopics = ['machine_learning', 'advanced_algorithms', 'system_design'];
    const hasAdvancedTopics = topics.some(topic => advancedTopics.includes(topic));
    
    if (hasAdvancedTopics || profile.knowledgeLevel === 'expert') return 'advanced';
    if (profile.knowledgeLevel === 'beginner') return 'beginner';
    return 'intermediate';
  }

  private async generateTopicContent(topics: string[], profile: LearningProfile): Promise<LearningPath['topics']> {
    const topicContent = [];

    for (const topic of topics) {
      const content = await Promise.all([
        this.generateAdaptiveContent(profile.userId, topic, 'explanation'),
        this.generateAdaptiveContent(profile.userId, topic, 'example'),
        this.generateAdaptiveContent(profile.userId, topic, 'exercise'),
        this.generateAdaptiveContent(profile.userId, topic, 'quiz'),
      ]);

      topicContent.push({
        id: `topic_${topic}_${Date.now()}`,
        title: this.formatTopicTitle(topic),
        description: `Learn ${topic} with personalized content`,
        estimatedTime: content.reduce((sum, c) => sum + c.metadata.estimatedTime, 0),
        prerequisites: this.identifyPrerequisites(topic, 5),
        content,
        completed: false,
      });
    }

    return topicContent;
  }

  private formatTopicTitle(topic: string): string {
    return topic.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Personalization Insights
  async generatePersonalizationInsights(userId: string): Promise<PersonalizationInsight[]> {
    const profile = await this.getLearningProfile(userId);
    if (!profile) return [];

    const behavior = await this.analytics.analyzeBehavior(userId);
    const insights: PersonalizationInsight[] = [];

    // Learning style insights
    if (profile.learningStyle === 'visual') {
      insights.push({
        type: 'preference',
        title: 'Visual Learning Preference',
        description: 'You learn best with visual aids, diagrams, and examples',
        confidence: 0.8,
        actionable: true,
        suggestions: [
          'Request more diagrams and visual explanations',
          'Use mind maps for complex topics',
          'Create visual summaries of what you learn'
        ],
        evidence: ['Learning style assessment', 'Content engagement patterns']
      });
    }

    // Performance patterns
    if (behavior.patterns.mostActiveHours.length > 0) {
      const bestHour = behavior.patterns.mostActiveHours[0];
      insights.push({
        type: 'pattern',
        title: 'Peak Learning Time',
        description: `You're most active and engaged around ${bestHour}:00`,
        confidence: 0.7,
        actionable: true,
        suggestions: [
          `Schedule important study sessions around ${bestHour}:00`,
          'Use this time for challenging topics',
          'Set reminders for your peak learning hours'
        ],
        evidence: ['Activity patterns', 'Engagement metrics']
      });
    }

    // Strength identification
    if (behavior.patterns.preferredFeatures.length > 0) {
      const topFeature = behavior.patterns.preferredFeatures[0];
      insights.push({
        type: 'strength',
        title: 'Feature Proficiency',
        description: `You excel at using ${topFeature} features`,
        confidence: 0.6,
        actionable: true,
        suggestions: [
          `Leverage ${topFeature} for complex problems`,
          'Help others with this feature',
          'Explore advanced aspects of this tool'
        ],
        evidence: ['Usage frequency', 'Success rates']
      });
    }

    // Improvement recommendations
    if (behavior.patterns.dropOffPoints.length > 0) {
      const dropOffPoint = behavior.patterns.dropOffPoints[0];
      insights.push({
        type: 'weakness',
        title: 'Attention Challenge',
        description: `You tend to disengage at ${dropOffPoint}`,
        confidence: 0.5,
        actionable: true,
        suggestions: [
          'Break content into smaller chunks',
          'Take breaks before reaching this point',
          'Use interactive elements to maintain engagement'
        ],
        evidence: ['Session analysis', 'Drop-off patterns']
      });
    }

    return insights;
  }

  // Adaptive Difficulty Adjustment
  async adjustDifficultyBasedOnPerformance(
    userId: string,
    topic: string,
    performance: { score: number; timeSpent: number; attempts: number }
  ): Promise<void> {
    const profile = await this.getLearningProfile(userId);
    if (!profile) return;

    let adjustment = 0;

    // Adjust based on score
    if (performance.score > 0.9) {
      adjustment += 1; // Increase difficulty
    } else if (performance.score < 0.6) {
      adjustment -= 1; // Decrease difficulty
    }

    // Adjust based on time spent
    const expectedTime = this.estimateContentTime('average content', profile);
    if (performance.timeSpent < expectedTime * 0.5) {
      adjustment += 0.5; // Too easy, increase difficulty
    } else if (performance.timeSpent > expectedTime * 2) {
      adjustment -= 0.5; // Too hard, decrease difficulty
    }

    // Adjust based on attempts
    if (performance.attempts > 3) {
      adjustment -= 1; // Struggling, decrease difficulty
    }

    // Update profile strengths/weaknesses
    if (performance.score > 0.8 && !profile.strengths.includes(topic)) {
      profile.strengths.push(topic);
    } else if (performance.score < 0.5 && !profile.weaknesses.includes(topic)) {
      profile.weaknesses.push(topic);
    }

    await this.updateLearningProfile(userId, {
      strengths: profile.strengths,
      weaknesses: profile.weaknesses,
    });
  }

  // Content Recommendation Engine
  async recommendNextContent(userId: string, currentTopic?: string): Promise<AdaptiveContent[]> {
    const profile = await this.getLearningProfile(userId);
    if (!profile) return [];

    const recommendations: AdaptiveContent[] = [];

    // Recommend based on weaknesses
    for (const weakness of profile.weaknesses.slice(0, 2)) {
      const content = await this.generateAdaptiveContent(userId, weakness, 'exercise');
      recommendations.push(content);
    }

    // Recommend based on interests
    for (const interest of profile.interests.slice(0, 2)) {
      const content = await this.generateAdaptiveContent(userId, interest, 'explanation');
      recommendations.push(content);
    }

    // Recommend next logical step if current topic provided
    if (currentTopic) {
      const nextTopics = this.getNextTopics(currentTopic);
      for (const nextTopic of nextTopics.slice(0, 1)) {
        const content = await this.generateAdaptiveContent(userId, nextTopic, 'explanation');
        recommendations.push(content);
      }
    }

    return recommendations;
  }

  private getNextTopics(currentTopic: string): string[] {
    const progressions: Record<string, string[]> = {
      'javascript': ['react', 'nodejs', 'typescript'],
      'html': ['css', 'javascript'],
      'css': ['responsive_design', 'animations'],
      'python': ['data_analysis', 'machine_learning', 'web_frameworks'],
      'statistics': ['machine_learning', 'data_visualization'],
    };

    return progressions[currentTopic] || [];
  }
}

// React Hook
export function useAIPersonalization(userId: string) {
  const [engine] = React.useState(() => new AIPersonalizationEngine());
  const [profile, setProfile] = React.useState<LearningProfile | null>(null);
  const [insights, setInsights] = React.useState<PersonalizationInsight[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        let userProfile = await engine.getLearningProfile(userId);
        if (!userProfile) {
          userProfile = await engine.createLearningProfile(userId);
        }
        setProfile(userProfile);

        const userInsights = await engine.generatePersonalizationInsights(userId);
        setInsights(userInsights);
      } catch (error) {
        console.error('Failed to load personalization data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId, engine]);

  const updateProfile = React.useCallback(async (updates: Partial<LearningProfile>) => {
    if (!userId) return;
    
    await engine.updateLearningProfile(userId, updates);
    const updatedProfile = await engine.getLearningProfile(userId);
    setProfile(updatedProfile);
  }, [userId, engine]);

  const generateContent = React.useCallback(async (
    topic: string,
    contentType: AdaptiveContent['type']
  ) => {
    if (!userId) return null;
    return await engine.generateAdaptiveContent(userId, topic, contentType);
  }, [userId, engine]);

  const createLearningPath = React.useCallback(async (goal: string) => {
    if (!userId) return null;
    return await engine.generatePersonalizedLearningPath(userId, goal);
  }, [userId, engine]);

  return {
    engine,
    profile,
    insights,
    loading,
    updateProfile,
    generateContent,
    createLearningPath,
  };
}

// Global personalization engine instance
let globalPersonalizationEngine: AIPersonalizationEngine | null = null;

export function getPersonalizationEngine(): AIPersonalizationEngine {
  if (!globalPersonalizationEngine) {
    globalPersonalizationEngine = new AIPersonalizationEngine();
  }
  return globalPersonalizationEngine;
}

// React import for hooks
import React from 'react';