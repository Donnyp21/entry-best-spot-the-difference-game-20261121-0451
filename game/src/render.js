// All drawing: the header, the two panels, found markers, the footer HUD
// (counter, combo, buttons) and every screen overlay. Nothing here changes
// game state — it only reads it.
import {
  FOOTER_Y,
  HEADER_H,
  LEFT_X,
  LOW_TIME_SECONDS,
  PANEL_H,
  PANEL_LABEL_H,
  PANEL_W,
  PANEL_Y,
  RIGHT_X,
  VIEW_H,
  VIEW_W,
} from './config.js';
import { LEVELS, TOTAL_DIFFERENCES } from './levels.js';
import { paintScene } from './scenes.js';
import {
  SCREEN_GAME_OVER,
  SCREEN_INTRO,
  SCREEN_LEVEL_COMPLETE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_VICTORY,
} from './game.js';

const INK = '#f3ead8';
const MUTED = '#b8a88f';
const GOLD = '#f2b134';
const GREEN = '#7fe08a';
const RED = '#e05a4a';

function rrect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 600, font = 'system-ui, sans-serif') {
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function panelX(side) {
  return side === 'right' ? RIGHT_X : LEFT_X;
}

/** Footer buttons, in canvas coordinates. Input handling reads these. */
export function footerButtons(game) {
  return [
    { id: 'hint', label: `HINT (H) · ${game.hintsLeft} left`, x: 892, y: FOOTER_Y + 4, w: 150, h: 52, enabled: game.screen === SCREEN_PLAY && game.hintsLeft > 0 },
    { id: 'sound', label: 'SOUND (M)', x: 1052, y: FOOTER_Y + 4, w: 82, h: 52, enabled: true },
    { id: 'restart', label: 'RESTART (R)', x: 1144, y: FOOTER_Y + 4, w: 96, h: 52, enabled: true },
  ];
}

/** The one big button on an overlay screen, if the screen has one. */
export function overlayButton(game) {
  if (game.screen === SCREEN_TITLE) return { id: 'start', label: 'START THE HUNT', x: 490, y: 560, w: 300, h: 60 };
  if (game.screen === SCREEN_LEVEL_COMPLETE) return { id: 'next', label: game.levelIndex + 1 >= LEVELS.length ? 'SEE YOUR RESULTS' : 'NEXT LEVEL  →', x: 490, y: 520, w: 300, h: 60 };
  if (game.screen === SCREEN_GAME_OVER) return { id: 'retry', label: 'TRY THIS LEVEL AGAIN', x: 470, y: 520, w: 340, h: 60 };
  if (game.screen === SCREEN_VICTORY) return { id: 'again', label: 'PLAY AGAIN', x: 490, y: 560, w: 300, h: 60 };
  return null;
}

function drawPanelFrame(ctx, x, y, w, h, accent) {
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 1.5, y - 1.5, w + 3, h + 3);
}

function drawMarkers(ctx, game, side) {
  const level = game.level();
  const originX = panelX(side);
  for (const diff of level.differences) {
    if (!game.found.has(diff.id)) continue;
    const cx = originX + diff.x;
    const cy = PANEL_Y + diff.y;
    ctx.beginPath();
    ctx.arc(cx, cy, diff.r + 7, 0, Math.PI * 2);
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, diff.r + 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(127, 224, 138, 0.12)';
    ctx.fill();
    // Check mark.
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy);
    ctx.lineTo(cx - 2, cy + 8);
    ctx.lineTo(cx + 11, cy - 8);
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function drawHintRing(ctx, game, side, now) {
  const reveal = game.hintReveal;
  if (!reveal) return;
  const pulse = 1 + 0.18 * Math.sin(now * 9);
  const cx = panelX(side) + reveal.diff.x;
  const cy = PANEL_Y + reveal.diff.y;
  ctx.beginPath();
  ctx.arc(cx, cy, (reveal.diff.r + 10) * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 7]);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPopups(ctx, game, side) {
  const originX = panelX(side);
  for (const popup of game.popups) {
    if (popup.side !== side) continue;
    const alpha = Math.max(0, 1 - popup.t / popup.life);
    const y = PANEL_Y + popup.y - 34 - popup.t * 26;
    ctx.globalAlpha = alpha;
    text(ctx, popup.text, originX + popup.x, y, popup.text.startsWith('+') ? 26 : 15, popup.color, 'center', 800);
    ctx.globalAlpha = 1;
  }
}

function drawMissFlashes(ctx, game, side) {
  const originX = panelX(side);
  for (const flash of game.missFlashes) {
    if (flash.side !== side) continue;
    const alpha = Math.max(0, 1 - flash.t / 0.6);
    const cx = originX + flash.x;
    const cy = PANEL_Y + flash.y;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 12);
    ctx.lineTo(cx + 12, cy + 12);
    ctx.moveTo(cx + 12, cy - 12);
    ctx.lineTo(cx - 12, cy + 12);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawHeader(ctx, game) {
  ctx.fillStyle = '#1d1626';
  ctx.fillRect(0, 0, VIEW_W, HEADER_H);
  text(ctx, 'LANTERNLIGHT', 40, 26, 24, GOLD, 'left', 800);
  text(ctx, 'spot the difference', 40, 50, 12, MUTED, 'left', 500);
  const level = game.level();
  rrect(ctx, 330, 16, 250, 32, 16, '#2b2138');
  text(ctx, `LEVEL ${game.levelIndex + 1} / ${LEVELS.length} — ${level.name.toUpperCase()}`, 455, 33, 14, INK, 'center', 700);
  // Timer.
  const low = game.timeLeft <= LOW_TIME_SECONDS && game.screen === SCREEN_PLAY;
  const frac = Math.max(0, game.timeLeft / level.timeLimit);
  text(ctx, game.formatTime(), 700, 26, 26, low ? RED : INK, 'center', 800);
  rrect(ctx, 620, 46, 160, 6, 3, '#2b2138');
  rrect(ctx, 620, 46, 160 * frac, 6, 3, low ? RED : GOLD);
  text(ctx, `SCORE ${game.score}`, 1010, 26, 20, INK, 'right', 800);
  if (game.combo >= 2) {
    text(ctx, `COMBO ×${game.combo}`, 1010, 50, 13, game.combo >= 4 ? '#ff9a3d' : GOLD, 'right', 800);
  }
}

function drawFooter(ctx, game) {
  ctx.fillStyle = '#1d1626';
  ctx.fillRect(0, FOOTER_Y, VIEW_W, VIEW_H - FOOTER_Y);
  const level = game.level();
  const left = level.differences.length - game.found.size;
  text(ctx, `FOUND ${game.found.size} OF ${level.differences.length}`, 440, FOOTER_Y + 26, 24, INK, 'center', 800);
  text(ctx, left === 0 ? 'ALL FOUND!' : `${left} TO GO`, 440, FOOTER_Y + 54, 14, left === 0 ? GREEN : GOLD, 'center', 700);
  text(ctx, `TOTAL ${game.totalFound} / ${TOTAL_DIFFERENCES} FOUND`, 40, FOOTER_Y + 26, 14, MUTED, 'left', 600);
  text(ctx, 'Click a difference in either picture · H hint · P pause', 40, FOOTER_Y + 54, 12, MUTED, 'left', 500);
  for (const button of footerButtons(game)) {
    rrect(ctx, button.x, button.y, button.w, button.h, 10, button.enabled ? '#3a2c4a' : '#241c2e');
    ctx.strokeStyle = button.enabled ? GOLD : '#4a3a55';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(button.x, button.y, button.w, button.h, 10);
    ctx.stroke();
    text(ctx, button.label, button.x + button.w / 2, button.y + button.h / 2 + 1, 13, button.enabled ? INK : '#6a5a72', 'center', 700);
  }
}

function drawPanels(ctx, game) {
  const level = game.level();
  // The right panel shows the changed picture: every difference applied.
  const changed = new Set(level.differences.map((d) => d.id));
  ctx.save();
  ctx.translate(LEFT_X, PANEL_Y);
  paintScene(ctx, level.scene, PANEL_W, PANEL_H, new Set(), level.seed);
  ctx.restore();
  ctx.save();
  ctx.translate(RIGHT_X, PANEL_Y);
  paintScene(ctx, level.scene, PANEL_W, PANEL_H, changed, level.seed);
  ctx.restore();
  text(ctx, 'ORIGINAL', LEFT_X + PANEL_W / 2, PANEL_Y - PANEL_LABEL_H / 2 - 4, 12, MUTED, 'center', 700);
  text(ctx, 'SPOT THE DIFFERENCES', RIGHT_X + PANEL_W / 2, PANEL_Y - PANEL_LABEL_H / 2 - 4, 12, GOLD, 'center', 700);
  drawPanelFrame(ctx, LEFT_X, PANEL_Y, PANEL_W, PANEL_H, '#4a3a55');
  drawPanelFrame(ctx, RIGHT_X, PANEL_Y, PANEL_W, PANEL_H, GOLD);
}

function drawDim(ctx, alpha = 0.72) {
  ctx.fillStyle = `rgba(12, 8, 18, ${alpha})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawCard(ctx, x, y, w, h) {
  rrect(ctx, x, y, w, h, 18, '#241b30');
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.stroke();
}

function drawOverlayButton(ctx, button) {
  rrect(ctx, button.x, button.y, button.w, button.h, 12, GOLD);
  text(ctx, button.label, button.x + button.w / 2, button.y + button.h / 2 + 1, 18, '#241b30', 'center', 800);
}

function drawTitle(ctx, game, now) {
  // The market scene glows behind the title.
  const level = LEVELS[0];
  ctx.save();
  ctx.translate(LEFT_X, PANEL_Y);
  paintScene(ctx, level.scene, PANEL_W, PANEL_H, new Set(), level.seed);
  ctx.restore();
  ctx.save();
  ctx.translate(RIGHT_X, PANEL_Y);
  paintScene(ctx, level.scene, PANEL_W, PANEL_H, new Set(level.differences.map((d) => d.id)), level.seed);
  ctx.restore();
  drawDim(ctx, 0.66);
  text(ctx, 'LANTERNLIGHT', VIEW_W / 2, 150, 64, GOLD, 'center', 800);
  text(ctx, 'SPOT THE DIFFERENCE', VIEW_W / 2, 205, 22, INK, 'center', 600);
  text(ctx, 'Two pictures. One is lying to you.', VIEW_W / 2, 250, 17, MUTED, 'center', 500);
  text(ctx, 'HOW TO PLAY', VIEW_W / 2, 310, 15, GOLD, 'center', 800);
  text(ctx, 'Study both pictures side by side and click every difference you spot.', VIEW_W / 2, 340, 16, INK, 'center', 500);
  text(ctx, 'A wrong click costs 3 seconds and breaks your combo. H spends a hint (−50 pts).', VIEW_W / 2, 368, 16, INK, 'center', 500);
  text(ctx, 'Five hand-drawn scenes · 35 differences · faster finds earn bigger bonuses.', VIEW_W / 2, 396, 16, INK, 'center', 500);
  text(ctx, 'LEVELS', VIEW_W / 2, 448, 15, GOLD, 'center', 800);
  const names = LEVELS.map((l) => `${l.name} (${l.differences.length})`).join('   ·   ');
  text(ctx, names, VIEW_W / 2, 476, 15, INK, 'center', 600);
  const button = overlayButton(game);
  drawOverlayButton(ctx, button);
  const blink = 0.55 + 0.45 * Math.sin(now * 3);
  ctx.globalAlpha = blink;
  text(ctx, 'or press ENTER', VIEW_W / 2, 648, 13, MUTED, 'center', 600);
  ctx.globalAlpha = 1;
}

function drawIntro(ctx, game) {
  drawDim(ctx, 0.45);
  const level = game.level();
  drawCard(ctx, 340, 250, 600, 200);
  text(ctx, `LEVEL ${game.levelIndex + 1}`, VIEW_W / 2, 300, 15, GOLD, 'center', 800);
  text(ctx, level.name, VIEW_W / 2, 340, 36, INK, 'center', 800);
  text(ctx, level.subtitle, VIEW_W / 2, 378, 16, MUTED, 'center', 500);
  text(ctx, `Find ${level.differences.length} differences in ${level.timeLimit} seconds`, VIEW_W / 2, 414, 16, INK, 'center', 600);
}

function drawLevelComplete(ctx, game) {
  drawDim(ctx, 0.6);
  const bonus = game.levelBonus || { base: 0, timeBonus: 0, total: 0 };
  drawCard(ctx, 340, 190, 600, 300);
  text(ctx, 'LEVEL COMPLETE!', VIEW_W / 2, 240, 34, GREEN, 'center', 800);
  text(ctx, game.level().name, VIEW_W / 2, 282, 18, INK, 'center', 600);
  text(ctx, `All ${game.level().differences.length} differences found`, VIEW_W / 2, 312, 15, MUTED, 'center', 500);
  text(ctx, `Level bonus  +${bonus.base}`, VIEW_W / 2, 356, 17, INK, 'center', 600);
  text(ctx, `Time bonus  +${bonus.timeBonus}`, VIEW_W / 2, 384, 17, INK, 'center', 600);
  text(ctx, `SCORE  ${game.score}`, VIEW_W / 2, 428, 22, GOLD, 'center', 800);
  text(ctx, `Combo best ×${game.bestCombo} · ${game.totalFound} / ${TOTAL_DIFFERENCES} found so far`, VIEW_W / 2, 458, 14, MUTED, 'center', 500);
  drawOverlayButton(ctx, overlayButton(game));
}

function drawGameOver(ctx, game) {
  drawDim(ctx, 0.72);
  drawCard(ctx, 340, 190, 600, 300);
  text(ctx, 'TIME UP!', VIEW_W / 2, 240, 34, RED, 'center', 800);
  text(ctx, game.level().name, VIEW_W / 2, 282, 18, INK, 'center', 600);
  text(ctx, `You found ${game.found.size} of ${game.level().differences.length} differences on this level.`, VIEW_W / 2, 318, 16, INK, 'center', 500);
  text(ctx, `SCORE  ${game.score}`, VIEW_W / 2, 368, 22, GOLD, 'center', 800);
  text(ctx, `Total found ${game.totalFound} / ${TOTAL_DIFFERENCES} · best combo ×${game.bestCombo}`, VIEW_W / 2, 400, 14, MUTED, 'center', 500);
  text(ctx, 'The remaining differences stay hidden — try again and beat the clock.', VIEW_W / 2, 432, 14, MUTED, 'center', 500);
  drawOverlayButton(ctx, overlayButton(game));
}

function drawVictory(ctx, game) {
  drawDim(ctx, 0.6);
  drawCard(ctx, 300, 150, 680, 380);
  text(ctx, 'YOU FOUND THEM ALL!', VIEW_W / 2, 200, 34, GOLD, 'center', 800);
  text(ctx, 'Every difference in all five scenes — the lanterns are proud of you.', VIEW_W / 2, 240, 16, INK, 'center', 500);
  text(ctx, `FINAL SCORE  ${game.score}`, VIEW_W / 2, 300, 28, GOLD, 'center', 800);
  text(ctx, `${TOTAL_DIFFERENCES} / ${TOTAL_DIFFERENCES} differences found`, VIEW_W / 2, 344, 17, GREEN, 'center', 700);
  text(ctx, `Best combo ×${game.bestCombo} · ${game.totalMisses} misses · ${game.hintsUsed} hints used`, VIEW_W / 2, 376, 15, MUTED, 'center', 500);
  text(ctx, 'Thanks for playing Lanternlight.', VIEW_W / 2, 420, 15, INK, 'center', 500);
  drawOverlayButton(ctx, overlayButton(game));
}

function drawPaused(ctx) {
  drawDim(ctx, 0.6);
  drawCard(ctx, 440, 280, 400, 140);
  text(ctx, 'PAUSED', VIEW_W / 2, 330, 30, INK, 'center', 800);
  text(ctx, 'Press P to keep hunting', VIEW_W / 2, 372, 15, MUTED, 'center', 500);
}

/** Draw one frame. `now` is seconds, for pulsing animations. */
export function drawFrame(ctx, game, now) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#14101d';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (game.screen === SCREEN_TITLE) {
    drawTitle(ctx, game, now);
    return;
  }
  drawHeader(ctx, game);
  drawPanels(ctx, game);
  drawMarkers(ctx, game, 'left');
  drawMarkers(ctx, game, 'right');
  drawHintRing(ctx, game, 'left', now);
  drawHintRing(ctx, game, 'right', now);
  drawPopups(ctx, game, 'left');
  drawPopups(ctx, game, 'right');
  drawMissFlashes(ctx, game, 'left');
  drawMissFlashes(ctx, game, 'right');
  drawFooter(ctx, game);
  if (game.screen === SCREEN_INTRO) drawIntro(ctx, game);
  else if (game.screen === SCREEN_LEVEL_COMPLETE) drawLevelComplete(ctx, game);
  else if (game.screen === SCREEN_GAME_OVER) drawGameOver(ctx, game);
  else if (game.screen === SCREEN_VICTORY) drawVictory(ctx, game);
  else if (game.screen === SCREEN_PAUSED) drawPaused(ctx);
}
