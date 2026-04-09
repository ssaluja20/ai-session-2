# TODO App Coding Guidelines

## Overview

These guidelines establish consistent coding practices, structure, and patterns for the TODO app. Following these standards ensures code is maintainable, readable, and scalable. Guidelines apply to JavaScript/React code unless otherwise noted.

**Key principles**: Clarity > cleverness, consistency > convenience, pragmatism > perfection.

---

## Naming Conventions & Formatting

### Variables & Constants

```javascript
// ✅ Good: Descriptive, camelCase
const maxTasksPerDay = 50;
let isTaskCompleted = false;
const userPreferences = {};

// ❌ Bad: Unclear abbreviations, single letters
const mTPD = 50;
const x = false;
const prefs = {};

// ✅ Boolean predicates: `is*`, `has*`, `can*`, `should*`
const isLoading = true;
const hasErrors = false;
const canDelete = true;
const shouldRetry = false;
```

### Functions & Methods

```javascript
// ✅ Good: Verb-first naming, describes action
function fetchTasks() {}
function formatDueDate(date) {}
function calculatePriority(dueDate, importance) {}

// ❌ Bad: Noun-first or ambiguous
function taskFetcher() {}
function dateFix(date) {}
function priority(d, i) {}

// ✅ Event handlers: `handle*` prefix
function handleTaskClick() {}
function handleFormSubmit(event) {}

// ✅ Async functions: Consider `async` prefix for clarity
async function asyncFetchTasks() {}
// Or just: async function fetchTasks() {} // already clear it's async
```

### Components

```javascript
// ✅ Good: PascalCase, descriptive name, function declaration or arrow function
export function TaskForm() {}
export function TaskList() {}
export const TaskCard = () => {};

// ❌ Bad: camelCase, ambiguous, exports inconsistently
export function taskForm() {}
const taskList = () => {};
```

### Constants & Enums

```javascript
// ✅ Good: UPPER_SNAKE_CASE for module-level constants
const MAX_TASK_LENGTH = 255;
const API_TIMEOUT_MS = 5000;
const PRIORITY_LEVELS = {
  HIGH: 'high',
  DEFAULT: 'default',
  LOW: 'low'
};

// ✅ Object keys: camelCase, not UPPER_CASE (unless exported constant object)
const config = {
  apiUrl: 'https://api.example.com',
  debugMode: false,
  retryCount: 3
};

// ❌ Bad: Inconsistent casing
const max_task_length = 255;
const PriorityLevels = { HIGH: 'HIGH', ... };
```

### File Names

```
// ✅ Good: Descriptive, kebab-case for multi-word components
TaskForm.jsx
TaskList.jsx
TaskCard.jsx
useTaskData.js
taskParser.js
priorityCalculator.js

// ❌ Bad: Ambiguous, PascalCase for files (inconsistent with imports)
TF.jsx
tasks.jsx
util.js
helper.js
```

### Comments & Annotations

```javascript
// ✅ Good: Explain *why*, not *what*
// Retry failed tasks after exponential backoff to avoid overwhelming the server
async function retryFailedTasks() {}

// ✅ Use JSDoc for public functions and components
/**
 * Formats a due date for display in the UI.
 * @param {Date} date - The date to format
 * @param {string} format - Format string (e.g., 'short', 'long')
 * @returns {string} Formatted date string
 */
function formatDueDate(date, format = 'short') {}

// ❌ Bad: State the obvious
// Set isLoading to true
setIsLoading(true);

// ❌ Bad: No explanation of intent
// Remove old tasks
tasks = tasks.filter(t => t.createdAt > Date.now() - 86400000);
```

### Code Formatting

- **Indentation**: 2 spaces (or 4, but consistent)
- **Line length**: 80–100 characters (Prettier default: 80)
- **Semicolons**: Use them (Prettier default)
- **Quotes**: Single quotes for strings (Prettier: single)
- **Trailing commas**: Yes, in multi-line objects/arrays (Prettier: es5)

```javascript
// ✅ Good: Prettier-formatted
const taskData = {
  id: '1',
  title: 'Buy milk',
  dueDate: '2026-04-15',
};

const longList = [
  'item-one',
  'item-two',
  'item-three',
];

// ❌ Bad: Inconsistent formatting
const taskData = {id:'1', title: 'Buy milk',dueDate:"2026-04-15"}
const longList = ['item-one','item-two','item-three']
```

---

## Project Structure & Organization

### Folder Structure

```
src/
├── index.js                 # App entry point
├── App.jsx                  # Root component
├── App.css                  # Global styles (or use CSS-in-JS)
├── components/
│   ├── TaskForm/
│   │   ├── TaskForm.jsx     # Component
│   │   ├── TaskForm.module.css  # Scoped styles
│   │   └── TaskForm.test.js # Tests
│   ├── TaskList/
│   │   ├── TaskList.jsx
│   │   ├── TaskList.module.css
│   │   └── TaskList.test.js
│   └── common/              # Shared UI components
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Modal.jsx
├── hooks/
│   ├── useTasks.js          # Custom hook for task state
│   ├── useFetch.js          # Generic fetch hook
│   └── useLocalStorage.js   # Persistence hook
├── context/
│   └── TaskContext.jsx      # Global state (if using Context API)
├── services/
│   ├── api.js               # API calls
│   ├── storage.js           # Local storage helpers
│   └── logger.js            # Logging utilities
├── utils/
│   ├── taskParser.js        # Data transformations
│   ├── validators.js        # Input validation
│   └── dateHelpers.js       # Date utilities
├── constants/
│   ├── priorities.js        # Task priorities
│   ├── categories.js        # Task categories
│   └── messages.js          # User messages & errors
├── __tests__/               # Shared test utilities & fixtures
│   ├── fixtures/
│   │   └── tasks.js
│   └── utils.js
└── types/                   # TypeScript types (if using TS)
    └── task.ts

public/
├── index.html
└── favicon.ico

docs/                        # Project documentation
├── project-overview.md
├── functional-requirements.md
├── ui-guidelines.md
├── testing-guidelines.md
├── coding-guidelines.md
└── api.md                   # API documentation

.github/
├── workflows/
│   └── ci.yml               # CI/CD pipeline
└── copilot-instructions.md
```

### Module Organization

**One component per file.** Keep components focused and single-purpose.

```javascript
// ✅ Good: Component in its own file
// src/components/TaskForm/TaskForm.jsx
export function TaskForm() {
  return <form>{/* ... */}</form>;
}

// ❌ Bad: Multiple components in one file
// src/components/Tasks.jsx
function TaskForm() {}
function TaskList() {}
function TaskCard() {}
```

**Co-locate styles with components** (when using CSS Modules or scoped styling):

```
TaskForm/
├── TaskForm.jsx
└── TaskForm.module.css
```

**Shared utilities go to `utils/`** or `services/`:

```javascript
// ✅ src/utils/dateHelpers.js — Pure utilities
export function formatDate(date) { /* ... */ }
export function isOverdue(date) { /* ... */ }

// ✅ src/services/api.js — Side effects, external communication
export async function fetchTasks() { /* ... */ }
```

---

## Component & Code Patterns

### Component Structure

```javascript
// ✅ Good: Clear, organized structure
import { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { useTaskData } from '../../hooks/useTaskData';
import styles from './TaskForm.module.css';

export function TaskForm({ onTaskAdded }) {
  // 1. Hooks (state, effects, custom hooks)
  const [formData, setFormData] = useState({ title: '', priority: 'default' });
  const [errors, setErrors] = useState({});
  const { addTask, isLoading } = useTaskData();

  // 2. Effects
  useEffect(() => {
    // Cleanup or setup logic
  }, []);

  // 3. Event handlers
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    try {
      await addTask(formData);
      onTaskAdded?.();
      setFormData({ title: '', priority: 'default' });
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  // 4. Conditional early returns (not deeply nested)
  if (isLoading) return <div>Loading...</div>;
  
  // 5. JSX
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        aria-label="Task name"
      />
      {errors.title && <span className={styles.error}>{errors.title}</span>}
      <Button type="submit">Add Task</Button>
    </form>
  );
}
```

### Custom Hooks

```javascript
// ✅ Good: Custom hook for reusable logic
import { useState, useCallback } from 'react';
import { fetchTasks, createTask, deleteTask } from '../services/api';

export function useTaskData() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const removeTask = useCallback(async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { tasks, isLoading, error, loadTasks, addTask, removeTask };
}
```

### Stateless Components (Presentational)

```javascript
// ✅ Good: Pure, reusable presentation component
export function TaskCard({ task, onEdit, onDelete }) {
  return (
    <div className={styles.card}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className={styles.actions}>
        <button onClick={() => onEdit(task.id)}>Edit</button>
        <button onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  );
}

// Usage
<TaskCard
  task={taskData}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Higher-Order Components (if needed)

```javascript
// ✅ Good: HOC for prop injection or feature wrapping
function withTaskProvider(Component) {
  return function WrappedComponent(props) {
    const taskData = useTaskData();
    return <Component {...props} {...taskData} />;
  };
}

export const TaskListWithProvider = withTaskProvider(TaskList);
```

---

## State Management Practices

### Local State (useState)

Use for **component-level state**:

```javascript
// ✅ Good: Local form state
const [formData, setFormData] = useState({ title: '', priority: 'default' });
```

**Guidelines:**
- Use separate state variables for independent concerns
- Group related state
- Avoid deeply nested state objects

```javascript
// ✅ Separate concerns
const [title, setTitle] = useState('');
const [priority, setPriority] = useState('default');

// ❌ Avoid excessive nesting
const [formState, setFormState] = useState({
  form: {
    task: {
      title: '',
      metadata: { priority: 'default' }
    }
  }
});
```

### Derived State

**Avoid storing derived state; compute it instead:**

```javascript
// ❌ Bad: Stores duplicate state
const [tasks, setTasks] = useState([]);
const [completedCount, setCompletedCount] = useState(0);
// Now must sync manually when tasks change

// ✅ Good: Compute when needed
const [tasks, setTasks] = useState([]);
const completedCount = tasks.filter(t => t.completed).length;
```

### Global State (Context API)

Use **Context** for:
- Theme/UI settings
- User authentication
- Global app settings

```javascript
// ✅ src/context/TaskContext.jsx
import { createContext, useState, useCallback } from 'react';

export const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ priority: 'all', completed: 'all' });

  const addTask = useCallback((task) => {
    setTasks(prev => [...prev, { id: Date.now(), ...task }]);
  }, []);

  const value = { tasks, filters, addTask, setFilters };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

// ✅ Custom hook for consuming context
export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
}

// Usage
<TaskProvider>
  <App />
</TaskProvider>

// In component
const { tasks, addTask } = useTasks();
```

### Side Effects (useEffect)

```javascript
// ✅ Good: Clear dependency array, cleanup function
useEffect(() => {
  const timer = setTimeout(() => {
    console.log('Task reminder');
  }, 5000);

  return () => clearTimeout(timer);
}, [taskId]);

// ✅ Multiple effects for different concerns
useEffect(() => {
  loadTasks();
}, []);

useEffect(() => {
  saveToLocalStorage(tasks);
}, [tasks]);

// ❌ Avoid: Missing dependencies
useEffect(() => {
  loadTasks(taskId); // taskId used but not in dependencies
}, []);

// ❌ Avoid: God useEffect
useEffect(() => {
  // Loading, filtering, sorting, saving all in one effect
  loadTasks();
  const filtered = tasks.filter(...);
  const sorted = filtered.sort(...);
  setDisplayedTasks(sorted);
  saveToLocalStorage(sorted);
}, [tasks, filter, sort]);
```

---

## Error Handling & Debugging

### Try-Catch Blocks

```javascript
// ✅ Good: Specific error handling
async function fetchUserTasks(userId) {
  try {
    const tasks = await api.get(`/users/${userId}/tasks`);
    return tasks;
  } catch (error) {
    if (error.status === 404) {
      console.warn(`User ${userId} not found`);
      return [];
    }
    if (error.status === 401) {
      // Handle unauthorized
      redirectToLogin();
      return null;
    }
    // Generic error
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }
}

// ❌ Bad: Swallowing errors silently
async function fetchUserTasks(userId) {
  try {
    return await api.get(`/users/${userId}/tasks`);
  } catch (error) {
    console.log('error'); // Too vague
    return [];
  }
}
```

### Error States in Components

```javascript
// ✅ Good: Handle loading, error, and success states
function TaskList() {
  const { tasks, isLoading, error, loadTasks } = useTaskData();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <ErrorBoundary>
        <p>Failed to load tasks: {error}</p>
        <button onClick={loadTasks}>Retry</button>
      </ErrorBoundary>
    );
  }

  if (tasks.length === 0) {
    return <EmptyState message="No tasks yet" />;
  }

  return <div>{tasks.map(t => <TaskCard key={t.id} task={t} />)}</div>;
}
```

### Validation

```javascript
// ✅ Good: Validate at system boundaries (user input, API responses)
function validateTask(task) {
  const errors = {};

  if (!task.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (task.title?.length > 255) {
    errors.title = 'Title must be under 255 characters';
  }

  if (task.dueDate && new Date(task.dueDate) < new Date()) {
    errors.dueDate = 'Due date cannot be in the past';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Usage
const form = { title: '', priority: 'default' };
const { isValid, errors } = validateTask(form);
if (!isValid) {
  setErrors(errors);
  return;
}
```

### Logging

```javascript
// ✅ Good: Structured logging with context
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
};

// Usage
logger.info('Task created', { taskId, title });
logger.error('Failed to fetch tasks', error);

// ❌ Bad: Inconsistent logging
console.log('task added');
console.log('ERROR: ' + error);
console.error('err', err);
```

### Error Boundaries

```javascript
// ✅ Good: Catch React errors at component level
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React error caught', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Debugging Tips

```javascript
// ✅ Good: Use React DevTools, console.log with context
console.log('Task state:', { task, isLoading, error });

// ✅ Use debugger
debugger; // Pauses execution in dev tools

// ✅ Use React DevTools Profiler to find performance issues

// ❌ Avoid: Leaving console.log in production code
console.log('Task:', task); // Remove before committing
```

---

## Performance Considerations

### Memoization

```javascript
// ✅ useMemo: Memoize expensive computations
const completedCount = useMemo(() => {
  return tasks.filter(t => t.completed).length;
}, [tasks]);

// ✅ useCallback: Memoize callback functions passed to child components
const handleDelete = useCallback((taskId) => {
  removeTask(taskId);
}, [removeTask]);

// ❌ Over-memoization: Memoize simple values
const count = useMemo(() => tasks.length, [tasks]); // Unnecessary
```

### React.memo for Presentational Components

```javascript
// ✅ Memoize pure components that receive many props
export const TaskCard = React.memo(function TaskCard({ task, onEdit, onDelete }) {
  return <div>{/* ... */}</div>;
});

// Or with custom comparison
export const TaskCard = React.memo(
  function TaskCard({ task, onEdit, onDelete }) {
    return <div>{/* ... */}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.task.id === nextProps.task.id;
  }
);
```

### List Rendering

```javascript
// ✅ Good: Use stable keys (IDs, not indices)
{tasks.map(task => (
  <TaskCard key={task.id} task={task} />
))}

// ❌ Bad: Using index as key (causes issues when reordering)
{tasks.map((task, index) => (
  <TaskCard key={index} task={task} />
))}

// ✅ Lazy load large lists
const VirtualList = ({ items }) => {
  // Use react-window for performance
};
```

---

## Common Patterns & Anti-Patterns

### Props Drilling

```javascript
// ❌ Bad: Props drilling through multiple levels
<App tasks={tasks} onTaskDelete={handleDelete} onTaskEdit={handleEdit} />
  <TaskPanel tasks={tasks} onTaskDelete={handleDelete} onTaskEdit={handleEdit} />
    <TaskList tasks={tasks} onTaskDelete={handleDelete} onTaskEdit={handleEdit} />
      <TaskCard task={task} onDelete={onTaskDelete} onEdit={onTaskEdit} />

// ✅ Good: Use Context for data that many components need
<TaskProvider>
  <App />
</TaskProvider>

// In component
const { tasks, onTaskDelete, onTaskEdit } = useTasks();
```

### Inline Functions

```javascript
// ❌ Bad: Creates new function on every render
<button onClick={() => handleDelete(taskId)}>Delete</button>

// ✅ Good: Use useCallback for passed callbacks
const handleDeleteClick = useCallback(() => {
  handleDelete(taskId);
}, [taskId, handleDelete]);

<button onClick={handleDeleteClick}>Delete</button>
```

### Conditional Rendering

```javascript
// ✅ Good: Early returns, clear logic
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (tasks.length === 0) return <EmptyState />;

return <TaskList tasks={tasks} />;

// ✅ Or use ternary for simple conditionals
{isLoading ? <LoadingSpinner /> : <TaskList />}

// ❌ Bad: Nested ternaries (too complex)
{isLoading ? <LoadingSpinner /> : error ? <ErrorMessage /> : <TaskList />}

// ❌ Bad: Using && with side effects
{tasks.length && <TaskList />} // Fine for rendering
{isLoading && setShowSpinner(true)} // Don't use for side effects
```

---

## Documentation Standards

### JSDoc for Functions

```javascript
/**
 * Formats a task due date for display.
 * 
 * @param {Date} date - The due date
 * @param {string} [format='short'] - Format type: 'short', 'long', 'relative'
 * @returns {string} Formatted date string
 * @throws {TypeError} If date is not a Date object
 * 
 * @example
 * formatDueDate(new Date('2026-04-15'), 'short');
 * // Returns: 'Apr 15'
 */
export function formatDueDate(date, format = 'short') {
  // ...
}
```

### Component Props Documentation

```javascript
/**
 * Displays a single task with edit and delete actions.
 * 
 * @component
 * @param {Object} props
 * @param {Task} props.task - The task object
 * @param {string} props.task.id - Unique task ID
 * @param {string} props.task.title - Task title
 * @param {boolean} props.task.completed - Completion status
 * @param {Function} props.onEdit - Callback when edit button clicked
 * @param {Function} props.onDelete - Callback when delete button clicked
 * 
 * @returns {JSX.Element} The rendered task card
 * 
 * @example
 * <TaskCard
 *   task={{ id: '1', title: 'Buy milk', completed: false }}
 *   onEdit={(id) => console.log('Edit:', id)}
 *   onDelete={(id) => console.log('Delete:', id)}
 * />
 */
export function TaskCard({ task, onEdit, onDelete }) {
  // ...
}
```

### Inline Comments

```javascript
// ✅ Good: Explain *why*, not *what*
// Wait 500ms to debounce rapid task updates
setTimeout(() => saveTasks(), 500);

// ✅ Explain non-obvious logic
// Filter tasks created in last 7 days to avoid API rate limits
const recentTasks = tasks.filter(t => Date.now() - t.createdAt < 7 * 86400000);

// ❌ Bad: Restates code
// I'm incrementing i
i++;

// ❌ Bad: Outdated comments become lies
// This fixes the task ordering bug (bug was fixed 6 months ago)
tasks.sort((a, b) => a.priority - b.priority);
```

---

## Code Review Checklist

Before submitting code for review, check:

- [ ] **Naming**: Variables/functions clearly named
- [ ] **Structure**: Follows folder organization
- [ ] **Components**: Focused, single-purpose, reusable
- [ ] **State**: Appropriate use of hooks and Context
- [ ] **Effects**: Dependencies correct, cleanup functions present
- [ ] **Error handling**: Try-catch, validation, error states
- [ ] **Tests**: Unit and integration tests pass
- [ ] **Accessibility**: ARIA labels, keyboard navigation
- [ ] **Performance**: No unnecessary re-renders, proper memoization
- [ ] **Documentation**: JSDoc comments, clear commit messages
- [ ] **Linting**: No ESLint errors or warnings
- [ ] **Type safety**: Types/interfaces clear (if using TypeScript)

---

## Tools & Configuration

### ESLint

```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'eqeqeq': 'error', // Always use === or !==
    'react/prop-types': 'off', // If using JSDoc or TypeScript
  },
};
```

### Prettier

```json
// .prettierrc.json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 80,
  "tabWidth": 2
}
```

### Pre-commit Hook (Husky + Lint-Staged)

```bash
# .husky/pre-commit
npm run lint:staged
npm run test:unit -- --bail --findRelatedTests
```

---

## References

- [React Documentation](https://react.dev/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)
- [Clean Code Principles](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Kent C. Dodds - React Best Practices](https://kentcdodds.com/)

---

## Checklist for Implementation

- [ ] ESLint configured with project rules
- [ ] Prettier configured for consistent formatting
- [ ] Husky hooks setup for pre-commit linting/testing
- [ ] Component structure followed across project
- [ ] Custom hooks created for reusable logic
- [ ] Context API used for global state (if applicable)
- [ ] Error handling implemented at component and API levels
- [ ] JSDoc comments added to public functions/components
- [ ] Code review guidelines documented
- [ ] Team trained on coding standards
