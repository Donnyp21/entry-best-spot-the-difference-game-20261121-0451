// Mouse and keyboard input: converts canvas clicks into panel clicks and
// footer/overlay button presses, and maps keys to game actions.
import { LEFT_X, PANEL_H, PANEL_W, PANEL_Y, RIGHT_X } from './config.js';
import { KEY_HINT, KEY_MUTE, KEY_PAUSE, KEY_RESTART } from './config.js';
import { footerButtons, overlayButton } from './render.js';
import {
  SCREEN_GAME_OVER,
  SCREEN_LEVEL_COMPLETE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
} from './game.js';
import { ensureAudio, isMuted, soundClick, soundFind, soundHint, soundMiss, toggleMuted } from './audio.js';

function inside(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function panelAt(x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return null;
  if (x >= LEFT_X && x <= LEFT_X + PANEL_W) return { side: 'left', x: x - LEFT_X, y: y - PANEL_Y };
  if (x >= RIGHT_X && x <= RIGHT_X + PANEL_W) return { side: 'right', x: x - RIGHT_X, y: y - PANEL_Y };
  return null;
}

/** Wire a canvas to a game. Returns an object with a status-line reader. */
export function attachInput(canvas, game, onStatus) {
  function announce(message) {
    if (onStatus) onStatus(message);
  }

  function pressOverlayButton(id) {
    if (id === 'start' || id === 'again') {
      game.startGame();
      announce('Game started. Find the differences.');
    } else if (id === 'next') {
      game.nextLevel();
      announce(game.screen === SCREEN_VICTORY ? 'Victory!' : `Level ${game.levelIndex + 1}: ${game.level().name}.`);
    } else if (id === 'retry') {
      game.startLevel(game.levelIndex);
      announce(`Retrying ${game.level().name}.`);
    }
  }

  function pressFooterButton(id) {
    if (id === 'hint') {
      const diff = game.useHint();
      if (diff) {
        soundHint();
        announce(`Hint: look near the ${diff.label.toLowerCase()}.`);
      }
    } else if (id === 'sound') {
      toggleMuted();
      announce(isMuted() ? 'Sound off.' : 'Sound on.');
    } else if (id === 'restart') {
      game.startGame();
      announce('Game restarted.');
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    ensureAudio();
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const overlay = overlayButton(game);
    if (overlay && inside(x, y, overlay)) {
      soundClick();
      pressOverlayButton(overlay.id);
      return;
    }
    for (const button of footerButtons(game)) {
      if (button.enabled && inside(x, y, button)) {
        soundClick();
        pressFooterButton(button.id);
        return;
      }
    }
    if (game.screen !== SCREEN_PLAY) return;
    const hit = panelAt(x, y);
    if (!hit) return;
    const result = game.clickAt(hit.x, hit.y, hit.side);
    if (!result) return;
    if (result.type === 'found') {
      soundFind();
      announce(
        result.levelDone
          ? `Found them all! ${result.diff.label}. Level complete.`
          : `Found: ${result.diff.label}. ${game.differencesLeft()} to go.`,
      );
    } else {
      soundMiss();
      announce('Not a difference. Three seconds lost.');
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'enter') {
      ensureAudio();
      const overlay = overlayButton(game);
      if (overlay) {
        soundClick();
        pressOverlayButton(overlay.id);
      }
      return;
    }
    if (key === KEY_HINT) {
      ensureAudio();
      pressFooterButton('hint');
    } else if (key === KEY_MUTE) {
      pressFooterButton('sound');
    } else if (key === KEY_RESTART) {
      ensureAudio();
      pressFooterButton('restart');
    } else if (key === KEY_PAUSE) {
      if (game.screen === SCREEN_PLAY || game.screen === SCREEN_PAUSED) {
        game.togglePause();
        announce(game.screen === SCREEN_PAUSED ? 'Paused.' : 'Resumed.');
      }
    }
  });

  // Keep the status line honest about what screen the player is on.
  return {
    describe() {
      if (game.screen === SCREEN_TITLE) return 'Lanternlight: spot the difference. Press Enter to start.';
      if (game.screen === SCREEN_PLAY) {
        return `${game.level().name}: found ${game.found.size} of ${game.level().differences.length}, ${game.formatTime()} left.`;
      }
      if (game.screen === SCREEN_LEVEL_COMPLETE) return `Level complete! Score ${game.score}. Press Enter for the next level.`;
      if (game.screen === SCREEN_GAME_OVER) return `Time up. Score ${game.score}. Press Enter to retry.`;
      if (game.screen === SCREEN_VICTORY) return `You found all ${game.totalFound} differences! Final score ${game.score}.`;
      if (game.screen === SCREEN_PAUSED) return 'Paused.';
      return 'Lanternlight.';
    },
  };
}
