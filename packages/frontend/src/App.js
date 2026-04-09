/**
 * App Component - Main application component
 * Integrates all features: day navigation, task display, task form
 */

import React, { useEffect, useState } from 'react';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { useTasks } from './hooks/useTasks';
import { DayNavigation } from './components/DayNavigation/DayNavigation';
import { TaskList } from './components/TaskList/TaskList';
import { TaskForm } from './components/TaskForm/TaskForm';
import { Button } from './components/common/Button';
import { getDateLabel, sortTasksByTime } from './utils/dateHelpers';
import './App.css';

/**
 * Inner App component that uses context
 */
function AppContent() {
  const context = useTaskContext();
  const taskOps = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tasks when date changes
  useEffect(() => {
    taskOps.loadTasksForDate(context.currentDate);
  }, [context.currentDate, taskOps.loadTasksForDate]);

  // Update context when tasks change
  useEffect(() => {
    context.setTasks(taskOps.tasks);
  }, [taskOps.tasks, context.setTasks]);

  // Handle task creation
  const handleCreateTask = async (formData) => {
    setIsSubmitting(true);
    try {
      const newTask = await taskOps.createTask(formData);
      context.addTask(newTask);
      setShowForm(false);
      // Show success toast (optional enhancement in Phase 2)
    } catch (err) {
      context.setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle task update
  const handleUpdateTask = async (formData) => {
    if (!editingTaskId) return;

    setIsSubmitting(true);
    try {
      const updatedTask = await taskOps.updateTask(editingTaskId, formData);
      context.updateTaskInState(updatedTask);
      setShowForm(false);
      setEditingTaskId(null);
    } catch (err) {
      context.setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submit
  const handleFormSubmit = (formData) => {
    if (editingTaskId) {
      handleUpdateTask(formData);
    } else {
      handleCreateTask(formData);
    }
  };

  // Handle task edit
  const handleEdit = (taskId) => {
    setEditingTaskId(taskId);
    setShowForm(true);
  };

  // Handle task status change
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updated = await taskOps.updateTaskStatus(taskId, newStatus);
      context.updateTaskInState(updated);
    } catch (err) {
      context.setError(err.message);
    }
  };

  // Handle task delete
  const handleDelete = async (taskId) => {
    try {
      await taskOps.deleteTask(taskId);
      context.deleteTaskFromState(taskId);
    } catch (err) {
      context.setError(err.message);
    }
  };

  const tasksForCurrentDate = context.getTasksForCurrentDate();
  const sortedTasks = sortTasksByTime(tasksForCurrentDate);
  const dateLabel = getDateLabel(context.currentDate);
  const editingTask = editingTaskId &&
    taskOps.tasks.find(t => t.id === editingTaskId);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">📋 Daily Tasks</h1>
        <p className="app-subtitle">Organize your day, one task at a time</p>
      </header>

      <main className="app-main">
        <div className="app-content">
          {/* Day Navigation */}
          <DayNavigation
            currentDate={context.currentDate}
            onDateChange={context.setCurrentDate}
          />

          {/* Task List */}
          <TaskList
            tasks={sortedTasks}
            dateLabel={dateLabel}
            isLoading={taskOps.isLoading}
            error={taskOps.error}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRetry={() => taskOps.loadTasksForDate(context.currentDate)}
          />

          {/* Add Task Button (FAB) */}
          {!showForm && (
            <button
              className="fab-btn"
              onClick={() => {
                setEditingTaskId(null);
                setShowForm(true);
              }}
              title="Add new task"
              aria-label="Add new task"
            >
              +
            </button>
          )}
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <div className="form-modal">
            <div className="form-modal-content">
              <button
                className="form-close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingTaskId(null);
                }}
                aria-label="Close form"
              >
                ×
              </button>
              <TaskForm
                initialTask={editingTask}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTaskId(null);
                }}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * App Root - Wraps everything with TaskProvider
 */
function App() {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
}

export default App;