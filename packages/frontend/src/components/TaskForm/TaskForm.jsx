/**
 * TaskForm Component - Add or edit a task
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatDateISO, getTodayDate } from '../../utils/dateHelpers';
import './TaskForm.css';

export function TaskForm({
  initialTask = null,
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: getTodayDate(),
    time: '09:00',
    status: 'pending'
  });

  const [errors, setErrors] = useState({});
  const isEditing = !!initialTask;

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title,
        description: initialTask.description || '',
        date: initialTask.date,
        time: initialTask.time,
        status: initialTask.status
      });
    }
  }, [initialTask]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be 255 characters or less';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        {isEditing ? 'Edit Task' : 'Add New Task'}
      </h2>

      <Input
        label="Task Title"
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter task title..."
        error={errors.title}
        required
      />

      <div className="form-field">
        <label htmlFor="description" className="input-label">
          Description <span className="optional">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          className="input-field textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add task details..."
          rows="3"
        />
      </div>

      <div className="form-row">
        <Input
          label="Date"
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
        />

        <Input
          label="Time"
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          error={errors.time}
          required
        />
      </div>

      {isEditing && (
        <div className="form-field">
          <label className="input-label">Status</label>
          <div className="status-options">
            {['pending', 'completed', 'missed'].map(status => (
              <label key={status} className="status-radio">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={handleChange}
                />
                <span className="status-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <Button
          type="button"
          variant="outlined"
          color="primary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="filled"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
}
