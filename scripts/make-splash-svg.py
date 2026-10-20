"""Trace the black parts of betty-logo.png into one SVG <path> on a 512x512 canvas."""
import sys
import cv2
import numpy as np

src, out = sys.argv[1], sys.argv[2]
img = cv2.imread(src)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
mask = (gray < 90).astype(np.uint8) * 255
# smooth jagged edges: upscale, blur, re-threshold
mask = cv2.resize(mask, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)
mask = cv2.GaussianBlur(mask, (7, 7), 0)
_, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
contours, _ = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
contours = [c for c in contours if cv2.contourArea(c) > 300]
x0, y0, w, h = cv2.boundingRect(np.vstack(contours))
box, margin = 512, 64
k = (box - 2 * margin) / max(w, h)
ox = (box - w * k) / 2 - x0 * k
oy = (box - h * k) / 2 - y0 * k

def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")

parts = []
for c in contours:
    pts = cv2.approxPolyDP(c, 1.6, True).reshape(-1, 2) * k + [ox, oy]
    n = len(pts)
    if n < 3:
        continue
    mid = lambda i: (pts[i % n] + pts[(i + 1) % n]) / 2
    m0 = mid(0)
    d = [f"M{f(m0[0])} {f(m0[1])}"]
    for i in range(1, n + 1):
        p, m = pts[i % n], mid(i)
        d.append(f"Q{f(p[0])} {f(p[1])} {f(m[0])} {f(m[1])}")
    parts.append("".join(d) + "Z")
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">'
       f'<path fill-rule="evenodd" d="{"".join(parts)}"/></svg>\n')
open(out, "w", encoding="utf-8").write(svg)
print(len(contours), "rings,", len(svg), "bytes")
