'use client';

import { useState, useEffect } from 'react';
import { getCountryFromTimezone } from '@/lib/timezone';

export default function DarkTimeBadge() {
  const [display, setDisplay] = useState({ time: '', tz: '', countryName: 'Angola' });

  useEffect(() => {
    const userTz    = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const code      = getCountryFromTimezone(userTz);
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
    fontSize: 13, fontWeight: 700, color: '#EFEFFF',
    textTransform: 'uppercase', letterSpacing: 0,
    lineHeight: '20px', whiteSpace: 'nowrap',
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
