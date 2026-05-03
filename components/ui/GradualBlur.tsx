'use client';

/* ── GradualBlur ─────────────────────────────────────────────────────────────
   TypeScript adaptation of GradualBlur from React Bits
   (reactbits.dev/animations/gradual-blur).

   Extra props added for Strokiy:
     direction     — alias for `position` (kept for API compatibility)
     blurIntensity — alias for `strength`
     tint          — renders a gradient overlay (transparent → colour) that
                     blends the blur into the page background
──────────────────────────────────────────────────────────────────────────── */

import { useMemo, CSSProperties } from 'react';

type Position = 'top' | 'bottom' | 'left' | 'right';
type Curve    = 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';

interface GradualBlurProps {
  /** Which edge to blur towards. Also accepts `direction` as alias. */
  position?:      Position;
  direction?:     Position;
  /** Overall blur strength (rem multiplier). Also accepts `blurIntensity`. */
  strength?:      number;
  blurIntensity?: number;
  /** Number of stacked blur divs — more = smoother gradient. */
  divCount?:      number;
  /** Interpolation curve for blur progression. */
  curve?:         Curve;
  /** Use exponential blur ramp instead of linear. */
  exponential?:   boolean;
  /** Overall opacity of the blur layer stack. */
  opacity?:       number;
  /** Adds a gradient overlay (transparent → colour) on top of blur layers,
   *  blending the effect into the page background. */
  tint?:          string;
  className?:     string;
  style?:         CSSProperties;
}

const CURVE_FUNCTIONS: Record<Curve, (p: number) => number> = {
  linear:       p => p,
  bezier:       p => p * p * (3 - 2 * p),
  'ease-in':    p => p * p,
  'ease-out':   p => 1 - Math.pow(1 - p, 2),
  'ease-in-out': p => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
};

const gradientDirection: Record<Position, string> = {
  top:    'to top',
  bottom: 'to bottom',
  left:   'to left',
  right:  'to right',
};

export default function GradualBlur({
  position      = 'bottom',
  direction,
  strength      = 2,
  blurIntensity,
  divCount      = 5,
  curve         = 'linear',
  exponential   = false,
  opacity       = 1,
  tint,
  className     = '',
  style         = {},
}: GradualBlurProps) {
  /* Resolve aliases */
  const pos      = direction ?? position;
  const str      = blurIntensity ?? strength;
  const curveDir = gradientDirection[pos];
  const curveF   = CURVE_FUNCTIONS[curve] ?? CURVE_FUNCTIONS.linear;

  const blurDivs = useMemo(() => {
    const divs: React.ReactNode[] = [];
    const increment = 100 / divCount;

    for (let i = 1; i <= divCount; i++) {
      const progress  = curveF(i / divCount);
      const blurValue = exponential
        ? Math.pow(2, progress * 4) * 0.0625 * str
        : 0.0625 * (progress * divCount + 1) * str;

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const maskValue = `linear-gradient(${curveDir}, ${gradient})`;

      divs.push(
        <div
          key={i}
          style={{
            position:              'absolute',
            inset:                 0,
            maskImage:             maskValue,
            WebkitMaskImage:       maskValue,
            backdropFilter:        `blur(${blurValue.toFixed(3)}rem)`,
            WebkitBackdropFilter:  `blur(${blurValue.toFixed(3)}rem)`,
            opacity,
          }}
        />
      );
    }

    /* Tint layer — gradient from transparent to background colour */
    if (tint) {
      divs.push(
        <div
          key="tint"
          style={{
            position:   'absolute',
            inset:      0,
            background: `linear-gradient(${curveDir}, transparent 0%, ${tint} 100%)`,
            opacity,
          }}
        />
      );
    }

    return divs;
  }, [str, divCount, curve, exponential, opacity, pos, tint, curveDir, curveF]);

  const containerStyle: CSSProperties = {
    pointerEvents: 'none',
    overflow:      'hidden',
    ...style,
  };

  return (
    <div
      aria-hidden="true"
      className={`gradual-blur ${className}`.trim()}
      style={containerStyle}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {blurDivs}
      </div>
    </div>
  );
}
