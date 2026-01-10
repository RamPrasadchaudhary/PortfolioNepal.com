/**
 * Unit tests for form validation utilities
 */

import {
  validateEmailFormat,
  validateRequiredField,
  validateMessageLength,
  validateName,
  sanitizeInput,
  validateContactForm,
  getCharacterCount,
  validateField,
  VALIDATION_RULES,
  VALIDATION_MESSAGES
} from './formValidation';

// Mock debugLogger to avoid console output during tests
jest.mock('./debugUtils', () => ({
  debugLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('validateEmailFormat', () => {
  test('should validate correct email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'user123@test-domain.com',
      'a@b.co'
    ];

    validEmails.forEach(email => {
      const result = validateEmailFormat(email);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  test('should reject invalid email formats', () => {
    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain', // No TLD
      'user..name@domain.com',
      'user@domain..com',
      'user name@domain.com'
    ];

    invalidEmails.forEach(email => {
      const result = validateEmailFormat(email);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_MESSAGES.FORMAT.EMAIL);
    });

    // Test empty strings separately as they return REQUIRED error
    const emptyEmails = ['', ' '];
    emptyEmails.forEach(email => {
      const result = validateEmailFormat(email);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_MESSAGES.REQUIRED.EMAIL);
    });
  });

  test('should handle null and undefined inputs', () => {
    expect(validateEmailFormat(null).isValid).toBe(false);
    expect(validateEmailFormat(undefined).isValid).toBe(false);
    expect(validateEmailFormat('').isValid).toBe(false);
  });

  test('should trim whitespace from email', () => {
    const result = validateEmailFormat('  test@example.com  ');
    expect(result.isValid).toBe(true);
  });
});

describe('validateRequiredField', () => {
  test('should validate non-empty strings', () => {
    const result = validateRequiredField('valid input', 'NAME');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('should reject empty strings', () => {
    const result = validateRequiredField('', 'NAME');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(VALIDATION_MESSAGES.REQUIRED.NAME);
  });

  test('should reject whitespace-only strings', () => {
    const result = validateRequiredField('   ', 'EMAIL');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(VALIDATION_MESSAGES.REQUIRED.EMAIL);
  });

  test('should handle null and undefined inputs', () => {
    expect(validateRequiredField(null, 'MESSAGE').isValid).toBe(false);
    expect(validateRequiredField(undefined, 'MESSAGE').isValid).toBe(false);
  });

  test('should use custom field names in error messages', () => {
    const result = validateRequiredField('', 'CUSTOM');
    expect(result.error).toBe('CUSTOM is required');
  });
});

describe('validateMessageLength', () => {
  test('should validate messages within length limits', () => {
    const validMessages = [
      'This is a valid message with enough characters',
      'A'.repeat(10), // Minimum length
      'A'.repeat(500), // Middle length
      'A'.repeat(1000) // Maximum length
    ];

    validMessages.forEach(message => {
      const result = validateMessageLength(message);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  test('should reject messages that are too short', () => {
    const shortMessages = [
      'Short',
      'A'.repeat(9) // One character short
    ];

    shortMessages.forEach(message => {
      const result = validateMessageLength(message);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_MESSAGES.LENGTH.MESSAGE_TOO_SHORT);
    });

    // Test empty string separately as it returns REQUIRED error
    const result = validateMessageLength('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(VALIDATION_MESSAGES.REQUIRED.MESSAGE);
  });

  test('should reject messages that are too long', () => {
    const longMessage = 'A'.repeat(1001); // One character too long
    const result = validateMessageLength(longMessage);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(VALIDATION_MESSAGES.LENGTH.MESSAGE_TOO_LONG);
  });

  test('should handle null and undefined inputs', () => {
    expect(validateMessageLength(null).isValid).toBe(false);
    expect(validateMessageLength(undefined).isValid).toBe(false);
  });

  test('should trim whitespace before validation', () => {
    const message = '  ' + 'A'.repeat(10) + '  ';
    const result = validateMessageLength(message);
    expect(result.isValid).toBe(true);
  });
});

describe('validateName', () => {
  test('should validate correct name formats', () => {
    const validNames = [
      'John Doe',
      'Mary-Jane Smith',
      "O'Connor",
      'Dr. Smith',
      'Jean-Pierre',
      'Anna Maria',
      'Al'
    ];

    validNames.forEach(name => {
      const result = validateName(name);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  test('should reject names with invalid characters', () => {
    const invalidNames = [
      'John123',
      'User@domain',
      'Name!',
      'Test#Name',
      'User$Name'
    ];

    invalidNames.forEach(name => {
      const result = validateName(name);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(VALIDATION_MESSAGES.FORMAT.NAME);
    });
  });

  test('should reject names that are too short', () => {
    const result = validateName('A');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(VALIDATION_MESSAGES.LENGTH.NAME_TOO_SHORT);
  });

  test('should reject names that are too long', () => {
    const longName = 'A'.repeat(51);
    const result = validateName(longName);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe(VALIDATION_MESSAGES.LENGTH.NAME_TOO_LONG);
  });

  test('should handle null and undefined inputs', () => {
    expect(validateName(null).isValid).toBe(false);
    expect(validateName(undefined).isValid).toBe(false);
    expect(validateName('').isValid).toBe(false);
  });
});

describe('sanitizeInput', () => {
  test('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello World';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello World');
  });

  test('should remove dangerous characters', () => {
    const input = 'Hello<>World';
    const result = sanitizeInput(input);
    expect(result).toBe('HelloWorld');
  });

  test('should remove javascript protocols', () => {
    const input = 'javascript:alert("xss")Hello';
    const result = sanitizeInput(input);
    expect(result).toBe('alert("xss")Hello');
  });

  test('should remove event handlers', () => {
    const input = 'onclick=alert("xss") Hello World';
    const result = sanitizeInput(input);
    expect(result).toBe('alert("xss") Hello World');
  });

  test('should normalize whitespace', () => {
    const input = 'Hello    World   Test';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello World Test');
  });

  test('should trim leading and trailing whitespace', () => {
    const input = '   Hello World   ';
    const result = sanitizeInput(input);
    expect(result).toBe('Hello World');
  });

  test('should handle null and undefined inputs', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });

  test('should handle non-string inputs', () => {
    expect(sanitizeInput(123)).toBe('');
    expect(sanitizeInput({})).toBe('');
  });
});

describe('validateContactForm', () => {
  test('should validate complete valid form data', () => {
    const formData = {
      user_name: 'John Doe',
      user_email: 'john@example.com',
      message: 'This is a valid message with enough characters to pass validation'
    };

    const result = validateContactForm(formData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.sanitizedData.user_name).toBe('John Doe');
    expect(result.sanitizedData.user_email).toBe('john@example.com');
  });

  test('should collect all validation errors', () => {
    const formData = {
      user_name: 'A', // Too short
      user_email: 'invalid-email', // Invalid format
      message: 'Short' // Too short
    };

    const result = validateContactForm(formData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(3);
    expect(result.errors).toContain(VALIDATION_MESSAGES.LENGTH.NAME_TOO_SHORT);
    expect(result.errors).toContain(VALIDATION_MESSAGES.FORMAT.EMAIL);
    expect(result.errors).toContain(VALIDATION_MESSAGES.LENGTH.MESSAGE_TOO_SHORT);
  });

  test('should sanitize form data', () => {
    const formData = {
      user_name: 'John Doe',
      user_email: '  john@example.com  ',
      message: 'This is a message with    multiple    spaces'
    };

    const result = validateContactForm(formData);
    expect(result.sanitizedData.user_name).toBe('John Doe');
    expect(result.sanitizedData.user_email).toBe('john@example.com');
    expect(result.sanitizedData.message).toBe('This is a message with multiple spaces');
  });

  test('should handle empty form data', () => {
    const formData = {
      user_name: '',
      user_email: '',
      message: ''
    };

    const result = validateContactForm(formData);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(3);
  });
});

describe('getCharacterCount', () => {
  test('should calculate character count correctly', () => {
    const result = getCharacterCount('Hello World', 50);
    expect(result.current).toBe(11);
    expect(result.max).toBe(50);
    expect(result.remaining).toBe(39);
    expect(result.isOverLimit).toBe(false);
    expect(result.percentage).toBe(22);
  });

  test('should handle over-limit scenarios', () => {
    const longText = 'A'.repeat(60);
    const result = getCharacterCount(longText, 50);
    expect(result.current).toBe(60);
    expect(result.remaining).toBe(0);
    expect(result.isOverLimit).toBe(true);
    expect(result.percentage).toBe(120);
  });

  test('should handle null and undefined values', () => {
    const result = getCharacterCount(null, 50);
    expect(result.current).toBe(0);
    expect(result.remaining).toBe(50);
    expect(result.isOverLimit).toBe(false);
  });
});

describe('validateField', () => {
  test('should validate name field', () => {
    const result = validateField('name', 'John Doe');
    expect(result.isValid).toBe(true);
  });

  test('should validate email field', () => {
    const result = validateField('email', 'john@example.com');
    expect(result.isValid).toBe(true);
  });

  test('should validate message field', () => {
    const result = validateField('message', 'This is a valid message');
    expect(result.isValid).toBe(true);
  });

  test('should handle user_name field variant', () => {
    const result = validateField('user_name', 'John Doe');
    expect(result.isValid).toBe(true);
  });

  test('should handle user_email field variant', () => {
    const result = validateField('user_email', 'john@example.com');
    expect(result.isValid).toBe(true);
  });

  test('should handle unknown field types', () => {
    const result = validateField('unknown', 'some value');
    expect(result.isValid).toBe(true);
  });

  test('should sanitize input before validation', () => {
    const result = validateField('name', '<script>John</script> Doe');
    expect(result.isValid).toBe(true);
  });
});

describe('VALIDATION_RULES constants', () => {
  test('should have correct name validation rules', () => {
    expect(VALIDATION_RULES.NAME.MIN_LENGTH).toBe(2);
    expect(VALIDATION_RULES.NAME.MAX_LENGTH).toBe(50);
    expect(VALIDATION_RULES.NAME.PATTERN).toBeInstanceOf(RegExp);
  });

  test('should have correct email validation rules', () => {
    expect(VALIDATION_RULES.EMAIL.PATTERN).toBeInstanceOf(RegExp);
  });

  test('should have correct message validation rules', () => {
    expect(VALIDATION_RULES.MESSAGE.MIN_LENGTH).toBe(10);
    expect(VALIDATION_RULES.MESSAGE.MAX_LENGTH).toBe(1000);
  });
});

describe('VALIDATION_MESSAGES constants', () => {
  test('should have required field messages', () => {
    expect(VALIDATION_MESSAGES.REQUIRED.NAME).toBeDefined();
    expect(VALIDATION_MESSAGES.REQUIRED.EMAIL).toBeDefined();
    expect(VALIDATION_MESSAGES.REQUIRED.MESSAGE).toBeDefined();
  });

  test('should have format validation messages', () => {
    expect(VALIDATION_MESSAGES.FORMAT.EMAIL).toBeDefined();
    expect(VALIDATION_MESSAGES.FORMAT.NAME).toBeDefined();
  });

  test('should have length validation messages', () => {
    expect(VALIDATION_MESSAGES.LENGTH.NAME_TOO_SHORT).toBeDefined();
    expect(VALIDATION_MESSAGES.LENGTH.NAME_TOO_LONG).toBeDefined();
    expect(VALIDATION_MESSAGES.LENGTH.MESSAGE_TOO_SHORT).toBeDefined();
    expect(VALIDATION_MESSAGES.LENGTH.MESSAGE_TOO_LONG).toBeDefined();
  });
});