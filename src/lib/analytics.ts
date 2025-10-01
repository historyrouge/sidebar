import { StorageManager, localStorage } from './storage';

export interface AnalyticsEvent {
  id: string;
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  referrer?: string;
  deviceInfo: DeviceInfo;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenResolution: string;
  viewport: string;
  colorDepth: number;
  timezone: string;
  language: string;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: number;
  events: number;
  bounced: boolean;
  exitPage?: string;
  entryPage: string;
  referrer?: string;
  campaign?: string;
  deviceInfo: DeviceInfo;
}

export interface PerformanceMetrics {
  id: string;
  timestamp: number;
  url: string;
  metrics: {
    // Core Web Vitals
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    
    // Navigation Timing
    domContentLoaded?: number;
    loadComplete?: number;
    firstPaint?: number;
    firstContentfulPaint?: number;
    
    // Resource Timing
    totalResources?: number;
    totalSize?: number;
    
    // Custom Metrics
    timeToInteractive?: number;
    apiResponseTime?: number;
    renderTime?: number;
  };
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

export interface UserBehavior {
  userId: string;
  patterns: {
    mostActiveHours: number[];
    averageSessionDuration: number;
    preferredFeatures: string[];
    commonUserFlows: string[][];
    dropOffPoints: string[];
  };
  engagement: {
    totalSessions: number;
    totalTimeSpent: number;
    averageEventsPerSession: number;
    returnVisits: number;
    lastActivity: number;
  };
  preferences: {
    theme: string;
    language: string;
    communicationStyle: string;
    contentTypes: string[];
  };
}

export class AnalyticsManager {
  private storage: StorageManager;
  private sessionId: string;
  private userId?: string;
  private currentSession: UserSession | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private performanceObserver?: PerformanceObserver;
  private isOnline = navigator.onLine;

  constructor() {
    this.storage = localStorage;
    this.sessionId = this.generateSessionId();
    this.initializeSession();
    this.setupPerformanceMonitoring();
    this.setupEventListeners();
  }

  // Session Management
  private initializeSession(): void {
    const deviceInfo = this.getDeviceInfo();
    
    this.currentSession = {
      id: this.sessionId,
      userId: this.userId,
      startTime: Date.now(),
      pageViews: 1,
      events: 0,
      bounced: true, // Will be set to false if user interacts
      entryPage: window.location.pathname,
      referrer: document.referrer || undefined,
      deviceInfo,
    };

    this.saveSession();
  }

  setUserId(userId: string): void {
    this.userId = userId;
    if (this.currentSession) {
      this.currentSession.userId = userId;
      this.saveSession();
    }
  }

  // Event Tracking
  track(
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties: Record<string, any> = {}
  ): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: 'track',
      category,
      action,
      label,
      value,
      properties,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      deviceInfo: this.getDeviceInfo(),
    };

    this.processEvent(event);
  }

  // Page View Tracking
  page(path?: string, title?: string, properties: Record<string, any> = {}): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: 'page',
      category: 'Navigation',
      action: 'page_view',
      label: path || window.location.pathname,
      properties: {
        title: title || document.title,
        ...properties,
      },
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      deviceInfo: this.getDeviceInfo(),
    };

    if (this.currentSession) {
      this.currentSession.pageViews++;
      this.currentSession.bounced = false;
      this.saveSession();
    }

    this.processEvent(event);
  }

  // User Identification
  identify(userId: string, traits: Record<string, any> = {}): void {
    this.setUserId(userId);
    
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type: 'identify',
      category: 'User',
      action: 'identify',
      properties: traits,
      userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      deviceInfo: this.getDeviceInfo(),
    };

    this.processEvent(event);
  }

  // Performance Monitoring
  private setupPerformanceMonitoring(): void {
    // Core Web Vitals
    this.observeWebVitals();
    
    // Navigation Timing
    window.addEventListener('load', () => {
      setTimeout(() => this.captureNavigationTiming(), 0);
    });

    // Resource Timing
    this.observeResourceTiming();
  }

  private observeWebVitals(): void {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          
          this.recordPerformanceMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordPerformanceMetric('fid', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.recordPerformanceMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }
    }
  }

  private captureNavigationTiming(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
      };

      this.recordPerformanceMetrics(metrics);
    }
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const totalSize = entries.reduce((sum: number, entry: any) => {
            return sum + (entry.transferSize || 0);
          }, 0);

          this.recordPerformanceMetric('totalResources', entries.length);
          this.recordPerformanceMetric('totalSize', totalSize);
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource timing observer not supported:', error);
      }
    }
  }

  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime;
  }

  private getFirstContentfulPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp?.startTime;
  }

  // User Behavior Analysis
  async analyzeBehavior(userId: string): Promise<UserBehavior> {
    const events = await this.getUserEvents(userId);
    const sessions = await this.getUserSessions(userId);

    const patterns = this.analyzePatterns(events, sessions);
    const engagement = this.calculateEngagement(sessions, events);
    const preferences = this.inferPreferences(events);

    return {
      userId,
      patterns,
      engagement,
      preferences,
    };
  }

  private analyzePatterns(events: AnalyticsEvent[], sessions: UserSession[]) {
    // Most active hours
    const hourCounts: Record<number, number> = {};
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const mostActiveHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Average session duration
    const validSessions = sessions.filter(s => s.duration);
    const averageSessionDuration = validSessions.length > 0
      ? validSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / validSessions.length
      : 0;

    // Preferred features
    const featureCounts: Record<string, number> = {};
    events.forEach(event => {
      if (event.category === 'Feature') {
        featureCounts[event.action] = (featureCounts[event.action] || 0) + 1;
      }
    });
    
    const preferredFeatures = Object.entries(featureCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature);

    // Common user flows (simplified)
    const userFlows = this.extractUserFlows(events);
    
    // Drop-off points
    const dropOffPoints = this.identifyDropOffPoints(sessions);

    return {
      mostActiveHours,
      averageSessionDuration,
      preferredFeatures,
      commonUserFlows: userFlows,
      dropOffPoints,
    };
  }

  private calculateEngagement(sessions: UserSession[], events: AnalyticsEvent[]) {
    const totalSessions = sessions.length;
    const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageEventsPerSession = totalSessions > 0 ? events.length / totalSessions : 0;
    const returnVisits = sessions.filter(s => s.pageViews > 1).length;
    const lastActivity = Math.max(...sessions.map(s => s.startTime));

    return {
      totalSessions,
      totalTimeSpent,
      averageEventsPerSession,
      returnVisits,
      lastActivity,
    };
  }

  private inferPreferences(events: AnalyticsEvent[]) {
    const preferences: Record<string, any> = {};

    // Theme preference
    const themeEvents = events.filter(e => e.action === 'theme_change');
    if (themeEvents.length > 0) {
      const lastTheme = themeEvents[themeEvents.length - 1];
      preferences.theme = lastTheme.properties.theme;
    }

    // Language preference
    const langEvents = events.filter(e => e.action === 'language_change');
    if (langEvents.length > 0) {
      const lastLang = langEvents[langEvents.length - 1];
      preferences.language = lastLang.properties.language;
    }

    // Content types
    const contentTypes: Record<string, number> = {};
    events.forEach(event => {
      if (event.properties.contentType) {
        const type = event.properties.contentType;
        contentTypes[type] = (contentTypes[type] || 0) + 1;
      }
    });
    
    preferences.contentTypes = Object.entries(contentTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    return preferences;
  }

  // A/B Testing
  getVariant(experimentId: string, userId?: string): string {
    const key = `experiment_${experimentId}_${userId || 'anonymous'}`;
    let variant = localStorage.getItem(key);
    
    if (!variant) {
      // Simple A/B split
      variant = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(key, variant);
      
      // Track experiment exposure
      this.track('Experiment', 'exposed', experimentId, undefined, {
        variant,
        experimentId,
      });
    }
    
    return variant;
  }

  // Funnel Analysis
  async analyzeFunnel(steps: string[], userId?: string): Promise<{
    step: string;
    users: number;
    conversionRate: number;
    dropOffRate: number;
  }[]> {
    const events = userId 
      ? await this.getUserEvents(userId)
      : await this.getAllEvents();

    const funnelData = steps.map((step, index) => {
      const stepEvents = events.filter(e => e.action === step);
      const users = new Set(stepEvents.map(e => e.userId).filter(Boolean)).size;
      
      const prevStepUsers = index > 0 
        ? new Set(events.filter(e => e.action === steps[index - 1]).map(e => e.userId).filter(Boolean)).size
        : users;
      
      const conversionRate = prevStepUsers > 0 ? (users / prevStepUsers) * 100 : 100;
      const dropOffRate = 100 - conversionRate;

      return {
        step,
        users,
        conversionRate,
        dropOffRate,
      };
    });

    return funnelData;
  }

  // Cohort Analysis
  async analyzeCohorts(period: 'daily' | 'weekly' | 'monthly' = 'weekly'): Promise<any> {
    const sessions = await this.getAllSessions();
    const cohorts: Record<string, any> = {};

    sessions.forEach(session => {
      if (!session.userId) return;

      const cohortKey = this.getCohortKey(session.startTime, period);
      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = {
          period: cohortKey,
          users: new Set(),
          retention: {},
        };
      }

      cohorts[cohortKey].users.add(session.userId);
    });

    // Calculate retention for each cohort
    Object.values(cohorts).forEach((cohort: any) => {
      const cohortUsers = Array.from(cohort.users);
      
      // Calculate retention for subsequent periods
      for (let i = 1; i <= 12; i++) {
        const retentionPeriod = this.addPeriod(cohort.period, i, period);
        const retainedUsers = cohortUsers.filter(userId => {
          return sessions.some(s => 
            s.userId === userId && 
            this.getCohortKey(s.startTime, period) === retentionPeriod
          );
        });
        
        cohort.retention[`period_${i}`] = {
          users: retainedUsers.length,
          rate: (retainedUsers.length / cohortUsers.length) * 100,
        };
      }
    });

    return Object.values(cohorts);
  }

  // Real-time Analytics
  getRealtimeStats(): Promise<{
    activeUsers: number;
    currentPageViews: Record<string, number>;
    topEvents: { event: string; count: number }[];
    averageSessionDuration: number;
  }> {
    return new Promise(async (resolve) => {
      const recentEvents = await this.getRecentEvents(5 * 60 * 1000); // Last 5 minutes
      const activeSessions = await this.getActiveSessions();

      const activeUsers = new Set(recentEvents.map(e => e.userId).filter(Boolean)).size;
      
      const pageViews: Record<string, number> = {};
      recentEvents.filter(e => e.type === 'page').forEach(e => {
        pageViews[e.label || 'unknown'] = (pageViews[e.label || 'unknown'] || 0) + 1;
      });

      const eventCounts: Record<string, number> = {};
      recentEvents.forEach(e => {
        const eventKey = `${e.category}:${e.action}`;
        eventCounts[eventKey] = (eventCounts[eventKey] || 0) + 1;
      });

      const topEvents = Object.entries(eventCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([event, count]) => ({ event, count }));

      const averageSessionDuration = activeSessions.length > 0
        ? activeSessions.reduce((sum, s) => sum + (Date.now() - s.startTime), 0) / activeSessions.length
        : 0;

      resolve({
        activeUsers,
        currentPageViews: pageViews,
        topEvents,
        averageSessionDuration,
      });
    });
  }

  // Private helper methods
  private processEvent(event: AnalyticsEvent): void {
    if (this.currentSession) {
      this.currentSession.events++;
      this.currentSession.bounced = false;
      this.saveSession();
    }

    // Queue event for batch processing
    this.eventQueue.push(event);
    
    // Process queue if online or if queue is full
    if (this.isOnline || this.eventQueue.length >= 10) {
      this.flushEventQueue();
    }
  }

  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Store events locally
      await Promise.all(events.map(event => 
        this.storage.set(`event_${event.id}`, event)
      ));

      // Send to analytics service if online
      if (this.isOnline) {
        await this.sendEventsToService(events);
      }
    } catch (error) {
      console.error('Failed to process events:', error);
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
    }
  }

  private async sendEventsToService(events: AnalyticsEvent[]): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });
    } catch (error) {
      console.error('Failed to send events to service:', error);
      throw error;
    }
  }

  private recordPerformanceMetric(name: string, value: number): void {
    this.track('Performance', name, undefined, value, {
      metric: name,
      value,
      url: window.location.pathname,
    });
  }

  private recordPerformanceMetrics(metrics: Record<string, number>): void {
    Object.entries(metrics).forEach(([name, value]) => {
      if (value !== undefined) {
        this.recordPerformanceMetric(name, value);
      }
    });
  }

  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEventQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('Engagement', 'page_hidden');
      } else {
        this.track('Engagement', 'page_visible');
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
      // Send any remaining events
      if (this.eventQueue.length > 0) {
        navigator.sendBeacon('/api/analytics/events', JSON.stringify({
          events: this.eventQueue
        }));
      }
    });
  }

  private endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
      this.currentSession.exitPage = window.location.pathname;
      this.saveSession();
    }
  }

  private saveSession(): void {
    if (this.currentSession) {
      this.storage.set(`session_${this.sessionId}`, this.currentSession);
    }
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    
    return {
      type: this.getDeviceType(),
      os: this.getOS(userAgent),
      browser: this.getBrowser(userAgent),
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Data retrieval methods
  private async getUserEvents(userId: string): Promise<AnalyticsEvent[]> {
    const keys = await this.storage.keys();
    const eventKeys = keys.filter(key => key.startsWith('event_'));
    
    const events = await Promise.all(
      eventKeys.map(key => this.storage.get<AnalyticsEvent>(key))
    );
    
    return events
      .filter(Boolean)
      .filter(event => event!.userId === userId) as AnalyticsEvent[];
  }

  private async getAllEvents(): Promise<AnalyticsEvent[]> {
    const keys = await this.storage.keys();
    const eventKeys = keys.filter(key => key.startsWith('event_'));
    
    const events = await Promise.all(
      eventKeys.map(key => this.storage.get<AnalyticsEvent>(key))
    );
    
    return events.filter(Boolean) as AnalyticsEvent[];
  }

  private async getUserSessions(userId: string): Promise<UserSession[]> {
    const keys = await this.storage.keys();
    const sessionKeys = keys.filter(key => key.startsWith('session_'));
    
    const sessions = await Promise.all(
      sessionKeys.map(key => this.storage.get<UserSession>(key))
    );
    
    return sessions
      .filter(Boolean)
      .filter(session => session!.userId === userId) as UserSession[];
  }

  private async getAllSessions(): Promise<UserSession[]> {
    const keys = await this.storage.keys();
    const sessionKeys = keys.filter(key => key.startsWith('session_'));
    
    const sessions = await Promise.all(
      sessionKeys.map(key => this.storage.get<UserSession>(key))
    );
    
    return sessions.filter(Boolean) as UserSession[];
  }

  private async getRecentEvents(timeWindow: number): Promise<AnalyticsEvent[]> {
    const allEvents = await this.getAllEvents();
    const cutoff = Date.now() - timeWindow;
    
    return allEvents.filter(event => event.timestamp > cutoff);
  }

  private async getActiveSessions(): Promise<UserSession[]> {
    const allSessions = await this.getAllSessions();
    const cutoff = Date.now() - (30 * 60 * 1000); // 30 minutes
    
    return allSessions.filter(session => 
      !session.endTime && session.startTime > cutoff
    );
  }

  private extractUserFlows(events: AnalyticsEvent[]): string[][] {
    // Simplified user flow extraction
    const flows: string[][] = [];
    const pageEvents = events
      .filter(e => e.type === 'page')
      .sort((a, b) => a.timestamp - b.timestamp);

    let currentFlow: string[] = [];
    let lastTimestamp = 0;

    pageEvents.forEach(event => {
      const timeDiff = event.timestamp - lastTimestamp;
      
      if (timeDiff > 30 * 60 * 1000) { // 30 minutes gap = new flow
        if (currentFlow.length > 1) {
          flows.push([...currentFlow]);
        }
        currentFlow = [event.label || 'unknown'];
      } else {
        currentFlow.push(event.label || 'unknown');
      }
      
      lastTimestamp = event.timestamp;
    });

    if (currentFlow.length > 1) {
      flows.push(currentFlow);
    }

    return flows.slice(0, 10); // Return top 10 flows
  }

  private identifyDropOffPoints(sessions: UserSession[]): string[] {
    const exitPages: Record<string, number> = {};
    
    sessions.forEach(session => {
      if (session.exitPage && session.pageViews === 1) {
        exitPages[session.exitPage] = (exitPages[session.exitPage] || 0) + 1;
      }
    });

    return Object.entries(exitPages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([page]) => page);
  }

  private getCohortKey(timestamp: number, period: 'daily' | 'weekly' | 'monthly'): string {
    const date = new Date(timestamp);
    
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0];
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'monthly':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      default:
        return date.toISOString().split('T')[0];
    }
  }

  private addPeriod(cohortKey: string, periods: number, period: 'daily' | 'weekly' | 'monthly'): string {
    const date = new Date(cohortKey);
    
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() + periods);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (periods * 7));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + periods);
        break;
    }
    
    return this.getCohortKey(date.getTime(), period);
  }
}

// Singleton instance
let analyticsInstance: AnalyticsManager | null = null;

export function getAnalytics(): AnalyticsManager {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsManager();
  }
  return analyticsInstance;
}

// React hook for analytics
export function useAnalytics() {
  const analytics = React.useMemo(() => getAnalytics(), []);
  
  const track = React.useCallback((
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: Record<string, any>
  ) => {
    analytics.track(category, action, label, value, properties);
  }, [analytics]);

  const page = React.useCallback((path?: string, title?: string, properties?: Record<string, any>) => {
    analytics.page(path, title, properties);
  }, [analytics]);

  const identify = React.useCallback((userId: string, traits?: Record<string, any>) => {
    analytics.identify(userId, traits);
  }, [analytics]);

  return {
    analytics,
    track,
    page,
    identify,
  };
}

// React import for hooks
import React from 'react';