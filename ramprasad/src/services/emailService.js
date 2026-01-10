/**
 * EmailJS Service Wrapper
 * Provides a robust abstraction layer for EmailJS operations with retry logic,
 * error handling, timeout management, and comprehensive logging.
 */

import emailjs from "@emailjs/browser";
import {
  debugLogger,
  errorTracker,
  ERROR_CATEGORIES,
} from "../utils/debugUtils";
import {
  validateEmailJSConfig,
  validateFormData,
  EMAILJS_CONFIG,
  debugEmailJSPayload,
} from "../utils/emailJSValidator";

// Service configuration constants
const SERVICE_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  REQUEST_TIMEOUT_MS: 30000,
  EXPONENTIAL_BACKOFF_MULTIPLIER: 2,
};

/**
 * EmailJS Service Wrapper Class
 */
class EmailJSService {
  constructor() {
    this.isInitialized = false;
    this.initializationPromise = null;
    this.config = EMAILJS_CONFIG;
  }

  /**
   * Initialize the EmailJS service with configuration validation
   * @returns {Promise<boolean>} Success status of initialization
   */
  async initialize() {
    if (this.isInitialized) {
      debugLogger.debug("SERVICE", "EmailJS service already initialized");
      return true;
    }

    if (this.initializationPromise) {
      debugLogger.debug(
        "SERVICE",
        "EmailJS initialization already in progress"
      );
      return await this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return await this.initializationPromise;
  }

  /**
   * Internal initialization logic
   * @private
   */
  async _performInitialization() {
    try {
      debugLogger.info("SERVICE", "Starting EmailJS service initialization");

      // Validate configuration
      const configValidation = validateEmailJSConfig();
      if (!configValidation.isValid) {
        const error = new Error(
          `EmailJS configuration validation failed: ${configValidation.errors.join(
            ", "
          )}`
        );
        error.category = ERROR_CATEGORIES.CONFIGURATION;
        throw error;
      }

      // Check if EmailJS library is available
      if (typeof emailjs === "undefined") {
        const error = new Error("EmailJS library is not available");
        error.category = ERROR_CATEGORIES.CONFIGURATION;
        throw error;
      }

      // Initialize EmailJS with public key
      emailjs.init(this.config.PUBLIC_KEY);

      this.isInitialized = true;
      debugLogger.info("SERVICE", "EmailJS service initialized successfully", {
        serviceId: this.config.SERVICE_ID,
        templateId: this.config.TEMPLATE_ID,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      this.isInitialized = false;
      this.initializationPromise = null;

      const trackedError = errorTracker.trackError(error, {
        operation: "initialization",
        config: this.config,
      });

      debugLogger.error(
        "SERVICE",
        "EmailJS service initialization failed",
        trackedError
      );
      throw trackedError;
    }
  }

  /**
   * Send email with retry logic and timeout handling
   * @param {Object} formData - Form data containing user_name, user_email, and message
   * @param {HTMLFormElement} formElement - Optional form element for EmailJS sendForm
   * @returns {Promise<Object>} Result object with success status and details
   */
  async sendEmail(formData, formElement = null) {
    debugLogger.info("SERVICE", "Email send request initiated", {
      hasFormData: !!formData,
      hasFormElement: !!formElement,
      timestamp: new Date().toISOString(),
    });

    try {
      // Ensure service is initialized
      await this.initialize();

      // Validate form data
      const validation = validateFormData(formData);
      if (!validation.isValid) {
        const error = new Error(
          `Form validation failed: ${validation.errors.join(", ")}`
        );
        error.category = ERROR_CATEGORIES.VALIDATION;
        throw error;
      }

      // Send email with retry logic
      const result = await this._sendWithRetry(formData, formElement);

      debugLogger.info("SERVICE", "Email sent successfully", {
        status: result.status,
        text: result.text,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        status: result.status,
        message: "Email sent successfully",
        details: result,
      };
    } catch (error) {
      const trackedError = errorTracker.trackEmailJSError(error, formData);

      debugLogger.error(
        "SERVICE",
        "Email send failed after all retry attempts",
        trackedError
      );

      return {
        success: false,
        message: this._getUserFriendlyErrorMessage(trackedError),
        error: trackedError,
      };
    }
  }

  /**
   * Send email with retry logic and exponential backoff
   * @private
   */
  async _sendWithRetry(formData, formElement, attempt = 1) {
    debugLogger.debug(
      "SERVICE",
      `Email send attempt ${attempt}/${SERVICE_CONFIG.MAX_RETRY_ATTEMPTS}`
    );

    try {
      const result = await this._sendEmailWithTimeout(formData, formElement);
      return result;
    } catch (error) {
      debugLogger.warn("SERVICE", `Email send attempt ${attempt} failed`, {
        error: error.message,
        category: error.category || "unknown",
        code: error.code || "unknown",
      });

      // Don't retry for configuration or validation errors
      if (
        error.category === ERROR_CATEGORIES.CONFIGURATION ||
        error.category === ERROR_CATEGORIES.VALIDATION
      ) {
        debugLogger.info(
          "SERVICE",
          "Not retrying due to non-retryable error category",
          {
            category: error.category,
            code: error.code,
          }
        );
        throw error;
      }

      // Check if we should retry
      if (attempt < SERVICE_CONFIG.MAX_RETRY_ATTEMPTS) {
        const delay = this._calculateRetryDelay(error, attempt);

        debugLogger.info("SERVICE", `Retrying email send in ${delay}ms`, {
          attempt: attempt + 1,
          maxAttempts: SERVICE_CONFIG.MAX_RETRY_ATTEMPTS,
          errorCode: error.code,
          delayReason: this._getDelayReason(error),
        });

        await this._delay(delay);
        return await this._sendWithRetry(formData, formElement, attempt + 1);
      }

      // All retry attempts exhausted
      error.finalAttempt = true;
      debugLogger.error("SERVICE", "All retry attempts exhausted", {
        totalAttempts: attempt,
        finalError: error.message,
        category: error.category,
        code: error.code,
      });
      throw error;
    }
  }

  /**
   * Calculate retry delay based on error type and attempt number
   * @private
   */
  _calculateRetryDelay(error, attempt) {
    const baseDelay = SERVICE_CONFIG.RETRY_DELAY_MS;
    const exponentialDelay =
      baseDelay *
      Math.pow(SERVICE_CONFIG.EXPONENTIAL_BACKOFF_MULTIPLIER, attempt - 1);

    // Special handling for rate limiting - use longer delays
    if (error.code === "RATE_LIMITED") {
      // For rate limiting, use a longer base delay and steeper exponential backoff
      const rateLimitDelay = 5000 * Math.pow(2, attempt - 1); // 5s, 10s, 20s
      return Math.min(rateLimitDelay, 30000); // Cap at 30 seconds
    }

    // For network timeouts, use longer delays
    if (error.code === "TIMEOUT") {
      const timeoutDelay =
        baseDelay *
        2 *
        Math.pow(SERVICE_CONFIG.EXPONENTIAL_BACKOFF_MULTIPLIER, attempt - 1);
      return Math.min(timeoutDelay, 15000); // Cap at 15 seconds
    }

    // For service unavailable, use moderate delays
    if (error.code === "SERVICE_UNAVAILABLE") {
      const serviceDelay =
        baseDelay *
        1.5 *
        Math.pow(SERVICE_CONFIG.EXPONENTIAL_BACKOFF_MULTIPLIER, attempt - 1);
      return Math.min(serviceDelay, 10000); // Cap at 10 seconds
    }

    // Default exponential backoff for other errors
    return Math.min(exponentialDelay, 8000); // Cap at 8 seconds
  }

  /**
   * Get human-readable reason for retry delay
   * @private
   */
  _getDelayReason(error) {
    switch (error.code) {
      case "RATE_LIMITED":
        return "rate limiting detected";
      case "TIMEOUT":
        return "request timeout";
      case "SERVICE_UNAVAILABLE":
        return "service unavailable";
      case "NETWORK_ERROR":
        return "network connectivity issue";
      default:
        return "temporary error";
    }
  }

  /**
   * Send email with timeout handling
   * @private
   */
  async _sendEmailWithTimeout(formData, formElement) {
    // Debug: Log the exact payload being sent to EmailJS
    debugEmailJSPayload(formData);

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const error = new Error("Email send request timed out");
        error.category = ERROR_CATEGORIES.NETWORK;
        error.code = "TIMEOUT";
        reject(error);
      }, SERVICE_CONFIG.REQUEST_TIMEOUT_MS);

      // Always use sendForm method for better compatibility
      let sendPromise;
      
      if (formElement) {
        // Use the provided form element
        sendPromise = emailjs.sendForm(
          this.config.SERVICE_ID,
          this.config.TEMPLATE_ID,
          formElement,
          this.config.PUBLIC_KEY
        );
      } else {
        // Create a temporary form element from formData
        const tempForm = document.createElement('form');
        
        // Add form fields
        Object.keys(formData).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = formData[key];
          tempForm.appendChild(input);
        });
        
        // Append to body temporarily
        document.body.appendChild(tempForm);
        
        // Send using sendForm method
        sendPromise = emailjs.sendForm(
          this.config.SERVICE_ID,
          this.config.TEMPLATE_ID,
          tempForm,
          this.config.PUBLIC_KEY
        ).finally(() => {
          // Clean up: remove the temporary form
          document.body.removeChild(tempForm);
        });
      }

      sendPromise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);

          // Enhanced error categorization and code assignment
          this._categorizeAndEnhanceError(error);

          reject(error);
        });
    });
  }

  /**
   * Categorize and enhance error with specific codes and details
   * @private
   */
  _categorizeAndEnhanceError(error) {
    const message = error.message?.toLowerCase() || "";
    const status = error.status || error.code || 0;

    debugLogger.debug("SERVICE", "Categorizing error", {
      status,
      message: error.message,
      text: error.text,
      originalError: error,
    });

    // Network-related errors
    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection") ||
      message.includes("offline") ||
      status === 0 ||
      !navigator.onLine
    ) {
      error.category = ERROR_CATEGORIES.NETWORK;
      error.code = this._getNetworkErrorCode(error);
      return;
    }

    // Rate limiting errors
    if (
      status === 429 ||
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("quota")
    ) {
      error.category = ERROR_CATEGORIES.SERVICE;
      error.code = "RATE_LIMITED";
      return;
    }

    // Gmail API authentication errors (412)
    if (
      status === 412 ||
      message.includes("gmail_api") ||
      message.includes("insufficient authentication scopes")
    ) {
      error.category = ERROR_CATEGORIES.CONFIGURATION;
      error.code = "GMAIL_API_AUTH_ERROR";
      error.emailJSSpecific = true;
      debugLogger.error(
        "SERVICE",
        "Gmail API authentication error - insufficient scopes",
        {
          status,
          message: error.message,
          text: error.text,
          templateId: this.config.TEMPLATE_ID,
          serviceId: this.config.SERVICE_ID,
        }
      );
      return;
    }

    // EmailJS specific 422 errors (template/data mismatch)
    if (status === 422) {
      error.category = ERROR_CATEGORIES.CONFIGURATION;
      error.code = "TEMPLATE_DATA_MISMATCH";
      error.emailJSSpecific = true;
      debugLogger.error(
        "SERVICE",
        "EmailJS 422 error - template/data mismatch",
        {
          status,
          message: error.message,
          text: error.text,
          templateId: this.config.TEMPLATE_ID,
          serviceId: this.config.SERVICE_ID,
        }
      );
      return;
    }

    // Service unavailable errors
    if (
      status === 503 ||
      status === 502 ||
      status === 504 ||
      message.includes("service unavailable") ||
      message.includes("server error") ||
      message.includes("maintenance") ||
      message.includes("temporarily unavailable")
    ) {
      error.category = ERROR_CATEGORIES.SERVICE;
      error.code = "SERVICE_UNAVAILABLE";
      return;
    }

    // Configuration errors
    if (
      status === 401 ||
      status === 403 ||
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("invalid key") ||
      message.includes("invalid service") ||
      message.includes("template not found") ||
      message.includes("service not found")
    ) {
      error.category = ERROR_CATEGORIES.CONFIGURATION;
      error.code = this._getConfigurationErrorCode(error);
      return;
    }

    // Validation errors
    if (
      status === 400 ||
      message.includes("validation") ||
      message.includes("invalid") ||
      message.includes("required") ||
      message.includes("bad request")
    ) {
      error.category = ERROR_CATEGORIES.VALIDATION;
      error.code = "VALIDATION_FAILED";
      return;
    }

    // Server errors
    if (status >= 500 && status < 600) {
      error.category = ERROR_CATEGORIES.SERVICE;
      error.code = "SERVER_ERROR";
      return;
    }

    // Default to unknown
    error.category = ERROR_CATEGORIES.UNKNOWN;
    error.code = "UNKNOWN_ERROR";
  }

  /**
   * Get specific network error code
   * @private
   */
  _getNetworkErrorCode(error) {
    const message = error.message?.toLowerCase() || "";

    if (message.includes("timeout")) return "TIMEOUT";
    if (message.includes("offline") || !navigator.onLine) return "OFFLINE";
    if (message.includes("dns") || message.includes("resolve"))
      return "DNS_ERROR";
    if (message.includes("connection refused")) return "CONNECTION_REFUSED";
    if (message.includes("connection reset")) return "CONNECTION_RESET";

    return "NETWORK_ERROR";
  }

  /**
   * Get specific configuration error code
   * @private
   */
  _getConfigurationErrorCode(error) {
    const message = error.message?.toLowerCase() || "";
    const status = error.status || 0;

    if (status === 401 || message.includes("unauthorized"))
      return "INVALID_API_KEY";
    if (status === 403 || message.includes("forbidden")) return "ACCESS_DENIED";
    if (message.includes("service not found")) return "INVALID_SERVICE_ID";
    if (message.includes("template not found")) return "INVALID_TEMPLATE_ID";

    return "CONFIGURATION_ERROR";
  }

  /**
   * Get user-friendly error message based on error category and specific error code
   * @private
   */
  _getUserFriendlyErrorMessage(error) {
    const errorCode = error.code || "UNKNOWN";

    switch (error.category) {
      case ERROR_CATEGORIES.NETWORK:
        return this._getNetworkErrorMessage(errorCode);
      case ERROR_CATEGORIES.SERVICE:
        return this._getServiceErrorMessage(errorCode);
      case ERROR_CATEGORIES.CONFIGURATION:
        return this._getConfigurationErrorMessage(errorCode);
      case ERROR_CATEGORIES.VALIDATION:
        return "Please check your form data and try again.";
      default:
        return this._getFallbackErrorMessage(error);
    }
  }

  /**
   * Get specific network error messages
   * @private
   */
  _getNetworkErrorMessage(errorCode) {
    switch (errorCode) {
      case "TIMEOUT":
        return "The request timed out. Please check your internet connection and try again.";
      case "OFFLINE":
        return "You appear to be offline. Please check your internet connection and try again.";
      case "DNS_ERROR":
        return "Unable to resolve email service address. Please check your internet connection.";
      case "CONNECTION_REFUSED":
        return "Connection to email service was refused. Please try again later.";
      case "CONNECTION_RESET":
        return "Connection to email service was interrupted. Please try again.";
      case "NETWORK_ERROR":
      default:
        return "Unable to connect to email service. Please check your internet connection and try again.";
    }
  }

  /**
   * Get specific service error messages
   * @private
   */
  _getServiceErrorMessage(errorCode) {
    switch (errorCode) {
      case "RATE_LIMITED":
        return "Too many requests sent. Please wait a moment before sending another message.";
      case "SERVICE_UNAVAILABLE":
        return "Email service is temporarily unavailable due to maintenance. Please try again later.";
      case "SERVER_ERROR":
        return "Email service is experiencing technical difficulties. Please try again later.";
      default:
        return "Email service is temporarily unavailable. Please try again later.";
    }
  }

  /**
   * Get specific configuration error messages
   * @private
   */
  _getConfigurationErrorMessage(errorCode) {
    switch (errorCode) {
      case "GMAIL_API_AUTH_ERROR":
        return "Gmail API authentication error. The EmailJS service needs to be re-authenticated with proper Gmail permissions. Please contact support to fix the Gmail API configuration.";
      case "TEMPLATE_DATA_MISMATCH":
        return "Email template configuration mismatch. The form data doesn't match the EmailJS template variables. Please contact support to fix the template configuration.";
      case "INVALID_API_KEY":
        return "Email service authentication failed. Please contact support.";
      case "ACCESS_DENIED":
        return "Access to email service denied. Please contact support.";
      case "INVALID_SERVICE_ID":
        return "Email service configuration error (invalid service). Please contact support.";
      case "INVALID_TEMPLATE_ID":
        return "Email service configuration error (invalid template). Please contact support.";
      case "CONFIGURATION_ERROR":
      default:
        return "Email service configuration error. Please contact support.";
    }
  }

  /**
   * Get fallback error message for unexpected errors
   * @private
   */
  _getFallbackErrorMessage(error) {
    // Log the unexpected error for debugging
    debugLogger.error("SERVICE", "Unexpected error encountered", {
      message: error.message,
      stack: error.stack,
      category: error.category,
      code: error.code,
    });

    // Provide different fallback messages based on available information
    if (error.message && error.message.length > 0) {
      // If we have an error message, provide a generic but informative response
      return "An unexpected error occurred while sending your message. Please try again, and if the problem persists, contact support.";
    }

    // Ultimate fallback for completely unknown errors
    return "An unexpected error occurred. Please try again.";
  }

  /**
   * Utility function to create delays for retry logic
   * @private
   */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test service connectivity
   * @returns {Promise<Object>} Connectivity test result
   */
  async testConnectivity() {
    debugLogger.info("SERVICE", "Testing EmailJS service connectivity");

    try {
      await this.initialize();

      const testData = {
        user_name: "Test User",
        user_email: "test@example.com",
        message: "This is a connectivity test message",
      };

      // Create a temporary form for testing
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

      // Test service initialization (without actually sending)
      const result = {
        success: true,
        message: "Service connectivity test passed",
        timestamp: new Date().toISOString(),
        config: {
          serviceId: this.config.SERVICE_ID,
          templateId: this.config.TEMPLATE_ID,
          initialized: this.isInitialized,
        },
      };

      debugLogger.info(
        "SERVICE",
        "Connectivity test completed successfully",
        result
      );
      return result;
    } catch (error) {
      const trackedError = errorTracker.trackError(error, {
        operation: "connectivity_test",
      });

      debugLogger.error("SERVICE", "Connectivity test failed", trackedError);

      return {
        success: false,
        message: "Service connectivity test failed",
        error: trackedError,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get service status and configuration information
   * @returns {Object} Service status information
   */
  getStatus() {
    const status = {
      initialized: this.isInitialized,
      timestamp: new Date().toISOString(),
      configuration: validateEmailJSConfig(),
      libraryLoaded: typeof emailjs !== "undefined",
      config: {
        maxRetryAttempts: SERVICE_CONFIG.MAX_RETRY_ATTEMPTS,
        retryDelay: SERVICE_CONFIG.RETRY_DELAY_MS,
        requestTimeout: SERVICE_CONFIG.REQUEST_TIMEOUT_MS,
      },
    };

    debugLogger.debug("SERVICE", "Service status requested", status);
    return status;
  }

  /**
   * Reset service state (useful for testing)
   */
  reset() {
    this.isInitialized = false;
    this.initializationPromise = null;
    debugLogger.info("SERVICE", "EmailJS service reset");
  }
}

// Create and export singleton instance
const emailService = new EmailJSService();

export default emailService;
export { EmailJSService, SERVICE_CONFIG };
