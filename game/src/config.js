// Layout, timing and scoring constants for Lanternlight.
// One canvas, 1280x720 logical pixels, scaled by CSS to the window.
export const VIEW_W = 1280;
export const VIEW_H = 720;

export const HEADER_H = 64;
export const PANEL_W = 580;
export const PANEL_H = 540;
export const PANEL_Y = 84;
export const LEFT_X = 40;
export const RIGHT_X = 660;
export const FOOTER_Y = 636;

export const PANEL_LABEL_H = 18;

// Scoring: a find pays 100 plus 25 per combo step above the first, capped at 250.
// A miss costs 3 seconds and resets the combo. A hint costs 50 points.
// Finishing a level pays 200 plus 10 per second left on the clock.
export const FIND_BASE = 100;
export const FIND_COMBO_STEP = 25;
export const FIND_MAX = 250;
export const MISS_TIME_PENALTY = 3;
export const HINT_COST = 50;
export const LEVEL_BONUS = 200;
export const LEVEL_TIME_BONUS = 10;
export const HINTS_PER_LEVEL = 3;
export const HINT_REVEAL_SECONDS = 2.5;
export const MISS_FLASH_SECONDS = 0.6;
export const INTRO_SECONDS = 1.6;
export const LOW_TIME_SECONDS = 10;

// Keyboard: H hint, M mute, P pause, R restart, Enter start / next level.
export const KEY_HINT = 'h';
export const KEY_MUTE = 'm';
export const KEY_PAUSE = 'p';
export const KEY_RESTART = 'r';
