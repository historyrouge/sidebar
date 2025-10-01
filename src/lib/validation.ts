import { z } from 'zod';
import { createError, ERROR_CODES } from './error-handler';

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  url: z.string().url('Invalid URL format'),
  uuid: z.string().uuid('Invalid UUID format'),
  nonEmptyString: z.string().min(1, 'This field is required'),
  positiveNumber: z.number().positive('Must be a positive number'),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
};

// Message validation
export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'model', 'tool']),
  content: z.object({
    text: z.string(),
    image: z.string().nullable().optional(),
  }),
  timestamp: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Chat input validation
export const chatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model', 'tool']),
    content: z.string(),
  })),
  fileContent: z.string().nullable().optional(),
  imageDataUri: z.string().nullable().optional(),
  model: z.string().min(1, 'Model is required'),
  isMusicMode: z.boolean().optional(),
});

// User preferences validation
export const userPreferencesSchema = z.object({
  theme: z.object({
    theme: z.enum(['light', 'dark', 'system']),
    primaryColor: z.string(),
    fontSize: z.enum(['sm', 'base', 'lg']),
    animations: z.boolean(),
  }),
  language: z.string(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sound: z.boolean(),
  }),
  privacy: z.object({
    analytics: z.boolean(),
    cookies: z.boolean(),
  }),
});

// File upload validation
export const fileUploadSchema = z.object({
  content: z.string().nullable(),
  name: z.string().nullable(),
  type: z.enum(['text', 'image']),
  dataUri: z.string().nullable().optional(),
});

// Search params validation
export const searchParamsSchema = z.object({
  query: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  filters: z.record(z.any()).optional(),
});

// Form validation helpers
export function validateField<T>(
  value: T,
  schema: z.ZodSchema<T>,
  fieldName: string
): { isValid: boolean; error?: string } {
  try {
    schema.parse(value);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        isValid: false,
        error: firstError.message,
      };
    }
    return {
      isValid: false,
      error: `Invalid ${fieldName}`,
    };
  }
}

export function validateForm<T extends Record<string, any>>(
  values: T,
  schema: z.ZodSchema<T>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  try {
    schema.parse(values);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Partial<Record<keyof T, string>> = {};
      
      error.errors.forEach((err) => {
        const path = err.path[0] as keyof T;
        if (path) {
          errors[path] = err.message;
        }
      });
      
      return { isValid: false, errors };
    }
    
    return {
      isValid: false,
      errors: { _form: 'Validation failed' } as any,
    };
  }
}

// Sanitization helpers
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 10000); // Limit length
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// Type guards
export function isValidEmail(value: string): boolean {
  return commonSchemas.email.safeParse(value).success;
}

export function isValidUrl(value: string): boolean {
  return commonSchemas.url.safeParse(value).success;
}

export function isValidUuid(value: string): boolean {
  return commonSchemas.uuid.safeParse(value).success;
}

// Custom validation rules
export const customValidators = {
  strongPassword: (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
  },
  
  noConsecutiveSpaces: (text: string): boolean => {
    return !/\s{2,}/.test(text);
  },
  
  validImageDataUri: (dataUri: string): boolean => {
    return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(dataUri);
  },
  
  validTextContent: (text: string): boolean => {
    return text.length > 0 && text.length <= 50000;
  },
};

// Validation middleware for API routes
export function validateRequestBody<T>(schema: z.ZodSchema<T>) {
  return (body: unknown): T => {
    try {
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError(ERROR_CODES.VALIDATION_ERROR, {
          errors: error.errors,
        });
      }
      throw createError(ERROR_CODES.VALIDATION_ERROR);
    }
  };
}

// Rate limiting validation
export function validateRateLimit(
  requests: number,
  windowMs: number,
  maxRequests: number
): boolean {
  return requests <= maxRequests;
}

// Content moderation helpers
export function containsProfanity(text: string): boolean {
  // Basic profanity filter - in production, use a proper service
  const profanityWords = ['spam', 'abuse']; // Add actual words
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

export function isSpam(text: string): boolean {
  // Basic spam detection
  const spamIndicators = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\/[^\s]+/gi, // Multiple URLs
    /\b(buy now|click here|free money)\b/gi, // Spam phrases
  ];
  
  return spamIndicators.some(pattern => pattern.test(text));
}

// File validation helpers
export function validateImageFile(file: File): void {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    throw createError(ERROR_CODES.FILE_TOO_LARGE, {
      maxSize: maxSize / (1024 * 1024) + 'MB',
    });
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw createError(ERROR_CODES.FILE_INVALID_TYPE, {
      allowedTypes: allowedTypes.join(', '),
    });
  }
}

export function validateTextFile(file: File): void {
  const maxSize = 1 * 1024 * 1024; // 1MB
  const allowedTypes = ['text/plain', 'text/markdown'];
  
  if (file.size > maxSize) {
    throw createError(ERROR_CODES.FILE_TOO_LARGE, {
      maxSize: maxSize / (1024 * 1024) + 'MB',
    });
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw createError(ERROR_CODES.FILE_INVALID_TYPE, {
      allowedTypes: allowedTypes.join(', '),
    });
  }
}