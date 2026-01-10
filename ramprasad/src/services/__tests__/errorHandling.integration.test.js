/**
 * Integration tests for comprehensive error handling in EmailJS service
 */

import { ERROR_CATEGORIES, ERROR_CODES } from '../../utils/debugUtils';

// Mock EmailJS to simulate different error scenarios
jest.mock('@emailjs/browser', () => ({
  default: {
    init: jest.fn(),
    send: jest.fn(),
    sendForm: jest.fn()
  }
}));

const mockEmailJS = require('@emailjs/browser').default;

// Import after mocking
import emailService from '../emailService';

describe('EmailJS Service - Comprehensive Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    emailService.reset();
  });

  describe('Network Error Handling', () => {
    it('should handle timeout errors with specific messaging', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      const timeoutError = new Error('Request timed out');
      mockEmailJS.send.mockRejectedValue(timeoutError);

      const result = await emailService.sendEmail({
        user_name: 'Test User',
        user_email: 'test@example.com',
        message: 'Test message'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('timed out');
      expect(result.error.category).toBe(ERROR_CATEGORIES.NETWORK);
      expect(result.error.code).toBe(ERROR_CODES.TIMEOUT);
    });

    it('should handle offline errors', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      const offlineError = new Error('Network offline');
      mockEmailJS.send.mockRejectedValue(offlineError);

      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const result = await emailService.sendEmail({
        user_name: 'Test User',
        user_email: 'test@example.com',
        message: 'Test message'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('offline');
      expect(result.error.category).toBe(ERROR_CATEGORIES.NETWORK);
      expect(result.error.code).toBe(ERROR_CODES.OFFLINE);
    });
  });

  describe('Service Error Handling', () => {
    it('should handle rate limiting errors', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      const rateLimitError = new Error('Too many requests');
      rateLimitError.status = 429;
      mockEmailJS.send.mockRejectedValue(rateLimitError);

      const result = await emailService.sendEmail({
        user_name: 'Test User',
        user_email: 'test@example.com',
        message: 'Test message'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many requests');
      expect(result.error.category).toBe(ERROR_CATEGORIES.SERVICE);
      expect(result.error.code).toBe(ERROR_CODES.RATE_LIMITED);
    });

    it('should handle service unavailable errors', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      const serviceError = new Error('Service unavailable');
      serviceError.status = 503;
      mockEmailJS.send.mockRejectedValue(serviceError);

      const result = await emailService.sendEmail({
        user_name: 'Test User',
        user_email: 'test@example.com',
        message: 'Test message'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('temporarily unavailable');
      expect(result.error.category).toBe(ERROR_CATEGORIES.SERVICE);
      expect(result.error.code).toBe(ERROR_CODES.SERVICE_UNAVAILABLE);
    });
  });

  describe('Configuration Error Handling', () => {
    it('should handle invalid API key errors', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      const authError = new Error('Unauthorized');
      authError.status = 401;
      mockEmailJS.send.mockRejectedValue(authError);

      const result = await emailService.sendEmail({
        user_name: 'Test User',
        user_email: 'test@example.com',
        message: 'Test message'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('authentication failed');
      expect(result.error.category).toBe(ERROR_CATEGORIES.CONFIGURATION);
      expect(result.error.code).toBe(ERROR_CODES.INVALID_API_KEY);
    });
  });

  describe('Fallback Error Handling', () => {
    it('should provide fallback messages for unknown errors', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      const unknownError = new Error('Something weird happened');
      mockEmailJS.send.mockRejectedValue(unknownError);

      const result = await emailService.sendEmail({
        user_name: 'Test User',
        user_email: 'test@example.com',
        message: 'Test message'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('unexpected error');
      expect(result.error.category).toBe(ERROR_CATEGORIES.UNKNOWN);
      expect(result.error.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
    });

    it('should handle errors without messages', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      const emptyError = new Error('');
      mockEmailJS.send.mockRejectedValue(emptyError);

      const result = await emailService.sendEmail({
        user_name: 'Test User',
        user_email: 'test@example.com',
        message: 'Test message'
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('unexpected error');
    });
  });

  describe('Error Categorization', () => {
    it('should correctly categorize different error types', async () => {
      mockEmailJS.init.mockImplementation(() => {});

      const testCases = [
        {
          error: { message: 'network error', status: 0 },
          expectedCategory: ERROR_CATEGORIES.NETWORK,
          expectedCode: ERROR_CODES.NETWORK_ERROR
        },
        {
          error: { message: 'rate limit exceeded', status: 429 },
          expectedCategory: ERROR_CATEGORIES.SERVICE,
          expectedCode: ERROR_CODES.RATE_LIMITED
        },
        {
          error: { message: 'invalid key', status: 401 },
          expectedCategory: ERROR_CATEGORIES.CONFIGURATION,
          expectedCode: ERROR_CODES.INVALID_API_KEY
        },
        {
          error: { message: 'validation failed', status: 400 },
          expectedCategory: ERROR_CATEGORIES.VALIDATION,
          expectedCode: ERROR_CODES.VALIDATION_FAILED
        }
      ];

      for (const testCase of testCases) {
        const error = new Error(testCase.error.message);
        error.status = testCase.error.status;
        mockEmailJS.send.mockRejectedValueOnce(error);

        const result = await emailService.sendEmail({
          user_name: 'Test User',
          user_email: 'test@example.com',
          message: 'Test message'
        });

        expect(result.success).toBe(false);
        expect(result.error.category).toBe(testCase.expectedCategory);
        expect(result.error.code).toBe(testCase.expectedCode);
      }
    });
  });
});