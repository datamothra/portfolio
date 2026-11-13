// Made by tools/pack.js from the .txt files in this folder. Change those, not this.
(function (root) {
  var H = root.hideout || (root.hideout = {});
  H.mapFiles = [
    {
      "file": "1-the-stairs.txt",
      "text": "name the stairs\nteaches High ground hits harder and the climb costs a turn, so pink stands at the top of the one stair and comes down only for the marked tile at its foot.\n\n000000.33333\n000000.33333\n000000.33333\n000001.33333\n000001233333\n000001.33333\n000000.33333\n000000.33333\n000000.33333\n000000.33333\n\nnavy fighter 1 3\nnavy fighter 1 5\nnavy archer 0 4\nnavy runner 0 6\npink fighter 7 4\npink fighter 8 5\npink archer 7 1\npink runner 9 3\nmark 4 4\nchoke 5 3\nchoke 5 4\nchoke 5 5\nchoke 6 4\n"
    },
    {
      "file": "2-the-gate.txt",
      "text": "name the gate\nteaches One gap lets one unit through at a time and the way round is long, so pink stands on both sides of the tile inside the gap and leaves its runner at the far opening.\n\n111111331111\n111111331111\n111111111311\n111111331111\n111111331111\n111111331111\n111111333331\n111111111111\n111111111111\n111111111111\n\nnavy fighter 1 1\nnavy fighter 1 3\nnavy archer 0 2\nnavy runner 1 5\npink fighter 8 1\npink fighter 8 3\npink archer 9 4\npink runner 11 5\nmark 10 0\nchoke 6 2\nchoke 7 2\nchoke 8 2\nwatch 11 6\n"
    },
    {
      "file": "3-the-hideout.txt",
      "text": "name the hideout\nteaches The tower reaches the near gate and not the far door, so pink stands inside the gate under its archer and leaves its runner to watch the door.\n\n000000000000\n000022222222\n000020000002\n000020123002\n000000000002\n000020000002\n000020000002\n000020000002\n000022222202\n000000000000\n\nnavy fighter 1 3\nnavy fighter 1 5\nnavy archer 0 4\nnavy runner 0 8\npink fighter 5 5\npink fighter 6 4\npink archer 8 3\npink runner 10 6\nmark 8 4\nchoke 4 4\nchoke 10 8\n"
    }
  ];
})(typeof globalThis !== 'undefined' ? globalThis : this);
