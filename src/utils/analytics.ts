/**
 * Performance analytics utility
 *
 * This module provides functions to measure and report performance metrics.
 */

// Types
interface PerformanceMetrics {
  timeToFirstByte?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  domContentLoaded?: number;
  windowLoaded?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  timeToInteractive?: number;
  [key: string]: number | undefined;
}

interface CustomMetric {
  name: string;
  value: number;
  category?: 'navigation' | 'resource' | 'paint' | 'layout' | 'interaction' | 'custom';
}

// Configuration
const config = {
  // Whether to enable analytics
  enabled: true,

  // Whether to log metrics to console
  debug: process.env.NODE_ENV === 'development',

  // Endpoint to send metrics to (if any)
  endpoint: '',

  // Sample rate (0-1)
  sampleRate: 0.1,
};

// Initialize analytics
export const initAnalytics = (): void => {
  if (!config.enabled) return;
  if (!shouldSample()) return;
  if (typeof window === 'undefined') return; // Skip if not in browser environment

  // Increase max listeners to avoid warnings
  if (window.EventTarget) {
    // @ts-ignore - setMaxListeners is not in the type definitions
    if (typeof EventTarget.prototype.setMaxListeners === 'function') {
      // @ts-ignore
      EventTarget.prototype.setMaxListeners(20);
    }
  }

  // Register performance observers
  registerPerformanceObservers();

  // Collect metrics on page load - use once option to avoid memory leaks
  const loadHandler = () => {
    setTimeout(() => {
      const metrics = collectMetrics();
      reportMetrics(metrics);
    }, 1000);
    window.removeEventListener('load', loadHandler);
  };

  window.addEventListener('load', loadHandler);
};

// Determine if this session should be sampled
const shouldSample = (): boolean => {
  return Math.random() < config.sampleRate;
};

// Register performance observers
const registerPerformanceObservers = (): void => {
  // Skip if Performance API is not supported
  if (!window.PerformanceObserver) return;

  try {
    // Observe Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        recordCustomMetric({
          name: 'largest-contentful-paint',
          value: lastEntry.startTime,
          category: 'paint',
        });
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // Observe First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-input') {
          recordCustomMetric({
            name: 'first-input-delay',
            // @ts-ignore - processingStart is a non-standard property on PerformanceEntry
            value: entry.processingStart - entry.startTime,
            category: 'interaction',
          });
        }
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // Observe Layout Shifts
    const clsObserver = new PerformanceObserver((entryList) => {
      let cumulativeLayoutShift = 0;
      entryList.getEntries().forEach((entry) => {
        // @ts-ignore - hadRecentInput is a non-standard property on PerformanceEntry
        if (!entry.hadRecentInput) {
          // @ts-ignore - TS doesn't know about the value property on layout-shift entries
          cumulativeLayoutShift += entry.value;
        }
      });

      recordCustomMetric({
        name: 'cumulative-layout-shift',
        value: cumulativeLayoutShift,
        category: 'layout',
      });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Observe Navigation Timing
    const navigationObserver = new PerformanceObserver((entryList) => {
      const navigationEntry = entryList.getEntries()[0];
      if (navigationEntry) {
        // Record various navigation timing metrics
        const navTiming = navigationEntry as PerformanceNavigationTiming;

        recordCustomMetric({
          name: 'time-to-first-byte',
          value: navTiming.responseStart - navTiming.requestStart,
          category: 'navigation',
        });

        recordCustomMetric({
          name: 'dom-content-loaded',
          value: navTiming.domContentLoadedEventEnd - navTiming.fetchStart,
          category: 'navigation',
        });

        recordCustomMetric({
          name: 'window-loaded',
          value: navTiming.loadEventEnd - navTiming.fetchStart,
          category: 'navigation',
        });
      }
    });
    navigationObserver.observe({ type: 'navigation', buffered: true });

  } catch (error) {
    console.error('Error setting up performance observers:', error);
  }
};

// Custom metrics storage
const customMetrics: Record<string, number> = {};

// Record a custom metric
export const recordCustomMetric = (metric: CustomMetric): void => {
  if (!config.enabled) return;

  customMetrics[metric.name] = metric.value;

  if (config.debug) {
    console.log(`[Analytics] Recorded metric: ${metric.name} = ${metric.value}`);
  }
};

// Start timing a custom operation
export const startTiming = (name: string): () => void => {
  if (!config.enabled) return () => {};

  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    recordCustomMetric({
      name,
      value: duration,
      category: 'custom',
    });
  };
};

// Collect all metrics
const collectMetrics = (): PerformanceMetrics => {
  const metrics: PerformanceMetrics = { ...customMetrics };

  // Collect standard metrics if available
  if (window.performance) {
    // Paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Navigation timing
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      metrics.timeToFirstByte = navEntry.responseStart - navEntry.requestStart;
      metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
      metrics.windowLoaded = navEntry.loadEventEnd - navEntry.fetchStart;
    }
  }

  return metrics;
};

// Report metrics
const reportMetrics = (metrics: PerformanceMetrics): void => {
  if (config.debug) {
    console.log('[Analytics] Performance Metrics:', metrics);
  }

  // Send metrics to server if endpoint is configured
  if (config.endpoint) {
    try {
      fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          url: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        }),
        // Use keepalive to ensure the request completes even if the page is unloaded
        keepalive: true,
      }).catch((error) => {
        console.error('Error sending metrics:', error);
      });
    } catch (error) {
      console.error('Error reporting metrics:', error);
    }
  }
};

// Export the analytics module
export default {
  init: initAnalytics,
  recordMetric: recordCustomMetric,
  startTiming,
};
