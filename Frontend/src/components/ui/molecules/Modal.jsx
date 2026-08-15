/**
 * Modal.jsx
 * -----------------------------------------
 * Reusable modal per approved Design System.
 * BATCH 1 UPDATE (visual only): added a scale+fade entrance animation
 * to the panel and a fade to the backdrop, and increased the backdrop
 * blur slightly for a more premium feel. Props/API unchanged: isOpen,
 * onClose, title, size, children, footer.
 */

import { X } from 'lucide-react';
import { classNames } from '../../../utils';

const SIZE_CLASSES = {
  sm: 'max-w-md',
  lg: 'max-w-2xl',
};

export default function Modal({ isOpen, onClose, title, size = 'lg', children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md animate-fade-in">
      <div
        className={classNames(
          'flex max-h-[85vh] w-full flex-col rounded-lg border border-border-subtle bg-surface shadow-xl',
          'animate-modal-in',
          SIZE_CLASSES[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 className="font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-tertiary transition-colors duration-150 hover:bg-surface-secondary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border-subtle px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}