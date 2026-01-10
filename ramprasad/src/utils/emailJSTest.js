/**
 * Simple EmailJS Test Utility
 * Use this to test your EmailJS configuration directly
 */

import emailjs from '@emailjs/browser';

// Your current configuration
const TEST_CONFIG = {
  SERVICE_ID: 'service_f6mggyw',
  TEMPLATE_ID: 'template_1i4pctj', 
  PUBLIC_KEY: 'hMkQEsU0NtAheYP4f'
};

/**
 * Test EmailJS configuration with minimal data
 */
export const testEmailJSDirectly = async () => {
  console.group('🧪 EmailJS Direct Test');
  
  try {
    // Initialize EmailJS
    emailjs.init(TEST_CONFIG.PUBLIC_KEY);
    console.log('✅ EmailJS initialized successfully');
    
    // Test data
    const testData = {
      user_name: 'Test User',
      user_email: 'test@example.com',
      message: 'This is a direct test message'
    };
    
    console.log('📤 Sending test email with data:', testData);
    console.log('📋 Using configuration:', TEST_CONFIG);
    
    // Create temporary form
    const tempForm = document.createElement('form');
    Object.keys(testData).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = testData[key];
      tempForm.appendChild(input);
    });
    
    document.body.appendChild(tempForm);
    
    // Send email
    const result = await emailjs.sendForm(
      TEST_CONFIG.SERVICE_ID,
      TEST_CONFIG.TEMPLATE_ID,
      tempForm,
      TEST_CONFIG.PUBLIC_KEY
    );
    
    // Clean up
    document.body.removeChild(tempForm);
    
    console.log('✅ Email sent successfully!', result);
    console.log('📧 Check your email inbox for the test message');
    
    return { success: true, result };
    
  } catch (error) {
    console.error('❌ EmailJS test failed:', error);
    console.log('📋 Error details:', {
      message: error.message,
      status: error.status,
      text: error.text
    });
    
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
};

// Make it available in browser console
if (typeof window !== 'undefined') {
  window.testEmailJS = testEmailJSDirectly;
}