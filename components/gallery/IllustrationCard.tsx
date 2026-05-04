'use client';

import { useState, useCallback } from 'react';
import type { Illustration } from '@/types';
import { useSoundContext } from '@/providers/SoundContext';
import { copyToClipboard } from '@/lib/clipboard';

interface Props {
  illustration: Illustration;
  isSelected:   boolean;
  onSelect:     (id: string) => void;
  onCopy:       () => void;
  onCopyError?: () => void;
}

function prepareSvg(svg: string): string {
  if (typeof window === 'undefined') return svg;
  try {
    const doc  = new DOMParser().parseFromString(svg, 'image/svg+xml');
    const root = doc.documentElement;
    root.setAttribute('width',  '124');
    root.setAttribute('height', '124');
    return new XMLSerializer().serializeToString(root);
  } catch {
    return svg;
  }
}

/* Easing lento (Default → Hover) */
const SLOW_EASING = 'cubic-bezier(0.45, 0, 0.55, 1)';
const SLOW_TRANSITION = `333ms ${SLOW_EASING}`;

/* ── Component ───────────────────────────────────────────────────────────── */

export default function IllustrationCard({ illustration, isSelected, onSelect, onCopy, onCopyError }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const { play } = useSoundContext();

  const showHover = isHovered && !isSelected;

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(illustration.svg);
    if (success) {
      play('copy');
      onCopy();
    } else {
      onCopyError?.();
    }
  }, [illustration.svg, onCopy, onCopyError, play]);

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(illustration.id);
  }, [illustration.id, onSelect]);

  const handleDeselect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(illustration.id);
  }, [illustration.id, onSelect]);

  const svgContent = prepareSvg(illustration.svg);

  return (
    <article
      data-card=""
      onClick={isSelected ? handleDeselect : handleSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position:     'relative',
        width:        '100%',
        height:       200,
        borderRadius: 'var(--card-radius)',
        overflow:     'hidden',
        background:   isSelected ? 'var(--card-selected-bg)' : 'var(--card-bg)',
        border:       isSelected ? 'var(--card-selected-border, var(--card-border))' : 'var(--card-border)',
        cursor:       'pointer',
        transition:   'background var(--card-transition)',
        boxSizing:    'border-box',
      }}
    >
      {/* ── SVG illustration ── */}
      <div
        style={{
          position:   'absolute',
          top:        '50%',
          left:       '50%',
          transform:  'translate(-50%, -50%)',
          width:      124,
          height:     124,
          filter:     isSelected ? 'var(--card-svg-selected)' : 'var(--card-svg-default)',
          transition: 'filter var(--card-transition)',
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* ── Gradient overlay ── */}
      <div
        style={{
          position:      'absolute',
          inset:         0,
          background:    'linear-gradient(to bottom, var(--card-gradient-start) 0%, var(--card-gradient-end) 70%)',
          borderRadius:  'var(--card-radius)',
          opacity:       showHover ? 1 : 0,
          transition:    `opacity ${SLOW_TRANSITION}`,
          willChange:    'opacity',
          pointerEvents: 'none',
        }}
      />

      {/* ── Circle — hover affordance ── */}
      <button
        onClick={handleSelect}
        aria-label="Select illustration"
        style={{
          position:      'absolute',
          top:           16,
          right:         16,
          width:         24,
          height:        24,
          borderRadius:  '50%',
          background:    'transparent',
          border:        '2px solid var(--card-text)',
          cursor:        'pointer',
          opacity:       showHover ? 0.05 : 0,
          pointerEvents: showHover ? 'auto' : 'none',
          transition:    `opacity ${SLOW_TRANSITION}`,
          willChange:    'opacity',
          padding:       0,
        }}
      />

      {/* ── CheckCircle — selected state ── */}
      <button
        onClick={handleDeselect}
        aria-label="Deselect illustration"
        style={{
          position:       'absolute',
          top:            16,
          right:          16,
          width:          24,
          height:         24,
          background:     'transparent',
          border:         'none',
          cursor:         'pointer',
          padding:        0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          opacity:        isSelected ? 1 : 0,
          pointerEvents:  isSelected ? 'auto' : 'none',
          transition:     'opacity var(--card-transition)',
          willChange:     'opacity',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9"
            fill="var(--card-selected-text)"
            stroke="var(--card-selected-text)"
            strokeWidth="2" />
          <path
            d="M8.25 12L11.25 15L15.75 9.75"
            stroke="var(--card-selected-bg)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ── Copy button ── */}
      <button
        onClick={handleCopy}
        style={{
          position:      'absolute',
          bottom:        16,
          left:          '50%',
          transform:     'translateX(-50%)',
          width:         73,
          height:        36,
          background:    'var(--card-copy-bg)',
          borderRadius:  12,
          border:        'none',
          cursor:        'pointer',
          fontFamily:    '"Geist", sans-serif',
          fontSize:      16,
          fontWeight:    800,
          color:         'var(--card-copy-color)',
          letterSpacing: '-0.15px',
          whiteSpace:    'nowrap',
          opacity:       showHover ? 1 : 0,
          pointerEvents: showHover ? 'auto' : 'none',
          transition:    `opacity ${SLOW_TRANSITION}`,
          willChange:    'opacity',
        }}
      >
        Copy
      </button>

      {/* ── Nome ── */}
      <span
        style={{
          position:      'absolute',
          left:          16,
          bottom:        16,
          fontFamily:    '"Geist Mono", monospace',
          fontSize:      'var(--card-text-size)',
          fontWeight:    500,
          color:         isSelected ? 'var(--card-selected-text)' : 'var(--card-text)',
          lineHeight:    '16px',
          letterSpacing: 0,
          opacity:       showHover ? 0 : 1,
          transition:    `opacity ${SLOW_TRANSITION}, color var(--card-transition)`,
          pointerEvents: 'none',
          userSelect:    'none',
        }}
      >
        {illustration.name}
      </span>

      {/* ── Style ── */}
      <span
        style={{
          position:      'absolute',
          right:         16,
          bottom:        17,
          fontFamily:    '"Geist Mono", monospace',
          fontSize:      'var(--card-text-size)',
          fontWeight:    500,
          color:         isSelected ? 'var(--card-selected-text)' : 'var(--card-text)',
          lineHeight:    '15px',
          textAlign:     'right',
          letterSpacing: 0,
          opacity:       showHover ? 0 : 0.6,
          transition:    `opacity ${SLOW_TRANSITION}, color var(--card-transition)`,
          pointerEvents: 'none',
          userSelect:    'none',
        }}
      >
        {illustration.style}
      </span>
    </article>
  );
}
