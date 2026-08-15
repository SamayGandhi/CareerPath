/**
 * ScrollReveal.jsx
 * -----------------------------------------
 * Lightweight, dependency-free scroll-reveal wrapper using the native
 * IntersectionObserver API (no animation library added). Fades/lifts
 * children into view once they enter the viewport, then disconnects.
 *
 * Progressive-enhancement safe: if IntersectionObserver is unsupported
 * for any reason, content is shown immediately rather than staying
 * hidden — this can never hide content permanently. Respects
 * prefers-reduced-motion via the global CSS rule already defined in
 * globals.css (animation duration collapses to ~0 automatically).
 *
 * Purely presentational — takes no data, calls no API, contains no
 * business logic. Used only by LandingPage.jsx in this batch.
 */

import { useEffect, useRef, useState } from 'react';
import { classNames } from '../../../utils';

export default function ScrollReveal({ children, className = '', delayMs = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={classNames(isVisible ? 'animate-fade-in-up' : 'opacity-0', className)}
      style={isVisible && delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}