// Made by tools/solve.js from levels/*.txt. Do not edit.
window.UNDERTOW_LEVELS = [
 {
  "file": "1-overshoot.txt",
  "text": "name overshoot\n; idea: You slide until something stops you. A rock or the shore stops you.\n; move: Navy's home is one tile above it. Navy slides past it, so it goes round: left to the rock, up to the rock, right into the shore.\n; shape: The bottom left rock stops navy under the top rock. The top rock stops navy level with its home. The bottom left rock also stops pink on her home.\n; wrong: Press up. Navy passes its home and stops in the top corner.\n######\n#po..#\n#P..N#\n#o..n#\n######\n",
  "report": {
   "level": 1,
   "file": "1-overshoot.txt",
   "name": "overshoot",
   "idea": "You slide until something stops you. A rock or the shore stops you.",
   "find": "Navy's home is one tile above it. Navy slides past it, so it goes round: left to the rock, up to the rock, right into the shore.",
   "shape": "The bottom left rock stops navy under the top rock. The top rock stops navy level with its home. The bottom left rock also stops pink on her home.",
   "wrong": "Press up. Navy passes its home and stops in the top corner.",
   "size": [
    6,
    5
   ],
   "pieces": [
    "rock"
   ],
   "solvable": true,
   "moves": 4,
   "solution": [
    "nL",
    "nU",
    "nR",
    "pD"
   ],
   "shortest_solutions": 4,
   "swaps": 1,
   "one_mover": false,
   "without_partner": true,
   "without_partner_moves": 4,
   "states": 90,
   "dead": 0,
   "branching": 3.5,
   "without": {},
   "trace": [
    [
     {
      "id": "n",
      "from": [
       4,
       3
      ],
      "to": [
       2,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       2,
       3
      ],
      "to": [
       2,
       2
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       2,
       2
      ],
      "to": [
       4,
       2
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       1,
       1
      ],
      "to": [
       1,
       2
      ],
      "kind": "slide"
     }
    ]
   ]
  }
 },
 {
  "file": "2-hold-still.txt",
  "text": "name hold still\n; idea: The other character stops you, the same as a rock.\n; move: Pink waits in the top left corner. Navy slides up and stops under her, level with its home. Then pink goes home.\n; shape: There are no rocks. Navy's home is at the end of a row that nothing but pink can stop navy in.\n; wrong: Press up with navy first. Navy passes the row and stops in the corner pink needs.\n#######\n#.....#\n#....N#\n#n....#\n#P..p.#\n#######\n",
  "report": {
   "level": 2,
   "file": "2-hold-still.txt",
   "name": "hold still",
   "idea": "The other character stops you, the same as a rock.",
   "find": "Pink waits in the top left corner. Navy slides up and stops under her, level with its home. Then pink goes home.",
   "shape": "There are no rocks. Navy's home is at the end of a row that nothing but pink can stop navy in.",
   "wrong": "Press up with navy first. Navy passes the row and stops in the corner pink needs.",
   "size": [
    7,
    6
   ],
   "pieces": [],
   "solvable": true,
   "moves": 5,
   "solution": [
    "pU",
    "pL",
    "nU",
    "nR",
    "pD"
   ],
   "shortest_solutions": 1,
   "swaps": 2,
   "one_mover": false,
   "without_partner": false,
   "without_partner_moves": 0,
   "states": 120,
   "dead": 0,
   "branching": 5,
   "without": {},
   "trace": [
    [
     {
      "id": "p",
      "from": [
       4,
       4
      ],
      "to": [
       4,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       4,
       1
      ],
      "to": [
       1,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       3
      ],
      "to": [
       1,
       2
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       2
      ],
      "to": [
       5,
       2
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       1,
       1
      ],
      "to": [
       1,
       4
      ],
      "kind": "slide"
     }
    ]
   ]
  }
 },
 {
  "file": "3-corner-current.txt",
  "text": "name corner current\n; idea: A current pushes whoever stops on it one tile.\n; move: Navy stops in the corner on the current and is pushed down into the home row. Pink has to be waiting at the far end of that row.\n; shape: The current is in a corner so the shore stops navy on it. The home row has no rock, so only pink can stop navy on its home. Her quickest way to the end of that row is to stop under navy in the other corner, so in the shortest solution each one stops the other once.\n; wrong: Take the current first. Navy drops into the home row with nobody at the far end and slides past its home.\n########\n#....nv#\n#.N....#\n#......#\n#p....P#\n########\n",
  "report": {
   "level": 3,
   "file": "3-corner-current.txt",
   "name": "corner current",
   "idea": "A current pushes whoever stops on it one tile.",
   "find": "Navy stops in the corner on the current and is pushed down into the home row. Pink has to be waiting at the far end of that row.",
   "shape": "The current is in a corner so the shore stops navy on it. The home row has no rock, so only pink can stop navy on its home. Her quickest way to the end of that row is to stop under navy in the other corner, so in the shortest solution each one stops the other once.",
   "wrong": "Take the current first. Navy drops into the home row with nobody at the far end and slides past its home.",
   "size": [
    8,
    6
   ],
   "pieces": [
    "current"
   ],
   "solvable": true,
   "moves": 6,
   "solution": [
    "nL",
    "pU",
    "nR",
    "nL",
    "pD",
    "pR"
   ],
   "shortest_solutions": 1,
   "swaps": 3,
   "one_mover": false,
   "without_partner": false,
   "without_partner_moves": 0,
   "states": 216,
   "dead": 0,
   "branching": 4.67,
   "without": {
    "current": "unsolvable"
   },
   "trace": [
    [
     {
      "id": "n",
      "from": [
       5,
       1
      ],
      "to": [
       1,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       1,
       4
      ],
      "to": [
       1,
       2
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       1
      ],
      "to": [
       6,
       1
      ],
      "kind": "slide"
     },
     {
      "id": "n",
      "from": [
       6,
       1
      ],
      "to": [
       6,
       2
      ],
      "kind": "push"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       6,
       2
      ],
      "to": [
       2,
       2
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       1,
       2
      ],
      "to": [
       1,
       4
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       1,
       4
      ],
      "to": [
       6,
       4
      ],
      "kind": "slide"
     }
    ]
   ]
  }
 },
 {
  "file": "4-let-go.txt",
  "text": "name let go\n; idea: A current keeps pushing. If the next tile is taken it waits, and pushes when the tile is free.\n; move: Pink waits on navy's home. Navy stops against her, on the current. When pink leaves, the current carries navy home. Then navy comes down to stop pink on her home and goes back.\n; shape: The second current, in the corner past navy's home, throws out whatever stops behind the home. The rock under pink's start stops her on the way down and later stops navy next to her home. The left rock turns pink round.\n; wrong: Slide navy along the top row. It passes its home, stops on the corner current and is pushed out of the row.\n########\n#n..>Nv#\n#......#\n#o..Pp.#\n#....o.#\n########\n",
  "report": {
   "level": 4,
   "file": "4-let-go.txt",
   "name": "let go",
   "idea": "A current keeps pushing. If the next tile is taken it waits, and pushes when the tile is free.",
   "find": "Pink waits on navy's home. Navy stops against her, on the current. When pink leaves, the current carries navy home. Then navy comes down to stop pink on her home and goes back.",
   "shape": "The second current, in the corner past navy's home, throws out whatever stops behind the home. The rock under pink's start stops her on the way down and later stops navy next to her home. The left rock turns pink round.",
   "wrong": "Slide navy along the top row. It passes its home, stops on the corner current and is pushed out of the row.",
   "size": [
    8,
    6
   ],
   "pieces": [
    "rock",
    "current"
   ],
   "solvable": true,
   "moves": 7,
   "solution": [
    "pU",
    "nR",
    "pD",
    "pL",
    "nD",
    "pR",
    "nU"
   ],
   "shortest_solutions": 1,
   "swaps": 5,
   "one_mover": false,
   "without_partner": false,
   "without_partner_moves": 0,
   "states": 350,
   "dead": 0,
   "branching": 5.29,
   "without": {
    "current": "unsolvable"
   },
   "trace": [
    [
     {
      "id": "p",
      "from": [
       5,
       3
      ],
      "to": [
       5,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       1
      ],
      "to": [
       4,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       5,
       1
      ],
      "to": [
       5,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "n",
      "from": [
       4,
       1
      ],
      "to": [
       5,
       1
      ],
      "kind": "push"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       5,
       3
      ],
      "to": [
       2,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       5,
       1
      ],
      "to": [
       5,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       2,
       3
      ],
      "to": [
       4,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       5,
       3
      ],
      "to": [
       5,
       1
      ],
      "kind": "slide"
     }
    ]
   ]
  }
 },
 {
  "file": "5-there-and-back.txt",
  "text": "name there and back\n; idea: Enter one whirlpool and you leave the other, still sliding the same way.\n; move: Pink goes through to the far shore and stops under navy's home. Navy comes down from the corner and stops on her. Then pink slides back through to her own home.\n; shape: The shore down the middle makes the whirlpools the only way across. They are on the row under navy's home, so a slide through them ends where navy needs a stop. Navy goes through from above, so it comes out heading down and has to go round by the far corner to get above its home.\n; wrong: Pink's home is one tile above her. She is home after one move and it looks finished for her. She has to leave it.\n##########\n#...#....#\n#n..#...N#\n#P.@#@...#\n#p..#....#\n#...#....#\n##########\n",
  "report": {
   "level": 5,
   "file": "5-there-and-back.txt",
   "name": "there and back",
   "idea": "Enter one whirlpool and you leave the other, still sliding the same way.",
   "find": "Pink goes through to the far shore and stops under navy's home. Navy comes down from the corner and stops on her. Then pink slides back through to her own home.",
   "shape": "The shore down the middle makes the whirlpools the only way across. They are on the row under navy's home, so a slide through them ends where navy needs a stop. Navy goes through from above, so it comes out heading down and has to go round by the far corner to get above its home.",
   "wrong": "Pink's home is one tile above her. She is home after one move and it looks finished for her. She has to leave it.",
   "size": [
    10,
    7
   ],
   "pieces": [
    "whirlpool"
   ],
   "solvable": true,
   "moves": 8,
   "solution": [
    "pU",
    "nR",
    "nD",
    "nR",
    "nU",
    "pR",
    "nD",
    "pL"
   ],
   "shortest_solutions": 2,
   "swaps": 4,
   "one_mover": false,
   "without_partner": false,
   "without_partner_moves": 0,
   "states": 388,
   "dead": 0,
   "branching": 5,
   "without": {
    "whirlpool": "unsolvable"
   },
   "trace": [
    [
     {
      "id": "p",
      "from": [
       1,
       4
      ],
      "to": [
       1,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       2
      ],
      "to": [
       3,
       2
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       3,
       2
      ],
      "to": [
       3,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "n",
      "from": [
       3,
       3
      ],
      "to": [
       5,
       3
      ],
      "kind": "warp"
     },
     {
      "id": "n",
      "from": [
       5,
       3
      ],
      "to": [
       5,
       5
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       5,
       5
      ],
      "to": [
       8,
       5
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       8,
       5
      ],
      "to": [
       8,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       1,
       3
      ],
      "to": [
       3,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "p",
      "from": [
       3,
       3
      ],
      "to": [
       5,
       3
      ],
      "kind": "warp"
     },
     {
      "id": "p",
      "from": [
       5,
       3
      ],
      "to": [
       8,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       8,
       1
      ],
      "to": [
       8,
       2
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       8,
       3
      ],
      "to": [
       5,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "p",
      "from": [
       5,
       3
      ],
      "to": [
       3,
       3
      ],
      "kind": "warp"
     },
     {
      "id": "p",
      "from": [
       3,
       3
      ],
      "to": [
       1,
       3
      ],
      "kind": "slide"
     }
    ]
   ]
  }
 },
 {
  "file": "6-first-in.txt",
  "text": "name first in\n; idea: A current beside a whirlpool feeds it. You come up on the other whirlpool and stay there.\n; move: Pink has to go in first. She waits on the whirlpool, which holds navy on the current behind her. When she slides to her home, navy comes up and stops against her.\n; shape: The room at the bottom left has no door but the whirlpool. The rock lines a slide up with the lane. The lane ends on the current, which pushes into the whirlpool. The tile above that whirlpool is the way out of the room: the rock stops you on it and one move left puts you back in the lane.\n; wrong: Navy is nearer and goes in first. It slides to the back of the room and stops on pink's home.\n##########\n#n......p#\n#........#\n#......o.#\n######..##\n#PN@##>@##\n##########\n",
  "report": {
   "level": 6,
   "file": "6-first-in.txt",
   "name": "first in",
   "idea": "A current beside a whirlpool feeds it. You come up on the other whirlpool and stay there.",
   "find": "Pink has to go in first. She waits on the whirlpool, which holds navy on the current behind her. When she slides to her home, navy comes up and stops against her.",
   "shape": "The room at the bottom left has no door but the whirlpool. The rock lines a slide up with the lane. The lane ends on the current, which pushes into the whirlpool. The tile above that whirlpool is the way out of the room: the rock stops you on it and one move left puts you back in the lane.",
   "wrong": "Navy is nearer and goes in first. It slides to the back of the room and stops on pink's home.",
   "size": [
    10,
    7
   ],
   "pieces": [
    "rock",
    "current",
    "whirlpool"
   ],
   "solvable": true,
   "moves": 9,
   "solution": [
    "pL",
    "nD",
    "pD",
    "pR",
    "pD",
    "nR",
    "nD",
    "pL",
    "nL"
   ],
   "shortest_solutions": 13,
   "swaps": 5,
   "one_mover": false,
   "without_partner": false,
   "without_partner_moves": 0,
   "states": 434,
   "dead": 0,
   "branching": 3.44,
   "without": {
    "current": 11,
    "whirlpool": "unsolvable"
   },
   "trace": [
    [
     {
      "id": "p",
      "from": [
       8,
       1
      ],
      "to": [
       2,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       1
      ],
      "to": [
       1,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       2,
       1
      ],
      "to": [
       2,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       2,
       3
      ],
      "to": [
       6,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       6,
       3
      ],
      "to": [
       6,
       5
      ],
      "kind": "slide"
     },
     {
      "id": "p",
      "from": [
       6,
       5
      ],
      "to": [
       7,
       5
      ],
      "kind": "push"
     },
     {
      "id": "p",
      "from": [
       7,
       5
      ],
      "to": [
       3,
       5
      ],
      "kind": "warp"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       3
      ],
      "to": [
       6,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       6,
       3
      ],
      "to": [
       6,
       5
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       3,
       5
      ],
      "to": [
       1,
       5
      ],
      "kind": "slide"
     },
     {
      "id": "n",
      "from": [
       6,
       5
      ],
      "to": [
       7,
       5
      ],
      "kind": "push"
     },
     {
      "id": "n",
      "from": [
       7,
       5
      ],
      "to": [
       3,
       5
      ],
      "kind": "warp"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       3,
       5
      ],
      "to": [
       2,
       5
      ],
      "kind": "slide"
     }
    ]
   ]
  }
 },
 {
  "file": "7-catch.txt",
  "text": "name catch\n; idea: A crate slides when you hit it and stays where it stops.\n; move: Pink is the catcher. Navy goes round the board to get behind the crate and hits it along the row. It stops against pink, one tile past navy's home, and navy slides in against it.\n; shape: The rock above pink is the stop that puts her back in the row if she leaves it. The left rock stops navy in line with the crate. The bottom rock turns pink up into her home, under navy.\n; wrong: Navy starts under the crate. Press up and the crate goes to the top shore and never comes back to the row. The level can still be solved from there without the crate, in 15 more moves.\n#########\n#.......#\n#.....o.#\n#.c.N.p.#\n#on.P...#\n#..o....#\n#########\n",
  "report": {
   "level": 7,
   "file": "7-catch.txt",
   "name": "catch",
   "idea": "A crate slides when you hit it and stays where it stops.",
   "find": "Pink is the catcher. Navy goes round the board to get behind the crate and hits it along the row. It stops against pink, one tile past navy's home, and navy slides in against it.",
   "shape": "The rock above pink is the stop that puts her back in the row if she leaves it. The left rock stops navy in line with the crate. The bottom rock turns pink up into her home, under navy.",
   "wrong": "Navy starts under the crate. Press up and the crate goes to the top shore and never comes back to the row. The level can still be solved from there without the crate, in 15 more moves.",
   "size": [
    9,
    7
   ],
   "pieces": [
    "rock",
    "crate"
   ],
   "solvable": true,
   "moves": 9,
   "solution": [
    "nR",
    "nU",
    "nL",
    "nD",
    "nR",
    "nR",
    "pD",
    "pL",
    "pU"
   ],
   "shortest_solutions": 3,
   "swaps": 1,
   "one_mover": false,
   "without_partner": false,
   "without_partner_moves": 0,
   "states": 12807,
   "dead": 640,
   "branching": 5.56,
   "without": {
    "crate": 15
   },
   "trace": [
    [
     {
      "id": "n",
      "from": [
       2,
       4
      ],
      "to": [
       7,
       4
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       7,
       4
      ],
      "to": [
       7,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       7,
       1
      ],
      "to": [
       1,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       1
      ],
      "to": [
       1,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "c",
      "from": [
       2,
       3
      ],
      "to": [
       5,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       3
      ],
      "to": [
       4,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       6,
       3
      ],
      "to": [
       6,
       5
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       6,
       5
      ],
      "to": [
       4,
       5
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       4,
       5
      ],
      "to": [
       4,
       4
      ],
      "kind": "slide"
     }
    ]
   ]
  }
 },
 {
  "file": "8-send-it-through.txt",
  "text": "name send it through\n; idea: A crate goes through a whirlpool and is pushed by a current, the same as you.\n; move: Pink crosses first and waits at the end of the row. Navy hits the crate through the whirlpool. It stops against pink on the current, which pushes it down beside navy's home. Navy crosses from above and stops against it. Pink slides back through to her home.\n; shape: The left rock stops navy behind the crate. The right rock stops pink at the end of the crate's row. The current moves the crate out of that row so pink can slide back along it. The rock under the right whirlpool stops navy level with its home.\n; wrong: Navy can reach the crate in one move and hit it in the next. With nobody across, the crate slides to the far shore and stays there, and the way home from there is 21 moves. The dead end is different: slide back through the whirlpool while the crate is still in its row and it is knocked onto pink's home for good.\n##########\n#n..#....#\n#...#....#\n#Pc@#@.v.#\n#o..#.N.o#\n#...#o...#\n#p..#....#\n##########\n",
  "report": {
   "level": 8,
   "file": "8-send-it-through.txt",
   "name": "send it through",
   "idea": "A crate goes through a whirlpool and is pushed by a current, the same as you.",
   "find": "Pink crosses first and waits at the end of the row. Navy hits the crate through the whirlpool. It stops against pink on the current, which pushes it down beside navy's home. Navy crosses from above and stops against it. Pink slides back through to her home.",
   "shape": "The left rock stops navy behind the crate. The right rock stops pink at the end of the crate's row. The current moves the crate out of that row so pink can slide back along it. The rock under the right whirlpool stops navy level with its home.",
   "wrong": "Navy can reach the crate in one move and hit it in the next. With nobody across, the crate slides to the far shore and stays there, and the way home from there is 21 moves. The dead end is different: slide back through the whirlpool while the crate is still in its row and it is knocked onto pink's home for good.",
   "size": [
    10,
    8
   ],
   "pieces": [
    "rock",
    "current",
    "whirlpool",
    "crate"
   ],
   "solvable": true,
   "moves": 11,
   "solution": [
    "nD",
    "pR",
    "pU",
    "pR",
    "pD",
    "nR",
    "nU",
    "nR",
    "nD",
    "nR",
    "pL"
   ],
   "shortest_solutions": 20,
   "swaps": 3,
   "one_mover": false,
   "without_partner": false,
   "without_partner_moves": 0,
   "states": 18296,
   "dead": 1194,
   "branching": 4.09,
   "without": {
    "current": 18,
    "whirlpool": "unsolvable",
    "crate": 14
   },
   "trace": [
    [
     {
      "id": "n",
      "from": [
       1,
       1
      ],
      "to": [
       1,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       1,
       6
      ],
      "to": [
       3,
       6
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       3,
       6
      ],
      "to": [
       3,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "p",
      "from": [
       3,
       3
      ],
      "to": [
       5,
       3
      ],
      "kind": "warp"
     },
     {
      "id": "p",
      "from": [
       5,
       3
      ],
      "to": [
       5,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       5,
       1
      ],
      "to": [
       8,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       8,
       1
      ],
      "to": [
       8,
       3
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "c",
      "from": [
       2,
       3
      ],
      "to": [
       3,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "c",
      "from": [
       3,
       3
      ],
      "to": [
       5,
       3
      ],
      "kind": "warp"
     },
     {
      "id": "c",
      "from": [
       5,
       3
      ],
      "to": [
       7,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "c",
      "from": [
       7,
       3
      ],
      "to": [
       7,
       4
      ],
      "kind": "push"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       3
      ],
      "to": [
       1,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       1,
       1
      ],
      "to": [
       3,
       1
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       3,
       1
      ],
      "to": [
       3,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "n",
      "from": [
       3,
       3
      ],
      "to": [
       5,
       3
      ],
      "kind": "warp"
     },
     {
      "id": "n",
      "from": [
       5,
       3
      ],
      "to": [
       5,
       4
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "n",
      "from": [
       5,
       4
      ],
      "to": [
       6,
       4
      ],
      "kind": "slide"
     }
    ],
    [
     {
      "id": "p",
      "from": [
       8,
       3
      ],
      "to": [
       5,
       3
      ],
      "kind": "slide"
     },
     {
      "id": "p",
      "from": [
       5,
       3
      ],
      "to": [
       3,
       3
      ],
      "kind": "warp"
     },
     {
      "id": "p",
      "from": [
       3,
       3
      ],
      "to": [
       1,
       3
      ],
      "kind": "slide"
     }
    ]
   ]
  }
 }
];
