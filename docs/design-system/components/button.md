# Button Component Specification

## Overview

The Button component is a fundamental interactive element that allows users to trigger actions or navigate within the application. This specification ensures all button implementations are consistent, accessible, and aligned with the Smart Hub design system.

## Visual Design

### Variants

#### Primary
- **Purpose**: Main call-to-action buttons
- **Background**: `--color-primary-500`
- **Text Color**: `--color-neutral-0` (white)
- **Hover State**: `--color-primary-600`
- **Active State**: `--color-primary-700`
- **Focus Ring**: 2px solid `--color-primary-300` with 2px offset

#### Secondary
- **Purpose**: Secondary actions that support the primary action
- **Background**: `--color-neutral-0` (white)
- **Border**: `--border-width-1` solid `--color-neutral-300`
- **Text Color**: `--color-neutral-700`
- **Hover State**: Background `--color-neutral-50`
- **Active State**: Background `--color-neutral-100`
- **Focus Ring**: 2px solid `--color-primary-300` with 2px offset

#### Tertiary/Ghost
- **Purpose**: Less prominent actions, inline actions
- **Background**: transparent
- **Text Color**: `--color-primary-600`
- **Hover State**: Background `--color-primary-50`
- **Active State**: Background `--color-primary-100`
- **Focus Ring**: 2px solid `--color-primary-300` with 2px offset

#### Danger/Destructive
- **Purpose**: Destructive or irreversible actions (delete, remove)
- **Background**: `--color-error-500`
- **Text Color**: `--color-neutral-0` (white)
- **Hover State**: `--color-error-600`
- **Active State**: `--color-error-700`
- **Focus Ring**: 2px solid `--color-error-300` with 2px offset

### Sizes

#### Small
- **Height**: 32px
- **Padding**: `--spacing-2` `--spacing-3` (8px 12px)
- **Font Size**: `--font-size-sm` (14px)
- **Border Radius**: `--border-radius-md` (6px)
- **Icon Size**: 16px

#### Medium (Default)
- **Height**: 40px
- **Padding**: `--spacing-3` `--spacing-4` (12px 16px)
- **Font Size**: `--font-size-base` (16px)
- **Border Radius**: `--border-radius-md` (6px)
- **Icon Size**: 20px

#### Large
- **Height**: 48px
- **Padding**: `--spacing-4` `--spacing-6` (16px 24px)
- **Font Size**: `--font-size-lg` (18px)
- **Border Radius**: `--border-radius-lg` (8px)
- **Icon Size**: 24px

### States

#### Default
- Standard appearance as defined in variants

#### Hover
- Darker background color for filled variants
- Lighter background for ghost variants
- Cursor: pointer
- Transition: `--transition-duration-base` `--transition-timing-ease-in-out`

#### Active/Pressed
- Even darker background than hover
- Scale: 0.98 (slight press effect)

#### Disabled
- **Background**: `--color-neutral-200`
- **Text Color**: `--color-neutral-400`
- **Cursor**: not-allowed
- **Opacity**: 0.6
- No hover or active states
- Focus ring disabled

#### Loading
- Display spinner/loading indicator
- Disable interaction
- Maintain button dimensions
- Show loading text or icon

#### Focus
- Visible focus ring for keyboard navigation
- Focus ring: 2px solid with appropriate color
- Offset: 2px from button edge

## Component Props

### Required Props

- **`children`**: ReactNode | string
  - Button label or content
  - Should be descriptive and action-oriented

### Optional Props

- **`variant`**: 'primary' | 'secondary' | 'tertiary' | 'danger'
  - Default: 'primary'
  - Determines button appearance

- **`size`**: 'small' | 'medium' | 'large'
  - Default: 'medium'
  - Controls button dimensions

- **`disabled`**: boolean
  - Default: false
  - Disables button interaction

- **`loading`**: boolean
  - Default: false
  - Shows loading state

- **`fullWidth`**: boolean
  - Default: false
  - Makes button span full width of container

- **`type`**: 'button' | 'submit' | 'reset'
  - Default: 'button'
  - HTML button type

- **`onClick`**: (event: MouseEvent) => void
  - Click handler function

- **`leftIcon`**: ReactNode
  - Icon to display before button text
  - Spacing: `--spacing-2` (8px) between icon and text

- **`rightIcon`**: ReactNode
  - Icon to display after button text
  - Spacing: `--spacing-2` (8px) between text and icon

- **`iconOnly`**: boolean
  - Default: false
  - For icon-only buttons (must include aria-label)

- **`className`**: string
  - Additional CSS classes for custom styling

- **`ariaLabel`**: string
  - Required when `iconOnly` is true
  - Provides accessible label for screen readers

- **`ariaDescribedBy`**: string
  - ID of element that describes the button

- **`id`**: string
  - Unique identifier for the button

- **`testId`**: string
  - Data attribute for testing

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Contrast Ratios**
   - Text-to-background contrast: minimum 4.5:1 for normal text
   - Large text (18px+): minimum 3:1
   - Focus indicators: minimum 3:1 contrast with adjacent colors

2. **Keyboard Navigation**
   - Must be focusable with Tab key
   - Must be activatable with Enter and Space keys
   - Focus must be visible (focus ring)
   - Focus order must be logical

3. **Screen Reader Support**
   - Use semantic `<button>` element
   - Provide descriptive labels
   - Announce button state (pressed, disabled, loading)
   - Use `aria-label` for icon-only buttons
   - Use `aria-disabled` when disabled
   - Use `aria-busy="true"` during loading state

4. **Touch Targets**
   - Minimum touch target size: 44x44px
   - Adequate spacing between buttons: minimum 8px

5. **Color Independence**
   - Don't rely solely on color to convey meaning
   - Use icons or text to reinforce semantic meaning
   - Ensure destructive actions have confirmation dialogs

### ARIA Attributes

- `role="button"` (implicit with `<button>` element)
- `aria-label`: Required for icon-only buttons
- `aria-disabled="true"`: When button is disabled
- `aria-busy="true"`: When button is in loading state
- `aria-pressed`: For toggle buttons
- `aria-describedby`: Reference to additional description

## Usage Examples

### Basic Usage

```jsx
// Primary button
<Button variant="primary">Save Changes</Button>

// Secondary button
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Danger button with confirmation
<Button variant="danger" onClick={handleDelete}>
  Delete Account
</Button>
```

### With Icons

```jsx
// Left icon
<Button variant="primary" leftIcon={<SaveIcon />}>
  Save
</Button>

// Right icon
<Button variant="secondary" rightIcon={<ArrowRightIcon />}>
  Next
</Button>

// Icon only
<Button variant="tertiary" iconOnly aria-label="Close">
  <CloseIcon />
</Button>
```

### Loading State

```jsx
<Button variant="primary" loading disabled>
  Saving...
</Button>
```

### Different Sizes

```jsx
<Button size="small">Small Button</Button>
<Button size="medium">Medium Button</Button>
<Button size="large">Large Button</Button>
```

### Full Width

```jsx
<Button variant="primary" fullWidth>
  Full Width Button
</Button>
```

### Form Submission

```jsx
<form onSubmit={handleSubmit}>
  <Button type="submit" variant="primary">
    Submit Form
  </Button>
</form>
```

## Dos and Don'ts

### Do ✅

- Use descriptive, action-oriented labels (e.g., "Save Changes" not "OK")
- Place primary action on the right in button groups
- Use consistent button placement across the application
- Provide visual feedback for all states (hover, active, focus, disabled)
- Use appropriate variants for button hierarchy
- Ensure adequate spacing between buttons (minimum 8px)
- Disable buttons during processing to prevent duplicate submissions
- Use icon-only buttons sparingly and always with aria-label

### Don't ❌

- Don't use more than one primary button in a single view/context
- Don't use vague labels like "Click Here" or "Submit"
- Don't make buttons too small (minimum 44x44px for touch)
- Don't rely on color alone to convey meaning
- Don't use buttons for navigation (use links instead)
- Don't nest interactive elements inside buttons
- Don't remove focus indicators
- Don't use all caps for button text (affects readability)

## Component Relationships

### Works With
- **Input**: Form submission buttons
- **Modal**: Primary/secondary actions in modal footer
- **Forms**: Submit, reset buttons
- **Tooltips**: Additional context for icon-only buttons
- **Confirmation Dialogs**: Destructive action confirmations

## Implementation Notes

### Technical Considerations

1. **Performance**
   - Use CSS transitions for hover/active states
   - Avoid heavy computations in click handlers
   - Debounce rapid clicks if necessary

2. **Responsive Design**
   - Consider full-width buttons on mobile devices
   - Adjust size based on viewport
   - Ensure touch target sizes are adequate

3. **Theming**
   - All colors should reference design tokens
   - Support light/dark mode if applicable
   - Allow for theme customization

4. **Testing**
   - Unit tests for all variants and states
   - Integration tests for click handlers
   - Accessibility tests (keyboard nav, screen readers)
   - Visual regression tests

## Related Documentation

- [Design Tokens](../tokens/design-tokens.md)
- [Accessibility Guidelines](../guidelines/accessibility.md)
- [Component Usage Patterns](../guidelines/component-patterns.md)

## Version History

- **v1.0.0** (Current): Initial specification
  - Defined 4 variants (primary, secondary, tertiary, danger)
  - Defined 3 sizes (small, medium, large)
  - Established accessibility requirements
  - Documented all props and usage examples
