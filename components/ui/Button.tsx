'use client';

import { ButtonHTMLAttributes } from 'react';
import Label from '@/components/ui/Label';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/* ── Bio Text Container — Figma 24:4845 ────────────────────────────────────
   Inner label wrapper used inside "Buttons/primary".
   HORIZONTAL flex · HUG sizing · gap 10.39px · no fill/stroke.
   Text child: Geist ExtraBold 800 · 16px · lineHeight 24px · LS -0.15px    */
const bioTextContainerStyle: React.CSSProperties = {
  display:    'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap:        10.39,
  fontFamily: '"Geist", sans-serif',
  fontSize:   16,
  fontWeight: 800,
  lineHeight: '24px',
  letterSpacing: '-0.15px',
};

export default function Button({
  variant = 'primary',
  style,
  className = '',
  children,
  ...props
}: ButtonProps) {
  /* ── Outer button frame — Figma 24:4844 "Buttons/primary" ──────────────
     bg #F2F2F2 · radius 12 · padding 6px 16px · HUG sizing
     HORIZONTAL flex · CENTER aligned · gap 8px between slots             */
  const base: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    cursor:         'pointer',
    border:         'none',
    transition:     'opacity 150ms ease, transform 100ms ease',
    whiteSpace:     'nowrap',
  };

  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background:    '#F2F2F2',
      borderRadius:  12,
      paddingTop:    6,
      paddingBottom: 6,
      paddingLeft:   16,
      paddingRight:  16,
      color:         '#212123',
    },
    secondary: {
      background:    'var(--color-surface)',
      borderRadius:  'var(--radius-full)',
      paddingLeft:   16,
      paddingRight:  16,
      height:        40,
      fontFamily:    '"Geist", sans-serif',
      fontSize:      12,
      fontWeight:    600,
      color:         'var(--color-text-primary)',
    },
    ghost: {
      background:    'transparent',
      borderRadius:  'var(--radius-full)',
      paddingLeft:   16,
      paddingRight:  16,
      height:        40,
      fontFamily:    '"Geist", sans-serif',
      fontSize:      12,
      fontWeight:    600,
      color:         'var(--color-text-muted)',
    },
    icon: {
      background:    'transparent',
      borderRadius:  'var(--radius-full)',
      width:         40,
      height:        40,
      color:         'var(--color-text-primary)',
    },
  };

  /* Primary: Bio Text Container (24:4845) → Label (24:4846) */
  const content =
    variant === 'primary' ? (
      <span style={bioTextContainerStyle}>
        <Label>{children}</Label>
      </span>
    ) : (
      children
    );

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      className={className}
      {...props}
    >
      {content}
    </button>
  );
}
