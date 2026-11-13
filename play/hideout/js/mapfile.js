// hideout: reads a map file. No DOM.
//
//   name the gate
//   teaches one sentence
//
//   111111311111      rows of height digits, top row first. a dot is open water.
//   111111111111
//
//   navy fighter 1 2  side, kind, column, row. columns and rows count from 0 at the top left.
//   pink archer 10 2
//   mark 9 2          the tile the attacker wins by holding
//   choke 6 2         a tile the map is built around. the numbers count attacks that cross it.
//   watch 11 6        optional. a tile that is not a chokepoint, counted when the attacker steps on it.
//   attacker navy     optional. navy attacks unless this says pink.
(function (root) {
  'use strict';
  var H = root.hideout || (root.hideout = {});

  function parse(text) {
    var map = { name: '', teaches: '', w: 0, h: 0, height: [], units: [], mark: null, choke: [], watch: [], attacker: 'navy', rows: [] };
    text.split('\n').forEach(function (raw, n) {
      var line = raw.split('#')[0].trim();
      if (!line) return;
      var t = line.split(/\s+/);
      if (/^[0-9.]+$/.test(line)) {
        if (map.w && line.length !== map.w) throw new Error('line ' + (n + 1) + ': row is ' + line.length + ' wide, not ' + map.w);
        map.w = line.length; map.h++; map.rows.push(line);
        for (var i = 0; i < line.length; i++) map.height.push(line[i] === '.' ? -1 : +line[i]);
      } else if (t[0] === 'name') map.name = line.slice(5).trim();
      else if (t[0] === 'teaches') map.teaches = line.slice(8).trim();
      else if (t[0] === 'navy' || t[0] === 'pink') map.units.push({ side: t[0], kind: t[1], x: +t[2], y: +t[3] });
      else if (t[0] === 'mark') map.mark = [+t[1], +t[2]];
      else if (t[0] === 'choke') map.choke.push([+t[1], +t[2]]);
      else if (t[0] === 'watch') map.watch.push([+t[1], +t[2]]);
      else if (t[0] === 'attacker') map.attacker = t[1];
      else throw new Error('line ' + (n + 1) + ': ' + line);
    });
    check(map);
    return map;
  }

  // a map that breaks one of these cannot be played, so reading it stops here
  function check(map) {
    var R = H.rules, seen = {};
    if (!map.mark) throw new Error(map.name + ': no mark');
    map.units.concat([{ kind: 'fighter', x: map.mark[0], y: map.mark[1], mark: true }], map.choke.map(function (c) { return { kind: 'fighter', x: c[0], y: c[1], mark: true }; }))
      .forEach(function (u) {
        if (!R.KINDS[u.kind]) throw new Error(map.name + ': no such unit ' + u.kind);
        if (!R.land(map, u.x, u.y)) throw new Error(map.name + ': ' + u.x + ' ' + u.y + ' is not on the map');
        if (u.mark) return;
        if (seen[u.x + ',' + u.y]) throw new Error(map.name + ': two units on ' + u.x + ' ' + u.y);
        seen[u.x + ',' + u.y] = true;
      });
    ['navy', 'pink'].forEach(function (s) {
      if (!map.units.some(function (u) { return u.side === s; })) throw new Error(map.name + ': no ' + s + ' units');
    });
    // every unit must be able to walk to the marked tile
    map.units.forEach(function (u) {
      var r = R.flood(map, u.x, u.y);
      if (r.cost[map.mark[1] * map.w + map.mark[0]] === Infinity) throw new Error(map.name + ': ' + u.side + ' ' + u.kind + ' cannot reach the mark');
    });
  }

  H.parseMap = parse;
})(typeof globalThis !== 'undefined' ? globalThis : this);
