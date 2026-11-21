// Procedural scene painters: every picture is drawn in code, so the art is
// original, deterministic and self-contained — no image files, no network.
//
// Each painter draws one scene into a panel of width W and height H. The left
// panel is painted with an empty difference set; the right panel with the
// level's difference ids, so only the deliberate differences change.
// Decoration uses salted generators (see random.js), so a difference never
// shifts the stars, waves or fireflies that follow it.
import { rngFor } from './random.js';

function vgrad(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rrect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** A five-point star. */
function star5(ctx, x, y, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A four-point sparkle. */
function sparkle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function stars(ctx, w, h, seed, salt, count, top = 0, bottom = 0.55) {
  const rng = rngFor(seed, salt);
  for (let i = 0; i < count; i += 1) {
    const x = 12 + rng() * (w - 24);
    const y = top + rng() * (h * bottom - top);
    const r = 0.8 + rng() * 1.6;
    circle(ctx, x, y, r, `rgba(255, 244, 200, ${0.5 + rng() * 0.5})`);
  }
}

/** A round paper lantern with a tassel, hanging from a cord. */
function lantern(ctx, x, y, r, color) {
  line(ctx, x, y - r - 26, x, y - r, '#3a2a1a', 2);
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.12, 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.12, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.45, r * 0.45, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
  line(ctx, x - r * 0.55, y - r * 0.5, x - r * 0.55, y + r * 0.5, 'rgba(0,0,0,0.18)', 2);
  line(ctx, x + r * 0.55, y - r * 0.5, x + r * 0.55, y + r * 0.5, 'rgba(0,0,0,0.18)', 2);
  rrect(ctx, x - 6, y + r * 1.05, 12, 5, 2, '#8a6a2f');
  line(ctx, x, y + r * 1.1 + 5, x, y + r * 1.1 + 16, '#e8b23a', 2);
}

/** A sitting cat silhouette, facing right. */
function sittingCat(ctx, x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -34, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-6, -46);
  ctx.lineTo(-2, -62);
  ctx.lineTo(6, -48);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -48);
  ctx.lineTo(20, -62);
  ctx.lineTo(24, -44);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(24, 22, 22, 7, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Level 1 — Lantern Market
// ---------------------------------------------------------------------------
function paintLanternMarket(ctx, W, H, diffs, seed) {
  vgrad(ctx, W, H, [[0, '#171233'], [0.55, '#3a2560'], [1, '#5a3a7a']]);
  stars(ctx, W, H, seed, 11, 42);
  // Crescent moon, top right.
  circle(ctx, 478, 66, 34, '#f7dc8a');
  circle(ctx, 492, 58, 30, '#3a2560');
  if (diffs.has('moonStar')) sparkle(ctx, 424, 52, 12, '#fff3c4');
  // Distant rooftops, just light enough to read against the night sky.
  ctx.fillStyle = '#2e2154';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.lineTo(90, 300);
  ctx.lineTo(180, 330);
  ctx.lineTo(300, 296);
  ctx.lineTo(420, 330);
  ctx.lineTo(520, 302);
  ctx.lineTo(580, 330);
  ctx.lineTo(580, 430);
  ctx.lineTo(0, 430);
  ctx.closePath();
  ctx.fill();
  // Stall posts.
  rrect(ctx, 26, 70, 12, 380, 3, '#5a3a22');
  rrect(ctx, 542, 70, 12, 380, 3, '#5a3a22');
  // Striped awning.
  const stripeColors = ['#d94f3d', '#f3e2c2'];
  for (let i = 0; i < 10; i += 1) {
    let color = stripeColors[i % 2];
    if (diffs.has('awningStripe') && i === 2) color = '#2fb8a6';
    ctx.fillStyle = color;
    ctx.fillRect(20 + i * 54, 8, 54, 58);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(20, 58, 540, 8);
  // Lantern row under the awning.
  const lanternXs = [86, 178, 288, 398, 492];
  const lanternColors = ['#e0453a', '#f2b134', '#e0453a', '#f2b134', '#e0453a'];
  lanternXs.forEach((x, i) => {
    let color = lanternColors[i];
    if (diffs.has('lanternColor') && i === 2) color = '#2fb8a6';
    lantern(ctx, x, 128, 27, color);
  });
  // Bunting strung under the awning, between the lanterns.
  ctx.strokeStyle = 'rgba(243, 226, 194, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 190);
  ctx.quadraticCurveTo(290, 222, 540, 190);
  ctx.stroke();
  const buntingColors = ['#d94f3d', '#f2b134', '#7fb069', '#3a6fd8'];
  for (let i = 0; i < 12; i += 1) {
    const bx = 62 + i * 40;
    const by = 192 + Math.sin((i / 11) * Math.PI) * 22;
    ctx.beginPath();
    ctx.moveTo(bx - 9, by);
    ctx.lineTo(bx + 9, by);
    ctx.lineTo(bx, by + 20);
    ctx.closePath();
    ctx.fillStyle = buntingColors[i % 4];
    ctx.fill();
  }
  // Warm glow behind the stall.
  const glow = ctx.createRadialGradient(290, 300, 20, 290, 300, 260);
  glow.addColorStop(0, 'rgba(255, 190, 90, 0.28)');
  glow.addColorStop(1, 'rgba(255, 190, 90, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 66, W, 380);
  // Stall counter.
  rrect(ctx, 20, 430, 540, 110, 6, '#7a5230');
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  for (let y = 452; y < 540; y += 22) ctx.fillRect(20, y, 540, 3);
  // Glass jars of sweets on the counter.
  const jarXs = [196, 296, 396];
  jarXs.forEach((x, i) => {
    if (diffs.has('jarMissing') && i === 1) return;
    rrect(ctx, x - 24, 372, 48, 58, 10, 'rgba(220, 235, 245, 0.85)');
    rrect(ctx, x - 28, 364, 56, 12, 6, '#b08a4f');
    circle(ctx, x - 10, 402, 7, '#e0453a');
    circle(ctx, x + 8, 392, 7, '#f2b134');
    circle(ctx, x + 2, 414, 7, '#7fb069');
  });
  // The stall cat, asleep on the counter's left end.
  if (!diffs.has('catMissing')) sittingCat(ctx, 96, 402, 0.9, '#2b2033');
  // A bowl of oranges on the right end.
  circle(ctx, 492, 408, 11, '#f07f2e');
  circle(ctx, 512, 412, 11, '#f07f2e');
  circle(ctx, 502, 394, 11, '#f59a3e');
  ellipse(ctx, 500, 422, 34, 10, '#4a2f1c');
}

// ---------------------------------------------------------------------------
// Level 2 — Harbour at Dawn
// ---------------------------------------------------------------------------
function paintHarbour(ctx, W, H, diffs, seed) {
  vgrad(ctx, W, H, [[0, '#7d9fd4'], [0.45, '#ffb37a'], [0.6, '#ffd9a0'], [1, '#175e6e']]);
  // Clouds.
  const cloudRng = rngFor(seed, 21);
  for (let i = 0; i < 3; i += 1) {
    const cx = 70 + cloudRng() * 420;
    const cy = 60 + cloudRng() * 90;
    ellipse(ctx, cx, cy, 52, 16, 'rgba(255, 240, 220, 0.75)');
    ellipse(ctx, cx + 30, cy + 6, 38, 12, 'rgba(255, 240, 220, 0.6)');
  }
  // Sun with rays.
  const sunX = 432;
  const sunY = 128;
  const rays = diffs.has('sunRays') ? 5 : 8;
  for (let i = 0; i < rays; i += 1) {
    const a = (Math.PI * 2 * i) / rays - Math.PI / 2;
    line(ctx, sunX + Math.cos(a) * 52, sunY + Math.sin(a) * 52, sunX + Math.cos(a) * 72, sunY + Math.sin(a) * 72, '#ffdf8a', 4);
  }
  circle(ctx, sunX, sunY, 40, '#ffdf8a');
  circle(ctx, sunX, sunY, 32, '#ffe9a8');
  // Gulls.
  const gullXs = [120, 250, 350];
  gullXs.forEach((x, i) => {
    if (diffs.has('gullMissing') && i === 1) return;
    const y = 84 + i * 18;
    ctx.beginPath();
    ctx.arc(x - 8, y, 8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.arc(x + 8, y, 8, Math.PI * 1.15, Math.PI * 1.85);
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });
  // Sea.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 300, W, H - 300);
  ctx.clip();
  const sea = ctx.createLinearGradient(0, 300, 0, H);
  sea.addColorStop(0, '#2e7f8f');
  sea.addColorStop(1, '#175e6e');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, W, H - 300);
  // Sun reflection.
  ctx.fillStyle = 'rgba(255, 223, 138, 0.35)';
  for (let i = 0; i < 6; i += 1) ctx.fillRect(408 + (i % 2) * 22 - 10, 306 + i * 34, 56 - i * 4, 7);
  // Wave lines.
  const waveRng = rngFor(seed, 22);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i += 1) {
    const wy = 320 + waveRng() * 200;
    const wx = waveRng() * 480;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + 25, wy - 5, wx + 50, wy);
    ctx.stroke();
  }
  ctx.restore();
  // Buoy.
  const buoyColor = diffs.has('buoyColor') ? '#2f9e6e' : '#e0453a';
  ellipse(ctx, 180, 392, 26, 10, 'rgba(0,0,0,0.25)');
  ctx.beginPath();
  ctx.arc(180, 378, 20, Math.PI, 0);
  ctx.fillStyle = buoyColor;
  ctx.fill();
  ctx.fillRect(160, 378, 40, 12);
  ctx.fillStyle = '#f3e2c2';
  ctx.fillRect(160, 384, 40, 6);
  line(ctx, 180, 358, 180, 344, '#3a2a1a', 3);
  circle(ctx, 180, 340, 5, '#ffd23e');
  // Boat with sail.
  ctx.fillStyle = '#6b4226';
  ctx.beginPath();
  ctx.moveTo(258, 420);
  ctx.lineTo(392, 420);
  ctx.lineTo(372, 452);
  ctx.lineTo(278, 452);
  ctx.closePath();
  ctx.fill();
  line(ctx, 325, 420, 325, 296, '#4a2f1c', 5);
  ctx.beginPath();
  ctx.moveTo(325, 300);
  ctx.quadraticCurveTo(392, 350, 325, 414);
  ctx.closePath();
  ctx.fillStyle = '#f3e2c2';
  ctx.fill();
  const flagColor = diffs.has('flagColor') ? '#3a6fd8' : '#d94f3d';
  ctx.beginPath();
  ctx.moveTo(325, 296);
  ctx.lineTo(362, 306);
  ctx.lineTo(325, 318);
  ctx.closePath();
  ctx.fillStyle = flagColor;
  ctx.fill();
  // Lighthouse on rocks, right.
  ctx.fillStyle = '#5a5a6a';
  ctx.beginPath();
  ctx.moveTo(452, 452);
  ctx.lineTo(500, 380);
  ctx.lineTo(560, 380);
  ctx.lineTo(580, 452);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f3e2c2';
  ctx.fillRect(496, 196, 44, 196);
  ctx.fillStyle = '#d94f3d';
  ctx.fillRect(496, 236, 44, 26);
  ctx.fillRect(496, 316, 44, 26);
  ctx.fillStyle = '#2b2b3a';
  ctx.fillRect(490, 176, 56, 22);
  circle(ctx, 518, 187, 7, '#ffe9a8');
  if (diffs.has('lighthouseBeam')) {
    ctx.beginPath();
    ctx.moveTo(518, 187);
    ctx.lineTo(400, 150);
    ctx.lineTo(400, 224);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 233, 168, 0.4)';
    ctx.fill();
  }
  // Wooden pier, bottom left.
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(0, 470, 300, 70);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let x = 0; x < 300; x += 42) ctx.fillRect(x, 470, 3, 70);
  ctx.fillStyle = '#8a5f36';
  ctx.fillRect(0, 470, 300, 8);
  // Crates on the pier.
  rrect(ctx, 52, 424, 46, 46, 4, '#b08a4f');
  line(ctx, 52, 424, 98, 470, '#8a6a2f', 3);
  line(ctx, 98, 424, 52, 470, '#8a6a2f', 3);
  rrect(ctx, 104, 424, 46, 46, 4, '#a07a45');
  line(ctx, 104, 424, 150, 470, '#7a5a2a', 3);
  line(ctx, 150, 424, 104, 470, '#7a5a2a', 3);
  if (diffs.has('crateExtra')) {
    rrect(ctx, 78, 380, 44, 44, 4, '#b08a4f');
    line(ctx, 78, 380, 122, 424, '#8a6a2f', 3);
    line(ctx, 122, 380, 78, 424, '#8a6a2f', 3);
  }
}

// ---------------------------------------------------------------------------
// Level 3 — The Clockmaker's Study
// ---------------------------------------------------------------------------
function drawGear(ctx, x, y, r, color, hubColor) {
  ctx.fillStyle = color;
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * 2 * i) / 8;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillRect(-4, -r - 8, 8, 12);
    ctx.restore();
  }
  circle(ctx, x, y, r, color);
  circle(ctx, x, y, r * 0.45, hubColor);
}

function paintStudy(ctx, W, H, diffs, seed) {
  vgrad(ctx, W, H, [[0, '#8a6a4f'], [0.6, '#6b4e38'], [1, '#54382a']]);
  // Wainscot.
  ctx.fillStyle = '#4a3222';
  ctx.fillRect(0, 470, W, 70);
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(0, 470, W, 8);
  // Window with night sky, right.
  ctx.save();
  ctx.beginPath();
  ctx.rect(428, 36, 128, 150);
  ctx.clip();
  ctx.fillStyle = '#1b2440';
  ctx.fillRect(428, 36, 128, 150);
  ctx.translate(428, 36);
  stars(ctx, 128, 150, seed, 31, 8);
  if (diffs.has('windowMoon')) {
    star5(ctx, 64, 72, 16, '#fff3c4');
  } else {
    circle(ctx, 64, 68, 26, '#f7dc8a');
    circle(ctx, 74, 60, 22, '#1b2440');
  }
  ctx.restore();
  ctx.strokeStyle = '#3a2415';
  ctx.lineWidth = 8;
  ctx.strokeRect(428, 36, 128, 150);
  line(ctx, 492, 36, 492, 186, '#3a2415', 6);
  line(ctx, 428, 111, 556, 111, '#3a2415', 6);
  // Gears on the wall, left.
  drawGear(ctx, 92, 128, 34, '#c9a227', '#8a6a2f');
  const smallGearColor = diffs.has('gearColor') ? '#7fb069' : '#d8a93b';
  drawGear(ctx, 152, 196, 24, smallGearColor, '#8a6a2f');
  // Big wall clock.
  circle(ctx, 290, 150, 74, '#2b2033');
  circle(ctx, 290, 150, 66, '#f3e2c2');
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI * 2 * i) / 12;
    circle(ctx, 290 + Math.cos(a) * 56, 150 + Math.sin(a) * 56, 3, '#2b2033');
  }
  const hands = diffs.has('clockHands')
    ? { hour: -2.2, minute: 1.5 }
    : { hour: -0.9, minute: 0.9 };
  line(ctx, 290, 150, 290 + Math.cos(hands.hour) * 34, 150 + Math.sin(hands.hour) * 34, '#2b2033', 6);
  line(ctx, 290, 150, 290 + Math.cos(hands.minute) * 52, 150 + Math.sin(hands.minute) * 52, '#2b2033', 4);
  circle(ctx, 290, 150, 6, '#d94f3d');
  // Desk.
  rrect(ctx, 0, 380, W, 160, 4, '#7a5230');
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  for (let y = 402; y < 540; y += 24) ctx.fillRect(0, y, W, 3);
  // Oil lamp, left.
  ellipse(ctx, 120, 372, 34, 8, 'rgba(0,0,0,0.3)');
  rrect(ctx, 100, 330, 40, 42, 8, '#3a6a8a');
  rrect(ctx, 112, 318, 16, 14, 4, '#2b4a5a');
  if (!diffs.has('lampFlame')) {
    ctx.beginPath();
    ctx.ellipse(120, 306, 9, 15, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcf5a';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(120, 310, 5, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff9a3d';
    ctx.fill();
    const glow = ctx.createRadialGradient(120, 308, 4, 120, 308, 60);
    glow.addColorStop(0, 'rgba(255, 200, 90, 0.35)');
    glow.addColorStop(1, 'rgba(255, 200, 90, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(50, 240, 140, 140);
  }
  // Mug.
  if (!diffs.has('mugMissing')) {
    rrect(ctx, 222, 344, 36, 34, 6, '#d94f3d');
    ctx.beginPath();
    ctx.arc(262, 361, 10, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = '#d94f3d';
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  // Stack of books.
  const bookColors = ['#3a6a8a', '#d94f3d', '#7fb069'];
  const bookWidths = [120, 104, 88];
  let bookY = 380;
  bookColors.forEach((color, i) => {
    const useColor = diffs.has('bookColor') && i === 2 ? '#f2b134' : color;
    rrect(ctx, 380 + (120 - bookWidths[i]) / 2, bookY - 18, bookWidths[i], 18, 3, useColor);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(380 + (120 - bookWidths[i]) / 2, bookY - 18, 8, 18);
    bookY -= 18;
  });
  // Sleeping cat on the desk, right.
  ctx.fillStyle = '#2b2033';
  ctx.beginPath();
  ctx.ellipse(470, 356, 44, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(428, 342, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(416, 330);
  ctx.lineTo(420, 316);
  ctx.lineTo(428, 328);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(434, 328);
  ctx.lineTo(440, 314);
  ctx.lineTo(444, 330);
  ctx.closePath();
  ctx.fill();
  // Tail: curled up over the back, or lying flat on the desk.
  ctx.strokeStyle = '#2b2033';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (diffs.has('catTail')) {
    ctx.moveTo(512, 356);
    ctx.quadraticCurveTo(536, 360, 540, 376);
  } else {
    ctx.moveTo(512, 356);
    ctx.quadraticCurveTo(534, 336, 522, 318);
  }
  ctx.stroke();
  // A tiny brass key on the desk.
  circle(ctx, 330, 392, 6, '#c9a227');
  line(ctx, 336, 392, 356, 392, '#c9a227', 4);
  line(ctx, 350, 392, 350, 400, '#c9a227', 3);
}

// ---------------------------------------------------------------------------
// Level 4 — Moonlit Garden
// ---------------------------------------------------------------------------
function paintGarden(ctx, W, H, diffs, seed) {
  vgrad(ctx, W, H, [[0, '#101a3a'], [0.6, '#2c4a6e'], [1, '#1d3a2e']]);
  stars(ctx, W, H, seed, 41, 36);
  // Big moon.
  circle(ctx, 472, 88, 42, '#f7dc8a');
  circle(ctx, 458, 78, 8, 'rgba(0,0,0,0.12)');
  circle(ctx, 486, 100, 6, 'rgba(0,0,0,0.12)');
  // Tree, left.
  ctx.fillStyle = '#4a3222';
  ctx.beginPath();
  ctx.moveTo(96, 470);
  ctx.quadraticCurveTo(104, 300, 88, 220);
  ctx.lineTo(112, 220);
  ctx.quadraticCurveTo(122, 300, 128, 470);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3222';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(100, 300);
  ctx.quadraticCurveTo(70, 260, 56, 220);
  ctx.stroke();
  if (!diffs.has('branchMissing')) {
    ctx.beginPath();
    ctx.moveTo(112, 280);
    ctx.quadraticCurveTo(150, 240, 168, 200);
    ctx.stroke();
  }
  circle(ctx, 104, 180, 66, '#2e5a34');
  circle(ctx, 60, 210, 44, '#35663c');
  circle(ctx, 150, 208, 48, '#2a5230');
  circle(ctx, 104, 140, 40, '#3a6e42');
  // Fireflies: fixed spots, so the missing pair has a fixed place to find.
  // Five glow in the original; only three in the changed picture.
  const fireflySpots = [[250, 160], [330, 220], [410, 150], [480, 240], [290, 280]];
  const fireflyCount = diffs.has('fireflyCount') ? 3 : 5;
  for (let i = 0; i < fireflyCount; i += 1) {
    const [fx, fy] = fireflySpots[i];
    const glow = ctx.createRadialGradient(fx, fy, 1, fx, fy, 14);
    glow.addColorStop(0, 'rgba(190, 255, 120, 0.9)');
    glow.addColorStop(1, 'rgba(190, 255, 120, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(fx - 14, fy - 14, 28, 28);
    circle(ctx, fx, fy, 3, '#d8ff8a');
  }
  // Pond, bottom right.
  ellipse(ctx, 400, 452, 160, 62, '#1d5a74');
  ellipse(ctx, 400, 448, 148, 54, '#2a7a94');
  if (!diffs.has('rippleMissing')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(452, 462, 26, 9, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(452, 462, 38, 13, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Lily pads.
  ellipse(ctx, 330, 440, 34, 12, '#3a8a4a');
  ellipse(ctx, 470, 430, 30, 11, '#3a8a4a');
  // Frog on a lily pad.
  if (!diffs.has('frogMissing')) {
    circle(ctx, 400, 428, 16, '#5aa844');
    circle(ctx, 390, 412, 7, '#5aa844');
    circle(ctx, 410, 412, 7, '#5aa844');
    circle(ctx, 390, 410, 3, '#1d3a2e');
    circle(ctx, 410, 410, 3, '#1d3a2e');
    ctx.beginPath();
    ctx.arc(400, 430, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.strokeStyle = '#1d3a2e';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  // Wooden bridge over the pond.
  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(250, 470);
  ctx.quadraticCurveTo(330, 400, 420, 452);
  ctx.stroke();
  const plankXs = [268, 296, 324, 352, 380, 404];
  plankXs.forEach((x, i) => {
    if (diffs.has('plankMissing') && i === 2) return;
    const y = 452 - Math.sin((i / 5) * Math.PI) * 34;
    line(ctx, x, y - 12, x, y + 12, '#8a5f36', 7);
  });
  // Stone lantern.
  ctx.fillStyle = '#8a8a92';
  rrect(ctx, 100, 392, 44, 18, 3, '#8a8a92');
  rrect(ctx, 108, 360, 28, 34, 3, '#9a9aa2');
  ctx.beginPath();
  ctx.moveTo(96, 360);
  ctx.lineTo(122, 336);
  ctx.lineTo(148, 360);
  ctx.closePath();
  ctx.fillStyle = '#7a7a82';
  ctx.fill();
  if (!diffs.has('lanternLit')) {
    rrect(ctx, 114, 366, 16, 12, 2, '#ffcf5a');
    const glow = ctx.createRadialGradient(122, 372, 2, 122, 372, 46);
    glow.addColorStop(0, 'rgba(255, 200, 90, 0.4)');
    glow.addColorStop(1, 'rgba(255, 200, 90, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(70, 320, 110, 110);
  } else {
    rrect(ctx, 114, 366, 16, 12, 2, '#3a3a44');
  }
  // Tulips along the bottom.
  const tulipXs = [180, 220, 260, 300, 520, 550];
  tulipXs.forEach((x, i) => {
    const color = diffs.has('flowerColor') && i === 2 ? '#f07f2e' : '#e86a9a';
    line(ctx, x, 520, x, 492, '#3a8a4a', 3);
    ctx.beginPath();
    ctx.moveTo(x - 9, 492);
    ctx.quadraticCurveTo(x, 478, x + 9, 492);
    ctx.quadraticCurveTo(x + 6, 506, x, 506);
    ctx.quadraticCurveTo(x - 6, 506, x - 9, 492);
    ctx.fillStyle = color;
    ctx.fill();
  });
  // Mushrooms near the tree.
  function mushroom(x, y, s) {
    line(ctx, x, y, x, y - 14 * s, '#f3e2c2', 6 * s);
    ctx.beginPath();
    ctx.arc(x, y - 14 * s, 12 * s, Math.PI, 0);
    ctx.fillStyle = '#d94f3d';
    ctx.fill();
    circle(ctx, x - 5, y - 20 * s, 2, '#f3e2c2');
    circle(ctx, x + 4, y - 24 * s, 2, '#f3e2c2');
  }
  mushroom(52, 500, 1);
  if (diffs.has('mushroomExtra')) mushroom(88, 512, 0.8);
  // Grass tufts.
  ctx.strokeStyle = '#3a8a4a';
  ctx.lineWidth = 2;
  for (let x = 20; x < W; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 536);
    ctx.lineTo(x + 4, 522);
    ctx.moveTo(x + 8, 536);
    ctx.lineTo(x + 12, 524);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------------------
// Level 5 — Starlight Railway
// ---------------------------------------------------------------------------
function paintRailway(ctx, W, H, diffs, seed) {
  vgrad(ctx, W, H, [[0, '#0d1230'], [0.55, '#1e2a55'], [1, '#2a2a3a']]);
  stars(ctx, W, H, seed, 51, 70, 0, 0.5);
  // One special star: a sparkle in one version, a round star in the other.
  if (diffs.has('starShape')) circle(ctx, 478, 78, 5, '#fff3c4');
  else sparkle(ctx, 478, 78, 12, '#fff3c4');
  // Clock tower, left.
  ctx.fillStyle = '#3a3a4a';
  ctx.fillRect(78, 150, 66, 330);
  ctx.beginPath();
  ctx.moveTo(70, 150);
  ctx.lineTo(111, 108);
  ctx.lineTo(152, 150);
  ctx.closePath();
  ctx.fillStyle = '#2b2b3a';
  ctx.fill();
  circle(ctx, 111, 170, 34, '#f3e2c2');
  circle(ctx, 111, 170, 28, '#2b2033');
  circle(ctx, 111, 170, 26, '#f3e2c2');
  const towerHands = diffs.has('towerHands')
    ? { hour: 2.4, minute: -1.2 }
    : { hour: -0.9, minute: 0.9 };
  line(ctx, 111, 170, 111 + Math.cos(towerHands.hour) * 14, 170 + Math.sin(towerHands.hour) * 14, '#2b2033', 4);
  line(ctx, 111, 170, 111 + Math.cos(towerHands.minute) * 22, 170 + Math.sin(towerHands.minute) * 22, '#2b2033', 3);
  circle(ctx, 111, 170, 3, '#d94f3d');
  // Station sign with a crescent.
  rrect(ctx, 84, 236, 56, 22, 4, '#f2b134');
  ctx.fillStyle = '#2b2033';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LUMEN', 112, 248);
  if (!diffs.has('signMoon')) {
    circle(ctx, 132, 242, 5, '#2b2033');
    circle(ctx, 134, 240, 4, '#f2b134');
  }
  // Train.
  const smokeCount = diffs.has('smokeCount') ? 2 : 3;
  for (let i = 0; i < smokeCount; i += 1) {
    circle(ctx, 486 + i * 22, 246 - i * 26, 16 - i * 2, 'rgba(230, 230, 240, 0.75)');
  }
  rrect(ctx, 246, 288, 316, 118, 14, '#3a6a8a');
  rrect(ctx, 246, 288, 316, 30, 14, '#2b4a5a');
  rrect(ctx, 246, 380, 316, 26, 10, '#2b4a5a');
  // Windows: four in one version, three in the other.
  const windowCount = diffs.has('windowCount') ? 3 : 4;
  for (let i = 0; i < windowCount; i += 1) {
    const wx = 272 + i * 66;
    rrect(ctx, wx, 326, 44, 36, 6, '#ffdf8a');
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(wx, 326, 44, 8);
  }
  // Chimney.
  rrect(ctx, 524, 252, 22, 40, 4, '#2b2b3a');
  // Wheels.
  [290, 360, 430, 500].forEach((wx) => {
    circle(ctx, wx, 412, 16, '#1d1d28');
    circle(ctx, wx, 412, 7, '#8a8a92');
  });
  // Tracks with sleepers.
  ctx.fillStyle = '#2b2b3a';
  ctx.fillRect(0, 440, W, 10);
  ctx.fillStyle = '#4a4a55';
  ctx.fillRect(0, 440, W, 4);
  for (let x = 12; x < W; x += 34) {
    // One sleeper is missing from the changed picture (the one near x 386).
    if (diffs.has('sleeperMissing') && x > 368 && x < 402) continue;
    ctx.fillStyle = '#5a3a22';
    ctx.fillRect(x, 428, 20, 34);
  }
  // Platform.
  ctx.fillStyle = '#6a6a72';
  ctx.fillRect(0, 470, W, 70);
  ctx.fillStyle = '#f2b134';
  ctx.fillRect(0, 470, W, 5);
  // Signal post.
  line(ctx, 206, 470, 206, 380, '#3a3a4a', 6);
  circle(ctx, 206, 368, 14, '#2b2b3a');
  const signalColor = diffs.has('signalColor') ? '#e0453a' : '#4ac06a';
  circle(ctx, 206, 368, 8, signalColor);
  const signalGlow = ctx.createRadialGradient(206, 368, 2, 206, 368, 30);
  signalGlow.addColorStop(0, signalColor === '#e0453a' ? 'rgba(224, 69, 58, 0.4)' : 'rgba(74, 192, 106, 0.4)');
  signalGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = signalGlow;
  ctx.fillRect(176, 338, 60, 60);
  // Conductor on the platform, standing clear of the train's lower edge.
  ctx.fillStyle = '#2b3a5a';
  rrect(ctx, 274, 428, 30, 52, 8, '#2b3a5a');
  circle(ctx, 289, 414, 12, '#e8b88a');
  const hatColor = diffs.has('hatColor') ? '#a62b2b' : '#1d2a44';
  rrect(ctx, 275, 400, 28, 10, 4, hatColor);
  rrect(ctx, 271, 408, 36, 5, 2, hatColor);
  line(ctx, 282, 480, 282, 496, '#1d2a44', 5);
  line(ctx, 296, 480, 296, 496, '#1d2a44', 5);
  // Suitcases beside the conductor.
  if (!diffs.has('suitcaseMissing')) {
    rrect(ctx, 322, 452, 34, 26, 4, '#8a4a2a');
    rrect(ctx, 326, 444, 26, 18, 4, '#3a6a8a');
    line(ctx, 326, 465, 352, 465, '#5a2a1a', 2);
  }
  // A bench on the platform, right.
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(480, 452, 80, 8);
  ctx.fillRect(486, 460, 6, 20);
  ctx.fillRect(548, 460, 6, 20);
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
export const SCENES = {
  market: paintLanternMarket,
  harbour: paintHarbour,
  study: paintStudy,
  garden: paintGarden,
  railway: paintRailway,
};

/** Paint a scene into a panel. `diffs` is a Set of difference ids (empty = original). */
export function paintScene(ctx, sceneId, W, H, diffs, seed) {
  const painter = SCENES[sceneId];
  if (!painter) throw new Error(`unknown scene ${sceneId}`);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, W, H);
  ctx.clip();
  painter(ctx, W, H, diffs, seed);
  ctx.restore();
}
