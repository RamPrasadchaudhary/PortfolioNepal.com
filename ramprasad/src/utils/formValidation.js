/**
 * Form validation utilities for contact form
 * Provides comprehensive validation functions for email format, required fields, and input sanitization
 */

import { debugLogger } from './debugUtils';

// Validation constants
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\-'\.]+$/
  },
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  },
  MESSAGE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000
  }
};

// Validation error messages
export const VALIDATION_MESSAGES = {
  REQUIRED: {
    NAME: 'Name is required',
    EMAIL: 'Email address is required',
    MESSAGE: 'Message is required'
  },
  FORMAT: {
    EMAIL: 'Please enter a valid email address',
    NAME: 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
  },
  LENGTH: {
    NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`,
    NAME_TOO_LONG: `Name must be less than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`,
    MESSAGE_TOO_SHORT: `Message must be at least ${VALIDATION_RULES.MESSAGE.MIN_LENGTH} characters`,
    MESSAGE_TOO_LONG: `Message must be less than ${VALIDATION_RULES.MESSAGE.MAX_LENGTH} characters`
  }
};

/**
 * Validate email format using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {object} Validation result with isValid boolean and error message
 */
export const validateEmailFormat = (email) => {
  debugLogger.debug('VALIDATION', 'Validating email format', { emailLength: email?.length || 0 });
  
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.EMAIL
    };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.EMAIL
    };
  }

  const isValidFormat = VALIDATION_RULES.EMAIL.PATTERN.test(trimmedEmail);
  
  debugLogger.debug('VALIDATION', 'Email format validation result', { 
    isValid: isValidFormat,
    email: trimmedEmail.substring(0, 3) + '***' // Log partial email for privacy
  });

  return {
    isValid: isValidFormat,
    error: isValidFormat ? null : VALIDATION_MESSAGES.FORMAT.EMAIL
  };
};

/**
 * Validate required field (checks for presence and non-empty value)
 * @param {string} value - Field value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {object} Validation result with isValid boolean and error message
 */
export const validateRequiredField = (value, fieldName) => {
  debugLogger.debug('VALIDATION', `Validating required field: ${fieldName}`, { 
    hasValue: !!value,
    valueLength: value?.length || 0 
  });

  if (!value || typeof value !== 'string') {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED[fieldName.toUpperCase()] || `${fieldName} is required`
    };
  }

  const trimmedValue = value.trim();
  const isValid = trimmedValue.length > 0;

  return {
    isValid,
    error: isValid ? null : (VALIDATION_MESSAGES.REQUIRED[fieldName.toUpperCase()] || `${fieldName} is required`)
  };
};

/**
 * Validate message length (10-1000 characters)
 * @param {string} message - Message to validate
 * @returns {object} Validation result with isValid boolean and error message
 */
export const validateMessageLength = (message) => {
  debugLogger.debug('VALIDATION', 'Validating message length', { 
    messageLength: message?.length || 0 
  });

  if (!message || typeof message !== 'string') {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.MESSAGE
    };
  }

  const trimmedMessage = message.trim();
  
  if (trimmedMessage.length === 0) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.MESSAGE
    };
  }

  if (trimmedMessage.length < VALIDATION_RULES.MESSAGE.MIN_LENGTH) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.LENGTH.MESSAGE_TOO_SHORT
    };
  }

  if (trimmedMessage.length > VALIDATION_RULES.MESSAGE.MAX_LENGTH) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.LENGTH.MESSAGE_TOO_LONG
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validate name field (2-50 characters, letters, spaces, hyphens, apostrophes, periods only)
 * @param {string} name - Name to validate
 * @returns {object} Validation result with isValid boolean and error message
 */
export const validateName = (name) => {
  debugLogger.debug('VALIDATION', 'Validating name', { 
    nameLength: name?.length || 0 
  });

  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.NAME
    };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length === 0) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.REQUIRED.NAME
    };
  }

  if (trimmedName.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.LENGTH.NAME_TOO_SHORT
    };
  }

  if (trimmedName.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.LENGTH.NAME_TOO_LONG
    };
  }

  if (!VALIDATION_RULES.NAME.PATTERN.test(trimmedName)) {
    return {
      isValid: false,
      error: VALIDATION_MESSAGES.FORMAT.NAME
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Sanitize user input to prevent XSS and clean up data
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized input string
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  debugLogger.debug('VALIDATION', 'Sanitizing input', { 
    originalLength: input.length 
  });

  // Remove HTML tags and potentially dangerous characters
  let sanitized = input
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags and content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim(); // Remove leading/trailing whitespace

  // Normalize whitespace (replace multiple spaces with single space)
  sanitized = sanitized.replace(/\s+/g, ' ');

  debugLogger.debug('VALIDATION', 'Input sanitization completed', { 
    originalLength: input.length,
    sanitizedLength: sanitized.length 
  });

  return sanitized;
};

/**
 * Comprehensive form validation for contact form
 * @param {object} formData - Form data object with user_name, user_email, and message
 * @returns {object} Validation result with isValid boolean, errors array, and sanitized data
 */
export const validateContactForm = (formData) => {
  debugLogger.info('VALIDATION', 'Starting comprehensive form validation');

  const validation = {
    isValid: true,
    errors: [],
    sanitizedData: {}
  };

  // Sanitize all inputs first
  const sanitizedName = sanitizeInput(formData.user_name);
  const sanitizedEmail = sanitizeInput(formData.user_email);
  const sanitizedMessage = sanitizeInput(formData.message);

  validation.sanitizedData = {
    user_name: sanitizedName,
    user_email: sanitizedEmail,
    message: sanitizedMessage
  };

  // Validate name
  const nameValidation = validateName(sanitizedName);
  if (!nameValidation.isValid) {
    validation.errors.push(nameValidation.error);
    validation.isValid = false;
  }

  // Validate email
  const emailValidation = validateEmailFormat(sanitizedEmail);
  if (!emailValidation.isValid) {
    validation.errors.push(emailValidation.error);
    validation.isValid = false;
  }

  // Validate message
  const messageValidation = validateMessageLength(sanitizedMessage);
  if (!messageValidation.isValid) {
    validation.errors.push(messageValidation.error);
    validation.isValid = false;
  }

  debugLogger.info('VALIDATION', 'Form validation completed', {
    isValid: validation.isValid,
    errorCount: validation.errors.length,
    errors: validation.errors
  });

  return validation;
};

/**
 * Get character count information for form fields
 * @param {string} value - Field value
 * @param {number} maxLength - Maximum allowed length
 * @returns {object} Character count information
 */
export const getCharacterCount = (value, maxLength) => {
  const length = value ? value.length : 0;
  const remaining = maxLength - length;
  const isOverLimit = length > maxLength;

  return {
    current: length,
    max: maxLength,
    remaining: Math.max(0, remaining),
    isOverLimit,
    percentage: (length / maxLength) * 100
  };
};

/**
 * Validate individual field (used for real-time validation)
 * @param {string} fieldName - Name of the field ('name', 'email', 'message')
 * @param {string} value - Field value
 * @returns {object} Validation result
 */
export const validateField = (fieldName, value) => {
  debugLogger.debug('VALIDATION', `Validating individual field: ${fieldName}`);

  const sanitizedValue = sanitizeInput(value);

  switch (fieldName.toLowerCase()) {
    case 'name':
    case 'user_name':
      return validateName(sanitizedValue);
    
    case 'email':
    case 'user_email':
      return validateEmailFormat(sanitizedValue);
    
    case 'message':
      return validateMessageLength(sanitizedValue);
    
    default:
      return validateRequiredField(sanitizedValue, fieldName);
  }
};