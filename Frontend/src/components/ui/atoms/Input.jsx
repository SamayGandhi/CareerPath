/**
 * Input.jsx
 * -----------------------------------------
 * Atomic input component. Static label pattern per approved Design
 * System, unchanged.
 * BATCH 1 UPDATE (visual only): smoother focus/hover transition,
 * refined focus ring using the brand color at low opacity. Props/API
 * unchanged: type, error, className, ...rest, forwardRef.
 */

import { forwardRef } from 'react';
import { classNames } from '../../../utils';

const Input = forwardRef(function Input(
  { type = 'text', error, className = '', ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={classNames(
        'h-10 w-full rounded-md border bg-surface px-3 text-sm text-text-primary',
        'placeholder:text-text-tertiary transition-all duration-150 ease-out',
        'hover:border-border-strong',
        'focus:outline-none focus:ring-2 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error
          ? 'border-danger focus:border-danger focus:ring-danger/20'
          : 'border-border-strong focus:border-brand focus:ring-brand/20',
        className
      )}
      {...rest}
    />
  );
});

export default Input;