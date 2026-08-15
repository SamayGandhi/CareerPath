/**
 * Badge.jsx
 * -----------------------------------------
 * Small status/label pill. Semantic color variants map directly to
 * the design system's semantic tokens.
 * BATCH 1 UPDATE (visual only): added a subtle matching-color border
 * for extra definition on dark surfaces, and a color transition. Props
 * unchanged: children, variant, className.
 */

import { classNames } from '../../../utils';

const VARIANT_CLASSES = {
  neutral: 'bg-surface-secondary text-text-secondary border border-border-subtle',
  brand: 'bg-brand-subtle text-brand border border-brand/20',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  danger: 'bg-danger/10 text-danger border border-danger/20',
  info: 'bg-info/10 text-info border border-info/20',
};

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium transition-colors duration-150',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}