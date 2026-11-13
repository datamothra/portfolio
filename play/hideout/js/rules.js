// hideout: the rules. No DOM. The page and Node load this same file.
// Every number that decides a fight is in KINDS and in the few functions below.
(function (root) {
  'use strict';
  var H = root.hideout || (root.hideout = {});

  // move: steps a turn. hp: hit points. hit: damage. near, far: attack range in tiles.
  var KINDS = {
    fighter: { move: 4, hp: 8, hit: 3, near: 1, far: 1 },
    archer:  { move: 3, hp: 5, hit: 2, near: 2, far: 5 },
    runner:  { move: 6, hp: 5, hit: 1, near: 1, far: 1 }
  };
  var DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  var ROUNDS = 30;        // a game still going after this many rounds is a draw
  var HOLD = 2;           // turns in a row the attacker must end on the marked tile
  var UP_COST = 2;        // a step up one level costs this. a flat or down step costs 1
  var MAX_STEP = 1;       // a step cannot climb more than this. a melee hit cannot reach further up or down
  var RANGE_PER = 2;      // an archer gets +1 range for each this many levels it stands above the target

  function other(side) { return side === 'navy' ? 'pink' : 'navy'; }
  function land(map, x, y) { return x >= 0 && y >= 0 && x < map.w && y < map.h && map.height[y * map.w + x] >= 0; }
  function height(map, x, y) { return map.height[y * map.w + x]; }
  function unitAt(state, x, y) {
    for (var i = 0; i < state.units.length; i++) {
      var u = state.units[i];
      if (u.hp > 0 && u.x === x && u.y === y) return u;
    }
    return null;
  }
  function alive(state, side) { return state.units.filter(function (u) { return u.hp > 0 && u.side === side; }); }

  // units: [{side, kind, x, y}] in the order they will move. first: the side that moves first.
  function newGame(map, units, first) {
    var state = {
      map: map, side: first || map.attacker, first: first || map.attacker, round: 1,
      held: 0, quiet: { navy: 0, pink: 0 }, hitThisTurn: false, winner: null, how: null, units: []
    };
    (units || map.units).forEach(function (s, i) {
      state.units.push({ id: i, side: s.side, kind: s.kind, x: s.x, y: s.y, homeX: s.x, homeY: s.y, hp: KINDS[s.kind].hp, fx: 0, fy: 0, moved: false, acted: false });
    });
    // everyone starts facing the middle of the other side
    state.units.forEach(function (u) {
      var e = alive(state, other(u.side)), mx = 0, my = 0;
      e.forEach(function (v) { mx += v.x; my += v.y; });
      face(u, mx / e.length - u.x, my / e.length - u.y);
    });
    return state;
  }

  function face(u, dx, dy) {
    if (dx === 0 && dy === 0) return;
    if (Math.abs(dx) >= Math.abs(dy)) { u.fx = dx > 0 ? 1 : -1; u.fy = 0; } else { u.fx = 0; u.fy = dy > 0 ? 1 : -1; }
  }

  // cost of one step between two tiles next to each other. Infinity when the step is not allowed.
  function stepCost(map, ax, ay, bx, by) {
    if (!land(map, bx, by)) return Infinity;
    var up = height(map, bx, by) - height(map, ax, ay);
    if (up > MAX_STEP) return Infinity;
    return up === 1 ? UP_COST : 1;
  }

  // cheapest cost from one tile to every tile. blocked(x, y) tiles cannot be entered.
  // extra(x, y) adds to the cost of entering a tile. back: costs are measured toward the start tile instead.
  function flood(map, sx, sy, blocked, extra, back) {
    var n = map.w * map.h, cost = new Array(n), prev = new Array(n), open = [], i;
    for (i = 0; i < n; i++) { cost[i] = Infinity; prev[i] = -1; }
    var starts = typeof sx === 'number' ? [[sx, sy]] : sx;
    starts.forEach(function (s) { cost[s[1] * map.w + s[0]] = 0; open.push(s[1] * map.w + s[0]); });
    while (open.length) {
      var best = 0;
      for (i = 1; i < open.length; i++) if (cost[open[i]] < cost[open[best]]) best = i;
      var c = open[best]; open[best] = open[open.length - 1]; open.pop();
      var cx = c % map.w, cy = (c - cx) / map.w;
      for (var d = 0; d < 4; d++) {
        var nx = cx + DIRS[d][0], ny = cy + DIRS[d][1];
        if (!land(map, nx, ny)) continue;
        if (blocked && blocked(nx, ny)) continue;
        var s = back ? stepCost(map, nx, ny, cx, cy) : stepCost(map, cx, cy, nx, ny);
        if (s === Infinity) continue;
        var t = cost[c] + s + (extra ? extra(nx, ny) : 0), k = ny * map.w + nx;
        if (t < cost[k]) { if (cost[k] === Infinity) open.push(k); cost[k] = t; prev[k] = c; }
      }
    }
    return { cost: cost, prev: prev };
  }

  // where a unit can go this turn. It walks through friends and not through enemies.
  function reach(state, u) {
    return flood(state.map, u.x, u.y, function (x, y) { var v = unitAt(state, x, y); return v && v.side !== u.side; });
  }
  function canStop(state, u, r, x, y) {
    if (r.cost[y * state.map.w + x] > KINDS[u.kind].move) return false;
    var v = unitAt(state, x, y);
    return !v || v === u;
  }
  function path(map, r, x, y) {
    var out = [], k = y * map.w + x;
    while (k >= 0) { out.unshift([k % map.w, (k - k % map.w) / map.w]); k = r.prev[k]; }
    return out;
  }

  // the tiles a straight line crosses between two tiles, ends left out
  function between(ax, ay, bx, by) {
    var n = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2, out = [], last = null;
    for (var i = 1; i < n; i++) {
      var x = Math.round(ax + (bx - ax) * i / n), y = Math.round(ay + (by - ay) * i / n);
      if ((x === ax && y === ay) || (x === bx && y === by)) continue;
      var key = x + ',' + y;
      if (key !== last) out.push([x, y]);
      last = key;
    }
    return out;
  }
  // a line is clear unless a tile between the ends is higher than both ends
  function clear(map, ax, ay, bx, by) {
    var top = Math.max(height(map, ax, ay), height(map, bx, by));
    return between(ax, ay, bx, by).every(function (p) { return !land(map, p[0], p[1]) || height(map, p[0], p[1]) <= top; });
  }

  // can unit u, standing on (x, y), attack t
  function canHit(state, u, x, y, t) {
    if (t.hp <= 0 || t.side === u.side) return false;
    var k = KINDS[u.kind], map = state.map, d = Math.abs(t.x - x) + Math.abs(t.y - y);
    var up = height(map, x, y) - height(map, t.x, t.y);
    if (k.far === 1) return d === 1 && Math.abs(up) <= MAX_STEP;
    var far = k.far + (up > 0 ? Math.floor(up / RANGE_PER) : 0);
    return d >= k.near && d <= far && clear(map, x, y, t.x, t.y);
  }
  function targets(state, u, x, y) {
    return state.units.filter(function (t) { return canHit(state, u, x, y, t); });
  }
  // is (x, y) in the quarter behind unit t
  function behind(t, x, y) {
    var dx = x - t.x, dy = y - t.y;
    var along = dx * t.fx + dy * t.fy, across = Math.abs(dx * t.fy - dy * t.fx);
    return along < 0 && -along > across;
  }
  function damage(state, u, x, y, t) {
    var map = state.map, up = height(map, x, y) - height(map, t.x, t.y);
    var d = { base: KINDS[u.kind].hit, high: up > 0, low: up < 0, behind: behind(t, x, y) };
    d.total = Math.max(1, d.base + (d.high ? 1 : 0) - (d.low ? 1 : 0) + (d.behind ? 1 : 0));
    return d;
  }

  // the three things a side can do. each returns what happened, for the replay and the numbers.
  function move(state, u, x, y) {
    if (u.moved || u.acted || u.side !== state.side || state.winner) return null;
    var r = reach(state, u);
    if (!canStop(state, u, r, x, y)) return null;
    var p = path(state.map, r, x, y);
    if (p.length > 1) face(u, p[p.length - 1][0] - p[p.length - 2][0], p[p.length - 1][1] - p[p.length - 2][1]);
    u.x = x; u.y = y; u.moved = true;
    return { type: 'move', unit: u.id, path: p };
  }
  function attack(state, u, t) {
    if (u.acted || u.side !== state.side || state.winner || !canHit(state, u, u.x, u.y, t)) return null;
    var d = damage(state, u, u.x, u.y, t), map = state.map;
    var line = [[u.x, u.y]].concat(between(u.x, u.y, t.x, t.y), [[t.x, t.y]]);
    var ev = {
      type: 'attack', unit: u.id, target: t.id, from: [u.x, u.y], at: [t.x, t.y], damage: d.total,
      high: d.high, low: d.low, behind: d.behind,
      choke: line.some(function (p) { return map.choke.some(function (c) { return c[0] === p[0] && c[1] === p[1]; }); })
    };
    t.hp = Math.max(0, t.hp - d.total);
    ev.left = t.hp;
    face(u, t.x - u.x, t.y - u.y);
    u.acted = true; u.moved = true; state.hitThisTurn = true;
    if (!alive(state, t.side).length) { state.winner = u.side; state.how = 'rout'; ev.winner = u.side; ev.how = 'rout'; }
    return ev;
  }
  function endTurn(state) {
    if (state.winner) return null;
    var map = state.map, side = state.side, ev = { type: 'end', side: side, round: state.round };
    if (side === map.attacker) {
      var on = unitAt(state, map.mark[0], map.mark[1]);
      state.held = on && on.side === side ? state.held + 1 : 0;
      if (state.held >= HOLD) { state.winner = side; state.how = 'mark'; }
    }
    state.quiet[side] = state.hitThisTurn ? 0 : state.quiet[side] + 1;
    state.hitThisTurn = false;
    state.side = other(side);
    state.units.forEach(function (u) { u.moved = false; u.acted = false; });
    if (!state.winner && state.side === state.first) {
      state.round++;
      if (state.round > ROUNDS) { state.winner = 'draw'; state.how = 'rounds'; state.round = ROUNDS; }
    }
    ev.held = state.held; ev.next = state.side; ev.nextRound = state.round; ev.winner = state.winner; ev.how = state.how;
    return ev;
  }

  H.rules = {
    KINDS: KINDS, DIRS: DIRS, ROUNDS: ROUNDS, HOLD: HOLD, other: other, land: land, height: height, unitAt: unitAt, alive: alive,
    newGame: newGame, stepCost: stepCost, flood: flood, reach: reach, canStop: canStop, path: path,
    between: between, clear: clear, canHit: canHit, targets: targets, behind: behind, damage: damage,
    move: move, attack: attack, endTurn: endTurn
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
