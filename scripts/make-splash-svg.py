"""Trace the black parts of betty-logo.png into one SVG <path> on a 512x512 canvas,
in the same plain format as Telegram's sample (XML header, viewBox only, M/c/Z,
small file), for BotFather's Mini App splash icon.

    python scripts/make-splash-svg.py deploy/betty-logo.png deploy/betty-splash.svg [eps] [min_area]
"""
import sys
import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
eps = float(sys.argv[3]) if len(sys.argv) > 3 else 5.0
minarea = int(sys.argv[4]) if len(sys.argv) > 4 else 600
img = cv2.imread(src)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
mask = (gray < 90).astype(np.uint8) * 255
mask = cv2.resize(mask, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)
mask = cv2.GaussianBlur(mask, (9, 9), 0)
_, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
contours = [c for c in contours if cv2.contourArea(c) > minarea]
x0, y0, w, h = cv2.boundingRect(np.vstack(contours))
box, margin = 512, 64
k = (box - 2 * margin) / max(w, h)
ox = (box - w * k) / 2 - x0 * k
oy = (box - h * k) / 2 - y0 * k


def f(v):
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def nums(vals):
    s = ""
    for v in vals:
        t = f(v)
        s += t if (t.startswith("-") or not s) else " " + t
    return s


d = ""
for c in contours:
    pts = cv2.approxPolyDP(c, eps, True).reshape(-1, 2) * k + [ox, oy]
    n = len(pts)
    if n < 3:
        continue
    mids = [(pts[i] + pts[(i + 1) % n]) / 2 for i in range(n)]
    cur = np.round(mids[0], 1)
    d += "M" + nums(cur)
    for i in range(1, n + 1):
        q, end = pts[i % n], mids[i % n]
        c1 = cur + 2 / 3 * (q - cur)
        c2 = end + 2 / 3 * (q - end)
        end = np.round(end, 1)
        d += "c" + nums(np.concatenate([c1 - cur, c2 - cur, end - cur]))
        cur = end
    d += "Z"
svg = ('<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">\n'
       f'  <path d="{d}"/>\n</svg>\n')
open(out, "w", encoding="utf-8", newline="\n").write(svg)
print(len(contours), "rings,", len(svg), "bytes")
