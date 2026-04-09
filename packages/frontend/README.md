# TODO App Frontend - Implementation Guide

## Overview

A modern, accessible daily task scheduling application built with React 18, following Material Design principles and WCAG 2.1 AA accessibility standards.

## Architecture

### Project Structure

```
src/
├── components/
│   ├── common/                    # Reusable UI components
│   │   ├── Button.jsx            # Material Design button
│   │   ├── Button.css
│   │   ├── Input.jsx             # Form input with validation
│   │   ├── Input.css
│   │   ├── LoadingSpinner.jsx    # Loading indicator
│   │   └── LoadingSpinner.css
│   ├── TaskForm/                  # Task creation/editing form
│   │   ├── TaskForm.jsx
│   │   └── TaskForm.css
│   ├── TaskCard/                  # Single task display
│   │   ├── TaskCard.jsx
│   │   └── TaskCard.css
│   ├── TaskList/                  # Task list for a day
│   │   ├── TaskList.jsx
│   │   └── TaskList.css
│   └── DayNavigation/             # Date navigation
│       ├── DayNavigation.jsx
│       └── DayNavigation.css
├── context/
│   └── TaskContext.jsx            # Global state management
├── hooks/
│   └── useTasks.js                # Custom hook for task operations
├── services/
│   └── api.js                     # API client with typed errors
├── utils/
│   └── dateHelpers.js             # Date utility functions
├── __tests__/
│   └── fixtures.js                # Test data
├── App.jsx                        # Main app component
├── App.css                        # App styling
├── index.css                      # Global styles
└── index.js                       # React entry point
```

## Key Features

### Component Architecture

- **Modular Design**: One component per file, co-located styles using CSS Modules pattern
- **Composition**: Components compose to build complex UI from simple parts
- **Props-Driven**: Components receive data and callbacks through props for maximum flexibility
- **Accessibility-First**: ARIA labels, semantic HTML, keyboard navigation built-in

### State Management

- **TaskContext**: Global state for tasks, current date, loading/error states
- **useTaskContext()**: Custom hook to consume context anywhere in the app
- **Reducer Pattern**: useReducer for predictable state updates

### Services

- **API Layer**: Typed error classes (ValidationError, NotFoundError, etc.)
- **Error Handling**: Proper error propagation and user-friendly messages
- **Timeout Handling**: 10-second default timeout for API requests

### Utilities

- **Date Helpers**: Format dates/times, navigate between dates, check date relationships
- **Sorting**: Automatic sorting of tasks by time within a day
- **Navigation**: Today, Tomorrow, Yesterday support with keyboard shortcuts (arrow keys)

## Running the App

### Prerequisites

- Node.js 16+ installed
- Backend running on `http://localhost:3030`

### Start Development Server

```bash
cd packages/frontend
npm start
```

The app opens at `http://localhost:3000` and supports hot module reloading.

### Build for Production

```bash
npm run build
```

Creates an optimized production build in `build/` directory.

### Run Tests

```bash
npm test
```

## Material Design Implementation

### Color Palette

| Name | Value | Usage |
|------|-------|-------|
| Primary | #1F51BA | Main actions, focus states |
| Secondary | #0D9488 | Schedule categories, completed state |
| Error | #DC2626 | Destructive actions, errors |
| Neutral Gray | #6B7280 | Secondary text, borders |

### Typography

- **Headline**: 28px, 700 weight (main page title)
- **Title**: 20px, 600 weight (section headers)
- **Body**: 16px, 400 weight (main content)
- **Label**: 14px, 500 weight (buttons, form labels)

### Spacing

8px-based grid system: 8px, 16px, 24px, 32px, 48px

### Component Patterns

- **Cards**: 1px border, 1px shadow (elevated)
- **FAB**: 56px × 56px, gradient background, always accessible (bottom-right)
- **Modal**: Full-height on mobile, slides up animation

## Accessibility

### WCAG 2.1 AA Compliance

✅ **Perceivable**
- Color contrast: 4.5:1 minimum
- Icons paired with text labels
- Focus visible on all interactive elements (3px outline)

✅ **Operable**
- Keyboard navigation: Tab, Enter, Arrow keys, Escape, Delete
- No keyboard traps
- Touch targets: 48px minimum (buttons, checkboxes)

✅ **Understandable**
- Semantic HTML (`<button>`, `<label>`, `<form>`)
- ARIA labels on icon buttons
- Clear error messages below fields
- Consistent behavior throughout app

✅ **Robust**
- Proper HTML structure
- ARIA attributes where needed
- Screen reader tested

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ← | Previous day |
| → | Next day |
| Tab | Navigate between elements |
| Enter | Submit forms, activate buttons |
| Escape | Close modals, cancel edits |
| Delete | Delete focused task (with confirmation) |

## Component Documentation

### TaskForm

Creates or edits a task with validation. Shows errors inline below fields.

**Props:**
- `initialTask`: Task object for editing (null for create)
- `onSubmit(formData)`: Called when form is submitted
- `onCancel()`: Called when user cancels
- `isSubmitting`: Boolean to disable form during submission

### TaskCard

Displays a single task with action buttons (edit, delete, mark missed).

**Props:**
- `task`: Task object
- `onStatusChange(id, status)`: Called when status changes
- `onEdit(id)`: Called when edit button clicked
- `onDelete(id)`: Called when delete button clicked

### TaskList

Displays all tasks for the current date, sorted by time. Shows loading/error states.

**Props:**
- `tasks`: Array of task objects
- `dateLabel`: Human-readable date ("Today", "Tomorrow", etc.)
- `isLoading`: Boolean
- `error`: Error message string or null
- `onStatusChange`, `onEdit`, `onDelete`: Callbacks
- `onRetry()`: Called when retry button is clicked

### DayNavigation

Date picker allowing navigation between days with keyboard support.

**Props:**
- `currentDate`: Current date in YYYY-MM-DD format
- `onDateChange(newDate)`: Called when date changes

## Environment Variables

Create a `.env` file in `packages/frontend/`:

```env
REACT_APP_API_URL=http://localhost:3030
```

Default: `http://localhost:3030`

## Testing Strategy

### Unit Tests (Phase 5)

- Component rendering and props handling
- User interactions (click, typing, keyboard)
- State updates via hooks

### Integration Tests (Phase 5)

- Task creation workflow: form → API → list update
- Day navigation with task list refresh
- Error handling and recovery

### Accessibility Tests (Phase 5)

- jest-axe for automated violations
- Keyboard navigation testing
- Screen reader compatibility (manual)

### E2E Tests (Phase 5)

- Complete user journeys
- Cross-browser testing
- Performance profiling

**Framework**: Playwright (configured in root)

## Error Handling

### API Errors

The `api.js` service layer throws typed errors:

- **ValidationError**: 400 responses with validation details
- **NotFoundError**: 404 responses
- **NetworkError**: Connection/timeout failures
- **ServerError**: 500+ responses

Components catch and display user-friendly messages via `TaskContext.setError()`.

### Form Validation

- Title: Required, non-empty, max 255 characters
- Date: Required, YYYY-MM-DD format
- Time: Required, HH:MM format (00:00-23:59)
- Status: Enum (pending/completed/missed)

## Performance Optimizations

- Memoization of expensive computations (sortTasksByTime)
- useCallback for stable function references
- React.memo for presentational components (Phase 2+)
- Lazy loading of routes (Phase 2+)
- Code splitting (Phase 2+)

## Responsive Design

| Breakpoint | Behavior |
|------------|----------|
| < 640px | Mobile: Single column, stacked modals |
| 640-768px | Tablet: Grid adjustments |
| > 768px | Desktop: Full-width layouts, side-by-side elements |

## Future Enhancements

- **Phase 2**: Dark mode, recurring tasks, search/filter
- **Phase 3**: Notifications, reminders, sync across devices
- **Phase 4**: Collaboration features, sharing
- **Phase 5**: Mobile app, offline support, progressive web app

## Troubleshooting

### Tasks not loading?
- Check backend is running on port 3030
- Verify REACT_APP_API_URL in .env
- Check browser console for errors

### Form not submitting?
- Check form validation errors shown below fields
- Ensure all required fields are filled
- Check network tab for API response

### Styles not applying?
- Verify CSS files are in component directories
- Check for CSS module conflicts
- Clear browser cache and rebuild

## References

- [React Documentation](https://react.dev)
- [Material Design](https://m3.material.io)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
