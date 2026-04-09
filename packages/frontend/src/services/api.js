/**
 * API Service Layer - Handles all communication with the backend
 * Uses fetch API with error handling and typed errors
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3030';

/**
 * Custom error types for better error handling in components
 */
class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServerError';
  }
}

/**
 * Handle API response and throw appropriate errors
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} Parsed JSON response
 * @throws {ValidationError|NotFoundError|ServerError|NetworkError}
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    throw new NetworkError('Failed to parse response');
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new ValidationError(data.error || 'Validation failed', data.details);
    }
    if (response.status === 404) {
      throw new NotFoundError(data.error || 'Not found');
    }
    if (response.status >= 500) {
      throw new ServerError(data.error || 'Server error');
    }
    throw new Error(data.error || `HTTP Error ${response.status}`);
  }

  return data;
}

/**
 * Safe fetch wrapper with timeout and error handling
 * @param {string} url - URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function safeFetch(url, options = {}) {
  const timeout = options.timeout || 10000; // 10s default
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return await handleResponse(response);
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new NetworkError('Request timeout');
    }

    if (error instanceof ValidationError || error instanceof NotFoundError || error instanceof ServerError) {
      throw error;
    }

    throw new NetworkError(error.message || 'Network error');
  }
}

/**
 * GET /api/tasks?date=YYYY-MM-DD
 * Fetch tasks for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} Array of tasks
 */
export async function fetchTasksForDate(date) {
  return safeFetch(`${API_BASE_URL}/api/tasks?date=${date}`);
}

/**
 * GET /api/tasks/:id
 * Fetch a single task by ID
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Task object
 */
export async function fetchTaskById(id) {
  return safeFetch(`${API_BASE_URL}/api/tasks/${id}`);
}

/**
 * GET /api/tasks
 * Fetch all tasks (no date filter)
 * @returns {Promise<Array>} All tasks
 */
export async function fetchAllTasks() {
  return safeFetch(`${API_BASE_URL}/api/tasks`);
}

/**
 * POST /api/tasks
 * Create a new task
 * @param {Object} taskData - Task data { title, description, date, time, status }
 * @returns {Promise<Object>} Created task
 */
export async function createTask(taskData) {
  return safeFetch(`${API_BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });
}

/**
 * PUT /api/tasks/:id
 * Update an existing task
 * @param {number} id - Task ID
 * @param {Object} updateData - Fields to update (partial)
 * @returns {Promise<Object>} Updated task
 */
export async function updateTask(id, updateData) {
  return safeFetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  });
}

/**
 * PUT /api/tasks/:id (status only)
 * Quick update of task status
 * @param {number} id - Task ID
 * @param {string} status - New status (pending/completed/missed)
 * @returns {Promise<Object>} Updated task
 */
export async function updateTaskStatus(id, status) {
  return updateTask(id, { status });
}

/**
 * DELETE /api/tasks/:id
 * Delete a task
 * @param {number} id - Task ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteTask(id) {
  return safeFetch(`${API_BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE'
  });
}

// Export error classes for handling in components
export { NetworkError, ValidationError, NotFoundError, ServerError };
