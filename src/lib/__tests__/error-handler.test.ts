import {
  AppErrorClass,
  ERROR_CODES,
  ERROR_MESSAGES,
  createError,
  handleError,
  withErrorHandling,
  withRetry,
  isNetworkError,
  withTimeout,
  validateRequired,
  validateEmail,
} from '../error-handler';

describe('error-handler', () => {
  describe('AppErrorClass', () => {
    it('should create error with correct properties', () => {
      const error = new AppErrorClass('TEST_CODE', 'Test message', { detail: 'test' });
      
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.timestamp).toBeDefined();
    });

    it('should serialize to JSON correctly', () => {
      const error = new AppErrorClass('TEST_CODE', 'Test message');
      const json = error.toJSON();
      
      expect(json.code).toBe('TEST_CODE');
      expect(json.message).toBe('Test message');
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('createError', () => {
    it('should create error with predefined message', () => {
      const error = createError('AUTH_REQUIRED');
      
      expect(error.code).toBe('AUTH_REQUIRED');
      expect(error.message).toBe(ERROR_MESSAGES.AUTH_REQUIRED);
    });

    it('should create error with details', () => {
      const error = createError('VALIDATION_ERROR', { field: 'email' });
      
      expect(error.details).toEqual({ field: 'email' });
    });
  });

  describe('handleError', () => {
    it('should handle AppErrorClass instances', () => {
      const appError = new AppErrorClass('TEST_CODE', 'Test message');
      const handled = handleError(appError);
      
      expect(handled.code).toBe('TEST_CODE');
      expect(handled.message).toBe('Test message');
    });

    it('should handle regular Error instances', () => {
      const error = new Error('Regular error');
      const handled = handleError(error);
      
      expect(handled.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(handled.message).toBe('Regular error');
    });

    it('should handle unknown error types', () => {
      const handled = handleError('string error');
      
      expect(handled.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
      expect(handled.message).toBe('An unexpected error occurred');
    });
  });

  describe('withErrorHandling', () => {
    it('should return data on success', async () => {
      const result = await withErrorHandling(async () => 'success');
      
      expect(result.data).toBe('success');
      expect(result.error).toBeUndefined();
    });

    it('should return error on failure', async () => {
      const result = await withErrorHandling(async () => {
        throw new Error('Test error');
      });
      
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Test error');
    });

    it('should return fallback on error', async () => {
      const result = await withErrorHandling(
        async () => {
          throw new Error('Test error');
        },
        'fallback'
      );
      
      expect(result.data).toBe('fallback');
      expect(result.error).toBeDefined();
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should succeed on first try', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      
      const promise = withRetry(fn, 3, 100);
      const result = await promise;
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');
      
      const promise = withRetry(fn, 3, 100);
      
      // Advance timers for retries
      setTimeout(() => {
        jest.advanceTimersByTime(100);
        setTimeout(() => {
          jest.advanceTimersByTime(200);
        }, 0);
      }, 0);
      
      const result = await promise;
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
      
      const promise = withRetry(fn, 2, 100);
      
      // Advance timers for retries
      setTimeout(() => {
        jest.advanceTimersByTime(100);
      }, 0);
      
      await expect(promise).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      expect(isNetworkError(new Error('fetch failed'))).toBe(true);
      expect(isNetworkError(new Error('NetworkError'))).toBe(true);
      expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
      expect(isNetworkError(new Error('Regular error'))).toBe(false);
      expect(isNetworkError('not an error')).toBe(false);
    });
  });

  describe('withTimeout', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should resolve if promise completes in time', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 1000);
      
      expect(result).toBe('success');
    });

    it('should reject if promise times out', async () => {
      const promise = new Promise(resolve => setTimeout(resolve, 2000));
      const timeoutPromise = withTimeout(promise, 1000);
      
      jest.advanceTimersByTime(1000);
      
      await expect(timeoutPromise).rejects.toThrow();
    });
  });

  describe('validation helpers', () => {
    describe('validateRequired', () => {
      it('should pass for valid values', () => {
        expect(() => validateRequired('value', 'field')).not.toThrow();
        expect(() => validateRequired(0, 'field')).not.toThrow();
        expect(() => validateRequired(false, 'field')).not.toThrow();
      });

      it('should throw for empty values', () => {
        expect(() => validateRequired('', 'field')).toThrow();
        expect(() => validateRequired(null, 'field')).toThrow();
        expect(() => validateRequired(undefined, 'field')).toThrow();
      });
    });

    describe('validateEmail', () => {
      it('should pass for valid emails', () => {
        expect(() => validateEmail('test@example.com')).not.toThrow();
        expect(() => validateEmail('user.name@domain.co.uk')).not.toThrow();
      });

      it('should throw for invalid emails', () => {
        expect(() => validateEmail('invalid-email')).toThrow();
        expect(() => validateEmail('test@')).toThrow();
        expect(() => validateEmail('@example.com')).toThrow();
      });
    });
  });
});