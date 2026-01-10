/**
 * Integration tests for Contact component
 * Tests the complete email submission flow end-to-end
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Contact from '../Contact';
import emailService from '../../services/emailService';
import { debugLogger } from '../../utils/debugUtils';

// Mock the email service
jest.mock('../../services/emailService');
jest.mock('../../utils/debugUtils');

describe('Contact Component - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock debugLogger methods
    debugLogger.info = jest.fn();
    debugLogger.warn = jest.fn();
    debugLogger.error = jest.fn();
    debugLogger.debug = jest.fn();
  });

  describe('Complete Email Submission Flow', () => {
    it('should successfully send email with valid form data', async () => {
      // Mock successful email service response
      emailService.sendEmail.mockResolvedValue({
        success: true,
        status: 200,
        message: 'Email sent successfully'
      });

      emailService.testConnectivity.mockResolvedValue({
        success: true,
        message: 'Service connectivity test passed'
      });

      render(<Contact />);

      // Fill out the form with valid data
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough to pass validation.' } });

      // Submit the form
      fireEvent.click(submitButton);

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/message sent successfully/i);
      });

      // Verify email service was called with correct data
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        {
          user_name: 'John Doe',
          user_email: 'john@example.com',
          message: 'This is a test message that is long enough to pass validation.'
        },
        expect.any(HTMLFormElement)
      );

      // Verify form was reset
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(messageInput.value).toBe('');
    });

    it('should handle email service failure gracefully', async () => {
      // Mock email service failure
      emailService.sendEmail.mockResolvedValue({
        success: false,
        message: 'Network error occurred',
        error: {
          category: 'NETWORK',
          code: 'TIMEOUT',
          message: 'Request timed out'
        }
      });

      emailService.testConnectivity.mockResolvedValue({
        success: true,
        message: 'Service connectivity test passed'
      });

      render(<Contact />);

      // Fill out the form
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough to pass validation.' } });

      // Submit the form
      fireEvent.click(submitButton);

      // Wait for error message
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toHaveTextContent(/network error occurred/i);
      });

      // Verify form was not reset (user can retry)
      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('john@example.com');
      expect(messageInput.value).toBe('This is a test message that is long enough to pass validation.');
    });

    it('should validate form data before submission', async () => {
      render(<Contact />);

      const submitButton = screen.getByRole('button', { name: /send message/i });

      // Submit empty form
      fireEvent.click(submitButton);

      // Wait for validation error
      await waitFor(() => {
        expect(screen.getByText(/please fix the validation errors/i)).toBeInTheDocument();
      });

      // Verify email service was not called
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle rate limiting correctly', async () => {
      emailService.testConnectivity.mockResolvedValue({
        success: true,
        message: 'Service connectivity test passed'
      });

      render(<Contact />);

      // Fill out the form
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough to pass validation.' } });

      // Mock first submission success
      emailService.sendEmail.mockResolvedValueOnce({
        success: true,
        status: 200,
        message: 'Email sent successfully'
      });

      // Submit first time
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });

      // Try to submit again immediately (should be rate limited)
      fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'Another test message that is long enough.' } });

      fireEvent.click(submitButton);

      // Should show rate limit message
      await waitFor(() => {
        expect(screen.getByText(/please wait.*seconds before sending/i)).toBeInTheDocument();
      });

      // Verify second email service call was not made
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    });
  });

  describe('Logging Integration', () => {
    it('should log form submission events', async () => {
      emailService.sendEmail.mockResolvedValue({
        success: true,
        status: 200,
        message: 'Email sent successfully'
      });

      emailService.testConnectivity.mockResolvedValue({
        success: true,
        message: 'Service connectivity test passed'
      });

      render(<Contact />);

      // Fill and submit form
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough to pass validation.' } });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
      });

      // Verify logging calls were made
      expect(debugLogger.info).toHaveBeenCalledWith('FORM', 'Form submission started');
      expect(debugLogger.info).toHaveBeenCalledWith('VALIDATION', 'Form validation passed');
      expect(debugLogger.info).toHaveBeenCalledWith('EMAIL', 'Email sent successfully', expect.any(Object));
    });
  });

  describe('Error Recovery Integration', () => {
    it('should provide enhanced error messages based on error type', async () => {
      // Mock network error
      emailService.sendEmail.mockResolvedValue({
        success: false,
        message: 'Unable to connect to email service',
        error: {
          category: 'NETWORK',
          code: 'TIMEOUT',
          message: 'Request timed out'
        }
      });

      emailService.testConnectivity.mockResolvedValue({
        success: true,
        message: 'Service connectivity test passed'
      });

      render(<Contact />);

      // Fill and submit form
      const nameInput = screen.getByLabelText(/your name/i);
      const emailInput = screen.getByLabelText(/your email/i);
      const messageInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'This is a test message that is long enough to pass validation.' } });

      fireEvent.click(submitButton);

      // Wait for enhanced error message
      await waitFor(() => {
        expect(screen.getByText(/unable to connect to email service.*slow internet connection/i)).toBeInTheDocument();
      });
    });
  });
});