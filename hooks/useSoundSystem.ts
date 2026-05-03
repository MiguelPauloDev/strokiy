'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type SoundKey =
  | 'hover'
  | 'copy'
  | 'select'
  | 'sidebar-open'
  | 'sidebar-close';

const SOUND_MAP: Record<SoundKey, string | string[]> = {
  'hover':         '/sounds/button-1.wav',
  'copy':          ['/sounds/musical-tap-1.wav', '/sounds/musical-tap-2.wav', '/sounds/musical-tap-3.wav'],
  'select':        '/sounds/success.wav',
  'sidebar-open':  '/sounds/whoosh-1.wav',
  'sidebar-close': '/sounds/whoosh-2.wav',
};

function resolveSound(key: SoundKey): string {
  const entry = SOUND_MAP[key];
  if (Array.isArray(entry)) {
    return entry[Math.floor(Math.random() * entry.length)];
  }
  return entry;
}

/* Playlist lofi — defined outside the hook to avoid recreating on every render */
const LOFI_TRACKS = [
  '/sounds/leberch-lofi-516620.mp3',
  '/sounds/mondamusic-lofi-lofi-chill-lofi-girl-491690.mp3',
  '/sounds/playstarz_music-lofi-chill-lofi-girl-lofi-490880.mp3',
];

export function useSoundSystem() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lofiEnabled,  setLofiEnabled]  = useState(false);
  const [lofiVolume,   setLofiVolumeState] = useState(0.7);

  const lofiRef        = useRef<HTMLAudioElement | null>(null);
  const lofiTrackIndex = useRef(0);
  const lofiEnabled$   = useRef(lofiEnabled); /* ref síncrona para o handler de ended */
  lofiEnabled$.current = lofiEnabled;
  const lofiVolumeRef  = useRef(lofiVolume);  /* ref síncrona para fadeIn/playNext */
  lofiVolumeRef.current = lofiVolume;

  /* SSR-safe: lê preferências depois do mount */
  useEffect(() => {
    try {
      const stored     = localStorage.getItem('strokiy-sound-enabled');
      const storedLofi = localStorage.getItem('strokiy-lofi-enabled');
      const storedVol  = localStorage.getItem('strokiy-lofi-volume');
      if (stored     !== null) setSoundEnabled(stored     === 'true');
      if (storedLofi !== null) setLofiEnabled (storedLofi === 'true');
      if (storedVol  !== null) {
        const v = parseFloat(storedVol);
        if (!isNaN(v)) setLofiVolumeState(Math.max(0, Math.min(1, v)));
      }
    } catch {}
  }, []);

  /* Helpers de fade ── */
  const fadeIn = (audio: HTMLAudioElement) => {
    audio.volume = 0;
    const target = lofiVolumeRef.current;   /* use persisted volume */
    const step   = Math.max(target / 30, 0.001);
    const id = setInterval(() => {
      if (audio.volume + step >= target) { audio.volume = target; clearInterval(id); }
      else audio.volume += step;
    }, 50);
  };

  const fadeOut = (audio: HTMLAudioElement, onDone?: () => void) => {
    const id = setInterval(() => {
      if (audio.volume <= 0.02) {
        audio.pause();
        audio.volume = 0;
        clearInterval(id);
        onDone?.();
      } else {
        audio.volume = Math.max(0, audio.volume - 0.02);
      }
    }, 50);
  };

  /* Avança para a próxima faixa quando a actual termina */
  const playNext = useCallback(() => {
    if (!lofiEnabled$.current) return;

    /* Remove listener da faixa anterior antes de criar a nova */
    if (lofiRef.current) {
      lofiRef.current.removeEventListener('ended', playNext);
    }

    lofiTrackIndex.current = (lofiTrackIndex.current + 1) % LOFI_TRACKS.length;
    const audio = new Audio(LOFI_TRACKS[lofiTrackIndex.current]);
    audio.addEventListener('ended', playNext);
    lofiRef.current = audio;
    fadeIn(audio);
    audio.play().catch(() => {});
  }, []);

  /* Liga/desliga lofi */
  useEffect(() => {
    if (!lofiEnabled) return;

    const audio = new Audio(LOFI_TRACKS[lofiTrackIndex.current]);
    audio.addEventListener('ended', playNext);
    lofiRef.current = audio;

    fadeIn(audio);
    audio.play().catch(() => {});

    return () => {
      const a = lofiRef.current;
      if (!a) return;
      a.removeEventListener('ended', playNext);
      a.pause();
      a.volume = 0;
      lofiRef.current = null;
    };
  }, [lofiEnabled, playNext]);

  const toggle = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('strokiy-sound-enabled', String(next)); } catch {}
      return next;
    });
  }, []);

  const toggleLofi = useCallback(() => {
    setLofiEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem('strokiy-lofi-enabled', String(next)); } catch {}
      return next;
    });
  }, []);

  /* Stop lofi immediately and reset state — called when theme goes dark → light */
  const stopLofi = useCallback(() => {
    setLofiEnabled(false);
    try { localStorage.setItem('strokiy-lofi-enabled', 'false'); } catch {}
  }, []);

  /* Set lofi volume — applies immediately to playing audio */
  const setLofiVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setLofiVolumeState(clamped);
    if (lofiRef.current) lofiRef.current.volume = clamped;
    try { localStorage.setItem('strokiy-lofi-volume', String(clamped)); } catch {}
  }, []);

  const play = useCallback((key: SoundKey) => {
    if (!soundEnabled) return;
    try {
      const audio   = new Audio(resolveSound(key));
      audio.volume  = 0.4;
      audio.play().catch(() => {});
    } catch {}
  }, [soundEnabled]);

  return { soundEnabled, toggle, play, lofiEnabled, toggleLofi, stopLofi, lofiVolume, setLofiVolume };
}
