'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import BackgroundGradient, { type BlobSpec } from '@/components/ui/BackgroundGradient';
import type { FilterState, IllustrationCategory, IllustrationStyle } from '@/types';
import { useThemeContext } from '@/providers/ThemeContext';

/* ─────────────────────────────────────────────────────────────────
   FIGMA REFERENCE: node 22:3680 — SideBar
   Canvas origin: x:7407, y:3376  |  Frame: 320×848
   All positions below are relative to the SideBar frame origin.
───────────────────────────────────────────────────────────────────

   Layout structure (absolute-positioned sections):
   ┌─────────────────────────────────────────────────────────┐  ← top:0
   │  BackgroundGradient TOP (22:3681)  320×248              │
   │  Header Container     (22:3739)  320×72                 │
   ├─────────────────────────────────────────────────────────┤  ← top:116
   │  Search Container     (22:3688)  288×64   @ left:16     │
   ├─────────────────────────────────────────────────────────┤  ← top:212
   │  Category Container   (22:3701)  288×64   @ left:16     │
   ├─────────────────────────────────────────────────────────┤  ← top:308
   │  Style Container      (22:3713)  288×120  @ left:16     │
   │   └─ Color Options    (22:3724)  288×40                 │
   ├─────────────────────────────────────────────────────────┤  ← top:460
   │  Animation Container  (22:3770)  288×112  @ left:16     │
   ├─────────────────────────────────────────────────────────┤
   │                                                         │  ← 28px gap
   │  BackgroundGradient BOTTOM (22:3744)  320×248           │  ← bottom:0
   └─────────────────────────────────────────────────────────┘
──────────────────────────────────────────────────────────────── */

/* ─── Constants ──────────────────────────────────────────────── */

const CATEGORIES: { value: IllustrationCategory | ''; label: string }[] = [
  { value: '',          label: 'All shapes' },
  { value: 'athletics', label: 'Athletics'  },
  { value: 'abstract',  label: 'Abstract'   },
  { value: 'nature',    label: 'Nature'     },
  { value: 'tech',      label: 'Tech'       },
  { value: 'people',    label: 'People'     },
];

/* "Fill" is the Figma label for data style 'light' */
const STYLE_OPTIONS: { label: string; value: IllustrationStyle }[] = [
  { label: 'Outline', value: 'outline' },
  { label: 'Bold',    value: 'bold'    },
  { label: 'Fill',    value: 'light'   },
];

const ANIM_DIRECTION = ['Static', 'Pulse',  'Orbit'   ];
const ANIM_MOTION    = ['Ripple', 'Morph',  'Draw in' ];

const COLOR_SWATCHES = [
  '#212123',
  '#EFEFFF',
  '#00AAFF',
  '#00E499',
  '#FFD819',
  '#FF7733',
  '#FF3155',
];

/* ─── Shared token values (use CSS vars so dark mode works) ─── */

const LABEL_STYLE: React.CSSProperties = {
  fontFamily:  '"Geist Mono", monospace',
  fontSize:    12,
  fontWeight:  600,
  color:       'var(--color-text-primary)',
  lineHeight:  '15.6px',
  display:     'block',
  paddingLeft: 8,
};

/* ─── Gradient blobs ─────────────────────────────────────────── */

const BOTTOM_BLOBS_OUTER: BlobSpec[] = [
  { color: '#EFEFFF', left: 129, top: 184, w: 93, h: 92 },
  { color: '#00AAFF', left: 198, top: 245, w: 93, h: 95 },
  { color: '#FF3155', left:  35, top: 254, w: 93, h: 95 },
  { color: '#FF7733', left:  13, top: 137, w: 93, h: 94 },
  { color: '#FFD819', left: 113, top:  79, w: 93, h: 95 },
];

const BOTTOM_BLOBS_INNER: BlobSpec[] = [
  { color: '#EFEFFF', left: 120.84, top: 123.66, w: 93.67, h: 56.34 },
  { color: '#00AAFF', left: 190.33, top:  67.74, w: 93.67, h: 58.18 },
  { color: '#FF3155', left:  26.16, top: 107.17, w: 93.67, h: 58.18 },
  { color: '#FF7733', left:   4,    top:  35.52, w: 93.67, h: 57.57 },
  { color: '#FFD819', left: 161.13, top:   0,    w: 93.67, h: 58.18 },
];

/* ─── Toggle bar ─────────────────────────────────────────────── */

interface ToggleBarProps {
  options:  string[];
  active:   string;
  onChange: (v: string) => void;
}

function ToggleBar({ options, active, onChange }: ToggleBarProps) {
  return (
    <div
      style={{
        display:     'flex',
        width:       '100%',
        height:      40,
        background:  'var(--input-bg)',
        borderRadius: 12,
        padding:     4,
        gap:         14,
        boxSizing:   'border-box',
      }}
    >
      {options.map((opt) => {
        const isActive = active === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              flex:          1,
              height:        32,
              borderRadius:  8,
              border:        'none',
              cursor:        'pointer',
              background:    isActive ? 'var(--color-white)' : 'transparent',
              fontFamily:    '"Geist", sans-serif',
              fontSize:      12,
              fontWeight:    isActive ? 700 : 400,
              lineHeight:    1,
              letterSpacing: '0.02em',
              color:         isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              transition:    'background 0.15s ease, color 0.15s ease',
              boxShadow:     isActive ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
              padding:       0,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Logo ───────────────────────────────────────────────────── */

/*
  Figma node 22:3740 — Logo GROUP (156×28)
  Uses currentColor for fill/stroke so the logo adapts to light/dark themes.
*/
export function LogoStrokiy() {
  return (
    <svg
      width="156"
      height="28"
      viewBox="0 0 158 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="logo-inner-1" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.733" result="blur"/>
          <feOffset dy="-3.733" result="offset"/>
          <feFlood floodColor="rgba(255,255,255,0.16)" result="color"/>
          <feComposite in="color" in2="offset" operator="in" result="shadow"/>
          <feComposite in="shadow" in2="SourceGraphic" operator="over"/>
        </filter>
        <filter id="logo-inner-2" x="-20%" y="-20%" width="140%" height="140%">
          <feOffset in="SourceAlpha" dy="-0.933" result="offset"/>
          <feFlood floodColor="rgba(0,0,0,1)" result="color"/>
          <feComposite in="color" in2="offset" operator="in" result="shadow"/>
          <feComposite in="shadow" in2="SourceGraphic" operator="over"/>
        </filter>
      </defs>
      <g filter="url(#logo-inner-1) url(#logo-inner-2)">
        <path paintOrder="stroke fill" stroke="currentColor" strokeWidth="0.858" strokeLinejoin="round" fill="currentColor" d="M15.6372 28.8579H2.49226V25.5703H0.85791V22.2726H2.49226V23.9215H4.13664V25.5703H5.78101V27.2191H13.9929V25.5703H15.6372V19.7994H13.9929V18.1606H10.7141V16.5118H7.42539V14.8629H4.13664V13.2141H2.49226V11.5653H0.85791V5.80441H2.49226V4.15558H4.13664V2.50674H15.6372V4.15558H17.2816V7.45324H15.6372V5.80441H13.9929V4.15558H5.78101V5.80441H4.13664V9.91644H5.78101V11.5653H9.06977V13.2141H12.3485V14.8629H15.6372V16.5118H17.2816V18.1606H18.926V25.5703H17.2816V27.2191H15.6372V28.8579Z"/>
        <path paintOrder="stroke fill" stroke="currentColor" strokeWidth="0.858" strokeLinejoin="round" fill="currentColor" d="M36.9849 28.8579H27.1286V27.2191H30.4174V4.15558H23.8399V5.80441H22.1955V7.45324H20.5612V9.09202H18.9268V5.80441H20.5612V0.85791H22.1955V2.50674H43.5523V0.85791H45.1967V5.80441H43.5523V9.09202H41.908V4.15558H33.6961V27.2191H36.9849V28.8579Z"/>
        <path paintOrder="stroke fill" stroke="currentColor" strokeWidth="0.858" strokeLinejoin="round" fill="currentColor" d="M56.6781 28.8579H46.8218V27.2191H50.1006V4.15558H46.8218V2.50674H63.2456V4.15558H64.8899V5.80441H66.5343V14.0385H64.8899V15.6874H63.2456V17.3362H59.9568V18.975H61.6012V20.6238H63.2456V22.2726H64.8899V23.9215H66.5343V25.5703H68.1687V27.2191H71.4574V28.8579H64.8899V27.2191H63.2456V25.5703H61.6012V23.9215H59.9568V22.2726H58.3124V20.6238H56.6781V18.975H55.0337V17.3362H53.3893V27.2191H56.6781V28.8579ZM53.3893 15.6874H61.6012V14.0385H63.2456V5.80441H61.6012V4.15558H53.3893V15.6874Z"/>
        <path paintOrder="stroke fill" stroke="currentColor" strokeWidth="0.858" strokeLinejoin="round" fill="currentColor" d="M87.0698 4.15558H78.8579V2.50674H87.0698V4.15558ZM78.8579 27.2191H75.5692V25.5703H73.9248V23.9215H72.2804V20.6238H70.6461V10.7409H72.2804V7.45324H73.9248V5.80441H75.5692V4.15558H78.8579V5.80441H77.2135V7.45324H75.5692V10.7409H73.9248V20.6238H75.5692V23.9215H77.2135V25.5703H78.8579V27.2191ZM90.3585 27.2191H87.0698V25.5703H88.7141V23.9215H90.3585V20.6238H91.9929V10.7409H90.3585V7.45324H88.7141V5.80441H87.0698V4.15558H90.3585V5.80441H91.9929V7.45324H93.6372V10.7409H95.2816V20.6238H93.6372V23.9215H91.9929V25.5703H90.3585V27.2191ZM87.0698 28.8579H78.8579V27.2191H87.0698V28.8579Z"/>
        <path paintOrder="stroke fill" stroke="currentColor" strokeWidth="0.858" strokeLinejoin="round" fill="currentColor" d="M105.931 28.8579H96.0745V27.2191H99.3533V4.15558H96.0745V2.50674H105.931V4.15558H102.642V14.0385H104.286V12.3897H105.931V15.6874H107.565V17.3362H109.209V18.975H110.854V20.6238H112.498V22.2726H114.143V23.9215H115.787V25.5703H117.421V27.2191H120.71V28.8579H109.209V27.2191H112.498V25.5703H110.854V23.9215H109.209V22.2726H107.565V20.6238H105.931V18.975H104.286V17.3362H102.642V27.2191H105.931V28.8579ZM114.143 5.80441H112.498V4.15558H109.209V2.50674H119.066V4.15558H114.143V5.80441Z"/>
        <path paintOrder="stroke fill" stroke="currentColor" strokeWidth="0.858" strokeLinejoin="round" fill="currentColor" d="M132.222 28.8579H122.365V27.2191H125.644V4.15558H122.365V2.50674H132.222V4.15558H128.933V27.2191H132.222V28.8579Z"/>
        <path paintOrder="stroke fill" stroke="currentColor" strokeWidth="0.858" strokeLinejoin="round" fill="currentColor" d="M150.29 28.8579H140.434V27.2191H143.723V17.3362H142.079V14.0385H140.434V10.7409H138.79V7.45324H137.145V4.15558H133.877V2.50674H143.723V4.15558H140.434V7.45324H142.079V10.7409H143.723V14.0385H145.367V17.3362H147.002V27.2191H150.29V28.8579ZM153.579 7.45324H151.935V4.15558H148.646V2.50674H156.858V4.15558H153.579V7.45324Z"/>
      </g>
    </svg>
  );
}

/* ─── Icons (all use currentColor for theme adaptation) ──────── */


function IconMagnifyingGlass() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.53 12.53L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCaretUpDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6.25 6.25L10 2.5L13.75 6.25"    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.25 13.75L10 17.5L13.75 13.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowsVertical() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line  x1="10" y1="2"  x2="10" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 6L10 2L13 6"    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14L10 18L13 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowsHorizontal() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line  x1="2"  y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7L2 10L6 13"    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7L18 10L14 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

interface FilterBarProps {
  filters:   FilterState;
  onChange:  (filters: FilterState) => void;
  total:     number;
  isDrawer?: boolean;
  isOpen?:   boolean;
  onClose?:  () => void;
}

export default function FilterBar({ filters, onChange, total, isDrawer = false, isOpen = false, onClose }: FilterBarProps) {
  const { toggleTheme } = useThemeContext();

  const [animDirection,   setAnimDirection  ] = useState('Static');
  const [animMotion,      setAnimMotion     ] = useState('Ripple');
  const [isFocused,       setIsFocused      ] = useState(false);
  const [isSelectOpen,    setIsSelectOpen   ] = useState(false);
  const [searchHovered,   setSearchHovered  ] = useState(false);
  const [categoryHovered, setCategoryHovered] = useState(false);

  /* Easter egg hint — shown once on first visit */
  const [hintShown,   setHintShown  ] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem('strokiy-hint-shown')) return; } catch {}

    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;
    let t4: ReturnType<typeof setTimeout>;

    const t1 = setTimeout(() => {
      setHintShown(true);
      t2 = setTimeout(() => setHintVisible(true), 50);
      t3 = setTimeout(() => {
        setHintVisible(false);
        t4 = setTimeout(() => {
          setHintShown(false);
          try { localStorage.setItem('strokiy-hint-shown', 'true'); } catch {}
        }, 300);
      }, 1550);
    }, 2000);

    /* Cleanup correcto — todos os timeouts cancelados se o componente desmonta */
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const inputRef  = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const set = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange],
  );

  const activeStyleLabel =
    STYLE_OPTIONS.find((o) => o.value === filters.style)?.label ?? '';

  /* Shared icon button style — uses CSS vars */
  const ICON_BTN: React.CSSProperties = {
    width:          40,
    height:         40,
    borderRadius:   12,
    background:     'var(--input-bg)',
    color:          'var(--color-text-primary)',
    border:         'none',
    cursor:         'pointer',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
    padding:        0,
  };

  return (
    <aside
      style={{
        position:      isDrawer ? 'fixed' : 'relative',
        left:          0,
        top:           0,
        width:         320,
        minWidth:      320,
        height:        isDrawer ? '100dvh' : '100%',
        background:    'var(--sidebar-bg)',
        flexShrink:    0,
        overflow:      'hidden',
        zIndex:        isDrawer ? 100 : 'auto',
        transform:     isDrawer ? (isOpen ? 'translateX(0)' : 'translateX(-320px)') : 'none',
        transition:    isDrawer ? 'transform 300ms ease-out' : 'none',
        color:         'var(--color-text-primary)',
        display:       'flex',
        flexDirection: 'column',
      }}
    >

      {/* ── BackgroundGradient TOP ── */}
      <BackgroundGradient
        style={{
          position:      'absolute',
          top:           0,
          left:          0,
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      {/* ── Header ── */}
      <div
        style={{
          position:       'relative',
          height:         72,
          flexShrink:     0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          paddingLeft:    16,
          paddingRight:   16,
          overflow:       'hidden',
          zIndex:         1,
        }}
      >
        {/* Logo — double-click triggers Easter egg theme toggle */}
        <div
          onDoubleClick={toggleTheme}
          style={{ position: 'relative', userSelect: 'none', cursor: 'default' }}
        >
          <span
            style={{
              fontFamily:       '"PP Mondwest", "Impact", "Arial Black", fantasy',
              fontSize:         40,
              fontWeight:       400,
              color:            'var(--color-text-primary)',
              textTransform:    'uppercase',
              letterSpacing:    '-0.8px',
              lineHeight:       '1',
              display:          'block',
              WebkitTextStroke: '1px var(--color-text-primary)',
            }}
          >
            STROKiy
          </span>

          {/* First-visit hint */}
          {hintShown && (
            <span style={{
              position:      'absolute',
              top:           '100%',
              left:          0,
              marginTop:     4,
              fontFamily:    '"Geist Mono", monospace',
              fontSize:      10,
              color:         'var(--color-text-muted)',
              whiteSpace:    'nowrap',
              pointerEvents: 'none',
              opacity:       hintVisible ? 1 : 0,
              transition:    'opacity 300ms ease',
            }}>
              double click to explore
            </span>
          )}
        </div>

        {/* Header right — close (drawer) or side-panel button (desktop) */}
        {isDrawer ? (
          <button
            onClick={onClose}
            style={{
              width:          40,
              height:         40,
              borderRadius:   100,
              background:     'transparent',
              border:         'none',
              cursor:         'pointer',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              padding:        0,
              flexShrink:     0,
              color:          'var(--color-text-primary)',
            }}
            title="Fechar"
            aria-label="Fechar sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        ) : null}
      </div>

      {/* ── Scrollable filter area ── */}
      <div
        className="sidebar-scroll"
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}
      >
        <div style={{ padding: '44px 16px 0' }}>

          {/* Search ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            <span style={LABEL_STYLE}>Search</span>

            <div style={{ display: 'flex', gap: 4, height: 40 }}>
              <div
                onMouseEnter={() => setSearchHovered(true)}
                onMouseLeave={() => setSearchHovered(false)}
                style={{
                  flex:         1,
                  height:       40,
                  background:   searchHovered && !isFocused ? 'var(--input-bg-hover)' : 'var(--input-bg)',
                  borderRadius: 12,
                  display:      'flex',
                  alignItems:   'center',
                  paddingLeft:  8,
                  paddingRight: 4,
                  gap:          4,
                  boxSizing:    'border-box',
                  boxShadow:    isFocused ? '0 0 0 2px var(--color-text-primary)' : 'none',
                  transition:   'background 150ms ease, box-shadow 150ms ease',
                  color:        'var(--color-text-primary)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  className="strokiy-search"
                  placeholder={`Search ${total} shapes...`}
                  value={filters.search}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => set({ search: e.target.value })}
                  style={{
                    flex:          1,
                    height:        '100%',
                    background:    'transparent',
                    border:        'none',
                    outline:       'none',
                    fontFamily:    '"Geist", sans-serif',
                    fontSize:      12,
                    fontWeight:    400,
                    color:         'var(--color-text-primary)',
                    letterSpacing: '0.24px',
                    lineHeight:    '130%',
                    minWidth:      0,
                  }}
                />
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => { set({ search: '' }); inputRef.current?.focus(); }}
                  tabIndex={-1}
                  style={{
                    background:    'none',
                    border:        'none',
                    cursor:        'pointer',
                    padding:       2,
                    display:       'flex',
                    alignItems:    'center',
                    color:         'var(--color-text-primary)',
                    opacity:       filters.search ? 1 : 0,
                    pointerEvents: filters.search ? 'auto' : 'none',
                    transition:    'opacity 150ms ease',
                    flexShrink:    0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <button style={ICON_BTN} title="Search" onClick={() => inputRef.current?.focus()}>
                <IconMagnifyingGlass />
              </button>
            </div>
          </div>

          {/* Category ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            <span style={LABEL_STYLE}>Category</span>

            <div style={{ display: 'flex', gap: 4, height: 40 }}>
              <div
                onMouseEnter={() => setCategoryHovered(true)}
                onMouseLeave={() => setCategoryHovered(false)}
                style={{
                  flex:         1,
                  height:       40,
                  background:   categoryHovered ? 'var(--input-bg-hover)' : 'var(--input-bg)',
                  borderRadius: 12,
                  position:     'relative',
                  transition:   'background 150ms ease',
                }}
              >
                <select
                  ref={selectRef}
                  value={filters.category ?? ''}
                  onFocus={() => setIsSelectOpen(true)}
                  onBlur={() => setIsSelectOpen(false)}
                  onChange={(e) => {
                    set({ category: (e.target.value as IllustrationCategory) || null });
                    setIsSelectOpen(false);
                  }}
                  style={{
                    position:         'absolute',
                    inset:            0,
                    width:            '100%',
                    height:           '100%',
                    background:       'transparent',
                    border:           'none',
                    outline:          'none',
                    appearance:       'none',
                    WebkitAppearance: 'none',
                    paddingLeft:      8,
                    paddingRight:     8,
                    fontFamily:       '"Geist", sans-serif',
                    fontSize:         12,
                    fontWeight:       400,
                    color:            'var(--color-text-primary)',
                    letterSpacing:    '0.24px',
                    lineHeight:       '130%',
                    cursor:           'pointer',
                    boxSizing:        'border-box',
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                style={ICON_BTN}
                title="Sort"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectRef.current?.focus()}
              >
                <span
                  style={{
                    display:    'flex',
                    transform:  isSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                  }}
                >
                  <IconCaretUpDown />
                </span>
              </button>
            </div>
          </div>

          {/* Style + Colors ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={LABEL_STYLE}>Style</span>
              <ToggleBar
                options={STYLE_OPTIONS.map((o) => o.label)}
                active={activeStyleLabel}
                onChange={(label) => {
                  const opt  = STYLE_OPTIONS.find((o) => o.label === label);
                  const next = opt?.value === filters.style ? null : (opt?.value ?? null);
                  set({ style: next });
                }}
              />
            </div>

            <div
              style={{
                width:          288,
                height:         40,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '0 10px',
                boxSizing:      'border-box',
              }}
            >
              {COLOR_SWATCHES.map((color) => {
                const isActive = filters.color === color;
                return (
                  <button
                    key={color}
                    onClick={() => set({ color: isActive ? null : color })}
                    title={color}
                    style={{
                      width:         28,
                      height:        28,
                      borderRadius:  16,
                      border:        'none',
                      background:    'transparent',
                      cursor:        'pointer',
                      padding:       2,
                      flexShrink:    0,
                      boxSizing:     'border-box',
                      outline:       isActive ? `2px solid ${color}` : 'none',
                      outlineOffset: 0,
                      transition:    'outline-color 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        display:      'block',
                        width:        '100%',
                        height:       '100%',
                        borderRadius: '50%',
                        background:   color,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Animation ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
            <span style={LABEL_STYLE}>Animation</span>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 40 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: 'var(--color-text-primary)',
              }}>
                <IconArrowsVertical />
              </div>
              <div style={{ flex: 1 }}>
                <ToggleBar options={ANIM_DIRECTION} active={animDirection} onChange={setAnimDirection} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 40 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                color: 'var(--color-text-primary)',
              }}>
                <IconArrowsHorizontal />
              </div>
              <div style={{ flex: 1 }}>
                <ToggleBar options={ANIM_MOTION} active={animMotion} onChange={setAnimMotion} />
              </div>
            </div>
          </div>

        </div>{/* fim wrapper padding lateral */}

        {/* ── BackgroundGradient BOTTOM ── */}
        <BackgroundGradient
          blobs={BOTTOM_BLOBS_OUTER}
          style={{ flexShrink: 0 }}
        >
          <div
            style={{
              position:     'absolute',
              left:         16,
              top:          52,
              width:        288,
              height:       180,
              borderRadius: 16,
              overflow:     'hidden',
            }}
          >
            {BOTTOM_BLOBS_INNER.map((b) => (
              <div
                key={b.color + b.left + b.top}
                style={{
                  position:     'absolute',
                  width:        b.w,
                  height:       b.h,
                  borderRadius: '50%',
                  background:   b.color,
                  filter:       'blur(114.2px)',
                  top:          b.top,
                  left:         b.left,
                }}
              />
            ))}

            {/* White card */}
            <div
              style={{
                position:       'absolute',
                top:            6,
                left:           6,
                width:          276,
                height:         168,
                borderRadius:   12,
                background:     'var(--color-white)',
                overflow:       'hidden',
                padding:        16,
                boxSizing:      'border-box',
                display:        'flex',
                flexDirection:  'column',
                justifyContent: 'center',
                gap:            16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily:    '"Geist", sans-serif',
                      fontSize:      16,
                      fontWeight:    600,
                      letterSpacing: '-0.15px',
                      color:         'var(--color-text-primary)',
                      lineHeight:    '24px',
                    }}
                  >
                    Strokiy production core
                  </span>
                  <span
                    style={{
                      background:   'var(--color-text-primary)',
                      color:        'var(--color-white)',
                      fontFamily:   '"Geist", sans-serif',
                      fontSize:     12,
                      fontWeight:   600,
                      borderRadius: 6,
                      padding:      4,
                      lineHeight:   1,
                      flexShrink:   0,
                      marginLeft:   8,
                    }}
                  >
                    $0
                  </span>
                </div>

                <p
                  style={{
                    fontFamily: '"Geist", sans-serif',
                    fontSize:   16,
                    fontWeight: 400,
                    lineHeight: '24px',
                    margin:     0,
                    color:      'var(--color-text-primary)',
                  }}
                >
                  <span style={{ color: 'var(--color-text-muted)' }}>Includes</span>
                  <span style={{ color: 'var(--color-text-primary)' }}> SVG assets </span>
                  <span style={{ color: 'var(--color-text-muted)' }}>and ready</span>
                  <span style={{ color: 'var(--color-text-primary)' }}> React components.</span>
                </p>
              </div>

              <button
                onClick={() => window.open('mailto:hello@strokiy.com?subject=Strokiy Production Core', '_blank')}
                style={{
                  width:         '100%',
                  height:        40,
                  borderRadius:  12,
                  background:    'var(--color-text-primary)',
                  color:         'var(--color-white)',
                  border:        'none',
                  cursor:        'pointer',
                  fontFamily:    '"Geist", sans-serif',
                  fontSize:      16,
                  fontWeight:    600,
                  letterSpacing: '-0.15px',
                  lineHeight:    '24px',
                  boxShadow: [
                    '0 1px 3px rgba(0,0,0,0.15)',
                    '0 6px 6px rgba(0,0,0,0.13)',
                    '0 13px 8px rgba(0,0,0,0.08)',
                    '0 23px 9px rgba(0,0,0,0.02)',
                    '0 37px 10px rgba(0,0,0,0)',
                  ].join(', '),
                }}
              >
                Get resources
              </button>
            </div>
          </div>
        </BackgroundGradient>

      </div>{/* fim área scrollável */}

    </aside>
  );
}
