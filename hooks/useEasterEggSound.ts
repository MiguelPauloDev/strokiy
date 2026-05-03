'use client';

import { useCallback } from 'react';

export function useEasterEggSound() {
  const play = useCallback(function play() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const t = ctx.currentTime;
    const v = 0.45;
    const pitchMult = 0.6; // mais grave
    const sp = 1.0;

    function makeReverb(dur = 2.5, decay = 2.2) {
      const sr = ctx.sampleRate;
      const len = sr * dur;
      const buf = ctx.createBuffer(2, len, sr);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++)
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
      const conv = ctx.createConvolver();
      conv.buffer = buf;
      return conv;
    }

    const rev = makeReverb();
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    rev.connect(master);

    function note(
      freq: number, start: number, dur: number,
      vol: number, type: OscillatorType, useRev = false
    ) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq * pitchMult;
      o.connect(g);
      g.connect(useRev ? rev : master);
      g.gain.setValueAtTime(0, t + start * sp);
      g.gain.linearRampToValueAtTime(vol * v, t + start * sp + 0.01);
      g.gain.setValueAtTime(vol * v, t + (start + dur * 0.65) * sp);
      g.gain.exponentialRampToValueAtTime(0.001, t + (start + dur) * sp);
      o.start(t + start * sp);
      o.stop(t + (start + dur + 0.1) * sp);
    }

    function chord(
      freqs: number[], start: number, dur: number,
      vol: number, type: OscillatorType, useRev = false
    ) {
      freqs.forEach(f => note(f, start, dur, vol / freqs.length, type, useRev));
    }

    // FASE 1 — 8-bit arpejo ascendente (0–1.2s)
    note(261.63, 0.00, 0.10, 0.55, 'square');
    note(329.63, 0.12, 0.10, 0.55, 'square');
    note(392.00, 0.24, 0.10, 0.55, 'square');
    note(523.25, 0.36, 0.10, 0.55, 'square');
    note(659.25, 0.48, 0.10, 0.55, 'square');
    note(783.99, 0.60, 0.10, 0.55, 'square');
    note(130.81, 0.00, 0.58, 0.20, 'square');
    note(196.00, 0.60, 0.58, 0.20, 'square');

    // FASE 2 — triangle suaviza (1.2–2.2s)
    note(783.99, 0.80, 0.15, 0.45, 'triangle');
    note(987.77, 0.98, 0.15, 0.45, 'triangle');
    note(1046.5,  1.16, 0.18, 0.45, 'triangle');
    note(1174.7,  1.36, 0.22, 0.40, 'triangle');
    note(392.00, 0.80, 0.55, 0.15, 'triangle');
    note(493.88, 1.00, 0.55, 0.15, 'triangle');
    note(587.33, 1.20, 0.55, 0.15, 'triangle');

    // FASE 3 — sine + reverb acorde final (2.2–3.5s)
    chord([1174.7, 1396.9, 1568.0], 1.60, 1.8, 0.50, 'sine', true);
    chord([587.33,  698.46,  784.00], 1.60, 1.8, 0.30, 'sine', true);
    chord([293.66,  349.23,  392.00], 1.65, 1.8, 0.20, 'sine', true);

    // brilho final com vibrato
    const oFinal = ctx.createOscillator();
    const gFinal = ctx.createGain();
    const lfo    = ctx.createOscillator();
    const lgain  = ctx.createGain();
    oFinal.type = 'sine';
    oFinal.frequency.value = 1760 * pitchMult;
    lfo.frequency.value = 5;
    lgain.gain.value = 8 * pitchMult;
    lfo.connect(lgain);
    lgain.connect(oFinal.frequency);
    oFinal.connect(gFinal);
    gFinal.connect(rev);
    gFinal.gain.setValueAtTime(0,       t + 1.9);
    gFinal.gain.linearRampToValueAtTime(v * 0.25, t + 2.1);
    gFinal.gain.exponentialRampToValueAtTime(0.001, t + 3.5);
    oFinal.start(t + 1.9); lfo.start(t + 1.9);
    oFinal.stop(t + 3.6);  lfo.stop(t + 3.6);
  }, []);

  return { play };
}
