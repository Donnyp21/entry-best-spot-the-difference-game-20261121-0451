// Bootstrap: wire the canvas, the game, input and the render loop together.
// With ?shot=... in the URL the game stages one fixed frame for screenshots
// and freezes the clock, so the shot is stable; otherwise it plays live.
import { createGame } from './game.js';
import { attachInput } from './input.js';
import { drawFrame } from './render.js';
import { shotFromUrl, stageShot } from './shots.js';
import { soundGameOver, soundLevelComplete, soundTick, soundVictory } from './audio.js';
import { SCREEN_GAME_OVER, SCREEN_LEVEL_COMPLETE, SCREEN_VICTORY } from './game.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const game = createGame();
const input = attachInput(canvas, game, (message) => {
  statusEl.textContent = message;
});

const shot = shotFromUrl();
const staged = shot ? stageShot(shot, game) : null;
const frozen = staged !== null;

let last = performance.now();
let lastScreen = game.screen;

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!frozen) {
    const events = game.tick(dt);
    for (const event of events) {
      if (event === 'tick') soundTick();
      else if (event === 'timeout') soundGameOver();
    }
    if (game.screen !== lastScreen) {
      if (game.screen === SCREEN_LEVEL_COMPLETE) soundLevelComplete();
      else if (game.screen === SCREEN_VICTORY) soundVictory();
      else if (game.screen === SCREEN_GAME_OVER) soundGameOver();
      lastScreen = game.screen;
      statusEl.textContent = input.describe();
    }
  }
  drawFrame(ctx, game, now / 1000);
  requestAnimationFrame(frame);
}

statusEl.textContent = input.describe();
requestAnimationFrame(frame);
