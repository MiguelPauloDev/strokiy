'use client';

import { useState, useEffect } from 'react';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';
export type BreakpointOrNull = Breakpoint | null;

function getBreakpoint(width: number): Breakpoint {
  if (width >= 1024) return 'desktop';
  if (width >= 768)  return 'tablet';
  return 'mobile';
}

export function useBreakpoint(): Breakpoint | null {
  const [bp, setBp] = useState<Breakpoint | null>(null);

  useEffect(() => {
    const update = () => setBp(getBreakpoint(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return bp;
}
