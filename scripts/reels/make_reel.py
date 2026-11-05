"""15 second vertical 3D reel (1080x1920) for one match.

    python scripts/reels/make_reel.py scripts/reels/matches/ENG_CRO.json
    python scripts/reels/make_reel.py <match.json> --stills <dir>   # a few PNGs instead of the video

Match file: names, card codes, flag styles (see flagTex in reel.js), and either
"odds": [home, draw, away] (decimal, the bookmaker margin is removed) or "probs".
Expected goals and the most likely score are fitted from those three numbers with
a Poisson model, so the bars always agree with each other. "sample": true stamps
the video so it can't be posted by accident.

Scenes are in reel.html + reel.js and rendered by Edge in headless mode. Needs
playwright, numpy, imageio-ffmpeg, and player cutouts from make_cutout.py.
"""
import argparse
import functools
import http.server
import json
import math
import os
import subprocess
import threading

import imageio_ffmpeg
import numpy as np
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
W, H, FPS, SECONDS = 1080, 1920, 30, 15
STILLS = (1.6, 4.8, 8.2, 10.8, 14.0)


def fit_model(probs):
    """Expected goals whose Poisson win/draw/loss chances best match probs."""
    total = sum(probs)
    target_w, target_d = probs[0] / total, probs[1] / total
    goals = np.arange(0, 13)
    fact = np.array([math.factorial(int(g)) for g in goals], dtype=float)
    pmf = lambda lam: np.exp(-lam) * lam ** goals / fact
    best = None
    for a in np.arange(0.2, 4.01, 0.02):
        pa = pmf(a)
        for b in np.arange(0.2, 4.01, 0.02):
            grid = np.outer(pa, pmf(b))
            w, d = np.tril(grid, -1).sum(), np.trace(grid)
            err = (w - target_w) ** 2 + (d - target_d) ** 2
            if best is None or err < best[0]:
                best = (err, a, b, grid)
    _, a, b, grid = best
    i, j = np.unravel_index(grid.argmax(), grid.shape)
    return {'home_goals': float(a), 'away_goals': float(b),
            'score': [int(i), int(j)], 'score_pct': round(float(grid[i, j]) * 100)}


def read_probs(match):
    raw = [1 / o for o in match['odds']] if 'odds' in match else match['probs']
    total = sum(raw)
    return [r / total * 100 for r in raw]


def whole_percents(probs):
    """Whole numbers that still add up to 100 (largest remainder gets the spare points)."""
    out = [math.floor(p) for p in probs]
    by_remainder = sorted(range(len(probs)), key=lambda i: probs[i] - out[i], reverse=True)
    for i in by_remainder[:100 - sum(out)]:
        out[i] += 1
    return out


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve_repo():
    handler = functools.partial(QuietHandler, directory=ROOT)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, server.server_address[1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('match')
    ap.add_argument('--out')
    ap.add_argument('--stills')
    args = ap.parse_args()
    with open(args.match, encoding='utf-8') as f:
        match = json.load(f)
    probs = read_probs(match)
    model = fit_model(probs)
    pct = whole_percents(probs)
    print(f"{match['home']} {model['home_goals']:.2f} : {model['away_goals']:.2f} {match['away']} | "
          f"{pct} | most likely {model['score'][0]}:{model['score'][1]} ({model['score_pct']}%)")

    server, port = serve_repo()
    base = f'http://127.0.0.1:{port}'
    data = {**match, **model, 'pct': pct,
            'home_cut': f"{base}/scripts/reels/cutouts/{match['home_card']}.png",
            'away_cut': f"{base}/scripts/reels/cutouts/{match['away_card']}.png",
            'home_card_url': f"{base}/frontend/public/teams/Cards/{match['home_card']}.png",
            'away_card_url': f"{base}/frontend/public/teams/Cards/{match['away_card']}.png"}

    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True, args=[
            '--use-angle=d3d11', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'])
        page = browser.new_page(viewport={'width': W, 'height': H})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'{base}/scripts/reels/reel.html')
        page.evaluate('d => init(d)', data)
        if errors:
            raise SystemExit(errors[0])

        if args.stills:
            os.makedirs(args.stills, exist_ok=True)
            for sec in STILLS:
                page.evaluate('s => renderAt(s)', sec)
                page.screenshot(path=os.path.join(args.stills, f'still_{sec}.png'))
        else:
            name = os.path.splitext(os.path.basename(args.match))[0]
            out = args.out or os.path.join(ROOT, 'reels', f'{name}.mp4')
            os.makedirs(os.path.dirname(out), exist_ok=True)
            enc = subprocess.Popen([
                imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg',
                '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
            for n in range(SECONDS * FPS):
                page.evaluate('s => renderAt(s)', n / FPS)
                enc.stdin.write(page.screenshot(type='jpeg', quality=95))
                if n % 60 == 0:
                    print(f'{n / FPS:.0f}s', flush=True)
            enc.stdin.close()
            enc.wait()
            print(out, os.path.getsize(out) // 1024, 'KB')
        if errors:
            print('page errors:', errors[:3])
        browser.close()
    server.shutdown()


if __name__ == '__main__':
    main()
