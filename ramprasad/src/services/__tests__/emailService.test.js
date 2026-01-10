/**
 * Unit tests for EmailJS Service Wrapper
 */

import emailService, { EmailJSService, SERVICE_CONFIG } from '../emailService';
import { debugLogger, errorTracker, ERROR_CATEGORIES } from '../../utils/debugUtils';
import { validateEmailJSConfig, validateFormData, EMAILJS_CONFIG } from '../../utils/emailJSValidator';

// Mock dependencies
jest.mock('@emailjs/browser', () => ({
  default: {
    init: jest.fn(),
    sendForm: jest.fn(),
    send: jest.fn()
  }
}));

const mockEmailJS = require('@emailjs/browser').default;

jest.mock('../../utils/debugUtils', () => ({
  debugLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  },
  errorTracker: {
    trackError: jest.fn(),
    trackEmailJSError: jest.fn()
  },
  ERROR_CATEGORIES: {
    NETWORK: 'NETWORK',
    SERVICE: 'SERVICE',
    CONFIGURATION: 'CONFIGURATION',
    VALIDATION: 'VALIDATION',
    UNKNOWN: 'UNKNOWN'
  }
}));

jest.mock('../../utils/emailJSValidator', () => ({
  validateEmailJSConfig: jest.fn(),
  validateFormData: jest.fn(),
  EMAILJS_CONFIG: {
    SERVICE_ID: 'service_test',
    TEMPLATE_ID: 'template_test',
    PUBLIC_KEY: 'test_public_key'
  }
}));

describe('EmailJSService', () => {
  let service;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh service instance
    service = new EmailJSService();
    
    // Setup default mock returns
    validateEmailJSConfig.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    });
    
    validateFormData.mockReturnValue({
      isValid: true,
      errors: []
    });
    
    errorTracker.trackError.mockImplementation((error) => error);
    errorTracker.trackEmailJSError.mockImplementation((error) => error);
  });

  afterEach(() => {
    service.reset();
  });

  describe('initialization', () => {
    it('should initialize successfully with valid configuration', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      
      const result = await service.initialize();
      
      expect(result).toBe(true);
      expect(service.isInitialized).toBe(true);
      expect(mockEmailJS.init).toHaveBeenCalledWith(EMAILJS_CONFIG.PUBLIC_KEY);
      expect(debugLogger.info).toHaveBeenCalledWith(
        'SERVICE',
        'EmailJS service initialized successfully',
        expect.any(Object)
      );
    });

    it('should fail initialization with invalid configuration', async () => {
      validateEmailJSConfig.mockReturnValue({
        isValid: false,
        errors: ['SERVICE_ID is missing'],
        warnings: []
      });

      await expect(service.initialize()).rejects.toThrow('EmailJS configuration validation failed');
      expect(service.isInitialized).toBe(false);
      expect(mockEmailJS.init).not.toHaveBeenCalled();
    });

    it('should handle multiple initialization calls correctly', async () => {
      mockEmailJS.init.mockImplementation(() => {});
      
      const [result1, result2] = await Promise.all([
        service.initialize(),
        service.initialize()
      ]);
      
      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockEmailJS.init).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization failure and allow retry', async () => {
      mockEmailJS.init.mockRejectedValueOnce(new Error('Init failed'));
      mockEmailJS.init.mockResolvedValueOnce(true);
      
      await expect(service.initialize()).rejects.toThrow('Init failed');
      expect(service.isInitialized).toBe(false);
      
      const result = await service.initialize();
      expect(result).toBe(true);
      expect(service.isInitialized).toBe(true);
    });
  });

  describe('sendEmail', () => {
    const validFormData = {
      user_name: 'Test User',
      user_email: 'test@example.com',
      message: 'Test message'
    };

    beforeEach(() => {
      mockEmailJS.init.mockResolvedValue(true);
    });

    it('should send email successfully with form data', async () => {
      const mockResult = { status: 200, text: 'OK' };
      mockEmailJS.send.mockResolvedValue(mockResult);
      
      const result = await service.sendEmail(validFormData);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Email sent successfully');
      expect(result.details).toEqual(mockResult);
      expect(mockEmailJS.send).toHaveBeenCalledWith(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        validFormData,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
    });

    it('should send email successfully with form element', async () => {
      const mockResult = { status: 200, text: 'OK' };
      const mockFormElement = document.createElement('form');
      mockEmailJS.sendForm.mockResolvedValue(mockResult);
      
      const result = await service.sendEmail(validFormData, mockFormElement);
      
      expect(result.success).toBe(true);
      expect(mockEmailJS.sendForm).toHaveBeenCalledWith(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        mockFormElement,
        EMAILJS_CONFIG.PUBLIC_KEY
      );
    });

    it('should fail with invalid form data', async () => {
      validateFormData.mockReturnValue({
        isValid: false,
        errors: ['Email is required']
      });
      
      const result = await service.sendEmail({ user_name: 'Test' });
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('check your form data');
      expect(mockEmailJS.send).not.toHaveBeenCalled();
    });

    it('should retry on network errors', async () => {
      const networkError = new Error('Network error');
      networkError.category = ERROR_CATEGORIES.NETWORK;
      
      mockEmailJS.send
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ status: 200, text: 'OK' });
      
      const result = await service.sendEmail(validFormData);
      
      expect(result.success).toBe(true);
      expect(mockEmailJS.send).toHaveBeenCalledTimes(3);
    });

    it('should not retry on configuration errors', async () => {
      const configError = new Error('Config error');
      configError.category = ERROR_CATEGORIES.CONFIGURATION;
      
      mockEmailJS.send.mockRejectedValue(configError);
      
      const result = await service.sendEmail(validFormData);
      
      expect(result.success).toBe(false);
      expect(mockEmailJS.send).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retry attempts', async () => {
      const networkError = new Error('Network error');
      networkError.category = ERROR_CATEGORIES.NETWORK;
      
      mockEmailJS.send.mockRejectedValue(networkError);
      
      const result = await service.sendEmail(validFormData);
      
      expect(result.success).toBe(false);
      expect(mockEmailJS.send).toHaveBeenCalledTimes(SERVICE_CONFIG.MAX_RETRY_ATTEMPTS);
    });

    it('should handle timeout errors', async () => {
      // Mock a long-running request that exceeds timeout
      mockEmailJS.send.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, SERVICE_CONFIG.REQUEST_TIMEOUT_MS + 1000))
      );
      
      const result = await service.sendEmail(validFormData);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('internet connection');
    });

    it('should categorize different error types correctly', async () => {
      const testCases = [
        {
          error: { message: 'network failed' },
          expectedCategory: ERROR_CATEGORIES.NETWORK,
          expectedMessage: 'internet connection'
        },
        {
          error: { message: 'service unavailable' },
          expectedCategory: ERROR_CATEGORIES.SERVICE,
          expectedMessage: 'temporarily unavailable'
        },
        {
          error: { status: 400 },
          expectedCategory: ERROR_CATEGORIES.VALIDATION,
          expectedMessage: 'form data'
        }
      ];

      for (const testCase of testCases) {
        service.reset();
        mockEmailJS.init.mockResolvedValue(true);
        mockEmailJS.send.mockRejectedValue(testCase.error);
        
        const result = await service.sendEmail(validFormData);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain(testCase.expectedMessage);
      }
    });
  });

  describe('testConnectivity', () => {
    beforeEach(() => {
      mockEmailJS.init.mockResolvedValue(true);
    });

    it('should pass connectivity test when service is working', async () => {
      const result = await service.testConnectivity();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Service connectivity test passed');
      expect(result.config).toEqual({
        serviceId: EMAILJS_CONFIG.SERVICE_ID,
        templateId: EMAILJS_CONFIG.TEMPLATE_ID,
        initialized: true
      });
    });

    it('should fail connectivity test when initialization fails', async () => {
      validateEmailJSConfig.mockReturnValue({
        isValid: false,
        errors: ['Configuration error'],
        warnings: []
      });
      
      const result = await service.testConnectivity();
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Service connectivity test failed');
      expect(result.error).toBeDefined();
    });
  });

  describe('getStatus', () => {
    it('should return correct status information', () => {
      service.isInitialized = true;
      
      const status = service.getStatus();
      
      expect(status).toEqual({
        initialized: true,
        timestamp: expect.any(String),
        configuration: expect.any(Object),
        libraryLoaded: true,
        config: {
          maxRetryAttempts: SERVICE_CONFIG.MAX_RETRY_ATTEMPTS,
          retryDelay: SERVICE_CONFIG.RETRY_DELAY_MS,
          requestTimeout: SERVICE_CONFIG.REQUEST_TIMEOUT_MS
        }
      });
    });
  });

  describe('reset', () => {
    it('should reset service state correctly', async () => {
      mockEmailJS.init.mockResolvedValue(true);
      
      await service.initialize();
      expect(service.isInitialized).toBe(true);
      
      service.reset();
      expect(service.isInitialized).toBe(false);
      expect(service.initializationPromise).toBe(null);
    });
  });

  describe('error handling and logging', () => {
    beforeEach(() => {
      mockEmailJS.init.mockResolvedValue(true);
    });

    it('should log all operations appropriately', async () => {
      const mockResult = { status: 200, text: 'OK' };
      mockEmailJS.send.mockResolvedValue(mockResult);
      
      await service.sendEmail({
        user_name: 'Test',
        user_email: 'test@example.com',
        message: 'Test message'
      });
      
      expect(debugLogger.info).toHaveBeenCalledWith(
        'SERVICE',
        'Email send request initiated',
        expect.any(Object)
      );
      expect(debugLogger.info).toHaveBeenCalledWith(
        'SERVICE',
        'Email sent successfully',
        expect.any(Object)
      );
    });

    it('should track errors with proper context', async () => {
      const testError = new Error('Test error');
      mockEmailJS.send.mockRejectedValue(testError);
      
      await service.sendEmail({
        user_name: 'Test',
        user_email: 'test@example.com',
        message: 'Test message'
      });
      
      expect(errorTracker.trackEmailJSError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('exponential backoff', () => {
    beforeEach(() => {
      mockEmailJS.init.mockResolvedValue(true);
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should implement exponential backoff for retries', async () => {
      const networkError = new Error('Network error');
      networkError.category = ERROR_CATEGORIES.NETWORK;
      
      mockEmailJS.send
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ status: 200, text: 'OK' });
      
      const sendPromise = service.sendEmail({
        user_name: 'Test',
        user_email: 'test@example.com',
        message: 'Test message'
      });
      
      // Fast-forward through the delays
      jest.advanceTimersByTime(SERVICE_CONFIG.RETRY_DELAY_MS);
      jest.advanceTimersByTime(SERVICE_CONFIG.RETRY_DELAY_MS * 2);
      
      const result = await sendPromise;
      
      expect(result.success).toBe(true);
      expect(mockEmailJS.send).toHaveBeenCalledTimes(3);
    });
  });
});

describe('EmailJS Service Singleton', () => {
  it('should export a singleton instance', () => {
    expect(emailService).toBeInstanceOf(EmailJSService);
  });

  it('should maintain state across imports', async () => {
    // This test ensures the singleton pattern works correctly
    const { default: emailService1 } = await import('../emailService');
    const { default: emailService2 } = await import('../emailService');
    
    expect(emailService1).toBe(emailService2);
  });
});