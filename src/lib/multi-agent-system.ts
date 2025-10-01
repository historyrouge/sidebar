import { Message } from '@/types';

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  personality: {
    tone: 'formal' | 'casual' | 'technical' | 'friendly' | 'creative';
    verbosity: 'concise' | 'detailed' | 'comprehensive';
    approach: 'analytical' | 'creative' | 'practical' | 'theoretical';
  };
  capabilities: string[];
  systemPrompt: string;
}

interface AgentResponse {
  agentId: string;
  content: string;
  confidence: number;
  reasoning: string;
  suggestedFollowUp?: string[];
  resources?: string[];
}

interface TaskAnalysis {
  taskType: string;
  complexity: 'low' | 'medium' | 'high';
  domain: string[];
  requiredCapabilities: string[];
  suggestedAgents: string[];
  collaborationNeeded: boolean;
}

export class MultiAgentSystem {
  private agents: Map<string, Agent> = new Map();
  private activeConversations: Map<string, string[]> = new Map(); // conversationId -> agentIds

  constructor() {
    this.initializeAgents();
  }

  private initializeAgents(): void {
    const agents: Agent[] = [
      {
        id: 'tutor',
        name: 'Professor Alex',
        role: 'Educational Tutor',
        expertise: ['education', 'learning', 'pedagogy', 'curriculum', 'assessment'],
        personality: {
          tone: 'friendly',
          verbosity: 'detailed',
          approach: 'practical',
        },
        capabilities: ['explain_concepts', 'create_exercises', 'assess_understanding', 'provide_feedback'],
        systemPrompt: `You are Professor Alex, an experienced educational tutor. Your role is to:
        - Break down complex concepts into understandable parts
        - Provide clear explanations with examples
        - Create practice exercises and assessments
        - Adapt teaching methods to different learning styles
        - Encourage and motivate students
        Always be patient, encouraging, and focus on helping students truly understand concepts.`,
      },
      {
        id: 'coder',
        name: 'DevBot',
        role: 'Programming Assistant',
        expertise: ['programming', 'software_development', 'debugging', 'architecture', 'best_practices'],
        personality: {
          tone: 'technical',
          verbosity: 'comprehensive',
          approach: 'analytical',
        },
        capabilities: ['write_code', 'debug_code', 'explain_algorithms', 'review_code', 'suggest_improvements'],
        systemPrompt: `You are DevBot, a senior software engineer and programming mentor. Your role is to:
        - Write clean, efficient, and well-documented code
        - Debug and troubleshoot programming issues
        - Explain algorithms and data structures clearly
        - Provide code reviews and improvement suggestions
        - Share best practices and design patterns
        Always prioritize code quality, maintainability, and performance.`,
      },
      {
        id: 'researcher',
        name: 'Dr. Insight',
        role: 'Research Analyst',
        expertise: ['research', 'analysis', 'data_interpretation', 'academic_writing', 'methodology'],
        personality: {
          tone: 'formal',
          verbosity: 'comprehensive',
          approach: 'analytical',
        },
        capabilities: ['conduct_research', 'analyze_data', 'synthesize_information', 'cite_sources', 'methodology_design'],
        systemPrompt: `You are Dr. Insight, a research analyst with expertise in various fields. Your role is to:
        - Conduct thorough research on topics
        - Analyze and synthesize information from multiple sources
        - Provide evidence-based insights and conclusions
        - Help design research methodologies
        - Ensure academic rigor and proper citations
        Always maintain objectivity and base conclusions on solid evidence.`,
      },
      {
        id: 'creative',
        name: 'Muse',
        role: 'Creative Assistant',
        expertise: ['creativity', 'writing', 'design', 'brainstorming', 'storytelling'],
        personality: {
          tone: 'creative',
          verbosity: 'detailed',
          approach: 'creative',
        },
        capabilities: ['generate_ideas', 'creative_writing', 'storytelling', 'design_concepts', 'brainstorming'],
        systemPrompt: `You are Muse, a creative assistant who inspires and guides creative endeavors. Your role is to:
        - Generate innovative and original ideas
        - Help with creative writing and storytelling
        - Provide design inspiration and concepts
        - Facilitate brainstorming sessions
        - Encourage creative thinking and expression
        Always think outside the box and inspire creativity in others.`,
      },
      {
        id: 'analyst',
        name: 'DataMind',
        role: 'Data Analyst',
        expertise: ['data_analysis', 'statistics', 'visualization', 'machine_learning', 'business_intelligence'],
        personality: {
          tone: 'technical',
          verbosity: 'detailed',
          approach: 'analytical',
        },
        capabilities: ['analyze_data', 'create_visualizations', 'statistical_analysis', 'predictive_modeling', 'insights_generation'],
        systemPrompt: `You are DataMind, a data analyst who excels at extracting insights from data. Your role is to:
        - Analyze datasets and identify patterns
        - Create meaningful data visualizations
        - Perform statistical analysis and hypothesis testing
        - Build predictive models when appropriate
        - Translate data insights into actionable recommendations
        Always be precise with numbers and transparent about limitations.`,
      },
      {
        id: 'strategist',
        name: 'Strategist',
        role: 'Strategic Advisor',
        expertise: ['strategy', 'planning', 'decision_making', 'problem_solving', 'optimization'],
        personality: {
          tone: 'formal',
          verbosity: 'concise',
          approach: 'practical',
        },
        capabilities: ['strategic_planning', 'problem_solving', 'decision_analysis', 'optimization', 'risk_assessment'],
        systemPrompt: `You are Strategist, a strategic advisor who helps with planning and decision-making. Your role is to:
        - Develop comprehensive strategies and plans
        - Analyze complex problems and propose solutions
        - Evaluate options and make recommendations
        - Assess risks and opportunities
        - Optimize processes and outcomes
        Always think systematically and consider long-term implications.`,
      },
    ];

    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  async analyzeTask(message: string, context?: any): Promise<TaskAnalysis> {
    const lowerMessage = message.toLowerCase();
    
    // Determine task type
    let taskType = 'general';
    if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('debug')) {
      taskType = 'programming';
    } else if (lowerMessage.includes('research') || lowerMessage.includes('analyze') || lowerMessage.includes('study')) {
      taskType = 'research';
    } else if (lowerMessage.includes('create') || lowerMessage.includes('design') || lowerMessage.includes('write')) {
      taskType = 'creative';
    } else if (lowerMessage.includes('data') || lowerMessage.includes('statistics') || lowerMessage.includes('chart')) {
      taskType = 'analysis';
    } else if (lowerMessage.includes('plan') || lowerMessage.includes('strategy') || lowerMessage.includes('decide')) {
      taskType = 'strategic';
    } else if (lowerMessage.includes('learn') || lowerMessage.includes('explain') || lowerMessage.includes('teach')) {
      taskType = 'educational';
    }

    // Determine complexity
    const complexity = this.assessComplexity(message);
    
    // Extract domains
    const domains = this.extractDomains(message);
    
    // Determine required capabilities
    const requiredCapabilities = this.identifyRequiredCapabilities(message, taskType);
    
    // Suggest appropriate agents
    const suggestedAgents = this.selectAgents(taskType, domains, requiredCapabilities);
    
    // Determine if collaboration is needed
    const collaborationNeeded = suggestedAgents.length > 1 || complexity === 'high';

    return {
      taskType,
      complexity,
      domain: domains,
      requiredCapabilities,
      suggestedAgents,
      collaborationNeeded,
    };
  }

  async processWithAgents(
    message: string,
    conversationId: string,
    taskAnalysis: TaskAnalysis,
    context?: any
  ): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = [];
    
    // Get the most suitable agents
    const selectedAgents = taskAnalysis.suggestedAgents.slice(0, 3); // Limit to 3 agents max
    
    for (const agentId of selectedAgents) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      try {
        const response = await this.getAgentResponse(agent, message, context, taskAnalysis);
        responses.push(response);
      } catch (error) {
        console.error(`Error getting response from agent ${agentId}:`, error);
      }
    }

    // Update active conversations
    this.activeConversations.set(conversationId, selectedAgents);

    return responses;
  }

  async synthesizeResponses(responses: AgentResponse[], originalMessage: string): Promise<string> {
    if (responses.length === 0) {
      return "I apologize, but I couldn't generate a response at the moment. Please try again.";
    }

    if (responses.length === 1) {
      return responses[0].content;
    }

    // Multi-agent synthesis
    const highConfidenceResponses = responses.filter(r => r.confidence > 0.7);
    const responsesToUse = highConfidenceResponses.length > 0 ? highConfidenceResponses : responses;

    let synthesized = `I've consulted with multiple specialists to give you a comprehensive answer:\n\n`;

    responsesToUse.forEach((response, index) => {
      const agent = this.agents.get(response.agentId);
      if (agent) {
        synthesized += `**${agent.name} (${agent.role}):**\n${response.content}\n\n`;
      }
    });

    // Add collaborative insights if multiple perspectives
    if (responsesToUse.length > 1) {
      synthesized += `**Collaborative Insights:**\n`;
      synthesized += this.generateCollaborativeInsights(responsesToUse);
    }

    return synthesized;
  }

  async getAgentSuggestions(conversationId: string, message: string): Promise<{
    agent: Agent;
    reason: string;
    confidence: number;
  }[]> {
    const taskAnalysis = await this.analyzeTask(message);
    const suggestions: { agent: Agent; reason: string; confidence: number }[] = [];

    for (const agentId of taskAnalysis.suggestedAgents) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      const confidence = this.calculateAgentFit(agent, taskAnalysis);
      const reason = this.generateSelectionReason(agent, taskAnalysis);

      suggestions.push({ agent, reason, confidence });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  // Private helper methods
  private assessComplexity(message: string): 'low' | 'medium' | 'high' {
    const complexityIndicators = {
      high: ['complex', 'advanced', 'comprehensive', 'detailed', 'in-depth', 'thorough'],
      medium: ['explain', 'analyze', 'compare', 'evaluate', 'design'],
      low: ['simple', 'basic', 'quick', 'brief', 'summary'],
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => lowerMessage.includes(indicator))) {
        return level as 'low' | 'medium' | 'high';
      }
    }

    // Default based on message length
    if (message.length > 200) return 'high';
    if (message.length > 50) return 'medium';
    return 'low';
  }

  private extractDomains(message: string): string[] {
    const domainKeywords = {
      technology: ['code', 'programming', 'software', 'app', 'website', 'algorithm', 'database'],
      education: ['learn', 'study', 'teach', 'explain', 'understand', 'lesson', 'course'],
      business: ['strategy', 'marketing', 'sales', 'profit', 'business', 'company', 'market'],
      science: ['research', 'experiment', 'hypothesis', 'data', 'analysis', 'scientific'],
      creative: ['design', 'art', 'creative', 'story', 'write', 'imagine', 'brainstorm'],
      mathematics: ['math', 'calculate', 'equation', 'formula', 'statistics', 'probability'],
    };

    const lowerMessage = message.toLowerCase();
    const domains: string[] = [];

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        domains.push(domain);
      }
    }

    return domains.length > 0 ? domains : ['general'];
  }

  private identifyRequiredCapabilities(message: string, taskType: string): string[] {
    const capabilityMap: Record<string, string[]> = {
      programming: ['write_code', 'debug_code', 'explain_algorithms', 'review_code'],
      research: ['conduct_research', 'analyze_data', 'synthesize_information', 'cite_sources'],
      creative: ['generate_ideas', 'creative_writing', 'storytelling', 'design_concepts'],
      analysis: ['analyze_data', 'create_visualizations', 'statistical_analysis', 'insights_generation'],
      strategic: ['strategic_planning', 'problem_solving', 'decision_analysis', 'optimization'],
      educational: ['explain_concepts', 'create_exercises', 'assess_understanding', 'provide_feedback'],
    };

    return capabilityMap[taskType] || ['general_assistance'];
  }

  private selectAgents(taskType: string, domains: string[], requiredCapabilities: string[]): string[] {
    const agentScores: { agentId: string; score: number }[] = [];

    for (const [agentId, agent] of this.agents.entries()) {
      let score = 0;

      // Score based on expertise match
      const expertiseMatch = agent.expertise.filter(exp => 
        domains.some(domain => exp.includes(domain) || domain.includes(exp))
      ).length;
      score += expertiseMatch * 2;

      // Score based on capability match
      const capabilityMatch = agent.capabilities.filter(cap => 
        requiredCapabilities.includes(cap)
      ).length;
      score += capabilityMatch * 3;

      // Bonus for exact task type match
      if (agent.role.toLowerCase().includes(taskType)) {
        score += 5;
      }

      agentScores.push({ agentId, score });
    }

    // Sort by score and return top agents
    return agentScores
      .sort((a, b) => b.score - a.score)
      .filter(item => item.score > 0)
      .slice(0, 3)
      .map(item => item.agentId);
  }

  private async getAgentResponse(
    agent: Agent,
    message: string,
    context: any,
    taskAnalysis: TaskAnalysis
  ): Promise<AgentResponse> {
    // This would integrate with your AI service (OpenAI, etc.)
    // For now, we'll simulate a response based on agent characteristics
    
    const confidence = this.calculateAgentFit(agent, taskAnalysis);
    
    // Simulate AI response generation with agent's personality and expertise
    const response = await this.generateAgentResponse(agent, message, context);
    
    return {
      agentId: agent.id,
      content: response.content,
      confidence,
      reasoning: response.reasoning,
      suggestedFollowUp: response.suggestedFollowUp,
      resources: response.resources,
    };
  }

  private calculateAgentFit(agent: Agent, taskAnalysis: TaskAnalysis): number {
    let fit = 0.5; // Base fit

    // Expertise alignment
    const expertiseMatch = agent.expertise.filter(exp => 
      taskAnalysis.domain.some(domain => exp.includes(domain))
    ).length;
    fit += (expertiseMatch / agent.expertise.length) * 0.3;

    // Capability alignment
    const capabilityMatch = agent.capabilities.filter(cap => 
      taskAnalysis.requiredCapabilities.includes(cap)
    ).length;
    fit += (capabilityMatch / taskAnalysis.requiredCapabilities.length) * 0.4;

    // Task type alignment
    if (agent.role.toLowerCase().includes(taskAnalysis.taskType)) {
      fit += 0.2;
    }

    return Math.min(1, fit);
  }

  private generateSelectionReason(agent: Agent, taskAnalysis: TaskAnalysis): string {
    const reasons: string[] = [];

    if (agent.expertise.some(exp => taskAnalysis.domain.includes(exp))) {
      reasons.push(`expertise in ${taskAnalysis.domain.join(', ')}`);
    }

    if (agent.capabilities.some(cap => taskAnalysis.requiredCapabilities.includes(cap))) {
      reasons.push(`relevant capabilities for ${taskAnalysis.taskType} tasks`);
    }

    if (taskAnalysis.complexity === 'high' && agent.personality.verbosity === 'comprehensive') {
      reasons.push('comprehensive approach suitable for complex tasks');
    }

    return reasons.length > 0 
      ? `Selected for ${reasons.join(' and ')}`
      : 'General expertise applicable to this task';
  }

  private async generateAgentResponse(
    agent: Agent,
    message: string,
    context: any
  ): Promise<{
    content: string;
    reasoning: string;
    suggestedFollowUp?: string[];
    resources?: string[];
  }> {
    // This is a simplified simulation - in production, this would call your AI service
    // with the agent's system prompt and personality
    
    const baseResponse = `As ${agent.name}, I'll help you with this ${agent.role.toLowerCase()} perspective.`;
    
    // Simulate different response styles based on agent personality
    let content = baseResponse;
    let reasoning = `Applied ${agent.role} expertise to address your question.`;
    
    const suggestedFollowUp = this.generateFollowUpQuestions(agent, message);
    const resources = this.generateRelevantResources(agent, message);

    return {
      content,
      reasoning,
      suggestedFollowUp,
      resources,
    };
  }

  private generateFollowUpQuestions(agent: Agent, message: string): string[] {
    const followUps: Record<string, string[]> = {
      tutor: [
        "Would you like me to create practice exercises for this topic?",
        "Do you need clarification on any specific part?",
        "Would examples help you understand better?",
      ],
      coder: [
        "Would you like me to review your code for improvements?",
        "Do you need help with testing this implementation?",
        "Should we discuss performance optimizations?",
      ],
      researcher: [
        "Would you like me to find more sources on this topic?",
        "Do you need help with methodology design?",
        "Should we analyze the data from different angles?",
      ],
      creative: [
        "Would you like to explore alternative creative approaches?",
        "Do you need help brainstorming more ideas?",
        "Should we develop this concept further?",
      ],
      analyst: [
        "Would you like me to create visualizations for this data?",
        "Do you need statistical analysis of these results?",
        "Should we explore predictive modeling options?",
      ],
      strategist: [
        "Would you like me to analyze potential risks?",
        "Do you need help prioritizing these options?",
        "Should we develop an implementation timeline?",
      ],
    };

    return followUps[agent.id] || ["How else can I help you with this topic?"];
  }

  private generateRelevantResources(agent: Agent, message: string): string[] {
    // This would typically integrate with a knowledge base or external APIs
    const resources: Record<string, string[]> = {
      tutor: ["Educational resources", "Practice materials", "Learning guides"],
      coder: ["Documentation", "Code examples", "Best practices guides"],
      researcher: ["Academic papers", "Research databases", "Methodology guides"],
      creative: ["Design inspiration", "Creative tools", "Portfolio examples"],
      analyst: ["Data visualization tools", "Statistical resources", "Analysis frameworks"],
      strategist: ["Strategic frameworks", "Planning templates", "Case studies"],
    };

    return resources[agent.id] || [];
  }

  private generateCollaborativeInsights(responses: AgentResponse[]): string {
    const agents = responses.map(r => this.agents.get(r.agentId)).filter(Boolean) as Agent[];
    
    if (agents.length < 2) return "";

    let insights = "The different perspectives complement each other:\n";
    
    // Identify complementary strengths
    const approaches = agents.map(a => a.personality.approach);
    const uniqueApproaches = [...new Set(approaches)];
    
    if (uniqueApproaches.length > 1) {
      insights += `• Multiple approaches: ${uniqueApproaches.join(', ')}\n`;
    }

    // Identify expertise overlap and gaps
    const allExpertise = agents.flatMap(a => a.expertise);
    const uniqueExpertise = [...new Set(allExpertise)];
    
    if (uniqueExpertise.length > 3) {
      insights += `• Comprehensive coverage across ${uniqueExpertise.length} areas of expertise\n`;
    }

    return insights;
  }
}