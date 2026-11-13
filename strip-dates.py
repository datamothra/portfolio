#!/usr/bin/env python3.14
"""Blank the creation and modification dates in a PDF made by Chrome, in place.

    python3.14 strip-dates.py file.pdf [file.pdf ...]

The dates sit in the file's Info dictionary as plain text. They are overwritten with spaces of the
same length, so nothing else in the file moves.
"""
import re, sys
for path in sys.argv[1:]:
    data = open(path, "rb").read()
    out, n = re.subn(rb"/(CreationDate|ModDate) ?\(D:[^)]*\)", lambda m: b" " * len(m.group(0)), data)
    open(path, "wb").write(out)
    print(path, "dates blanked:", n)
