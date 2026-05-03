'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSoundContext } from '@/providers/SoundContext';

function IconDarkWave() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <line x1="3"    y1="6"  x2="3"    y2="10" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5.5"  y1="2"  x2="5.5"  y2="14" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8"    y1="4"  x2="8"    y2="12" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10.5" y1="6"  x2="10.5" y2="10" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="13"   y1="5"  x2="13"   y2="11" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function SpeakerPaths() {
  return (
    <>
      <path
        d="M9.5 9.65V14L5 10.5H2C1.87 10.5 1.74 10.45 1.65 10.35C1.55 10.26 1.5 10.13 1.5 10V6C1.5 5.87 1.55 5.74 1.65 5.65C1.74 5.55 1.87 5.5 2 5.5H5L5.43 5.17"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path
        d="M7.41 3.63L9.5 2V5.93"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <line x1="5" y1="5.5" x2="5" y2="10.5" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
      <path
        d="M12 6.68C12.27 6.99 12.44 7.37 12.49 7.78C12.53 8.19 12.45 8.6 12.25 8.96"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      <path
        d="M13.86 5C14.57 5.8 14.98 6.83 15 7.91C15.02 8.98 14.66 10.03 13.98 10.86"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
    </>
  );
}

function IconSpeakerHigh() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5 10.5L2 10.5C1.867 10.5 1.74 10.447 1.646 10.354C1.553 10.26 1.5 10.133 1.5 10L1.5 6C1.5 5.867 1.553 5.74 1.646 5.646C1.74 5.553 1.867 5.5 2 5.5L5 5.5L9.5 2L9.5 14L5 10.5Z"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <line x1="5" y1="5.5" x2="5" y2="10.5" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
      <path
        d="M12 6.68C12.32 7.05 12.5 7.52 12.5 8C12.5 8.49 12.32 8.96 12 9.32"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      <path
        d="M13.856 5C14.594 5.825 15.001 6.893 15.001 8C15.001 9.107 14.594 10.175 13.856 11"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

function IconSpeakerSlash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <SpeakerPaths />
      <line x1="3" y1="2.5" x2="13" y2="13.5" stroke="#111111" strokeWidth="4"   strokeLinecap="round"/>
      <line x1="3" y1="2.5" x2="13" y2="13.5" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function DarkSoundButtons() {
  const { soundEnabled, toggle, lofiEnabled, toggleLofi, lofiVolume, setLofiVolume } = useSoundContext();

  const wrapperRef   = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging   = useRef(false);

  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos,  setPopoverPos]  = useState({ x: 0, y: 0 });

  const handleEffectsClick = useCallback(() => {
    try {
      const a = new Audio('/sounds/button-1.wav');
      a.volume = 0.4;
      a.play().catch(() => {});
    } catch {}
    toggle();
  }, [toggle]);

  const handleWrapperEnter = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (wrapperRef.current) {
      const r            = wrapperRef.current.getBoundingClientRect();
      const popoverWidth = 208;
      const left = Math.max(8, r.right - popoverWidth);
      setPopoverPos({ x: left, y: r.bottom + 8 });
    }
    setShowPopover(true);
  }, []);

  const handleWrapperLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => setShowPopover(false), 80);
  }, []);

  const handlePopoverEnter = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const handlePopoverLeave = useCallback(() => {
    setShowPopover(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setLofiVolume(Math.max(0, Math.min(1, lofiVolume + (e.deltaY > 0 ? -0.05 : 0.05))));
  }, [lofiVolume, setLofiVolume]);

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    setLofiVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  }, [setLofiVolume]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !trackRef.current) return;
      const r = trackRef.current.getBoundingClientRect();
      setLofiVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup',   onUp);
    };
  }, [setLofiVolume]);

  const handleSliderKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setLofiVolume(Math.min(1, lofiVolume + 0.05));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setLofiVolume(Math.max(0, lofiVolume - 0.05));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setLofiVolume(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setLofiVolume(1);
    }
  }, [lofiVolume, setLofiVolume]);

  const BTN: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 100,
    background: '#1C1C1C',
    border: 'none',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 12,
    transition: 'opacity 200ms ease',
    boxSizing: 'border-box',
    color: '#EFEFFF',
    flexShrink: 0,
  };

  const PCT = Math.round(lofiVolume * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

      <button
        onClick={handleEffectsClick}
        title={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
        aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
        style={{ ...BTN, opacity: soundEnabled ? 1 : 0.45 }}
      >
        <IconDarkWave />
      </button>

      <div
        ref={wrapperRef}
        onMouseEnter={handleWrapperEnter}
        onMouseLeave={handleWrapperLeave}
        onWheel={handleWheel}
        style={{ position: 'relative' }}
      >
        <div
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
          style={{
            position:      'fixed',
            top:           popoverPos.y,
            left:          popoverPos.x,
            zIndex:        9999,
            width:         208,
            background:    '#111111',
            border:        '1px solid rgba(39,39,39,0.4)',
            borderRadius:  16,
            padding:       '14px 16px',
            display:       'flex',
            flexDirection: 'column',
            gap:           10,
            boxShadow:     '0 8px 32px rgba(0,0,0,0.6)',
            opacity:       showPopover ? 1 : 0,
            pointerEvents: showPopover ? 'auto' : 'none',
            transition:    showPopover ? 'opacity 150ms ease-out' : 'opacity 100ms ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: 11, fontFamily: '"Geist Mono", monospace',
              color: 'rgba(239,239,255,0.4)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              Lofi Volume
            </span>
            <span style={{
              fontSize: 11, fontFamily: '"Geist Mono", monospace',
              color: '#EFEFFF', fontWeight: 700,
            }}>
              {PCT}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(239,239,255,0.35)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            </svg>

            <div
              ref={trackRef}
              role="slider"
              aria-label="Volume do lofi"
              aria-valuenow={Math.round(lofiVolume * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              onClick={handleTrackClick}
              onKeyDown={handleSliderKeyDown}
              style={{ flex: 1, height: 24, position: 'relative', cursor: 'pointer', outline: 'none' }}
            >
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 5,
                background: 'rgba(39,39,39,0.6)', borderRadius: 100,
                top: '50%', transform: 'translateY(-50%)',
              }} />
              <div style={{
                position: 'absolute', left: 0, height: 5,
                width: `${lofiVolume * 100}%`,
                background: '#EFEFFF', borderRadius: 100,
                top: '50%', transform: 'translateY(-50%)',
              }} />
              <div
                onMouseDown={e => { e.stopPropagation(); isDragging.current = true; }}
                style={{
                  position: 'absolute',
                  left: `${lofiVolume * 100}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 18, height: 18, borderRadius: 100,
                  background: '#EFEFFF',
                  border: '2.5px solid #111111',
                  boxShadow: '0 0 0 1.5px rgba(39,39,39,0.6)',
                  cursor: 'grab',
                  userSelect: 'none',
                }}
              />
            </div>

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                stroke="rgba(239,239,255,0.7)" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"
                stroke="rgba(239,239,255,0.7)" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"
                stroke="rgba(239,239,255,0.35)" />
            </svg>
          </div>

          <div style={{ height: 1, background: 'rgba(39,39,39,0.4)' }} />

          <span style={{
            fontSize: 10, fontFamily: '"Geist Mono", monospace',
            color: 'rgba(239,239,255,0.25)', textAlign: 'center',
          }}>
            scroll para ajustar
          </span>
        </div>

        <button
          onClick={toggleLofi}
          title={lofiEnabled ? 'Stop lofi · Hover to adjust volume' : 'Play lofi music'}
          aria-label={lofiEnabled ? 'Stop lofi music' : 'Play lofi music'}
          style={{ ...BTN, opacity: lofiEnabled ? 1 : 0.45 }}
        >
          {lofiEnabled ? <IconSpeakerHigh /> : <IconSpeakerSlash />}
        </button>
      </div>

    </div>
  );
}
