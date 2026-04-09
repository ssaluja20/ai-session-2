/**
 * Custom hook for managing task state and API operations
 * Handles loading, error, and success states for all task operations
 */

import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { ValidationError, NotFoundError, NetworkError, ServerError } from '../services/api';
import { sortTasksByTime } from '../utils/dateHelpers';

/**
 * useTasks - Hook for managing tasks
 * @returns {Object} Task state and operation methods
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load tasks for a specific date from API
   * @param {string} date - Date in YYYY-MM-DD format
   */
  const loadTasksForDate = useCallback(async (date) => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedTasks = await api.fetchTasksForDate(date);
      // Sort tasks by time
      const sortedTasks = sortTasksByTime(fetchedTasks);
      setTasks(sortedTasks);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load all tasks from API
   */
  const loadAllTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedTasks = await api.fetchAllTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new task
   * @param {Object} taskData - Task data { title, description, date, time, status }
   * @returns {Promise<Object>} Created task
   */
  const createTask = useCallback(async (taskData) => {
    setError(null);

    try {
      const newTask = await api.createTask(taskData);
      // Add to local state and re-sort if same date
      setTasks(prevTasks => {
        const updated = [...prevTasks, newTask];
        return sortTasksByTime(updated);
      });
      return newTask;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Update an existing task
   * @param {number} id - Task ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated task
   */
  const updateTask = useCallback(async (id, updateData) => {
    setError(null);

    try {
      const updatedTask = await api.updateTask(id, updateData);
      // Update in local state
      setTasks(prevTasks => {
        const updated = prevTasks.map(t => t.id === id ? updatedTask : t);
        return sortTasksByTime(updated);
      });
      return updatedTask;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Update only task status
   * @param {number} id - Task ID
   * @param {string} status - New status (pending/completed/missed)
   * @returns {Promise<Object>} Updated task
   */
  const updateTaskStatus = useCallback(async (id, status) => {
    return updateTask(id, { status });
  }, [updateTask]);

  /**
   * Delete a task
   * @param {number} id - Task ID
   * @returns {Promise<Object>} Success response
   */
  const deleteTask = useCallback(async (id) => {
    setError(null);

    try {
      const result = await api.deleteTask(id);
      // Remove from local state
      setTasks(prevTasks => prevTasks.filter(t => t.id !== id));
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear all state
   */
  const reset = useCallback(() => {
    setTasks([]);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    // State
    tasks,
    isLoading,
    error,

    // Operations
    loadTasksForDate,
    loadAllTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,

    // Utilities
    clearError,
    reset
  };
}

/**
 * Helper function to extract user-friendly error messages
 * @param {Error} error - Error object
 * @returns {string} Error message
 */
function getErrorMessage(error) {
  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`;
  }
  if (error instanceof NotFoundError) {
    return 'Task not found';
  }
  if (error instanceof NetworkError) {
    return 'Network error. Please check your connection and try again.';
  }
  if (error instanceof ServerError) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'An error occurred';
}
