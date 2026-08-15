/**
 * Button.jsx
 * -----------------------------------------
 * Atomic button component per the approved Design System.
 * BATCH 1 UPDATE (visual only): refined hover/active/focus treatment,
 * added a subtle brand->accent gradient + glow on the primary variant
 * (used sparingly, matching the original "premium CTA" design
 * principle). Props/API are byte-identical to before: variant, size,
 * isLoading, disabled, fullWidth, type, onClick, className, ...rest.
 */

import { Loader2 } from 'lucide-react';
import { classNames } from '../../../utils';

const VARIANT_CLASSES = {
  primary:
    'bg-gradient-to-r from-brand to-brand-hover text-white shadow-sm hover:shadow-glow hover:brightness-105 active:brightness-95',
  secondary:
    'bg-surface text-text-primary border border-border-strong hover:bg-surface-secondary hover:border-brand/40',
  ghost: 'bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary',
  danger: 'bg-danger text-white shadow-sm hover:brightness-110',
};

const SIZE_CLASSES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-all duration-150 ease-out active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      {...rest}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}