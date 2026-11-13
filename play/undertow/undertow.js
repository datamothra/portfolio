// undertow: the rules, the level parser and the solver.
// No DOM use. The browser loads this file with a script tag and gets window.Undertow.
// Node loads it with require().
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Undertow = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DIRS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
  const ARROW = { U: '↑', D: '↓', L: '←', R: '→' };
  const CURRENT = { '^': 'U', 'v': 'D', '<': 'L', '>': 'R' };
  const MAX_W = 10, MAX_H = 8;

  // ----- level parser -----
  // A level file is a name line, comment lines that start with ';', and one grid.
  // The legend is in README.md.
  function parseLevel(text, file) {
    const L = { file: file || '', name: '', idea: '', find: '', shape: '', wrong: '', w: 0, h: 0, tiles: [], goalN: -1, goalP: -1,
      whirl: [], start: { n: -1, p: -1, c: [] }, rows: [], errors: [] };
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.replace(/\s+$/, '');
      if (!line) continue;
      if (line[0] === ';') {
        const m = /^;\s*(idea|move|shape|wrong):\s*(.*)$/.exec(line);
        if (m) L[m[1] === 'move' ? 'find' : m[1]] = m[2];
        continue;
      }
      if (/^name\s/.test(line)) { L.name = line.slice(5).trim(); continue; }
      if (/^[#o.npNP^v<>@c]+$/.test(line)) { L.rows.push(line); continue; }
      L.errors.push('cannot read line: ' + line);
    }
    L.h = L.rows.length; L.w = L.h ? L.rows[0].length : 0;
    if (L.w > MAX_W || L.h > MAX_H) L.errors.push(`board is ${L.w} by ${L.h}, the limit is ${MAX_W} by ${MAX_H}`);
    const count = { n: 0, p: 0, N: 0, P: 0 };
    L.rows.forEach((row, y) => {
      if (row.length !== L.w) L.errors.push(`row ${y + 1} is ${row.length} wide, row 1 is ${L.w}`);
      for (let x = 0; x < L.w; x++) {
        const ch = row[x] || '#', i = y * L.w + x;
        let t = ch;
        if (ch === 'n') { L.start.n = i; t = '.'; count.n++; }
        else if (ch === 'p') { L.start.p = i; t = '.'; count.p++; }
        else if (ch === 'N') { L.goalN = i; t = '.'; count.N++; }
        else if (ch === 'P') { L.goalP = i; t = '.'; count.P++; }
        else if (ch === 'c') { L.start.c.push(i); t = '.'; }
        else if (ch === '@') L.whirl.push(i);
        L.tiles[i] = t;
      }
    });
    for (const k in count) if (count[k] !== 1) L.errors.push(`needs exactly one ${k}, found ${count[k]}`);
    if (L.whirl.length !== 0 && L.whirl.length !== 2) L.errors.push(`whirlpools come in one pair, found ${L.whirl.length}`);
    if (!L.name) L.errors.push('no name line');
    return L;
  }

  function pieces(L) {
    const has = (re) => L.tiles.some((t) => re.test(t));
    const list = [];
    if (has(/o/)) list.push('rock');
    if (has(/[\^v<>]/)) list.push('current');
    if (L.whirl.length) list.push('whirlpool');
    if (L.start.c.length) list.push('crate');
    return list;
  }

  // The same level with one kind of piece taken out. The solver uses it to show a piece is needed.
  function without(L, piece) {
    const M = Object.assign({}, L, { tiles: L.tiles.slice(), whirl: L.whirl.slice(), start: { n: L.start.n, p: L.start.p, c: L.start.c.slice() } });
    if (piece === 'current') M.tiles = M.tiles.map((t) => (CURRENT[t] ? '.' : t));
    if (piece === 'whirlpool') { M.tiles = M.tiles.map((t) => (t === '@' ? '.' : t)); M.whirl = []; }
    if (piece === 'crate') M.start.c = [];
    return M;
  }

  // ----- rules -----
  const key = (s) => s.n + ',' + s.p + (s.c.length ? ',' + s.c.join(',') : '');
  const isWin = (L, s) => s.n === L.goalN && s.p === L.goalP;

  function step(L, i, d) {
    const x = (i % L.w) + DIRS[d][0], y = ((i / L.w) | 0) + DIRS[d][1];
    return x < 0 || y < 0 || x >= L.w || y >= L.h ? -1 : y * L.w + x;
  }

  // One move: character `who` ('n' or 'p') slides in direction d.
  // Returns null when nothing changes, or { state, steps } where steps is the list of
  // straight movements in order, for the animation.
  // opts.ghost: a character stops nothing. The other character and the crates pass through it.
  // This is the solver's "without the partner" test.
  function move(L, s, who, d, opts) {
    const ghost = !!(opts && opts.ghost);
    const pos = { n: s.n, p: s.p };
    const crates = s.c.slice();
    const steps = [];
    const get = (id) => (typeof id === 'number' ? crates[id] : pos[id]);
    const set = (id, v) => { if (typeof id === 'number') crates[id] = v; else pos[id] = v; };

    // What stops `self` from entering cell i: 'wall', 'n', 'p', a crate index, or null.
    const blocker = (i, self) => {
      if (i < 0) return 'wall';
      const t = L.tiles[i];
      if (t === '#' || t === 'o') return 'wall';
      if (!ghost && self !== 'n' && i === pos.n) return 'n';
      if (!ghost && self !== 'p' && i === pos.p) return 'p';
      const ci = crates.indexOf(i);
      if (ci >= 0 && ci !== self) return ci;
      return null;
    };
    const other = (i) => (L.whirl[0] === i ? L.whirl[1] : L.whirl[0]);

    // Slide `self` in direction dir, at most `limit` tiles. Returns the crate it hit (index), or -1, or -2 for a loop.
    const run = (self, dir, limit, kind) => {
      let at = get(self), from = at, moved = 0, hit = -1;
      const flush = (to, k) => { if (to !== from) steps.push({ id: self, from, to, kind: k || kind }); };
      while (moved < limit) {
        const next = step(L, at, dir);
        const b = blocker(next, self);
        if (b !== null) { if (typeof b === 'number' && typeof self !== 'number' && kind === 'slide') hit = b; break; }
        if (L.tiles[next] === '@') {
          const out = other(next);
          if (blocker(out, self) !== null) break;        // the far end is taken: the whirlpool is shut
          flush(next); steps.push({ id: self, from: next, to: out, kind: 'warp' });
          at = out; from = out;
        } else at = next;
        set(self, at);
        if (++moved > L.w * L.h * 4) return -2;
      }
      flush(at);
      return hit;
    };

    const hit = run(who, d, Infinity, 'slide');
    if (hit === -2) return null;
    if (hit >= 0 && run(hit, d, Infinity, 'slide') === -2) return null;

    // Currents: anything resting on a current tile is pushed one tile, if that tile is free.
    for (let guard = 0; guard < 64; guard++) {
      let changed = false;
      const ids = ['n', 'p'].concat(crates.map((_, i) => i));
      for (const id of ids) {
        const dir = CURRENT[L.tiles[get(id)]];
        if (!dir) continue;
        const before = get(id);
        run(id, dir, 1, 'push');
        if (get(id) !== before) changed = true;
      }
      if (!changed) break;
    }

    const state = { n: pos.n, p: pos.p, c: crates.slice().sort((a, b) => a - b) };
    if (key(state) === key(s)) return null;
    return { state, steps };
  }

  // ----- solver -----
  // Breadth-first search over every state: both characters' tiles plus the crates' tiles.
  // opts.only: 'n' or 'p', search with just that character moving. opts.ghost: see move().
  function search(L, opts) {
    opts = opts || {};
    const movers = opts.only ? [opts.only] : ['n', 'p'];
    const index = new Map();
    const states = [], dist = [], parent = [], via = [], ways = [], win = [], out = [], back = [];
    const add = (s, d, par, mv) => {
      const i = states.length;
      index.set(key(s), i); states.push(s); dist.push(d); parent.push(par); via.push(mv); ways.push(0);
      win.push(isWin(L, s)); out.push(0); back.push([]);
      return i;
    };
    add(L.start, 0, -1, null); ways[0] = 1;
    for (let head = 0; head < states.length; head++) {
      if (win[head]) continue;                           // a solved level is over
      for (const who of movers) for (const d in DIRS) {
        const r = move(L, states[head], who, d, opts);
        if (!r) continue;
        out[head]++;
        const k = key(r.state);
        let j = index.get(k);
        if (j === undefined) j = add(r.state, dist[head] + 1, head, who + d);
        if (dist[j] === dist[head] + 1) ways[j] += ways[head];
        back[j].push(head);
      }
    }
    // dead states: no path to any win
    const alive = new Uint8Array(states.length);
    const queue = [];
    let best = Infinity;
    for (let i = 0; i < states.length; i++) if (win[i]) { alive[i] = 1; queue.push(i); best = Math.min(best, dist[i]); }
    for (let q = 0; q < queue.length; q++) for (const j of back[queue[q]]) if (!alive[j]) { alive[j] = 1; queue.push(j); }
    const res = { solvable: best < Infinity, states: states.length, dead: states.length - queue.length };
    if (!res.solvable) return res;
    let end = -1, count = 0;
    for (let i = 0; i < states.length; i++) if (win[i] && dist[i] === best) { count += ways[i]; if (end < 0) end = i; }
    const moves = [];
    let fan = 0;
    for (let i = end; parent[i] >= 0; i = parent[i]) { moves.unshift(via[i]); fan += out[parent[i]]; }
    let swaps = 0;
    for (let i = 1; i < moves.length; i++) if (moves[i][0] !== moves[i - 1][0]) swaps++;
    res.moves = best; res.solution = moves; res.shortest = count; res.swaps = swaps;
    res.branching = Math.round((fan / moves.length) * 100) / 100;
    return res;
  }

  // Everything the solver reports about one level.
  function report(L) {
    const full = search(L), ghost = search(L, { ghost: true });
    const r = {
      file: L.file, name: L.name, idea: L.idea, find: L.find, shape: L.shape, wrong: L.wrong, size: [L.w, L.h], pieces: pieces(L),
      solvable: full.solvable, moves: full.moves || 0, solution: full.solution || [],
      shortest_solutions: full.shortest || 0, swaps: full.swaps || 0,
      one_mover: search(L, { only: 'n' }).solvable || search(L, { only: 'p' }).solvable,
      without_partner: ghost.solvable, without_partner_moves: ghost.moves || 0,
      states: full.states, dead: full.dead, branching: full.branching || 0, without: {},
    };
    for (const piece of r.pieces) {
      if (piece === 'rock') continue;
      const w = search(without(L, piece));
      r.without[piece] = w.solvable ? w.moves : 'unsolvable';
    }
    return r;
  }

  const say = (mv) => mv[0] + ARROW[mv[1]];

  // ----- replay timing, shared by the page and the capture tool -----
  const HOLD_START = 0.8, HOLD_END = 1.4, GAP = 0.22;
  function stepTime(L, st) {
    if (st.kind === 'warp') return 0.16;
    if (st.kind === 'push') return 0.2;
    const d = Math.abs((st.to % L.w) - (st.from % L.w)) + Math.abs(((st.to / L.w) | 0) - ((st.from / L.w) | 0));
    return Math.max(0.09, d / 13);
  }
  // Plays a move list from the start. Returns { moves: [{ who, before, after, steps, t0, t1 }], length }.
  function timeline(L, solution) {
    const moves = [];
    let s = L.start, t = HOLD_START;
    for (const mv of solution) {
      const r = move(L, s, mv[0], mv[1]);
      if (!r) break;
      const dur = r.steps.reduce((a, st) => a + stepTime(L, st), 0);
      moves.push({ who: mv[0], before: s, after: r.state, steps: r.steps, t0: t, t1: t + dur });
      t += dur + GAP; s = r.state;
    }
    return { moves, length: t - GAP + HOLD_END };
  }
  // Where everything is drawn `tau` seconds into a move: { n, p, c: [...] } as [x, y] in tiles, fractions allowed.
  function pose(L, before, steps, tau) {
    const xy = (i) => [i % L.w, (i / L.w) | 0];
    const at = { n: xy(before.n), p: xy(before.p), c: before.c.map(xy) };
    const put = (id, v) => { if (typeof id === 'number') at.c[id] = v; else at[id] = v; };
    for (const st of steps) {
      const d = stepTime(L, st);
      const a = xy(st.from), b = xy(st.to);
      if (tau >= d) { put(st.id, b); tau -= d; continue; }
      const k = tau / d;
      if (st.kind === 'warp') put(st.id, k < 0.5 ? a : b);
      else put(st.id, [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
      break;
    }
    return at;
  }

  return { DIRS, ARROW, CURRENT, MAX_W, MAX_H, parseLevel, pieces, without, key, isWin, step, move, search, report, say, stepTime, timeline, pose };
});
