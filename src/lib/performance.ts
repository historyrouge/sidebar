/**
 * Advanced Performance Monitoring System
 * Tracks performance metrics, optimizes resources, and provides analytics
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  duration: number;
  timestamp: Date;
  category: string;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private maxMetrics = 1000;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start performance timer
   */
  start(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End performance timer and record metric
   */
  end(name: string, category: string = 'general', metadata?: Record<string, any>): number {
    const startTime = this.timers.get(name);
    
    if (!startTime) {
      console.warn(`Performance timer "${name}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      id: this.generateMetricId(),
      name,
      duration,
      timestamp: new Date(),
      category,
      metadata,
    };

    this.recordMetric(metric);
    return duration;
  }

  /**
   * Measure function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    category: string = 'function'
  ): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(name, category);
    }
  }

  /**
   * Measure sync function execution time
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    category: string = 'function'
  ): T {
    this.start(name);
    try {
      return fn();
    } finally {
      this.end(name, category);
    }
  }

  /**
   * Record metric
   */
  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn(`Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  /**
   * Generate unique metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Get average duration for a metric name
   */
  getAverageDuration(name: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;

    const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / relevantMetrics.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    averageDuration: number;
    slowestOperation: PerformanceMetric | null;
    categories: Record<string, number>;
  } {
    const totalMetrics = this.metrics.length;
    const averageDuration = totalMetrics > 0
      ? this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalMetrics
      : 0;

    const slowestOperation = this.metrics.length > 0
      ? this.metrics.reduce((slowest, current) =>
          current.duration > slowest.duration ? current : slowest
        )
      : null;

    const categories = this.metrics.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMetrics,
      averageDuration,
      slowestOperation,
      categories,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Get Web Vitals (Core Web Vitals)
   */
  getWebVitals(): Promise<{
    LCP?: number; // Largest Contentful Paint
    FID?: number; // First Input Delay
    CLS?: number; // Cumulative Layout Shift
    FCP?: number; // First Contentful Paint
    TTFB?: number; // Time to First Byte
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};

      // Try to get performance entries
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            vitals.LCP = lastEntry.renderTime || lastEntry.loadTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {}

        // First Input Delay
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              vitals.FID = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (e) {}

        // Cumulative Layout Shift
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                vitals.CLS = clsValue;
              }
            });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {}
      }

      // Get paint timing
      if (performance.getEntriesByType) {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          vitals.FCP = fcpEntry.startTime;
        }
      }

      // Get navigation timing
      if (performance.getEntriesByType) {
        const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        if (navEntries.length > 0) {
          vitals.TTFB = navEntries[0].responseStart - navEntries[0].requestStart;
        }
      }

      // Resolve after a short delay to collect metrics
      setTimeout(() => resolve(vitals), 100);
    });
  }

  /**
   * Log performance report to console
   */
  logReport(): void {
    const summary = this.getSummary();
    console.group('📊 Performance Report');
    console.log('Total Metrics:', summary.totalMetrics);
    console.log('Average Duration:', `${summary.averageDuration.toFixed(2)}ms`);
    if (summary.slowestOperation) {
      console.log(
        'Slowest Operation:',
        `${summary.slowestOperation.name} (${summary.slowestOperation.duration.toFixed(2)}ms)`
      );
    }
    console.log('Categories:', summary.categories);
    console.groupEnd();
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Convenience function for measuring async operations
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  category?: string
): Promise<T> {
  return performanceMonitor.measure(name, fn, category);
}

/**
 * Convenience function for measuring sync operations
 */
export function measureSync<T>(
  name: string,
  fn: () => T,
  category?: string
): T {
  return performanceMonitor.measureSync(name, fn, category);
}

/**
 * Resource optimization utilities
 */
export class ResourceOptimizer {
  /**
   * Lazy load image
   */
  static lazyLoadImage(img: HTMLImageElement): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target as HTMLImageElement;
          if (image.dataset.src) {
            image.src = image.dataset.src;
            image.removeAttribute('data-src');
          }
          observer.unobserve(image);
        }
      });
    });

    observer.observe(img);
  }

  /**
   * Preload critical resources
   */
  static preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    const asMap = {
      script: 'script',
      style: 'style',
      image: 'image',
      font: 'font',
    };
    
    link.as = asMap[type];
    
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  }

  /**
   * Defer non-critical scripts
   */
  static deferScript(url: string, callback?: () => void): void {
    const script = document.createElement('script');
    script.src = url;
    script.defer = true;
    
    if (callback) {
      script.onload = callback;
    }
    
    document.body.appendChild(script);
  }

  /**
   * Cache data in memory
   */
  private static cache = new Map<string, { data: any; timestamp: number }>();
  
  static getCached<T>(key: string, maxAge: number = 5 * 60 * 1000): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  static setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  static clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

/**
 * Memory usage monitoring
 */
export function getMemoryUsage(): {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
  percentage?: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
}
