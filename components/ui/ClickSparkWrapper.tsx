'use client';

import { useThemeContext } from '@/providers/ThemeContext';
import { useSparkSound  } from '@/hooks/useSparkSound';
import ClickSpark          from './ClickSpark';

export default function ClickSparkWrapper({ children }: { children: React.ReactNode }) {
  const { theme }        = useThemeContext();
  const { playSparkNote } = useSparkSound();

  return (
    <ClickSpark
      sparkColor={theme === 'dark' ? '#EFEFFF' : '#212123'}
      sparkSize={12}
      sparkRadius={20}
      sparkCount={8}
      duration={500}
      easing="ease-out"
      extraScale={1.2}
      onClickSound={playSparkNote}
    >
      {children}
    </ClickSpark>
  );
}
