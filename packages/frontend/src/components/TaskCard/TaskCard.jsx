/**
 * TaskCard Component - Display a single task with quick actions
 */

import React, { useState } from 'react';
import { formatTime } from '../../utils/dateHelpers';
import { Button } from '../common/Button';
import './TaskCard.css';

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusToggle = () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(task.id, newStatus);
  };

  const handleMarkMissed = () => {
    onStatusChange(task.id, 'missed');
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setShowDeleteConfirm(false);
  };

  const statusBadgeColor = {
    pending: 'pending',
    completed: 'completed',
    missed: 'missed'
  }[task.status];

  return (
    <div className={`task-card task-${task.status}`}>
      {!showDeleteConfirm ? (
        <>
          <div className="task-card-content">
            <div className="task-checkbox">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={handleStatusToggle}
                aria-label={`Mark task "${task.title}" as ${task.status === 'completed' ? 'pending' : 'completed'}`}
              />
            </div>

            <div className="task-main">
              <div className="task-header">
                <h3 className="task-title">{task.title}</h3>
                <span className={`task-status-badge badge-${statusBadgeColor}`}>
                  {task.status}
                </span>
              </div>

              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-meta">
                <span className="task-time" aria-label="Task time">
                  🕐 {formatTime(task.time)}
                </span>
              </div>
            </div>
          </div>

          <div className="task-actions">
            {task.status === 'pending' && (
              <button
                className="action-btn action-missed"
                onClick={handleMarkMissed}
                title="Mark as missed"
                aria-label={`Mark "${task.title}" as missed`}
              >
                ✗
              </button>
            )}

            <button
              className="action-btn action-edit"
              onClick={() => onEdit(task.id)}
              title="Edit task"
              aria-label={`Edit "${task.title}"`}
            >
              ✎
            </button>

            <button
              className="action-btn action-delete"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete task"
              aria-label={`Delete "${task.title}"`}
            >
              🗑
            </button>
          </div>
        </>
      ) : (
        <div className="task-delete-confirm">
          <p>Delete task "{task.title}"?</p>
          <div className="confirm-actions">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              color="error"
              size="small"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
