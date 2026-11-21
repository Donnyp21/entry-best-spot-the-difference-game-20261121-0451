// Deterministic randomness for the procedural scenes.
//
// Both panels of a level are painted from the same seed, so every star, wave and
// firefly lands in exactly the same place on the left and the right — only the
// deliberate differences differ. Each decorative group takes its own salted
// generator, so drawing a difference never shifts the decoration that follows it.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh generator for one decorative group: same seed + salt, same numbers. */
export function rngFor(seed, salt) {
  return mulberry32((seed * 2654435761 + salt * 40503) >>> 0);
}

/** Pick one item from an array with a generator. */
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
