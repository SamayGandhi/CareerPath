/**
 * Avatar.jsx
 * -----------------------------------------
 * User avatar with initials fallback.
 * BATCH 1 UPDATE (visual only): added a subtle border for visual
 * separation from surrounding surfaces (navbar, cards). Props/logic
 * unchanged: fullName, size, className; getInitials() unchanged.
 */

import { classNames } from '../../../utils';

function getInitials(fullName) {
  if (!fullName) return '?';
  const parts = fullName.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0][0].toUpperCase();
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export default function Avatar({ fullName, size = 'md', className = '' }) {
  return (
    <div
      className={classNames(
        'flex items-center justify-center rounded-full bg-brand-subtle font-semibold text-brand',
        'border border-border-subtle',
        SIZE_CLASSES[size],
        className
      )}
    >
      {getInitials(fullName)}
    </div>
  );
}