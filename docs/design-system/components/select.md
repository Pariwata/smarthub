# Select Component Specification

## Overview

The Select component is a form control that allows users to choose one or multiple options from a dropdown list. This specification ensures all select implementations are consistent, accessible, and aligned with the Smart Hub design system.

## Visual Design

### Basic Structure

The Select component consists of:
1. **Label** (optional but recommended)
2. **Select trigger/button** (displays selected value)
3. **Dropdown icon** (indicates expandable list)
4. **Dropdown menu** (list of options)
5. **Options** (individual selectable items)
6. **Helper text** (optional)
7. **Error message** (conditional)

### Sizes

#### Small
- **Height**: 32px
- **Padding**: `--spacing-2` `--spacing-3` (8px 12px)
- **Font Size**: `--font-size-sm` (14px)
- **Border Radius**: `--border-radius-md` (6px)
- **Option Padding**: `--spacing-2` `--spacing-3`

#### Medium (Default)
- **Height**: 40px
- **Padding**: `--spacing-3` `--spacing-4` (12px 16px)
- **Font Size**: `--font-size-base` (16px)
- **Border Radius**: `--border-radius-md` (6px)
- **Option Padding**: `--spacing-3` `--spacing-4`

#### Large
- **Height**: 48px
- **Padding**: `--spacing-4` `--spacing-5` (16px 20px)
- **Font Size**: `--font-size-lg` (18px)
- **Border Radius**: `--border-radius-lg` (8px)
- **Option Padding**: `--spacing-4` `--spacing-5`

### States

#### Trigger/Button States

##### Default (Closed)
- **Background**: `--color-neutral-0` (white)
- **Border**: `--border-width-1` solid `--color-neutral-300`
- **Text Color**: `--color-neutral-900`
- **Placeholder Color**: `--color-neutral-400`
- **Icon**: Chevron down `--color-neutral-500`

##### Hover
- **Border Color**: `--color-neutral-400`
- **Cursor**: pointer
- **Transition**: `--transition-duration-base` `--transition-timing-ease-in-out`

##### Focus
- **Border**: `--border-width-2` solid `--color-primary-500`
- **Outline**: 2px solid `--color-primary-300` with 2px offset
- **Box Shadow**: `--shadow-sm` with primary color tint

##### Open (Expanded)
- **Border**: `--border-width-2` solid `--color-primary-500`
- **Icon**: Chevron up `--color-primary-500`
- **Box Shadow**: `--shadow-md`

##### Disabled
- **Background**: `--color-neutral-100`
- **Border Color**: `--color-neutral-200`
- **Text Color**: `--color-neutral-400`
- **Cursor**: not-allowed
- **Opacity**: 0.6

##### Error
- **Border**: `--border-width-2` solid `--color-error-500`
- **Error Text Color**: `--color-error-700`
- **Error Message**: Display below select

##### Read-only
- **Background**: `--color-neutral-50`
- **Border Color**: `--color-neutral-200`
- **Cursor**: default
- No hover or interaction

#### Dropdown Menu States

##### Open
- **Background**: `--color-neutral-0` (white)
- **Border**: `--border-width-1` solid `--color-neutral-200`
- **Border Radius**: `--border-radius-md` (6px)
- **Box Shadow**: `--shadow-lg`
- **Max Height**: 300px (scrollable)
- **Z-Index**: `--z-index-dropdown`

##### Closed
- Hidden from view and accessibility tree

#### Option States

##### Default
- **Background**: transparent
- **Text Color**: `--color-neutral-900`
- **Padding**: Defined by select size

##### Hover
- **Background**: `--color-primary-50`
- **Cursor**: pointer

##### Selected
- **Background**: `--color-primary-100`
- **Text Color**: `--color-primary-700`
- **Checkmark Icon**: Display if multi-select

##### Focused (Keyboard Navigation)
- **Background**: `--color-primary-50`
- **Outline**: 2px solid `--color-primary-300` (inside option)

##### Disabled
- **Text Color**: `--color-neutral-400`
- **Cursor**: not-allowed
- **Opacity**: 0.6
- No hover state

### Select Types

#### Single Select
- User can select one option
- Previously selected option is deselected
- Closes dropdown after selection

#### Multi-Select
- User can select multiple options
- Checkboxes displayed for each option
- Dropdown remains open after selection
- Closes when clicking outside dropdown or pressing Escape
- Selected count badge in trigger (e.g., "3 selected")

#### Searchable Select
- Search input at top of dropdown
- Filters options as user types
- Highlights matching text
- No results message when no matches

#### Grouped Select
- Options organized into groups
- Group headers (non-selectable)
- Visual separation between groups
- Indentation for nested options

#### Creatable Select
- Allows user to create new options
- "Create new..." option appears
- Validates new options before adding
- Useful for tags, categories

## Component Props

### Required Props

- **`id`**: string
  - Unique identifier for the select
  - Links label to select for accessibility

### Optional Props

- **`value`**: string | number | string[] | number[]
  - Controlled component value
  - Array for multi-select

- **`defaultValue`**: string | number | string[] | number[]
  - Initial value for uncontrolled selects

- **`onChange`**: (value: string | string[], option?: Option) => void
  - Change event handler
  - Receives selected value(s) and option object

- **`options`**: Option[]
  - Array of selectable options
  - Format: `{ label: string, value: string | number, disabled?: boolean, group?: string }`

- **`placeholder`**: string
  - Default: "Select..."
  - Placeholder text when no selection

- **`size`**: 'small' | 'medium' | 'large'
  - Default: 'medium'
  - Controls select dimensions

- **`label`**: string | ReactNode
  - Select label text
  - Associates with select via htmlFor

- **`helperText`**: string | ReactNode
  - Descriptive text below select
  - Provides additional context

- **`error`**: boolean
  - Default: false
  - Indicates error state

- **`errorMessage`**: string | ReactNode
  - Error message text
  - Displayed when error is true

- **`disabled`**: boolean
  - Default: false
  - Disables select interaction

- **`readOnly`**: boolean
  - Default: false
  - Makes select read-only

- **`required`**: boolean
  - Default: false
  - Marks field as required

- **`multi`**: boolean
  - Default: false
  - Enables multi-select mode

- **`searchable`**: boolean
  - Default: false
  - Enables search functionality

- **`creatable`**: boolean
  - Default: false
  - Allows creating new options

- **`clearable`**: boolean
  - Default: false
  - Shows clear button to deselect

- **`loading`**: boolean
  - Default: false
  - Shows loading state

- **`maxMenuHeight`**: number
  - Default: 300
  - Maximum dropdown menu height (px)

- **`menuPlacement`**: 'auto' | 'top' | 'bottom'
  - Default: 'auto'
  - Controls dropdown position

- **`isGrouped`**: boolean
  - Default: false
  - Enables grouped options display

- **`noOptionsMessage`**: string | ((inputValue: string) => string)
  - Default: "No options"
  - Message when no options available

- **`loadingMessage`**: string
  - Default: "Loading..."
  - Message during loading state

- **`formatOptionLabel`**: (option: Option) => ReactNode
  - Custom option rendering function

- **`filterOption`**: (option: Option, inputValue: string) => boolean
  - Custom filter logic for searchable select

- **`onBlur`**: (event: FocusEvent) => void
  - Blur event handler

- **`onFocus`**: (event: FocusEvent) => void
  - Focus event handler

- **`onMenuOpen`**: () => void
  - Called when menu opens

- **`onMenuClose`**: () => void
  - Called when menu closes

- **`fullWidth`**: boolean
  - Default: false
  - Makes select span full container width

- **`className`**: string
  - Additional CSS classes

- **`menuClassName`**: string
  - Additional CSS classes for dropdown menu

- **`name`**: string
  - Form field name

- **`ariaLabel`**: string
  - Accessible label (when label prop not used)

- **`testId`**: string
  - Data attribute for testing

## Accessibility Requirements

### WCAG 2.1 AA Compliance

1. **Labels**
   - Every select must have an associated label
   - Use `<label>` element with `htmlFor` attribute
   - Label must be visible and descriptive

2. **Keyboard Navigation**
   - **Tab**: Focus select trigger
   - **Enter/Space**: Open/close dropdown
   - **Arrow Down**: Move to next option
   - **Arrow Up**: Move to previous option
   - **Home**: Move to first option
   - **End**: Move to last option
   - **Escape**: Close dropdown
   - **Type-ahead**: Jump to option starting with typed character
   - **Enter**: Select focused option
   - **Space** (in multi-select): Toggle option selection

3. **Screen Reader Support**
   - Announce select role and purpose
   - Announce selected value(s)
   - Announce number of options available
   - Announce when dropdown opens/closes
   - Announce current option during navigation
   - Use `aria-expanded` to indicate dropdown state
   - Use `aria-selected` for selected options
   - Use `aria-activedescendant` for focused option

4. **Focus Management**
   - Focus must be visible
   - Focus returns to trigger after selection
   - Focus trap within dropdown when open
   - Logical focus order

5. **Error Handling**
   - Error messages must be clear
   - Errors announced to screen readers
   - Use `aria-invalid="true"` for errors
   - Error state must not rely on color alone

6. **Touch Targets**
   - Minimum select height: 44px (on mobile)
   - Minimum option height: 44px
   - Adequate spacing between options

### ARIA Attributes

- `role="combobox"`: On select trigger
- `role="listbox"`: On dropdown menu
- `role="option"`: On each option
- `aria-label`: When label is not visible
- `aria-labelledby`: Reference to label element
- `aria-describedby`: Reference to helper text/error
- `aria-expanded`: "true" when open, "false" when closed
- `aria-haspopup="listbox"`: Indicates dropdown presence
- `aria-required="true"`: When field is required
- `aria-invalid="true"`: When select has error
- `aria-selected="true"`: On selected options
- `aria-activedescendant`: ID of currently focused option
- `aria-multiselectable="true"`: For multi-select

## Usage Examples

### Basic Single Select

```jsx
<Select
  id="country"
  label="Country"
  placeholder="Select a country"
  options={[
    { label: "United States", value: "us" },
    { label: "Canada", value: "ca" },
    { label: "Mexico", value: "mx" }
  ]}
  onChange={(value) => console.log(value)}
  required
/>
```

### Multi-Select

```jsx
<Select
  id="skills"
  label="Skills"
  placeholder="Select your skills"
  multi
  options={skillsOptions}
  onChange={(values) => setSelectedSkills(values)}
/>
```

### Searchable Select

```jsx
<Select
  id="city"
  label="City"
  searchable
  options={citiesOptions}
  placeholder="Search for a city..."
  noOptionsMessage="No cities found"
/>
```

### Grouped Select

```jsx
<Select
  id="food"
  label="Choose Food"
  isGrouped
  options={[
    { label: "Apple", value: "apple", group: "Fruits" },
    { label: "Banana", value: "banana", group: "Fruits" },
    { label: "Carrot", value: "carrot", group: "Vegetables" },
    { label: "Broccoli", value: "broccoli", group: "Vegetables" }
  ]}
/>
```

### Creatable Select

```jsx
<Select
  id="tags"
  label="Tags"
  multi
  creatable
  searchable
  options={existingTags}
  placeholder="Add or select tags..."
/>
```

### Select with Error

```jsx
<Select
  id="category"
  label="Category"
  options={categoryOptions}
  error={hasError}
  errorMessage="Please select a category"
  required
/>
```

### Disabled Select

```jsx
<Select
  id="disabled-select"
  label="Disabled Field"
  options={options}
  disabled
  value="locked"
/>
```

## Dos and Don'ts

### Do ✅

- Always provide visible labels
- Use appropriate placeholder text
- Order options logically (alphabetically, by frequency, etc.)
- Provide search for long option lists (>10 items)
- Show loading state for async options
- Use grouped selects for categorized options
- Provide clear error messages
- Limit dropdown height and make it scrollable
- Show selected count for multi-select
- Close dropdown after single selection

### Don't ❌

- Don't use select for 2-3 options (use radio buttons)
- Don't hide the selected value in the trigger
- Don't make dropdown too long without search
- Don't use unclear option labels
- Don't forget to handle empty states
- Don't remove keyboard navigation
- Don't forget to manage focus
- Don't use tiny font sizes
- Don't make all options disabled
- Don't use selects for navigation (use links/menu)

## Best Practices

### When to Use Select vs. Other Components

- **Radio Buttons**: 2-5 options, always visible
- **Checkboxes**: Multiple independent choices, always visible
- **Autocomplete**: Very long lists, user knows what they want
- **Select**: 5+ options, space-constrained

### Option Organization

1. **Alphabetical**: Default for most lists
2. **Frequency**: Most common options first
3. **Logical**: Grouped by category/type
4. **Chronological**: Dates, times

### Performance Considerations

- Virtualize long lists (100+ options)
- Lazy load options when possible
- Debounce search input
- Optimize option rendering

## Component Relationships

### Works With
- **Form**: Wrapped in form components
- **Label**: Associated label element
- **Button**: Form submission buttons
- **Input**: Alternative for free-text input
- **Tooltip**: Additional context for options
- **Modal**: Select fields in modal forms

## Implementation Notes

### Technical Considerations

1. **Portal/Overlay**
   - Use portal to render dropdown at document root
   - Prevents z-index and overflow issues
   - Better positioning control

2. **Virtual Scrolling**
   - Implement for lists with 100+ options
   - Improves performance significantly
   - Libraries: react-window, react-virtual

3. **Responsive Design**
   - Full-width selects on mobile
   - Native select on mobile (consider)
   - Touch-friendly option heights

4. **Accessibility Testing**
   - Test with screen readers (NVDA, JAWS, VoiceOver)
   - Test all keyboard interactions
   - Test focus management
   - Test color contrast

## Related Documentation

- [Design Tokens](../tokens/design-tokens.md)
- [Form Patterns](../guidelines/form-patterns.md)
- [Accessibility Guidelines](../guidelines/accessibility.md)
- [Input Component](./input.md)

## Version History

- **v1.0.0** (Current): Initial specification
  - Defined 3 sizes (small, medium, large)
  - Defined 5 select types (single, multi, searchable, grouped, creatable)
  - Established accessibility requirements
  - Documented all props and usage examples
  - Defined keyboard navigation
