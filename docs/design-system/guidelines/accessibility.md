# Accessibility Guidelines

## Overview

Accessibility is a core principle of the Smart Hub design system. All components must be usable by everyone, including people with disabilities. These guidelines ensure compliance with WCAG 2.1 Level AA standards and promote inclusive design practices.

## Core Principles

### 1. Perceivable

Information and user interface components must be presentable to users in ways they can perceive.

#### Color Contrast
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18px+ or 14px+ bold): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio
- **Focus indicators**: Minimum 3:1 contrast ratio against adjacent colors

**Tools**: Use color contrast checkers to verify compliance
- WebAIM Contrast Checker
- Chrome DevTools Color Picker
- Stark plugin for Figma

#### Text Alternatives
- Provide text alternatives for non-text content
- Use `alt` attributes for images
- Use `aria-label` for icon-only buttons
- Provide captions for videos
- Provide transcripts for audio content

#### Adaptable Content
- Content can be presented in different ways without losing information
- Use semantic HTML elements
- Proper heading hierarchy (h1, h2, h3...)
- Use lists for list content
- Use tables for tabular data

#### Distinguishable
- Don't rely on color alone to convey information
- Use icons, patterns, or text in addition to color
- Provide sufficient contrast
- Text can be resized up to 200% without loss of functionality

### 2. Operable

User interface components and navigation must be operable.

#### Keyboard Accessible
- **All functionality must be keyboard accessible**
- Standard keyboard shortcuts:
  - Tab: Move focus forward
  - Shift+Tab: Move focus backward
  - Enter: Activate buttons, links
  - Space: Activate buttons, toggle checkboxes
  - Arrow keys: Navigate within components (select, radio group, menu)
  - Escape: Close dialogs, cancel operations
  - Home/End: Move to start/end of list

#### No Keyboard Trap
- Keyboard focus should never be trapped
- Users must be able to navigate away from any component using keyboard
- Exception: Modal dialogs (with escape key to close)

#### Focus Visible
- Always provide visible focus indicators
- Focus ring specifications:
  - Minimum 2px thickness
  - High contrast color (primary-300 or equivalent)
  - 2px offset from element
  - Rounded corners matching element
- Never remove focus outlines (`outline: none`) without replacement

#### Focus Order
- Focus order must be logical and intuitive
- Generally follows visual order (left-to-right, top-to-bottom)
- Tab order can be adjusted with `tabindex` when necessary
- Avoid positive `tabindex` values (use 0 or -1)

#### Touch Targets
- Minimum size: 44x44 pixels
- Adequate spacing between targets: Minimum 8px
- Larger targets for primary actions
- Consider mobile/tablet usage

### 3. Understandable

Information and operation of user interface must be understandable.

#### Readable
- Use clear, simple language
- Avoid jargon and technical terms when possible
- Define abbreviations and acronyms
- Use consistent terminology throughout
- Appropriate font sizes (minimum 16px for body text)

#### Predictable
- Components behave consistently
- Navigation is consistent across pages
- Consistent identification (same labels for same functions)
- Changes of context only occur on user request
- No automatic redirects or pop-ups

#### Input Assistance
- Clear labels for all form inputs
- Helpful error messages
- Error prevention for critical actions
- Suggestions for fixing errors
- Confirmation for destructive actions

### 4. Robust

Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

#### Compatible
- Use valid HTML markup
- Provide name, role, and value for all UI components
- Use ARIA when semantic HTML is insufficient
- Test with multiple browsers and assistive technologies

## ARIA (Accessible Rich Internet Applications)

### When to Use ARIA

**Use ARIA when:**
- Semantic HTML is insufficient
- Creating custom interactive components
- Providing additional context for screen readers
- Indicating dynamic state changes

**Don't use ARIA when:**
- Semantic HTML is available (e.g., use `<button>` instead of `<div role="button">`)
- It would override native semantics unnecessarily

### ARIA Best Practices

1. **First Rule of ARIA**: Don't use ARIA if you can use semantic HTML
2. **Don't change native semantics** unless absolutely necessary
3. **All interactive ARIA controls must be keyboard accessible**
4. **Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements**
5. **All interactive elements must have an accessible name**

### Common ARIA Attributes

#### Roles
- `role="button"`: Button (prefer `<button>`)
- `role="dialog"`: Modal dialog
- `role="alert"`: Important message
- `role="navigation"`: Navigation section
- `role="search"`: Search functionality
- `role="main"`: Main content
- `role="complementary"`: Complementary content (sidebar)

#### States and Properties
- `aria-label`: Provides accessible name
- `aria-labelledby`: References element(s) that label current element
- `aria-describedby`: References element(s) that describe current element
- `aria-hidden`: Hides element from accessibility tree
- `aria-expanded`: Indicates if element is expanded
- `aria-selected`: Indicates if option is selected
- `aria-checked`: Indicates checkbox/radio state
- `aria-disabled`: Indicates disabled state
- `aria-required`: Indicates required field
- `aria-invalid`: Indicates validation error
- `aria-live`: Announces dynamic content changes
- `aria-busy`: Indicates loading state

#### Live Regions
Use for dynamic content updates:
- `aria-live="polite"`: Announces when user is idle
- `aria-live="assertive"`: Interrupts user immediately
- `aria-atomic="true"`: Reads entire region on change
- `aria-relevant`: What changes should be announced

## Component-Specific Guidelines

> **Note**: These guidelines provide component-specific accessibility requirements. Each component specification document in the `/components` directory includes these requirements for easy reference during implementation.

### Buttons
- Use semantic `<button>` element
- Provide descriptive text labels
- Use `aria-label` for icon-only buttons
- Ensure keyboard activation (Enter, Space)
- Visible focus indicator
- Appropriate color contrast

### Links
- Use semantic `<a>` element
- Descriptive link text (avoid "click here")
- Indicate when link opens in new window
- Use `aria-current="page"` for current page link
- Ensure keyboard navigation

### Forms
- Every input must have an associated label
- Use `<label>` with `htmlFor` attribute
- Group related inputs with `<fieldset>` and `<legend>`
- Provide helpful error messages
- Use `aria-invalid` and `aria-describedby` for errors
- Mark required fields with `required` attribute
- Don't rely on placeholder as label

### Images
- Provide meaningful `alt` text
- Decorative images: `alt=""` or `role="presentation"`
- Complex images: Provide longer description
- Don't include "image of" or "picture of" in alt text

### Tables
- Use semantic table elements (`<table>`, `<th>`, `<td>`)
- Provide table caption with `<caption>`
- Use `scope` attribute on header cells
- Use `<thead>`, `<tbody>`, `<tfoot>` for structure
- Avoid layout tables (use CSS Grid/Flexbox)

### Modals/Dialogs
- Use `role="dialog"` or `role="alertdialog"`
- Set `aria-modal="true"`
- Provide accessible name with `aria-labelledby`
- Trap focus within modal
- Return focus to trigger on close
- Allow Escape key to close
- Mark background content as inert

### Menus/Dropdowns
- Use appropriate ARIA roles
- Keyboard navigation (Arrow keys, Enter, Escape)
- Indicate expanded state with `aria-expanded`
- Announce selected item
- Close on outside click or Escape

## Testing Accessibility

### Manual Testing

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Verify focus is visible at all times
   - Test all keyboard shortcuts
   - Ensure no keyboard traps

2. **Screen Reader Testing**
   - Test with multiple screen readers:
     - NVDA (Windows)
     - JAWS (Windows)
     - VoiceOver (macOS/iOS)
     - TalkBack (Android)
   - Verify all content is announced
   - Verify context and relationships
   - Test form interactions

3. **Color Contrast**
   - Use contrast checking tools
   - Test all text and UI components
   - Test focus indicators

4. **Zoom/Magnification**
   - Test at 200% zoom
   - Verify no content is cut off
   - Verify layout remains functional

5. **Text Spacing**
   - Test with increased letter/word spacing
   - Test with increased line height

### Automated Testing

Use automated tools to catch common issues:
- **axe DevTools**: Browser extension for accessibility testing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Chrome DevTools audit
- **Pa11y**: Command-line accessibility tester
- **jest-axe**: Jest matcher for accessibility tests

### Testing Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] All images have appropriate alt text
- [ ] All form inputs have associated labels
- [ ] Error messages are clear and accessible
- [ ] Heading hierarchy is logical
- [ ] Page has a main landmark
- [ ] Skip to main content link exists
- [ ] Modal dialogs trap focus and manage focus properly
- [ ] Dynamic content changes are announced
- [ ] No automatic time-outs or moving content without control
- [ ] Content is readable at 200% zoom
- [ ] Touch targets are at least 44x44px

## Resources

### Standards and Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- [Screen Reader Support Test](https://a11ysupport.io/)

### Training
- [Web Accessibility by Google (Udacity)](https://www.udacity.com/course/web-accessibility--ud891)
- [WebAIM Articles](https://webaim.org/articles/)
- [Deque University](https://dequeuniversity.com/)

## Compliance Levels

### WCAG 2.1 Levels

#### Level A (Minimum)
- Basic accessibility features
- Minimum compliance level
- Essential for some users

#### Level AA (Target) ✅
- **Smart Hub target compliance level**
- Removes significant barriers
- Standard for most organizations
- Legal requirement in many jurisdictions

#### Level AAA (Enhanced)
- Highest level of accessibility
- Not required for all content
- May not be achievable for all content types

## Common Mistakes to Avoid

1. **Removing focus indicators** - Never do `outline: none` without replacement
2. **Using div/span for buttons** - Use semantic `<button>` element
3. **Using placeholder as label** - Labels must be visible
4. **Low contrast text** - Always check contrast ratios
5. **Missing alt text** - All images need alt text or `alt=""`
6. **Keyboard traps** - Focus must be able to move freely
7. **Auto-playing media** - Provide controls to pause/stop
8. **Time limits without option to extend** - Allow users to extend time
9. **Relying on color alone** - Use multiple indicators
10. **Poor heading structure** - Use proper heading hierarchy

## Maintenance and Updates

- Review components regularly for accessibility
- Test with real users with disabilities when possible
- Stay updated on WCAG guidelines and best practices
- Document accessibility features and testing results
- Provide accessibility training for team members
- Include accessibility in code reviews
- Make accessibility part of definition of done

## Version History

- **v1.0.0** (Current): Initial accessibility guidelines
  - WCAG 2.1 Level AA compliance requirements
  - Component-specific guidelines
  - Testing procedures and checklists
  - ARIA usage guidelines
  - Common patterns and examples
