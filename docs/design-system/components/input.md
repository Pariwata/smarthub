# Input Component Specification

## Overview

The Input component is a fundamental form element that allows users to enter text, numbers, and other data. This specification ensures all input implementations are consistent, accessible, and aligned with the Smart Hub design system.

## Visual Design

### Basic Structure

The Input component consists of:
1. **Label** (optional but recommended)
2. **Input field** (main element)
3. **Helper text** (optional)
4. **Error message** (conditional)
5. **Icon/prefix/suffix** (optional)

### Sizes

#### Small
- **Height**: 32px
- **Padding**: `--spacing-2` `--spacing-3` (8px 12px)
- **Font Size**: `--font-size-sm` (14px)
- **Border Radius**: `--border-radius-md` (6px)

#### Medium (Default)
- **Height**: 40px
- **Padding**: `--spacing-3` `--spacing-4` (12px 16px)
- **Font Size**: `--font-size-base` (16px)
- **Border Radius**: `--border-radius-md` (6px)

#### Large
- **Height**: 48px
- **Padding**: `--spacing-4` `--spacing-5` (16px 20px)
- **Font Size**: `--font-size-lg` (18px)
- **Border Radius**: `--border-radius-lg` (8px)

### States

#### Default
- **Background**: `--color-neutral-0` (white)
- **Border**: `--border-width-1` solid `--color-neutral-300`
- **Text Color**: `--color-neutral-900`
- **Placeholder Color**: `--color-neutral-400`

#### Hover
- **Border Color**: `--color-neutral-400`
- **Cursor**: text
- **Transition**: `--transition-duration-base` `--transition-timing-ease-in-out`

#### Focus
- **Border**: `--border-width-2` solid `--color-primary-500`
- **Outline**: 2px solid `--color-primary-300` with 2px offset
- **Box Shadow**: `--shadow-sm` with primary color tint

#### Filled (has value)
- Same as default with user-entered text
- **Text Color**: `--color-neutral-900`

#### Disabled
- **Background**: `--color-neutral-100`
- **Border Color**: `--color-neutral-200`
- **Text Color**: `--color-neutral-400`
- **Cursor**: not-allowed
- **Opacity**: 0.6

#### Error
- **Border**: `--border-width-2` solid `--color-error-500`
- **Error Text Color**: `--color-error-700`
- **Error Icon**: Display warning/error icon
- **Error Message**: Display below input

#### Success
- **Border**: `--border-width-1` solid `--color-success-500`
- **Success Icon**: Optional checkmark icon
- **Text Color**: `--color-neutral-900`

#### Read-only
- **Background**: `--color-neutral-50`
- **Border Color**: `--color-neutral-200`
- **Cursor**: default
- No hover or focus effects

### Input Types

#### Text
- Standard single-line text input
- Supports placeholder, maxLength
- Auto-complete support

#### Email
- Validates email format
- Shows keyboard hint on mobile
- Auto-complete for email addresses

#### Password
- Obscures entered text
- Toggle visibility icon (show/hide)
- Strength indicator (optional)
- No copy/paste in some cases

#### Number
- Numeric input only
- Optional min/max constraints
- Step increment controls
- Currency formatting support

#### Tel
- Phone number input
- Format based on locale
- Shows numeric keyboard on mobile

#### URL
- URL validation
- Protocol prefix (http://, https://)
- Auto-complete for URLs

#### Search
- Search-specific styling
- Clear button
- Search icon prefix
- Auto-complete suggestions

#### Date/Time
- Native date picker integration
- Format based on locale
- Min/max date constraints

#### Textarea
- Multi-line text input
- Resizable (vertical)
- Character counter (optional)
- Auto-grow support

## Component Props

### Required Props

- **`id`**: string
  - Unique identifier for the input
  - Links label to input for accessibility

### Optional Props

- **`type`**: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local'
  - Default: 'text'
  - HTML input type

- **`value`**: string | number
  - Controlled component value
  - Use with onChange for controlled inputs

- **`defaultValue`**: string | number
  - Initial value for uncontrolled inputs

- **`onChange`**: (event: ChangeEvent) => void
  - Change event handler
  - Receives native input change event

- **`onBlur`**: (event: FocusEvent) => void
  - Blur event handler

- **`onFocus`**: (event: FocusEvent) => void
  - Focus event handler

- **`size`**: 'small' | 'medium' | 'large'
  - Default: 'medium'
  - Controls input dimensions

- **`label`**: string | ReactNode
  - Input label text
  - Associates with input via htmlFor

- **`placeholder`**: string
  - Placeholder text
  - Should not replace labels

- **`helperText`**: string | ReactNode
  - Descriptive text below input
  - Provides additional context

- **`error`**: boolean
  - Default: false
  - Indicates error state

- **`errorMessage`**: string | ReactNode
  - Error message text
  - Displayed when error is true

- **`success`**: boolean
  - Default: false
  - Indicates success state

- **`disabled`**: boolean
  - Default: false
  - Disables input interaction

- **`readOnly`**: boolean
  - Default: false
  - Makes input read-only

- **`required`**: boolean
  - Default: false
  - Marks field as required

- **`maxLength`**: number
  - Maximum character length
  - Shows character counter when set

- **`minLength`**: number
  - Minimum character length

- **`pattern`**: string
  - Regex pattern for validation

- **`min`**: number | string
  - Minimum value (for number/date types)

- **`max`**: number | string
  - Maximum value (for number/date types)

- **`step`**: number | string
  - Step increment (for number type)

- **`autoComplete`**: string
  - HTML autocomplete attribute
  - E.g., 'email', 'username', 'current-password'

- **`autoFocus`**: boolean
  - Default: false
  - Auto-focus on mount (use sparingly)

- **`leftIcon`**: ReactNode
  - Icon displayed at left of input
  - E.g., search icon, user icon

- **`rightIcon`**: ReactNode
  - Icon displayed at right of input
  - E.g., calendar icon, clear button

- **`prefix`**: string | ReactNode
  - Prefix text/element (e.g., currency symbol)

- **`suffix`**: string | ReactNode
  - Suffix text/element (e.g., unit of measurement)

- **`fullWidth`**: boolean
  - Default: false
  - Makes input span full container width

- **`className`**: string
  - Additional CSS classes

- **`inputClassName`**: string
  - Additional CSS classes for input element only

- **`name`**: string
  - Form field name

- **`ariaLabel`**: string
  - Accessible label (when label prop not used)

- **`ariaDescribedBy`**: string
  - ID of element describing the input

- **`testId`**: string
  - Data attribute for testing

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Labels**
   - Every input must have an associated label
   - Use `<label>` element with `htmlFor` attribute
   - Label must be visible and descriptive
   - Exception: Search inputs may use aria-label

2. **Keyboard Navigation**
   - Must be focusable with Tab key
   - Must show visible focus indicator
   - Focus order must be logical
   - Support standard keyboard shortcuts (Ctrl+A, Ctrl+C, etc.)

3. **Screen Reader Support**
   - Use semantic `<input>` element
   - Announce input type and purpose
   - Announce error messages
   - Announce helper text
   - Announce required fields
   - Use `aria-invalid="true"` for errors
   - Use `aria-describedby` for helper text and errors

4. **Error Handling**
   - Error messages must be clear and specific
   - Errors must be announced to screen readers
   - Error state must not rely on color alone
   - Include error icon for visual indication
   - Errors should appear near the input

5. **Touch Targets**
   - Minimum input height: 44px (on mobile)
   - Adequate spacing between form fields
   - Labels should increase clickable area

6. **Color Contrast**
   - Input text: minimum 4.5:1 contrast ratio
   - Placeholder text: minimum 4.5:1 contrast ratio
   - Error messages: minimum 4.5:1 contrast ratio
   - Focus indicators: minimum 3:1 contrast

### ARIA Attributes

- `aria-label`: When label is not visible
- `aria-labelledby`: Reference to label element(s)
- `aria-describedby`: Reference to helper text/error message
- `aria-invalid="true"`: When input has error
- `aria-required="true"`: When field is required
- `autocomplete`: For autofill support

## Usage Examples

### Basic Input

```jsx
<Input
  id="username"
  label="Username"
  placeholder="Enter your username"
  required
/>
```

### Email Input with Validation

```jsx
<Input
  id="email"
  type="email"
  label="Email Address"
  placeholder="you@example.com"
  error={hasError}
  errorMessage="Please enter a valid email address"
  required
/>
```

### Password Input with Toggle

```jsx
<Input
  id="password"
  type={showPassword ? "text" : "password"}
  label="Password"
  rightIcon={
    <IconButton onClick={togglePassword}>
      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
    </IconButton>
  }
  required
/>
```

### Search Input

```jsx
<Input
  id="search"
  type="search"
  placeholder="Search..."
  leftIcon={<SearchIcon />}
  rightIcon={value && <ClearButton onClick={clearSearch} />}
/>
```

### Number Input with Prefix/Suffix

```jsx
<Input
  id="price"
  type="number"
  label="Price"
  prefix="$"
  suffix="USD"
  min={0}
  step={0.01}
/>
```

### Textarea

```jsx
<Input
  id="description"
  as="textarea"
  label="Description"
  rows={4}
  maxLength={500}
  helperText="Maximum 500 characters"
/>
```

### Disabled Input

```jsx
<Input
  id="readonly-field"
  label="Account ID"
  value="ACC-123456"
  disabled
/>
```

### Input with Helper Text

```jsx
<Input
  id="username"
  label="Username"
  helperText="Choose a unique username (3-20 characters)"
  minLength={3}
  maxLength={20}
/>
```

## Dos and Don'ts

### Do ✅

- Always provide visible labels
- Use appropriate input types for better UX
- Provide clear error messages
- Use helper text for additional context
- Show character counters for length-limited fields
- Validate on blur, not on every keystroke
- Provide auto-complete where appropriate
- Make placeholder text descriptive but don't rely on it
- Group related inputs logically
- Support keyboard shortcuts

### Don't ❌

- Don't use placeholder as a label replacement
- Don't remove focus indicators
- Don't validate on every keystroke (unless necessary)
- Don't use custom input elements that break accessibility
- Don't make all fields required
- Don't use vague error messages ("Invalid input")
- Don't disable copy/paste unless security requires it
- Don't use tiny font sizes (minimum 16px to prevent zoom on mobile)
- Don't create excessively long forms without breaking into steps
- Don't forget to handle edge cases (empty, max length, special chars)

## Validation Patterns

### Client-Side Validation

1. **On Blur**: Validate when user leaves field
2. **On Submit**: Validate all fields before submission
3. **Real-time**: For password strength, username availability
4. **Debounced**: For API validations (email uniqueness, etc.)

### Common Validation Rules

- **Email**: RFC 5322 compliant regex
- **Password**: Minimum length, complexity requirements
- **Phone**: Format based on country code
- **URL**: Valid protocol and domain
- **Credit Card**: Luhn algorithm
- **Date**: Valid date range
- **Number**: Min/max bounds, step increments

## Component Relationships

### Works With
- **Form**: Wrapped in form components
- **Label**: Associated label element
- **Button**: Form submission buttons
- **Select**: Alternative for predefined options
- **Tooltip**: Additional context for complex fields
- **Modal**: Input fields in modal forms

## Implementation Notes

### Technical Considerations

1. **Performance**
   - Debounce expensive validations
   - Use uncontrolled inputs for better performance when possible
   - Memoize validation functions

2. **Responsive Design**
   - Full-width inputs on mobile
   - Appropriate keyboard types on mobile
   - Adequate touch target sizes

3. **Form Integration**
   - Support form libraries (Formik, React Hook Form)
   - Native form validation API
   - Form state management

4. **Accessibility Testing**
   - Test with screen readers
   - Test keyboard navigation
   - Test color contrast
   - Test with browser zoom

## Related Documentation

- [Design Tokens](../tokens/design-tokens.md)
- [Form Patterns](../guidelines/form-patterns.md)
- [Accessibility Guidelines](../guidelines/accessibility.md)
- [Validation Guidelines](../guidelines/validation.md)

## Version History

- **v1.0.0** (Current): Initial specification
  - Defined 3 sizes (small, medium, large)
  - Defined 8+ input types
  - Established accessibility requirements
  - Documented all props and usage examples
  - Defined validation patterns
