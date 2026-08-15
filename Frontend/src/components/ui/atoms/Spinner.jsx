/**
 * Spinner.jsx
 * -----------------------------------------
 * Standalone loading spinner, used for full-page/section loading
 * states (not inline button loading — Button handles that itself).
 */

import { Loader2 } from 'lucide-react';
import { classNames } from '../../../utils';

export default function Spinner({ size = 24, className = '' }) {
  return (
    <div className={classNames('flex items-center justify-center', className)}>
      <Loader2 className="animate-spin text-brand" style={{ width: size, height: size }} />
    </div>
  );
}