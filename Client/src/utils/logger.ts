/**
 * Observability Layer: Centralized Logger
 * Used STRICTLY for tracking infrastructure, API, and boundary errors.
 * DO NOT use this for generic UI interactions (clicks, renders, etc).
 */

const isProd = import.meta.env.MODE === 'production';

export const logger = {
  info: (message: string, data?: any) => {
    if (!isProd) {
      console.info(`[INFO]: ${message}`, data || '');
    }
    // In PROD: Send generic info events to a monitoring service (if needed)
  },

  warn: (message: string, data?: any) => {
    if (!isProd) {
      console.warn(`[WARN]: ${message}`, data || '');
    }
    // In PROD: Send non-critical anomalies to Datadog/Sentry
  },

  error: (message: string, error?: any, context?: Record<string, any>) => {
    if (!isProd) {
      console.error(`[ERROR]: ${message}`, error || '', context || '');
    } else {
      // In PROD: Send critical failures to Sentry/Datadog
      // Example: Sentry.captureException(error, { extra: context });
      
      // Fallback for now to ensure it's not totally swallowed in prod without Sentry
      console.error(`[PROD ERROR]: ${message}`); 
    }
  }
};
