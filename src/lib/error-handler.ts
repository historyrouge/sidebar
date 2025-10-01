import { AppError } from '@/types';

export class AppErrorClass extends Error {
  public code: string;
  public details?: any;
  public timestamp: string;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON(): AppError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  
  // API errors
  API_LIMIT_EXCEEDED: 'API_LIMIT_EXCEEDED',
  API_UNAVAILABLE: 'API_UNAVAILABLE',
  API_INVALID_REQUEST: 'API_INVALID_REQUEST',
  
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_INVALID_TYPE: 'FILE_INVALID_TYPE',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Storage errors
  STORAGE_ERROR: 'STORAGE_ERROR',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Authentication is required to access this resource',
  [ERROR_CODES.AUTH_INVALID]: 'Invalid authentication credentials',
  [ERROR_CODES.AUTH_EXPIRED]: 'Your session has expired. Please log in again',
  
  [ERROR_CODES.API_LIMIT_EXCEEDED]: 'API usage limit exceeded. Please try again later',
  [ERROR_CODES.API_UNAVAILABLE]: 'Service is temporarily unavailable',
  [ERROR_CODES.API_INVALID_REQUEST]: 'Invalid request format',
  
  [ERROR_CODES.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit',
  [ERROR_CODES.FILE_INVALID_TYPE]: 'File type is not supported',
  [ERROR_CODES.FILE_UPLOAD_FAILED]: 'Failed to upload file',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
  [ERROR_CODES.TIMEOUT_ERROR]: 'Request timed out',
  
  [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
  [ERROR_CODES.REQUIRED_FIELD]: 'This field is required',
  [ERROR_CODES.INVALID_FORMAT]: 'Invalid format',
  
  [ERROR_CODES.STORAGE_ERROR]: 'Storage operation failed',
  [ERROR_CODES.STORAGE_QUOTA_EXCEEDED]: 'Storage quota exceeded',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred',
} as const;

// Error handler utility
export function createError(code: keyof typeof ERROR_CODES, details?: any): AppErrorClass {
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  return new AppErrorClass(code, message, details);
}

// Error boundary helper
export function handleError(error: unknown): AppError {
  if (error instanceof AppErrorClass) {
    return error.toJSON();
  }
  
  if (error instanceof Error) {
    return {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message,
      details: { stack: error.stack },
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: 'An unexpected error occurred',
    details: { originalError: error },
    timestamp: new Date().toISOString(),
  };
}

// Async error wrapper
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  fallback?: T
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await asyncFn();
    return { data };
  } catch (error) {
    const appError = handleError(error);
    console.error('Error caught by withErrorHandling:', appError);
    
    if (fallback !== undefined) {
      return { data: fallback, error: appError };
    }
    
    return { error: appError };
  }
}

// Retry mechanism
export async function withRetry<T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

// Network error detection
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

// Timeout wrapper
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(createError(ERROR_CODES.TIMEOUT_ERROR)), timeoutMs)
    ),
  ]);
}

// Error reporting (for analytics/monitoring)
export function reportError(error: AppError, context?: Record<string, any>): void {
  // In a real app, you would send this to your error reporting service
  console.error('Error reported:', {
    ...error,
    context,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  });
  
  // Example: Send to analytics service
  // analytics.track('error_occurred', { ...error, context });
}

// Validation helpers
export function validateRequired(value: any, fieldName: string): void {
  if (value === null || value === undefined || value === '') {
    throw createError(ERROR_CODES.REQUIRED_FIELD, { field: fieldName });
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw createError(ERROR_CODES.INVALID_FORMAT, { field: 'email', value: email });
  }
}

export function validateFileSize(file: File, maxSizeBytes: number): void {
  if (file.size > maxSizeBytes) {
    throw createError(ERROR_CODES.FILE_TOO_LARGE, {
      fileName: file.name,
      fileSize: file.size,
      maxSize: maxSizeBytes,
    });
  }
}

export function validateFileType(file: File, allowedTypes: string[]): void {
  if (!allowedTypes.includes(file.type)) {
    throw createError(ERROR_CODES.FILE_INVALID_TYPE, {
      fileName: file.name,
      fileType: file.type,
      allowedTypes,
    });
  }
}