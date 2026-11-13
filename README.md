# drew atz portfolio site

Plain HTML and one stylesheet. No build step, no JavaScript, system fonts only.

## Files

- `index.html`: the five projects, then about and contact.
- `handoff/`, `chemical-plant/`, `duskfall-manor/`, `class-games/`, `red-water/`: one `index.html` each.
- `style.css`: every page and the PDF.
- `media/<project>/`: pictures and video.
- `make-pdf.sh`: makes `../DrewAtz_Portfolio.pdf`.
- `print.html`: written by `make-pdf.sh`. Do not edit it.

## Preview

    cd "$HOME/Documents/Job Applications/PandaPaw/site"
    python3.14 -m http.server

Then open http://localhost:8000.

## Make the PDF

    ./make-pdf.sh

It writes `../DrewAtz_Portfolio.pdf`: Letter size, the index first, then each project starting on a new page.
A video prints as its poster picture. Links between pages become links inside the PDF.
In a `links` block a web address prints after its link text.

A link to a file on the site, such as the CV, is left out of the PDF unless the script is told where the site lives:

    SITE_URL=https://the.site.address ./make-pdf.sh

## Slots

Content goes where a comment says `<!-- SLOT: name -->`. Replace the placeholder text after the comment. The comment can stay or go.
Headings and captions are lowercased by the stylesheet.

`index.html`

- `intro line`
- `<project> hero` and `<project> sentence`, for each of the five projects
- `about`
- `contact line` (the email is copied from the resume: check it)

Every project page

- `hero`
- `facts line`: what it is · engine and tools · date · role, and where AI coding agents were used
- `what it is`

`handoff/index.html`

- `links`
- `level N name`, `level N map caption`, `level N text`, `level Na caption`, `level Nb caption`, for N from 1 to 5
- `the kit`, `the kit figure caption`
- `measured`
- `how the levels are checked`
- `what i would do next`

The other four pages

- `figure 1 caption`, `pair 1a caption`, `pair 1b caption`
- `text 2 heading`, `text 2`

## Blocks

Each block is shown once on the handoff page. Copy it from there. An `<h2>` before a block is optional.

- `figure`: one picture or video with a caption. `<figure class="figure">`
- `pair`: two figures side by side. They stack on a phone. `<div class="pair">`
- `map`: a wide map. It scrolls sideways on a phone. `<figure class="map">`
- `text`: a short paragraph, about 62 characters wide. `<div class="text">`
- `facts`: a two-column table. `<table class="facts">`
- `links`: links in a row. `<p class="links">`
- `group`: wraps the blocks that should stay on one PDF page, such as one level. `<section class="group">`
- `hero` and `meta`: the main picture and the facts line at the top of a project page.

Add `class="pixel"` to an `<img>` of small pixel art so it stays sharp when enlarged.

A video needs a poster picture twice: as `poster` on the `<video>`, and as an `<img class="poster">` right after it. The second one is what the PDF prints.

## Media paths

The placeholders are flat pink pictures with their own path written on them. Replace each with a real file of the same name.

- `media/handoff/hero.mp4` (not there yet) and `media/handoff/hero.jpg`
- `media/handoff/map-1.png` to `map-5.png` (placeholders are 3.4:1)
- `media/handoff/level-1a.jpg`, `level-1b.jpg` to `level-5a.jpg`, `level-5b.jpg`
- `media/handoff/kit.jpg`
- `media/chemical-plant/hero.png`, `media/duskfall-manor/hero.png`, `media/class-games/hero.png`, `media/red-water/hero.png`
- `media/<project>/figure-1.png`, `pair-1a.png`, `pair-1b.png` for those four
- `DrewAtz_CV_LevelDesign.pdf` goes in this folder, next to `index.html`
