import {
  cn,
  slugify,
  formatDate,
  formatRelativeTime,
  truncate,
  capitalize,
  formatBytes,
  clamp,
  chunk,
  unique,
  groupBy,
  pick,
  omit,
  debounce,
  throttle,
  isString,
  isNumber,
  isEmpty,
} from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test & Example!')).toBe('test-example');
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Dec 25, 2023/);
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2023-12-25');
      expect(formatted).toMatch(/Dec 25, 2023/);
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-12-25 12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return "just now" for recent times', () => {
      const recent = new Date('2023-12-25 11:59:30');
      expect(formatRelativeTime(recent)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const fiveMinutesAgo = new Date('2023-12-25 11:55:00');
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('should return hours ago', () => {
      const twoHoursAgo = new Date('2023-12-25 10:00:00');
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('This is a long text', 10)).toBe('This is...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Short', 10)).toBe('Short');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('clamp', () => {
    it('should clamp values within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
    });
  });

  describe('unique', () => {
    it('should remove duplicates', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('groupBy', () => {
    it('should group items by key function', () => {
      const items = [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' },
        { type: 'vegetable', name: 'carrot' },
      ];
      
      const grouped = groupBy(items, item => item.type);
      
      expect(grouped.fruit).toHaveLength(2);
      expect(grouped.vegetable).toHaveLength(1);
    });
  });

  describe('pick', () => {
    it('should pick specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys from object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const fn = jest.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle function calls', () => {
      const fn = jest.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);

      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('type guards', () => {
    describe('isString', () => {
      it('should correctly identify strings', () => {
        expect(isString('hello')).toBe(true);
        expect(isString(123)).toBe(false);
        expect(isString(null)).toBe(false);
      });
    });

    describe('isNumber', () => {
      it('should correctly identify numbers', () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber('123')).toBe(false);
        expect(isNumber(NaN)).toBe(false);
      });
    });

    describe('isEmpty', () => {
      it('should correctly identify empty values', () => {
        expect(isEmpty('')).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({})).toBe(true);
        expect(isEmpty(null)).toBe(true);
        expect(isEmpty(undefined)).toBe(true);
        expect(isEmpty('hello')).toBe(false);
        expect(isEmpty([1])).toBe(false);
        expect(isEmpty({ a: 1 })).toBe(false);
      });
    });
  });
});