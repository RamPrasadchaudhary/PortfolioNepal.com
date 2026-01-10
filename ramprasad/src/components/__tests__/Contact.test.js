/**
 * Unit and integration tests for Contact component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Contact from '../Contact';

// Mock dependencies
jest.mock('../../utils/debugUtils', () => ({
  debugLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../../utils/formValidation', () => ({
  validateContactForm: jest.fn(),
  validateField: jest.fn()
}));

jest.mock('../../services/emailService', () => ({
  default: {
    sendEmail: jest.fn(),
    testConnectivity: jest.fn()
  }
}));

const mockValidateContactForm = require('../../utils/formValidation').validateContactForm;
const mockValidateField = require('../../utils/formValidation').validateField;
const mockEmailService = require('../../services/emailService').default;

describe('Contact Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockValidateField.mockReturnValue({ isValid: true, error: null });
    mockValidateContactForm.mockReturnValue({
      isValid: true,
      errors: [],
      sanitizedData: {
        user_name: 'John Doe',
        user_email: 'john@example.com',
        message: 'Test message'
      }
    });
    mockEmailService.testConnectivity.mockResolvedValue({ success: true });
    mockEmailService.sendEmail.mockResolvedValue({ success: true });
  });

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(<Contact />);
      
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/your email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/your message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should have proper accessibility attributes', () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(messageInput).toHaveAttribute('aria-required', 'true');
      
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(messageInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have screen reader announcements area', () => {
      render(<Contact />);
      
      const announcementArea = screen.getByRole('status');
      expect(announcementArea).toHaveAttribute('aria-live', 'assertive');
      expect(announcementArea).toHaveAttribute('aria-atomic', 'true');
      expect(announcementArea).toHaveClass('sr-only');
    });
  });

  describe('Form Interaction', () => {
    it('should update form data on input change', async () => {
      const user = userEvent.setup();
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      
      await user.type(nameInput, 'John Doe');
      
      expect(nameInput).toHaveValue('John Doe');
    });

    it('should validate fields in real-time', async () => {
      const user = userEvent.setup();
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      
      await user.type(nameInput, 'A');
      await user.clear(nameInput);
      
      expect(mockValidateField).toHaveBeenCalledWith('user_name', '');
    });

    it('should display field validation errors', async () => {
      const user = userEvent.setup();
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is too short' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      
      await user.type(nameInput, 'A');
      
      await waitFor(() => {
        expect(screen.getByText('Name is too short')).toBeInTheDocument();
      });
      
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput).toHaveClass('error');
    });

    it('should clear errors when field becomes valid', async () => {
      const user = userEvent.setup();
      
      // First make field invalid
      mockValidateField.mockReturnValueOnce({ isValid: false, error: 'Name is too short' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      await user.type(nameInput, 'A');
      
      await waitFor(() => {
        expect(screen.getByText('Name is too short')).toBeInTheDocument();
      });
      
      // Then make field valid
      mockValidateField.mockReturnValueOnce({ isValid: true, error: null });
      
      await user.type(nameInput, 'John Doe');
      
      await waitFor(() => {
        expect(screen.queryByText('Name is too short')).not.toBeInTheDocument();
      });
      
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
      expect(nameInput).not.toHaveClass('error');
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully with valid data', async () => {
      const user = userEvent.setup();
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(messageInput, 'This is a test message');
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
          {
            user_name: 'John Doe',
            user_email: 'john@example.com',
            message: 'This is a test message'
          },
          expect.any(HTMLFormElement)
        );
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Make email service return a pending promise
      let resolveEmailPromise;
      mockEmailService.sendEmail.mockReturnValue(
        new Promise(resolve => { resolveEmailPromise = resolve; })
      );
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
      });
      
      // Resolve the promise
      act(() => {
        resolveEmailPromise({ success: true });
      });
    });

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup();
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });
      
      const successMessage = screen.getByRole('alert');
      expect(successMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');
      await user.type(messageInput, 'Test message');
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(messageInput).toHaveValue('');
      });
    });

    it('should handle validation errors during submission', async () => {
      const user = userEvent.setup();
      
      mockValidateContactForm.mockReturnValue({
        isValid: false,
        errors: ['Name is required', 'Email is invalid'],
        sanitizedData: {}
      });
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please fix the validation errors/i)).toBeInTheDocument();
      });
      
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle email service errors', async () => {
      const user = userEvent.setup();
      
      mockEmailService.sendEmail.mockResolvedValue({
        success: false,
        message: 'Network error occurred',
        error: { category: 'NETWORK', code: 'TIMEOUT' }
      });
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error occurred/i)).toBeInTheDocument();
      });
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce client-side rate limiting', async () => {
      const user = userEvent.setup();
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      // First submission
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
      });
      
      // Immediate second submission should be rate limited
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/please wait.*seconds/i)).toBeInTheDocument();
      });
      
      // Should not call email service again
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility Features', () => {
    it('should announce status changes to screen readers', async () => {
      const user = userEvent.setup();
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      const statusArea = screen.getByRole('status');
      
      await waitFor(() => {
        expect(statusArea).toHaveTextContent(/message sent successfully/i);
      });
    });

    it('should support keyboard navigation for error messages', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Name is required');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveAttribute('tabIndex', '0');
      });
      
      const errorMessage = screen.getByText('Name is required');
      
      // Test Enter key navigation
      fireEvent.keyDown(errorMessage, { key: 'Enter' });
      
      expect(nameInput).toHaveFocus();
    });

    it('should focus success message when shown', async () => {
      const user = userEvent.setup();
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        const successMessage = screen.getByText(/message sent successfully/i);
        expect(successMessage).toHaveFocus();
      });
    });

    it('should focus error message when shown', async () => {
      const user = userEvent.setup();
      
      mockEmailService.sendEmail.mockResolvedValue({
        success: false,
        message: 'Error occurred'
      });
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/error occurred/i);
        expect(errorMessage).toHaveFocus();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should test connectivity on mount in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      render(<Contact />);
      
      expect(mockEmailService.testConnectivity).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not test connectivity in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      render(<Contact />);
      
      expect(mockEmailService.testConnectivity).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Enhancement', () => {
    it('should enhance network error messages', async () => {
      const user = userEvent.setup();
      
      mockEmailService.sendEmail.mockResolvedValue({
        success: false,
        message: 'Network error',
        error: { category: 'NETWORK', code: 'TIMEOUT' }
      });
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error.*slow internet connection/i)).toBeInTheDocument();
      });
    });

    it('should enhance rate limiting error messages', async () => {
      const user = userEvent.setup();
      
      mockEmailService.sendEmail.mockResolvedValue({
        success: false,
        message: 'Too many requests',
        error: { category: 'SERVICE', code: 'RATE_LIMITED' }
      });
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/too many requests.*try again in a few minutes/i)).toBeInTheDocument();
      });
    });

    it('should provide fallback error messages for unexpected errors', async () => {
      const user = userEvent.setup();
      
      mockEmailService.sendEmail.mockRejectedValue(new Error('Unexpected error'));
      
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
      });
    });
  });
});