/**
 * Unit tests for debug utilities
 */

import {
  debugLogger,
  errorTracker,
  getDebugLogs,
  clearDebugLogs,
  DEBUG_LEVELS,
  ERROR_CATEGORIES,
  ERROR_CODES
} from '../debugUtils';

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock console methods
const mockConsole = {
  group: jest.fn(),
  groupEnd: jest.fn(),
  log: jest.fn(),
  warn: jest.fn()
};

Object.defineProperty(window, 'console', {
  value: mockConsole
});

describe('debugLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue('[]');
  });

  describe('log levels', () => {
    it('should log info messages correctly', () => {
      debugLogger.info('TEST', 'Test message', { data: 'test' });
      
      expect(mockConsole.group).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] TEST'),
        expect.any(String)
      );
      expect(mockConsole.log).toHaveBeenCalledWith('Test message');
      expect(mockConsole.log).toHaveBeenCalledWith('Data:', { data: 'test' });
      expect(mockConsole.groupEnd).toHaveBeenCalled();
    });

    it('should log warning messages correctly', () => {
      debugLogger.warn('TEST', 'Warning message');
      
      expect(mockConsole.group).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] TEST'),
        expect.any(String)
      );
      expect(mockConsole.log).toHaveBeenCalledWith('Warning message');
    });

    it('should log error messages correctly', () => {
      debugLogger.error('TEST', 'Error message', { error: 'details' });
      
      expect(mockConsole.group).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] TEST'),
        expect.any(String)
      );
      expect(mockConsole.log).toHaveBeenCalledWith('Error message');
      expect(mockConsole.log).toHaveBeenCalledWith('Data:', { error: 'details' });
    });

    it('should log debug messages correctly', () => {
      debugLogger.debug('TEST', 'Debug message');
      
      expect(mockConsole.group).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] TEST'),
        expect.any(String)
      );
      expect(mockConsole.log).toHaveBeenCalledWith('Debug message');
    });
  });

  describe('log storage', () => {
    it('should store logs in sessionStorage', () => {
      debugLogger.info('TEST', 'Test message');
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'emailDebugLogs',
        expect.stringContaining('TEST')
      );
    });

    it('should handle sessionStorage errors gracefully', () => {
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => {
        debugLogger.info('TEST', 'Test message');
      }).not.toThrow();
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Failed to store debug log:',
        expect.any(Error)
      );
    });

    it('should limit stored logs to 100 entries', () => {
      const existingLogs = new Array(100).fill({ message: 'old log' });
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(existingLogs));
      
      debugLogger.info('TEST', 'New message');
      
      const setItemCall = mockSessionStorage.setItem.mock.calls[0];
      const storedLogs = JSON.parse(setItemCall[1]);
      expect(storedLogs).toHaveLength(100);
      expect(storedLogs[99].message).toBe('New message');
    });
  });
});

describe('errorTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue('[]');
  });

  describe('trackError', () => {
    it('should track basic error information', () => {
      const error = new Error('Test error');
      const context = { operation: 'test' };
      
      const result = errorTracker.trackError(error, context);
      
      expect(result).toEqual({
        category: ERROR_CATEGORIES.UNKNOWN,
        message: 'Test error',
        stack: error.stack,
        name: 'Error',
        context,
        timestamp: expect.any(String)
      });
    });

    it('should categorize network errors correctly', () => {
      const error = new Error('Network connection failed');
      
      const result = errorTracker.trackError(error);
      
      expect(result.category).toBe(ERROR_CATEGORIES.NETWORK);
      expect(error.category).toBe(ERROR_CATEGORIES.NETWORK);
      expect(error.code).toBe(ERROR_CODES.NETWORK_ERROR);
    });

    it('should categorize service errors correctly', () => {
      const error = new Error('Service unavailable');
      error.status = 503;
      
      const result = errorTracker.trackError(error);
      
      expect(result.category).toBe(ERROR_CATEGORIES.SERVICE);
      expect(error.code).toBe(ERROR_CODES.SERVICE_UNAVAILABLE);
    });

    it('should categorize configuration errors correctly', () => {
      const error = new Error('Unauthorized access');
      error.status = 401;
      
      const result = errorTracker.trackError(error);
      
      expect(result.category).toBe(ERROR_CATEGORIES.CONFIGURATION);
      expect(error.code).toBe(ERROR_CODES.INVALID_API_KEY);
    });

    it('should preserve existing category and code', () => {
      const error = new Error('Test error');
      error.category = ERROR_CATEGORIES.VALIDATION;
      error.code = ERROR_CODES.VALIDATION_FAILED;
      
      const result = errorTracker.trackError(error);
      
      expect(result.category).toBe(ERROR_CATEGORIES.VALIDATION);
      expect(error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
    });
  });

  describe('trackEmailJSError', () => {
    it('should track EmailJS specific errors with context', () => {
      const error = new Error('EmailJS error');
      const formData = {
        user_name: 'John Doe',
        user_email: 'john@example.com',
        message: 'Test message'
      };
      
      const result = errorTracker.trackEmailJSError(error, formData);
      
      expect(result.context.service).toBe('EmailJS');
      expect(result.context.formData.user_name).toBe('John Doe');
      expect(result.context.formData.user_email).toBe('jo***@example.com');
      expect(result.context.userAgent).toBe(navigator.userAgent);
    });

    it('should handle null form data', () => {
      const error = new Error('EmailJS error');
      
      const result = errorTracker.trackEmailJSError(error, null);
      
      expect(result.context.formData).toBeNull();
    });

    it('should sanitize long messages', () => {
      const error = new Error('EmailJS error');
      const formData = {
        user_name: 'John Doe',
        user_email: 'john@example.com',
        message: 'A'.repeat(150) // Long message
      };
      
      const result = errorTracker.trackEmailJSError(error, formData);
      
      expect(result.context.formData.message).toHaveLength(103); // 100 + '...'
      expect(result.context.formData.message).toEndWith('...');
    });
  });
});

describe('getDebugLogs', () => {
  it('should retrieve logs from sessionStorage', () => {
    const mockLogs = [{ message: 'test log' }];
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify(mockLogs));
    
    const logs = getDebugLogs();
    
    expect(logs).toEqual(mockLogs);
    expect(mockSessionStorage.getItem).toHaveBeenCalledWith('emailDebugLogs');
  });

  it('should return empty array if no logs exist', () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    
    const logs = getDebugLogs();
    
    expect(logs).toEqual([]);
  });

  it('should handle JSON parse errors', () => {
    mockSessionStorage.getItem.mockReturnValue('invalid json');
    
    const logs = getDebugLogs();
    
    expect(logs).toEqual([]);
    expect(mockConsole.warn).toHaveBeenCalledWith(
      'Failed to retrieve debug logs:',
      expect.any(Error)
    );
  });
});

describe('clearDebugLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue('[]');
  });

  it('should clear logs from sessionStorage', () => {
    clearDebugLogs();
    
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('emailDebugLogs');
  });

  it('should handle storage errors gracefully', () => {
    mockSessionStorage.removeItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    expect(() => clearDebugLogs()).not.toThrow();
    expect(mockConsole.warn).toHaveBeenCalledWith(
      'Failed to clear debug logs:',
      expect.any(Error)
    );
  });
});

describe('Constants', () => {
  it('should have all debug levels defined', () => {
    expect(DEBUG_LEVELS.INFO).toBe('INFO');
    expect(DEBUG_LEVELS.WARN).toBe('WARN');
    expect(DEBUG_LEVELS.ERROR).toBe('ERROR');
    expect(DEBUG_LEVELS.DEBUG).toBe('DEBUG');
  });

  it('should have all error categories defined', () => {
    expect(ERROR_CATEGORIES.VALIDATION).toBe('VALIDATION');
    expect(ERROR_CATEGORIES.NETWORK).toBe('NETWORK');
    expect(ERROR_CATEGORIES.SERVICE).toBe('SERVICE');
    expect(ERROR_CATEGORIES.CONFIGURATION).toBe('CONFIGURATION');
    expect(ERROR_CATEGORIES.RATE_LIMIT).toBe('RATE_LIMIT');
    expect(ERROR_CATEGORIES.UNKNOWN).toBe('UNKNOWN');
  });

  it('should have all error codes defined', () => {
    // Network error codes
    expect(ERROR_CODES.TIMEOUT).toBe('TIMEOUT');
    expect(ERROR_CODES.OFFLINE).toBe('OFFLINE');
    expect(ERROR_CODES.NETWORK_ERROR).toBe('NETWORK_ERROR');
    
    // Service error codes
    expect(ERROR_CODES.RATE_LIMITED).toBe('RATE_LIMITED');
    expect(ERROR_CODES.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
    
    // Configuration error codes
    expect(ERROR_CODES.INVALID_API_KEY).toBe('INVALID_API_KEY');
    expect(ERROR_CODES.CONFIGURATION_ERROR).toBe('CONFIGURATION_ERROR');
    
    // Other error codes
    expect(ERROR_CODES.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
    expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
  });
});