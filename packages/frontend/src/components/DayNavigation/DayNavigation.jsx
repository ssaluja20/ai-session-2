/**
 * DayNavigation Component - Navigate between dates
 */

import React, { useEffect } from 'react';
import { getDateLabel, addDays } from '../../utils/dateHelpers';
import './DayNavigation.css';

export function DayNavigation({
  currentDate,
  onDateChange
}) {
  const previousDate = addDays(currentDate, -1);
  const nextDate = addDays(currentDate, 1);
  const previousLabel = getDateLabel(previousDate);
  const nextLabel = getDateLabel(nextDate);
  const currentLabel = getDateLabel(currentDate);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        onDateChange(previousDate);
      } else if (e.key === 'ArrowRight') {
        onDateChange(nextDate);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentDate, previousDate, nextDate, onDateChange]);

  return (
    <div className="day-navigation">
      <button
        className="nav-btn nav-prev"
        onClick={() => onDateChange(previousDate)}
        title={`Previous day (${previousLabel})`}
        aria-label={`Previous day (${previousLabel})`}
      >
        <span className="nav-arrow">←</span>
        <span className="nav-label">{previousLabel}</span>
      </button>

      <div className="nav-current">
        <h1 className="current-date">{currentLabel}</h1>
      </div>

      <button
        className="nav-btn nav-next"
        onClick={() => onDateChange(nextDate)}
        title={`Next day (${nextLabel})`}
        aria-label={`Next day (${nextLabel})`}
      >
        <span className="nav-label">{nextLabel}</span>
        <span className="nav-arrow">→</span>
      </button>
    </div>
  );
}
