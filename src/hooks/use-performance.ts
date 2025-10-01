"use client";

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Performance API is supported
    if (typeof window !== 'undefined' && 'performance' in window) {
      setIsSupported(true);

      // Wait for page load to complete
      const handleLoad = () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (perfData) {
            setMetrics({
              loadTime: perfData.loadEventEnd - perfData.loadEventStart,
              firstContentfulPaint: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
              largestContentfulPaint: 0, // Would need LCP API
              firstInputDelay: 0, // Would need FID API
              cumulativeLayoutShift: 0, // Would need CLS API
            });
          }
        }, 100);
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, []);

  return { metrics, isSupported };
}

export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    CLS: number;
    FID: number;
    FCP: number;
    LCP: number;
    TTFB: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'web-vitals' in window) {
      // This would integrate with web-vitals library
      // For now, we'll just set up the structure
      setVitals({
        CLS: 0,
        FID: 0,
        FCP: 0,
        LCP: 0,
        TTFB: 0,
      });
    }
  }, []);

  return vitals;
}