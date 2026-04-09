/**
 * Validation functions for task data
 */

/**
 * Validate task creation data
 * @param {Object} data - Task data to validate
 * @returns {Object} { isValid: boolean, errors: Object }
 */
function validateTaskCreate(data) {
  const errors = {};

  // Validate title (required, non-empty string)
  if (!data.title || typeof data.title !== 'string') {
    errors.title = 'Title is required and must be a string';
  } else if (data.title.trim() === '') {
    errors.title = 'Title cannot be empty';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be 255 characters or less';
  }

  // Validate description (optional, but if provided must be string)
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.description = 'Description must be a string';
  } else if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be 1000 characters or less';
  }

  // Validate date (required, YYYY-MM-DD format)
  if (!data.date || typeof data.date !== 'string') {
    errors.date = 'Date is required and must be a string in YYYY-MM-DD format';
  } else if (!isValidDateFormat(data.date)) {
    errors.date = 'Date must be in YYYY-MM-DD format';
  }

  // Validate time (required, HH:MM format)
  if (!data.time || typeof data.time !== 'string') {
    errors.time = 'Time is required and must be a string in HH:MM format';
  } else if (!isValidTimeFormat(data.time)) {
    errors.time = 'Time must be in HH:MM format (00:00 to 23:59)';
  }

  // Validate status (optional, defaults to pending)
  if (data.status && !isValidStatus(data.status)) {
    errors.status = 'Status must be one of: pending, completed, missed';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate task update data
 * @param {Object} data - Task data to validate (partial updates allowed)
 * @returns {Object} { isValid: boolean, errors: Object }
 */
function validateTaskUpdate(data) {
  const errors = {};

  // Validate title if provided
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.title = 'Title must be a string';
    } else if (data.title.trim() === '') {
      errors.title = 'Title cannot be empty';
    } else if (data.title.length > 255) {
      errors.title = 'Title must be 255 characters or less';
    }
  }

  // Validate description if provided
  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.description = 'Description must be a string';
  } else if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be 1000 characters or less';
  }

  // Validate date if provided
  if (data.date !== undefined) {
    if (typeof data.date !== 'string') {
      errors.date = 'Date must be a string in YYYY-MM-DD format';
    } else if (!isValidDateFormat(data.date)) {
      errors.date = 'Date must be in YYYY-MM-DD format';
    }
  }

  // Validate time if provided
  if (data.time !== undefined) {
    if (typeof data.time !== 'string') {
      errors.time = 'Time must be a string in HH:MM format';
    } else if (!isValidTimeFormat(data.time)) {
      errors.time = 'Time must be in HH:MM format (00:00 to 23:59)';
    }
  }

  // Validate status if provided
  if (data.status !== undefined && !isValidStatus(data.status)) {
    errors.status = 'Status must be one of: pending, completed, missed';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate status value
 * @param {string} status - Status value to validate
 * @returns {boolean}
 */
function validateStatus(status) {
  return isValidStatus(status);
}

/**
 * Check if date string is in valid YYYY-MM-DD format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean}
 */
function isValidDateFormat(dateStr) {
  if (typeof dateStr !== 'string') return false;

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr + 'T00:00:00');
  return date instanceof Date && !isNaN(date);
}

/**
 * Check if time string is in valid HH:MM format
 * @param {string} timeStr - Time string to validate
 * @returns {boolean}
 */
function isValidTimeFormat(timeStr) {
  if (typeof timeStr !== 'string') return false;

  const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeStr);
}

/**
 * Check if status is valid enum value
 * @param {string} status - Status value to validate
 * @returns {boolean}
 */
function isValidStatus(status) {
  const validStatuses = ['pending', 'completed', 'missed'];
  return validStatuses.includes(status);
}

module.exports = {
  validateTaskCreate,
  validateTaskUpdate,
  validateStatus,
  isValidDateFormat,
  isValidTimeFormat,
  isValidStatus
};
