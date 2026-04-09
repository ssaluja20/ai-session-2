const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initializeDatabase, seedInitialData } = require('./db');
const taskService = require('./services/taskService');
const { validateTaskCreate, validateTaskUpdate, isValidStatus } = require('./validators');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database and seed data
const db = initializeDatabase();
seedInitialData(db);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// ============================================
// Tasks API Routes
// ============================================

/**
 * GET /api/tasks?date=YYYY-MM-DD
 * Fetch all tasks for a specific date, sorted by time
 */
app.get('/api/tasks', (req, res) => {
  try {
    const { date } = req.query;

    // If date provided, fetch tasks for that date
    if (date) {
      const tasks = taskService.getAllTasksForDate(db, date);
      return res.json(tasks);
    }

    // Otherwise return all tasks
    const allTasks = taskService.getAllTasks(db);
    res.json(allTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/:id
 * Fetch a single task by ID
 */
app.get('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const task = taskService.getTaskById(db, parseInt(id));
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

/**
 * POST /api/tasks
 * Create a new task
 */
app.post('/api/tasks', (req, res) => {
  try {
    const { title, description, date, time, status } = req.body;

    // Validate input
    const validation = validateTaskCreate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    // Create task
    const newTask = taskService.createTask(db, {
      title: title.trim(),
      description: description ? description.trim() : '',
      date,
      time,
      status: status || 'pending'
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * PUT /api/tasks/:id
 * Update an existing task
 */
app.put('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    // Validate update data
    const validation = validateTaskUpdate(updateData);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    // Check if task exists
    const existingTask = taskService.getTaskById(db, parseInt(id));
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Clean up string fields
    const cleanedData = { ...updateData };
    if (cleanedData.title) cleanedData.title = cleanedData.title.trim();
    if (cleanedData.description) cleanedData.description = cleanedData.description.trim();

    // Update task
    const updatedTask = taskService.updateTask(db, parseInt(id), cleanedData);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    const success = taskService.deleteTask(db, parseInt(id));
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ============================================
// Legacy Items API Routes (for backward compatibility)
// ============================================

/**
 * GET /api/items
 * @deprecated Use /api/tasks instead
 */
app.get('/api/items', (req, res) => {
  try {
    // Return tasks as legacy items format
    const tasks = taskService.getAllTasks(db);
    const items = tasks.map(task => ({
      id: task.id,
      name: task.title,
      created_at: task.created_at
    }));
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

/**
 * POST /api/items
 * @deprecated Use /api/tasks instead
 */
app.post('/api/items', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const newTask = taskService.createTask(db, {
      title: name.trim(),
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '00:00',
      status: 'pending'
    });

    // Return as legacy format
    const item = {
      id: newTask.id,
      name: newTask.title,
      created_at: newTask.created_at
    };

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

/**
 * DELETE /api/items/:id
 * @deprecated Use /api/tasks/:id instead
 */
app.delete('/api/items/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid item ID is required' });
    }

    const success = taskService.deleteTask(db, parseInt(id));
    if (!success) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db };