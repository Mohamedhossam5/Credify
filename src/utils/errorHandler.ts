import axios, { AxiosError } from 'axios';
import { logger } from './logger';

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

/**
 * Normalizes any error thrown during an API request into a standard ApiError format.
 * This prevents components from dealing with raw Axios objects or standard Error objects.
 */
export const normalizeApiError = (error: unknown): ApiError => {
  // 1. Handle Axios Errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
      const apiError = {
        message: axiosError.response.data?.message || axiosError.response.statusText || 'An error occurred with the server response.',
        code: axiosError.response.data?.code || `HTTP_${axiosError.response.status}`,
        status: axiosError.response.status,
        details: axiosError.response.data?.details || axiosError.response.data?.errors,
      };
      
      // Log server errors (5xx) as critical, 4xx as warnings
      if (apiError.status >= 500) {
        logger.error('API Server Error', axiosError, apiError);
      } else {
        logger.warn('API Client Error', apiError);
      }
      
      return apiError;
    }
    
    // Request was made but no response was received (Network error, timeout)
    if (axiosError.request) {
      logger.error('API Network/Timeout Error', axiosError);
      return {
        message: 'Network error. Please check your internet connection.',
        code: 'NETWORK_ERROR',
        status: 0, // 0 usually implies network level error
      };
    }
  }

  // 2. Handle standard JS Errors
  if (error instanceof Error) {
    const jsError = {
      message: error.message,
      code: 'INTERNAL_CLIENT_ERROR',
      status: -1,
    };
    logger.error('Client-side execution error caught in API layer', error, jsError);
    return jsError;
  }

  // 3. Fallback for completely unknown errors
  logger.error('Unknown error caught in API layer', error);
  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
    status: -1,
  };
};
