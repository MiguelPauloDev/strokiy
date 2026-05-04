'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FilterBar    from '@/components/gallery/FilterBar';
import DarkSidebar  from '@/components/gallery/DarkSidebar';
import IllustrationGrid from '@/components/gallery/IllustrationGrid';
import Overlay from '@/components/ui/Overlay';
import TimeBadge from '@/components/layout/TimeBadge';
import DarkTimeBadge from '@/components/layout/DarkTimeBadge';
import WaveButton from '@/components/layout/WaveButton';
import DarkSoundButtons from '@/components/layout/DarkSoundButtons';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useFilters } from '@/providers/FilterContext';
import { useThemeContext } from '@/providers/ThemeContext';
import { getIllustrations } from '@/lib/illustrations';

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

/* ── Page ── */
export default function HomePage() {
  const { filters, setFilters } = useFilters();
  const { theme }               = useThemeContext();
  const isDark                  = theme === 'dark';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bp     = useBreakpoint();
  const router = useRouter();

  const openDrawer  = useCallback(() => setDrawerOpen(true),  []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

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

  /* Aguarda resolução do breakpoint para evitar CLS em mobile */
  if (bp === null) {
    return <div style={{ height: '100vh', background: 'var(--color-bg)' }} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-bg)' }}>

      {/* ── Sidebar / Drawer ── */}
      {/* Desktop: sidebar fixa | Tablet: drawer com overlay | Mobile light: /filters | Mobile dark: drawer com overlay + FAB */}
      {(!isMobile || isDark) && (
        <>
          {(isTablet || (isMobile && isDark)) && <Overlay isOpen={drawerOpen} onClick={closeDrawer} />}
          {isDark ? (
            <DarkSidebar
              filters={filters}
              onChange={setFilters}
              total={totalCount}
              isDrawer={isTablet || isMobile}
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

        {/* ── FAB filtros — só em mobile dark mode ── */}
        {isMobile && isDark && (
          <button
            onClick={openDrawer}
            title="Filtros"
            aria-label="Abrir filtros"
            style={{
              position:       'fixed',
              bottom:         24,
              right:          24,
              width:          48,
              height:         48,
              borderRadius:   100,
              background:     '#111111',
              border:         '1px solid rgba(39,39,39,0.4)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              zIndex:         100,
              cursor:         'pointer',
              boxShadow:      '0 4px 16px rgba(0,0,0,0.5)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <line x1="3" y1="6"  x2="17" y2="6"  stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="6" y1="10" x2="14" y2="10" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="14" x2="11" y2="14" stroke="#EFEFFF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
