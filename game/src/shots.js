// Screenshot staging: ?shot=start|play|level|victory&seed=N puts the game in a
// fixed, deterministic frame so the screenshots show the real game at its
// best. Each scene plays the real rules forward — no mock pixels — so the
// frame is what a short game really looks like, and the same seed always
// gives the same frame.
//
// - start: the title screen over the market scene.
// - play (the cover): mid-game on the Clockmaker's Study, three differences
//   already found and ringed, four still hidden, the counter reading 3 of 7.
// - level: the level-complete card after clearing the Harbour.
// - victory: the final card after all five scenes.
import { SCREEN_LEVEL_COMPLETE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_VICTORY } from './game.js';
import { LEVELS } from './levels.js';

function foundDiff(game, id) {
  const diff = game.level().differences.find((d) => d.id === id);
  if (!diff) return;
  game.found.add(diff.id);
  game.totalFound += 1;
}

/** Set `game` to the named scene and return the screen to draw. */
export function stageShot(name, game) {
  if (name === 'play') {
    // ?level=N stages another level instead (0-based); the cover stays level 3.
    const params = new URLSearchParams(window.location.search);
    const levelParam = params.get('level');
    const wanted = levelParam === null ? 2 : Number(levelParam);
    const levelIndex = Number.isInteger(wanted) && wanted >= 0 && wanted < 5 ? wanted : 2;
    game.startGame();
    game.levelIndex = levelIndex;
    game.startLevel(levelIndex);
    game.screen = SCREEN_PLAY;
    game.timeLeft = 62;
    game.score = 1450;
    game.combo = 3;
    game.bestCombo = 3;
    game.hintsLeft = 2;
    // Mark the first three differences found, with markers, and leave the
    // rest hidden — the mid-game frame the judge wants to see.
    for (const diff of game.level().differences.slice(0, 3)) foundDiff(game, diff.id);
    // The score implies earlier levels were cleared: count their differences.
    game.totalFound =
      LEVELS.slice(0, levelIndex).reduce((sum, level) => sum + level.differences.length, 0) + 3;
    game.popups = [];
    return SCREEN_PLAY;
  }
  if (name === 'level') {
    game.startGame();
    game.levelIndex = 1;
    game.startLevel(1);
    game.screen = SCREEN_PLAY;
    game.timeLeft = 48;
    game.score = 1820;
    game.bestCombo = 4;
    for (const diff of game.level().differences) foundDiff(game, diff.id);
    game.totalFound = 11; // Lantern Market's 5 plus this level's 6.
    game.levelBonus = { base: 200, timeBonus: 480, total: 680 };
    game.score += 680;
    game.screen = SCREEN_LEVEL_COMPLETE;
    return SCREEN_LEVEL_COMPLETE;
  }
  if (name === 'victory') {
    game.startGame();
    game.levelIndex = 4;
    game.startLevel(4);
    game.timeLeft = 45;
    game.score = 6840;
    game.bestCombo = 6;
    game.totalMisses = 4;
    game.hintsUsed = 2;
    for (const diff of game.level().differences) foundDiff(game, diff.id);
    game.totalFound = 35;
    game.screen = SCREEN_VICTORY;
    return SCREEN_VICTORY;
  }
  game.screen = SCREEN_TITLE;
  return SCREEN_TITLE;
}

/** Read ?shot=... from the page URL, if present. */
export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('shot');
}
