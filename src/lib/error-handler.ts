/**
 * Advanced Error Handling System
 * Provides comprehensive error tracking, logging, and user-friendly error messages
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  API = 'api',
  UI = 'ui',
  DATABASE = 'database',
  FILE_UPLOAD = 'file_upload',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown',
}

export interface AppError {
  id: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: Date;
  stack?: string;
  metadata?: Record<string, any>;
  userMessage: string;
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: AppError[] = [];
  private maxErrors = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle error and generate user-friendly message
   */
  handle(error: Error | unknown, category: ErrorCategory = ErrorCategory.UNKNOWN): AppError {
    const appError: AppError = {
      id: this.generateErrorId(),
      message: error instanceof Error ? error.message : String(error),
      category,
      severity: this.determineSeverity(category),
      timestamp: new Date(),
      stack: error instanceof Error ? error.stack : undefined,
      userMessage: this.getUserMessage(category, error),
    };

    this.logError(appError);
    this.storeError(appError);

    return appError;
  }

  /**
   * Get user-friendly error message
   */
  private getUserMessage(category: ErrorCategory, error: any): string {
    const messages: Record<ErrorCategory, string> = {
      [ErrorCategory.NETWORK]: 'Network error. Please check your connection and try again.',
      [ErrorCategory.AUTH]: 'Authentication failed. Please log in again.',
      [ErrorCategory.VALIDATION]: 'Invalid input. Please check your data and try again.',
      [ErrorCategory.API]: 'Service temporarily unavailable. Please try again later.',
      [ErrorCategory.UI]: 'An interface error occurred. Please refresh the page.',
      [ErrorCategory.DATABASE]: 'Data access error. Please try again.',
      [ErrorCategory.FILE_UPLOAD]: 'File upload failed. Please check file size and format.',
      [ErrorCategory.PERMISSION]: 'You don\'t have permission to perform this action.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };

    return messages[category] || messages[ErrorCategory.UNKNOWN];
  }

  /**
   * Determine error severity based on category
   */
  private determineSeverity(category: ErrorCategory): ErrorSeverity {
    const severityMap: Record<ErrorCategory, ErrorSeverity> = {
      [ErrorCategory.NETWORK]: ErrorSeverity.MEDIUM,
      [ErrorCategory.AUTH]: ErrorSeverity.HIGH,
      [ErrorCategory.VALIDATION]: ErrorSeverity.LOW,
      [ErrorCategory.API]: ErrorSeverity.MEDIUM,
      [ErrorCategory.UI]: ErrorSeverity.LOW,
      [ErrorCategory.DATABASE]: ErrorSeverity.HIGH,
      [ErrorCategory.FILE_UPLOAD]: ErrorSeverity.MEDIUM,
      [ErrorCategory.PERMISSION]: ErrorSeverity.HIGH,
      [ErrorCategory.UNKNOWN]: ErrorSeverity.MEDIUM,
    };

    return severityMap[category] || ErrorSeverity.MEDIUM;
  }

  /**
   * Log error to console (and optionally to external service)
   */
  private logError(error: AppError): void {
    const logMessage = `[${error.severity.toUpperCase()}] ${error.category}: ${error.message}`;

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(logMessage, error);
        this.sendToErrorTracking(error);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage, error);
        break;
      case ErrorSeverity.LOW:
        console.log(logMessage);
        break;
    }
  }

  /**
   * Store error in memory (for debugging and analytics)
   */
  private storeError(error: AppError): void {
    this.errors.push(error);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('app_errors', JSON.stringify(this.errors.slice(-10)));
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Send error to external tracking service (Sentry, etc.)
   */
  private sendToErrorTracking(error: AppError): void {
    // TODO: Integrate with Sentry or similar service
    // Example: Sentry.captureException(error);
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all stored errors
   */
  getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorCategory): AppError[] {
    return this.errors.filter(err => err.category === category);
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter(err => err.severity === severity);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
    try {
      localStorage.removeItem('app_errors');
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

/**
 * Convenience function for handling errors
 */
export function handleError(
  error: Error | unknown,
  category: ErrorCategory = ErrorCategory.UNKNOWN
): AppError {
  return errorHandler.handle(error, category);
}

/**
 * Async error boundary wrapper
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  category: ErrorCategory = ErrorCategory.UNKNOWN
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    const appError = handleError(error, category);
    return { error: appError };
  }
}

/**
 * Sync error boundary wrapper
 */
export function withErrorHandlingSync<T>(
  fn: () => T,
  category: ErrorCategory = ErrorCategory.UNKNOWN
): { data?: T; error?: AppError } {
  try {
    const data = fn();
    return { data };
  } catch (error) {
    const appError = handleError(error, category);
    return { error: appError };
  }
}
