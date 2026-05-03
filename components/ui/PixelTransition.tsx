'use client';

/* ── PixelTransition ─────────────────────────────────────────────────────────
   Full-screen fixed overlay that animates a pixel-by-pixel reveal.
   Adapted from React Bits (reactbits.dev/animations/pixel-transition).

   Behaviour:
     Phase 1 (0 → animationStepDuration):  pixels appear randomly
     Midpoint (animationStepDuration):      onMidpoint() fires
     Phase 2 (animationStepDuration → ×2): pixels disappear randomly
     Complete (animationStepDuration × 2):  onComplete() fires

   The actual page content is always visible through the overlay.
   Pixel colour should match the incoming theme background so the
   "wipe" appears to be the new theme arriving pixel by pixel.
──────────────────────────────────────────────────────────────────────────── */

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface Props {
  pixelColor?:            string;
  gridSize?:              number;
  animationStepDuration?: number;
  onMidpoint?:            () => void;
  onComplete?:            () => void;
}

export default function PixelTransition({
  pixelColor            = '#000000',
  gridSize              = 7,
  animationStepDuration = 0.3,
  onMidpoint,
  onComplete,
}: Props) {
  const pixelGridRef  = useRef<HTMLDivElement>(null);
  const delayedRef    = useRef<gsap.core.Tween | null>(null);

  /* Keep callbacks in refs so the animation closure never goes stale */
  const onMidpointRef = useRef(onMidpoint);
  const onCompleteRef = useRef(onComplete);
  onMidpointRef.current = onMidpoint;
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const grid = pixelGridRef.current;
    if (!grid) return;

    /* ── Build pixel grid (square pixels) ──
       Pixel size is derived from viewport width so width === height.
       Rows are calculated to fully cover the viewport height. */
    grid.innerHTML = '';
    const pixelSize = window.innerWidth / gridSize;           // px — always square
    const cols      = gridSize;
    const rows      = Math.ceil(window.innerHeight / pixelSize); // enough rows to fill height

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = document.createElement('div');
        px.style.cssText = [
          'position:absolute',
          'display:none',
          `background-color:${pixelColor}`,
          `width:${pixelSize}px`,
          `height:${pixelSize}px`,
          `left:${col * pixelSize}px`,
          `top:${row * pixelSize}px`,
        ].join(';');
        grid.appendChild(px);
      }
    }

    /* ── Animate ── */
    const pixels = Array.from(grid.querySelectorAll<HTMLElement>('div'));
    const each   = animationStepDuration / pixels.length;

    gsap.killTweensOf(pixels);
    delayedRef.current?.kill();

    /* Phase 1 — pixels appear */
    gsap.to(pixels, {
      display:  'block',
      duration: 0,
      stagger:  { each, from: 'random' },
    });

    /* Midpoint — theme swap */
    delayedRef.current = gsap.delayedCall(animationStepDuration, () => {
      onMidpointRef.current?.();
    });

    /* Phase 2 — pixels disappear */
    gsap.to(pixels, {
      display:    'none',
      duration:   0,
      delay:      animationStepDuration,
      stagger:    { each, from: 'random' },
      onComplete: () => onCompleteRef.current?.(),
    });

    return () => {
      gsap.killTweensOf(pixels);
      delayedRef.current?.kill();
    };
  // Intentionally empty deps — this is a one-shot mount animation.
  // pixelColor / gridSize / animationStepDuration are fixed for each
  // overlay instance (a new component mounts for each transition).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none' }}
    >
      <div
        ref={pixelGridRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
