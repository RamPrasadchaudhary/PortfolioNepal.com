/**
 * Accessibility-focused tests for Contact component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { axe, toHaveNoViolations } from 'jest-axe';
import Contact from '../Contact';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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

describe('Contact Component - Accessibility Tests', () => {
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

  describe('Automated Accessibility Testing', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<Contact />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations with validation errors', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      const { container } = render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations with success message', async () => {
      const { container } = render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should not have accessibility violations with error message', async () => {
      mockEmailService.sendEmail.mockResolvedValue({
        success: false,
        message: 'Error occurred'
      });
      
      const { container } = render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Labels and Descriptions', () => {
    it('should have proper ARIA labels for form inputs', () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name.*required/i);
      const emailInput = screen.getByLabelText(/your email.*required/i);
      const messageInput = screen.getByLabelText(/your message.*required.*10-1000 characters/i);
      
      expect(nameInput).toHaveAttribute('aria-label');
      expect(emailInput).toHaveAttribute('aria-label');
      expect(messageInput).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA descriptions for form inputs', () => {
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      
      expect(nameInput).toHaveAttribute('aria-describedby', 'name-help');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-help');
      expect(messageInput).toHaveAttribute('aria-describedby', 'message-help');
      
      expect(screen.getByText('Enter your full name')).toHaveAttribute('id', 'name-help');
      expect(screen.getByText('Enter a valid email address')).toHaveAttribute('id', 'email-help');
      expect(screen.getByText('Enter your message, between 10 and 1000 characters')).toHaveAttribute('id', 'message-help');
    });

    it('should update ARIA descriptions when validation errors occur', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error name-help');
        expect(screen.getByText('Name is required')).toHaveAttribute('id', 'name-error');
      });
    });

    it('should have proper ARIA invalid attributes', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      
      // Initially valid
      expect(nameInput).toHaveAttribute('aria-invalid', 'false');
      
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should have live region for status announcements', () => {
      render(<Contact />);
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveClass('sr-only');
    });

    it('should announce form submission status', async () => {
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      const liveRegion = screen.getByRole('status');
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/message sent successfully/i);
      });
    });

    it('should announce validation errors', async () => {
      mockValidateField
        .mockReturnValueOnce({ isValid: true, error: null })
        .mockReturnValueOnce({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      const liveRegion = screen.getByRole('status');
      
      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/name field has an error/i);
      });
    });

    it('should announce error resolution', async () => {
      mockValidateField
        .mockReturnValueOnce({ isValid: false, error: 'Name is required' })
        .mockReturnValueOnce({ isValid: true, error: null });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      const liveRegion = screen.getByRole('status');
      
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/name field has an error/i);
      });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/name field error resolved/i);
      });
    });

    it('should announce loading state', async () => {
      let resolveEmailPromise;
      mockEmailService.sendEmail.mockReturnValue(
        new Promise(resolve => { resolveEmailPromise = resolve; })
      );
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      const liveRegion = screen.getByRole('status');
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/sending message, please wait/i);
      });
      
      // Clean up
      resolveEmailPromise({ success: true });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through form elements', async () => {
      const user = userEvent.setup();
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      // Tab through elements
      await user.tab();
      expect(nameInput).toHaveFocus();
      
      await user.tab();
      expect(emailInput).toHaveFocus();
      
      await user.tab();
      expect(messageInput).toHaveFocus();
      
      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('should support keyboard navigation to error messages', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Name is required');
        expect(errorMessage).toHaveAttribute('tabIndex', '0');
      });
      
      const errorMessage = screen.getByText('Name is required');
      errorMessage.focus();
      expect(errorMessage).toHaveFocus();
    });

    it('should navigate from error message to input on Enter key', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Name is required');
        expect(errorMessage).toBeInTheDocument();
      });
      
      const errorMessage = screen.getByText('Name is required');
      fireEvent.keyDown(errorMessage, { key: 'Enter' });
      
      expect(nameInput).toHaveFocus();
    });

    it('should navigate from error message to input on Space key', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Email is invalid' });
      
      render(<Contact />);
      
      const emailInput = screen.getByLabelText(/your email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Email is invalid');
        expect(errorMessage).toBeInTheDocument();
      });
      
      const errorMessage = screen.getByText('Email is invalid');
      fireEvent.keyDown(errorMessage, { key: ' ' });
      
      expect(emailInput).toHaveFocus();
    });

    it('should support form submission with Enter key', async () => {
      const user = userEvent.setup();
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      submitButton.focus();
      await user.keyboard('{Enter}');
      
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should focus success message when displayed', async () => {
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const successMessage = screen.getByText(/message sent successfully/i);
        expect(successMessage).toHaveFocus();
      });
    });

    it('should focus error message when displayed', async () => {
      mockEmailService.sendEmail.mockResolvedValue({
        success: false,
        message: 'Error occurred'
      });
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/error occurred/i);
        expect(errorMessage).toHaveFocus();
      });
    });

    it('should maintain focus on submit button when disabled', async () => {
      let resolveEmailPromise;
      mockEmailService.sendEmail.mockReturnValue(
        new Promise(resolve => { resolveEmailPromise = resolve; })
      );
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      submitButton.focus();
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveFocus();
      });
      
      // Clean up
      resolveEmailPromise({ success: true });
    });
  });

  describe('Error Message Accessibility', () => {
    it('should have proper role and aria-live for error messages', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Name is required');
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('should have descriptive aria-label for error messages', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Name is required' });
      
      render(<Contact />);
      
      const nameInput = screen.getByLabelText(/your name/i);
      fireEvent.change(nameInput, { target: { value: '' } });
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Name is required');
        expect(errorMessage).toHaveAttribute('aria-label', 
          'Error for name field: Name is required. Press Enter to focus the name input.');
      });
    });

    it('should include "Error:" prefix for screen readers', async () => {
      mockValidateField.mockReturnValue({ isValid: false, error: 'Email is invalid' });
      
      render(<Contact />);
      
      const emailInput = screen.getByLabelText(/your email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      
      await waitFor(() => {
        const errorPrefix = screen.getByText('Error:');
        expect(errorPrefix).toHaveClass('sr-only');
      });
    });
  });

  describe('Button Accessibility', () => {
    it('should have proper aria-label for submit button states', async () => {
      let resolveEmailPromise;
      mockEmailService.sendEmail.mockReturnValue(
        new Promise(resolve => { resolveEmailPromise = resolve; })
      );
      
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      // Initial state
      expect(submitButton).toHaveAttribute('aria-label', 'Send message');
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(submitButton).toHaveAttribute('aria-label', 'Sending message, please wait');
      });
      
      // Clean up
      resolveEmailPromise({ success: true });
    });

    it('should have proper aria-describedby for submit button', () => {
      render(<Contact />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      expect(submitButton).toHaveAttribute('aria-describedby', 'submit-status');
      
      const statusElement = screen.getByText('Send Message');
      expect(statusElement).toHaveAttribute('id', 'submit-status');
      expect(statusElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form labeling', () => {
      render(<Contact />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-labelledby', 'contact-heading');
      expect(form).toHaveAttribute('noValidate');
      
      const heading = screen.getByRole('heading', { name: /send a message/i });
      expect(heading).toHaveAttribute('id', 'contact-heading');
    });

    it('should have proper section labeling', () => {
      render(<Contact />);
      
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'contact-heading');
    });
  });
});