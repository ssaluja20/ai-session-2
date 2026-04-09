/**
 * Reusable Button component following Material Design
 */

import React from 'react';
import './Button.css';

export function Button({
  children,
  variant = 'filled',
  color = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const buttonClass = `btn btn-${variant} btn-${color} btn-${size} ${className}`;

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
