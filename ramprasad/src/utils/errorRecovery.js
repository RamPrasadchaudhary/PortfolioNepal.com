/**
 * Error recovery utilities for comprehensive error handling
 * Provides strategies for recovering from different types of errors
 */

import { debugLogger, ERROR_CATEGORIES, ERROR_CODES } from './debugUtils';

/**
 * Error recovery strategies based on error type
 */
export const ERROR_RECOVERY_STRATEGIES = {
  [ERROR_CATEGORIES.NETWORK]: {
    retryable: true,
    maxRetries: 3,
    baseDelay: 2000,
    exponentialBackoff: true,
    userMessage: 'Network connectivity issue detected. Retrying...'
  },
  [ERROR_CATEGORIES.SERVICE]: {
    retryable: true,
    maxRetries: 2,
    baseDelay: 5000,
    exponentialBackoff: true,
    userMessage: 'Service temporarily unavailable. Retrying...'
  },
  [ERROR_CATEGORIES.CONFIGURATION]: {
    retryable: false,
    maxRetries: 0,
    baseDelay: 0,
    exponentialBackoff: false,
    userMessage: 'Configuration error detected. Please contact support.'
  },
  [ERROR_CATEGORIES.VALIDATION]: {
    retryable: false,
    maxRetries: 0,
    baseDelay: 0,
    exponentialBackoff: false,
    userMessage: 'Please check your input and try again.'
  },
  [ERROR_CATEGORIES.RATE_LIMIT]: {
    retryable: true,
    maxRetries: 1,
    baseDelay: 30000,
    exponentialBackoff: false,
    userMessage: 'Rate limit exceeded. Please wait before trying again.'
  },
  [ERROR_CATEGORIES.UNKNOWN]: {
    retryable: true,
    maxRetries: 1,
    baseDelay: 3000,
    exponentialBackoff: false,
    userMessage: 'Unexpected error occurred. Retrying...'
  }
};

/**
 * Error recovery manager for handling different error scenarios
 */
export class ErrorRecoveryManager {
  constructor() {
    this.recoveryAttempts = new Map();
  }

  /**
   * Determine if an error is recoverable
   * @param {Object} error - Error object with category and code
   * @returns {boolean} Whether the error is recoverable
   */
  isRecoverable(error) {
    const strategy = this.getRecoveryStrategy(error);
    return strategy.retryable;
  }

  /**
   * Get recovery strategy for an error
   * @param {Object} error - Error object with category and code
   * @returns {Object} Recovery strategy
   */
  getRecoveryStrategy(error) {
    const category = error.category || ERROR_CATEGORIES.UNKNOWN;
    return ERROR_RECOVERY_STRATEGIES[category] || ERROR_RECOVERY_STRATEGIES[ERROR_CATEGORIES.UNKNOWN];
  }

  /**
   * Check if we should retry based on error and attempt count
   * @param {Object} error - Error object
   * @param {string} operationId - Unique identifier for the operation
   * @returns {Object} Retry decision with shouldRetry boolean and delay
   */
  shouldRetry(error, operationId) {
    const strategy = this.getRecoveryStrategy(error);
    
    if (!strategy.retryable) {
      debugLogger.debug('RECOVERY', 'Error not retryable', {
        category: error.category,
        code: error.code,
        operationId
      });
      return { shouldRetry: false, delay: 0 };
    }

    const attempts = this.recoveryAttempts.get(operationId) || 0;
    
    if (attempts >= strategy.maxRetries) {
      debugLogger.warn('RECOVERY', 'Max retry attempts reached', {
        attempts,
        maxRetries: strategy.maxRetries,
        operationId
      });
      return { shouldRetry: false, delay: 0 };
    }

    const delay = this.calculateDelay(strategy, attempts, error);
    
    debugLogger.info('RECOVERY', 'Retry approved', {
      attempt: attempts + 1,
      maxRetries: strategy.maxRetries,
      delay,
      operationId,
      errorCode: error.code
    });

    return { shouldRetry: true, delay };
  }

  /**
   * Record a retry attempt
   * @param {string} operationId - Unique identifier for the operation
   */
  recordRetryAttempt(operationId) {
    const attempts = this.recoveryAttempts.get(operationId) || 0;
    this.recoveryAttempts.set(operationId, attempts + 1);
  }

  /**
   * Reset retry attempts for an operation
   * @param {string} operationId - Unique identifier for the operation
   */
  resetRetryAttempts(operationId) {
    this.recoveryAttempts.delete(operationId);
    debugLogger.debug('RECOVERY', 'Retry attempts reset', { operationId });
  }

  /**
   * Calculate delay for retry based on strategy and attempt number
   * @private
   */
  calculateDelay(strategy, attemptNumber, error) {
    let delay = strategy.baseDelay;

    // Special handling for rate limiting
    if (error.code === ERROR_CODES.RATE_LIMITED) {
      // For rate limiting, use a longer delay that increases more gradually
      delay = Math.min(strategy.baseDelay * (attemptNumber + 1), 60000); // Cap at 1 minute
      return delay;
    }

    // Apply exponential backoff if enabled
    if (strategy.exponentialBackoff) {
      delay = strategy.baseDelay * Math.pow(2, attemptNumber);
    }

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 1000; // 0-1000ms jitter
    delay += jitter;

    // Cap the delay at reasonable limits
    const maxDelay = error.category === ERROR_CATEGORIES.NETWORK ? 15000 : 30000;
    return Math.min(delay, maxDelay);
  }

  /**
   * Get user-friendly recovery message
   * @param {Object} error - Error object
   * @param {number} attemptNumber - Current attempt number
   * @returns {string} User-friendly message
   */
  getRecoveryMessage(error, attemptNumber) {
    const strategy = this.getRecoveryStrategy(error);
    
    if (attemptNumber === 0) {
      return strategy.userMessage;
    }

    // Customize message based on attempt number
    switch (error.category) {
      case ERROR_CATEGORIES.NETWORK:
        return `Network issue detected. Retry attempt ${attemptNumber + 1}/${strategy.maxRetries}...`;
      case ERROR_CATEGORIES.SERVICE:
        return `Service temporarily unavailable. Retry attempt ${attemptNumber + 1}/${strategy.maxRetries}...`;
      case ERROR_CATEGORIES.RATE_LIMIT:
        return 'Rate limit exceeded. Waiting before retry...';
      default:
        return `Retry attempt ${attemptNumber + 1}/${strategy.maxRetries}...`;
    }
  }

  /**
   * Get comprehensive error analysis
   * @param {Object} error - Error object
   * @returns {Object} Error analysis with recovery recommendations
   */
  analyzeError(error) {
    const strategy = this.getRecoveryStrategy(error);
    const isRecoverable = this.isRecoverable(error);
    
    const analysis = {
      category: error.category || ERROR_CATEGORIES.UNKNOWN,
      code: error.code || ERROR_CODES.UNKNOWN_ERROR,
      isRecoverable,
      strategy,
      recommendations: this.getRecoveryRecommendations(error),
      userActions: this.getUserActionRecommendations(error)
    };

    debugLogger.debug('RECOVERY', 'Error analysis completed', analysis);
    return analysis;
  }

  /**
   * Get recovery recommendations for developers
   * @private
   */
  getRecoveryRecommendations(error) {
    switch (error.category) {
      case ERROR_CATEGORIES.NETWORK:
        return [
          'Check internet connectivity',
          'Verify DNS resolution',
          'Check for firewall/proxy issues',
          'Implement exponential backoff retry'
        ];
      case ERROR_CATEGORIES.SERVICE:
        return [
          'Check service status',
          'Verify API endpoints',
          'Implement circuit breaker pattern',
          'Add service health monitoring'
        ];
      case ERROR_CATEGORIES.CONFIGURATION:
        return [
          'Verify API keys and credentials',
          'Check service configuration',
          'Validate environment variables',
          'Review service documentation'
        ];
      case ERROR_CATEGORIES.RATE_LIMIT:
        return [
          'Implement rate limiting on client side',
          'Add request queuing',
          'Use exponential backoff',
          'Consider upgrading service plan'
        ];
      default:
        return [
          'Add comprehensive error logging',
          'Implement fallback mechanisms',
          'Add user notification system',
          'Monitor error patterns'
        ];
    }
  }

  /**
   * Get user action recommendations
   * @private
   */
  getUserActionRecommendations(error) {
    switch (error.category) {
      case ERROR_CATEGORIES.NETWORK:
        return [
          'Check your internet connection',
          'Try refreshing the page',
          'Disable VPN if active',
          'Try again in a few moments'
        ];
      case ERROR_CATEGORIES.SERVICE:
        return [
          'Try again in a few minutes',
          'Check service status page',
          'Contact support if problem persists'
        ];
      case ERROR_CATEGORIES.CONFIGURATION:
        return [
          'Contact support',
          'Report the issue with error details'
        ];
      case ERROR_CATEGORIES.RATE_LIMIT:
        return [
          'Wait before sending another message',
          'Reduce frequency of requests',
          'Try again later'
        ];
      case ERROR_CATEGORIES.VALIDATION:
        return [
          'Check your input data',
          'Ensure all required fields are filled',
          'Verify email format is correct'
        ];
      default:
        return [
          'Try again',
          'Refresh the page',
          'Contact support if problem persists'
        ];
    }
  }
}

// Export singleton instance
export const errorRecoveryManager = new ErrorRecoveryManager();

/**
 * Utility function to create operation-specific error recovery
 * @param {string} operationName - Name of the operation
 * @returns {Object} Operation-specific recovery utilities
 */
export function createOperationRecovery(operationName) {
  const operationId = `${operationName}_${Date.now()}`;
  
  return {
    operationId,
    shouldRetry: (error) => errorRecoveryManager.shouldRetry(error, operationId),
    recordAttempt: () => errorRecoveryManager.recordRetryAttempt(operationId),
    reset: () => errorRecoveryManager.resetRetryAttempts(operationId),
    analyze: (error) => errorRecoveryManager.analyzeError(error),
    getMessage: (error, attempt) => errorRecoveryManager.getRecoveryMessage(error, attempt)
  };
}