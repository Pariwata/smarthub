# Modal Component Specification

## Overview

The Modal component is a dialog overlay that appears on top of the main content to display important information, capture user input, or require user interaction before proceeding. This specification ensures all modal implementations are consistent, accessible, and aligned with the Smart Hub design system.

## Visual Design

### Basic Structure

The Modal component consists of:
1. **Backdrop/Overlay** (semi-transparent background)
2. **Modal Container** (main dialog box)
3. **Header** (title and close button)
4. **Body** (main content)
5. **Footer** (action buttons)

### Sizes

#### Small
- **Width**: 400px
- **Max Height**: 90vh
- **Padding**: `--spacing-4` (16px)
- **Title Font Size**: `--font-size-lg` (18px)

#### Medium (Default)
- **Width**: 600px
- **Max Height**: 90vh
- **Padding**: `--spacing-6` (24px)
- **Title Font Size**: `--font-size-xl` (20px)

#### Large
- **Width**: 800px
- **Max Height**: 90vh
- **Padding**: `--spacing-6` (24px)
- **Title Font Size**: `--font-size-2xl` (24px)

#### Full Screen
- **Width**: 100vw
- **Height**: 100vh
- **Padding**: `--spacing-8` (32px)
- **Title Font Size**: `--font-size-2xl` (24px)

### Modal Container

- **Background**: `--color-neutral-0` (white)
- **Border Radius**: `--border-radius-lg` (8px) - except full screen
- **Box Shadow**: `--shadow-xl`
- **Z-Index**: `--z-index-modal`
- **Position**: Centered vertically and horizontally

### Backdrop/Overlay

- **Background**: rgba(0, 0, 0, 0.5) - semi-transparent black
- **Backdrop Blur**: Optional 4px blur effect
- **Z-Index**: `--z-index-modal-backdrop`
- **Covers**: Entire viewport

### Header

- **Padding Bottom**: `--spacing-4` (16px)
- **Border Bottom**: `--border-width-1` solid `--color-neutral-200`
- **Title Color**: `--color-neutral-900`
- **Title Font Weight**: `--font-weight-semibold`
- **Close Button**: Right-aligned icon button

### Body

- **Padding**: `--spacing-6` (24px) vertical
- **Scrollable**: When content exceeds max height
- **Max Height**: Calculated to fit viewport
- **Scroll Behavior**: Smooth

### Footer

- **Padding Top**: `--spacing-4` (16px)
- **Border Top**: `--border-width-1` solid `--color-neutral-200`
- **Alignment**: Right-aligned buttons (left-aligned on mobile)
- **Button Spacing**: `--spacing-3` (12px) between buttons
- **Button Order**: Secondary on left, primary on right

### Modal Types

#### Alert Modal
- **Purpose**: Display critical information
- **Icon**: Warning/info icon in header
- **Buttons**: Single "OK" or "Dismiss" button
- **Backdrop Click**: Can close

#### Confirmation Modal
- **Purpose**: Confirm user action before proceeding
- **Icon**: Question/warning icon
- **Buttons**: "Cancel" (secondary) and "Confirm" (primary/danger)
- **Backdrop Click**: Should not close
- **Escape Key**: Should not close

#### Form Modal
- **Purpose**: Collect user input
- **Content**: Form fields in body
- **Buttons**: "Cancel" and "Submit"
- **Validation**: Before allowing submission
- **Backdrop Click**: Show warning if form has changes

#### Drawer/Side Panel
- **Purpose**: Auxiliary content, settings
- **Position**: Slides from right or left
- **Width**: 400px or 600px
- **Height**: 100vh
- **Animation**: Slide in/out

## States

### Opening Animation
- **Duration**: `--transition-duration-slow` (300ms)
- **Modal**: Fade in + scale from 0.95 to 1
- **Backdrop**: Fade in
- **Timing**: `--transition-timing-ease-out`

### Open
- Standard appearance as defined above
- Focus trapped within modal
- Background content inert

### Closing Animation
- **Duration**: `--transition-duration-base` (200ms)
- **Modal**: Fade out + scale to 0.95
- **Backdrop**: Fade out
- **Timing**: `--transition-timing-ease-in`

### Loading
- Display loading spinner
- Disable all interactions
- Maintain modal dimensions
- Show loading overlay

## Component Props

### Required Props

- **`isOpen`**: boolean
  - Controls modal visibility
  - Use with onClose for controlled modal

### Optional Props

- **`onClose`**: () => void
  - Called when modal should close
  - Triggered by: close button, escape key, backdrop click

- **`title`**: string | ReactNode
  - Modal header title
  - Supports custom components

- **`children`**: ReactNode
  - Modal body content
  - Can include any components

- **`size`**: 'small' | 'medium' | 'large' | 'fullscreen'
  - Default: 'medium'
  - Controls modal dimensions

- **`variant`**: 'default' | 'alert' | 'confirmation' | 'form' | 'drawer'
  - Default: 'default'
  - Determines modal type and behavior

- **`closeOnBackdropClick`**: boolean
  - Default: true
  - Whether clicking backdrop closes modal

- **`closeOnEscape`**: boolean
  - Default: true
  - Whether pressing Escape closes modal

- **`showCloseButton`**: boolean
  - Default: true
  - Whether to show X button in header

- **`hideHeader`**: boolean
  - Default: false
  - Hides entire header section

- **`hideFooter`**: boolean
  - Default: false
  - Hides entire footer section

- **`footer`**: ReactNode
  - Custom footer content
  - Replaces default footer

- **`primaryAction`**: {
    label: string,
    onClick: () => void,
    variant?: ButtonVariant,
    loading?: boolean,
    disabled?: boolean
  }
  - Primary button configuration
  - Appears in footer

- **`secondaryAction`**: {
    label: string,
    onClick: () => void,
    variant?: ButtonVariant,
    disabled?: boolean
  }
  - Secondary button configuration
  - Appears in footer

- **`icon`**: ReactNode
  - Icon displayed in header (alert/confirmation modals)

- **`centerContent`**: boolean
  - Default: false
  - Centers body content vertically

- **`loading`**: boolean
  - Default: false
  - Shows loading state

- **`preventBodyScroll`**: boolean
  - Default: true
  - Prevents scrolling background content

- **`initialFocus`**: RefObject
  - Element to focus when modal opens
  - Defaults to first focusable element

- **`finalFocus`**: RefObject
  - Element to focus when modal closes
  - Defaults to element that opened modal

- **`className`**: string
  - Additional CSS classes for container

- **`bodyClassName`**: string
  - Additional CSS classes for body

- **`backdropClassName`**: string
  - Additional CSS classes for backdrop

- **`ariaLabel`**: string
  - Accessible label for modal
  - Required if no title provided

- **`ariaDescribedBy`**: string
  - ID of element describing modal content

- **`testId`**: string
  - Data attribute for testing

- **`onOpen`**: () => void
  - Called after modal opens

- **`onAfterClose`**: () => void
  - Called after modal closes completely

- **`portalTarget`**: HTMLElement
  - Element to portal modal into
  - Defaults to document.body

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Focus Management**
   - Focus moves to modal when opened
   - Focus trapped within modal while open
   - Focus returns to trigger element when closed
   - Tab/Shift+Tab cycles through focusable elements

2. **Keyboard Navigation**
   - **Escape**: Closes modal (if allowed)
   - **Tab**: Move to next focusable element
   - **Shift+Tab**: Move to previous focusable element
   - Enter/Space activates buttons

3. **Screen Reader Support**
   - Announce modal role and title
   - Announce when modal opens
   - Background content marked as inert
   - Use `role="dialog"` or `role="alertdialog"`
   - Use `aria-modal="true"`
   - Use `aria-labelledby` for title
   - Use `aria-describedby` for description

4. **Background Content**
   - Mark as inert when modal is open
   - Prevent keyboard navigation to background
   - Prevent screen reader access to background
   - Prevent mouse interaction with background

5. **Color Contrast**
   - Text contrast: minimum 4.5:1
   - Close button contrast: minimum 3:1
   - Backdrop provides sufficient contrast

6. **Touch Targets**
   - Close button: minimum 44x44px
   - Footer buttons: follow button spec (44px min height)

### ARIA Attributes

- `role="dialog"`: For standard modals
- `role="alertdialog"`: For alert/confirmation modals
- `aria-modal="true"`: Indicates modal behavior
- `aria-labelledby`: References title element ID
- `aria-describedby`: References body/description element ID
- `aria-label`: When no visible title
- `aria-live`: For dynamic content updates

## Usage Examples

### Basic Modal

```jsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Basic Modal"
>
  <p>This is the modal content.</p>
</Modal>
```

### Alert Modal

```jsx
<Modal
  isOpen={isAlertOpen}
  onClose={handleAlertClose}
  variant="alert"
  title="Information"
  icon={<InfoIcon />}
  primaryAction={{
    label: "OK",
    onClick: handleAlertClose
  }}
>
  <p>Your changes have been saved successfully.</p>
</Modal>
```

### Confirmation Modal

```jsx
<Modal
  isOpen={isConfirmOpen}
  onClose={handleCancel}
  variant="confirmation"
  title="Confirm Deletion"
  icon={<WarningIcon />}
  closeOnBackdropClick={false}
  closeOnEscape={false}
  primaryAction={{
    label: "Delete",
    onClick: handleDelete,
    variant: "danger",
    loading: isDeleting
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: handleCancel
  }}
>
  <p>Are you sure you want to delete this item? This action cannot be undone.</p>
</Modal>
```

### Form Modal

```jsx
<Modal
  isOpen={isFormOpen}
  onClose={handleFormClose}
  variant="form"
  title="Edit Profile"
  size="large"
  primaryAction={{
    label: "Save Changes",
    onClick: handleSave,
    disabled: !isFormValid,
    loading: isSaving
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: handleFormClose
  }}
>
  <form>
    <Input id="name" label="Name" value={name} onChange={setName} />
    <Input id="email" label="Email" value={email} onChange={setEmail} />
  </form>
</Modal>
```

### Full Screen Modal

```jsx
<Modal
  isOpen={isFullScreenOpen}
  onClose={handleFullScreenClose}
  title="Full Screen Content"
  size="fullscreen"
>
  <ComplexComponent />
</Modal>
```

### Custom Footer Modal

```jsx
<Modal
  isOpen={isCustomOpen}
  onClose={handleCustomClose}
  title="Custom Actions"
  footer={
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Button variant="tertiary" onClick={handleReset}>Reset</Button>
      <div>
        <Button variant="secondary" onClick={handleCustomClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </div>
    </div>
  }
>
  <p>Modal with custom footer layout.</p>
</Modal>
```

## Dos and Don'ts

### Do ✅

- Use modals for critical actions requiring immediate attention
- Keep modal content focused and concise
- Provide clear action buttons with descriptive labels
- Always include a way to close/dismiss the modal
- Trap focus within modal when open
- Return focus to trigger element when closed
- Use appropriate modal size for content
- Show loading state during async operations
- Prevent closing during critical operations
- Use confirmation for destructive actions
- Stack modals sparingly (avoid when possible)

### Don't ❌

- Don't use modals for non-critical information
- Don't create modals that require scrolling (use appropriate size)
- Don't have more than one modal open at once (generally)
- Don't use modals for navigation
- Don't forget to handle escape key
- Don't make modals too large for mobile screens
- Don't use vague button labels ("OK", "Submit")
- Don't allow background interaction when modal is open
- Don't open modal on page load (usually)
- Don't nest modals within modals

## Best Practices

### When to Use Modals

**Use modals for:**
- Confirming destructive actions
- Capturing essential information
- Displaying critical alerts/warnings
- Focused tasks requiring user attention
- Complex forms that need isolation

**Don't use modals for:**
- General navigation
- Large amounts of content
- Non-critical information
- Frequent interruptions
- Progressive disclosure (use accordions instead)

### Modal Stacking

- Avoid stacking modals when possible
- If necessary, increase z-index incrementally
- Ensure backdrop darkens with each stack
- Maintain focus trap for topmost modal
- Close modals in reverse order (LIFO)

### Mobile Considerations

- Consider full-screen modals on mobile
- Ensure touch targets are adequate
- Test with native keyboard behavior
- Consider bottom sheets as alternative
- Ensure modal fits in viewport

### Performance

- Use portal to render at document root
- Lazy load modal content
- Unmount modal when closed
- Optimize animations for 60fps
- Virtual scroll for long lists in modal

## Component Relationships

### Works With
- **Button**: Action buttons in footer
- **Input**: Form fields in modal body
- **Select**: Form controls in modal body
- **Form**: Complete forms within modal
- **Alert**: Alert content within modal
- **Icon**: Header icons for alert/confirmation

## Implementation Notes

### Technical Considerations

1. **Portal Rendering**
   - Render modal outside component hierarchy
   - Append to document.body or custom container
   - Prevents z-index and overflow issues

2. **Focus Trap**
   - Implement focus trap using focus-trap library
   - Cycle focus through focusable elements
   - Handle dynamically added/removed elements

3. **Body Scroll Lock**
   - Prevent background scrolling when modal opens
   - Restore scroll position when modal closes
   - Handle iOS scroll issues

4. **Animation**
   - Use CSS transitions or animation library
   - Ensure smooth 60fps animations
   - Cleanup animation timers on unmount

5. **Escape Handling**
   - Listen for Escape key globally
   - Only close topmost modal in stack
   - Respect closeOnEscape prop

6. **Backdrop Handling**
   - Detect click on backdrop vs. modal content
   - Use stopPropagation to prevent bubbling
   - Respect closeOnBackdropClick prop

## Related Documentation

- [Design Tokens](../tokens/design-tokens.md)
- [Button Component](./button.md)
- [Form Patterns](../guidelines/form-patterns.md)
- [Accessibility Guidelines](../guidelines/accessibility.md)

## Version History

- **v1.0.0** (Current): Initial specification
  - Defined 4 sizes (small, medium, large, fullscreen)
  - Defined 5 variants (default, alert, confirmation, form, drawer)
  - Established accessibility requirements
  - Documented focus management
  - Documented all props and usage examples
  - Defined animation specifications
