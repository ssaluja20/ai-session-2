/**
 * Task Context - Global state management for tasks
 * Provides tasks, current date, and operations throughout the app
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { getTodayDate } from '../utils/dateHelpers';

/**
 * Task Context
 */
const TaskContext = createContext();

/**
 * Initial state for TaskContext
 */
const initialState = {
  tasks: [],
  currentDate: getTodayDate(),
  isLoading: false,
  error: null,
  selectedTaskId: null
};

/**
 * Action types for useReducer
 */
const ACTION_TYPES = {
  // Task operations
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',

  // State management
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // Navigation
  SET_CURRENT_DATE: 'SET_CURRENT_DATE',
  SET_SELECTED_TASK: 'SET_SELECTED_TASK',
  CLEAR_SELECTED_TASK: 'CLEAR_SELECTED_TASK'
};

/**
 * Reducer function for task state
 * @param {Object} state - Current state
 * @param {Object} action - Action object
 * @returns {Object} New state
 */
function taskReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.SET_TASKS:
      return {
        ...state,
        tasks: action.payload,
        isLoading: false,
        error: null
      };

    case ACTION_TYPES.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        error: null
      };

    case ACTION_TYPES.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        error: null
      };

    case ACTION_TYPES.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };

    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ACTION_TYPES.SET_CURRENT_DATE:
      return {
        ...state,
        currentDate: action.payload
      };

    case ACTION_TYPES.SET_SELECTED_TASK:
      return {
        ...state,
        selectedTaskId: action.payload
      };

    case ACTION_TYPES.CLEAR_SELECTED_TASK:
      return {
        ...state,
        selectedTaskId: null
      };

    default:
      return state;
  }
}

/**
 * TaskProvider component
 * Wraps app with task context and provides all task operations
 */
export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  /**
   * Set tasks in state
   */
  const setTasks = useCallback(tasks => {
    dispatch({ type: ACTION_TYPES.SET_TASKS, payload: tasks });
  }, []);

  /**
   * Add task to state
   */
  const addTask = useCallback(task => {
    dispatch({ type: ACTION_TYPES.ADD_TASK, payload: task });
  }, []);

  /**
   * Update task in state
   */
  const updateTaskInState = useCallback(task => {
    dispatch({ type: ACTION_TYPES.UPDATE_TASK, payload: task });
  }, []);

  /**
   * Delete task from state
   */
  const deleteTaskFromState = useCallback(id => {
    dispatch({ type: ACTION_TYPES.DELETE_TASK, payload: id });
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback(isLoading => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: isLoading });
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback(error => {
    dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  }, []);

  /**
   * Set current date for navigation
   */
  const setCurrentDate = useCallback(date => {
    dispatch({ type: ACTION_TYPES.SET_CURRENT_DATE, payload: date });
  }, []);

  /**
   * Set selected task ID
   */
  const setSelectedTask = useCallback(id => {
    dispatch({ type: ACTION_TYPES.SET_SELECTED_TASK, payload: id });
  }, []);

  /**
   * Clear selected task
   */
  const clearSelectedTask = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_SELECTED_TASK });
  }, []);

  /**
   * Get tasks for current date
   */
  const getTasksForCurrentDate = useCallback(() => {
    return state.tasks.filter(task => task.date === state.currentDate);
  }, [state.tasks, state.currentDate]);

  /**
   * Get selected task object
   */
  const getSelectedTask = useCallback(() => {
    return state.tasks.find(task => task.id === state.selectedTaskId);
  }, [state.tasks, state.selectedTaskId]);

  const value = {
    // State
    state,
    tasks: state.tasks,
    currentDate: state.currentDate,
    isLoading: state.isLoading,
    error: state.error,
    selectedTaskId: state.selectedTaskId,

    // Task operations
    setTasks,
    addTask,
    updateTaskInState,
    deleteTaskFromState,

    // State management
    setLoading,
    setError,
    clearError,

    // Navigation
    setCurrentDate,
    setSelectedTask,
    clearSelectedTask,

    // Utilities
    getTasksForCurrentDate,
    getSelectedTask,

    // Action types (for advanced use)
    ACTION_TYPES
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

/**
 * Hook to consume TaskContext
 * @returns {Object} Context value
 * @throws {Error} If used outside TaskProvider
 */
export function useTaskContext() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }

  return context;
}

export default TaskContext;
