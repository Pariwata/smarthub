# Component Usage Patterns

## Overview

This document provides guidelines for using Smart Hub design system components effectively. It covers common patterns, best practices, and examples of how components work together to create consistent user experiences.

## General Principles

### Consistency
- Use components consistently across the application
- Follow established patterns for similar use cases
- Maintain visual and behavioral consistency

### Simplicity
- Use the simplest component that meets the need
- Avoid unnecessary complexity
- Prioritize user understanding

### Accessibility
- All patterns must be accessible
- Follow WCAG 2.1 AA guidelines
- Test with keyboard and screen readers

### Responsiveness
- Patterns must work on all screen sizes
- Mobile-first approach
- Touch-friendly interactions

## Form Patterns

### Basic Form Layout

```jsx
<form onSubmit={handleSubmit}>
  <Input
    id="firstName"
    label="First Name"
    value={firstName}
    onChange={setFirstName}
    required
  />
  
  <Input
    id="lastName"
    label="Last Name"
    value={lastName}
    onChange={setLastName}
    required
  />
  
  <Input
    id="email"
    type="email"
    label="Email Address"
    value={email}
    onChange={setEmail}
    error={emailError}
    errorMessage="Please enter a valid email"
    required
  />
  
  <div className="form-actions">
    <Button variant="secondary" onClick={handleCancel}>
      Cancel
    </Button>
    <Button variant="primary" type="submit">
      Save
    </Button>
  </div>
</form>
```

### Multi-Step Forms

**Use when:**
- Form has many fields (>10)
- Logical grouping of fields exists
- Progressive disclosure is beneficial

**Pattern:**
```jsx
<MultiStepForm currentStep={currentStep} totalSteps={3}>
  <Step title="Personal Information">
    <Input label="Name" />
    <Input label="Email" />
  </Step>
  
  <Step title="Address">
    <Input label="Street" />
    <Input label="City" />
    <Select label="Country" />
  </Step>
  
  <Step title="Review">
    <ReviewSummary data={formData} />
  </Step>
  
  <FormNavigation
    onNext={handleNext}
    onPrevious={handlePrevious}
    onSubmit={handleSubmit}
  />
</MultiStepForm>
```

### Inline Form Validation

**Pattern:**
- Validate on blur, not on keystroke
- Show errors below the field
- Show success state when valid
- Clear errors when user starts fixing

```jsx
<Input
  id="password"
  type="password"
  label="Password"
  value={password}
  onChange={setPassword}
  onBlur={validatePassword}
  error={passwordError}
  errorMessage="Password must be at least 8 characters"
  success={passwordValid}
  helperText="Use at least 8 characters with a mix of letters and numbers"
/>
```

### Required vs Optional Fields

**Best Practice:**
- Mark required fields with asterisk (*)
- Or mark optional fields with (Optional)
- Be consistent throughout the application
- Explain convention at top of form

```jsx
<fieldset>
  <legend>Contact Information (all fields required)</legend>
  <Input id="name" label="Name" required />
  <Input id="email" label="Email" required />
  <Input id="phone" label="Phone (Optional)" />
</fieldset>
```

## Modal Patterns

### Confirmation Dialog

**Use when:**
- User is about to perform destructive action
- Action cannot be easily undone
- Important decision needs confirmation

```jsx
<Modal
  isOpen={showConfirm}
  onClose={handleCancel}
  variant="confirmation"
  title="Delete Account?"
  icon={<WarningIcon />}
  closeOnBackdropClick={false}
  closeOnEscape={false}
  primaryAction={{
    label: "Delete Account",
    onClick: handleDelete,
    variant: "danger",
    loading: isDeleting
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: handleCancel
  }}
>
  <p>
    This action cannot be undone. All your data will be permanently deleted.
  </p>
  <p>
    Type <strong>DELETE</strong> to confirm:
  </p>
  <Input
    id="confirm"
    value={confirmText}
    onChange={setConfirmText}
    placeholder="Type DELETE"
  />
</Modal>
```

### Form in Modal

**Use when:**
- Quick data entry needed
- Context shouldn't be lost
- Form is relatively simple

```jsx
<Modal
  isOpen={showAddUser}
  onClose={handleClose}
  title="Add New User"
  size="medium"
  primaryAction={{
    label: "Add User",
    onClick: handleSubmit,
    disabled: !isValid,
    loading: isSaving
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: handleClose
  }}
>
  <form onSubmit={handleSubmit}>
    <Input
      id="userName"
      label="Name"
      value={name}
      onChange={setName}
      required
    />
    <Input
      id="userEmail"
      type="email"
      label="Email"
      value={email}
      onChange={setEmail}
      required
    />
    <Select
      id="userRole"
      label="Role"
      options={roleOptions}
      value={role}
      onChange={setRole}
      required
    />
  </form>
</Modal>
```

### Alert/Notification Modal

**Use when:**
- Critical information must be communicated
- User action is required
- Cannot be missed

```jsx
<Modal
  isOpen={showAlert}
  onClose={handleAlertClose}
  variant="alert"
  title="Session Expired"
  icon={<InfoIcon />}
  size="small"
  primaryAction={{
    label: "Sign In Again",
    onClick: handleSignIn
  }}
>
  <p>Your session has expired. Please sign in again to continue.</p>
</Modal>
```

## Selection Patterns

### Radio Buttons vs Select

**Use Radio Buttons when:**
- 2-5 options
- All options should be visible
- Choice is critical and needs emphasis
- Space is available

**Use Select when:**
- 5+ options
- Space is limited
- Options can be grouped
- Search functionality is helpful

### Single Select vs Multi-Select

**Single Select:**
```jsx
<Select
  id="country"
  label="Country"
  options={countries}
  value={selectedCountry}
  onChange={setSelectedCountry}
/>
```

**Multi-Select:**
```jsx
<Select
  id="skills"
  label="Skills"
  multi
  searchable
  options={skills}
  value={selectedSkills}
  onChange={setSelectedSkills}
  placeholder="Select one or more skills"
/>
```

### Checkboxes vs Multi-Select

**Use Checkboxes when:**
- 2-7 options
- All options should be visible
- Users need to compare options
- Binary choices (yes/no)

**Use Multi-Select when:**
- 7+ options
- Space is limited
- Search functionality is helpful
- Options can be grouped

## Button Patterns

### Button Placement

**In Forms:**
- Primary action on right
- Secondary action on left
- Destructive actions separated

```jsx
<div className="form-actions">
  <Button variant="secondary" onClick={handleCancel}>
    Cancel
  </Button>
  <Button variant="primary" type="submit">
    Save Changes
  </Button>
</div>
```

**In Modals:**
- Follow same pattern as forms
- Primary action on right
- Consider full-width on mobile

### Button Groups

**Adjacent buttons:**
```jsx
<div className="button-group">
  <Button variant="secondary" leftIcon={<UploadIcon />}>
    Upload
  </Button>
  <Button variant="secondary" leftIcon={<DownloadIcon />}>
    Download
  </Button>
  <Button variant="danger" leftIcon={<DeleteIcon />}>
    Delete
  </Button>
</div>
```

**Toolbar:**
```jsx
<div className="toolbar">
  <div className="toolbar-left">
    <Button variant="tertiary" iconOnly aria-label="Bold">
      <BoldIcon />
    </Button>
    <Button variant="tertiary" iconOnly aria-label="Italic">
      <ItalicIcon />
    </Button>
    <Button variant="tertiary" iconOnly aria-label="Underline">
      <UnderlineIcon />
    </Button>
  </div>
  <div className="toolbar-right">
    <Button variant="primary" size="small">
      Publish
    </Button>
  </div>
</div>
```

### Loading States

**During async operations:**
```jsx
<Button
  variant="primary"
  loading={isSaving}
  disabled={isSaving}
  onClick={handleSave}
>
  {isSaving ? 'Saving...' : 'Save Changes'}
</Button>
```

## Loading and Empty States

### Loading State

**During initial load:**
```jsx
{loading ? (
  <LoadingSpinner message="Loading data..." />
) : (
  <DataDisplay data={data} />
)}
```

**During action:**
```jsx
<Button
  variant="primary"
  loading={isProcessing}
  disabled={isProcessing}
>
  {isProcessing ? 'Processing...' : 'Process'}
</Button>
```

### Empty State

**No data available:**
```jsx
<EmptyState
  icon={<EmptyBoxIcon />}
  title="No items yet"
  description="Get started by creating your first item"
  action={
    <Button variant="primary" onClick={handleCreate}>
      Create Item
    </Button>
  }
/>
```

### Error State

**When error occurs:**
```jsx
<ErrorState
  icon={<ErrorIcon />}
  title="Something went wrong"
  description="We couldn't load your data. Please try again."
  action={
    <Button variant="primary" onClick={handleRetry}>
      Try Again
    </Button>
  }
/>
```

## Search and Filter Patterns

### Simple Search

```jsx
<Input
  id="search"
  type="search"
  placeholder="Search..."
  leftIcon={<SearchIcon />}
  value={searchQuery}
  onChange={setSearchQuery}
  rightIcon={
    searchQuery && (
      <IconButton onClick={clearSearch} aria-label="Clear search">
        <CloseIcon />
      </IconButton>
    )
  }
/>
```

### Search with Filters

```jsx
<div className="search-filter-bar">
  <Input
    id="search"
    type="search"
    placeholder="Search..."
    leftIcon={<SearchIcon />}
    value={searchQuery}
    onChange={setSearchQuery}
  />
  
  <Select
    id="category"
    placeholder="Category"
    options={categories}
    value={selectedCategory}
    onChange={setSelectedCategory}
  />
  
  <Select
    id="status"
    placeholder="Status"
    options={statuses}
    value={selectedStatus}
    onChange={setSelectedStatus}
  />
  
  <Button
    variant="tertiary"
    onClick={clearFilters}
    disabled={!hasActiveFilters}
  >
    Clear Filters
  </Button>
</div>
```

## Data Display Patterns

### Lists with Actions

```jsx
<ul className="item-list">
  {items.map(item => (
    <li key={item.id} className="item">
      <div className="item-content">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <div className="item-actions">
        <Button
          variant="tertiary"
          size="small"
          onClick={() => handleEdit(item.id)}
        >
          Edit
        </Button>
        <Button
          variant="tertiary"
          size="small"
          onClick={() => handleDelete(item.id)}
        >
          Delete
        </Button>
      </div>
    </li>
  ))}
</ul>
```

### Cards with Actions

```jsx
<div className="card-grid">
  {items.map(item => (
    <Card key={item.id}>
      <CardImage src={item.image} alt={item.title} />
      <CardContent>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary" fullWidth onClick={() => handleView(item.id)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>
```

## Navigation Patterns

### Primary Navigation

```jsx
<nav aria-label="Main navigation">
  <ul>
    <li>
      <a href="/dashboard" aria-current={current === 'dashboard' ? 'page' : undefined}>
        Dashboard
      </a>
    </li>
    <li>
      <a href="/projects" aria-current={current === 'projects' ? 'page' : undefined}>
        Projects
      </a>
    </li>
    <li>
      <a href="/settings" aria-current={current === 'settings' ? 'page' : undefined}>
        Settings
      </a>
    </li>
  </ul>
</nav>
```

### Breadcrumbs

```jsx
<nav aria-label="Breadcrumb">
  <ol className="breadcrumbs">
    <li><a href="/">Home</a></li>
    <li><a href="/projects">Projects</a></li>
    <li aria-current="page">Project Details</li>
  </ol>
</nav>
```

## Responsive Patterns

### Mobile Adaptations

**Full-width buttons on mobile:**
```jsx
<Button
  variant="primary"
  fullWidth={isMobile}
>
  Continue
</Button>
```

**Stack form actions on mobile:**
```jsx
<div className={`form-actions ${isMobile ? 'stacked' : 'inline'}`}>
  <Button variant="secondary" fullWidth={isMobile}>
    Cancel
  </Button>
  <Button variant="primary" fullWidth={isMobile}>
    Save
  </Button>
</div>
```

## Dos and Don'ts

### Do ✅
- Follow established patterns consistently
- Test patterns with real users
- Consider accessibility in all patterns
- Adapt patterns for mobile when needed
- Document custom patterns for team
- Use semantic HTML
- Provide clear feedback for actions
- Handle loading and error states

### Don't ❌
- Don't create custom patterns without reason
- Don't ignore mobile experience
- Don't skip accessibility testing
- Don't use too many modal dialogs
- Don't hide critical actions
- Don't use inconsistent button placement
- Don't forget loading states
- Don't create overly complex forms

## Related Documentation

- [Button Component](../components/button.md)
- [Input Component](../components/input.md)
- [Select Component](../components/select.md)
- [Modal Component](../components/modal.md)
- [Accessibility Guidelines](./accessibility.md)

## Version History

- **v1.0.0** (Current): Initial usage patterns
  - Form patterns
  - Modal patterns
  - Selection patterns
  - Button patterns
  - Loading and empty states
  - Search and filter patterns
  - Data display patterns
  - Navigation patterns
  - Responsive patterns
