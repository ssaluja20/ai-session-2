/**
 * Task service layer - handles all task-related database operations
 */

/**
 * Get all tasks for a specific date, sorted by time
 * @param {Database.Database} db - Database instance
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Array of tasks sorted by time
 */
function getAllTasksForDate(db, date) {
  const stmt = db.prepare(`
    SELECT * FROM tasks
    WHERE date = ?
    ORDER BY time ASC
  `);

  return stmt.all(date);
}

/**
 * Get a single task by ID
 * @param {Database.Database} db - Database instance
 * @param {number} id - Task ID
 * @returns {Object|null} Task object or null if not found
 */
function getTaskById(db, id) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  return stmt.get(id);
}

/**
 * Create a new task
 * @param {Database.Database} db - Database instance
 * @param {Object} taskData - Task data { title, description, date, time, status }
 * @returns {Object} Created task with ID
 */
function createTask(db, taskData) {
  const {
    title,
    description = '',
    date,
    time,
    status = 'pending'
  } = taskData;

  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, date, time, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(title, description, date, time, status);
  const createdTask = getTaskById(db, result.lastInsertRowid);

  return createdTask;
}

/**
 * Update an existing task
 * @param {Database.Database} db - Database instance
 * @param {number} id - Task ID
 * @param {Object} updateData - Fields to update (partial)
 * @returns {Object|null} Updated task or null if not found
 */
function updateTask(db, id, updateData) {
  // Check if task exists
  const existingTask = getTaskById(db, id);
  if (!existingTask) {
    return null;
  }

  // Build dynamic UPDATE query based on provided fields
  const allowedFields = ['title', 'description', 'date', 'time', 'status'];
  const fieldsToUpdate = Object.keys(updateData).filter(key => allowedFields.includes(key));

  if (fieldsToUpdate.length === 0) {
    return existingTask; // No fields to update
  }

  const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
  const values = fieldsToUpdate.map(field => updateData[field]);

  const stmt = db.prepare(`
    UPDATE tasks
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(...values, id);
  return getTaskById(db, id);
}

/**
 * Update task status quickly
 * @param {Database.Database} db - Database instance
 * @param {number} id - Task ID
 * @param {string} status - New status (pending, completed, missed)
 * @returns {Object|null} Updated task or null if not found
 */
function updateTaskStatus(db, id, status) {
  return updateTask(db, id, { status });
}

/**
 * Delete a task
 * @param {Database.Database} db - Database instance
 * @param {number} id - Task ID
 * @returns {boolean} True if deletion succeeded, false if task not found
 */
function deleteTask(db, id) {
  // Check if task exists
  const existingTask = getTaskById(db, id);
  if (!existingTask) {
    return false;
  }

  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);

  return result.changes > 0;
}

/**
 * Get tasks by status
 * @param {Database.Database} db - Database instance
 * @param {string} status - Status filter (pending, completed, missed)
 * @returns {Array} Array of tasks with specified status
 */
function getTasksByStatus(db, status) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE status = ? ORDER BY date ASC, time ASC');
  return stmt.all(status);
}

/**
 * Get all tasks (unfiltered)
 * @param {Database.Database} db - Database instance
 * @returns {Array} All tasks ordered by date and time
 */
function getAllTasks(db) {
  const stmt = db.prepare('SELECT * FROM tasks ORDER BY date ASC, time ASC');
  return stmt.all();
}

module.exports = {
  getAllTasksForDate,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTasksByStatus,
  getAllTasks
};
