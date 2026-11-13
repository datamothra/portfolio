// undertow: drawing and input. The rules are in undertow.js. The levels are in levels.js,
// which tools/solve.js makes from levels/*.txt.
(function () {
  'use strict';
  const U = window.Undertow;
  const LEVELS = window.UNDERTOW_LEVELS.map((b) => ({ L: U.parseLevel(b.text, b.file), report: b.report }));

  // ----- Drew's colours -----
  const PAPER = [255, 247, 245], INK = [192, 48, 42], NAVY = [42, 48, 144], HOT = [222, 28, 120];
  const BAND = [252, 204, 222], GOLD = [204, 158, 56], WHITE = [255, 255, 255];
  const WATER = [[168, 36, 30], [214, 52, 42], [236, 104, 90], [255, 168, 150]];   // dark, body, light, vein
  const SHORE_EDGE = [214, 112, 132], ROCK_EDGE = [176, 72, 98], GOLD_DARK = [146, 104, 26], GOLD_LIGHT = [236, 202, 120];
  const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const T = 16;                                          // pixels per tile in the small picture

  // ----- the water: one 32 x 32 texture of cells with bright veins, read twice -----
  // Same construction as CausticTexture() in Handoff (9 cell points, distance to the nearest two).
  const N = 32;
  const caustic = (function () {
    const cells = 9, px = [], py = [];
    let s = 0x9e3779b9;
    const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s & 0xffffff) / 0x1000000; };
    for (let i = 0; i < cells; i++) { px.push(rnd() * N); py.push(rnd() * N); }
    const tex = new Uint8Array(N * N);                    // 0 dark, 1 body, 2 light, 3 vein
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let f1 = 1e9, f2 = 1e9;
      for (let i = 0; i < cells; i++) for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const d = Math.hypot(x + 0.5 - (px[i] + ox * N), y + 0.5 - (py[i] + oy * N));
        if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
      }
      const v = Math.min(1, Math.max(0, 1 - (f2 - f1) / 1.6)), inside = Math.min(1, f1 / 7);
      tex[y * N + x] = v * v > 0.5 ? 3 : v * v > 0.12 ? 2 : inside < 0.42 ? 0 : 1;
    }
    return tex;
  })();
  // Two copies slide across each other on crossed diagonals. The first keeps its bright veins,
  // the second is one step dimmer, and the brighter of the two is drawn.
  function waterColour(x, y, f) {
    const a = caustic[((y + f) & 31) * N + ((x - f) & 31)];
    const b = caustic[((y + 11 + (f >> 1)) & 31) * N + ((x + 17 + f) & 31)];
    return WATER[Math.max(a, b === 3 ? 2 : b)];
  }

  // ----- small pictures, written as text -----
  const COMPUTER = [
    '................',
    '.wwwwwwwwwwwwww.',
    '.wfffffffwffffw.',
    '.wfffffffwffffw.',
    '.wfwwfffwffwffw.',
    '.wffffffwfffffw.',
    '.wfffffwffffffw.',
    '.wfffffwwfffffw.',
    '.wffwwwwwwwfffw.',
    '.wfffffffwffffw.',
    '.wwwwwwwwwwwwww.',
    '......wwww......',
    '.....wwffww.....',
    '....wwwwwwww....',
    '................',
    '................'];
  const HOUSE = [
    '................',
    '..bbbbbbbbbbbb..',
    '.b............b.',
    '.b.....cc.....b.',
    '.b....cccc....b.',
    '.b...cc..cc...b.',
    '.b..cc....cc..b.',
    '.b..cccccccc..b.',
    '.b..c......c..b.',
    '.b..c..cc..c..b.',
    '.b..c..cc..c..b.',
    '.b..cccccccc..b.',
    '.b............b.',
    '..bbbbbbbbbbbb..',
    '................',
    '................'];
  const ROCK = [
    '................',
    '.....eeeeee.....',
    '...eehhhhppee...',
    '..ehhhhpppppee..',
    '..ehhpppppppppe.',
    '.ehhppppppppppe.',
    '.ehpppppppppppe.',
    '.eppppppppppsse.',
    '.epppppppppssse.',
    '.eppppppppsssse.',
    '.eepppppssssse..',
    '..eesssssssee...',
    '....eeeeeee.....',
    '................',
    '................',
    '................'];
  const CRATE = [
    '................',
    '.dddddddddddddd.',
    '.dllllllllllldd.',
    '.dlgggggggggddd.',
    '.dlgdgggggdgddd.',
    '.dlggdgggdggddd.',
    '.dlgggdgdgggddd.',
    '.dlggggdggggddd.',
    '.dlgggdgdgggddd.',
    '.dlggdgggdggddd.',
    '.dlgdgggggdgddd.',
    '.dlgggggggggddd.',
    '.dddddddddddddd.',
    '.dddddddddddddd.',
    '................',
    '................'];

  // ----- the small picture of the board -----
  let img = null, data = null, bw = 0, bh = 0;
  const small = document.createElement('canvas');
  const sctx = small.getContext('2d');
  function px(x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= bw || y >= bh) return;
    const i = (y * bw + x) * 4;
    data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
  }
  function stamp(rows, x0, y0, pal) {
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[y].length; x++) {
      const c = pal[rows[y][x]];
      if (c) px(x0 + x, y0 + y, c);
    }
  }
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

  function drawBoard(L, at, time, active, solved) {
    if (bw !== L.w * T || bh !== L.h * T) {
      bw = L.w * T; bh = L.h * T; small.width = bw; small.height = bh;
      img = sctx.createImageData(bw, bh); data = img.data;
    }
    const f = Math.floor(time * 5);
    const solid = (x, y) => x < 0 || y < 0 || x >= L.w || y >= L.h || L.tiles[y * L.w + x] === '#';
    for (let ty = 0; ty < L.h; ty++) for (let tx = 0; tx < L.w; tx++) {
      const t = L.tiles[ty * L.w + tx], x0 = tx * T, y0 = ty * T;
      if (t === '#') {
        // shore: paper white, a pink band and a darker line on every side that touches water
        for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) px(x0 + x, y0 + y, PAPER);
        const side = [[0, -1], [0, 1], [-1, 0], [1, 0]];
        for (const [dx, dy] of side) {
          if (solid(tx + dx, ty + dy)) continue;
          for (let i = 0; i < T; i++) for (let k = 0; k < 3; k++) {
            const c = k === 0 ? SHORE_EDGE : BAND;
            if (dy === -1) px(x0 + i, y0 + k, c); if (dy === 1) px(x0 + i, y0 + T - 1 - k, c);
            if (dx === -1) px(x0 + k, y0 + i, c); if (dx === 1) px(x0 + T - 1 - k, y0 + i, c);
          }
        }
        // inner corners
        for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          if (solid(tx + dx, ty + dy) || !solid(tx + dx, ty) || !solid(tx, ty + dy)) continue;
          for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
            px(x0 + (dx < 0 ? a : T - 1 - a), y0 + (dy < 0 ? b : T - 1 - b), a === 0 && b === 0 ? SHORE_EDGE : BAND);
          }
        }
        continue;
      }
      for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) px(x0 + x, y0 + y, waterColour(x0 + x, y0 + y, f));
      if (t === 'o') stamp(ROCK, x0, y0, { e: ROCK_EDGE, p: BAND, h: PAPER, s: [236, 160, 186] });
      else if (U.CURRENT[t]) {
        // two arrowheads that walk in the current's direction
        const d = U.DIRS[U.CURRENT[t]], o = Math.floor(time * 8) % 7;
        for (let n = 0; n < 2; n++) for (let k = -3; k <= 3; k++) {
          const along = ((o + n * 7) % 14) - Math.abs(k) + 2, across = 8 + k;
          if (along < 1 || along > 14) continue;
          const a = d[0] + d[1] > 0 ? along : 15 - along;
          const c = WHITE;
          if (d[0]) { px(x0 + a, y0 + across, c); px(x0 + a - d[0], y0 + across, c); }
          else { px(x0 + across, y0 + a, c); px(x0 + across, y0 + a - d[1], c); }
        }
      } else if (t === '@') {
        const ph = time * 5;
        for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
          const dx = x - 7.5, dy = y - 7.5, r = Math.hypot(dx, dy);
          if (r > 7.6) continue;
          const v = Math.sin(Math.atan2(dy, dx) + r * 1.15 - ph);
          px(x0 + x, y0 + y, r < 1.2 ? [96, 14, 16] : v > 0.25 ? WATER[3] : v > -0.35 ? WATER[1] : [122, 22, 22]);
        }
      }
    }
    // homes
    for (const [goal, colour] of [[L.goalN, NAVY], [L.goalP, HOT]]) {
      stamp(HOUSE, (goal % L.w) * T, ((goal / L.w) | 0) * T, { b: colour, c: colour, '.': null });
      const gx = (goal % L.w) * T, gy = ((goal / L.w) | 0) * T;
      for (let y = 2; y <= 12; y++) for (let x = 2; x <= 13; x++) if (HOUSE[y][x] === '.') px(gx + x, gy + y, PAPER);
    }
    // crates, then the two characters, the active one last
    for (const c of at.c) stamp(CRATE, Math.round(c[0] * T), Math.round(c[1] * T), { d: GOLD_DARK, g: GOLD, l: GOLD_LIGHT });
    const order = active === 'n' ? ['p', 'n'] : ['n', 'p'];
    for (const who of order) {
      const colour = who === 'n' ? NAVY : HOT;
      const bob = who === active && !solved && Math.floor(time * 2.5) % 2 === 0 ? -1 : 0;
      const x = Math.round(at[who][0] * T), y = Math.round(at[who][1] * T) + bob;
      stamp(COMPUTER, x, y, { w: who === active || solved ? WHITE : BAND, f: colour });   // the waiting one is drawn in pink lines
    }
    sctx.putImageData(img, 0, 0);
  }

  // ----- Drew's drawings, tinted -----
  const art = {};
  for (const name of ['HandServer', 'HandShuffle', 'HandRepeat', 'HandPlay']) {
    const im = new Image();
    im.onload = () => { art[name] = im; redraw(); };
    im.src = 'assets/' + name + '.png';
  }
  const tintCache = {};
  function tinted(name, colour) {
    const im = art[name];
    if (!im) return null;
    const k = name + colour;
    if (!tintCache[k]) {
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
      const g = c.getContext('2d');
      g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = css(colour); g.fillRect(0, 0, c.width, c.height);
      tintCache[k] = c;
    }
    return tintCache[k];
  }

  // ----- game state -----
  const q = new URLSearchParams(location.search);
  const replay = q.get('solution') === '1';
  const fixedT = q.has('t') ? parseFloat(q.get('t')) : null;
  let level = Math.min(LEVELS.length, Math.max(1, parseInt(q.get('level') || '1', 10))) - 1;
  let state, history, active, anim, startClock = performance.now();
  function load(i) {
    level = (i + LEVELS.length) % LEVELS.length;
    state = LEVELS[level].L.start; history = []; active = 'n'; anim = null;
  }
  load(level);
  const solved = () => U.isWin(LEVELS[level].L, state);

  function tryMove(d) {
    const L = LEVELS[level].L;
    if (solved()) return;
    const r = U.move(L, state, active, d);
    if (!r) return;
    history.push({ state, active });
    anim = { before: state, steps: r.steps, t0: performance.now(), length: r.steps.reduce((a, s) => a + U.stepTime(L, s), 0) };
    state = r.state;
  }
  function undo() { const h = history.pop(); if (h) { state = h.state; active = h.active; anim = null; } }
  const swap = () => { if (!solved()) active = active === 'n' ? 'p' : 'n'; };

  // ----- layout and drawing -----
  const screen = document.getElementById('screen');
  const ctx = screen.getContext('2d');
  let hit = {};                                         // tap targets, in CSS pixels
  let boardBox = { x: 0, y: 0, s: 1 };
  const HELV = '"Helvetica Neue", Helvetica, Arial, sans-serif';

  function frame(now) {
    const dpr = window.devicePixelRatio || 1, W = window.innerWidth, H = window.innerHeight;
    if (screen.width !== Math.round(W * dpr) || screen.height !== Math.round(H * dpr)) { screen.width = Math.round(W * dpr); screen.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = css(PAPER); ctx.fillRect(0, 0, W, H);

    const { L, report } = LEVELS[level];
    let at, who = active, moves = history.length, done = solved(), time = (now - startClock) / 1000;
    if (replay) {
      // the solver's solution, drawn at time t
      const tl = U.timeline(L, report.solution);
      const t = fixedT !== null ? fixedT : time % (tl.length + 0.5);
      time = t;
      let s = L.start; at = U.pose(L, s, [], 0); moves = 0; who = report.solution.length ? report.solution[0][0] : 'n'; done = false;
      for (const m of tl.moves) {
        if (t < m.t0) break;
        moves++; who = m.who;
        at = U.pose(L, m.before, m.steps, t - m.t0);
        s = m.after;
        if (t >= m.t1) done = U.isWin(L, s);
      }
    } else if (anim) {
      const tau = (now - anim.t0) / 1000;
      if (tau >= anim.length) { anim = null; at = U.pose(L, state, [], 0); }
      else { at = U.pose(L, anim.before, anim.steps, tau); done = false; }
    } else at = U.pose(L, state, [], 0);

    drawBoard(L, at, time, who, done);

    // the board, scaled by a whole number, and the words beside it or above it
    const wide = W >= 820 && W > H;
    const area = wide ? { x: 400, y: 30, w: W - 440, h: H - 60 } : { x: 12, y: 170, w: W - 24, h: H - 260 };
    const sc = Math.max(1, Math.floor(Math.min(area.w / bw, area.h / bh)));
    const bx = Math.round(area.x + (area.w - bw * sc) / 2), by = Math.round(area.y + (area.h - bh * sc) / 2);
    boardBox = { x: bx, y: by, s: sc };
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, bx, by, bw * sc, bh * sc);
    ctx.imageSmoothingEnabled = true;

    ctx.fillStyle = css(INK); ctx.textBaseline = 'alphabetic';
    const digits = (px) => `${px}px DrewHandDigits, ${HELV}`;
    const words = (px) => `bold ${px}px ${HELV}`;
    hit = {};
    const colour = who === 'n' ? NAVY : HOT;
    if (wide) {
      const x = 64;
      ctx.font = digits(170); ctx.fillText(String(level + 1), x - 6, 190);
      ctx.font = words(46); ctx.fillText(L.name, x, 262);
      ctx.font = words(30); ctx.fillText('moves', x, 352); ctx.fillText('best', x, 426);
      ctx.font = digits(64); ctx.letterSpacing = '-6px'; ctx.fillText(String(moves), x + 130, 356); ctx.fillText(String(report.moves), x + 130, 430); ctx.letterSpacing = '0px';
      const face = tinted('HandServer', colour);
      if (face) ctx.drawImage(face, x, H - 228, 150, 150 * face.height / face.width);
      icon(done ? 'HandPlay' : 'HandShuffle', done ? 'next' : 'swap', x + 190, H - 190, 54);
      icon('HandRepeat', 'undo', x + 190, H - 118, 54);
      hit.level = [x - 6, 60, 120, 140];
    } else {
      const x = 16;
      ctx.font = digits(96); ctx.fillText(String(level + 1), x, 100);
      ctx.font = words(30); ctx.fillText(L.name, x + 78, 62);
      ctx.font = words(20); ctx.fillText('moves', x + 78, 104); ctx.fillText('best', x + 208, 104);
      ctx.font = digits(40); ctx.letterSpacing = '-4px'; ctx.fillText(String(moves), x + 146, 106); ctx.fillText(String(report.moves), x + 256, 106); ctx.letterSpacing = '0px';
      const face = tinted('HandServer', colour);
      if (face) ctx.drawImage(face, x, H - 82, 80, 80 * face.height / face.width);
      icon(done ? 'HandPlay' : 'HandShuffle', done ? 'next' : 'swap', W / 2 - 24, H - 72, 48);
      icon('HandRepeat', 'undo', W - 80, H - 72, 48);
      hit.level = [x, 20, 70, 90];
    }
    if (fixedT === null) requestAnimationFrame(frame);
  }
  function icon(name, action, x, y, size) {
    const im = tinted(name, INK);
    if (im) { const k = size / Math.max(im.width, im.height); ctx.drawImage(im, x, y, im.width * k, im.height * k); }
    hit[action] = [x - 8, y - 8, size + 16, size + 16];
  }
  function redraw() { if (fixedT !== null) frame(performance.now()); }

  // ----- input -----
  const KEYS = { ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R', w: 'U', s: 'D', a: 'L', d: 'R' };
  window.addEventListener('keydown', (e) => {
    if (replay || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (KEYS[k]) { tryMove(KEYS[k]); e.preventDefault(); }
    else if (k === ' ' || k === 'Tab') { swap(); e.preventDefault(); }
    else if (k === 'z') undo();
    else if (k === 'r') load(level);
    else if (k === 'n' || (k === 'Enter' && solved())) load(level + 1);
    else if (k === 'p') load(level - 1);
  });
  let down = null;
  screen.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  screen.addEventListener('pointerup', (e) => {
    if (!down || replay) return;
    const dx = e.clientX - down[0], dy = e.clientY - down[1];
    const [x, y] = down; down = null;
    if (Math.hypot(dx, dy) > 24) { tryMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U')); return; }
    const inside = (r) => r && x >= r[0] && y >= r[1] && x < r[0] + r[2] && y < r[1] + r[3];
    if (inside(hit.next)) return load(level + 1);
    if (inside(hit.swap)) return swap();
    if (inside(hit.undo)) return undo();
    if (inside(hit.level)) return load(level + 1);
    // a tap on a character selects it
    const L = LEVELS[level].L, k = T * boardBox.s;
    const tx = Math.floor((x - boardBox.x) / k), ty = Math.floor((y - boardBox.y) / k);
    if (tx < 0 || ty < 0 || tx >= L.w || ty >= L.h || solved()) return;
    const i = ty * L.w + tx;
    if (i === state.n) active = 'n'; else if (i === state.p) active = 'p';
  });
  window.addEventListener('resize', redraw);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
  if (fixedT !== null) frame(performance.now()); else requestAnimationFrame(frame);
})();
