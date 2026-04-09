# TODO App UI Guidelines

## Overview

These guidelines establish a consistent, accessible, and user-focused design system for the TODO app. The design prioritizes clarity, speed, and accessibility while maintaining a modern, clean aesthetic using Material Design principles.

---

## Design Principles

1. **Clarity at a Glance** — Users should understand task status, priority, and due dates instantly
2. **Speed to Action** — Core operations (add, edit, delete, complete) require minimal interaction
3. **Accessibility First** — WCAG 2.1 AA compliance is non-negotiable; accessibility benefits all users
4. **Consistent Feedback** — Every action receives visual confirmation, error states, or loading indication
5. **Safeguards** — Destructive actions require confirmation to prevent accidental data loss

---

## Material Design System

### Component Foundations

Use Material Design 3 components as the baseline for all UI elements:

- **Buttons**: Elevated, filled, outlined, and text buttons for different contexts
  - Filled buttons for primary actions (add task, save)
  - Outlined buttons for secondary actions (cancel, close)
  - Text buttons for tertiary interactions (help, learn more)
- **Cards**: Container for tasks, with consistent spacing and shadows
- **FAB (Floating Action Button)**: Primary action for creating new tasks (bottom-right, always accessible)
- **Chips**: For tags, categories, and filter selection
- **Lists & List Items**: Organized task display with consistent row heights
- **Dialogs**: Confirmations and task creation/editing workflows
- **Snackbars**: Transient feedback messages (3–7 second duration)

### Layout Grid & Spacing

- **Base unit**: 8px grid system
- **Margins & padding**: Multiples of 8px (8px, 16px, 24px, 32px, 48px)
- **Fixed header**: Task list header remains at top; content scrolls beneath
- **Bottom navigation** (if needed): Consistent 56px height (Material standard)
- **Mobile breakpoint**: Full-width layout; desktop (tablet+): 2-column or sidebar layout where appropriate

### Typography

- **Typeface**: Roboto (Material default) or system font stack
- **Scale**:
  - **Headline Small** (20px, 500 weight): Page titles, section headers
  - **Title Medium** (16px, 500 weight): Task title/primary content
  - **Body Large** (16px, 400 weight): Task descriptions, help text
  - **Body Medium** (14px, 400 weight): Metadata (dates, times, categories)
  - **Label Medium** (12px, 500 weight): Buttons, chips, captions
- **Line height**: Minimum 1.4x for body text; 1.2x for headlines
- **Line length**: Optimal 50–60 characters; never exceed 80 characters

### Elevation & Shadows

- **Surface levels**: Use Material's elevation scale (e.g., Surface 1, 2, 3)
- **Task cards**: Elevation 1 (subtle shadow for definition)
- **FAB & top app bar**: Elevation 6 (noticeably raised)
- **Dialogs**: Elevation 24 (topmost layer)

---

## Color Palette

### Colors

- **Primary Color**: Vibrant blue (#1F51BA or similar)
  - Use for: Primary buttons, active selections, links, FAB
  - On Primary: White (#FFFFFF)
  
- **Secondary Color**: Teal/green (#0D9488 or similar)
  - Use for: Schedule filters, secondary highlights, completed task indicators
  - On Secondary: White (#FFFFFF)

- **Tertiary Color**: Purple/indigo (#6B21A8 or similar)
  - Use for: Accent actions, advanced settings indicators
  - On Tertiary: White (#FFFFFF)

- **Error Color**: Red (#DC2626 or similar)
  - Use for: Destructive actions, error messages, warnings
  - On Error: White (#FFFFFF)

- **Neutral Background**: Off-white (#F9FAFB or #FAFAFA)
- **Surface**: White (#FFFFFF)
- **On Surface**: Dark gray (#1F2937 for text, #6B7280 for secondary text)
- **Border/Divider**: Light gray (#E5E7EB, #D1D5DB)

### Contrast Requirements

- **All text on backgrounds**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Icons on backgrounds**: Minimum 3:1 contrast ratio (WCAG AA)
- **Interactive elements**: Ensure sufficient contrast for users with color blindness
  - Test with tools like WebAIM Contrast Checker or Stark

---

## Layout & Navigation

### Task List View (Primary Screen)

```
┌─────────────────────────────────────┐
│ TODAY                      [⋮ Menu] │
├─────────────────────────────────────┤
│ [High] Urgent Report   [●]    [>]   │
│ [Default] Review PR    [ ]    [>]   │
│ [Low] Read Article     [●]    [>]   │
│                                     │
│ TOMORROW                            │
│ [Default] Team Meeting [●]    [>]   │
├─────────────────────────────────────┤
│                                     │
│                                [+]  │
└─────────────────────────────────────┘
```

- **Header**: Section headers (TODAY, TOMORROW, LATER) with light background
- **Task rows**: 56px minimum height; touch-friendly targets (Material: 48px minimum)
- **Checkbox**: Left side (8px margin); clearly interactive
- **Title**: Bold, left-aligned; truncate with ellipsis if necessary
- **Priority badge**: Optional visual indicator (color dot or tag)
- **Chevron/expand icon**: Right side (tap to open detail view)
- **Swipe actions** (optional): Right-swipe to delete or mark complete (if UX testing validates)

### Task Detail/Edit View

- **Modal dialog** or **full-screen card** (design choice based on platform)
- **Sections**:
  1. **Title input**: Large text field with placeholder "Task name"
  2. **Description**: Multi-line text area
  3. **Due date**: Date picker with preset shortcuts (Today, Tomorrow, Next week)
  4. **Category/Tags**: Chip selection from predefined list
  5. **Priority**: Radio buttons or dropdown (High, Default, Low)
  6. **Frequency** (if applicable): Recurring task toggle + recurrence rule picker
  7. **Notes/Metadata**: Timestamps (created, last modified)
- **Actions**: Save (filled button), Delete (error text button), Cancel (outlined button)

### Add/Create Flow

- **FAB tap** → Opens minimal inline add-form or modal dialog
- **Quick add**: Title field only initially; collapse/expand for details
- **Pre-focus**: Title input automatically focused; show keyboard on mobile
- **Cancel**: Tap outside or press escape; discard unsaved changes (no confirmation needed for empty form)

---

## Interactions & Feedback

### Loading States

- **Loading skeleton** or **shimmer**: Replace content with placeholder during fetch
- **Loading bar**: Linear progress bar in top app bar for bulk operations
- **Spinner**: Centered on screen for full-page loads (max 2–3 second timeout before error)

### Success States

- **Snackbar notification**: "Task added" with 4-second duration
- **Inline feedback**: Green checkmark + text for critical operations (e.g., "Saved")
- **Haptic feedback** (mobile): Light vibration on successful action (if framework supports)

### Error States

- **Error message**: Red text on surface; ensure contrast ratio ≥ 4.5:1
- **Error snackbar**: Red background with white text; include "Retry" action if applicable
- **Field errors**: Below invalid input with icon (⚠) + message
- **Network errors**: "Check your connection" + retry button
- **Toast/alert** for non-recoverable errors (e.g., "Failed to load tasks")

### Confirmation Dialogs

**Required for:**
- Deleting a task
- Clearing completed tasks
- Signing out or resetting app state

**Dialog structure:**
```
┌─────────────────────────────────────┐
│ Delete Task?                        │
├─────────────────────────────────────┤
│ This cannot be undone.              │
│                                     │
│          [Cancel]   [Delete]        │
└─────────────────────────────────────┘
```

- **Title**: Clear question or action
- **Body**: Concise explanation of consequence
- **Buttons**: Cancel (outlined) + action (filled or error color)
- **Focus**: Default focus on *Cancel* (safer default)

### State Indicators

- **Completed task**: Strikethrough text + muted color (opacity ~50%); checkbox checked & filled
- **Overdue task**: Red left border or subtle red background tint
- **Recurring task**: Icon (repeat symbol) next to title
- **Draft/unsaved**: Subtle gray text or visual indicator

---

## Accessibility Guidelines

### WCAG 2.1 Level AA Compliance

#### Perceivable

- **Color not sole identifier**: Use color + icons/symbols (e.g., red + ⚠ for errors)
- **Contrast ratio**: 4.5:1 for normal text, 3:1 for large text (18pt+) and components
- **Text resizing**: Support up to 200% zoom without horizontal scrolling
- **Images & icons**: Descriptive alt text or aria-label

#### Operable

- **Keyboard navigation**:
  - Tab to cycle through focusable elements
  - Enter to activate buttons/links
  - Escape to close modals or cancel
  - Arrow keys for list navigation (Up/Down to move between tasks)
  - Space to toggle checkboxes
  - Delete key on focused task offers delete action (with confirmation)
- **Focus visible**: Clear focus indicator (outline or highlight) on all interactive elements (min 3px)
- **Touch targets**: 48px × 48px minimum (Material standard)
- **No keyboard traps**: Users can always escape from any interaction

#### Understandable

- **Labels**: All input fields have associated `<label>` elements or aria-label
- **Instructions**: Clear placeholder text, help icons with tooltips (on hover/focus)
- **Consistent behavior**: Same controls behave identically throughout app
- **Error identification**: Specific error messages (not just "Error")

#### Robust

- **Semantic HTML**: Use correct HTML elements (`<button>`, `<input>`, `<nav>`, etc.)
- **ARIA attributes**:
  - `aria-label`: Descriptive label for icon-only buttons
  - `aria-pressed`: Toggle buttons (e.g., filter active state)
  - `aria-checked`: Checkboxes
  - `aria-live`: Dynamic content (e.g., snackbar notifications)
  - `aria-busy`: Loading states
  - `role="alert"`: Error messages
- **Semantic landmarks**: `<header>`, `<main>`, `<nav>` assist screen reader users

### Mobile & Screen Readers

- **Screen reader testing**: Verify every UI element is announced correctly (VoiceOver on iOS, TalkBack on Android)
- **Focus management**: After adding/deleting a task, focus returns to the list
- **List semantics**: Use `<ul>` and `<li>` for task lists; indicate total count ("3 tasks")
- **Headings**: Use `<h1>`, `<h2>` to structure page hierarchy

### Text Scaling & Internationalization

- **Relative units**: Use `rem` and `em` for sizing; avoid fixed `px` for text
- **Text truncation**: Provide tooltips for truncated content (on hover or long-press)
- **RTL support**: Consider Arabic/Hebrew mirror layouts (future enhancement)
- **i18n placeholders**: Design with text expansion in mind (German +30%, Chinese +10%)

---

## Dark Mode Support

- **Optional enhancement** for v2; if implemented:
  - Use Material's elevation system for surface differentiation (no pure black)
  - Primary color: Lighter tint (#4F7EFF or similar)
  - Text: White (#F9FAFB) on dark surfaces (#121212 or #1E1E1E)
  - Maintain 4.5:1 contrast in both light and dark modes
  - Provide theme toggle in settings; respect system preference as default

---

## Responsive Design

### Breakpoints

- **Mobile** (< 600px): Single column, full-width cards
- **Tablet** (600px – 1024px): 2-column layout optional; improved card spacing
- **Desktop** (> 1024px): Sidebar navigation, 3-column layout with detail pane

### Mobile Optimizations

- **Large touch targets**: 48px minimum buttons/checkboxes
- **Vertical scrolling**: Favor scroll over horizontal/pagination
- **Bottom sheet modals**: Preferred over center dialogs for task creation (easier reach)
- **Lazy loading**: Load tasks as user scrolls (infinite scroll or pagination)

### Tablet & Desktop

- **Fixed sidebar** (optional): Navigation, filters, settings
- **Detail pane**: Task detail shown alongside list (split view)
- **Keyboard shortcuts**: Cmd/Ctrl + N for new, Cmd/Ctrl + K for search (future)

---

## Visual Documentation

### Icon Library

- **Recommended**: Material Design Icons (24px, 2px stroke weight for consistency)
- **Key icons**:
  - `add` — Add task (FAB)
  - `check` — Complete task
  - `delete` — Delete task
  - `edit` — Edit task
  - `calendar` — Due date
  - `label` — Category/tag
  - `repeat` — Recurring
  - `priority_high` — Priority indicator
  - `close` — Dismiss/cancel
  - `menu` — More options

### Sample Component States

**Task Card (Idle)** → **(Hover)** → **(Focus)** → **(Completed)**

```
Normal:         Hover:          Focus:          Completed:
┌──────────┐   ┌──────────┐   ┌──────────┐    ┌──────────┐
│ [ ] Task │   │ [ ] Task │   │ [ ] Task │    │ [✓] Task │
│ Due: Fri │   │ Due: Fri │   │ Due: Fri │    │ Due: Fri │
└──────────┘   └──────────┘   └──────────┘    └──────────┘
  (z: 1)        (z: 2, shadow)  (outline)     (strikethrough)
```

---

## Performance & Polish

- **Animation duration**: 200–300ms for UI transitions (avoid jarring 0ms or >500ms)
- **Easing function**: Material's standard easing (`cubic-bezier(0.4, 0, 0.2, 1)`)
- **Loading time**: Keep task list interactive in < 1 second; prefetch on app open
- **Micro-interactions**: Subtle ripple on button press, smooth checkbox animation
- **Empty state**: Clear messaging + illustration or icon if no tasks exist

---

## Checklist for Implementation

- [ ] Material Design components integrated consistently
- [ ] Color palette defined and applied; contrast verified with contrast checker
- [ ] Keyboard navigation fully tested (Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader tested (VoiceOver/TalkBack) on mobile devices
- [ ] All interactive elements labeled with `aria-label` or `<label>`
- [ ] Focus visible on all focusable elements
- [ ] Touch targets ≥ 48px × 48px
- [ ] Loading, error, and success states implemented
- [ ] Confirmation dialogs for destructive actions
- [ ] Responsive design tested on mobile (375px), tablet (768px), desktop (1200px)
- [ ] Dark mode support (if in scope)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance profiled; task list remains interactive under load

---

## References

- [Material Design 3](https://m3.material.io/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Material Design Icons](https://fonts.google.com/icons)
