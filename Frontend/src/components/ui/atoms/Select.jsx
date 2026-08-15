/**
 * Select.jsx
 * -----------------------------------------
 * New shared atom, additive only — not yet used by any page in this
 * batch. Introduced to replace the ~10+ hand-duplicated inline
 * `<select className="h-10 rounded-md border ...">` instances found
 * across Course Explorer, Skill Assessment, Interview Prep, and Admin
 * pages during the UI audit. Pages will adopt this in their respective
 * later batches — nothing existing is affected by its addition now.
 * Mirrors Input.jsx's pattern exactly (forwardRef, error, className).
 */

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '../../../utils';

const Select = forwardRef(function Select(
  { error, className = '', children, ...rest },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={classNames(
          'h-10 w-full appearance-none rounded-md border bg-surface px-3 pr-9 text-sm text-text-primary',
          'transition-all duration-150 ease-out hover:border-border-strong',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-danger focus:border-danger focus:ring-danger/20'
            : 'border-border-strong focus:border-brand focus:ring-brand/20',
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
    </div>
  );
});

export default Select;