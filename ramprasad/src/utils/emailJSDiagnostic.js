/**
 * EmailJS Diagnostic Tool
 * Helps diagnose and fix EmailJS template configuration issues
 */

import { debugLogger } from './debugUtils';
import { EMAILJS_CONFIG } from './emailJSValidator';

/**
 * Diagnose EmailJS 422 template mismatch errors
 */
export const diagnoseTemplateIssue = (formData, error) => {
  debugLogger.info('DIAGNOSTIC', 'Starting EmailJS template diagnostic', {
    formData,
    error: error.message,
    status: error.status
  });

  const diagnosis = {
    issue: 'Template Data Mismatch (422 Error)',
    description: 'The form data variables don\'t match your EmailJS template variables',
    currentFormData: formData,
    config: {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID,
      publicKey: EMAILJS_CONFIG.PUBLIC_KEY
    },
    commonSolutions: [],
    recommendations: []
  };

  // Common variable name mappings
  const commonMappings = {
    'user_name': ['name', 'from_name', 'sender_name', 'user_name'],
    'user_email': ['email', 'from_email', 'sender_email', 'user_email', 'reply_to'],
    'message': ['message', 'content', 'body', 'text', 'user_message']
  };

  // Generate solutions
  diagnosis.commonSolutions = [
    {
      solution: 'Check EmailJS Template Variables',
      description: 'Log into your EmailJS dashboard and verify the template variables',
      steps: [
        '1. Go to https://dashboard.emailjs.com/',
        '2. Navigate to Email Templates',
        `3. Find template: ${EMAILJS_CONFIG.TEMPLATE_ID}`,
        '4. Check the variable names used in your template (e.g., {{name}}, {{email}}, {{message}})',
        '5. Update the template or update the form data to match'
      ]
    },
    {
      solution: 'Common Variable Name Fixes',
      description: 'Try these common variable name combinations',
      options: Object.entries(commonMappings).map(([current, alternatives]) => ({
        current,
        alternatives,
        note: `If your template uses {{${alternatives[0]}}}, change ${current} to ${alternatives[0]}`
      }))
    },
    {
      solution: 'Update Template Variables',
      description: 'Update your EmailJS template to use these exact variables',
      templateVariables: Object.keys(formData),
      templateExample: `
Subject: New Contact Form Message from {{user_name}}

From: {{user_name}} ({{user_email}})
Message: {{message}}
      `.trim()
    }
  ];

  // Generate specific recommendations
  diagnosis.recommendations = [
    'Most common fix: Change template variables to match form data',
    'Alternative: Update form data to match existing template variables',
    'Verify your EmailJS service ID and template ID are correct',
    'Check that your EmailJS account is active and not suspended'
  ];

  debugLogger.info('DIAGNOSTIC', 'Template diagnostic completed', diagnosis);
  return diagnosis;
};

/**
 * Generate template variable mapping suggestions
 */
export const generateVariableMappingSuggestions = (formData) => {
  const suggestions = {
    currentVariables: Object.keys(formData),
    commonAlternatives: {
      user_name: ['name', 'from_name', 'sender_name'],
      user_email: ['email', 'from_email', 'reply_to'],
      message: ['content', 'body', 'text']
    },
    mappingOptions: []
  };

  // Generate mapping options
  Object.entries(formData).forEach(([key, value]) => {
    const alternatives = suggestions.commonAlternatives[key] || [];
    suggestions.mappingOptions.push({
      formField: key,
      currentValue: value,
      templateAlternatives: alternatives,
      recommendation: `Use {{${alternatives[0] || key}}} in your EmailJS template`
    });
  });

  return suggestions;
};

/**
 * Create a test payload for debugging
 */
export const createTestPayload = (customVariables = null) => {
  const defaultPayload = {
    user_name: 'Test User',
    user_email: 'test@example.com',
    message: 'This is a test message to verify template variables'
  };

  const testPayload = customVariables || defaultPayload;

  debugLogger.info('DIAGNOSTIC', 'Created test payload', testPayload);
  
  return {
    payload: testPayload,
    instructions: [
      '1. Try sending this test payload',
      '2. If it fails with 422, check the error details',
      '3. Update your EmailJS template variables to match this payload',
      '4. Or update this payload to match your template variables'
    ],
    templateExample: `
Subject: Contact Form - {{user_name}}

Name: {{user_name}}
Email: {{user_email}}
Message: {{message}}
    `.trim()
  };
};

/**
 * Validate template configuration
 */
export const validateTemplateConfiguration = async () => {
  debugLogger.info('DIAGNOSTIC', 'Validating EmailJS template configuration');

  const validation = {
    timestamp: new Date().toISOString(),
    config: EMAILJS_CONFIG,
    checks: [],
    recommendations: []
  };

  // Check 1: Configuration completeness
  const configCheck = {
    name: 'Configuration Completeness',
    status: 'CHECKING'
  };

  if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_ID || !EMAILJS_CONFIG.PUBLIC_KEY) {
    configCheck.status = 'FAIL';
    configCheck.issue = 'Missing configuration values';
    configCheck.details = {
      serviceId: !!EMAILJS_CONFIG.SERVICE_ID,
      templateId: !!EMAILJS_CONFIG.TEMPLATE_ID,
      publicKey: !!EMAILJS_CONFIG.PUBLIC_KEY
    };
  } else {
    configCheck.status = 'PASS';
    configCheck.details = 'All configuration values present';
  }

  validation.checks.push(configCheck);

  // Check 2: Configuration format
  const formatCheck = {
    name: 'Configuration Format',
    status: 'CHECKING'
  };

  const formatIssues = [];
  if (!EMAILJS_CONFIG.SERVICE_ID.startsWith('service_')) {
    formatIssues.push('SERVICE_ID should start with "service_"');
  }
  if (!EMAILJS_CONFIG.TEMPLATE_ID.startsWith('template_')) {
    formatIssues.push('TEMPLATE_ID should start with "template_"');
  }
  if (EMAILJS_CONFIG.PUBLIC_KEY.length < 10) {
    formatIssues.push('PUBLIC_KEY seems too short');
  }

  if (formatIssues.length > 0) {
    formatCheck.status = 'WARN';
    formatCheck.issues = formatIssues;
  } else {
    formatCheck.status = 'PASS';
    formatCheck.details = 'Configuration format looks correct';
  }

  validation.checks.push(formatCheck);

  // Generate recommendations
  if (configCheck.status === 'FAIL') {
    validation.recommendations.push('Update missing configuration values in src/utils/emailJSValidator.js');
  }

  if (formatCheck.status === 'WARN') {
    validation.recommendations.push('Verify configuration values are copied correctly from EmailJS dashboard');
  }

  validation.recommendations.push('Check EmailJS dashboard for template variable names');
  validation.recommendations.push('Ensure EmailJS account is active and template is published');

  debugLogger.info('DIAGNOSTIC', 'Template configuration validation completed', validation);
  return validation;
};

// Export for browser console debugging
if (typeof window !== 'undefined') {
  window.emailJSDiagnostic = {
    diagnoseTemplateIssue,
    generateVariableMappingSuggestions,
    createTestPayload,
    validateTemplateConfiguration
  };
}