'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FilterBar    from '@/components/gallery/FilterBar';
import DarkSidebar  from '@/components/gallery/DarkSidebar';
import IllustrationGrid from '@/components/gallery/IllustrationGrid';
import Overlay from '@/components/ui/Overlay';
import CountryFlag from '@/components/ui/CountryFlag';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useFilters } from '@/providers/FilterContext';
import { useSoundContext } from '@/providers/SoundContext';
import { useThemeContext } from '@/providers/ThemeContext';
import { getIllustrations } from '@/lib/illustrations';

/* ── Timezone → country code map ── */
const TZ_TO_COUNTRY: Record<string, string> = {
  'Africa/Luanda': 'AO', 'Africa/Lagos': 'NG', 'Africa/Nairobi': 'KE',
  'Africa/Cairo': 'EG', 'Africa/Johannesburg': 'ZA', 'Africa/Accra': 'GH',
  'Africa/Casablanca': 'MA', 'Africa/Abidjan': 'CI', 'Africa/Addis_Ababa': 'ET',
  'Africa/Kampala': 'UG', 'Africa/Dar_es_Salaam': 'TZ', 'Africa/Khartoum': 'SD',
  'Africa/Maputo': 'MZ', 'Africa/Douala': 'CM', 'Africa/Kinshasa': 'CD',
  'Africa/Dakar': 'SN', 'Africa/Algiers': 'DZ', 'Africa/Tunis': 'TN',
  'Africa/Tripoli': 'LY', 'Africa/Harare': 'ZW', 'Africa/Lusaka': 'ZM',
  'Africa/Windhoek': 'NA',
  'Europe/Lisbon': 'PT', 'Europe/London': 'GB', 'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
  'Europe/Copenhagen': 'DK', 'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO',
  'Europe/Athens': 'GR', 'Europe/Istanbul': 'TR', 'Europe/Moscow': 'RU',
  'Europe/Kiev': 'UA', 'Europe/Kyiv': 'UA', 'Europe/Dublin': 'IE',
  'Europe/Riga': 'LV', 'Europe/Tallinn': 'EE', 'Europe/Vilnius': 'LT',
  'Europe/Sofia': 'BG',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Anchorage': 'US', 'America/Honolulu': 'US',
  'America/Sao_Paulo': 'BR', 'America/Manaus': 'BR', 'America/Toronto': 'CA',
  'America/Vancouver': 'CA', 'America/Mexico_City': 'MX', 'America/Bogota': 'CO',
  'America/Lima': 'PE', 'America/Santiago': 'CL',
  'America/Argentina/Buenos_Aires': 'AR', 'America/Caracas': 'VE',
  'America/Havana': 'CU', 'America/Santo_Domingo': 'DO', 'America/Guatemala': 'GT',
  'America/Montevideo': 'UY', 'America/La_Paz': 'BO', 'America/Asuncion': 'PY',
  'America/Guayaquil': 'EC', 'America/Panama': 'PA',
  'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Seoul': 'KR',
  'Asia/Singapore': 'SG', 'Asia/Dubai': 'AE', 'Asia/Kolkata': 'IN',
  'Asia/Bangkok': 'TH', 'Asia/Jakarta': 'ID', 'Asia/Taipei': 'TW',
  'Asia/Hong_Kong': 'HK', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Manila': 'PH',
  'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD', 'Asia/Riyadh': 'SA',
  'Asia/Tehran': 'IR', 'Asia/Baghdad': 'IQ', 'Asia/Beirut': 'LB',
  'Asia/Jerusalem': 'IL', 'Asia/Almaty': 'KZ',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Perth': 'AU',
  'Pacific/Auckland': 'NZ', 'Pacific/Honolulu': 'US',
};

/* ── Time badge — client only ── */
function TimeBadge() {
  const [display, setDisplay] = useState({ time: '', tz: '', country: 'AO' });

  useEffect(() => {
    const userTz  = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = TZ_TO_COUNTRY[userTz] ?? 'AO';

    const fmt = () => {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: userTz, hour: '2-digit', minute: '2-digit',
        second: '2-digit', hour12: false, timeZoneName: 'short',
      }).formatToParts(new Date());
      const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
      return { time: `${get('hour')}:${get('minute')}:${get('second')}`, tz: get('timeZoneName'), country };
    };

    setDisplay(fmt());
    const id = setInterval(() => setDisplay(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const ready = display.time !== '';

  const TEXT: React.CSSProperties = {
    fontFamily: '"Geist Mono", monospace', fontSize: 16, fontWeight: 700,
    color: '#212123', textTransform: 'uppercase', letterSpacing: 0,
    lineHeight: '24px', whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: '#FFFFFF', borderRadius: 100, height: 40, padding: 8, boxSizing: 'border-box',
      opacity: ready ? 1 : 0,
      transition: 'opacity 200ms ease',
    }}>
      <div style={{ paddingLeft: 4 }}>
        <span style={TEXT}>{display.time} {display.tz}</span>
      </div>
      <span style={TEXT}>-</span>
      <CountryFlag country={display.country} size={20} />
    </div>
  );
}

/* ── Ícone sliders (filtro) ── */
function IconSliders() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="3" y1="5"  x2="17" y2="5"  stroke="#212123" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="17" y2="10" stroke="#212123" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="15" x2="17" y2="15" stroke="#212123" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="7"  cy="5"  r="2" fill="#FFFFFF" stroke="#212123" strokeWidth="2"/>
      <circle cx="13" cy="10" r="2" fill="#FFFFFF" stroke="#212123" strokeWidth="2"/>
      <circle cx="7"  cy="15" r="2" fill="#FFFFFF" stroke="#212123" strokeWidth="2"/>
    </svg>
  );
}

/* ── Botão filtro (tablet/mobile) ── */
function FilterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40, borderRadius: 100, background: '#FFFFFF',
        border: 'none', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 0,
      }}
      title="Filtros"
      aria-label="Abrir filtros"
    >
      <IconSliders />
    </button>
  );
}

/* ── Figma 24:4883 — Waveform (som activo)
   Paths exactos do export SVG do Figma (viewBox 32×32, escala 2×).
   Animação: transform-box:fill-box + transform-origin:center garante
   que cada barra escala a partir do seu próprio centro em todos os browsers. ── */
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

/* stroke-width calibrado para ~3px visual a 20×20:
   1.5 (Figma export 2×) → ÷2 = 0.75px@16px → demasiado fino.
   3px visual @ 20px render = 3 × (32/20) = 4.8 → usar 5 (arredondado).      */
const SW = 3.2;

/* size: 20 no light (padrão), 16 no dark — mesmo viewBox, mesmo comportamento */
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

/* ── Figma 24:4890 — WaveformSlash (som desactivado) ── */
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

/* ── Icon/Wave — State=Waveform (Figma node I59:1213;2334:7631)
   5 linhas verticais, coordenadas exactas do vectorPaths + relativeTransform ── */
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

/* ── Botão Wave ── */
function WaveButton() {
  const { soundEnabled, toggle } = useSoundContext();

  /* Confirma sempre com som ao clicar (directo, ignora soundEnabled) */
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
        color: '#212123',   /* currentColor herdado pelos SVGs */
      }}
    >
      {soundEnabled ? <IconWaveform animate /> : <IconWaveformSlash />}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   DARK HEADER COMPONENTS
   ══════════════════════════════════════════════════════════════════ */

/* ── Dark time badge — inline text, no pill ── */
function DarkTimeBadge() {
  const [display, setDisplay] = useState({ time: '', tz: '', countryName: 'Angola' });

  useEffect(() => {
    const userTz  = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const code    = TZ_TO_COUNTRY[userTz] ?? 'AO';

    let countryName = code;
    try {
      const names = new Intl.DisplayNames(['en'], { type: 'region' });
      countryName = names.of(code) ?? code;
    } catch {}

    const fmt = () => {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: userTz, hour: '2-digit', minute: '2-digit',
        second: '2-digit', hour12: false, timeZoneName: 'short',
      }).formatToParts(new Date());
      const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
      return { time: `${get('hour')}:${get('minute')}:${get('second')}`, tz: get('timeZoneName'), countryName };
    };

    setDisplay(fmt());
    const id = setInterval(() => setDisplay(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const ready = display.time !== '';

  const TEXT: React.CSSProperties = {
    fontFamily: '"Geist Mono", monospace',
    fontSize: 13,
    fontWeight: 700,
    color: '#EFEFFF',
    textTransform: 'uppercase',
    letterSpacing: 0,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      opacity: ready ? 1 : 0,
      transition: 'opacity 200ms ease',
    }}>
      <span style={TEXT}>{display.countryName}</span>
      <span style={TEXT}>{display.time} {display.tz}</span>
    </div>
  );
}

/* ── Icon/Speakers — paths exactos do Figma (node 59:1214, file s2H6SoZwtpTC0zkEatgn0b)
   Coordenadas absolutas calculadas a partir de vectorPaths + relativeTransform de cada vector. ── */

/* Paths partilhados pelos dois estados (High e Slash) */
function SpeakerPaths() {
  return (
    <>
      {/* Corpo inferior + cone — node 2382:6251 @ (1.5, 5.168) */}
      <path
        d="M9.5 9.65V14L5 10.5H2C1.87 10.5 1.74 10.45 1.65 10.35C1.55 10.26 1.5 10.13 1.5 10V6C1.5 5.87 1.55 5.74 1.65 5.65C1.74 5.55 1.87 5.5 2 5.5H5L5.43 5.17"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* Cone superior — node 2382:6252 @ (7.406, 2) */}
      <path
        d="M7.41 3.63L9.5 2V5.93"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* Divisor vertical — node 2382:6250 @ (5, 5.5) */}
      <line x1="5" y1="5.5" x2="5" y2="10.5" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Arco próximo — node 2382:6253 @ (12, 6.68) */}
      <path
        d="M12 6.68C12.27 6.99 12.44 7.37 12.49 7.78C12.53 8.19 12.45 8.6 12.25 8.96"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      {/* Arco afastado — node 2382:6254 @ (13.855, 5) */}
      <path
        d="M13.86 5C14.57 5.8 14.98 6.83 15 7.91C15.02 8.98 14.66 10.03 13.98 10.86"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
    </>
  );
}

/* State=SpeakerHigh — lofi ON (Figma node 24:4904, vectorPaths exactos) */
function IconSpeakerHigh() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      {/* Corpo + cone — node 24:4906 @ (1.5, 2), path fechado */}
      <path
        d="M5 10.5L2 10.5C1.867 10.5 1.74 10.447 1.646 10.354C1.553 10.26 1.5 10.133 1.5 10L1.5 6C1.5 5.867 1.553 5.74 1.646 5.646C1.74 5.553 1.867 5.5 2 5.5L5 5.5L9.5 2L9.5 14L5 10.5Z"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* Divisor vertical — node 24:4907 @ (5, 5.5) */}
      <line x1="5" y1="5.5" x2="5" y2="10.5" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Arco próximo — node 24:4908 @ (12, 6.68) */}
      <path
        d="M12 6.68C12.32 7.05 12.5 7.52 12.5 8C12.5 8.49 12.32 8.96 12 9.32"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
      {/* Arco afastado — node 24:4909 @ (13.856, 5) */}
      <path
        d="M13.856 5C14.594 5.825 15.001 6.893 15.001 8C15.001 9.107 14.594 10.175 13.856 11"
        stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round" fill="none"
      />
    </svg>
  );
}

/* State=SpeakerSlash — lofi OFF (node 59:1214) — slash diagonal de (3,2.5)→(13,13.5) */
function IconSpeakerSlash() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <SpeakerPaths />
      {/* Slash — backing escuro separa do icon, linha branca por cima */}
      <line x1="3" y1="2.5" x2="13" y2="13.5" stroke="#111111" strokeWidth="4"   strokeLinecap="round"/>
      <line x1="3" y1="2.5" x2="13" y2="13.5" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Dark sound buttons — botão 1: efeitos sonoros | botão 2: lofi ambient ── */
function DarkSoundButtons() {
  const { soundEnabled, toggle, lofiEnabled, toggleLofi, lofiVolume, setLofiVolume } = useSoundContext();

  /* ── Refs ── */
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const trackRef     = useRef<HTMLDivElement>(null);
  const hideTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging   = useRef(false);

  /* ── State ── */
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos,  setPopoverPos]  = useState({ x: 0, y: 0 });

  /* ── Effects button ── */
  const handleEffectsClick = useCallback(() => {
    try {
      const a = new Audio('/sounds/button-1.wav');
      a.volume = 0.4;
      a.play().catch(() => {});
    } catch {}
    toggle();
  }, [toggle]);

  /* ── Hover: show popover, compute position from wrapper rect ── */
  const handleWrapperEnter = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (wrapperRef.current) {
      const r            = wrapperRef.current.getBoundingClientRect();
      const popoverWidth = 208;
      /* Alinha pela direita do botão, garante que não sai do viewport */
      const left = Math.max(8, r.right - popoverWidth);
      setPopoverPos({ x: left, y: r.bottom + 8 });
    }
    setShowPopover(true);
  }, []);

  /* 80 ms grace — enough to cross the 8px gap without flicker */
  const handleWrapperLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => setShowPopover(false), 80);
  }, []);

  const handlePopoverEnter = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const handlePopoverLeave = useCallback(() => {
    setShowPopover(false);
  }, []);

  /* ── Scroll on wrapper to adjust volume ── */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setLofiVolume(Math.max(0, Math.min(1, lofiVolume + (e.deltaY > 0 ? -0.05 : 0.05))));
  }, [lofiVolume, setLofiVolume]);

  /* ── Click on track ── */
  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    setLofiVolume(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  }, [setLofiVolume]);

  /* ── Drag on thumb — global mousemove / mouseup ── */
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

  /* ── Shared button style ── */
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

      {/* ── Botão 1 — Efeitos sonoros ── */}
      <button
        onClick={handleEffectsClick}
        title={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
        aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
        style={{ ...BTN, opacity: soundEnabled ? 1 : 0.45 }}
      >
        <IconDarkWave />
      </button>

      {/* ── Botão 2 — Lofi + popover hover wrapper ── */}
      <div
        ref={wrapperRef}
        onMouseEnter={handleWrapperEnter}
        onMouseLeave={handleWrapperLeave}
        onWheel={handleWheel}
        style={{ position: 'relative' }}
      >

        {/* ── Volume popover — always in DOM, toggled via opacity ── */}
        <div
          onMouseEnter={handlePopoverEnter}
          onMouseLeave={handlePopoverLeave}
          style={{
            position:     'fixed',
            top:          popoverPos.y,
            left:         popoverPos.x,
            zIndex:       9999,
            width:        208,
            background:   '#111111',
            border:       '1px solid rgba(39,39,39,0.4)',
            borderRadius: 16,
            padding:      '14px 16px',
            display:      'flex',
            flexDirection:'column',
            gap:          10,
            boxShadow:    '0 8px 32px rgba(0,0,0,0.6)',
            opacity:      showPopover ? 1 : 0,
            pointerEvents:showPopover ? 'auto' : 'none',
            transition:   showPopover
              ? 'opacity 150ms ease-out'
              : 'opacity 100ms ease',
          }}
        >
          {/* Header row */}
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

          {/* Slider row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Icon: volume-off */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(239,239,255,0.35)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            </svg>

            {/* Track container — click to seek */}
            <div
              ref={trackRef}
              onClick={handleTrackClick}
              style={{ flex: 1, height: 24, position: 'relative', cursor: 'pointer' }}
            >
              {/* Track background */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 5,
                background: 'rgba(39,39,39,0.6)', borderRadius: 100,
                top: '50%', transform: 'translateY(-50%)',
              }} />
              {/* Track fill */}
              <div style={{
                position: 'absolute', left: 0, height: 5,
                width: `${lofiVolume * 100}%`,
                background: '#EFEFFF', borderRadius: 100,
                top: '50%', transform: 'translateY(-50%)',
              }} />
              {/* Thumb */}
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

            {/* Icon: volume-high */}
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

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(39,39,39,0.4)' }} />

          {/* Hint */}
          <span style={{
            fontSize: 10, fontFamily: '"Geist Mono", monospace',
            color: 'rgba(239,239,255,0.25)', textAlign: 'center',
          }}>
            scroll para ajustar
          </span>
        </div>

        {/* Lofi button */}
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


/* Diagonal hatch overlay — mesmo tile do DarkSidebar */
const HEADER_HATCH = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Cline x1='0' y1='6' x2='6' y2='0' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/svg%3E")`;

/* ── Page ── */
export default function HomePage() {
  const { filters, setFilters } = useFilters();
  const { play }                = useSoundContext();
  const { theme }               = useThemeContext();
  const isDark                  = theme === 'dark';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bp = useBreakpoint();
  const router = useRouter();

  const openDrawer  = useCallback(() => { setDrawerOpen(true);  play('sidebar-open');  }, [play]);
  const closeDrawer = useCallback(() => { setDrawerOpen(false); play('sidebar-close'); }, [play]);

  const illustrations = useMemo(() => getIllustrations(filters), [filters]);
  const totalCount    = useMemo(
    () => getIllustrations({ category: null, style: null, color: null, search: '' }).length,
    [],
  );

  const isDesktop = bp === 'desktop';
  const isTablet  = bp === 'tablet';
  const isMobile  = bp === 'mobile';

  /* Fecha o drawer se o breakpoint mudar para desktop */
  useEffect(() => {
    if (isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>

      {/* ── Sidebar / Drawer ── */}
      {!isMobile && (
        <>
          {isTablet && <Overlay isOpen={drawerOpen} onClick={closeDrawer} />}
          {isDark ? (
            <DarkSidebar
              filters={filters}
              onChange={setFilters}
              total={totalCount}
              isDrawer={isTablet}
              isOpen={drawerOpen}
              onClose={closeDrawer}
            />
          ) : (
            <FilterBar
              filters={filters}
              onChange={setFilters}
              total={totalCount}
              isDrawer={isTablet}
              isOpen={drawerOpen}
              onClose={closeDrawer}
            />
          )}
        </>
      )}

      {/* ── Área de conteúdo ── */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative',
        /* no tablet/mobile, ocupa 100% */
        width: isDesktop ? undefined : '100%',
      }}>

        {/* ── Navbar + info bar ── */}
        {isDark ? (
          <>
            <header style={{
              height: 80, minHeight: 80,
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              padding: '0 32px',
              flexShrink: 0,
              boxSizing: 'border-box',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/avatar.jpg" alt="Avatar" width={40} height={40}
                  style={{ borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <DarkTimeBadge />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <DarkSoundButtons />
              </div>
            </header>
          </>
        ) : (
          <header style={{
            height: 72, minHeight: 72,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: `0 ${isMobile ? 16 : 16}px`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isDesktop && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src="/assets/avatar.jpg" alt="Avatar" width={40} height={40}
                  style={{ borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
              )}
              {isTablet && <FilterButton onClick={openDrawer} />}
              {isMobile && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src="/assets/icons/svg/logo-strokiy.svg" alt="Strokiy" height={20}
                  style={{ display: 'block', objectFit: 'contain' }} />
              )}
            </div>
            <div>
              {!isMobile && <TimeBadge />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {isMobile ? (
                <FilterButton onClick={() => router.push('/filters')} />
              ) : (
                <WaveButton />
              )}
            </div>
          </header>
        )}

        {/* ── Grid ── */}
        <main style={{
          flex: 1, overflowY: 'auto',
          paddingTop:   isMobile ? 16 : 44,
          paddingLeft:  isMobile ? 12 : 16,
          paddingRight: isMobile ? 12 : 16,
        }}>
          <IllustrationGrid illustrations={illustrations} breakpoint={bp} />
        </main>

        {/* ── Fade gradient — fixed ao viewport, começa depois da sidebar ── */}
        <div style={{
          position:      'fixed',
          bottom:        0,
          left:          isDesktop ? 320 : 0,
          right:         0,
          height:        200,
          background:    isDark
            ? 'linear-gradient(to bottom, transparent 0%, rgba(14,14,15,0.4) 40%, rgba(14,14,15,0.85) 75%, #0E0E0F 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(245,245,249,0.4) 40%, rgba(245,245,249,0.85) 75%, #F5F5F9 100%)',
          pointerEvents: 'none',
          zIndex:        10,
        }} />
      </div>
    </div>
  );
}
