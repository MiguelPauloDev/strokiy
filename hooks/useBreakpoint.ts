'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

function getBreakpoint(width: number): Breakpoint {
  if (width >= 1024) return 'desktop';
  if (width >= 768)  return 'tablet';
  return 'mobile';
}

/**
 * Returns the current breakpoint.
 * SSR-safe: initial value is 'desktop' (server renders desktop layout).
 */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const update = () => setBp(getBreakpoint(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return bp;
}
