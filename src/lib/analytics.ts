/**
 * Advanced Analytics and Insights System
 * Comprehensive analytics for learning patterns, performance tracking,
 * and predictive insights
 * 
 * Features:
 * - User behavior tracking
 * - Learning pattern analysis
 * - Performance metrics
 * - Predictive analytics
 * - A/B testing framework
 * - Conversion tracking
 * - User segmentation
 * - Cohort analysis
 * - Funnel analysis
 * - Retention metrics
 */

import { generateId, formatDuration, getPercentage } from './utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export enum EventCategory {
  USER = 'user',
  STUDY = 'study',
  CONTENT = 'content',
  INTERACTION = 'interaction',
  PERFORMANCE = 'performance',
  NAVIGATION = 'navigation',
  ERROR = 'error',
  CONVERSION = 'conversion',
}

export enum EventAction {
  // User actions
  LOGIN = 'login',
  LOGOUT = 'logout',
  SIGNUP = 'signup',
  PROFILE_UPDATE = 'profile_update',
  
  // Study actions
  STUDY_START = 'study_start',
  STUDY_END = 'study_end',
  CARD_REVIEW = 'card_review',
  FLASHCARD_CREATE = 'flashcard_create',
  QUIZ_START = 'quiz_start',
  QUIZ_COMPLETE = 'quiz_complete',
  
  // Content actions
  CONTENT_UPLOAD = 'content_upload',
  CONTENT_ANALYZE = 'content_analyze',
  CONTENT_GENERATE = 'content_generate',
  CONTENT_EXPORT = 'content_export',
  
  // Interaction actions
  BUTTON_CLICK = 'button_click',
  LINK_CLICK = 'link_click',
  FEATURE_USE = 'feature_use',
  SEARCH = 'search',
  
  // Performance actions
  PERFORMANCE_SLOW = 'performance_slow',
  PERFORMANCE_ERROR = 'performance_error',
  
  // Navigation
  PAGE_VIEW = 'page_view',
  PAGE_EXIT = 'page_exit',
  
  // Conversion
  TRIAL_START = 'trial_start',
  UPGRADE = 'upgrade',
  PURCHASE = 'purchase',
  SUBSCRIPTION_CANCEL = 'subscription_cancel',
}

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  
  // Page context
  page: {
    url: string;
    title: string;
    referrer?: string;
  };
  
  // User context
  userAgent?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  screenResolution?: string;
  
  // Timing
  loadTime?: number;
  interactionTime?: number;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  
  pageViews: number;
  events: AnalyticsEvent[];
  
  // Entry/Exit
  entryPage: string;
  exitPage?: string;
  
  // Engagement
  scrollDepth: number;
  clickCount: number;
  formSubmissions: number;
  
  // Conversion
  converted: boolean;
  conversionEvent?: string;
  conversionValue?: number;
  
  // Device info
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export interface UserProfile {
  userId: string;
  createdAt: Date;
  lastActive: Date;
  
  // Engagement metrics
  totalSessions: number;
  totalEvents: number;
  totalStudyTime: number;
  averageSessionDuration: number;
  
  // Study metrics
  cardsReviewed: number;
  quizzesTaken: number;
  contentAnalyzed: number;
  flashcardsCreated: number;
  
  // Performance
  averageAccuracy: number;
  retentionRate: number;
  streakDays: number;
  longestStreak: number;
  
  // Behavior patterns
  preferredStudyTime: number; // Hour of day
  preferredDays: number[];    // Days of week
  averageStudyDuration: number;
  
  // Conversion
  tier: 'free' | 'premium' | 'pro';
  lifetimeValue: number;
  firstPurchaseDate?: Date;
  
  // Segmentation
  segment: string;
  cohort: string;
  
  // Preferences
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: string;
  };
}

export interface PerformanceMetrics {
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  
  // User metrics
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  churnedUsers: number;
  
  // Engagement
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  pageViewsPerSession: number;
  
  // Study metrics
  totalStudyTime: number;
  averageStudyTime: number;
  cardsReviewed: number;
  quizzesTaken: number;
  
  // Performance
  averageAccuracy: number;
  retentionRate: number;
  
  // Conversion
  conversionRate: number;
  revenue: number;
  averageRevenuePerUser: number;
  
  // Technical
  errorRate: number;
  averageLoadTime: number;
  crashRate: number;
}

export interface FunnelStep {
  name: string;
  users: number;
  percentage: number;
  dropoff: number;
  averageTime: number;
}

export interface FunnelAnalysis {
  name: string;
  steps: FunnelStep[];
  conversionRate: number;
  averageCompletionTime: number;
  bottleneck: string;
}

export interface CohortAnalysis {
  cohortName: string;
  cohortDate: Date;
  size: number;
  retention: {
    day: number;
    users: number;
    percentage: number;
  }[];
  ltv: number;
  conversionRate: number;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  
  variants: {
    id: string;
    name: string;
    weight: number;
    users: number;
    conversions: number;
    conversionRate: number;
    averageValue: number;
  }[];
  
  winner?: string;
  confidence: number;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

export interface PredictiveInsight {
  type: 'churn' | 'conversion' | 'engagement' | 'performance';
  confidence: number;
  prediction: string;
  recommendations: string[];
  affectedUsers: number;
  potentialImpact: {
    metric: string;
    change: number;
    unit: string;
  };
}

// ============================================================================
// ANALYTICS SERVICE
// ============================================================================

export class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private currentSessionId: string | null = null;
  
  private constructor() {
    this.initializeSession();
  }
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  
  /**
   * Initialize a new session
   */
  private initializeSession(): void {
    this.currentSessionId = generateId();
    
    const session: UserSession = {
      id: this.currentSessionId,
      startTime: new Date(),
      duration: 0,
      pageViews: 0,
      events: [],
      entryPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      scrollDepth: 0,
      clickCount: 0,
      formSubmissions: 0,
      converted: false,
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
    };
    
    this.sessions.set(this.currentSessionId, session);
    
    // Track page view
    this.trackEvent({
      category: EventCategory.NAVIGATION,
      action: EventAction.PAGE_VIEW,
    });
  }
  
  /**
   * Track an analytics event
   */
  trackEvent(params: {
    category: EventCategory;
    action: EventAction;
    label?: string;
    value?: number;
    metadata?: Record<string, any>;
  }): void {
    if (!this.currentSessionId) {
      this.initializeSession();
    }
    
    const event: AnalyticsEvent = {
      id: generateId(),
      sessionId: this.currentSessionId!,
      timestamp: new Date(),
      category: params.category,
      action: params.action,
      label: params.label,
      value: params.value,
      metadata: params.metadata,
      page: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        title: typeof window !== 'undefined' ? document.title : '',
        referrer: typeof window !== 'undefined' ? document.referrer : '',
      },
      deviceType: this.getDeviceType(),
      browser: this.getBrowser(),
      os: this.getOS(),
    };
    
    this.events.push(event);
    
    // Update session
    const session = this.sessions.get(this.currentSessionId!);
    if (session) {
      session.events.push(event);
      session.duration = Date.now() - session.startTime.getTime();
      
      if (params.action === EventAction.PAGE_VIEW) {
        session.pageViews++;
      }
    }
    
    // Send to external analytics (Google Analytics, etc.)
    this.sendToExternalAnalytics(event);
    
    // Store in localStorage for persistence
    this.persistEvents();
  }
  
  /**
   * Track page view
   */
  trackPageView(page: string): void {
    this.trackEvent({
      category: EventCategory.NAVIGATION,
      action: EventAction.PAGE_VIEW,
      label: page,
    });
  }
  
  /**
   * Track user action
   */
  trackUserAction(action: EventAction, label?: string, value?: number): void {
    this.trackEvent({
      category: EventCategory.USER,
      action,
      label,
      value,
    });
  }
  
  /**
   * Track study session
   */
  trackStudySession(duration: number, cardsReviewed: number, accuracy: number): void {
    this.trackEvent({
      category: EventCategory.STUDY,
      action: EventAction.STUDY_END,
      value: duration,
      metadata: {
        cardsReviewed,
        accuracy,
      },
    });
  }
  
  /**
   * Track conversion
   */
  trackConversion(type: string, value: number): void {
    this.trackEvent({
      category: EventCategory.CONVERSION,
      action: EventAction.PURCHASE,
      label: type,
      value,
    });
    
    // Update session conversion
    const session = this.sessions.get(this.currentSessionId!);
    if (session) {
      session.converted = true;
      session.conversionEvent = type;
      session.conversionValue = value;
    }
  }
  
  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent({
      category: EventCategory.ERROR,
      action: EventAction.PERFORMANCE_ERROR,
      label: error.message,
      metadata: {
        stack: error.stack,
        ...context,
      },
    });
  }
  
  /**
   * Get all events
   */
  getEvents(filters?: {
    category?: EventCategory;
    action?: EventAction;
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }): AnalyticsEvent[] {
    let filtered = this.events;
    
    if (filters) {
      if (filters.category) {
        filtered = filtered.filter(e => e.category === filters.category);
      }
      if (filters.action) {
        filtered = filtered.filter(e => e.action === filters.action);
      }
      if (filters.startDate) {
        filtered = filtered.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(e => e.timestamp <= filters.endDate!);
      }
      if (filters.userId) {
        filtered = filtered.filter(e => e.userId === filters.userId);
      }
    }
    
    return filtered;
  }
  
  /**
   * Calculate performance metrics
   */
  calculateMetrics(period: 'hour' | 'day' | 'week' | 'month'): PerformanceMetrics {
    const now = new Date();
    const startDate = new Date(now);
    
    switch (period) {
      case 'hour':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }
    
    const events = this.getEvents({ startDate, endDate: now });
    const sessions = Array.from(this.sessions.values())
      .filter(s => s.startTime >= startDate && s.startTime <= now);
    
    // User metrics
    const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean));
    const newUsers = events.filter(e => e.action === EventAction.SIGNUP).length;
    const activeUsers = uniqueUsers.size;
    const returningUsers = activeUsers - newUsers;
    
    // Engagement
    const totalSessions = sessions.length;
    const averageSessionDuration = totalSessions > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions / 1000
      : 0;
    
    const bounces = sessions.filter(s => s.pageViews <= 1).length;
    const bounceRate = totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;
    
    const totalPageViews = sessions.reduce((sum, s) => sum + s.pageViews, 0);
    const pageViewsPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0;
    
    // Study metrics
    const studyEvents = events.filter(e => e.category === EventCategory.STUDY);
    const totalStudyTime = studyEvents
      .filter(e => e.action === EventAction.STUDY_END)
      .reduce((sum, e) => sum + (e.value || 0), 0);
    
    const averageStudyTime = studyEvents.length > 0 ? totalStudyTime / studyEvents.length : 0;
    
    const cardsReviewed = events
      .filter(e => e.action === EventAction.CARD_REVIEW)
      .length;
    
    const quizzesTaken = events
      .filter(e => e.action === EventAction.QUIZ_COMPLETE)
      .length;
    
    // Performance
    const studyEndEvents = events.filter(e => e.action === EventAction.STUDY_END);
    const totalAccuracy = studyEndEvents
      .reduce((sum, e) => sum + (e.metadata?.accuracy || 0), 0);
    const averageAccuracy = studyEndEvents.length > 0
      ? totalAccuracy / studyEndEvents.length
      : 0;
    
    // Conversion
    const conversionEvents = events.filter(e => e.category === EventCategory.CONVERSION);
    const conversions = conversionEvents.length;
    const conversionRate = activeUsers > 0 ? (conversions / activeUsers) * 100 : 0;
    
    const revenue = conversionEvents
      .reduce((sum, e) => sum + (e.value || 0), 0);
    const averageRevenuePerUser = activeUsers > 0 ? revenue / activeUsers : 0;
    
    // Technical
    const errorEvents = events.filter(e => e.category === EventCategory.ERROR);
    const errorRate = events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;
    
    const loadTimes = events
      .filter(e => e.loadTime)
      .map(e => e.loadTime!);
    const averageLoadTime = loadTimes.length > 0
      ? loadTimes.reduce((sum, t) => sum + t, 0) / loadTimes.length
      : 0;
    
    return {
      period,
      startDate,
      endDate: now,
      activeUsers,
      newUsers,
      returningUsers,
      churnedUsers: 0, // Would need historical data
      totalSessions,
      averageSessionDuration,
      bounceRate,
      pageViewsPerSession,
      totalStudyTime,
      averageStudyTime,
      cardsReviewed,
      quizzesTaken,
      averageAccuracy,
      retentionRate: 0, // Would need historical data
      conversionRate,
      revenue,
      averageRevenuePerUser,
      errorRate,
      averageLoadTime,
      crashRate: 0,
    };
  }
  
  /**
   * Analyze funnel
   */
  analyzeFunnel(steps: { name: string; action: EventAction }[]): FunnelAnalysis {
    const funnelSteps: FunnelStep[] = [];
    let previousUsers = 0;
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const events = this.events.filter(e => e.action === step.action);
      const uniqueUsers = new Set(events.map(e => e.userId).filter(Boolean));
      const users = uniqueUsers.size;
      
      const percentage = i === 0 ? 100 : (users / previousUsers) * 100;
      const dropoff = i === 0 ? 0 : previousUsers - users;
      
      const avgTime = events.length > 0
        ? events.reduce((sum, e) => sum + (e.interactionTime || 0), 0) / events.length
        : 0;
      
      funnelSteps.push({
        name: step.name,
        users,
        percentage,
        dropoff,
        averageTime: avgTime,
      });
      
      previousUsers = users;
    }
    
    const firstStep = funnelSteps[0];
    const lastStep = funnelSteps[funnelSteps.length - 1];
    const conversionRate = firstStep.users > 0
      ? (lastStep.users / firstStep.users) * 100
      : 0;
    
    const averageCompletionTime = funnelSteps.reduce((sum, s) => sum + s.averageTime, 0);
    
    // Find bottleneck (biggest dropoff)
    const bottleneck = funnelSteps
      .filter(s => s.dropoff > 0)
      .sort((a, b) => b.dropoff - a.dropoff)[0]?.name || 'None';
    
    return {
      name: 'User Journey',
      steps: funnelSteps,
      conversionRate,
      averageCompletionTime,
      bottleneck,
    };
  }
  
  /**
   * Perform cohort analysis
   */
  analyzeCohort(cohortDate: Date, retentionDays: number = 30): CohortAnalysis {
    const cohortStart = new Date(cohortDate);
    cohortStart.setHours(0, 0, 0, 0);
    const cohortEnd = new Date(cohortStart);
    cohortEnd.setDate(cohortEnd.getDate() + 1);
    
    // Get users who signed up in this cohort
    const cohortSignups = this.events.filter(
      e => e.action === EventAction.SIGNUP &&
           e.timestamp >= cohortStart &&
           e.timestamp < cohortEnd
    );
    const cohortUsers = new Set(cohortSignups.map(e => e.userId).filter(Boolean));
    const cohortSize = cohortUsers.size;
    
    // Calculate retention for each day
    const retention: { day: number; users: number; percentage: number }[] = [];
    
    for (let day = 0; day <= retentionDays; day++) {
      const dayStart = new Date(cohortStart);
      dayStart.setDate(dayStart.getDate() + day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const activeOnDay = this.events.filter(
        e => e.userId && cohortUsers.has(e.userId) &&
             e.timestamp >= dayStart &&
             e.timestamp < dayEnd
      );
      
      const uniqueActive = new Set(activeOnDay.map(e => e.userId));
      const users = uniqueActive.size;
      const percentage = cohortSize > 0 ? (users / cohortSize) * 100 : 0;
      
      retention.push({ day, users, percentage });
    }
    
    // Calculate LTV (simplified)
    const cohortRevenue = this.events
      .filter(e => e.userId && cohortUsers.has(e.userId) &&
                   e.category === EventCategory.CONVERSION)
      .reduce((sum, e) => sum + (e.value || 0), 0);
    
    const ltv = cohortSize > 0 ? cohortRevenue / cohortSize : 0;
    
    // Calculate conversion rate
    const conversions = this.events.filter(
      e => e.userId && cohortUsers.has(e.userId) &&
           e.category === EventCategory.CONVERSION
    ).length;
    const conversionRate = cohortSize > 0 ? (conversions / cohortSize) * 100 : 0;
    
    return {
      cohortName: cohortDate.toISOString().split('T')[0],
      cohortDate,
      size: cohortSize,
      retention,
      ltv,
      conversionRate,
    };
  }
  
  /**
   * Generate predictive insights
   */
  generatePredictiveInsights(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const metrics = this.calculateMetrics('week');
    
    // Churn prediction
    if (metrics.bounceRate > 60) {
      insights.push({
        type: 'churn',
        confidence: 0.75,
        prediction: 'High churn risk detected',
        recommendations: [
          'Improve onboarding experience',
          'Add interactive tutorials',
          'Reduce initial complexity',
        ],
        affectedUsers: Math.round(metrics.activeUsers * 0.6),
        potentialImpact: {
          metric: 'retention',
          change: -30,
          unit: '%',
        },
      });
    }
    
    // Conversion opportunity
    if (metrics.conversionRate < 5 && metrics.activeUsers > 100) {
      insights.push({
        type: 'conversion',
        confidence: 0.68,
        prediction: 'Conversion rate below industry average',
        recommendations: [
          'Implement limited-time offers',
          'Add social proof elements',
          'Optimize pricing page',
          'Create urgency with deadlines',
        ],
        affectedUsers: metrics.activeUsers,
        potentialImpact: {
          metric: 'revenue',
          change: 150,
          unit: '%',
        },
      });
    }
    
    // Engagement insight
    if (metrics.averageSessionDuration < 300) {
      insights.push({
        type: 'engagement',
        confidence: 0.82,
        prediction: 'Users not spending enough time on platform',
        recommendations: [
          'Add gamification elements',
          'Create achievement system',
          'Implement daily challenges',
          'Show progress visualization',
        ],
        affectedUsers: metrics.activeUsers,
        potentialImpact: {
          metric: 'session_duration',
          change: 200,
          unit: '%',
        },
      });
    }
    
    // Performance insight
    if (metrics.averageAccuracy < 70) {
      insights.push({
        type: 'performance',
        confidence: 0.71,
        prediction: 'Learning performance below optimal',
        recommendations: [
          'Implement spaced repetition',
          'Add difficulty adaptation',
          'Provide detailed explanations',
          'Create practice mode',
        ],
        affectedUsers: Math.round(metrics.activeUsers * 0.7),
        potentialImpact: {
          metric: 'accuracy',
          change: 25,
          unit: '%',
        },
      });
    }
    
    return insights;
  }
  
  /**
   * Create A/B test
   */
  createABTest(
    name: string,
    description: string,
    variants: { name: string; weight: number }[]
  ): ABTest {
    const test: ABTest = {
      id: generateId(),
      name,
      description,
      startDate: new Date(),
      variants: variants.map(v => ({
        id: generateId(),
        name: v.name,
        weight: v.weight,
        users: 0,
        conversions: 0,
        conversionRate: 0,
        averageValue: 0,
      })),
      confidence: 0,
      status: 'draft',
    };
    
    return test;
  }
  
  /**
   * Assign user to A/B test variant
   */
  assignToVariant(testId: string, userId: string): string {
    // Simple hash-based assignment for consistency
    const hash = this.hashCode(userId + testId);
    const normalizedHash = Math.abs(hash) / 2147483647; // Normalize to 0-1
    
    // Assign based on variant weights (not implemented in this example)
    // For now, just use modulo
    return `variant_${hash % 2}`;
  }
  
  /**
   * Simple hash function
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }
  
  /**
   * Get device type
   */
  private getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }
  
  /**
   * Get browser name
   */
  private getBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'unknown';
  }
  
  /**
   * Get operating system
   */
  private getOS(): string {
    if (typeof window === 'undefined') return 'unknown';
    
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1) return 'iOS';
    return 'unknown';
  }
  
  /**
   * Send to external analytics service
   */
  private sendToExternalAnalytics(event: AnalyticsEvent): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
    
    // Can add other services here (Mixpanel, Amplitude, etc.)
  }
  
  /**
   * Persist events to localStorage
   */
  private persistEvents(): void {
    try {
      const recentEvents = this.events.slice(-1000); // Keep last 1000 events
      localStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  /**
   * Load events from localStorage
   */
  loadPersistedEvents(): void {
    try {
      const stored = localStorage.getItem('analytics_events');
      if (stored) {
        const events = JSON.parse(stored);
        this.events = events.map((e: any) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }));
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  /**
   * Export analytics data
   */
  exportData(format: 'json' | 'csv'): string {
    if (format === 'json') {
      return JSON.stringify({
        events: this.events,
        sessions: Array.from(this.sessions.values()),
        metrics: this.calculateMetrics('month'),
      }, null, 2);
    }
    
    // CSV format
    const headers = ['Timestamp', 'Category', 'Action', 'Label', 'Value', 'User ID', 'Session ID'];
    const rows = this.events.map(e => [
      e.timestamp.toISOString(),
      e.category,
      e.action,
      e.label || '',
      e.value || '',
      e.userId || '',
      e.sessionId,
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
    
    return csv;
  }
  
  /**
   * Clear all analytics data
   */
  clearData(): void {
    this.events = [];
    this.sessions.clear();
    this.userProfiles.clear();
    this.currentSessionId = null;
    
    try {
      localStorage.removeItem('analytics_events');
    } catch (e) {
      // Ignore errors
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Track event helper
 */
export function trackEvent(
  category: EventCategory,
  action: EventAction,
  label?: string,
  value?: number
): void {
  const analytics = AnalyticsService.getInstance();
  analytics.trackEvent({ category, action, label, value });
}

/**
 * Track page view helper
 */
export function trackPageView(page: string): void {
  const analytics = AnalyticsService.getInstance();
  analytics.trackPageView(page);
}

/**
 * Track conversion helper
 */
export function trackConversion(type: string, value: number): void {
  const analytics = AnalyticsService.getInstance();
  analytics.trackConversion(type, value);
}

/**
 * Get analytics instance
 */
export function getAnalytics(): AnalyticsService {
  return AnalyticsService.getInstance();
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();

export default AnalyticsService;
