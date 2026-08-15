/**
 * useDebounce.js
 * -----------------------------------------
 * Standard debounce hook, used by search inputs (Course Explorer) to
 * avoid firing a request on every keystroke.
 */

import { useEffect, useState } from 'react';

export function useDebounce(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}