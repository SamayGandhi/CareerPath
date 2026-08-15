/**
 * Textarea.jsx
 * -----------------------------------------
 * New shared atom, additive only — not yet used by any page in this
 * batch. Mirrors Input.jsx's pattern exactly (forwardRef, error,
 * className). Introduced for consistency with the Admin question-bank
 * forms and other multi-line inputs that currently hand-style a plain
 * <textarea> inline; those pages will adopt this in later batches.
 */

import { forwardRef } from 'react';
import { classNames } from '../../../utils';

const Textarea = forwardRef(function Textarea(
  { error, className = '', rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={classNames(
        'w-full resize-y rounded-md border bg-surface p-3 text-sm text-text-primary',
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

export default Textarea;