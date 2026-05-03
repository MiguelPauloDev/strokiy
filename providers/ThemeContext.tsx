'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createTimeline, stagger } from 'animejs';
import { useEasterEggSound } from '@/hooks/useEasterEggSound';
import { useSoundContext } from '@/providers/SoundContext';
import PixelTransition from '@/components/ui/PixelTransition';

/* ── Theme background colours — must stay in sync with tokens.css / dark.css */
const THEME_BG: Record<'light' | 'dark', string> = {
  light: '#F5F5F9',
  dark:  '#0E0E0F',
};

/* ── Types ── */
interface ThemeContextType {
  theme:       'light' | 'dark';
  toggleTheme: () => void;
}

/* ── Context ── */
const ThemeContext = createContext<ThemeContextType>({
  theme:       'light',
  toggleTheme: () => {},
});

/* ── Provider ── */
export function ThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children:      React.ReactNode;
  initialTheme?: 'light' | 'dark';
}) {
  /* initialTheme comes from the server (cookie) so SSR and client initial
     render are identical — no hydration mismatch, no component-tree flash. */
  const [theme, setTheme]           = useState<'light' | 'dark'>(initialTheme);
  const [showOverlay, setShowOverlay] = useState(false);

  /* Refs — synchronous state that doesn't trigger re-renders */
  const overlayFromRef = useRef<'light' | 'dark'>(initialTheme);
  const lockRef        = useRef(false);

  const { play: playEasterEgg } = useEasterEggSound();
  const { stopLofi }            = useSoundContext();

  /* ── Toggle: capture current theme, show overlay, play sound ── */
  const toggleTheme = useCallback(() => {
    if (lockRef.current) return;
    lockRef.current        = true;
    overlayFromRef.current = theme;   // snapshot before overlay renders

    /* Stop lofi immediately when leaving dark mode — before any animation */
    if (theme === 'dark') stopLofi();

    playEasterEgg();
    setShowOverlay(true);
  }, [theme, playEasterEgg, stopLofi]);

  /* ── Midpoint: pixels fully cover the screen — swap theme invisibly ── */
  const handleMidpoint = useCallback(() => {
    /* Suppress CSS transitions while theme tokens are swapped */
    document.documentElement.classList.add('no-transition');

    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      document.cookie = `strokiy-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
      try { localStorage.setItem('strokiy-theme', next); } catch {}
      return next;
    });

    /* Remove suppression after browser paints the new theme */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('no-transition');
      });
    });
  }, []);

  /* ── Complete: pixels gone — remove overlay, ripple cards ── */
  const handleComplete = useCallback(() => {
    setShowOverlay(false);
    lockRef.current = false;

    /* Ripple wave across the card grid */
    const opts = { grid: [5, 4] as [number, number], from: 'center' as const };
    createTimeline()
      .add('[data-card]', {
        scale:    stagger([1.06, 0.94], opts),
        ease:     'inOutQuad',
        duration: 300,
      }, stagger(80, opts))
      .add('[data-card]', {
        scale:    1,
        ease:     'outQuad',
        duration: 150,
      }, stagger(80, opts));
  }, []);

  /* ── Overlay colours — pixel colour = incoming theme bg ── */
  const pixelColor = THEME_BG[overlayFromRef.current === 'light' ? 'dark' : 'light'];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}

      {showOverlay && (
        <PixelTransition
          pixelColor={pixelColor}
          gridSize={70}
          animationStepDuration={0.8}
          onMidpoint={handleMidpoint}
          onComplete={handleComplete}
        />
      )}
    </ThemeContext.Provider>
  );
}

/* ── Hook ── */
export function useThemeContext(): ThemeContextType {
  return useContext(ThemeContext);
}
