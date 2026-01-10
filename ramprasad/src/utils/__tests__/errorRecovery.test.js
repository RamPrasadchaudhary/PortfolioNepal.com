/**
 * Unit tests for Error Recovery utilities
 */

import { 
  ErrorRecoveryManager, 
  errorRecoveryManager, 
  createOperationRecovery,
  ERROR_RECOVERY_STRATEGIES 
} from '../errorRecovery';
import { ERROR_CATEGORIES, ERROR_CODES } from '../debugUtils';

describe('ErrorRecoveryManager', () => {
  let manager;

  beforeEach(() => {
    manager = new ErrorRecoveryManager();
  });

  describe('isRecoverable', () => {
    it('should identify recoverable network errors', () => {
      const error = { category: ERROR_CATEGORIES.NETWORK, code: ERROR_CODES.TIMEOUT };
      expect(manager.isRecoverable(error)).toBe(true);
    });

    it('should identify non-recoverable configuration errors', () => {
      const error = { category: ERROR_CATEGORIES.CONFIGURATION, code: ERROR_CODES.INVALID_API_KEY };
      expect(manager.isRecoverable(error)).toBe(false);
    });

    it('should identify non-recoverable validation errors', () => {
      const error = { category: ERROR_CATEGORIES.VALIDATION, code: ERROR_CODES.VALIDATION_FAILED };
      expect(manager.isRecoverable(error)).toBe(false);
    });
  });

  describe('shouldRetry', () => {
    it('should allow retry for network errors within limits', () => {
      const error = { category: ERROR_CATEGORIES.NETWORK, code: ERROR_CODES.TIMEOUT };
      const operationId = 'test-operation-1';

      const result = manager.shouldRetry(error, operationId);
      expect(result.shouldRetry).toBe(true);
      expect(result.delay).toBeGreaterThan(0);
    });

    it('should not allow retry for configuration errors', () => {
      const error = { category: ERROR_CATEGORIES.CONFIGURATION, code: ERROR_CODES.INVALID_API_KEY };
      const operationId = 'test-operation-2';

      const result = manager.shouldRetry(error, operationId);
      expect(result.shouldRetry).toBe(false);
      expect(result.delay).toBe(0);
    });

    it('should stop retrying after max attempts', () => {
      const error = { category: ERROR_CATEGORIES.NETWORK, code: ERROR_CODES.TIMEOUT };
      const operationId = 'test-operation-3';

      // Simulate multiple retry attempts
      manager.recordRetryAttempt(operationId);
      manager.recordRetryAttempt(operationId);
      manager.recordRetryAttempt(operationId);

      const result = manager.shouldRetry(error, operationId);
      expect(result.shouldRetry).toBe(false);
    });
  });

  describe('getRecoveryMessage', () => {
    it('should provide appropriate message for network errors', () => {
      const error = { category: ERROR_CATEGORIES.NETWORK, code: ERROR_CODES.TIMEOUT };
      const message = manager.getRecoveryMessage(error, 0);
      expect(message).toContain('Network connectivity issue');
    });

    it('should provide appropriate message for rate limiting', () => {
      const error = { category: ERROR_CATEGORIES.RATE_LIMIT, code: ERROR_CODES.RATE_LIMITED };
      const message = manager.getRecoveryMessage(error, 0);
      expect(message).toContain('Rate limit exceeded');
    });
  });

  describe('analyzeError', () => {
    it('should provide comprehensive error analysis', () => {
      const error = { 
        category: ERROR_CATEGORIES.NETWORK, 
        code: ERROR_CODES.TIMEOUT,
        message: 'Request timed out'
      };

      const analysis = manager.analyzeError(error);
      
      expect(analysis.category).toBe(ERROR_CATEGORIES.NETWORK);
      expect(analysis.code).toBe(ERROR_CODES.TIMEOUT);
      expect(analysis.isRecoverable).toBe(true);
      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.userActions).toBeInstanceOf(Array);
    });
  });
});

describe('createOperationRecovery', () => {
  it('should create operation-specific recovery utilities', () => {
    const recovery = createOperationRecovery('email-send');
    
    expect(recovery.operationId).toContain('email-send');
    expect(typeof recovery.shouldRetry).toBe('function');
    expect(typeof recovery.recordAttempt).toBe('function');
    expect(typeof recovery.reset).toBe('function');
    expect(typeof recovery.analyze).toBe('function');
    expect(typeof recovery.getMessage).toBe('function');
  });
});

describe('ERROR_RECOVERY_STRATEGIES', () => {
  it('should have strategies for all error categories', () => {
    const categories = Object.values(ERROR_CATEGORIES);
    
    categories.forEach(category => {
      expect(ERROR_RECOVERY_STRATEGIES[category]).toBeDefined();
      expect(ERROR_RECOVERY_STRATEGIES[category]).toHaveProperty('retryable');
      expect(ERROR_RECOVERY_STRATEGIES[category]).toHaveProperty('maxRetries');
      expect(ERROR_RECOVERY_STRATEGIES[category]).toHaveProperty('baseDelay');
      expect(ERROR_RECOVERY_STRATEGIES[category]).toHaveProperty('userMessage');
    });
  });
});