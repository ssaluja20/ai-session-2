# TODO App Backend - Implementation Guide

## Overview

RESTful API built with Express.js for managing daily tasks with full CRUD operations, validation, and error handling.

## Architecture

### Project Structure

```
src/
├── app.js                    # Express app setup, routes, middleware
├── db.js                     # Database schema, initialization, seeding
├── validators.js             # Input validation functions
└── services/
    └── taskService.js        # Business logic, database operations

__tests__/
├── app.test.js              # Legacy items API tests
└── tasks.test.js            # New tasks API comprehensive tests

public/
└── index.html               # HTML entry point

jest.config.js               # Jest testing configuration
package.json                 # Dependencies and scripts
```

## Database Schema

### tasks Table

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK(status IN ('pending', 'completed', 'missed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_date_time ON tasks(date, time);
```

## API Endpoints

### New Tasks API

#### GET /api/tasks
Fetch all tasks or tasks for a specific date

**Query Parameters:**
- `date` (optional): YYYY-MM-DD format to filter tasks for that day

**Response:**
```json
[
  {
    "id": 1,
    "title": "Morning standup",
    "description": "Team sync meeting",
    "date": "2026-04-09",
    "time": "09:00",
    "status": "pending",
    "created_at": "2026-04-09T08:00:00Z",
    "updated_at": "2026-04-09T08:00:00Z"
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### GET /api/tasks/:id
Fetch a single task by ID

**Response:**
```json
{
  "id": 1,
  "title": "Morning standup",
  ...
}
```

**Status Codes:**
- 200: Success
- 400: Invalid ID format
- 404: Task not found
- 500: Server error

#### POST /api/tasks
Create a new task

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "date": "2026-04-10",
  "time": "14:30",
  "status": "pending"
}
```

**Validation:**
- `title`: Required, non-empty, max 255 chars
- `description`: Optional, max 1000 chars
- `date`: Required, YYYY-MM-DD format
- `time`: Required, HH:MM format (00:00-23:59)
- `status`: Optional, enum (pending/completed/missed)

**Response:**
```json
{
  "id": 6,
  "title": "Buy groceries",
  ...
}
```

**Status Codes:**
- 201: Created
- 400: Validation error
- 500: Server error

#### PUT /api/tasks/:id
Update an existing task (partial updates supported)

**Request Body:**
```json
{
  "status": "completed",
  "time": "15:00"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Morning standup",
  "status": "completed",
  ...
}
```

**Status Codes:**
- 200: Updated
- 400: Validation error
- 404: Task not found
- 500: Server error

#### DELETE /api/tasks/:id
Delete a task

**Response:**
```json
{
  "message": "Task deleted successfully",
  "id": 1
}
```

**Status Codes:**
- 200: Deleted
- 400: Invalid ID format
- 404: Task not found
- 500: Server error

### Legacy Items API (Backward Compatibility)

- `GET /api/items` → Returns tasks with legacy format
- `POST /api/items` → Creates task with name→title mapping
- `DELETE /api/items/:id` → Deletes task

## Running the Server

### Prerequisites

- Node.js 16+ installed
- npm installed

### Start Development Server

```bash
cd packages/backend
npm start
```

Server runs on `http://localhost:3030` with auto-restart on file changes (nodemon).

### Run Tests

```bash
npm test
```

Runs all test suites and generates coverage report.

**Test Coverage:**
- 37 tests, 82.85% line coverage
- Tests all endpoints, validation, error cases
- Uses Supertest for HTTP testing
- MSW mocking disabled in tests (real in-memory DB)

### Health Check

```bash
curl http://localhost:3030
```

Response:
```json
{
  "status": "ok",
  "message": "Backend server is running"
}
```

## Service Layer

### taskService.js Functions

#### getAllTasksForDate(db, date)
Query all tasks for a specific date, sorted by time ascending.

#### getTaskById(db, id)
Retrieve a single task by ID.

#### createTask(db, taskData)
Insert a new task with validation.

#### updateTask(db, id, updateData)
Update task fields (partial updates supported), refresh updated_at timestamp.

#### updateTaskStatus(db, id, status)
Quick update for status field only.

#### deleteTask(db, id)
Delete a task, return false if not found.

#### getTasksByStatus(db, status)
Filter tasks by status (pending/completed/missed).

#### getAllTasks(db)
Retrieve all tasks ordered by date and time.

## Validation

### validators.js Functions

#### validateTaskCreate(data)
Comprehensive validation for task creation. Returns `{ isValid, errors }`.

**Validates:**
- title: Required, non-empty string, max 255 chars
- date: Required, YYYY-MM-DD format
- time: Required, HH:MM format
- status: Optional, enum check
- description: Optional, max 1000 chars

#### validateTaskUpdate(data)
Partial validation for updates (allows missing  fields).

#### validateStatus(status)
Check if status is valid enum value.

#### isValidDateFormat(dateStr)
Check YYYY-MM-DD format.

#### isValidTimeFormat(timeStr)
Check HH:MM format (00:00-23:59).

#### isValidStatus(status)
Check valid enum values.

## Error Handling

### Response Formats

**Validation Error (400):**
```json
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required and must be a string",
    "time": "Time must be in HH:MM format"
  }
}
```

**Not Found (404):**
```json
{
  "error": "Task not found"
}
```

**Server Error (500):**
```json
{
  "error": "Failed to create task"
}
```

### Error Propagation

- All routes wrapped in try-catch
- Errors logged to console
- User-friendly messages in responses
- Validation errors include detailed `details` object

## Middleware

- **CORS**: Cross-origin requests enabled
- **express.json()**: Parse JSON request bodies
- **morgan()**: HTTP request logging (dev mode)

## Database

### In-Memory SQLite (better-sqlite3)

- Fast, synchronous database operations
- No external dependencies
- Perfect for development and testing
- Data cleared on server restart

### Seeding

5 sample tasks created on startup:
- Today: Morning standup (completed), Code review (pending), Update docs (completed)
- Tomorrow: Project planning (pending)
- After tomorrow: Team retrospective (pending)

## Performance

### Indexes

- `idx_tasks_date`: Fast filtering by date (used in GET /api/tasks?date=)
- `idx_tasks_status`: Fast filtering by status
- `idx_tasks_date_time`: Composite index for sorted queries

### Query Optimization

- Tasks automatically sorted by time in service layer
- Single query per operation (no N+1 queries)
- Prepared statements for safety and performance

## Testing

### Test Structure

**app.test.js** (9 tests):
- Legacy /api/items endpoints
- Backward compatibility validation

**tasks.test.js** (28 tests):
- GET /api/tasks (all, by date, empty results)
- GET /api/tasks/:id (success, not found, invalid ID)
- POST /api/tasks (creation, validation errors)
- PUT /api/tasks/:id (update, partial updates, validation)
- DELETE /api/tasks/:id (delete, not found, invalid ID)
- Backward compatibility tests

### Coverage

```
app.js             83.17% statements
validators.js      74.19% statements
taskService.js     86.11% statements
Overall            82.85% statements
```

## Environment Variables

None required for development (uses in-memory SQLite and default port 3030).

For production-like setups, add to `.env`:
```env
PORT=3030
DB_PATH=./tasks.db
NODE_ENV=development
```

## Monitoring & Logging

- Morgan middleware logs all HTTP requests
- Errors logged to console with context
- No external logging service configured (can be added)

## Future Enhancements

- **Phase 2**: Real database (PostgreSQL, MongoDB)
- **Phase 2**: Authentication & authorization
- **Phase 2**: User accounts and multi-tenancy
- **Phase 3**: WebSocket for real-time updates
- **Phase 3**: Batch operations
- **Phase 4**: GraphQL API alongside REST

## Troubleshooting

### Port already in use?
```bash
# Kill process on port 3030
lsof -i :3030
kill -9 <PID>
```

### Tests failing?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests with verbose output
npm test -- --verbose
```

### Database inconsistencies?
- Data is in-memory, server restart clears everything
- Check test fixtures if data seems wrong

## References

- [Express.js Documentation](https://expressjs.com/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Supertest](https://github.com/visionmedia/supertest)
- [Jest Testing](https://jestjs.io/)
