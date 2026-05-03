/* ── Label — Figma 24:4846 ──────────────────────────────────────────────────
   Atomic text node used inside Bio Text Container → Buttons/primary.
   TEXT · HUG sizing · textAutoResize: WIDTH_AND_HEIGHT
   Geist ExtraBold 800 · 16px · lineHeight 24px · LS -0.15px · #212123       */

import { HTMLAttributes } from 'react';

interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  color?: string;
}

export default function Label({
  children,
  color = '#212123',
  style,
  ...props
}: LabelProps) {
  return (
    <span
      style={{
        fontFamily:    '"Geist", sans-serif',
        fontWeight:    800,
        fontSize:      16,
        lineHeight:    '24px',
        letterSpacing: '-0.15px',
        color,
        textAlign:     'left',
        display:       'inline',
        whiteSpace:    'nowrap',
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
