'use client';

import { useCallback } from 'react';
import { useSoundContext } from '@/providers/SoundContext';

const WAVEFORM_PATHS: { d: string; delay: string }[] = [
  { d: 'M6 12V20',  delay: '0ms'   },
  { d: 'M11 4V28',  delay: '100ms' },
  { d: 'M16 8V24',  delay: '200ms' },
  { d: 'M21 12V20', delay: '100ms' },
  { d: 'M26 10V22', delay: '0ms'   },
];

const ANIM_STYLE = (delay: string): React.CSSProperties => ({
  transformBox:    'fill-box',
  transformOrigin: 'center',
  animation:       'wave-bar 900ms ease-in-out infinite',
  animationDelay:  delay,
});

const SW = 3.2;

function IconWaveform({ animate, size = 20 }: { animate: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      {WAVEFORM_PATHS.map(({ d, delay }, i) => (
        <path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth={SW}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={animate ? ANIM_STYLE(delay) : undefined}
        />
      ))}
    </svg>
  );
}

function IconWaveformSlash({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M6 5L26 27"       stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 12V20"         stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11 10.5V28"      stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 16V24"        stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 8V8.5675"     stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12V14.0675"   stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26 10V19.5675"   stroke="currentColor" strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function WaveButton() {
  const { soundEnabled, toggle } = useSoundContext();

  const handleClick = useCallback(() => {
    try {
      const a = new Audio('/sounds/button-1.wav');
      a.volume = 0.4;
      a.play().catch(() => {});
    } catch {}
    toggle();
  }, [toggle]);

  return (
    <button
      onClick={handleClick}
      title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
      aria-label={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
      style={{
        width: 40, height: 40, borderRadius: 100, background: '#FFFFFF',
        border: 'none', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 0,
        transition: 'opacity 200ms ease',
        color: '#212123',
      }}
    >
      {soundEnabled ? <IconWaveform animate /> : <IconWaveformSlash />}
    </button>
  );
}
