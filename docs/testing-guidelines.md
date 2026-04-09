# TODO App Testing Guidelines

## Overview

These guidelines establish a comprehensive testing strategy for the TODO app. We prioritize **user-centric testing** using modern testing frameworks to ensure functionality, accessibility, and reliability. Testing decisions should follow the [testing trophy](https://kentcdodds.com/blog/the-testing-trophy-comprehensive-testing-strategies-for-real-world-applications) philosophy: many unit tests, fewer integration tests, even fewer E2E tests.

**Testing tools**: Jest + React Testing Library for unit and integration tests; Cypress or Playwright for E2E tests.

---

## Testing Philosophy

1. **Test behavior, not implementation** — Tests should verify what users see, not internal state or function calls
2. **Write tests that resemble user workflows** — Simulate real user interactions, not component internals
3. **Accessible tests are better tests** — Query elements by accessible roles (getByRole, getByLabelText) to ensure UI is accessible
4. **Confidence over coverage** — Target critical paths; aim for 80%+ coverage on core features, not 100% everywhere
5. **Tests as documentation** — Test names should explain expected behavior clearly
6. **Maintainability first** — Avoid brittle tests that break with UI refactors; invest in test utilities

---

## Unit Testing

### Scope

Unit tests verify individual functions, hooks, and utilities in isolation. They are fast, cheap to write, and should cover:

- **Utility functions** — Data transformations, validators, formatters
- **Custom hooks** — Logic for state management, API calls, side effects
- **Pure components** — Stateless or lightly complex components with specific props

### Tools & Setup

- **Framework**: Jest
- **React utilities**: React Testing Library's `render()`, hooks testing utils
- **Assertions**: Jest matchers (`.toEqual()`, `.toContain()`, etc.)

### Example: Utility Function Test

```javascript
// src/utils/taskParser.test.js
import { parseDueDate, isOverdue, formatDueDate } from './taskParser';

describe('taskParser', () => {
  describe('parseDueDate', () => {
    it('should parse ISO date string correctly', () => {
      const date = parseDueDate('2026-04-15');
      expect(date).toEqual(new Date('2026-04-15'));
    });

    it('should throw error on invalid format', () => {
      expect(() => parseDueDate('invalid')).toThrow();
    });
  });

  describe('isOverdue', () => {
    it('should return true if due date is in the past', () => {
      const pastDate = new Date(Date.now() - 86400000); // 1 day ago
      expect(isOverdue(pastDate)).toBe(true);
    });

    it('should return false if due date is in the future', () => {
      const futureDate = new Date(Date.now() + 86400000); // 1 day from now
      expect(isOverdue(futureDate)).toBe(false);
    });
  });

  describe('formatDueDate', () => {
    it('should format date as readable string', () => {
      const date = new Date('2026-04-15');
      expect(formatDueDate(date)).toBe('Apr 15, 2026');
    });
  });
});
```

### Example: Custom Hook Test

```javascript
// src/hooks/useTasks.test.js
import { renderHook, act } from '@testing-library/react';
import { useTasks } from './useTasks';

describe('useTasks', () => {
  it('should initialize with empty tasks', () => {
    const { result } = renderHook(() => useTasks());
    expect(result.current.tasks).toEqual([]);
  });

  it('should add a new task', () => {
    const { result } = renderHook(() => useTasks());
    
    act(() => {
      result.current.addTask({ title: 'Buy milk' });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('Buy milk');
  });

  it('should mark task as complete', () => {
    const { result } = renderHook(() => useTasks());
    
    act(() => {
      result.current.addTask({ title: 'Buy milk' });
      result.current.completeTask(result.current.tasks[0].id);
    });

    expect(result.current.tasks[0].completed).toBe(true);
  });
});
```

### Best Practices

- **One assertion per test** (or group related assertions logically)
- **Use descriptive test names** — "should X when Y" format
- **Mock external dependencies** — APIs, timers, local storage
- **Use test data builders** — Factory functions for consistent test fixtures
- **Avoid implementation details** — Don't check internal state or mock React internals

---

## Integration Testing

### Scope

Integration tests verify that multiple components and services work together correctly. They test:

- **Component interactions** — Parent passing props to child, callbacks firing
- **Form submissions** — User fills form, submits, sees feedback
- **API integration** — Component fetches data, renders results
- **State management** — Data flows through multiple components correctly

### Tools & Setup

- **Framework**: React Testing Library (same as unit tests)
- **Server mocking**: Mock Service Worker (MSW) for HTTP interception
- **Async utilities**: `waitFor()`, `findBy*` queries

### Example: Task Addition Flow

```javascript
// src/components/__tests__/TaskForm.integration.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../TaskForm';
import { TaskProvider } from '../../context/TaskContext';

describe('TaskForm Integration', () => {
  it('should add a new task when user submits form', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskProvider>
        <TaskForm />
      </TaskProvider>
    );

    const input = screen.getByLabelText(/task name/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    await user.type(input, 'Buy groceries');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  it('should show error if title is empty', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskProvider>
        <TaskForm />
      </TaskProvider>
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
  });
});
```

### Example: API Integration with MSW

```javascript
// src/components/__tests__/TaskList.integration.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { TaskList } from '../TaskList';

const server = setupServer(
  http.get('/api/tasks', () => {
    return HttpResponse.json([
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: true }
    ]);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('TaskList Integration', () => {
  it('should fetch and display tasks on mount', async () => {
    render(<TaskList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('should display error when API call fails', async () => {
    server.use(
      http.get('/api/tasks', () => {
        return HttpResponse.error();
      })
    );

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
    });
  });
});
```

### Best Practices

- **Query by accessible roles** — `getByRole()`, `getByLabelText()` instead of test IDs
- **Use `userEvent` for interactions** — More realistic than `fireEvent`
- **Mock external APIs** — Use MSW for consistent, predictable responses
- **Test user workflows** — Verify the full flow from input to output
- **Wait for async updates** — Use `waitFor()` and `findBy*` queries

---

## Accessibility Testing

### Scope

Accessibility testing ensures the app meets WCAG 2.1 AA standards and is usable by all users. It verifies:

- **Keyboard navigation** — Tab, Enter, Escape, Arrow keys work
- **Screen reader compatibility** — Elements announced correctly, labels present
- **Color contrast** — Text readable for users with low vision
- **Focus management** — Focus visible and logical after interactions
- **ARIA attributes** — Correct roles, aria-label, aria-live, aria-pressed, etc.

### Tools

- **React Testing Library** — Queries by accessible roles naturally guide accessible testing
- **jest-axe** — Automated accessibility violation detection
- **Manual testing** — VoiceOver (macOS/iOS), NVDA (Windows), TalkBack (Android)

### Example: Accessibility Audit

```javascript
// src/components/__tests__/TaskForm.a11y.test.js
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TaskForm } from '../TaskForm';

expect.extend(toHaveNoViolations);

describe('TaskForm Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<TaskForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper labels for all inputs', () => {
    render(<TaskForm />);
    
    expect(screen.getByLabelText(/task name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
  });

  it('should show focus indicator on inputs', () => {
    render(<TaskForm />);
    
    const input = screen.getByLabelText(/task name/i);
    input.focus();
    
    // Verify CSS outline or custom focus style is present
    expect(input).toHaveFocus();
  });
});
```

### Example: Keyboard Navigation Test

```javascript
// src/components/__tests__/TaskList.keyboard.test.js
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../TaskList';

describe('TaskList Keyboard Navigation', () => {
  it('should navigate tasks with arrow keys', async () => {
    const user = userEvent.setup();
    
    render(
      <TaskList>
        <div role="button" tabIndex="0">Task 1</div>
        <div role="button" tabIndex="0">Task 2</div>
        <div role="button" tabIndex="0">Task 3</div>
      </TaskList>
    );

    const task1 = screen.getByText('Task 1');
    task1.focus();
    expect(task1).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Task 2')).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('Task 3')).toHaveFocus();
  });

  it('should trigger action on Enter key', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <div role="button" tabIndex="0" onClick={handleClick}>
        Complete Task
      </div>
    );

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalled();
  });

  it('should close modal on Escape key', async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();

    render(
      <div role="dialog" onKeyDown={(e) => e.key === 'Escape' && handleClose()}>
        Modal content
      </div>
    );

    const modal = screen.getByRole('dialog');
    modal.focus();
    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalled();
  });
});
```

### Manual Accessibility Testing Checklist

- [ ] **Keyboard-only navigation** — Tab through all UI elements; all interactive elements reachable
- [ ] **Focus visible** — Clear focus indicator on every focusable element
- [ ] **Screen reader** — Use TalkBack/VoiceOver to verify:
  - All text is announced
  - Buttons labeled clearly
  - Form inputs have associated labels
  - List structure announced (e.g., "3 items")
  - Landmarks announced (header, main, nav)
- [ ] **Color contrast** — WCAG AA (4.5:1 for normal text) using WebAIM Contrast Checker
- [ ] **Zoom** — Page readable at 200% zoom without horizontal scrolling
- [ ] **Motion** — Animations respect `prefers-reduced-motion` setting

### Best Practices

- **Query by accessible roles** — `getByRole()` ensures elements are accessible
- **Use semantic HTML** — `<button>`, `<label>`, `<nav>`, etc.
- **ARIA when needed** — Only when semantic HTML isn't available (e.g., `aria-live`, `role="alert"`)
- **Test with real assistive tech** — Automated tools catch violations; manual testing catches nuances
- **Include a11y tests in CI/CD** — Fail builds on accessibility violations

---

## End-to-End (E2E) Testing

### Scope

E2E tests verify complete user workflows in a real browser environment. They test:

- **Complete user journeys** — Create task → Edit → Complete → Delete
- **Error recovery** — Network failures, API errors, timeouts
- **Cross-page navigation** — Links, navigation menus, deep linking
- **Browser state persistence** — Local storage, session storage

### Tools

- **Framework**: Cypress (recommended for clarity) or Playwright (faster)
- **Approach**: Test user paths, not implementation; minimize flakiness

### Example: E2E Test (Cypress)

```javascript
// cypress/e2e/task-management.cy.js
describe('Task Management E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should complete the full task lifecycle', () => {
    // Create a task
    cy.get('[aria-label="Add task"]').click();
    cy.get('input[placeholder="Task name"]').type('Buy groceries');
    cy.get('button').contains('Add').click();

    // Verify task appears
    cy.contains('Buy groceries').should('be.visible');

    // Edit the task
    cy.contains('Buy groceries').parent().find('[aria-label="Edit"]').click();
    cy.get('input[placeholder="Task name"]').clear().type('Buy groceries & cook dinner');
    cy.get('button').contains('Save').click();

    // Verify edit
    cy.contains('Buy groceries & cook dinner').should('be.visible');

    // Complete the task
    cy.contains('Buy groceries & cook dinner').parent().find('input[type="checkbox"]').click();
    cy.contains('Buy groceries & cook dinner').should('have.css', 'text-decoration', 'line-through');

    // Delete the task
    cy.contains('Buy groceries & cook dinner').parent().find('[aria-label="Delete"]').click();
    cy.get('button').contains('Delete').click(); // Confirmation

    // Verify deletion
    cy.contains('Buy groceries & cook dinner').should('not.exist');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('GET', '/api/tasks', { statusCode: 500 });
    cy.visit('http://localhost:3000');

    cy.contains('Failed to load tasks').should('be.visible');
    cy.get('button').contains('Retry').click();

    cy.intercept('GET', '/api/tasks', { fixture: 'tasks.json' });
    cy.contains('Task 1').should('be.visible');
  });

  it('should persist data after page refresh', () => {
    cy.get('[aria-label="Add task"]').click();
    cy.get('input[placeholder="Task name"]').type('Persistent task');
    cy.get('button').contains('Add').click();

    cy.reload();

    cy.contains('Persistent task').should('be.visible');
  });
});
```

### Best Practices

- **Test critical user paths only** — Focus on must-work features, not every edge case
- **Use data-testid sparingly** — Query by accessible attributes and content first
- **Mock external APIs** — Intercept HTTP calls for consistent, fast tests
- **Minimize test interdependency** — Each test should be independent
- **Remove flakiness** — Use proper waits, avoid hard sleeps
- **Run in CI/CD** — Catch regressions before production

---

## Testing Best Practices

### Naming Conventions

```javascript
// ✅ Good: Describes the behavior
describe('TaskForm', () => {
  it('should display error when title is missing', () => {});
  it('should add task and clear form on successful submission', () => {});
});

// ❌ Bad: Too vague
describe('TaskForm', () => {
  it('works', () => {});
  it('test submit', () => {});
});
```

### Test Organization

```
src/
├── components/
│   ├── TaskForm.jsx
│   └── __tests__/
│       ├── TaskForm.test.js (unit)
│       ├── TaskForm.integration.test.js (integration)
│       └── TaskForm.a11y.test.js (accessibility)
├── hooks/
│   ├── useTasks.js
│   └── __tests__/
│       └── useTasks.test.js
└── utils/
    ├── taskParser.js
    └── __tests__/
        └── taskParser.test.js
```

### Test Data & Fixtures

```javascript
// src/__tests__/fixtures/tasks.js
export const mockTasks = [
  {
    id: '1',
    title: 'Buy milk',
    description: 'Whole milk',
    dueDate: '2026-04-15',
    priority: 'high',
    completed: false
  },
  {
    id: '2',
    title: 'Finish report',
    description: '',
    dueDate: '2026-04-20',
    priority: 'default',
    completed: false
  }
];

// Usage
import { mockTasks } from './fixtures/tasks';

describe('TaskList', () => {
  it('should render tasks', () => {
    render(<TaskList tasks={mockTasks} />);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });
});
```

### Test Utilities & Helpers

```javascript
// src/__tests__/utils.js
import { render } from '@testing-library/react';
import { TaskProvider } from '../context/TaskContext';

export const renderWithTaskProvider = (component) => {
  return render(<TaskProvider>{component}</TaskProvider>);
};

// Usage
import { renderWithTaskProvider } from './utils';

describe('TaskForm', () => {
  it('should add task', () => {
    renderWithTaskProvider(<TaskForm />);
    // Test...
  });
});
```

### Coverage Target

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js'
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    },
    // Lower thresholds for utility files, higher for components
    './src/components/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## Testing in CI/CD

### Pre-commit Hooks

Use Husky to run tests before commits:

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run test:unit -- --bail --findRelatedTests
```

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - run: npm run test:a11y
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### NPM Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern='\\.test\\.js$'",
    "test:integration": "jest --testPathPattern='\\.integration\\.test\\.js$'",
    "test:a11y": "jest --testPathPattern='\\.a11y\\.test\\.js$'",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

---

## Testing Pyramid

```
       E2E Tests (5-10%)
         / \
        /   \
       /     \
   Integration (15-20%)
      /     \
     /       \
    /         \
Unit Tests (70-75%)
```

- **Unit Tests** (70–75%): Fast, isolated, cover edge cases
- **Integration Tests** (15–20%): Component interactions, API integration
- **E2E Tests** (5–10%): Critical user workflows only

---

## Common Pitfalls to Avoid

- ❌ Testing implementation details (mocking React internals)
- ❌ Using `data-testid` everywhere (reduces accessibility queries)
- ❌ Over-mocking (e.g., mocking implementation of a simple component)
- ❌ Flaky async tests (use `waitFor`, not `setTimeout`)
- ❌ Testing framework error messages instead of user-facing behavior
- ❌ 100% coverage target (focus on critical paths)
- ❌ Slow E2E tests (mock external APIs, minimize database hits)

---

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Trophies (Kent C. Dodds)](https://kentcdodds.com/blog/the-testing-trophy-comprehensive-testing-strategies-for-real-world-applications)
- [WCAG 2.1 Testing Guide](https://www.w3.org/WAI/test-evaluate/)
- [jest-axe](https://github.com/nickcolley/jest-axe)
- [Cypress Documentation](https://docs.cypress.io/)

---

## Checklist for Implementation

- [ ] Unit tests for utilities and custom hooks (target 75%+ coverage)
- [ ] Integration tests for core user workflows (add, edit, complete, delete)
- [ ] E2E tests for critical paths (task cycle, error handling)
- [ ] Accessibility tests using jest-axe and manual testing
- [ ] Keyboard navigation tests for all interactive elements
- [ ] Screen reader testing (VoiceOver, TalkBack, NVDA)
- [ ] Mock Service Worker setup for API testing
- [ ] Pre-commit hooks configured (Husky)
- [ ] CI/CD pipeline testing all test suites
- [ ] Code coverage reports generated and tracked
- [ ] Team trained on testing best practices
