'use client';

/* ── DarkSidebar ─────────────────────────────────────────────────────────────
   Figma reference: node 59:1215 — Side Bar (dark version of Strokiy)
   Frame: 320 × 833 px · background: #0A0A0A
   Completely separate from the light FilterBar — different layout, fonts,
   components and interactions.

   FONT: PP Mondwest (Pangram Pangram Foundry) — required for the logo.
   Place PPMondwest-Regular.woff2 in public/fonts/ and the @font-face in
   globals.css is already declared.
──────────────────────────────────────────────────────────────────────────── */

import { useState, useRef, useCallback } from 'react';
import type { FilterState, IllustrationCategory, IllustrationStyle } from '@/types';
import { useThemeContext } from '@/providers/ThemeContext';

/* ── Constants ───────────────────────────────────────────────────────────── */

const BG       = '#0A0A0A';
const TEXT     = '#EFEFFF';
const MUTED    = 'rgba(239,239,255,0.40)';
const INPUT_BG = '#141414';
const BORDER   = 'rgba(255,255,255,0.06)';

/* Diagonal hatching pattern — approximates Figma VERTICAL_HEXAGONAL tile
   at scale:0.24 / opacity:0.2 over #0A0A0A background. */
const HATCH_BG = `
  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Cline x1='0' y1='6' x2='6' y2='0' stroke='rgba(255,255,255,0.05)' stroke-width='1'/%3E%3C/svg%3E")
`.trim();

/* Figma 59:1066 — 8 color swatches for dark mode (different from light) */
const DARK_SWATCHES = [
  '#FF3155', /* red      */
  '#00E499', /* green    */
  '#FF3399', /* hot pink */
  '#EFEFFF', /* lavender */
  '#00AAFF', /* blue     */
  '#FF7733', /* orange   */
  '#FFD819', /* yellow   */
  '#C4BFFF', /* lilac    */
];

const STYLE_OPTIONS: { label: string; value: IllustrationStyle }[] = [
  { label: 'Outline', value: 'outline' },
  { label: 'Bold',    value: 'bold'    },
  { label: 'Fill',    value: 'light'   },
];

const CATEGORIES: { value: IllustrationCategory | ''; label: string }[] = [
  { value: '',          label: 'All shapes' },
  { value: 'athletics', label: 'Athletics'  },
  { value: 'abstract',  label: 'Abstract'   },
  { value: 'nature',    label: 'Nature'     },
  { value: 'tech',      label: 'Tech'       },
  { value: 'people',    label: 'People'     },
];

const ANIM_DIRECTION = ['Static', 'Pulse',   'Orbit'  ];
const ANIM_MOTION    = ['Ripple', 'Morph',   'Draw in'];

/* ── Section label style ─────────────────────────────────────────────────── */
const LABEL: React.CSSProperties = {
  fontFamily:  '"Geist Mono", monospace',
  fontSize:    12,
  fontWeight:  600,
  color:       MUTED,
  lineHeight:  '15.6px',
  display:     'block',
  paddingLeft: 8,
};

/* ── Shared external icon-button style ───────────────────────────────────── */
const ICON_BTN: React.CSSProperties = {
  width:          40,
  height:         40,
  borderRadius:   12,
  background:     INPUT_BG,
  border:         'none',
  cursor:         'pointer',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  flexShrink:     0,
  padding:        0,
  color:          MUTED,
};

/* ── Icons ───────────────────────────────────────────────────────────────── */

/* Search — external button (same paths as FilterBar IconMagnifyingGlass) */
function IconSearchExternal() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.53 12.53L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* CaretUpDown — external category button (same paths as FilterBar) */
function IconCaretUpDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6.25 6.25L10 2.5L13.75 6.25"    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.25 13.75L10 17.5L13.75 13.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


/* ArrowsVertical — Animation Direction (same paths as FilterBar) */
function IconArrowsVertical() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <line  x1="10" y1="2"  x2="10" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 6L10 2L13 6"    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 14L10 18L13 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ArrowsHorizontal — Animation Motion (same paths as FilterBar) */
function IconArrowsHorizontal() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden>
      <line  x1="2"  y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 7L2 10L6 13"    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 7L18 10L14 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


/* ── DarkToggleBar — igual ao ToggleBar do light mas com paleta dark ──────── */

interface DarkToggleBarProps {
  options:  string[];
  active:   string;
  onChange: (v: string) => void;
}

function DarkToggleBar({ options, active, onChange }: DarkToggleBarProps) {
  return (
    <div
      style={{
        display:      'flex',
        width:        '100%',
        height:       40,
        background:   INPUT_BG,
        borderRadius: 12,
        padding:      4,
        gap:          14,
        boxSizing:    'border-box',
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
              background:    isActive ? '#EFEFFF' : 'transparent',
              fontFamily:    '"Geist", sans-serif',
              fontSize:      12,
              fontWeight:    isActive ? 700 : 400,
              lineHeight:    1,
              letterSpacing: '0.02em',
              color:         isActive ? '#0E0E0F' : MUTED,
              transition:    'background 150ms ease, color 150ms ease',
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

/* ── Props ───────────────────────────────────────────────────────────────── */

interface DarkSidebarProps {
  filters:   FilterState;
  onChange:  (filters: FilterState) => void;
  total:     number;
  isDrawer?: boolean;
  isOpen?:   boolean;
  onClose?:  () => void;
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function DarkSidebar({
  filters,
  onChange,
  total,
  isDrawer = false,
  isOpen   = false,
  onClose,
}: DarkSidebarProps) {
  const { toggleTheme } = useThemeContext();

  const [searchFocused,  setSearchFocused ] = useState(false);
  const [isSelectOpen,   setIsSelectOpen  ] = useState(false);
  const [animDirection,  setAnimDirection ] = useState('Static');
  const [animMotion,     setAnimMotion    ] = useState('Ripple');

  const inputRef  = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const set = useCallback(
    (patch: Partial<FilterState>) => onChange({ ...filters, ...patch }),
    [filters, onChange],
  );

  const activeStyleLabel =
    STYLE_OPTIONS.find((o) => o.value === filters.style)?.label ?? '';

  return (
    <aside
      style={{
        position:      isDrawer ? 'fixed' : 'relative',
        left:          0,
        top:           0,
        width:         320,
        minWidth:      320,
        height:        isDrawer ? '100dvh' : '100%',
        background:    BG,
        flexShrink:    0,
        overflow:      'hidden',
        zIndex:        isDrawer ? 100 : 'auto',
        transform:     isDrawer ? (isOpen ? 'translateX(0)' : 'translateX(-320px)') : 'none',
        transition:    isDrawer ? 'transform 300ms ease-out' : 'none',
        display:       'flex',
        flexDirection: 'column',
        color:         TEXT,
      }}
    >

      {/* ══════════════════════════════════════════════════════════════
          ZONA 1 — Logo strip (fixo no topo)
          PP Mondwest logo + side panel button (desktop) ou close (drawer)
      ══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          height:         72,
          minHeight:      72,
          flexShrink:     0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          paddingLeft:    16,
          paddingRight:   16,
        }}
      >
        {/* Logo — double-click para trocar de tema */}
        <span
          onDoubleClick={toggleTheme}
          title="Double-click to switch theme"
          style={{
            fontFamily:       '"PP Mondwest", "Impact", "Arial Black", fantasy',
            fontSize:         40,
            fontWeight:       400,
            color:            TEXT,
            textTransform:    'uppercase',
            letterSpacing:    '-0.8px',
            lineHeight:       '1',
            userSelect:       'none',
            cursor:           'default',
            WebkitTextStroke: `1px ${TEXT}`,
          }}
        >
          STROKiy
        </span>

        {/* Close button — only in drawer mode */}
        {isDrawer ? (
          <button
            onClick={onClose}
            style={{
              width:      32, height:     32,
              background: 'transparent', border: 'none',
              cursor:     'pointer',
              display:    'flex', alignItems: 'center', justifyContent: 'center',
              padding:    0, color: MUTED,
            }}
            title="Fechar"
            aria-label="Fechar sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ZONA 2 — Filtros + download card (scrollável, flex:1)
      ══════════════════════════════════════════════════════════════ */}
      <div
        style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          background:     BG,
          overflowY:      'auto',
          overflowX:      'hidden',
          scrollbarWidth: 'none',
        }}
        className="sidebar-scroll"
      >
        {/* Padding wrapper — só envolve os filtros, não o download card */}
        <div style={{ padding: '44px 16px 32px' }}>
        <div
          style={{
            width:         288,
            display:       'flex',
            flexDirection: 'column',
            gap:           32,
            margin:        '0 auto',
          }}
        >

          {/* ── Search ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={LABEL}>Search</span>

            <div style={{ display: 'flex', gap: 4 }}>

              {/* Input container — sem ícone interno */}
              <div
                style={{
                  flex:        1,
                  height:      40,
                  background:  INPUT_BG,
                  borderRadius: 12,
                  display:     'flex',
                  alignItems:  'center',
                  paddingLeft:  12,
                  paddingRight: 4,
                  gap:          4,
                  boxSizing:   'border-box',
                  border:      searchFocused
                    ? '1px solid rgba(239,239,255,0.20)'
                    : '1px solid transparent',
                  transition: 'border-color 150ms ease',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Search ${total} shapes...`}
                  value={filters.search}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onChange={(e) => set({ search: e.target.value })}
                  style={{
                    flex:       1,
                    background: 'transparent',
                    border:     'none',
                    outline:    'none',
                    fontFamily: '"Geist", sans-serif',
                    fontSize:   12,
                    fontWeight: 400,
                    color:      TEXT,
                    minWidth:   0,
                  }}
                />
                {/* Clear button */}
                {filters.search && (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { set({ search: '' }); inputRef.current?.focus(); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 2, display: 'flex', alignItems: 'center',
                      color: MUTED, flexShrink: 0,
                      opacity: filters.search ? 1 : 0,
                      pointerEvents: filters.search ? 'auto' : 'none',
                      transition: 'opacity 150ms ease',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Botão externo de lupa */}
              <button
                style={ICON_BTN}
                title="Search"
                aria-label="Search"
                onClick={() => inputRef.current?.focus()}
              >
                <IconSearchExternal />
              </button>

            </div>
          </div>

          {/* ── Category ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={LABEL}>Category</span>

            <div style={{ display: 'flex', gap: 4 }}>

              {/* Select container — sem chevron interno */}
              <div
                style={{
                  flex:         1,
                  height:       40,
                  background:   INPUT_BG,
                  borderRadius: 12,
                  position:     'relative',
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
                    paddingLeft:      12,
                    paddingRight:     12,
                    fontFamily:       '"Geist", sans-serif',
                    fontSize:         12,
                    fontWeight:       400,
                    color:            TEXT,
                    cursor:           'pointer',
                    boxSizing:        'border-box',
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value} style={{ background: '#1A1A1A', color: TEXT }}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão externo com rotação */}
              <button
                style={ICON_BTN}
                title="Sort category"
                aria-label="Sort category"
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

          {/* ── Style + Colors ───────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Label + Style toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={LABEL}>Style</span>
              <DarkToggleBar
                options={STYLE_OPTIONS.map((o) => o.label)}
                active={activeStyleLabel}
                onChange={(label) => {
                  const opt  = STYLE_OPTIONS.find((o) => o.label === label);
                  const next = opt?.value === filters.style ? null : (opt?.value ?? null);
                  set({ style: next });
                }}
              />
            </div>

            {/* Color swatches — plain row, no background (like light) */}
            <div
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                padding:        '0 10px',
                height:         40,
                boxSizing:      'border-box',
              }}
            >
              {DARK_SWATCHES.map((color) => {
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
                      flexShrink:    0,
                      padding:       2,
                      boxSizing:     'border-box',
                      outline:       isActive ? `2px solid ${color}` : 'none',
                      outlineOffset: 0,
                      transition:    'outline-color 150ms ease',
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

          {/* ── Animation ────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={LABEL}>Animation</span>

            {/* Direction row */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  width:          40,
                  height:         40,
                  borderRadius:   12,
                  background:     INPUT_BG,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  color:          MUTED,
                }}
              >
                <IconArrowsVertical />
              </div>
              <div style={{ flex: 1 }}>
                <DarkToggleBar
                  options={ANIM_DIRECTION}
                  active={animDirection}
                  onChange={setAnimDirection}
                />
              </div>
            </div>

            {/* Motion row */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div
                style={{
                  width:          40,
                  height:         40,
                  borderRadius:   12,
                  background:     INPUT_BG,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                  color:          MUTED,
                }}
              >
                <IconArrowsHorizontal />
              </div>
              <div style={{ flex: 1 }}>
                <DarkToggleBar
                  options={ANIM_MOTION}
                  active={animMotion}
                  onChange={setAnimMotion}
                />
              </div>
            </div>
          </div>

        </div>
        </div>{/* fim padding wrapper */}

        {/* ══════════════════════════════════════════════════════════════
            Download card — scrollável, full-width (sem padding lateral)
            Figma 59:1230 — diagonal hatch bg, border-top
        ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            display:         'flex',
            flexDirection:   'column',
            backgroundImage: HATCH_BG,
            backgroundSize:  '6px 6px',
            backgroundColor: BG,
            borderTop:       `1px solid ${BORDER}`,
            paddingTop:      24,
            paddingBottom:   0,
          }}
        >
        {/* White/lavender inner card */}
        <div
          style={{
            margin:        '0 16px',
            borderRadius:  12,
            background:    '#EFEFFF',
            padding:       16,
            boxSizing:     'border-box',
            display:       'flex',
            flexDirection: 'column',
            gap:           16,
            boxShadow:     '0 8px 32px rgba(0,0,0,0.32)',
          }}
        >
          {/* Title row */}
          <div
            style={{
              display:        'flex',
              alignItems:     'flex-start',
              justifyContent: 'space-between',
              gap:            8,
            }}
          >
            <span
              style={{
                fontFamily:    '"Geist", sans-serif',
                fontSize:      16,
                fontWeight:    600,
                color:         '#0E0E0F',
                lineHeight:    '24px',
                letterSpacing: '-0.15px',
              }}
            >
              Strokiy production core
            </span>
            {/* "$0" price badge */}
            <span
              style={{
                background:    '#0E0E0F',
                color:         '#EFEFFF',
                fontFamily:    '"Geist", sans-serif',
                fontSize:      12,
                fontWeight:    700,
                borderRadius:  6,
                padding:       4,
                lineHeight:    '16px',
                letterSpacing: '-0.15px',
                flexShrink:    0,
                whiteSpace:    'nowrap',
              }}
            >
              $0
            </span>
          </div>

          {/* Description */}
          <p
            style={{
              fontFamily: '"Geist", sans-serif',
              fontSize:   16,
              fontWeight: 400,
              lineHeight: '24px',
              color:      '#0E0E0F',
              margin:     0,
            }}
          >
            Includes SVG assets and ready React components.
          </p>

          {/* Get resources button */}
          <button
            style={{
              width:          '100%',
              height:         40,
              borderRadius:   12,
              background:     '#0E0E0F',
              color:          '#EFEFFF',
              border:         'none',
              cursor:         'pointer',
              fontFamily:     '"Geist", sans-serif',
              fontSize:       16,
              fontWeight:     600,
              letterSpacing:  '-0.15px',
            }}
          >
            Get resources
          </button>
        </div>

        {/* Footer — "With love, Miguel Paulo ♥" */}
        <div
          style={{
            height:       48,
            display:      'flex',
            alignItems:   'center',
            paddingLeft:  32,
            paddingRight: 16,
            gap:          8,
            opacity:      0.6,  /* aplica-se a ambos os filhos */
          }}
        >
          <span
            style={{
              fontFamily: '"Geist Mono", monospace',
              fontSize:   13,
              fontWeight: 600,
              lineHeight: '18.2px',
              color:      TEXT,
              userSelect: 'none',
            }}
          >
            With love, Miguel Paulo
          </span>
          <span style={{ color: TEXT, fontSize: 13, lineHeight: '18.2px', userSelect: 'none' }}>
            ♥
          </span>
        </div>

        </div>{/* fim download card */}

      </div>{/* fim Zona 2 — scroll */}
    </aside>
  );
}
