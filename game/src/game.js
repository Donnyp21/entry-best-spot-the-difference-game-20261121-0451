// Game state and rules: screens, timer, scoring, combo, hints, finds and misses.
// Rendering lives in render.js; this file only decides what is true.
import {
  FIND_BASE,
  FIND_COMBO_STEP,
  FIND_MAX,
  HINTS_PER_LEVEL,
  HINT_COST,
  HINT_REVEAL_SECONDS,
  INTRO_SECONDS,
  LEVEL_BONUS,
  LEVEL_TIME_BONUS,
  MISS_FLASH_SECONDS,
  MISS_TIME_PENALTY,
} from './config.js';
import { LEVELS } from './levels.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_INTRO = 'intro';
export const SCREEN_PLAY = 'play';
export const SCREEN_LEVEL_COMPLETE = 'levelComplete';
export const SCREEN_GAME_OVER = 'gameOver';
export const SCREEN_VICTORY = 'victory';
export const SCREEN_PAUSED = 'paused';

export function createGame() {
  const game = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: new Set(),
    combo: 0,
    bestCombo: 0,
    score: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintsUsed: 0,
    timeLeft: 0,
    introT: 0,
    hintReveal: null,
    popups: [],
    missFlashes: [],
    levelBonus: null,
    totalFound: 0,
    totalMisses: 0,
    pausedFrom: null,
    lastWholeSecond: -1,
  };

  game.level = function level() {
    return LEVELS[game.levelIndex];
  };

  game.differencesLeft = function differencesLeft() {
    return game.level().differences.length - game.found.size;
  };

  game.startGame = function startGame() {
    game.score = 0;
    game.totalFound = 0;
    game.totalMisses = 0;
    game.bestCombo = 0;
    game.levelIndex = 0;
    game.startLevel(0);
  };

  game.startLevel = function startLevel(index) {
    game.levelIndex = index;
    game.found = new Set();
    game.combo = 0;
    game.hintsLeft = HINTS_PER_LEVEL;
    game.timeLeft = game.level().timeLimit;
    game.lastWholeSecond = Math.ceil(game.timeLeft);
    game.hintReveal = null;
    game.popups = [];
    game.missFlashes = [];
    game.levelBonus = null;
    game.screen = SCREEN_INTRO;
    game.introT = INTRO_SECONDS;
  };

  /** Advance one frame. Returns events for sounds: 'tick' and 'timeout'. */
  game.tick = function tick(dt) {
    const events = [];
    for (const popup of game.popups) popup.t += dt;
    game.popups = game.popups.filter((popup) => popup.t < popup.life);
    for (const flash of game.missFlashes) flash.t += dt;
    game.missFlashes = game.missFlashes.filter((flash) => flash.t < MISS_FLASH_SECONDS);
    if (game.hintReveal) {
      game.hintReveal.t -= dt;
      if (game.hintReveal.t <= 0) game.hintReveal = null;
    }
    if (game.screen === SCREEN_INTRO) {
      game.introT -= dt;
      if (game.introT <= 0) game.screen = SCREEN_PLAY;
      return events;
    }
    if (game.screen !== SCREEN_PLAY) return events;
    game.timeLeft -= dt;
    const whole = Math.ceil(game.timeLeft);
    if (whole !== game.lastWholeSecond) {
      game.lastWholeSecond = whole;
      if (whole <= 10 && whole > 0) events.push('tick');
    }
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      game.screen = SCREEN_GAME_OVER;
      events.push('timeout');
    }
    return events;
  };

  /**
   * A click inside a panel, in panel coordinates (0..580, 0..540).
   * `side` is 'left' or 'right' — popups and miss marks draw on that panel.
   * Returns { type: 'found', diff, points } or { type: 'miss' } or null
   * (clicks outside play, or on an already-found difference, do nothing).
   */
  game.clickAt = function clickAt(x, y, side) {
    if (game.screen !== SCREEN_PLAY) return null;
    const level = game.level();
    for (const diff of level.differences) {
      if (game.found.has(diff.id)) continue;
      const dx = x - diff.x;
      const dy = y - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        game.found.add(diff.id);
        game.totalFound += 1;
        game.combo += 1;
        if (game.combo > game.bestCombo) game.bestCombo = game.combo;
        const points = Math.min(FIND_BASE + FIND_COMBO_STEP * (game.combo - 1), FIND_MAX);
        game.score += points;
        game.popups.push({ x: diff.x, y: diff.y, side, text: `+${points}`, color: '#7fe08a', t: 0, life: 1.1 });
        game.popups.push({ x: diff.x, y: diff.y + 24, side, text: diff.label, color: '#ffe9a8', t: 0, life: 1.6 });
        if (game.found.size === level.differences.length) {
          const timeBonus = Math.ceil(game.timeLeft) * LEVEL_TIME_BONUS;
          const total = LEVEL_BONUS + timeBonus;
          game.score += total;
          game.levelBonus = { base: LEVEL_BONUS, timeBonus, total };
          game.screen = SCREEN_LEVEL_COMPLETE;
          return { type: 'found', diff, points, levelDone: true };
        }
        return { type: 'found', diff, points, levelDone: false };
      }
    }
    // A miss: lose time, lose the combo, leave a red mark.
    game.combo = 0;
    game.totalMisses += 1;
    game.timeLeft = Math.max(0, game.timeLeft - MISS_TIME_PENALTY);
    game.missFlashes.push({ x, y, side, t: 0 });
    return { type: 'miss' };
  };

  /** Spend a hint: reveal one unfound difference with a pulsing ring. */
  game.useHint = function useHint() {
    if (game.screen !== SCREEN_PLAY) return null;
    if (game.hintsLeft <= 0) return null;
    const remaining = game.level().differences.filter((diff) => !game.found.has(diff.id));
    if (remaining.length === 0) return null;
    const diff = remaining[Math.floor(Math.random() * remaining.length)];
    game.hintsLeft -= 1;
    game.hintsUsed += 1;
    game.score = Math.max(0, game.score - HINT_COST);
    game.hintReveal = { diff, t: HINT_REVEAL_SECONDS };
    return diff;
  };

  game.nextLevel = function nextLevel() {
    if (game.levelIndex + 1 >= LEVELS.length) {
      game.screen = SCREEN_VICTORY;
    } else {
      game.startLevel(game.levelIndex + 1);
    }
  };

  game.togglePause = function togglePause() {
    if (game.screen === SCREEN_PLAY) {
      game.pausedFrom = SCREEN_PLAY;
      game.screen = SCREEN_PAUSED;
    } else if (game.screen === SCREEN_PAUSED) {
      game.screen = game.pausedFrom || SCREEN_PLAY;
    }
  };

  game.formatTime = function formatTime() {
    const total = Math.max(0, Math.ceil(game.timeLeft));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  return game;
}
