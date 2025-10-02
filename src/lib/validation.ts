/**
 * Advanced Validation System
 * Comprehensive input validation with detailed error messages
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class Validator {
  /**
   * Validate required field
   */
  static required(value: any, fieldName: string = 'Field'): ValidationResult {
    const valid = value !== null && value !== undefined && value !== '';
    return {
      valid,
      errors: valid ? [] : [`${fieldName} is required`],
    };
  }

  /**
   * Validate email address
   */
  static email(value: string): ValidationResult {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const valid = emailRegex.test(value);
    return {
      valid,
      errors: valid ? [] : ['Invalid email address'],
    };
  }

  /**
   * Validate URL
   */
  static url(value: string): ValidationResult {
    try {
      new URL(value);
      return { valid: true, errors: [] };
    } catch {
      return { valid: false, errors: ['Invalid URL format'] };
    }
  }

  /**
   * Validate minimum length
   */
  static minLength(value: string, min: number, fieldName: string = 'Field'): ValidationResult {
    const valid = value.length >= min;
    return {
      valid,
      errors: valid ? [] : [`${fieldName} must be at least ${min} characters long`],
    };
  }

  /**
   * Validate maximum length
   */
  static maxLength(value: string, max: number, fieldName: string = 'Field'): ValidationResult {
    const valid = value.length <= max;
    return {
      valid,
      errors: valid ? [] : [`${fieldName} must be at most ${max} characters long`],
    };
  }

  /**
   * Validate length range
   */
  static lengthRange(value: string, min: number, max: number, fieldName: string = 'Field'): ValidationResult {
    const valid = value.length >= min && value.length <= max;
    return {
      valid,
      errors: valid ? [] : [`${fieldName} must be between ${min} and ${max} characters long`],
    };
  }

  /**
   * Validate minimum number
   */
  static min(value: number, min: number, fieldName: string = 'Value'): ValidationResult {
    const valid = value >= min;
    return {
      valid,
      errors: valid ? [] : [`${fieldName} must be at least ${min}`],
    };
  }

  /**
   * Validate maximum number
   */
  static max(value: number, max: number, fieldName: string = 'Value'): ValidationResult {
    const valid = value <= max;
    return {
      valid,
      errors: valid ? [] : [`${fieldName} must be at most ${max}`],
    };
  }

  /**
   * Validate number range
   */
  static range(value: number, min: number, max: number, fieldName: string = 'Value'): ValidationResult {
    const valid = value >= min && value <= max;
    return {
      valid,
      errors: valid ? [] : [`${fieldName} must be between ${min} and ${max}`],
    };
  }

  /**
   * Validate pattern (regex)
   */
  static pattern(value: string, pattern: RegExp, message: string = 'Invalid format'): ValidationResult {
    const valid = pattern.test(value);
    return {
      valid,
      errors: valid ? [] : [message],
    };
  }

  /**
   * Validate phone number
   */
  static phone(value: string): ValidationResult {
    // Simple international phone number validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
    const valid = phoneRegex.test(value) && cleanPhone.length >= 10 && cleanPhone.length <= 15;
    return {
      valid,
      errors: valid ? [] : ['Invalid phone number'],
    };
  }

  /**
   * Validate password strength
   */
  static password(value: string, options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
  }): ValidationResult {
    const opts = {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
      ...options,
    };

    const errors: string[] = [];

    if (value.length < opts.minLength) {
      errors.push(`Password must be at least ${opts.minLength} characters long`);
    }

    if (opts.requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (opts.requireLowercase && !/[a-z]/.test(value)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (opts.requireNumber && !/\d/.test(value)) {
      errors.push('Password must contain at least one number');
    }

    if (opts.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate file type
   */
  static fileType(file: File, allowedTypes: string[]): ValidationResult {
    const valid = allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.toLowerCase().includes(type.toLowerCase());
    });

    return {
      valid,
      errors: valid ? [] : [`File type must be one of: ${allowedTypes.join(', ')}`],
    };
  }

  /**
   * Validate file size
   */
  static fileSize(file: File, maxSizeMB: number): ValidationResult {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const valid = file.size <= maxSizeBytes;
    return {
      valid,
      errors: valid ? [] : [`File size must be less than ${maxSizeMB}MB`],
    };
  }

  /**
   * Validate date
   */
  static date(value: string | Date): ValidationResult {
    const date = typeof value === 'string' ? new Date(value) : value;
    const valid = date instanceof Date && !isNaN(date.getTime());
    return {
      valid,
      errors: valid ? [] : ['Invalid date'],
    };
  }

  /**
   * Validate date is in the future
   */
  static futureDate(value: string | Date): ValidationResult {
    const dateResult = this.date(value);
    if (!dateResult.valid) return dateResult;

    const date = typeof value === 'string' ? new Date(value) : value;
    const valid = date > new Date();
    return {
      valid,
      errors: valid ? [] : ['Date must be in the future'],
    };
  }

  /**
   * Validate date is in the past
   */
  static pastDate(value: string | Date): ValidationResult {
    const dateResult = this.date(value);
    if (!dateResult.valid) return dateResult;

    const date = typeof value === 'string' ? new Date(value) : value;
    const valid = date < new Date();
    return {
      valid,
      errors: valid ? [] : ['Date must be in the past'],
    };
  }

  /**
   * Validate age requirement
   */
  static age(birthDate: string | Date, minAge: number): ValidationResult {
    const dateResult = this.date(birthDate);
    if (!dateResult.valid) return dateResult;

    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    const valid = age >= minAge;
    return {
      valid,
      errors: valid ? [] : [`You must be at least ${minAge} years old`],
    };
  }

  /**
   * Validate credit card number (Luhn algorithm)
   */
  static creditCard(value: string): ValidationResult {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      return { valid: false, errors: ['Invalid credit card number length'] };
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    const valid = sum % 10 === 0;
    return {
      valid,
      errors: valid ? [] : ['Invalid credit card number'],
    };
  }

  /**
   * Validate JSON string
   */
  static json(value: string): ValidationResult {
    try {
      JSON.parse(value);
      return { valid: true, errors: [] };
    } catch {
      return { valid: false, errors: ['Invalid JSON format'] };
    }
  }

  /**
   * Validate hex color code
   */
  static hexColor(value: string): ValidationResult {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const valid = hexRegex.test(value);
    return {
      valid,
      errors: valid ? [] : ['Invalid hex color code'],
    };
  }

  /**
   * Validate array is not empty
   */
  static arrayNotEmpty<T>(value: T[], fieldName: string = 'Array'): ValidationResult {
    const valid = Array.isArray(value) && value.length > 0;
    return {
      valid,
      errors: valid ? [] : [`${fieldName} must contain at least one item`],
    };
  }

  /**
   * Validate array length
   */
  static arrayLength<T>(value: T[], min: number, max: number, fieldName: string = 'Array'): ValidationResult {
    const valid = Array.isArray(value) && value.length >= min && value.length <= max;
    return {
      valid,
      errors: valid ? [] : [`${fieldName} must contain between ${min} and ${max} items`],
    };
  }

  /**
   * Combine multiple validation results
   */
  static combine(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(r => r.errors);
    return {
      valid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Custom validation function
   */
  static custom(
    value: any,
    validator: (value: any) => boolean,
    errorMessage: string
  ): ValidationResult {
    const valid = validator(value);
    return {
      valid,
      errors: valid ? [] : [errorMessage],
    };
  }
}

/**
 * Form validation helper
 */
export class FormValidator {
  private fields: Map<string, ValidationResult> = new Map();

  /**
   * Add field validation result
   */
  addField(fieldName: string, result: ValidationResult): this {
    this.fields.set(fieldName, result);
    return this;
  }

  /**
   * Check if form is valid
   */
  isValid(): boolean {
    return Array.from(this.fields.values()).every(result => result.valid);
  }

  /**
   * Get all errors
   */
  getErrors(): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    this.fields.forEach((result, fieldName) => {
      if (!result.valid) {
        errors[fieldName] = result.errors;
      }
    });
    return errors;
  }

  /**
   * Get errors for specific field
   */
  getFieldErrors(fieldName: string): string[] {
    return this.fields.get(fieldName)?.errors || [];
  }

  /**
   * Get first error message
   */
  getFirstError(): string | null {
    for (const result of this.fields.values()) {
      if (!result.valid && result.errors.length > 0) {
        return result.errors[0];
      }
    }
    return null;
  }

  /**
   * Clear all validations
   */
  clear(): void {
    this.fields.clear();
  }
}

/**
 * Sanitization utilities
 */
export class Sanitizer {
  /**
   * Sanitize HTML (remove dangerous tags and attributes)
   */
  static html(value: string): string {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  /**
   * Sanitize for URL
   */
  static url(value: string): string {
    return encodeURIComponent(value);
  }

  /**
   * Remove special characters
   */
  static removeSpecialChars(value: string): string {
    return value.replace(/[^\w\s-]/g, '');
  }

  /**
   * Remove extra whitespace
   */
  static trimWhitespace(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  /**
   * Remove numbers
   */
  static removeNumbers(value: string): string {
    return value.replace(/\d/g, '');
  }

  /**
   * Keep only numbers
   */
  static keepOnlyNumbers(value: string): string {
    return value.replace(/\D/g, '');
  }

  /**
   * Normalize phone number
   */
  static phone(value: string): string {
    return value.replace(/\D/g, '');
  }

  /**
   * Capitalize first letter
   */
  static capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  /**
   * Convert to lowercase
   */
  static lowercase(value: string): string {
    return value.toLowerCase();
  }

  /**
   * Convert to uppercase
   */
  static uppercase(value: string): string {
    return value.toUpperCase();
  }
}
