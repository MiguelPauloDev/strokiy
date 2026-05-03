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

  const playSparkNote = useCallback((clientX: number) => {
    if (!soundEnabled) return;

    const ac  = getAC();
    const t   = ac.currentTime;
    const now = performance.now();
    const timeSinceLast = now - lastClickRef.current;
    lastClickRef.current = now;

    /* Horizontal position influences note (left = low, right = high) */
    const xRatio    = Math.max(0, Math.min(1, clientX / window.innerWidth));
    const noteIndex = Math.floor(xRatio * PENTATONIC.length);
    const freq      = PENTATONIC[noteIndex];

    /* Medium clicks (<300 ms) = +½ octave; slow = normal (2.0 removed — too aggressive) */
    const pitchMult = timeSinceLast < 300 ? 1.5 : 1.0;

    /* Shared compressor — auto-ducks the pluck when other sounds are playing */
    const compressor = ac.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value      = 10;
    compressor.ratio.value     = 6;
    compressor.attack.value    = 0.003;
    compressor.release.value   = 0.1;
    compressor.connect(ac.destination);

    /* Main oscillator — triangle wave, max 0.06 */
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'triangle';
    o.frequency.value = freq * pitchMult;
    o.connect(g);
    g.connect(compressor);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.06, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.start(t);
    o.stop(t + 0.16);

    /* Subtle harmonic — octave above, very quiet */
    const o2 = ac.createOscillator();
    const g2 = ac.createGain();
    o2.type = 'sine';
    o2.frequency.value = freq * pitchMult * 2;
    o2.connect(g2);
    g2.connect(compressor);
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.02, t + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o2.start(t);
    o2.stop(t + 0.10);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled]);

  return { playSparkNote };
}
