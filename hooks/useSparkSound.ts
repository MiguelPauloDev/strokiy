'use client';

import { useCallback, useRef } from 'react';
import { useSoundContext } from '@/providers/SoundContext';

const PENTATONIC = [
  261.63, 293.66, 329.63, 392.00, 440.00,
  523.25, 587.33, 659.25, 783.99, 880.00,
];

export function useSparkSound() {
  const { soundEnabled } = useSoundContext();
  const acRef            = useRef<AudioContext | null>(null);
  const lastClickRef     = useRef<number>(0);

  function getAC(): AudioContext {
    if (!acRef.current) {
      const AC = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      acRef.current = new AC!();
    }
    return acRef.current;
  }

  // Som removido — ver hierarquia de som no CLAUDE.md (spark pluck interfere com sons principais)
  const playSparkNote = useCallback((_clientX: number) => { /* noop */ }, []);

  return { playSparkNote };
}
