'use client';

import { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error';

interface ToastProps {
  message:     string;
  visible:     boolean;
  onHide:      () => void;
  variant?:    ToastVariant;
  /** px a partir da esquerda — usar 320 quando sidebar está visível (desktop) */
  offsetLeft?: number;
}

const BG: Record<ToastVariant, string> = {
  success: '#212123',
  error:   '#FF3155',
};

export default function Toast({ message, visible, onHide, variant = 'success', offsetLeft = 0 }: ToastProps) {
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      const timer = setTimeout(() => { onHide(); }, 2000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [visible, onHide]);

  if (!rendered) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position:       'fixed',
        left:           offsetLeft,
        right:          0,
        bottom:         24,
        zIndex:         300,
        display:        'flex',
        justifyContent: 'center',
        pointerEvents:  'none',
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 300ms ease, transform 300ms ease',
      }}
    >
      <div style={{
        height:        40,
        padding:       '0 16px',
        borderRadius:  100,
        background:    BG[variant],
        color:         '#FFFFFF',
        fontFamily:    '"Geist Mono", monospace',
        fontSize:      12,
        fontWeight:    600,
        display:       'flex',
        alignItems:    'center',
        boxShadow:     '0px 4px 24px rgba(0,0,0,0.18)',
        whiteSpace:    'nowrap',
        pointerEvents: 'auto',
      }}>
        {message}
      </div>
    </div>
  );
}
