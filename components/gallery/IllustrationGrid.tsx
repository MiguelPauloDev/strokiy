'use client';

import { useState, useCallback } from 'react';
import IllustrationCard from '@/components/gallery/IllustrationCard';
import Toast, { type ToastVariant } from '@/components/ui/Toast';
import { copyToClipboard } from '@/lib/clipboard';
import { downloadIllustrations } from '@/lib/download';
import type { Illustration } from '@/types';
import type { Breakpoint } from '@/hooks/useBreakpoint';

interface IllustrationGridProps {
  illustrations: Illustration[];
  breakpoint?:   Breakpoint;
}

const getGridStyle = (breakpoint: string): React.CSSProperties => {
  if (breakpoint === 'mobile') {
    return {
      display:             'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap:                 '8px',
    };
  }
  if (breakpoint === 'tablet') {
    return {
      display:             'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap:                 '8px',
    };
  }
  return {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(204px, 1fr))',
    gap:                 '8px',
  };
};

/* ── Close icon ── */
function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="2" y1="2"  x2="12" y2="12" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="2"  y2="12" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export default function IllustrationGrid({ illustrations, breakpoint = 'desktop' }: IllustrationGridProps) {
  const [selectedIds,    setSelectedIds   ] = useState<Set<string>>(new Set());
  const [toastVisible,   setToastVisible  ] = useState(false);
  const [toastMsg,       setToastMsg      ] = useState('SVG copied!');
  const [toastVariant,   setToastVariant  ] = useState<ToastVariant>('success');

  const showToast = useCallback((msg: string, variant: ToastVariant = 'success') => {
    setToastMsg(msg);
    setToastVariant(variant);
    setToastVisible(true);
  }, []);

  /* Toggle individual selection */
  const handleToggle = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else              next.add(id);
      return next;
    });
  }, []);

  /* Single card copy success → toast */
  const handleCopy = useCallback(() => {
    showToast('SVG copied!');
  }, [showToast]);

  /* Single card copy error → toast */
  const handleCopyError = useCallback(() => {
    showToast('Não foi possível copiar o SVG', 'error');
  }, [showToast]);

  const hideToast = useCallback(() => setToastVisible(false), []);

  /* Selection helpers */
  const selectedCount = selectedIds.size;
  const selectedIlls  = illustrations.filter(ill => selectedIds.has(ill.id));

  /* Copy all selected SVGs */
  const handleCopyAll = useCallback(async () => {
    const joined  = selectedIlls.map(ill => ill.svg).join('\n\n');
    const success = await copyToClipboard(joined);
    if (success) {
      showToast(`${selectedCount} SVG${selectedCount !== 1 ? 's' : ''} copied!`);
    } else {
      showToast('Não foi possível copiar os SVGs', 'error');
    }
  }, [selectedIlls, selectedCount, showToast]);

  /* Download selected SVGs — 1 file: direct .svg, 2+: ZIP */
  const handleDownloadAll = useCallback(async () => {
    const isMultiple = selectedCount > 1;
    showToast(isMultiple
      ? `A criar ZIP com ${selectedCount} ilustrações...`
      : 'A descarregar SVG...'
    );
    try {
      await downloadIllustrations(selectedIlls.map(ill => ({ svg: ill.svg, name: ill.name })));
      showToast(isMultiple
        ? `ZIP com ${selectedCount} ilustrações descarregado!`
        : `${selectedIlls[0]?.name ?? 'ilustração'}.svg descarregado!`
      );
    } catch {
      showToast('Erro ao descarregar. Tenta novamente.', 'error');
    }
  }, [selectedIlls, selectedCount, showToast]);

  /* Clear all */
  const handleClear = useCallback(() => setSelectedIds(new Set()), []);

  if (illustrations.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <p style={{ fontFamily: '"Geist Mono", monospace', fontSize: 13, color: '#888888' }}>
          No illustrations found.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={getGridStyle(breakpoint)}>
        {illustrations.map((ill) => (
          <IllustrationCard
            key={ill.id}
            illustration={ill}
            isSelected={selectedIds.has(ill.id)}
            onSelect={handleToggle}
            onCopy={handleCopy}
            onCopyError={handleCopyError}
          />
        ))}
      </div>

      {/* ── Selection action bar ── */}
      {selectedCount > 0 && (
        <div
          style={{
            position:       'fixed',
            left:           breakpoint === 'desktop' ? 320 : 0,
            right:          0,
            bottom:         24,
            zIndex:         200,
            display:        'flex',
            justifyContent: 'center',
            pointerEvents:  'none',
          }}
        >
          <div
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           6,
              background:    '#212123',
              borderRadius:  100,
              padding:       '6px 6px 6px 20px',
              boxShadow:     '0px 8px 40px rgba(0,0,0,0.28)',
              whiteSpace:    'nowrap',
              pointerEvents: 'auto',
              animation:     'barIn 220ms cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <span style={{
              fontFamily:    '"Geist Mono", monospace',
              fontSize:      13,
              fontWeight:    600,
              color:         '#FFFFFF',
              marginRight:   6,
              letterSpacing: '-0.1px',
            }}>
              {selectedCount} selected
            </span>

            <button
              onClick={handleCopyAll}
              style={{
                height:        36,
                padding:       '0 16px',
                background:    'rgba(255,255,255,0.12)',
                border:        'none',
                borderRadius:  100,
                cursor:        'pointer',
                fontFamily:    '"Geist", sans-serif',
                fontSize:      13,
                fontWeight:    600,
                color:         '#FFFFFF',
                letterSpacing: '-0.1px',
              }}
            >
              {selectedCount > 1 ? 'Copy all' : 'Copy'}
            </button>

            <button
              onClick={handleDownloadAll}
              style={{
                height:        36,
                padding:       '0 16px',
                background:    '#FFFFFF',
                border:        'none',
                borderRadius:  100,
                cursor:        'pointer',
                fontFamily:    '"Geist", sans-serif',
                fontSize:      13,
                fontWeight:    600,
                color:         '#212123',
                letterSpacing: '-0.1px',
              }}
            >
              {selectedCount === 1 ? 'Download SVG' : `Download ZIP (${selectedCount})`}
            </button>

            <button
              onClick={handleClear}
              aria-label="Clear selection"
              style={{
                width:          32,
                height:         32,
                background:     'transparent',
                border:         'none',
                borderRadius:   '50%',
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        0,
                marginLeft:     2,
              }}
            >
              <IconClose />
            </button>
          </div>
        </div>
      )}

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={hideToast}
        variant={toastVariant}
        offsetLeft={breakpoint === 'desktop' ? 320 : 0}
      />

    </>
  );
}
