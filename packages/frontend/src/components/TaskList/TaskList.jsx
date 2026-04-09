/**
 * TaskList Component - Display all tasks for a day
 */

import React from 'react';
import { TaskCard } from '../TaskCard/TaskCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Button } from '../common/Button';
import './TaskList.css';

export function TaskList({
  tasks,
  dateLabel,
  isLoading,
  error,
  onStatusChange,
  onEdit,
  onDelete,
  onRetry
}) {
  if (isLoading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">Failed to Load Tasks</h3>
        <p className="error-message">{error}</p>
        <Button
          variant="filled"
          color="primary"
          onClick={onRetry}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h2 className="task-list-date">
          {dateLabel}
          {tasks.length > 0 && (
            <span className="task-count">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          )}
        </h2>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No tasks for today</h3>
          <p>Create your first task to get started</p>
        </div>
      ) : (
        <div className="task-list-items">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
