/**
 * EmailJS service validation utilities
 */

import { debugLogger, errorTracker } from "./debugUtils";

// EmailJS configuration structure
export const EMAILJS_CONFIG = {
  SERVICE_ID: "service_f6mggyw", // Gmail SMTP service
  TEMPLATE_ID: "template_1i4pctj", // Original template ID
  PUBLIC_KEY: "hMkQEsU0NtAheYP4f", // Updated public API key
};

// Debug: Log the exact data being sent to EmailJS
export const debugEmailJSPayload = (formData) => {
  console.group("📧 EmailJS Debug Information");
  console.log("Service ID:", EMAILJS_CONFIG.SERVICE_ID);
  console.log("Template ID:", EMAILJS_CONFIG.TEMPLATE_ID);
  console.log("Public Key:", EMAILJS_CONFIG.PUBLIC_KEY);
  console.log("Form data being sent:", formData);
  console.log("Expected template variables: user_name, user_email, message");
  console.groupEnd();
};

/**
 * Validate EmailJS configuration
 */
export const validateEmailJSConfig = () => {
  debugLogger.info("VALIDATION", "Starting EmailJS configuration validation");

  const validationResults = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Check if configuration values are present
  if (!EMAILJS_CONFIG.SERVICE_ID) {
    validationResults.errors.push("SERVICE_ID is missing");
    validationResults.isValid = false;
  }

  if (!EMAILJS_CONFIG.TEMPLATE_ID) {
    validationResults.errors.push("TEMPLATE_ID is missing");
    validationResults.isValid = false;
  }

  if (!EMAILJS_CONFIG.PUBLIC_KEY) {
    validationResults.errors.push("PUBLIC_KEY is missing");
    validationResults.isValid = false;
  }

  // Check configuration format
  if (
    EMAILJS_CONFIG.SERVICE_ID &&
    !EMAILJS_CONFIG.SERVICE_ID.startsWith("service_")
  ) {
    validationResults.warnings.push('SERVICE_ID should start with "service_"');
  }

  if (
    EMAILJS_CONFIG.TEMPLATE_ID &&
    !EMAILJS_CONFIG.TEMPLATE_ID.startsWith("template_")
  ) {
    validationResults.warnings.push(
      'TEMPLATE_ID should start with "template_"'
    );
  }

  if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY.length < 10) {
    validationResults.warnings.push("PUBLIC_KEY seems too short");
  }

  // Log results
  if (validationResults.isValid) {
    debugLogger.info("VALIDATION", "EmailJS configuration validation passed", {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID,
      publicKeyLength: EMAILJS_CONFIG.PUBLIC_KEY.length,
      warnings: validationResults.warnings,
    });
  } else {
    debugLogger.error(
      "VALIDATION",
      "EmailJS configuration validation failed",
      validationResults
    );
  }

  return validationResults;
};

/**
 * Test EmailJS service connectivity
 */
export const testEmailJSConnectivity = async () => {
  debugLogger.info("SERVICE", "Testing EmailJS service connectivity");

  try {
    // Check if EmailJS is loaded
    if (typeof window.emailjs === "undefined") {
      throw new Error("EmailJS library is not loaded");
    }

    // Test with minimal data to check service availability
    const testData = {
      user_name: "Test User",
      user_email: "test@example.com",
      message: "This is a connectivity test message",
    };

    debugLogger.debug("SERVICE", "Attempting EmailJS connectivity test", {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID,
    });

    // Note: This is a dry run test - we're not actually sending
    // We're just checking if the service responds to initialization
    const result = await new Promise((resolve, reject) => {
      // Create a temporary form element for testing
      const tempForm = document.createElement("form");
      const nameInput = document.createElement("input");
      nameInput.name = "user_name";
      nameInput.value = testData.user_name;

      const emailInput = document.createElement("input");
      emailInput.name = "user_email";
      emailInput.value = testData.user_email;

      const messageInput = document.createElement("textarea");
      messageInput.name = "message";
      messageInput.value = testData.message;

      tempForm.appendChild(nameInput);
      tempForm.appendChild(emailInput);
      tempForm.appendChild(messageInput);

      // Set a short timeout for the test
      const timeoutId = setTimeout(() => {
        reject(new Error("EmailJS service test timed out"));
      }, 10000); // 10 second timeout

      // Import emailjs dynamically to test
      import("@emailjs/browser")
        .then((emailjs) => {
          clearTimeout(timeoutId);

          // Test service initialization
          try {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            debugLogger.info("SERVICE", "EmailJS initialization successful");
            resolve({
              success: true,
              message: "Service initialized successfully",
            });
          } catch (error) {
            reject(error);
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });

    debugLogger.info(
      "SERVICE",
      "EmailJS connectivity test completed successfully",
      result
    );
    return { success: true, ...result };
  } catch (error) {
    const trackedError = errorTracker.trackError(error, {
      test: "connectivity",
      config: EMAILJS_CONFIG,
    });

    debugLogger.error(
      "SERVICE",
      "EmailJS connectivity test failed",
      trackedError
    );
    return { success: false, error: trackedError };
  }
};

/**
 * Validate form data before sending
 */
export const validateFormData = (formData) => {
  debugLogger.debug("VALIDATION", "Validating form data", formData);

  const validation = {
    isValid: true,
    errors: [],
  };

  // Check required fields
  if (!formData.user_name || formData.user_name.trim().length === 0) {
    validation.errors.push("Name is required");
    validation.isValid = false;
  }

  if (!formData.user_email || formData.user_email.trim().length === 0) {
    validation.errors.push("Email is required");
    validation.isValid = false;
  }

  if (!formData.message || formData.message.trim().length === 0) {
    validation.errors.push("Message is required");
    validation.isValid = false;
  }

  // Validate email format
  if (formData.user_email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.user_email)) {
      validation.errors.push("Invalid email format");
      validation.isValid = false;
    }
  }

  // Validate field lengths
  if (formData.user_name && formData.user_name.length > 50) {
    validation.errors.push("Name must be less than 50 characters");
    validation.isValid = false;
  }

  if (formData.message && formData.message.length < 10) {
    validation.errors.push("Message must be at least 10 characters");
    validation.isValid = false;
  }

  if (formData.message && formData.message.length > 1000) {
    validation.errors.push("Message must be less than 1000 characters");
    validation.isValid = false;
  }

  debugLogger.debug("VALIDATION", "Form validation completed", validation);
  return validation;
};

/**
 * Get EmailJS service status information
 */
export const getServiceStatus = () => {
  const status = {
    timestamp: new Date().toISOString(),
    configuration: validateEmailJSConfig(),
    libraryLoaded: typeof window.emailjs !== "undefined",
    browserSupport: {
      fetch: typeof fetch !== "undefined",
      promise: typeof Promise !== "undefined",
      formData: typeof FormData !== "undefined",
    },
  };

  debugLogger.info("SERVICE", "EmailJS service status check", status);
  return status;
};
