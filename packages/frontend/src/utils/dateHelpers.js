/**
 * Date utility functions for task scheduling
 */

/**
 * Format a date object to YYYY-MM-DD string for API calls
 * @param {Date} date - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a human-readable label for a date (Today, Tomorrow, Yesterday, or formatted date)
 * @param {string|Date} dateInput - Date string (YYYY-MM-DD) or Date object
 * @returns {string} Human-readable date label
 */
export function getDateLabel(dateInput) {
  let date;

  if (typeof dateInput === 'string') {
    date = new Date(dateInput + 'T00:00:00');
  } else {
    date = dateInput;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) {
    return 'Today';
  }
  if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  if (date.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return formatDate(date, 'short');
}

/**
 * Format a date for display in various formats
 * @param {Date} date - Date object
 * @param {string} format - Format type: 'short' (Apr 15), 'long' (April 15, 2026), 'full' (Wed, Apr 15, 2026)
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  const options = {
    short: { month: 'short', day: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
  };

  const locale = 'en-US';
  return date.toLocaleDateString(locale, options[format] || options.short);
}

/**
 * Format a time string or Date object to readable format (e.g., "2:30 PM")
 * @param {string|Date} timeInput - Time string (HH:MM) or Date object
 * @returns {string} Formatted time string
 */
export function formatTime(timeInput) {
  let time;

  if (typeof timeInput === 'string') {
    // Parse HH:MM format
    const [hours, minutes] = timeInput.split(':').map(Number);
    time = new Date();
    time.setHours(hours, minutes);
  } else {
    time = timeInput;
  }

  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Parse a time string (HH:MM) and return hours and minutes
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {object} { hours: number, minutes: number }
 */
export function parseTimeString(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

/**
 * Sort tasks by time (ascending)
 * @param {Array} tasks - Array of task objects with 'time' field
 * @returns {Array} Sorted tasks
 */
export function sortTasksByTime(tasks) {
  return [...tasks].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });
}

/**
 * Sort tasks by date then time (ascending)
 * @param {Array} tasks - Array of task objects with 'date' and 'time' fields
 * @returns {Array} Sorted tasks
 */
export function sortTasksByDateAndTime(tasks) {
  return [...tasks].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

/**
 * Get all unique dates from tasks
 * @param {Array} tasks - Array of task objects with 'date' field
 * @returns {Array} Array of unique dates (YYYY-MM-DD) sorted ascending
 */
export function getUniqueDates(tasks) {
  const dates = new Set(tasks.map(task => task.date));
  return Array.from(dates).sort();
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export function getTodayDate() {
  return formatDateISO(new Date());
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 * @returns {string} Tomorrow's date
 */
export function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateISO(tomorrow);
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 * @returns {string} Yesterday's date
 */
export function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDateISO(yesterday);
}

/**
 * Add days to a date and return in YYYY-MM-DD format
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {number} days - Number of days to add (can be negative)
 * @returns {string} New date in YYYY-MM-DD format
 */
export function addDays(dateStr, days) {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}

/**
 * Check if a date string represents today
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return dateStr === getTodayDate();
}

/**
 * Check if a date string represents tomorrow
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isTomorrow(dateStr) {
  return dateStr === getTomorrowDate();
}

/**
 * Check if a date is in the past (before today)
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isPastDate(dateStr) {
  return dateStr < getTodayDate();
}

/**
 * Check if a date is in the future (after today)
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @returns {boolean}
 */
export function isFutureDate(dateStr) {
  return dateStr > getTodayDate();
}
