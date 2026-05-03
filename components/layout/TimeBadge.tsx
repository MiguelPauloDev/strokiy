'use client';

import { useState, useEffect } from 'react';
import CountryFlag from '@/components/ui/CountryFlag';
import { getCountryFromTimezone } from '@/lib/timezone';

export default function TimeBadge() {
  const [display, setDisplay] = useState({ time: '', tz: '', country: 'AO' });

  useEffect(() => {
    const userTz  = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const country = getCountryFromTimezone(userTz);

    const fmt = () => {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: userTz, hour: '2-digit', minute: '2-digit',
        second: '2-digit', hour12: false, timeZoneName: 'short',
      }).formatToParts(new Date());
      const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00';
      return { time: `${get('hour')}:${get('minute')}:${get('second')}`, tz: get('timeZoneName'), country };
    };

    setDisplay(fmt());
    const id = setInterval(() => setDisplay(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const ready = display.time !== '';

  const TEXT: React.CSSProperties = {
    fontFamily: '"Geist Mono", monospace', fontSize: 16, fontWeight: 700,
    color: '#212123', textTransform: 'uppercase', letterSpacing: 0,
    lineHeight: '24px', whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: '#FFFFFF', borderRadius: 100, height: 40, padding: 8, boxSizing: 'border-box',
      opacity: ready ? 1 : 0,
      transition: 'opacity 200ms ease',
    }}>
      <div style={{ paddingLeft: 4 }}>
        <span style={TEXT}>{display.time} {display.tz}</span>
      </div>
      <span style={TEXT}>-</span>
      <CountryFlag country={display.country} size={20} />
    </div>
  );
}
