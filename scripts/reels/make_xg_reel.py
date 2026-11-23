"""Vertical xG reel (1080x1920, 30 fps) for one match.

    python scripts/reels/xg_data.py scripts/reels/matches/GAL_AVL.json        # numbers -> GAL_AVL.data.json
    python scripts/reels/make_xg_reel.py scripts/reels/matches/GAL_AVL.data.json --stills <dir>
    python scripts/reels/make_xg_reel.py scripts/reels/matches/GAL_AVL.data.json  # -> reels/GAL_AVL_xg.mp4

Scenes: intro, top 3 players of each side, each side's eleven adding up (the keeper's
effect goes to the other side), expected goals with the Betty forecast, win/draw/win.
"""
import argparse
import functools
import http.server
import json
import os
import subprocess
import threading

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
W, H, FPS = 1080, 1920, 30


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('data')
    ap.add_argument('--out')
    ap.add_argument('--stills')
    ap.add_argument('--at', default='1.5,4.5,13.5,18,21,31.5,37,41,45')
    args = ap.parse_args()
    with open(args.data, encoding='utf-8') as f:
        data = json.load(f)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_address[1]}'
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        page = browser.new_page(viewport={'width': W, 'height': H})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'{base}/scripts/reels/xg_reel.html')
        length = page.evaluate('d => init(d)', data)
        if errors:
            raise SystemExit(errors[0])
        print(f'length {length:.1f} s')
        if args.stills:
            os.makedirs(args.stills, exist_ok=True)
            for sec in [float(x) for x in args.at.split(',') if float(x) < length]:
                page.evaluate('s => renderAt(s)', sec)
                page.screenshot(path=os.path.join(args.stills, f'still_{sec:05.1f}.png'))
        else:
            name = os.path.basename(args.data).replace('.data.json', '')
            out = args.out or os.path.join(ROOT, 'reels', f'{name}_xg.mp4')
            os.makedirs(os.path.dirname(out), exist_ok=True)
            enc = subprocess.Popen([
                imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg',
                '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
            frames = int(length * FPS) + FPS // 2
            for n in range(frames):
                page.evaluate('s => renderAt(s)', n / FPS)
                enc.stdin.write(page.screenshot(type='jpeg', quality=92))
                if n % 150 == 0:
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
