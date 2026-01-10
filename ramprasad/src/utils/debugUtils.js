/**
 * Debug and error tracking utilities for email service
 */

// Debug levels
export const DEBUG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

// Error categories for better tracking
export const ERROR_CATEGORIES = {
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  SERVICE: 'SERVICE',
  CONFIGURATION: 'CONFIGURATION',
  RATE_LIMIT: 'RATE_LIMIT',
  UNKNOWN: 'UNKNOWN'
};

// Specific error codes for detailed error handling
export const ERROR_CODES = {
  // Network errors
  TIMEOUT: 'TIMEOUT',
  OFFLINE: 'OFFLINE',
  DNS_ERROR: 'DNS_ERROR',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',
  CONNECTION_RESET: 'CONNECTION_RESET',
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  // Service errors
  RATE_LIMITED: 'RATE_LIMITED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Configuration errors
  INVALID_API_KEY: 'INVALID_API_KEY',
  ACCESS_DENIED: 'ACCESS_DENIED',
  INVALID_SERVICE_ID: 'INVALID_SERVICE_ID',
  INVALID_TEMPLATE_ID: 'INVALID_TEMPLATE_ID',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  
  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

/**
 * Enhanced logging utility with timestamps and categorization
 */
export const debugLogger = {
  log: (level, category, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      data
    };

    // Console output with styling
    const style = getLogStyle(level);
    console.group(`%c[${level}] ${category} - ${timestamp}`, style);
    console.log(message);
    if (data) {
      console.log('Data:', data);
    }
    console.groupEnd();

    // Store in session storage for debugging
    storeDebugLog(logEntry);
  },

  info: (category, message, data) => {
    debugLogger.log(DEBUG_LEVELS.INFO, category, message, data);
  },

  warn: (category, message, data) => {
    debugLogger.log(DEBUG_LEVELS.WARN, category, message, data);
  },

  error: (category, message, data) => {
    debugLogger.log(DEBUG_LEVELS.ERROR, category, message, data);
  },

  debug: (category, message, data) => {
    debugLogger.log(DEBUG_LEVELS.DEBUG, category, message, data);
  }
};

/**
 * Get console styling for different log levels
 */
function getLogStyle(level) {
  const styles = {
    [DEBUG_LEVELS.INFO]: 'color: #2196F3; font-weight: bold;',
    [DEBUG_LEVELS.WARN]: 'color: #FF9800; font-weight: bold;',
    [DEBUG_LEVELS.ERROR]: 'color: #F44336; font-weight: bold;',
    [DEBUG_LEVELS.DEBUG]: 'color: #4CAF50; font-weight: bold;'
  };
  return styles[level] || 'color: #333; font-weight: bold;';
}

/**
 * Store debug logs in session storage for debugging
 */
function storeDebugLog(logEntry) {
  try {
    const existingLogs = JSON.parse(sessionStorage.getItem('emailDebugLogs') || '[]');
    existingLogs.push(logEntry);
    
    // Keep only last 100 logs to prevent storage overflow
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    sessionStorage.setItem('emailDebugLogs', JSON.stringify(existingLogs));
  } catch (error) {
    console.warn('Failed to store debug log:', error);
  }
}

/**
 * Error tracking utility for categorizing and logging errors
 */
export const errorTracker = {
  /**
   * Track and categorize errors
   */
  trackError: (error, context = {}) => {
    const errorInfo = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString()
    };

    const category = categorizeError(error);
    
    debugLogger.error(category, `Error tracked: ${errorInfo.message}`, errorInfo);
    
    return {
      category,
      ...errorInfo
    };
  },

  /**
   * Track EmailJS specific errors
   */
  trackEmailJSError: (error, formData = null) => {
    const context = {
      service: 'EmailJS',
      formData: formData ? sanitizeFormData(formData) : null,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    return errorTracker.trackError(error, context);
  }
};

/**
 * Categorize errors based on their characteristics and assign error codes
 */
function categorizeError(error) {
  const message = error.message?.toLowerCase() || '';
  const name = error.name?.toLowerCase() || '';
  const status = error.status || error.code || 0;

  // If error already has category and code, preserve them
  if (error.category && error.code) {
    return error.category;
  }

  // Network-related errors
  if (message.includes('network') || message.includes('fetch') || name.includes('network') ||
      message.includes('connection') || message.includes('offline') || status === 0) {
    error.category = ERROR_CATEGORIES.NETWORK;
    error.code = getNetworkErrorCode(message, status);
    return ERROR_CATEGORIES.NETWORK;
  }

  // Rate limiting errors
  if (status === 429 || message.includes('rate limit') || message.includes('too many requests')) {
    error.category = ERROR_CATEGORIES.SERVICE;
    error.code = ERROR_CODES.RATE_LIMITED;
    return ERROR_CATEGORIES.SERVICE;
  }

  // Service errors
  if (message.includes('service') || message.includes('emailjs') || message.includes('template') ||
      message.includes('server error') || message.includes('unavailable') || (status >= 500 && status < 600)) {
    error.category = ERROR_CATEGORIES.SERVICE;
    error.code = getServiceErrorCode(message, status);
    return ERROR_CATEGORIES.SERVICE;
  }

  // Configuration errors
  if (message.includes('config') || message.includes('key') || message.includes('id') ||
      message.includes('unauthorized') || message.includes('forbidden') || status === 401 || status === 403) {
    error.category = ERROR_CATEGORIES.CONFIGURATION;
    error.code = getConfigurationErrorCode(message, status);
    return ERROR_CATEGORIES.CONFIGURATION;
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('required') ||
      status === 400) {
    error.category = ERROR_CATEGORIES.VALIDATION;
    error.code = ERROR_CODES.VALIDATION_FAILED;
    return ERROR_CATEGORIES.VALIDATION;
  }

  // Default to unknown
  error.category = ERROR_CATEGORIES.UNKNOWN;
  error.code = ERROR_CODES.UNKNOWN_ERROR;
  return ERROR_CATEGORIES.UNKNOWN;
}

/**
 * Get specific network error code based on message and status
 */
function getNetworkErrorCode(message, status) {
  if (message.includes('timeout')) return ERROR_CODES.TIMEOUT;
  if (message.includes('offline') || !navigator.onLine) return ERROR_CODES.OFFLINE;
  if (message.includes('dns') || message.includes('resolve')) return ERROR_CODES.DNS_ERROR;
  if (message.includes('connection refused')) return ERROR_CODES.CONNECTION_REFUSED;
  if (message.includes('connection reset')) return ERROR_CODES.CONNECTION_RESET;
  return ERROR_CODES.NETWORK_ERROR;
}

/**
 * Get specific service error code based on message and status
 */
function getServiceErrorCode(message, status) {
  if (status === 429 || message.includes('rate limit')) return ERROR_CODES.RATE_LIMITED;
  if (status === 503 || status === 502 || status === 504 || message.includes('unavailable')) {
    return ERROR_CODES.SERVICE_UNAVAILABLE;
  }
  if (status >= 500 && status < 600) return ERROR_CODES.SERVER_ERROR;
  return ERROR_CODES.SERVER_ERROR;
}

/**
 * Get specific configuration error code based on message and status
 */
function getConfigurationErrorCode(message, status) {
  if (status === 401 || message.includes('unauthorized')) return ERROR_CODES.INVALID_API_KEY;
  if (status === 403 || message.includes('forbidden')) return ERROR_CODES.ACCESS_DENIED;
  if (message.includes('service not found')) return ERROR_CODES.INVALID_SERVICE_ID;
  if (message.includes('template not found')) return ERROR_CODES.INVALID_TEMPLATE_ID;
  return ERROR_CODES.CONFIGURATION_ERROR;
}

/**
 * Sanitize form data for logging (remove sensitive information)
 */
function sanitizeFormData(formData) {
  const sanitized = { ...formData };
  
  // Mask email for privacy
  if (sanitized.user_email) {
    const email = sanitized.user_email;
    const [username, domain] = email.split('@');
    sanitized.user_email = `${username.substring(0, 2)}***@${domain}`;
  }
  
  // Truncate message for logging
  if (sanitized.message && sanitized.message.length > 100) {
    sanitized.message = sanitized.message.substring(0, 100) + '...';
  }
  
  return sanitized;
}

/**
 * Get all stored debug logs
 */
export const getDebugLogs = () => {
  try {
    return JSON.parse(sessionStorage.getItem('emailDebugLogs') || '[]');
  } catch (error) {
    console.warn('Failed to retrieve debug logs:', error);
    return [];
  }
};

/**
 * Clear all stored debug logs
 */
export const clearDebugLogs = () => {
  try {
    sessionStorage.removeItem('emailDebugLogs');
    debugLogger.info('SYSTEM', 'Debug logs cleared');
  } catch (error) {
    console.warn('Failed to clear debug logs:', error);
  }
};