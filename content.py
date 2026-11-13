"""The words and pictures of the portfolio. make.py turns this into the pages.

Blocks:
  ("text", heading or None, [paragraphs])
  ("figure", "media/...", caption)            a picture, or an .mp4 (its .jpg beside it is the poster)
  ("pair", (src, caption), (src, caption))
  ("map", "media/...", caption)               a wide picture that scrolls sideways on a phone
  ("facts", heading or None, [(name, value)])
  ("links", [(text, address)])
  ("group", heading, [blocks])                kept on one page in the PDF
  ("code", "lines of a file", caption)        shown as typed
"""

INTRO = "game designer and music technologist"

ABOUT = [
    "I am a graduate student in music technology at NYU, and I spent ten years as a recording and live sound engineer before that.",
    "This semester I am in a multiplayer games class, building online games in Unity.",
    "Each of these five has its levels as plain text, a map drawn from them, and an automatic check that the levels work. Triad is an older game of mine with taught stages added. I had the help of AI tools in building them.",
]

CONTACT = [
    ("atzdrew0619@gmail.com", "mailto:atzdrew0619@gmail.com"),
    ("cv (pdf)", "DrewAtz_CV_LevelDesign.pdf"),
]

HANDOFF = dict(
    slug="handoff", name="handoff", hero="media/handoff/hero.mp4",
    sentence="First-person co-op movement puzzles. One of you holds the way open for the other.",
    meta="first-person co-op movement puzzles · unity 6, c#, netcode for gameobjects",
    blocks=[
        ("text", "what it is", [
            "Two players run, slide and wall run across blocks over red water.",
            "Gold things sense a player: a plate you stand on, a clock you run past, a frame that reads your speed. Dark blue blocks are solid only while the gold things wired to them are on.",
            "There are five levels and a measuring room. One person can play both players and swap between them, or two can play online with a code.",
        ]),
        ("links", [("play it in the browser", "play/handoff/index.html")]),
        ("text", None, ["W A S D move. The mouse looks. Space jumps. Shift slides while you run. Q swaps player."]),
        ("figure", "media/handoff/first-person.mp4", "the same levels as the two players see them. blue on the left, red on the right."),
        ("group", "1 after you", [
            ("map", "media/handoff/map-1.png", "level 1, drawn from its level file. the lines are the routes the two bots took."),
            ("text", None, [
                "Two plates and one bridge teach the rule: gold makes blue solid while you stand on it.",
                "The third plate opens the door and takes the next bridge away. The player holding it has to let go once their partner is through.",
            ]),
            ("pair", ("media/handoff/level-1a.jpg", "red holds the bridge from the far side. blue crosses."),
                     ("media/handoff/level-1b.jpg", "blue stands on the door plate. the bridge beyond the door is gone while they do.")),
        ]),
        ("group", "2 low bridge", [
            ("map", "media/handoff/map-2.png", "level 2. a slide, a clock, and a gap that needs a slide jump."),
            ("text", None, [
                "Both players slide under a slab before anything depends on sliding.",
                "Then one holds a bridge while the other beats a 3.5 second clock to a slot 24 m away. Running there takes 3 seconds and a runner does not fit under the slot, so the answer is a slide.",
                "The level ends on a 6.3 m gap. A running jump is 5.0 m. A slide jump is 6.8 m.",
            ]),
            ("pair", ("media/handoff/level-2a.jpg", "the slab is 1.1 m off the floor. the word is painted on it."),
                     ("media/handoff/level-2b.jpg", "the run to the slot. 24 m.")),
        ]),
        ("group", "3 wall to wall", [
            ("map", "media/handoff/map-3.png", "level 3. glass keeps each player in their own lane."),
            ("text", None, [
                "Blue has a wall to run on and red has a gap. Blue's wall run ends at a clock that makes red's stepping blocks solid for 5 seconds. Then the lanes swap jobs, so each player has done both.",
                "In the last part each player's clock is for the other one.",
                "The first version had a dead end. A player who crossed alone could not help the one left behind, because both clocks were back on the near side. Two more clocks on the far side fixed it. A second bot route plays that case.",
            ]),
            ("pair", ("media/handoff/level-3a.jpg", "blue has started the clock. red crosses on the blocks it made solid."),
                     ("media/handoff/level-3b.jpg", "the last part. both clocks are running.")),
        ]),
        ("group", "4 speed limit", [
            ("map", "media/handoff/map-4.png", "level 4. speed frames, a hill and a launch pad."),
            ("text", None, [
                "A gold frame switches on when someone crosses it fast enough. Running is 8 m/s and the first frame wants 10, so it takes a slide.",
                "In the middle each player's speed opens the other player's door.",
                "The last frame wants 13.5 m/s, which only a slide down the hill reaches. It fires a pad that throws whoever is standing on it across 16 m of water.",
            ]),
            ("pair", ("media/handoff/level-4a.jpg", "the frame wants 10 m/s. running is 8."),
                     ("media/handoff/level-4b.jpg", "blue at the top of the hill. red on the pad.")),
        ]),
        ("group", "5 handoff", [
            ("map", "media/handoff/map-5.png", "level 5. five hands in a row."),
            ("text", None, [
                "A relay. Blue's speed makes red's bridge. Red's clock opens blue's slot. Blue's wall run ends on a plate that holds red's steps. Red's slide down the hill throws blue onto a ledge. Blue holds the stairs for red.",
                "Each thing a player does opens the next thing for their partner, so nobody stands still for long.",
            ]),
            ("pair", ("media/handoff/level-5a.jpg", "red is across and at the clock. blue waits to slide under the slot."),
                     ("media/handoff/level-5b.jpg", "blue holds the stairs from the ledge. red climbs.")),
        ]),
        ("text", "the kit", [
            "Plate: on while someone stands on it. Clock: on for a few seconds after someone runs past. Speed frame: on for a moment when someone crosses it at its speed or faster. Switched block: solid while its sensors say so. Launch pad: throws whoever stands on it when its sensor comes on.",
            "Nothing latches. A sensor is on only while it is held or while its clock runs, so a level cannot be left in a state with no way forward.",
            "Nothing that carries a player moves. Each player's own machine moves their body, and a moving floor under that jitters over a network. Blocks appear and disappear instead.",
        ]),
        ("facts", "measured", [
            ("run", "8.0 m/s"),
            ("running jump", "5.0 m long, 1.16 m high"),
            ("slide", "starts at 11.2 m/s and lasts 27 m on flat ground"),
            ("slide, then jump", "6.8 m"),
            ("wall run", "16.2 m in 1.7 s"),
            ("the longest jump a bot can make", "8.3 m. gaps that need a partner are 12 m or more"),
            ("slot", "a slide clears 1.1 m. at 1.0 m the body catches the edge"),
        ]),
        ("code", """# beat 2: one plate that helps and hurts. p3 opens the door and takes the bridge away.
plate p3 -4.5 41 -2.5 43 0
wall -8 -1 47  -1.5 3.5 47.5
wall 1.5 -1 47  8 3.5 47.5
block -1.5 0 47  1.5 2.6 47.5 when !p3&!p4
block -1.5 -0.4 51  1.5 0 63 when !p3
plate p4 2.5 65 4.5 67 0
exit -2 0 70  2 3 74""", "part of level 1's file. one line is one thing, in metres. a block is solid while its plates say so."),
        ("text", "how the levels are checked", [
            "Each level is one text file. The game builds the blockout from it, and the map on this page is drawn from the same file.",
            "Every level file ends with a route for each player. Two bots play the routes through the same controls a keyboard uses. If both reach the exit, the level can be solved with the movement as it is now. All five pass, alone on one machine and online between two copies of the game.",
            "The numbers above come from a bot run of the measuring room. Changing a movement number and running the bots again shows at once which levels broke.",
        ]),
        ("text", "next", [
            "Playtests with two players who have not seen it, watching where they stop.",
        ]),
    ],
)

TRIAD = dict(
    slug="triad", name="triad", hero="media/triad/hero.mp4",
    sentence="Three players on a circle of twelve notes. The triangle between them is the chord.",
    meta="three-player chord game · unity 6, c#",
    blocks=[
        ("text", "what it is", [
            "Three players stand on a circle of twelve note wedges, C at the top. The wedge a player stands in is their note, and the triangle between the three players is the chord.",
            "A chart plays one chord at a time. A circle in the chord's colour closes in and meets the red line on the downbeat, and all three strike then. Major is gold, minor is blue, diminished is purple, augmented is red.",
            "The only sound is the players' strikes. There is no backing track and no click, so a wrong note sounds wrong.",
        ]),
        ("text", "the stages", [
            "The game had a songbook and no taught order. Seven stages now come before the songs. Each is a short chart that teaches one move.",
            "A chart checker set the order. For every chord change it works out which player should take which note so the three of them run the least, and how long the longest run takes. Each stage's hardest change is no easier than the one before, and each leaves the players less spare time.",
        ]),
        ("map", "media/triad/ring-stage-1.png", "nobody runs. the stage teaches the strike."),
        ("map", "media/triad/ring-stage-2.png", "c major and a minor share two notes. only the player on g runs, and the triangle turns from gold to blue."),
        ("map", "media/triad/ring-stage-3.png", "two players run different distances at once. the third holds the note the chords share."),
        ("map", "media/triad/ring-stage-4.png", "the augmented chord sits between c and f. its triangle has three equal sides."),
        ("map", "media/triad/ring-stage-5.png", "two players run the same way together and the triangle goes narrow."),
        ("map", "media/triad/ring-stage-6.png", "every change is a move from an earlier stage. the running passes between all three players, so nobody gets to be the one who stands still."),
        ("map", "media/triad/ring-stage-7.png", "a song from the songbook. f to g makes all three run at once, which no earlier stage asks for."),
        ("pair", ("media/triad/shot-4.jpg", "stage 6. a minor, struck on the downbeat."),
                 ("media/triad/shot-1.jpg", "stage 4. the augmented triangle.")),
        ("facts", "measured", [
            ("running speed", "6.46 units a second, measured in the game"),
            ("two wedges round the ring", "0.33 s on the inside lane"),
            ("time each change allows", "2.25 beats"),
            ("longest run any stage or song needs", "two wedges"),
            ("fastest tempo every change can still be reached", "405 bpm"),
            ("tightest song in the songbook", "120 bpm, 3.4 times slower than its limit"),
        ]),
        ("text", "how the charts are checked", [
            "Three bots play each chart through the same inputs the three players use, taking the notes the checker assigned them.",
            "At the written tempos they hit 162 chords out of 162. At 0.9 times the checker's limit they hit 160 out of 160. At 1.3 times the limit they hit 57 out of 160, and 57 is the number the checker predicted.",
            "The checker also caught a stage. The first draft of stage 4 used F augmented and the bots missed it every time: the game names an augmented chord by its lowest note, and player one sings an octave below the others. The stage now uses C augmented, where player one already stands. The game's judging was left as it was.",
        ]),
        ("text", "what was added", [
            "The ring, the movement, the chord judging, the scoring, the colours, the sound and the twelve songs are the original game.",
            "The seven stages, the chart checker, the three bots and the ring diagrams are new. Nothing about how the game looks or plays was changed.",
        ]),
    ],
)

UNDERTOW = dict(
    slug="undertow", name="undertow", hero="media/undertow/hero.mp4",
    sentence="Two characters slide on red water until something stops them. Often the something is the other one.",
    meta="two-character sliding puzzles · plain javascript, one canvas · every level is checked by a solver",
    blocks=[
        ("text", "what it is", [
            "A character on water slides in a straight line until a rock, the shore or the other character stops it. The two are moved one at a time, by one player swapping or two taking turns, and both have to end on their own home.",
            "It is turn-based. Nothing is timed. There are eight levels on boards no bigger than ten by eight.",
        ]),
        ("links", [("play it in the browser", "play/undertow/index.html")]),
        ("text", None, ["Arrow keys slide the active character. Space swaps. Z undoes. R restarts. N is the next level."]),
        ("code", """name hold still
; idea: The other character stops you, the same as a rock.
; move: Pink waits in the top left corner. Navy slides up and stops under her.
; wrong: Press up with navy first. Navy passes the row and stops in the corner pink needs.
#######
#.....#
#....N#
#n....#
#P..p.#
#######""", "level 2's whole file. small letters are the two characters and capitals are their homes."),
        ("text", "the levels", [
            "Level 1 needs no partner. Level 2 adds the partner as a stop and nothing else. After that each new piece gets one level alone and then one level with the pieces before it.",
            "The maps show the shortest solution, numbered move by move.",
        ]),
        ("pair", ("media/undertow/map-1.png", "you slide until something stops you. the home is one tile away and you have to go round to reach it."),
                 ("media/undertow/map-2.png", "no rocks. the only thing that can stop navy in the right row is pink, waiting in the corner.")),
        ("pair", ("media/undertow/map-3.png", "a current pushes whoever stops on it one tile. each character stops the other once."),
                 ("media/undertow/map-4.png", "a current waits while the next tile is taken. pink holds navy on it, then lets go.")),
        ("pair", ("media/undertow/map-5.png", "the whirlpools are the only way across. pink is one move from home and has to cross and come back."),
                 ("media/undertow/map-6.png", "navy is nearer and wants to go first. pink has to.")),
        ("pair", ("media/undertow/map-7.png", "a crate slides when hit and then stays. pink stands in its row to catch it. the first key you want to press loses it."),
                 ("media/undertow/map-8.png", "the crate goes through the whirlpool, stops against pink on a current, and is pushed into place.")),
        ("figure", "media/undertow/difficulty.png", "what the solver measured, level by level."),
        ("text", "how the levels are checked", [
            "A solver searches every position a level can reach: where both characters and each crate are. It reports the shortest solution, how many positions can be reached, and how many of those are dead, with no way home.",
            "The co-op test is a second solve in which a character stops nothing. From level 2 on, every level is unsolvable that way. The solver also takes each kind of piece out and solves again, to show the piece is needed.",
            "Dead positions only exist in the two crate levels, so undo is always there.",
        ]),
        ("text", "levels the solver sent back", [
            "Level 2 first had a rock to park pink against. The solver found 192 dead positions out of 214 on a board with no crate. It was redrawn with no rocks and has none.",
            "Level 3 first had the current beside navy's home. The solver found a four move solution in which pink never helps, because the shore already stops navy on the current. The current moved to a corner and the home moved into a row with nothing to stop on.",
            "Level 7 was first open water. The solver found a solution without the crate only five moves longer, so the crate did not matter. The homes were moved apart so the crate has to be caught.",
        ]),
        ("pair", ("media/undertow/shot-3.jpg", "level 4. the numbers are my handwriting and the characters are my drawing of a computer."),
                 ("media/undertow/shot-5.jpg", "level 7. navy has hit the crate along the row and pink has caught it.")),
    ],
)

STATIC = dict(
    slug="static", name="static", hero="media/static/hero.mp4",
    sentence="A level you find your way through by ear. Fog hides everything past six metres.",
    meta="first-person, single-player, played by ear · unity 6, c# · a bot that cannot see finishes every level",
    blocks=[
        ("text", "what it is", [
            "The player carries a radio that makes two sounds. A tone points at the next thing they need: a key, then the door it opens, then the way out. Static gets louder as the thing that hunts them gets close.",
            "The player walks. There is no jumping and no running. Being caught sends them back to the last checkpoint with their keys.",
            "Every sound is made in code. It needs headphones: left and right are the whole game.",
        ]),
        ("text", "the levels", [
            "Three levels, one idea at a time. Each is one text file, and the maps are drawn from the same files with the routes two bots took.",
        ]),
        ("map", "media/static/map-1.png", "tone. the tone and nothing else."),
        ("text", None, [
            "34 m, two junctions and one corner. At the first junction the tone is 44 degrees to the right, and that is the one choice the player makes by comparing ears.",
            "The corner after it asks nothing. It confirms what the ear already said. Then a branch opens to the right with the tone straight ahead, and the player learns to walk past an opening the tone does not point at.",
            "Both dead ends are as long as the fog is deep, so a wrong turn costs four seconds.",
        ]),
        ("map", "media/static/map-2.png", "hiss. static and nothing else."),
        ("text", None, [
            "One hunter walks a ring of corridors. The player starts in a spur the hunter passes and never enters, so the first place they stand is safe.",
            "When they reach the ring the static is in the right ear and getting louder. Left is the quiet way, and the hunter is slower, so the static fades as they walk. That is the reward for the right choice.",
            "The way out is in the middle, the one place the hunter never goes.",
            "The first version had the exit in a spur on the far side. A player who went left never heard the static get loud, so the level did not teach what it claimed. The exit moved to the middle and the hunter's start moved so the first static is always on the right.",
        ]),
        ("map", "media/static/map-3.png", "both. two keys, two doors, a shortcut that opens from the far side, one hunter."),
        ("text", None, [
            "The second door is in the wall beside the start, so the player sees the last lock before either key. The first key is a walk with no danger, which repeats level 1.",
            "The hunter wakes when the first door opens, so it passes the player at the same moment however long they took to get there. Where the player's route crosses the hunter's round, the tone and the static come from the same side. The tone says go right. The static says not yet.",
            "There is a pocket in the wall at that crossing, on the side away from the tone. Stepping into it means choosing safety over the tone.",
            "The shortcut opens from the second key's room and leads back to the middle. The level ends six metres from where it started.",
        ]),
        ("pair", ("media/static/shot-4.jpg", "the hunter passes. its face is my drawing of a computer."),
                 ("media/static/shot-6.jpg", "the way out is my drawing of a house.")),
        ("figure", "media/static/blind.mp4", "level 3 played by the bot that cannot see."),
        ("facts", "measured", [
            ("the tone", "half as loud at 8 m. it carries across a whole level"),
            ("the static", "half as loud at 4.7 m, silent past 16 m"),
            ("a wall in the way", "0.6 as loud"),
            ("fog", "starts at 1.5 m, complete at 6.5 m"),
            ("player and hunter", "3.5 m/s and 2.0 m/s"),
            ("level 1", "9.8 s for the bot that can see, 12.8 s for the bot that cannot"),
            ("level 2", "8.8 s and 17.1 s"),
            ("level 3", "34.1 s and 54.5 s. neither was caught"),
        ]),
        ("text", "how the levels are checked", [
            "One bot walks a route written for it, as a reference time. The other cannot see. Each step it is given the tone's level in each ear, the static's level in each ear, and whether it touched a wall. It is not given a position, a map or the time. It finishes all three levels.",
            "The game writes the sound it makes to a file, and the left and right balance in that file follows the positions in the bot's trace.",
        ]),
    ],
)

HIDEOUT = dict(
    slug="hideout", name="hideout", hero="media/hideout/hero.mp4",
    sentence="Turn-based tactics on three small maps. Each map is built around one idea.",
    meta="turn-based tactics maps · plain javascript, one canvas · each map was changed after 160 simulated games",
    blocks=[
        ("text", "what it is", [
            "Two sides of four units take turns on a grid with heights. A fighter hits next to it, an archer shoots further from higher up, and a runner is fast and weak. Hitting from above does more and hitting from below does less. Nothing is random.",
            "Navy attacks and pink defends. Navy also wins by holding the marked tile for two of its turns.",
            "The rules are kept this small so that the map is the whole game.",
        ]),
        ("links", [("play it in the browser", "play/hideout/index.html")]),
        ("text", None, ["Click a unit, then a tile to move it, then an enemy to attack. E ends the turn. 1, 2 and 3 choose the map."]),
        ("text", "the maps", [
            "Each map was played 160 times by two simple computer players, and then changed until the numbers matched what the map claims. The pictures show where the attacks happened, the ways to the marked tile in steps, and what pink's archer can reach.",
        ]),
        ("map", "media/hideout/map-1.png", "the stairs. one ridge, one stair up it."),
        ("text", None, [
            "Pink stands a fighter on the top of the stair and its archer on the edge of the cliff. A unit on the stair hits up for 2 and is hit back for 4.",
            "The marked tile is on the ground at the foot of the stair, so pink cannot win by staying on the ridge. It has to come down for the tile, one unit at a time.",
            "With the tile on the ridge navy won 17% of games. Then pink's units were jumping off the cliff and the fight happened on flat ground, so the tiles under the cliff became water. Now more than half of all damage comes from above.",
        ]),
        ("map", "media/hideout/map-1-versions.png", "the stairs, every version with its numbers."),
        ("map", "media/hideout/map-2.png", "the gate. a wall with one gap, and a long way round."),
        ("text", None, [
            "Pink's fighters stand either side of the inside end of the gap, not in it. A unit that comes through has to stop between them.",
            "With one fighter plugging a gap one tile deep, navy won 78%: its archer shot down the row through the gap and its fighters took the plug one at a time. The wall became two tiles thick and a wall tile went in behind the gap to block that shot.",
            "The marked tile is in the far corner, so going round is a real way to win. Half of all attacks cross the three gate tiles, which are 3 of the 105 tiles a unit can stand on.",
        ]),
        ("map", "media/hideout/map-2-versions.png", "the gate, every version with its numbers."),
        ("map", "media/hideout/map-3.png", "the hideout. both ideas in one place."),
        ("text", None, [
            "A walled yard, a tower for one archer, a gate on the near side and a door on the far side. The marked tile is at the foot of the tower.",
            "The tower first stood the same distance from both ways in and covered both. It moved one tile toward the gate, so the far door is out of its reach and navy has a reason to go the long way. Navy comes through the gate in 86% of games and through the far door in 32%.",
        ]),
        ("map", "media/hideout/map-3-versions.png", "the hideout, every version with its numbers."),
        ("pair", ("media/hideout/shot-2-the-stairs-on-the-stair.jpg", "the stairs. a unit on the stair, under the fighter and the archer."),
                 ("media/hideout/shot-5-the-hideout-tower.jpg", "the hideout. the archer on the tower. the heads are my drawing of a computer.")),
        ("facts", "the numbers", [
            ("the stairs", "navy wins 45%, pink 55% · 52% of damage from above · 70% of attacks cross a stair tile"),
            ("the gate", "navy wins 56%, pink 44% · 51% of attacks cross a gate tile · the way round is used in 26% of games"),
            ("the hideout", "navy wins 46%, pink 54% · 28% of damage from above · the far door is used in 32% of games"),
            ("games", "160 a map: four pairings of two computer players, 40 starts each"),
        ]),
        ("text", "how the maps are checked", [
            "Two computer players, one that rushes and one that holds ground, play every pairing on every map from 40 slightly different starts. The simulation counts who won, how much damage came from above, how many attacks crossed a chokepoint tile and how often the marked tile decided the game.",
            "When a map did not do what it claimed, the map was changed and the rules were left alone. Every earlier version is kept and can be replayed.",
        ]),
    ],
)


def stub(slug, name):
    return dict(slug=slug, name=name, hero=f"media/{slug}/hero.jpg", sentence="", meta="", blocks=[])


PROJECTS = [HANDOFF, UNDERTOW, STATIC, HIDEOUT, TRIAD]
