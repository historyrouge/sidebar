import { createError, ERROR_CODES } from './error-handler';

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  DEFAULT_SRC: ["'self'"],
  SCRIPT_SRC: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.youtube.com"],
  STYLE_SRC: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  IMG_SRC: ["'self'", "data:", "https:", "blob:"],
  FONT_SRC: ["'self'", "https://fonts.gstatic.com"],
  CONNECT_SRC: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com"],
  FRAME_SRC: ["'self'", "https://www.youtube.com"],
  MEDIA_SRC: ["'self'", "blob:"],
} as const;

export function generateCSPHeader(): string {
  const directives = Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => {
      const directiveName = key.toLowerCase().replace(/_/g, '-');
      return `${directiveName} ${values.join(' ')}`;
    })
    .join('; ');
  
  return directives;
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 10000); // Limit length
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/style="[^"]*"/gi, ''); // Remove inline styles
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    return parsed.toString();
  } catch {
    throw createError(ERROR_CODES.INVALID_FORMAT, { field: 'url', value: url });
  }
}

// Rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.limits.set(identifier, newEntry);
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    this.limits.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  reset(identifier: string): void {
    this.limits.delete(identifier);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// CSRF protection
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  return token === expectedToken;
}

// Password security
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  if (password.length >= 12) {
    score += 1;
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain lowercase letters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain uppercase letters');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain numbers');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain special characters');
  }

  // Common password checks
  const commonPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty',
    'letmein', 'welcome', 'monkey', '1234567890'
  ];
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    score -= 2;
    feedback.push('Password should not contain common words');
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Password should not contain repeated characters');
  }

  return {
    isValid: score >= 4,
    score: Math.max(0, Math.min(6, score)),
    feedback,
  };
}

// File security
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

export function scanFileContent(content: string): {
  isSafe: boolean;
  threats: string[];
} {
  const threats: string[] = [];
  
  // Check for potential script injections
  if (/<script/i.test(content)) {
    threats.push('Contains script tags');
  }
  
  if (/javascript:/i.test(content)) {
    threats.push('Contains javascript: URLs');
  }
  
  if (/on\w+=/i.test(content)) {
    threats.push('Contains event handlers');
  }
  
  // Check for potential data exfiltration
  if (/data:.*base64/i.test(content)) {
    threats.push('Contains base64 encoded data');
  }
  
  // Check for suspicious patterns
  if (/eval\s*\(/i.test(content)) {
    threats.push('Contains eval() calls');
  }
  
  if (/document\.cookie/i.test(content)) {
    threats.push('Accesses document.cookie');
  }
  
  return {
    isSafe: threats.length === 0,
    threats,
  };
}

// API security
export function validateApiKey(apiKey: string): boolean {
  // Basic API key validation
  if (!apiKey || typeof apiKey !== 'string') return false;
  if (apiKey.length < 20) return false;
  if (!/^[a-zA-Z0-9_-]+$/.test(apiKey)) return false;
  return true;
}

export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'apikey', 'api_key',
    'auth', 'authorization', 'credential', 'private'
  ];

  const masked = { ...data };

  for (const [key, value] of Object.entries(masked)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      if (typeof value === 'string' && value.length > 0) {
        masked[key] = '*'.repeat(Math.min(value.length, 8));
      }
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    }
  }

  return masked;
}

// Request validation
export function validateRequestOrigin(origin: string, allowedOrigins: string[]): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin) || allowedOrigins.includes('*');
}

export function validateUserAgent(userAgent: string): boolean {
  if (!userAgent) return false;
  
  // Block known bad user agents
  const blockedPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
  ];
  
  // Allow legitimate browsers and mobile apps
  const allowedPatterns = [
    /Mozilla/i,
    /Chrome/i,
    /Safari/i,
    /Firefox/i,
    /Edge/i,
    /Opera/i,
  ];
  
  const isBlocked = blockedPatterns.some(pattern => pattern.test(userAgent));
  const isAllowed = allowedPatterns.some(pattern => pattern.test(userAgent));
  
  return !isBlocked && isAllowed;
}

// Session security
export function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateSessionTimeout(lastActivity: number, timeoutMs: number = 30 * 60 * 1000): boolean {
  return Date.now() - lastActivity < timeoutMs;
}

// Content filtering
export function containsProfanity(text: string): boolean {
  // Basic profanity filter - in production, use a proper service
  const profanityWords = [
    // Add actual profanity words here
    'spam', 'abuse', 'scam'
  ];
  
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

export function isSpamContent(text: string): boolean {
  const spamIndicators = [
    /(.)\1{10,}/, // Repeated characters
    /https?:\/\/[^\s]+/gi, // Multiple URLs
    /\b(buy now|click here|free money|urgent|limited time)\b/gi,
    /\b(viagra|casino|lottery|winner)\b/gi,
  ];
  
  let spamScore = 0;
  
  spamIndicators.forEach(pattern => {
    if (pattern.test(text)) {
      spamScore++;
    }
  });
  
  // Check for excessive capitalization
  const uppercaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (uppercaseRatio > 0.5) {
    spamScore++;
  }
  
  // Check for excessive punctuation
  const punctuationRatio = (text.match(/[!?]{2,}/g) || []).length;
  if (punctuationRatio > 3) {
    spamScore++;
  }
  
  return spamScore >= 2;
}

// Encryption helpers (for client-side use)
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

// Environment validation
export function validateEnvironment(): {
  isSecure: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let isSecure = true;

  // Check if running in production
  if (process.env.NODE_ENV !== 'production') {
    warnings.push('Not running in production mode');
  }

  // Check for required environment variables
  const requiredEnvVars = ['NEXT_PUBLIC_FIREBASE_API_KEY', 'OPENAI_API_KEY'];
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(`Missing required environment variable: ${envVar}`);
      isSecure = false;
    }
  });

  // Check for HTTPS in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    if (window.location.protocol !== 'https:') {
      warnings.push('Not using HTTPS in production');
      isSecure = false;
    }
  }

  return { isSecure, warnings };
}

// Audit logging
export interface SecurityEvent {
  type: 'auth' | 'access' | 'error' | 'suspicious';
  action: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // In production, send to security monitoring service
  console.log('Security Event:', maskSensitiveData(fullEvent));
  
  // Example: Send to monitoring service
  // securityMonitor.log(fullEvent);
}