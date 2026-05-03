'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFilters, DEFAULT_FILTERS } from '@/providers/FilterContext';
import type { FilterState, IllustrationCategory, IllustrationStyle } from '@/types';
import { getIllustrations } from '@/lib/illustrations';

/* ─── Constants ─────────────────────────────────────────────── */

const INPUT_BG = '#F2F2F2';

const CATEGORIES: { value: IllustrationCategory | ''; label: string }[] = [
  { value: '',          label: 'All shapes' },
  { value: 'athletics', label: 'Athletics'  },
  { value: 'abstract',  label: 'Abstract'   },
  { value: 'nature',    label: 'Nature'     },
  { value: 'tech',      label: 'Tech'       },
  { value: 'people',    label: 'People'     },
];

const STYLE_OPTIONS: { label: string; value: IllustrationStyle }[] = [
  { label: 'Outline', value: 'outline' },
  { label: 'Bold',    value: 'bold'    },
  { label: 'Fill',    value: 'light'   },
];

const ANIM_DIRECTION = ['Static', 'Pulse',  'Orbit'  ];
const ANIM_MOTION    = ['Ripple', 'Morph',  'Draw in'];

const COLOR_SWATCHES = [
  '#212123', '#EFEFFF', '#00AAFF', '#00E499', '#FFD819', '#FF7733', '#FF3155',
];

const LABEL_STYLE: React.CSSProperties = {
  fontFamily:  '"Geist Mono", monospace',
  fontSize:    12,
  fontWeight:  600,
  color:       '#212123',
  lineHeight:  '15.6px',
  display:     'block',
  paddingLeft: 8,
};

const ICON_BTN: React.CSSProperties = {
  width: 40, height: 40, borderRadius: 12, background: INPUT_BG,
  border: 'none', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0,
};

/* ─── ToggleBar ─────────────────────────────────────────────── */

function ToggleBar({ options, active, onChange }: {
  options: string[]; active: string; onChange: (v: string) => void;
}) {
  return (
    <div style={{
      display: 'flex', width: '100%', height: 40, background: INPUT_BG,
      borderRadius: 12, padding: 4, gap: 14, boxSizing: 'border-box',
    }}>
      {options.map((opt) => {
        const isActive = active === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            flex: 1, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
            background:    isActive ? '#FFFFFF' : 'transparent',
            fontFamily:    '"Geist", sans-serif', fontSize: 12,
            fontWeight:    isActive ? 700 : 400, lineHeight: 1,
            letterSpacing: '0.02em',
            color:         isActive ? '#212123' : '#888888',
            transition:    'background 0.15s ease, color 0.15s ease',
            boxShadow:     isActive ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
            padding:       0,
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────────────── */

function IconMagnifyingGlass() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5" stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.53 12.53L16 16" stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCaretUpDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6.25 6.25L10 2.5L13.75 6.25"    stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.25 13.75L10 17.5L13.75 13.75" stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconArrowsVertical() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="10" y1="2" x2="10" y2="18" stroke="#212123" strokeWidth="2" strokeLinecap="round"/>
      <path d="M7 6L10 2L13 6"    stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 14L10 18L13 14" stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconArrowsHorizontal() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="2" y1="10" x2="18" y2="10" stroke="#212123" strokeWidth="2" strokeLinecap="round"/>
      <path d="M6 7L2 10L6 13"    stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 7L18 10L14 13" stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */

export default function FiltersPage() {
  const router  = useRouter();
  const { filters, setFilters } = useFilters();

  /* Local state — só aplica ao clicar Apply */
  const [local, setLocal]           = useState<FilterState>(filters);
  const [animDirection, setAnimDir] = useState('Static');
  const [animMotion,    setAnimMot] = useState('Ripple');
  const [isFocused,     setFocused] = useState(false);
  const [isSelectOpen,  setSelectOpen] = useState(false);
  const inputRef  = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const set = (patch: Partial<FilterState>) => setLocal(prev => ({ ...prev, ...patch }));

  const totalCount = getIllustrations({
    category: null, style: null, color: null, search: '',
  }).length;

  const activeStyleLabel = STYLE_OPTIONS.find(o => o.value === local.style)?.label ?? '';

  const handleApply = () => {
    setFilters(local);
    router.back();
  };

  const handleReset = () => {
    setLocal(DEFAULT_FILTERS);
  };

  return (
    <div style={{ background: '#F5F5F9', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header fixo ── */}
      <header style={{
        position:       'sticky',
        top:            0,
        height:         60,
        background:     '#F5F5F9',
        display:        'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems:     'center',
        padding:        '0 16px',
        zIndex:         10,
        borderBottom:   '1px solid #E8E8EE',
      }}>
        {/* ← Voltar */}
        <button
          onClick={() => router.back()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, padding: 0,
          }}
          aria-label="Voltar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="#212123" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Título */}
        <span style={{
          fontFamily: '"Geist Mono", monospace', fontSize: 16,
          fontWeight: 600, color: '#212123',
        }}>
          Filters
        </span>

        {/* Reset */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleReset}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: '"Geist", sans-serif', fontSize: 14,
              fontWeight: 400, color: '#888888', padding: 0,
            }}
          >
            Reset
          </button>
        </div>
      </header>

      {/* ── Conteúdo scrollável ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px 120px' }}>

        {/* Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <span style={LABEL_STYLE}>Search</span>
          <div style={{ display: 'flex', gap: 4, height: 40 }}>
            <div
              onMouseEnter={() => {}}
              style={{
                flex: 1, height: 40, background: INPUT_BG, borderRadius: 12,
                display: 'flex', alignItems: 'center',
                paddingLeft: 8, paddingRight: 4, gap: 4, boxSizing: 'border-box',
                boxShadow:  isFocused ? '0 0 0 2px #212123' : 'none',
                transition: 'box-shadow 150ms ease',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="strokiy-search"
                placeholder={`Search ${totalCount} shapes...`}
                value={local.search}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => set({ search: e.target.value })}
                style={{
                  flex: 1, height: '100%', background: 'transparent',
                  border: 'none', outline: 'none',
                  fontFamily: '"Geist", sans-serif', fontSize: 12,
                  fontWeight: 400, color: '#212123',
                  letterSpacing: '0.24px', lineHeight: '130%', minWidth: 0,
                }}
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { set({ search: '' }); inputRef.current?.focus(); }}
                tabIndex={-1}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 2, display: 'flex', alignItems: 'center',
                  opacity: local.search ? 1 : 0,
                  pointerEvents: local.search ? 'auto' : 'none',
                  transition: 'opacity 150ms ease', flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2L12 12M12 2L2 12" stroke="#212123" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <button
              style={ICON_BTN} title="Search"
              onClick={() => inputRef.current?.focus()}
            >
              <IconMagnifyingGlass />
            </button>
          </div>
        </div>

        {/* Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <span style={LABEL_STYLE}>Category</span>
          <div style={{ display: 'flex', gap: 4, height: 40 }}>
            <div style={{
              flex: 1, height: 40, background: INPUT_BG, borderRadius: 12,
              position: 'relative',
            }}>
              <select
                ref={selectRef}
                value={local.category ?? ''}
                onFocus={() => setSelectOpen(true)}
                onBlur={() => setSelectOpen(false)}
                onChange={(e) => {
                  set({ category: (e.target.value as IllustrationCategory) || null });
                  setSelectOpen(false);
                }}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  background: 'transparent', border: 'none', outline: 'none',
                  appearance: 'none', WebkitAppearance: 'none',
                  paddingLeft: 8, paddingRight: 8,
                  fontFamily: '"Geist", sans-serif', fontSize: 12,
                  fontWeight: 400, color: '#212123',
                  letterSpacing: '0.24px', lineHeight: '130%',
                  cursor: 'pointer', boxSizing: 'border-box',
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <button
              style={ICON_BTN} title="Sort"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectRef.current?.focus()}
            >
              <span style={{
                display: 'flex',
                transform: isSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease',
              }}>
                <IconCaretUpDown />
              </span>
            </button>
          </div>
        </div>

        {/* Style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <span style={LABEL_STYLE}>Style</span>
          <ToggleBar
            options={STYLE_OPTIONS.map(o => o.label)}
            active={activeStyleLabel}
            onChange={(label) => {
              const opt  = STYLE_OPTIONS.find(o => o.label === label);
              const next = opt?.value === local.style ? null : (opt?.value ?? null);
              set({ style: next });
            }}
          />
        </div>

        {/* Color */}
        <div style={{
          width: '100%', height: 40, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 10px',
          boxSizing: 'border-box', marginBottom: 24,
        }}>
          {COLOR_SWATCHES.map((color) => {
            const isActive = local.color === color;
            return (
              <button key={color} onClick={() => set({ color: isActive ? null : color })} title={color}
                style={{
                  width: 28, height: 28, borderRadius: 16, border: 'none',
                  background: 'transparent', cursor: 'pointer', padding: 2,
                  flexShrink: 0, boxSizing: 'border-box',
                  outline: isActive ? `2px solid ${color}` : 'none',
                  outlineOffset: 0, transition: 'outline-color 0.15s ease',
                }}>
                <span style={{
                  display: 'block', width: '100%', height: '100%',
                  borderRadius: '50%', background: color,
                }} />
              </button>
            );
          })}
        </div>

        {/* Animation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={LABEL_STYLE}>Animation</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 40, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconArrowsVertical />
            </div>
            <div style={{ flex: 1 }}>
              <ToggleBar options={ANIM_DIRECTION} active={animDirection} onChange={setAnimDir} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', height: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconArrowsHorizontal />
            </div>
            <div style={{ flex: 1 }}>
              <ToggleBar options={ANIM_MOTION} active={animMotion} onChange={setAnimMot} />
            </div>
          </div>
        </div>

      </div>

      {/* ── Apply fixo no fundo ── */}
      <div style={{
        position:   'fixed',
        bottom:     0,
        left:       0,
        right:      0,
        padding:    16,
        background: 'linear-gradient(to top, #F5F5F9 70%, rgba(245,245,249,0))',
        zIndex:     10,
      }}>
        <button
          onClick={handleApply}
          style={{
            width:        '100%',
            height:       48,
            borderRadius: 12,
            background:   '#212123',
            color:        '#FFFFFF',
            border:       'none',
            cursor:       'pointer',
            fontFamily:   '"Geist", sans-serif',
            fontSize:     16,
            fontWeight:   600,
            letterSpacing: '-0.15px',
          }}
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
