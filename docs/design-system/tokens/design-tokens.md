# Design Tokens

Design tokens are the visual design atoms of the Smart Hub design system. They define the fundamental visual properties that will be used across all components.

## Color Tokens

### Primary Colors
- `--color-primary-50`: #EFF6FF
- `--color-primary-100`: #DBEAFE
- `--color-primary-200`: #BFDBFE
- `--color-primary-300`: #93C5FD
- `--color-primary-400`: #60A5FA
- `--color-primary-500`: #3B82F6 (Main brand color)
- `--color-primary-600`: #2563EB
- `--color-primary-700`: #1D4ED8
- `--color-primary-800`: #1E40AF
- `--color-primary-900`: #1E3A8A

### Neutral Colors (Grays)
- `--color-neutral-0`: #FFFFFF
- `--color-neutral-50`: #F9FAFB
- `--color-neutral-100`: #F3F4F6
- `--color-neutral-200`: #E5E7EB
- `--color-neutral-300`: #D1D5DB
- `--color-neutral-400`: #9CA3AF
- `--color-neutral-500`: #6B7280
- `--color-neutral-600`: #4B5563
- `--color-neutral-700`: #374151
- `--color-neutral-800`: #1F2937
- `--color-neutral-900`: #111827

### Semantic Colors

#### Success
- `--color-success-50`: #F0FDF4
- `--color-success-500`: #22C55E
- `--color-success-700`: #15803D

#### Warning
- `--color-warning-50`: #FFFBEB
- `--color-warning-500`: #F59E0B
- `--color-warning-700`: #B45309

#### Error
- `--color-error-50`: #FEF2F2
- `--color-error-500`: #EF4444
- `--color-error-700`: #B91C1C

#### Info
- `--color-info-50`: #EFF6FF
- `--color-info-500`: #3B82F6
- `--color-info-700`: #1D4ED8

## Typography Tokens

### Font Families
- `--font-family-sans`: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif
- `--font-family-mono`: 'Fira Code', 'Monaco', 'Consolas', monospace

### Font Sizes
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-base`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)
- `--font-size-3xl`: 1.875rem (30px)
- `--font-size-4xl`: 2.25rem (36px)

### Font Weights
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Line Heights
- `--line-height-tight`: 1.25
- `--line-height-normal`: 1.5
- `--line-height-relaxed`: 1.75

## Spacing Tokens

- `--spacing-0`: 0
- `--spacing-1`: 0.25rem (4px)
- `--spacing-2`: 0.5rem (8px)
- `--spacing-3`: 0.75rem (12px)
- `--spacing-4`: 1rem (16px)
- `--spacing-5`: 1.25rem (20px)
- `--spacing-6`: 1.5rem (24px)
- `--spacing-8`: 2rem (32px)
- `--spacing-10`: 2.5rem (40px)
- `--spacing-12`: 3rem (48px)
- `--spacing-16`: 4rem (64px)

## Border Tokens

### Border Radius
- `--border-radius-none`: 0
- `--border-radius-sm`: 0.125rem (2px)
- `--border-radius-base`: 0.25rem (4px)
- `--border-radius-md`: 0.375rem (6px)
- `--border-radius-lg`: 0.5rem (8px)
- `--border-radius-xl`: 0.75rem (12px)
- `--border-radius-full`: 9999px

### Border Width
- `--border-width-0`: 0
- `--border-width-1`: 1px
- `--border-width-2`: 2px
- `--border-width-4`: 4px

## Shadow Tokens

- `--shadow-xs`: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- `--shadow-sm`: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
- `--shadow-base`: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- `--shadow-md`: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- `--shadow-lg`: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
- `--shadow-xl`: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

## Z-Index Tokens

- `--z-index-dropdown`: 1000
- `--z-index-sticky`: 1020
- `--z-index-fixed`: 1030
- `--z-index-modal-backdrop`: 1040
- `--z-index-modal`: 1050
- `--z-index-popover`: 1060
- `--z-index-tooltip`: 1070

## Transition Tokens

### Duration
- `--transition-duration-fast`: 150ms
- `--transition-duration-base`: 200ms
- `--transition-duration-slow`: 300ms

### Timing Functions
- `--transition-timing-ease`: ease
- `--transition-timing-ease-in`: ease-in
- `--transition-timing-ease-out`: ease-out
- `--transition-timing-ease-in-out`: ease-in-out

## Breakpoint Tokens

- `--breakpoint-sm`: 640px
- `--breakpoint-md`: 768px
- `--breakpoint-lg`: 1024px
- `--breakpoint-xl`: 1280px
- `--breakpoint-2xl`: 1536px

## Usage Guidelines

1. **Consistency**: Always use design tokens instead of hardcoded values
2. **Semantic naming**: Prefer semantic color tokens (success, error, etc.) over direct color tokens when possible
3. **Responsive design**: Use breakpoint tokens for consistent responsive behavior
4. **Accessibility**: Ensure color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text)
5. **Updates**: Any changes to design tokens should be communicated to the entire team and tested across all components
