# Manual Testing Scenarios for Email Service Fix

This document provides comprehensive manual testing scenarios to validate the email service functionality, error handling, and accessibility features.

## Prerequisites

Before starting manual testing:

1. Ensure the application is running locally
2. Have access to browser developer tools
3. Test with multiple browsers (Chrome, Firefox, Safari, Edge)
4. Have screen reader software available for accessibility testing
5. Prepare test email addresses for validation

## Test Environment Setup

### Browser Configuration
- Test in both desktop and mobile viewports
- Enable/disable JavaScript to test graceful degradation
- Test with slow network conditions (throttling)
- Test with ad blockers enabled/disabled

### Accessibility Tools
- Install browser extensions: axe DevTools, WAVE
- Have screen reader software ready (NVDA, JAWS, VoiceOver)
- Test with keyboard-only navigation

## Core Functionality Tests

### TC001: Basic Form Submission
**Objective**: Verify successful email submission with valid data

**Steps**:
1. Navigate to the contact form
2. Fill in all required fields with valid data:
   - Name: "John Doe"
   - Email: "john.doe@example.com"
   - Message: "This is a test message with sufficient length"
3. Click "Send Message" button
4. Wait for response

**Expected Results**:
- Form submits successfully
- Success message appears: "Message sent successfully! Thank you for reaching out."
- Form fields are cleared
- Success message disappears after 5 seconds
- No console errors

**Test Data**:
```
Name: John Doe
Email: john.doe@example.com
Message: This is a comprehensive test message that contains enough characters to pass the minimum length validation requirements.
```

### TC002: Form Validation - Empty Fields
**Objective**: Verify validation for empty required fields

**Steps**:
1. Navigate to the contact form
2. Leave all fields empty
3. Click "Send Message" button

**Expected Results**:
- Form does not submit
- Error message appears: "Please fix the validation errors above."
- Individual field errors are displayed
- No network request is made

### TC003: Form Validation - Invalid Email
**Objective**: Verify email format validation

**Test Cases**:
| Input | Expected Result |
|-------|----------------|
| `invalid-email` | "Please enter a valid email address" |
| `@domain.com` | "Please enter a valid email address" |
| `user@` | "Please enter a valid email address" |
| `user@domain` | "Please enter a valid email address" |
| `user..name@domain.com` | "Please enter a valid email address" |

**Steps**:
1. Enter invalid email in each test case
2. Tab to next field or submit form
3. Verify error message appears

### TC004: Form Validation - Name Field
**Objective**: Verify name field validation

**Test Cases**:
| Input | Expected Result |
|-------|----------------|
| `A` | "Name must be at least 2 characters" |
| `A`.repeat(51) | "Name must be less than 50 characters" |
| `John123` | "Name can only contain letters, spaces, hyphens, apostrophes, and periods" |
| `John@Doe` | "Name can only contain letters, spaces, hyphens, apostrophes, and periods" |

### TC005: Form Validation - Message Field
**Objective**: Verify message field validation

**Test Cases**:
| Input | Expected Result |
|-------|----------------|
| `Short` | "Message must be at least 10 characters" |
| `A`.repeat(1001) | "Message must be less than 1000 characters" |

### TC006: Real-time Validation
**Objective**: Verify validation occurs as user types

**Steps**:
1. Start typing in name field with single character
2. Observe error message appears
3. Continue typing to make field valid
4. Observe error message disappears
5. Repeat for email and message fields

**Expected Results**:
- Validation errors appear immediately when field becomes invalid
- Validation errors disappear when field becomes valid
- Field styling changes (red border for errors)

## Error Handling Tests

### TC007: Network Error Simulation
**Objective**: Test handling of network connectivity issues

**Steps**:
1. Open browser developer tools
2. Go to Network tab and set to "Offline"
3. Fill form with valid data
4. Submit form

**Expected Results**:
- Error message: "You appear to be offline. Please check your internet connection and try again."
- Form remains filled
- User can retry after reconnecting

### TC008: Slow Network Simulation
**Objective**: Test timeout handling

**Steps**:
1. Open browser developer tools
2. Set network throttling to "Slow 3G"
3. Fill form with valid data
4. Submit form
5. Observe loading state

**Expected Results**:
- Loading spinner appears
- Submit button shows "Sending..." text
- Submit button is disabled during submission
- Timeout error appears if request takes too long

### TC009: Rate Limiting Test
**Objective**: Verify client-side rate limiting

**Steps**:
1. Fill form with valid data
2. Submit form successfully
3. Immediately try to submit again

**Expected Results**:
- Second submission is blocked
- Error message: "Please wait X seconds before sending another message."
- Timer counts down
- Can submit again after waiting period

### TC010: Service Error Simulation
**Objective**: Test handling of service errors

**Note**: This requires temporarily modifying EmailJS configuration or using network tools to simulate 503 errors.

**Expected Results**:
- Appropriate error message for service unavailable
- User-friendly language
- Suggestion to try again later

## Accessibility Tests

### TC011: Keyboard Navigation
**Objective**: Verify complete keyboard accessibility

**Steps**:
1. Use only keyboard (no mouse)
2. Tab through all form elements
3. Use Enter/Space to activate buttons
4. Navigate to error messages with Tab
5. Use Enter on error messages to focus inputs

**Expected Results**:
- All interactive elements are reachable via keyboard
- Tab order is logical
- Focus indicators are visible
- Error messages are focusable
- Pressing Enter on error focuses corresponding input

### TC012: Screen Reader Testing
**Objective**: Verify screen reader compatibility

**Tools**: NVDA (Windows), VoiceOver (Mac), or JAWS

**Steps**:
1. Navigate to form with screen reader active
2. Listen to form field announcements
3. Fill form and trigger validation errors
4. Listen to error announcements
5. Submit form and listen to status updates

**Expected Results**:
- Form fields are properly labeled
- Required fields are announced as required
- Validation errors are announced immediately
- Success/error messages are announced
- Loading states are communicated

### TC013: High Contrast Mode
**Objective**: Verify visibility in high contrast mode

**Steps**:
1. Enable high contrast mode (Windows) or increase contrast (Mac)
2. Navigate through form
3. Trigger validation errors
4. Submit form

**Expected Results**:
- All text remains readable
- Form boundaries are visible
- Error states are distinguishable
- Focus indicators are visible

### TC014: Zoom Testing
**Objective**: Verify usability at high zoom levels

**Steps**:
1. Zoom browser to 200%
2. Navigate through form
3. Fill and submit form
4. Test at 400% zoom

**Expected Results**:
- Form remains usable at all zoom levels
- No horizontal scrolling required
- All buttons remain clickable
- Text remains readable

## Performance Tests

### TC015: Form Responsiveness
**Objective**: Verify form responds quickly to user input

**Steps**:
1. Type rapidly in form fields
2. Quickly switch between fields
3. Rapidly click submit button multiple times

**Expected Results**:
- No input lag
- Validation updates smoothly
- No duplicate submissions
- UI remains responsive

### TC016: Memory Usage
**Objective**: Verify no memory leaks during extended use

**Steps**:
1. Open browser developer tools
2. Go to Memory tab
3. Use form repeatedly for 10+ submissions
4. Monitor memory usage

**Expected Results**:
- Memory usage remains stable
- No significant memory leaks
- Performance doesn't degrade over time

## Cross-Browser Tests

### TC017: Browser Compatibility
**Objective**: Verify functionality across different browsers

**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

**Steps**:
1. Run core functionality tests in each browser
2. Test form validation
3. Test error handling
4. Test accessibility features

**Expected Results**:
- Consistent behavior across all browsers
- No browser-specific errors
- Styling appears correctly

## Mobile Device Tests

### TC018: Mobile Responsiveness
**Objective**: Verify form works on mobile devices

**Steps**:
1. Test on actual mobile devices or browser dev tools
2. Test in portrait and landscape orientations
3. Test form submission
4. Test validation errors

**Expected Results**:
- Form is fully usable on mobile
- Touch targets are appropriately sized
- Virtual keyboard doesn't obscure form
- Validation messages are readable

### TC019: Touch Interaction
**Objective**: Verify touch-specific interactions

**Steps**:
1. Use touch gestures to navigate form
2. Test touch scrolling with validation errors
3. Test form submission via touch

**Expected Results**:
- All touch interactions work smoothly
- No accidental activations
- Scrolling works properly with errors visible

## Security Tests

### TC020: Input Sanitization
**Objective**: Verify malicious input is handled safely

**Test Inputs**:
```html
<script>alert('xss')</script>
<img src="x" onerror="alert('xss')">
javascript:alert('xss')
onclick="alert('xss')"
```

**Steps**:
1. Enter malicious scripts in each form field
2. Submit form
3. Check that scripts don't execute
4. Verify data is sanitized in logs

**Expected Results**:
- No script execution
- Input is sanitized
- Form submission works normally
- No security warnings in console

## Edge Cases

### TC021: Extremely Long Input
**Objective**: Test handling of very long input

**Steps**:
1. Enter maximum allowed characters in each field
2. Try to enter more than maximum
3. Submit form

**Expected Results**:
- Validation prevents overly long input
- Form handles maximum length gracefully
- No performance issues

### TC022: Special Characters
**Objective**: Test handling of international and special characters

**Test Data**:
```
Name: José María O'Connor-Smith
Email: test@münchen.de
Message: Testing with émojis 🚀 and special chars: ñáéíóú
```

**Expected Results**:
- All characters are accepted and preserved
- Email sends successfully
- No encoding issues

### TC023: Rapid Form Interactions
**Objective**: Test form under rapid user interactions

**Steps**:
1. Rapidly switch between fields
2. Quickly type and delete content
3. Rapidly click submit multiple times
4. Switch tabs while form is submitting

**Expected Results**:
- Form remains stable
- No duplicate submissions
- Validation works correctly
- No JavaScript errors

## Debugging and Logging Tests

### TC024: Console Logging
**Objective**: Verify appropriate logging for debugging

**Steps**:
1. Open browser console
2. Perform various form actions
3. Trigger different error scenarios
4. Check console output

**Expected Results**:
- Appropriate debug information is logged
- No sensitive information in logs
- Error details are helpful for debugging
- Log levels are appropriate

### TC025: Error Recovery
**Objective**: Test error recovery mechanisms

**Steps**:
1. Trigger various error conditions
2. Resolve the error conditions
3. Retry form submission
4. Verify recovery works

**Expected Results**:
- Form recovers gracefully from errors
- Retry mechanisms work properly
- User can successfully submit after errors
- No persistent error states

## Test Completion Checklist

- [ ] All core functionality tests pass
- [ ] Form validation works correctly
- [ ] Error handling is comprehensive
- [ ] Accessibility requirements are met
- [ ] Performance is acceptable
- [ ] Cross-browser compatibility confirmed
- [ ] Mobile functionality verified
- [ ] Security measures are effective
- [ ] Edge cases are handled properly
- [ ] Logging and debugging work correctly

## Reporting Issues

When reporting issues found during manual testing:

1. **Issue Title**: Clear, descriptive title
2. **Test Case**: Reference the test case number
3. **Steps to Reproduce**: Detailed steps
4. **Expected Result**: What should happen
5. **Actual Result**: What actually happened
6. **Environment**: Browser, OS, device details
7. **Screenshots**: If applicable
8. **Console Errors**: Any JavaScript errors
9. **Severity**: Critical, High, Medium, Low

## Test Data Repository

### Valid Test Data
```javascript
const validTestData = {
  name: "John Doe",
  email: "john.doe@example.com",
  message: "This is a comprehensive test message that meets all validation requirements and provides sufficient content for testing purposes."
};
```

### Invalid Test Data
```javascript
const invalidTestData = {
  shortName: "A",
  longName: "A".repeat(51),
  invalidEmail: "invalid-email-format",
  shortMessage: "Short",
  longMessage: "A".repeat(1001),
  specialChars: "<script>alert('test')</script>"
};
```

### Edge Case Data
```javascript
const edgeCaseData = {
  internationalName: "José María O'Connor-Smith",
  internationalEmail: "test@münchen.de",
  emojiMessage: "Testing with emojis 🚀🎉 and special characters: ñáéíóú",
  maxLengthName: "A".repeat(50),
  maxLengthMessage: "A".repeat(1000)
};
```