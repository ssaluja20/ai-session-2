/**
 * Loading Spinner component
 */

import React from 'react';
import './LoadingSpinner.css';

export function LoadingSpinner({ message = 'Loading...', size = 'medium' }) {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner" aria-hidden="true">
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
}
