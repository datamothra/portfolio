// hideout: the page. Loads the pictures, runs a game or a replay, takes clicks and keys.
//
//   index.html                              play navy against the "hold" computer player
//   index.html?map=2                        start on map 2
//   index.html?players=2                    two people on one screen
//   index.html?map=3&replay=rush-hold       watch a computer game: attacker's player, then defender's
//   index.html?map=3&replay=rush-hold&t=12.5   draw that game as it stands 12.5 seconds in, and stop
//   &first=pink &turn=2 &shift=3            the same start changes tools/simulate.js uses
//   &heights=1                              write each tile's height on it
//   &pick=3                                 start with unit 3 chosen, to show where it can go
(function () {
  'use strict';
  var H = window.hideout, R = H.rules, D = H.draw, C = D.C;
  var q = new URLSearchParams(location.search);
  var canvas = document.getElementById('game'), g = canvas.getContext('2d');
  var small = document.createElement('canvas'); small.width = D.BW; small.height = D.BH;
  var sg = small.getContext('2d'), img = sg.createImageData(D.BW, D.BH);
  var art = {}, maps = H.mapFiles.map(function (f) { return H.parseMap(f.text); });

  var mapNo = Math.min(maps.length, Math.max(1, +q.get('map') || 1)) - 1;
  var replay = q.get('replay'), fixed = q.has('t') ? +q.get('t') : null;
  var showHeights = q.get('heights') === '1', two = q.get('players') === '2';
  var map, game, shown, queue, current, started, picked, clock0 = 0, film = null;

  var lasts = H.lasts, LEAD = H.LEAD;

  function begin() {
    map = maps[mapNo];
    picked = null; queue = []; current = null;
    if (replay) {
      var p = replay.split('-'), o = { first: q.get('first') || map.attacker, turn: +q.get('turn') || 0, shift: +q.get('shift') || 0 };
      o[map.attacker] = p[0]; o[R.other(map.attacker)] = p[1] || 'hold';
      film = H.play(map, o);
      film.length = H.filmLength(film);
      clock0 = performance.now();
    } else {
      film = null;
      game = R.newGame(map, map.units, map.attacker);
      shown = R.newGame(map, map.units, map.attacker);
      if (q.has('pick')) picked = +q.get('pick');
    }
    document.title = 'hideout: ' + map.name;
    var note = document.getElementById('teaches');
    if (note) note.textContent = map.teaches;
  }

  // put a finished event into the state that is drawn
  function apply(s, ev) {
    var u = s.units[ev.unit], n;
    if (ev.type === 'move') {
      n = ev.path.length;
      u.x = ev.path[n - 1][0]; u.y = ev.path[n - 1][1]; u.moved = true;
      if (n > 1) turnTo(u, ev.path[n - 1][0] - ev.path[n - 2][0], ev.path[n - 1][1] - ev.path[n - 2][1]);
    } else if (ev.type === 'attack') {
      s.units[ev.target].hp = ev.left; u.acted = true;
      turnTo(u, ev.at[0] - ev.from[0], ev.at[1] - ev.from[1]);
      if (ev.winner) { s.winner = ev.winner; s.how = ev.how; }
    } else {
      s.held = ev.held; s.side = ev.next; s.round = ev.nextRound;
      s.units.forEach(function (v) { v.moved = false; v.acted = false; });
      if (ev.winner) { s.winner = ev.winner; s.how = ev.how; }
    }
  }
  function turnTo(u, dx, dy) {
    if (Math.abs(dx) >= Math.abs(dy)) { u.fx = dx > 0 ? 1 : -1; u.fy = 0; } else { u.fx = 0; u.fy = dy > 0 ? 1 : -1; }
  }

  // an event part of the way through: what to draw differently. k runs 0 to 1.
  function partly(s, ev, k, view) {
    var u = s.units[ev.unit];
    if (ev.type === 'move') {
      var n = ev.path.length - 1, f = Math.min(n - 0.0001, k * n), i = Math.floor(f), a = ev.path[i], b = ev.path[i + 1];
      view.moving = { id: u.id, x: a[0] + (b[0] - a[0]) * (f - i), y: a[1] + (b[1] - a[1]) * (f - i) };
      view.facing = { id: u.id, dx: b[0] - a[0], dy: b[1] - a[1] };
    } else if (ev.type === 'attack') {
      var far = Math.abs(ev.at[0] - ev.from[0]) + Math.abs(ev.at[1] - ev.from[1]) > 1;
      view.facing = { id: u.id, dx: ev.at[0] - ev.from[0], dy: ev.at[1] - ev.from[1] };
      if (k < 0.45) {
        if (far) view.shot = { from: ev.from, to: ev.at, k: k / 0.45 };
        else {
          var p = D.spot(map, ev.from[0], ev.from[1]), t = D.spot(map, ev.at[0], ev.at[1]), reachOut = Math.sin(k / 0.45 * Math.PI) * 0.45;
          view.lunge = { id: u.id, dx: Math.round((t[0] - p[0]) * reachOut), dy: Math.round((t[1] - p[1]) * reachOut) };
        }
      } else {
        view.hp = {}; view.hp[ev.target] = ev.left;
        view.pop = { id: ev.target, text: '-' + ev.damage, rise: (k - 0.45) / 0.55 };
        if (Math.floor(k * 12) % 2 === 0) { view.hidden = {}; view.hidden[ev.target] = true; }
      }
    }
  }

  // the state to draw now, and the view of it
  function scene(now) {
    var view = { map: map, time: now, dim: !film };
    if (film) {
      var t = fixed !== null ? fixed : ((now - clock0 / 1000) % (film.length + 3)), s = R.newGame(map, film.units, film.first), at = LEAD;
      view.time = t;
      for (var i = 0; i < film.events.length; i++) {
        var ev = film.events[i], d = lasts(ev);
        if (t >= at + d) { apply(s, ev); at += d; } else { if (t > at) partly(s, ev, (t - at) / d, view); break; }
      }
      view.state = s;
    } else {
      while (true) {
        if (!current && queue.length) { current = queue.shift(); started = now; }
        if (!current) break;
        var k = (now - started) / lasts(current);
        if (k >= 1) { apply(shown, current); current = null; continue; }
        partly(shown, current, k, view);
        break;
      }
      view.state = shown;
      if (!current && !queue.length && !game.winner) {
        if (!human(game.side)) { H.aiTurn(game, 'hold', queue); }
        else if (picked !== null) {
          var u = game.units[picked];
          view.picked = picked; view.reach = {}; view.aim = {};
          if (!u.moved) {
            var r = R.reach(game, u);
            for (var y = 0; y < map.h; y++) for (var x = 0; x < map.w; x++) if (R.canStop(game, u, r, x, y) && !(x === u.x && y === u.y)) view.reach[x + ',' + y] = true;
          }
          R.targets(game, u, u.x, u.y).forEach(function (e) { view.aim[e.x + ',' + e.y] = true; });
        }
      }
    }
    if (view.facing) { var f = view.state.units[view.facing.id]; turnTo(f, view.facing.dx, view.facing.dy); }
    return view;
  }
  function human(side) { return side === map.attacker || two; }

  function frame(ms) {
    var now = ms / 1000, view = scene(now), s = view.state;
    sg.imageSmoothingEnabled = false;
    var heads = D.board(sg, img, view);
    g.fillStyle = C.paper; g.fillRect(0, 0, canvas.width, canvas.height);
    g.imageSmoothingEnabled = false;
    g.drawImage(small, D.BX, D.BY, D.BW * D.SCALE, D.BH * D.SCALE);

    // hit points over each unit, nearest the viewer last
    s.units.filter(function (u) { return heads[u.id] && (u.hp > 0) && !(view.hidden && view.hidden[u.id]); }).sort(function (a, b) { return heads[a.id][2] - heads[b.id][2]; }).forEach(function (u) {
      var hp = view.hp && view.hp[u.id] !== undefined ? view.hp[u.id] : u.hp;
      D.digits(g, String(hp), heads[u.id][0], heads[u.id][1] - 3, 30, C[u.side]);
    });
    // the damage, rising from the unit that was hit. paper with an ink rim, so it reads on tiles and on water.
    if (view.pop && heads[view.pop.id]) D.digits(g, view.pop.text, heads[view.pop.id][0] + 36, heads[view.pop.id][1] - 6 - view.pop.rise * 24, 50, C.paper, 'center', C.ink);
    if (showHeights)
      for (var y = 0; y < map.h; y++) for (var x = 0; x < map.w; x++) if (R.land(map, x, y) && !R.unitAt(s, x, y)) {
        var c = D.spot(map, x, y);
        D.digits(g, String(R.height(map, x, y)), D.BX + c[0] * D.SCALE, D.BY + c[1] * D.SCALE + 10, 28, C.ink);
      }

    // the words: the map's name and whose turn it is. the clock is the round. the house counts turns held on the marked tile.
    D.words(g, map.name, D.BX, 50, 48, C.ink);
    var side = s.winner || s.side, colour = side === 'draw' ? C.ink : C[side];
    var say = s.winner ? (s.winner === 'draw' ? 'draw' : s.winner + ' wins') : s.side + '\u2019s turn';
    g.font = 'bold 40px ' + D.FONT;
    D.words(g, say, 1186 - g.measureText(say).width, 50, 40, colour);
    var w = D.drawing(g, art.clock, C.ink, 850, 10, 44);
    D.digits(g, String(s.round), 850 + w + 12, 50, 50, C.ink, 'left');
    if (s.held > 0) {
      w = D.drawing(g, art.home, C.gold, 740, 8, 46);
      D.digits(g, String(s.held), 740 + w + 12, 50, 50, C.gold, 'left');
    }
    if (!film && !s.winner && human(s.side)) D.drawing(g, art.play, C[s.side], 1206, 12, 42);
    document.documentElement.dataset.ready = '1';
    if (fixed === null) requestAnimationFrame(frame);
  }

  // ---- clicks ----
  function unitUnder(bx, by) {
    var best = null, bestKey = -1e9;
    game.units.forEach(function (u) {
      if (u.hp <= 0) return;
      var p = D.spot(map, u.x, u.y);
      if (Math.abs(bx - p[0]) <= 9 && by >= p[1] + 2 - D.TALL[u.kind] && by <= p[1] + 3 && u.y - u.x > bestKey) { best = u; bestKey = u.y - u.x; }
    });
    return best;
  }
  function tileUnder(bx, by) {
    var best = null, bestKey = -1e9;
    for (var y = 0; y < map.h; y++) for (var x = 0; x < map.w; x++) {
      if (!R.land(map, x, y)) continue;
      var p = D.spot(map, x, y);
      if (Math.abs(bx - p[0]) / D.HALF + Math.abs(by - p[1]) / D.QUART <= 1 && y - x > bestKey) { best = [x, y]; bestKey = y - x; }
    }
    return best;
  }
  function endTurn() {
    if (film || current || queue.length || game.winner || !human(game.side)) return;
    picked = null;
    var ev = R.endTurn(game); if (ev) queue.push(ev);
  }
  function click(e) {
    var box = canvas.getBoundingClientRect();
    var cx = (e.clientX - box.left) * canvas.width / box.width, cy = (e.clientY - box.top) * canvas.height / box.height;
    if (film || current || queue.length || game.winner || !human(game.side)) return;
    if (cx >= 1190 && cy <= 62) { endTurn(); return; }
    var bx = (cx - D.BX) / D.SCALE, by = (cy - D.BY) / D.SCALE, u = unitUnder(bx, by), t = tileUnder(bx, by), me = picked !== null ? game.units[picked] : null, ev;
    var foe = u && u.side !== game.side ? u : (t ? R.unitAt(game, t[0], t[1]) : null);
    if (me && foe && foe.side !== game.side && R.canHit(game, me, me.x, me.y, foe)) {
      ev = R.attack(game, me, foe); if (ev) queue.push(ev);
      picked = null; return;
    }
    if (u && u.side === game.side && !u.acted) { picked = u.id; return; }
    if (me && t && !me.moved) {
      ev = R.move(game, me, t[0], t[1]);
      if (ev) { queue.push(ev); return; }
    }
    picked = null;
  }
  function key(e) {
    var k = e.key.toLowerCase();
    if (k === 'e') endTurn();
    else if (k === '1' || k === '2' || k === '3') { mapNo = +k - 1; begin(); }
    else if (k === 'p') { two = !two; }
    else if (k === 'h') { showHeights = !showHeights; }
    else if (k === 'r') begin();
  }

  // for tools/playtest.js: what the page holds, read only
  H.page = { game: function () { return game; }, map: function () { return map; }, picked: function () { return picked; },
    busy: function () { return !!(current || queue.length); }, unitUnder: unitUnder, tileUnder: tileUnder };

  // ---- start ----
  function load(name) {
    return new Promise(function (ok, no) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { no(new Error('missing ' + name)); }; i.src = 'assets/' + name; });
  }
  Promise.all([load('head.png'), load('head-fill.png'), load('house.png'), load('HandSpeedIcon.png'), load('HandPlay.png'), load('HandTabHome.png'), load('head-back.png'),
    document.fonts.load('40px DrewHandDigits', '0123456789-')]).then(function (a) {
    art = { head: a[0], headFill: a[1], house: a[2], clock: a[3], play: a[4], home: a[5], headBack: a[6] };
    D.makeHeads(art);
    begin();
    canvas.addEventListener('pointerdown', click);
    window.addEventListener('keydown', key);
    if (fixed !== null) frame(0); else requestAnimationFrame(frame);
  }).catch(function (err) { console.error(err); });
})();
