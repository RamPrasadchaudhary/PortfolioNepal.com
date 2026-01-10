/**
 * Unit tests for EmailJS validator utilities
 */

import {
  validateEmailJSConfig,
  testEmailJSConnectivity,
  validateFormData,
  getServiceStatus,
  EMAILJS_CONFIG
} from '../emailJSValidator';

// Mock dependencies
jest.mock('../debugUtils', () => ({
  debugLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  },
  errorTracker: {
    trackError: jest.fn()
  }
}));

// Mock EmailJS
jest.mock('@emailjs/browser', () => ({
  init: jest.fn()
}));

describe('validateEmailJSConfig', () => {
  it('should validate complete configuration successfully', () => {
    const result = validateEmailJSConfig();
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toBeInstanceOf(Array);
  });

  it('should detect missing configuration values', () => {
    // Temporarily modify config
    const originalServiceId = EMAILJS_CONFIG.SERVICE_ID;
    const originalTemplateId = EMAILJS_CONFIG.TEMPLATE_ID;
    const originalPublicKey = EMAILJS_CONFIG.PUBLIC_KEY;
    
    EMAILJS_CONFIG.SERVICE_ID = '';
    EMAILJS_CONFIG.TEMPLATE_ID = '';
    EMAILJS_CONFIG.PUBLIC_KEY = '';
    
    const result = validateEmailJSConfig();
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('SERVICE_ID is missing');
    expect(result.errors).toContain('TEMPLATE_ID is missing');
    expect(result.errors).toContain('PUBLIC_KEY is missing');
    
    // Restore original values
    EMAILJS_CONFIG.SERVICE_ID = originalServiceId;
    EMAILJS_CONFIG.TEMPLATE_ID = originalTemplateId;
    EMAILJS_CONFIG.PUBLIC_KEY = originalPublicKey;
  });

  it('should provide warnings for incorrect format', () => {
    // Temporarily modify config
    const originalServiceId = EMAILJS_CONFIG.SERVICE_ID;
    const originalTemplateId = EMAILJS_CONFIG.TEMPLATE_ID;
    const originalPublicKey = EMAILJS_CONFIG.PUBLIC_KEY;
    
    EMAILJS_CONFIG.SERVICE_ID = 'invalid_service_id';
    EMAILJS_CONFIG.TEMPLATE_ID = 'invalid_template_id';
    EMAILJS_CONFIG.PUBLIC_KEY = 'short';
    
    const result = validateEmailJSConfig();
    
    expect(result.warnings).toContain('SERVICE_ID should start with "service_"');
    expect(result.warnings).toContain('TEMPLATE_ID should start with "template_"');
    expect(result.warnings).toContain('PUBLIC_KEY seems too short');
    
    // Restore original values
    EMAILJS_CONFIG.SERVICE_ID = originalServiceId;
    EMAILJS_CONFIG.TEMPLATE_ID = originalTemplateId;
    EMAILJS_CONFIG.PUBLIC_KEY = originalPublicKey;
  });
});

describe('validateFormData', () => {
  it('should validate complete form data successfully', () => {
    const formData = {
      user_name: 'John Doe',
      user_email: 'john@example.com',
      message: 'This is a valid message with enough characters'
    };
    
    const result = validateFormData(formData);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const formData = {
      user_name: '',
      user_email: '',
      message: ''
    };
    
    const result = validateFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name is required');
    expect(result.errors).toContain('Email is required');
    expect(result.errors).toContain('Message is required');
  });

  it('should validate email format', () => {
    const formData = {
      user_name: 'John Doe',
      user_email: 'invalid-email',
      message: 'Valid message content'
    };
    
    const result = validateFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });

  it('should validate field lengths', () => {
    const formData = {
      user_name: 'A'.repeat(51), // Too long
      user_email: 'john@example.com',
      message: 'Short' // Too short
    };
    
    const result = validateFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name must be less than 50 characters');
    expect(result.errors).toContain('Message must be at least 10 characters');
  });

  it('should validate maximum message length', () => {
    const formData = {
      user_name: 'John Doe',
      user_email: 'john@example.com',
      message: 'A'.repeat(1001) // Too long
    };
    
    const result = validateFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Message must be less than 1000 characters');
  });

  it('should handle null and undefined values', () => {
    const formData = {
      user_name: null,
      user_email: undefined,
      message: ''
    };
    
    const result = validateFormData(formData);
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
});

describe('testEmailJSConnectivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass connectivity test when EmailJS is available', async () => {
    // Mock dynamic import
    const mockEmailJS = { init: jest.fn() };
    jest.doMock('@emailjs/browser', () => mockEmailJS);
    
    const result = await testEmailJSConnectivity();
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Service initialized successfully');
  });

  it('should fail when EmailJS library is not available', async () => {
    // Mock window.emailjs as undefined
    Object.defineProperty(window, 'emailjs', {
      value: undefined,
      writable: true
    });
    
    const result = await testEmailJSConnectivity();
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle timeout errors', async () => {
    jest.useFakeTimers();
    
    // Mock a slow import
    jest.doMock('@emailjs/browser', () => 
      new Promise(resolve => setTimeout(resolve, 15000))
    );
    
    const connectivityPromise = testEmailJSConnectivity();
    
    // Fast-forward past timeout
    jest.advanceTimersByTime(11000);
    
    const result = await connectivityPromise;
    
    expect(result.success).toBe(false);
    expect(result.error.message).toContain('timed out');
    
    jest.useRealTimers();
  });

  it('should handle initialization errors', async () => {
    const mockEmailJS = {
      init: jest.fn().mockImplementation(() => {
        throw new Error('Init failed');
      })
    };
    
    jest.doMock('@emailjs/browser', () => mockEmailJS);
    
    const result = await testEmailJSConnectivity();
    
    expect(result.success).toBe(false);
    expect(result.error.message).toBe('Init failed');
  });
});

describe('getServiceStatus', () => {
  it('should return comprehensive service status', () => {
    const status = getServiceStatus();
    
    expect(status).toEqual({
      timestamp: expect.any(String),
      configuration: expect.any(Object),
      libraryLoaded: expect.any(Boolean),
      browserSupport: {
        fetch: expect.any(Boolean),
        promise: expect.any(Boolean),
        formData: expect.any(Boolean)
      }
    });
  });

  it('should check browser support correctly', () => {
    const status = getServiceStatus();
    
    expect(status.browserSupport.fetch).toBe(typeof fetch !== 'undefined');
    expect(status.browserSupport.promise).toBe(typeof Promise !== 'undefined');
    expect(status.browserSupport.formData).toBe(typeof FormData !== 'undefined');
  });

  it('should include configuration validation', () => {
    const status = getServiceStatus();
    
    expect(status.configuration).toHaveProperty('isValid');
    expect(status.configuration).toHaveProperty('errors');
    expect(status.configuration).toHaveProperty('warnings');
  });
});

describe('EMAILJS_CONFIG', () => {
  it('should have all required configuration properties', () => {
    expect(EMAILJS_CONFIG).toHaveProperty('SERVICE_ID');
    expect(EMAILJS_CONFIG).toHaveProperty('TEMPLATE_ID');
    expect(EMAILJS_CONFIG).toHaveProperty('PUBLIC_KEY');
  });

  it('should have non-empty configuration values', () => {
    expect(EMAILJS_CONFIG.SERVICE_ID).toBeTruthy();
    expect(EMAILJS_CONFIG.TEMPLATE_ID).toBeTruthy();
    expect(EMAILJS_CONFIG.PUBLIC_KEY).toBeTruthy();
  });

  it('should have correctly formatted configuration values', () => {
    expect(EMAILJS_CONFIG.SERVICE_ID).toMatch(/^service_/);
    expect(EMAILJS_CONFIG.TEMPLATE_ID).toMatch(/^template_/);
    expect(EMAILJS_CONFIG.PUBLIC_KEY.length).toBeGreaterThan(10);
  });
});