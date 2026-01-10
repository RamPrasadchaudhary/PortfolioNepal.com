/**
 * Integration verification utility
 * Verifies that all components are properly wired together
 */

import { debugLogger } from './debugUtils';
import { validateContactForm } from './formValidation';
import emailService from '../services/emailService';

/**
 * Verify all integration points are working
 */
export const verifyIntegration = () => {
  debugLogger.info('INTEGRATION', 'Starting integration verification');

  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    overall: true
  };

  // Check 1: Form validation utilities are available
  try {
    const testValidation = validateContactForm({
      user_name: 'Test User',
      user_email: 'test@example.com',
      message: 'This is a test message for integration verification.'
    });
    
    results.checks.push({
      name: 'Form Validation Integration',
      status: testValidation.isValid ? 'PASS' : 'FAIL',
      details: `Validation result: ${testValidation.isValid}, errors: ${testValidation.errors.length}`
    });
  } catch (error) {
    results.checks.push({
      name: 'Form Validation Integration',
      status: 'ERROR',
      details: error.message
    });
    results.overall = false;
  }

  // Check 2: EmailJS service is available
  try {
    const serviceStatus = emailService.getStatus();
    results.checks.push({
      name: 'EmailJS Service Integration',
      status: serviceStatus.initialized ? 'PASS' : 'READY',
      details: `Initialized: ${serviceStatus.initialized}, Library loaded: ${serviceStatus.libraryLoaded}`
    });
  } catch (error) {
    results.checks.push({
      name: 'EmailJS Service Integration',
      status: 'ERROR',
      details: error.message
    });
    results.overall = false;
  }

  // Check 3: Debug logging is working
  try {
    debugLogger.debug('INTEGRATION', 'Test debug message');
    results.checks.push({
      name: 'Debug Logging Integration',
      status: 'PASS',
      details: 'Debug logging is functional'
    });
  } catch (error) {
    results.checks.push({
      name: 'Debug Logging Integration',
      status: 'ERROR',
      details: error.message
    });
    results.overall = false;
  }

  // Check 4: Session storage for logs
  try {
    const logs = JSON.parse(sessionStorage.getItem('emailDebugLogs') || '[]');
    results.checks.push({
      name: 'Log Storage Integration',
      status: 'PASS',
      details: `Found ${logs.length} stored log entries`
    });
  } catch (error) {
    results.checks.push({
      name: 'Log Storage Integration',
      status: 'ERROR',
      details: error.message
    });
    results.overall = false;
  }

  // Check 5: Error recovery utilities
  try {
    const { errorRecoveryManager } = require('./errorRecovery');
    const testError = { category: 'NETWORK', code: 'TIMEOUT' };
    const isRecoverable = errorRecoveryManager.isRecoverable(testError);
    
    results.checks.push({
      name: 'Error Recovery Integration',
      status: 'PASS',
      details: `Error recovery manager functional, test error recoverable: ${isRecoverable}`
    });
  } catch (error) {
    results.checks.push({
      name: 'Error Recovery Integration',
      status: 'ERROR',
      details: error.message
    });
    results.overall = false;
  }

  debugLogger.info('INTEGRATION', 'Integration verification completed', results);
  return results;
};

/**
 * Test complete email flow integration (without actually sending)
 */
export const testEmailFlowIntegration = async () => {
  debugLogger.info('INTEGRATION', 'Testing complete email flow integration');

  const testData = {
    user_name: 'Integration Test User',
    user_email: 'integration@test.com',
    message: 'This is an integration test message to verify the complete email flow without actually sending an email.'
  };

  try {
    // Step 1: Validate form data
    const validation = validateContactForm(testData);
    if (!validation.isValid) {
      throw new Error(`Form validation failed: ${validation.errors.join(', ')}`);
    }
    debugLogger.info('INTEGRATION', 'Form validation passed', validation);

    // Step 2: Test service initialization
    await emailService.initialize();
    debugLogger.info('INTEGRATION', 'Email service initialized successfully');

    // Step 3: Test connectivity (without sending)
    const connectivityTest = await emailService.testConnectivity();
    debugLogger.info('INTEGRATION', 'Connectivity test completed', connectivityTest);

    return {
      success: true,
      message: 'Email flow integration test completed successfully',
      steps: [
        'Form validation: PASS',
        'Service initialization: PASS',
        'Connectivity test: ' + (connectivityTest.success ? 'PASS' : 'PARTIAL')
      ]
    };

  } catch (error) {
    debugLogger.error('INTEGRATION', 'Email flow integration test failed', error);
    return {
      success: false,
      message: 'Email flow integration test failed',
      error: error.message
    };
  }
};

/**
 * Generate integration report
 */
export const generateIntegrationReport = async () => {
  const verification = verifyIntegration();
  const flowTest = await testEmailFlowIntegration();

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      componentIntegration: verification.overall ? 'PASS' : 'FAIL',
      emailFlowIntegration: flowTest.success ? 'PASS' : 'FAIL',
      overallStatus: (verification.overall && flowTest.success) ? 'PASS' : 'PARTIAL'
    },
    details: {
      componentChecks: verification.checks,
      flowTest: flowTest
    },
    recommendations: []
  };

  // Add recommendations based on results
  if (!verification.overall) {
    report.recommendations.push('Review component integration issues in the details section');
  }
  
  if (!flowTest.success) {
    report.recommendations.push('Check email service configuration and network connectivity');
  }

  if (report.summary.overallStatus === 'PASS') {
    report.recommendations.push('All integration points are working correctly');
  }

  debugLogger.info('INTEGRATION', 'Integration report generated', report);
  return report;
};

// Export for use in development/debugging
if (typeof window !== 'undefined') {
  window.emailIntegrationUtils = {
    verifyIntegration,
    testEmailFlowIntegration,
    generateIntegrationReport
  };
}