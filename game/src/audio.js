// All sound is synthesized with WebAudio — no audio files, no network.
// A tiny synth: short oscillator blips with an exponential decay envelope,
// plus a two-note find chime, a level arpeggio and a victory fanfare.
let context = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}

/** Create (or resume) the audio context. Call from a user gesture. */
export function ensureAudio() {
  if (!context) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

function tone(freq, dur, type, gain, delay = 0) {
  if (muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

/** A soft click for buttons and panel taps. */
export function soundClick() {
  tone(620, 0.07, 'triangle', 0.08);
}

/** Two-note chime on a found difference: the satisfying mark. */
export function soundFind() {
  tone(659.25, 0.16, 'sine', 0.16);
  tone(987.77, 0.28, 'sine', 0.16, 0.09);
}

/** Low buzz on a miss. */
export function soundMiss() {
  tone(140, 0.22, 'sawtooth', 0.1);
  tone(110, 0.22, 'sawtooth', 0.08, 0.05);
}

/** Gentle chime when a hint reveals a difference. */
export function soundHint() {
  tone(880, 0.2, 'sine', 0.1);
  tone(1174.66, 0.3, 'sine', 0.1, 0.1);
}

/** Rising arpeggio when a level is cleared. */
export function soundLevelComplete() {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => tone(freq, 0.24, 'triangle', 0.14, i * 0.11));
}

/** Short fanfare for finishing all five levels. */
export function soundVictory() {
  [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((freq, i) =>
    tone(freq, 0.3, 'triangle', 0.15, i * 0.13),
  );
}

/** Sad descending pair when time runs out. */
export function soundGameOver() {
  tone(392, 0.3, 'triangle', 0.12);
  tone(311.13, 0.5, 'triangle', 0.12, 0.22);
}

/** A quiet tick when the clock drops under ten seconds. */
export function soundTick() {
  tone(1200, 0.05, 'square', 0.05);
}
