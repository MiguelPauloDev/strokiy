'use client';

import { createContext, useContext } from 'react';
import { useSoundSystem } from '@/hooks/useSoundSystem';
import type { SoundKey } from '@/hooks/useSoundSystem';

interface SoundContextValue {
  soundEnabled:   boolean;
  toggle:         () => void;
  play:           (key: SoundKey) => void;
  lofiEnabled:    boolean;
  toggleLofi:     () => void;
  stopLofi:       () => void;
  lofiVolume:     number;
  setLofiVolume:  (v: number) => void;
}

const SoundContext = createContext<SoundContextValue>({
  soundEnabled:  false,
  toggle:        () => {},
  play:          () => {},
  lofiEnabled:   false,
  toggleLofi:    () => {},
  stopLofi:      () => {},
  lofiVolume:    0.7,
  setLofiVolume: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const sound = useSoundSystem();
  return (
    <SoundContext.Provider value={sound}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext(): SoundContextValue {
  return useContext(SoundContext);
}
