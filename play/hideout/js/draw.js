// hideout: draws the board. The board is drawn small (400 x 216) and scaled up 3 times with no smoothing.
// Words and numbers are drawn after the scaling, at full size.
(function (root) {
  'use strict';
  var H = root.hideout || (root.hideout = {});
  var R = H.rules;

  var BW = 400, BH = 216, SCALE = 3;         // the small board and how much it is scaled
  var BX = 40, BY = 64;                      // where the board sits on the 1280 x 720 page
  var HALF = 14, QUART = 7, LEVEL = 6;       // a tile is 28 x 14 and one level of height is 6
  var OX = 60, OY = 138;                     // centre of tile 0 0 at water level
  var C = {
    paper: '#FFF7F5', ink: '#C0302A', navy: '#2A3090', pink: '#DE1C78', band: '#FCCCDE', gold: '#CC9E38',
    top: '#FFF0EC', grid: '#F3D3D6', left: '#EE9ABA', right: '#FCCCDE', edge: '#BE5E86',
    navyDark: '#1C2068', pinkDark: '#A5105A', navyPale: '#9A9ED0', pinkPale: '#F2A0C6'
  };
  var FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';

  // ---- the red water: one 32 x 32 texture of cells with bright veins, two copies sliding across each other ----
  function waterTexture() {
    var N = 32, cells = 9, px = [], py = [], s = 0x9e3779b9, i, x, y;
    function rnd() { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s & 0xffffff) / 0x1000000; }
    for (i = 0; i < cells; i++) { px[i] = rnd() * N; py[i] = rnd() * N; }
    var dark = [168, 36, 30], body = [214, 52, 42], vein = [255, 168, 150], t = new Uint8Array(N * N * 3);
    for (y = 0; y < N; y++)
      for (x = 0; x < N; x++) {
        var f1 = 1e9, f2 = 1e9;
        for (i = 0; i < cells; i++)
          for (var oy = -1; oy <= 1; oy++)
            for (var ox = -1; ox <= 1; ox++) {
              var dx = x + 0.5 - (px[i] + ox * N), dy = y + 0.5 - (py[i] + oy * N), d = Math.sqrt(dx * dx + dy * dy);
              if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
            }
        var v = Math.min(1, Math.max(0, 1 - (f2 - f1) / 1.6)), inside = Math.min(1, Math.max(0, f1 / 7));
        for (i = 0; i < 3; i++) {
          var c = body[i] + (dark[i] - body[i]) * (1 - inside);
          t[(y * N + x) * 3 + i] = c + (vein[i] - c) * v * v;
        }
      }
    return t;
  }
  var TEX = waterTexture();
  var MAGIC = [0, 14, 3, 13, 11, 5, 8, 6, 12, 2, 15, 1, 7, 9, 4, 10];

  function water(img, time) {
    var f = Math.floor(time * 20) % 128, o = f * 0.25, data = img.data, k = 0;
    for (var py = 0; py < BH; py++)
      for (var px = 0; px < BW; px++) {
        // back from the screen to the ground, 8 texels to a tile
        var a = (px - OX) / HALF, b = (py - OY) / QUART;
        var u = (a - b) * 4, v = (a + b) * 4;
        var i0 = ((Math.floor(v + o) & 31) * 32 + (Math.floor(u - o) & 31)) * 3;
        var i1 = ((Math.floor(v + o + 11) & 31) * 32 + (Math.floor(u + o + 5) & 31)) * 3;
        var d = (MAGIC[(py & 3) * 4 + (px & 3)] + 0.5) / 16;
        for (var c = 0; c < 3; c++) {
          var q = Math.floor((TEX[i0 + c] + TEX[i1 + c]) / 2 * 31 / 255 + d);
          data[k++] = (q << 3) | (q >> 2);
        }
        data[k++] = 255;
      }
  }

  // ---- where things are on the small board ----
  function level(map, x, y) { return R.land(map, x, y) ? R.height(map, x, y) + 1 : 0; }
  function spot(map, x, y) {   // centre of a tile's top. x and y may be fractions.
    var h = R.land(map, Math.round(x), Math.round(y)) ? level(map, Math.round(x), Math.round(y)) : 0;
    return [OX + (x + y) * HALF, OY + (y - x) * QUART - h * LEVEL];
  }

  // ---- blocks ----
  function top(g, cx, cy, fill, grid) {
    for (var dy = 0; dy < 2 * QUART; dy++) {
      var half = dy < QUART ? 2 * dy + 1 : 2 * (2 * QUART - 1 - dy) + 1;
      g.fillStyle = fill;
      g.fillRect(cx - half, cy - QUART + dy, half * 2, 1);
      if (grid && dy < QUART) { g.fillStyle = grid; g.fillRect(cx - half, cy - QUART + dy, 2, 1); g.fillRect(cx + half - 2, cy - QUART + dy, 2, 1); }
    }
  }
  // the two sides that face the viewer. drop is how many pixels each side falls.
  function sides(g, cx, cy, dropLeft, dropRight) {
    for (var c = 0; c <= HALF + 1; c++) {
      // the lowest row of the top in this column. the side starts under it.
      var y = cy - QUART + Math.floor(2 * QUART - 1 - (c - 1) / 2) + 1;
      if (dropLeft > 0 && c < HALF) {
        g.fillStyle = C.left; g.fillRect(cx - c, y, 1, dropLeft);
        g.fillStyle = C.edge; g.fillRect(cx - c, y, 1, 1);
      }
      if (dropRight > 0 && c > 0) {
        g.fillStyle = C.right; g.fillRect(cx + c - 1, y, 1, dropRight);
        g.fillStyle = C.edge; g.fillRect(cx + c - 1, y, 1, 1);
      }
    }
    // the corner where the two sides meet
    if (dropLeft > 0 && dropRight > 0) { g.fillStyle = C.edge; g.fillRect(cx, cy + QUART, 1, Math.min(dropLeft, dropRight)); }
  }

  // ---- units: blocks in the side's colour with Drew's computer for a head ----
  var heads = {};
  function makeHeads(art) {
    ['navy', 'pink'].forEach(function (side) {
      ['front', 'back'].forEach(function (view) {
        var c = document.createElement('canvas'); c.width = art.head.width; c.height = art.head.height;
        var g = c.getContext('2d');
        g.drawImage(art.headFill, 0, 0);
        g.globalCompositeOperation = 'source-in';
        g.fillStyle = C[side]; g.fillRect(0, 0, c.width, c.height);
        g.globalCompositeOperation = 'source-over';
        g.drawImage(view === 'front' ? art.head : art.headBack, 0, 0);
        heads[side + view] = c;
      });
    });
    var h = document.createElement('canvas'); h.width = art.house.width; h.height = art.house.height;
    var hg = h.getContext('2d');
    hg.drawImage(art.house, 0, 0); hg.globalCompositeOperation = 'source-in'; hg.fillStyle = C.ink; hg.fillRect(0, 0, h.width, h.height);
    heads.house = h;
  }
  var TALL = { fighter: 21, archer: 25, runner: 18 };   // feet to the top of the head
  // feet at (x, y)
  function figure(g, u, x, y, pale) {
    var main = pale ? C[u.side + 'Pale'] : C[u.side], dark = C[u.side + 'Dark'], headY;
    x = Math.round(x); y = Math.round(y);
    if (u.kind === 'fighter') {          // wide
      g.fillStyle = dark; g.fillRect(x - 5, y - 2, 3, 2); g.fillRect(x + 2, y - 2, 3, 2);
      g.fillStyle = main; g.fillRect(x - 7, y - 8, 14, 6);
      g.fillStyle = dark; g.fillRect(x - 7, y - 4, 2, 2); g.fillRect(x + 5, y - 4, 2, 2);
      headY = y - 21;
    } else if (u.kind === 'archer') {    // tall, with a line for a bow
      var side = u.fx > 0 || u.fy > 0 ? 1 : -1;
      g.fillStyle = dark; g.fillRect(x - 2, y - 2, 2, 2); g.fillRect(x + 1, y - 2, 2, 2);
      g.fillStyle = main; g.fillRect(x - 2, y - 12, 5, 10);
      g.fillStyle = dark; g.fillRect(x + side * 6, y - 14, 1, 13); g.fillRect(x + side * 5, y - 15, 1, 1); g.fillRect(x + side * 5, y - 1, 1, 1);
      g.fillRect(x + (side > 0 ? 3 : -5), y - 8, 3, 1);
      headY = y - 25;
    } else {                             // small
      g.fillStyle = dark; g.fillRect(x - 3, y - 1, 2, 1); g.fillRect(x + 1, y - 1, 2, 1);
      g.fillStyle = main; g.fillRect(x - 3, y - 5, 7, 4);
      headY = y - 18;
    }
    // the face shows when the unit faces the viewer. it looks left or right with the unit.
    var front = u.fy > 0 || u.fx < 0, right = u.fx > 0 || u.fy > 0;
    var img = heads[u.side + (front ? 'front' : 'back')];
    g.save();
    if (pale) g.globalAlpha = 0.55;
    if (right) g.drawImage(img, x - 8, headY);
    else { g.translate(x + 9, headY); g.scale(-1, 1); g.drawImage(img, 0, 0); }
    g.restore();
    return headY;
  }

  // ---- one whole picture ----
  // view: { state, map, time, moving: {id, x, y}, lunge: {id, dx, dy}, hidden: {id: true}, shot: {from, to, k},
  //         reach: {'x,y': true}, aim: {'x,y': true}, picked: unit id, dim: true to pale units that have acted }
  // returns where each unit's head is on the page, for the numbers.
  function board(g, img, view) {
    var map = view.map, state = view.state, x, y, list = [], at = {};
    water(img, view.time || 0);
    g.putImageData(img, 0, 0);
    for (y = 0; y < map.h; y++)
      for (x = 0; x < map.w; x++)
        if (R.land(map, x, y)) list.push({ key: (y - x) * 2, tile: true, x: x, y: y });
    state.units.forEach(function (u) {
      if (u.hp <= 0 && !(view.pop && view.pop.id === u.id)) return;
      var ux = u.x, uy = u.y, p;
      if (view.moving && view.moving.id === u.id) { ux = view.moving.x; uy = view.moving.y; }
      // a unit between two tiles stands at the height it would have on a ramp between them
      var x0 = Math.floor(ux), y0 = Math.floor(uy), x1 = Math.ceil(ux), y1 = Math.ceil(uy), k = Math.max(ux - x0, uy - y0);
      var h = level(map, x0, y0) * (1 - k) + level(map, x1, y1) * k;
      p = [OX + (ux + uy) * HALF, OY + (uy - ux) * QUART - h * LEVEL];
      if (view.lunge && view.lunge.id === u.id) { p[0] += view.lunge.dx; p[1] += view.lunge.dy; }
      // where the number over its head goes, kept even while the unit blinks out
      at[u.id] = [BX + Math.round(p[0]) * SCALE, BY + (Math.round(p[1]) + 2 - TALL[u.kind]) * SCALE, p[1]];
      if (u.hp <= 0 || (view.hidden && view.hidden[u.id])) return;
      list.push({ key: Math.max(y0 - x0, y1 - x1, y0 - x1, y1 - x0) * 2 + 1, unit: u, p: p });
    });
    list.sort(function (a, b) { return a.key - b.key; });
    list.forEach(function (d) {
      if (d.tile) {
        var l = level(map, d.x, d.y), p = spot(map, d.x, d.y), key = d.x + ',' + d.y;
        sides(g, p[0], p[1], (l - level(map, d.x - 1, d.y)) * LEVEL, (l - level(map, d.x, d.y + 1)) * LEVEL);
        var mark = map.mark[0] === d.x && map.mark[1] === d.y;
        var fill = view.aim && view.aim[key] ? C.ink : view.reach && view.reach[key] ? C.band : mark ? C.gold : C.top;
        top(g, p[0], p[1], fill, fill === C.top ? C.grid : fill === C.band ? C.left : null);
        if (mark && !R.unitAt(state, d.x, d.y)) g.drawImage(heads.house, p[0] - 5, p[1] - 15);
      } else {
        var u = d.unit;
        if (view.picked === u.id) { g.fillStyle = C[u.side]; g.fillRect(Math.round(d.p[0]) - 10, Math.round(d.p[1]) + 4, 20, 2); }
        figure(g, u, d.p[0], d.p[1] + 2, view.dim && u.acted && u.side === state.side);
      }
    });
    if (view.shot) {
      var a = spot(map, view.shot.from[0], view.shot.from[1]), b = spot(map, view.shot.to[0], view.shot.to[1]), t = view.shot.k;
      var sx = a[0] + (b[0] - a[0]) * t, sy = a[1] - 12 + (b[1] - a[1]) * t - Math.sin(t * Math.PI) * 10;
      g.fillStyle = C.navyDark; g.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
      g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(sx), Math.round(sy), 1, 1);
    }
    return at;
  }

  function digits(g, text, x, y, size, colour, align, rim) {
    g.font = size + 'px DrewHandDigits'; g.textAlign = align || 'center'; g.textBaseline = 'alphabetic';
    g.lineJoin = 'round'; g.lineWidth = Math.max(4, size / 5); g.strokeStyle = rim || C.paper;
    g.strokeText(text, x, y); g.fillStyle = colour; g.fillText(text, x, y);
  }
  function words(g, text, x, y, size, colour) {
    g.font = 'bold ' + size + 'px ' + FONT; g.textAlign = 'left'; g.textBaseline = 'alphabetic'; g.fillStyle = colour;
    g.fillText(text, x, y);
  }
  // one of Drew's white drawings in a colour, h pixels tall
  var tinted = {};
  function drawing(g, img, colour, x, y, h) {
    var key = img.src + colour;
    if (!tinted[key]) {
      var c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      var t = c.getContext('2d');
      t.drawImage(img, 0, 0); t.globalCompositeOperation = 'source-in'; t.fillStyle = colour; t.fillRect(0, 0, c.width, c.height);
      tinted[key] = c;
    }
    var w = h * img.width / img.height;
    g.imageSmoothingEnabled = true;
    g.drawImage(tinted[key], x, y, w, h);
    return w;
  }

  H.draw = {
    BW: BW, BH: BH, SCALE: SCALE, BX: BX, BY: BY, C: C, HALF: HALF, QUART: QUART, FONT: FONT, TALL: TALL,
    makeHeads: makeHeads, board: board, spot: spot, level: level, digits: digits, words: words, drawing: drawing
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
