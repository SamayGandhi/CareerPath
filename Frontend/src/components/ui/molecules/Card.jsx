/**
 * Card.jsx
 * -----------------------------------------
 * Standard card container per approved Design System.
 * BATCH 1 UPDATE (visual only): interactive cards now lift slightly
 * and gain a brand-tinted border on hover, with a smooth transition;
 * non-interactive cards get a subtle color-transition base for
 * consistency. Props/API unchanged: children, interactive, className,
 * ...rest.
 */

import { classNames } from '../../../utils';

export default function Card({ children, interactive = false, className = '', ...rest }) {
  return (
    <div
      className={classNames(
        'rounded-lg border border-border-subtle bg-surface p-6 shadow-xs',
        'transition-all duration-200 ease-out',
        interactive &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md active:translate-y-0 active:shadow-sm',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}