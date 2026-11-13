// hideout: the two computer players and the loop that plays a whole game. No DOM.
// Neither one uses chance. The same start always gives the same game.
(function (root) {
  'use strict';
  var H = root.hideout || (root.hideout = {});
  var R = H.rules;
  var PATIENCE = 3;   // "hold" goes forward after this many of its own turns with no attack made

  function isMark(map, x, y) { return map.mark[0] === x && map.mark[1] === y; }
  function isChoke(map, x, y) { return map.choke.some(function (c) { return c[0] === x && c[1] === y; }); }

  // every tile the unit can stop on this turn, in map order
  function stops(state, u) {
    var r = R.reach(state, u), map = state.map, out = [];
    for (var y = 0; y < map.h; y++)
      for (var x = 0; x < map.w; x++)
        if (R.canStop(state, u, r, x, y)) out.push({ x: x, y: y, cost: r.cost[y * map.w + x] });
    return out;
  }

  // the best target from one tile. damage first, then a kill, then whoever stands on the marked tile.
  function bestAttack(state, u, x, y) {
    var best = null;
    R.targets(state, u, x, y).forEach(function (t) {
      var d = R.damage(state, u, x, y, t);
      var v = d.total * 10 + (d.total >= t.hp ? 60 : 0) + (isMark(state.map, t.x, t.y) ? 100 : 0) - t.hp;
      if (!best || v > best.value) best = { target: t, value: v, far: Math.abs(t.x - x) + Math.abs(t.y - y) };
    });
    return best;
  }

  // steps from every tile to the nearest living enemy, units ignored
  function toEnemy(state, side) {
    var e = R.alive(state, R.other(side)).map(function (v) { return [v.x, v.y]; });
    return R.flood(state.map, e, 0, null, null, true).cost;
  }

  // rush: attack if any attack can be reached this turn. if not, walk toward the nearest enemy.
  function rush(state, u) {
    var map = state.map, tiles = stops(state, u), best = null, go = null;
    tiles.forEach(function (s) {
      var a = bestAttack(state, u, s.x, s.y);
      if (!a) return;
      var v = a.value + R.height(map, s.x, s.y) * 0.5 + (u.kind === 'archer' ? a.far * 0.2 : 0) - s.cost * 0.01;
      if (!best || v > best.v) best = { v: v, x: s.x, y: s.y, target: a.target };
    });
    if (best) return best;
    var field = toEnemy(state, u.side);
    tiles.forEach(function (s) {
      var d = field[s.y * map.w + s.x];
      if (!go || d < go.d || (d === go.d && s.cost < go.cost)) go = { d: d, cost: s.cost, x: s.x, y: s.y };
    });
    return { x: go.x, y: go.y, target: null };
  }

  // how good a tile is to stand on: 2 a level, 3 on a chokepoint tile, 2 next to one.
  // an archer scores 2 for a clear shot at a chokepoint tile instead.
  // the defending side loses 3 for each tile away from where the map file put the unit, so it stays where the map means it to stand.
  function post(map, u, x, y) {
    var s = 2 * R.height(map, x, y);
    if (u.side !== map.attacker) s -= 3 * (Math.abs(u.homeX - x) + Math.abs(u.homeY - y));
    if (u.kind === 'archer') {
      var k = R.KINDS.archer;
      if (map.choke.some(function (c) {
        var d = Math.abs(c[0] - x) + Math.abs(c[1] - y);
        return d >= k.near && d <= k.far && R.clear(map, x, y, c[0], c[1]);
      })) s += 2;
    } else if (isChoke(map, x, y)) s += 3;
    else if (R.DIRS.some(function (d) { return isChoke(map, x + d[0], y + d[1]); })) s += 2;
    return s;
  }

  // hold: stand on the best tile in reach and attack from it. after PATIENCE quiet turns, play as rush.
  // the attacking side's runner goes for the marked tile instead.
  function hold(state, u) {
    var map = state.map;
    if (u.kind === 'runner' && u.side === map.attacker) return sneak(state, u);
    if (state.quiet[u.side] >= PATIENCE) return rush(state, u);
    var best = null;
    stops(state, u).forEach(function (s) {
      var a = bestAttack(state, u, s.x, s.y);
      // an attack is worth 4, so a defender steps one tile off its post for one and no further. whoever holds the marked tile is worth 10 more.
      var v = post(map, u, s.x, s.y) + (a ? 4 + a.value / 100 : 0) + (a && isMark(map, a.target.x, a.target.y) ? 10 : 0) - s.cost * 0.05;
      if (!best || v > best.v) best = { v: v, x: s.x, y: s.y, target: a ? a.target : null };
    });
    return best;
  }

  // how many enemies could attack each tile on their next turn
  function threat(state, side) {
    var map = state.map, n = new Array(map.w * map.h).fill(0);
    R.alive(state, R.other(side)).forEach(function (e) {
      var r = R.reach(state, e), k = R.KINDS[e.kind], hit = {};
      for (var y = 0; y < map.h; y++)
        for (var x = 0; x < map.w; x++) {
          if (r.cost[y * map.w + x] > k.move) continue;
          for (var ty = Math.max(0, y - k.far); ty <= Math.min(map.h - 1, y + k.far); ty++)
            for (var tx = Math.max(0, x - k.far); tx <= Math.min(map.w - 1, x + k.far); tx++) {
              var d = Math.abs(tx - x) + Math.abs(ty - y);
              if (d < k.near || d > k.far || !R.land(map, tx, ty) || hit[ty * map.w + tx]) continue;
              if (k.far === 1 ? Math.abs(R.height(map, x, y) - R.height(map, tx, ty)) <= 1 : R.clear(map, x, y, tx, ty)) hit[ty * map.w + tx] = true;
            }
        }
      Object.keys(hit).forEach(function (i) { n[i]++; });
    });
    return n;
  }

  // the attacking runner: walk to the marked tile by the way with the fewest enemies able to reach it, then stay
  function sneak(state, u) {
    var map = state.map, mx = map.mark[0], my = map.mark[1];
    var x = u.x, y = u.y;
    if (!isMark(map, x, y)) {
      var danger = threat(state, u.side);
      var r = R.flood(map, u.x, u.y,
        function (bx, by) { var v = R.unitAt(state, bx, by); return v && v.side !== u.side; },
        function (ex, ey) { return 3 * danger[ey * map.w + ex]; });
      if (r.cost[my * map.w + mx] === Infinity) return rush(state, u);
      var plain = R.reach(state, u);
      R.path(map, r, mx, my).forEach(function (p) { if (R.canStop(state, u, plain, p[0], p[1])) { x = p[0]; y = p[1]; } });
    }
    var a = bestAttack(state, u, x, y);
    return { x: x, y: y, target: a ? a.target : null };
  }

  H.ai = { rush: rush, hold: hold, PATIENCE: PATIENCE };

  // one side's whole turn. what happened is added to events.
  H.aiTurn = function (state, name, events) {
    var side = state.side;
    state.units.filter(function (u) { return u.side === side; }).forEach(function (u) {
      if (u.hp <= 0 || state.winner) return;
      var plan = H.ai[name](state, u), ev;
      if (plan.x !== u.x || plan.y !== u.y) { ev = R.move(state, u, plan.x, plan.y); if (ev) events.push(ev); }
      if (plan.target) { ev = R.attack(state, u, plan.target); if (ev) events.push(ev); }
    });
    var end = R.endTurn(state);
    if (end) events.push(end);
  };

  // the start of a game, changed a little so one map gives many different games.
  // turn: each side's unit order is turned this many places. shift: 0 none, 1 navy up a row, 2 navy down, 3 pink up, 4 pink down.
  H.start = function (map, turn, shift) {
    var out = [];
    ['navy', 'pink'].forEach(function (side) {
      var mine = map.units.filter(function (u) { return u.side === side; }).map(function (u) { return { side: u.side, kind: u.kind, x: u.x, y: u.y }; });
      var dy = side === 'navy' ? (shift === 1 ? -1 : shift === 2 ? 1 : 0) : (shift === 3 ? -1 : shift === 4 ? 1 : 0);
      if (dy) {
        // a unit that would land on water, on another unit or on a different height stays where it is
        mine.slice().sort(function (a, b) { return dy * (b.y - a.y); }).forEach(function (u) {
          var ny = u.y + dy;
          var taken = map.units.some(function (v) { return v.side !== side && v.x === u.x && v.y === ny; }) || mine.some(function (v) { return v !== u && v.x === u.x && v.y === ny; });
          if (R.land(map, u.x, ny) && !taken && R.height(map, u.x, ny) === R.height(map, u.x, u.y)) u.y = ny;
        });
      }
      for (var i = 0; i < (turn || 0) % mine.length; i++) mine.push(mine.shift());
      out = out.concat(mine);
    });
    return out;
  };

  // how long each thing in a game takes on screen, in seconds. LEAD is the still moment before the first move.
  H.LEAD = 1;
  H.lasts = function (ev) { return ev.type === 'move' ? 0.25 + 0.11 * (ev.path.length - 1) : ev.type === 'attack' ? 0.8 : 0.45; };
  H.filmLength = function (game) { return H.LEAD + game.events.reduce(function (a, e) { return a + H.lasts(e); }, 0); };

  // a whole game between two computer players. o: { navy, pink: 'rush' or 'hold', first, turn, shift }
  H.play = function (map, o) {
    var units = H.start(map, o.turn || 0, o.shift || 0);
    var state = R.newGame(map, units, o.first || map.attacker), events = [];
    while (!state.winner) H.aiTurn(state, o[state.side], events);
    return { units: units, first: state.first, events: events, winner: state.winner, how: state.how, rounds: state.round };
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
