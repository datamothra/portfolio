#!/usr/bin/env python3.14
"""Write index.html and the five project pages from content.py.

    python3.14 make.py

The markup is the pattern in style.css: hero, meta, text, links, group, map, pair, figure, facts, nav.
Edit the words in content.py, run this, then ./make-pdf.sh for the PDF.
"""
import html, os
from content import INTRO, ABOUT, CONTACT, PROJECTS

HERE = os.path.dirname(os.path.abspath(__file__))
esc = html.escape


def media(src, alt, up, controls=True):
    """A picture, or a looping silent video with its poster for the PDF."""
    if src.endswith(".mp4"):
        poster = src[:-4] + ".jpg"
        return (f'<video src="{up}{src}" poster="{up}{poster}" autoplay loop muted playsinline{" controls" if controls else ""}></video>\n'
                f'  <img class="poster" src="{up}{poster}" alt="{esc(alt)}">')
    return f'<img src="{up}{src}" alt="{esc(alt)}">'


def block(b, name, up):
    kind = b[0]
    if kind == "text":
        _, heading, paras = b
        h = f"<h2>{esc(heading)}</h2>\n" if heading else ""
        return h + '<div class="text">\n' + "\n".join(f"  <p>{p}</p>" for p in paras) + "\n</div>"
    if kind == "figure":
        _, src, cap = b
        return f'<figure class="figure">\n  {media(src, cap, up)}\n  <figcaption>{esc(cap)}</figcaption>\n</figure>'
    if kind == "map":
        _, src, cap = b
        return (f'<figure class="map">\n  <div class="scroll"><img src="{up}{src}" alt="{esc(cap)}"></div>\n'
                f'  <figcaption>{esc(cap)}</figcaption>\n</figure>')
    if kind == "pair":
        _, a, b2 = b
        fig = lambda f: f'  <figure>\n    {media(f[0], f[1], up)}\n    <figcaption>{esc(f[1])}</figcaption>\n  </figure>'
        return '<div class="pair">\n' + fig(a) + "\n" + fig(b2) + "\n</div>"
    if kind == "facts":
        _, heading, rows = b
        h = f"<h2>{esc(heading)}</h2>\n" if heading else ""
        return h + '<table class="facts">\n' + "\n".join(f"  <tr><th>{esc(k)}</th><td>{v}</td></tr>" for k, v in rows) + "\n</table>"
    if kind == "code":
        _, text, cap = b
        return f'<figure class="code">\n  <pre>{esc(text)}</pre>\n  <figcaption>{esc(cap)}</figcaption>\n</figure>'
    if kind == "links":
        local = lambda u: u if "://" in u or u.startswith("mailto:") else up + u
        return '<p class="links">\n' + "\n".join(f'  <a href="{local(u)}">{esc(t)}</a>' for t, u in b[1]) + "\n</p>"
    if kind == "group":
        _, heading, blocks = b
        return (f'<section class="group">\n<h2>{esc(heading)}</h2>\n\n'
                + "\n\n".join(block(x, name, up) for x in blocks) + "\n</section>")
    raise SystemExit(f"{name}: unknown block {kind}")


def page(title, body):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<link rel="stylesheet" href="{'../' if ' · ' in title else ''}style.css">
</head>
<body>
<main>
{body}
</main>
</body>
</html>
"""


def main():
    # index
    cards = []
    for i, p in enumerate(PROJECTS):
        wide = ' wide' if i == 0 else ''
        cards.append(f"""<article class="project{wide}">
  <a href="{p['slug']}/index.html">
    {media(p['hero'], p['name'], '', controls=False)}
  </a>
  <h2><a href="{p['slug']}/index.html">{esc(p['name'])}</a></h2>
  <p>{p['sentence']}</p>
</article>""")
    contact = "\n".join(f'    <a href="{u}">{esc(t)}</a>' for t, u in CONTACT)
    body = (f'<h1>drew atz</h1>\n<p class="intro">{INTRO}</p>\n\n<div class="work">\n\n' + "\n\n".join(cards) + "\n\n</div>\n\n"
            + '<section class="about">\n  <h2>about</h2>\n' + "\n".join(f"  <p>{p}</p>" for p in ABOUT)
            + f'\n  <p class="contact">\n{contact}\n  </p>\n</section>')
    open(os.path.join(HERE, "index.html"), "w").write(page("drew atz", body))

    for i, p in enumerate(PROJECTS):
        nxt = PROJECTS[(i + 1) % len(PROJECTS)]
        parts = [f"<h1>{esc(p['name'])}</h1>",
                 f'<figure class="hero">\n  {media(p["hero"], p["name"], "../")}\n</figure>',
                 f'<p class="meta">{p["meta"]}</p>']
        parts += [block(b, p["slug"], "../") for b in p["blocks"]]
        parts.append(f'<p class="nav">\n  <a href="../index.html">index</a>\n  <a href="../{nxt["slug"]}/index.html">next: {esc(nxt["name"])}</a>\n</p>')
        os.makedirs(os.path.join(HERE, p["slug"]), exist_ok=True)
        open(os.path.join(HERE, p["slug"], "index.html"), "w").write(page(f"{p['name']} · drew atz", "\n\n".join(parts)))
        print("wrote", p["slug"])


if __name__ == "__main__":
    main()
