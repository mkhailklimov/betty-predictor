"""Vertical 1080x1920 prediction reel for one match.

    python scripts/reels/make_reel.py scripts/reels/matches/ENG_CRO.json
    python scripts/reels/make_reel.py <match.json> --stills <dir>   # a few PNGs instead of the video

Match file: names, card codes, bar styles, and either "odds": [home, draw, away]
(decimal, the bookmaker margin is removed) or "probs": [home, draw, away].
Expected goals and the most likely score are fitted from those three numbers with
a Poisson model, so the bars always agree with each other. "sample": true stamps
the video so it can't be posted by accident. Optional "game_screen": a screenshot
used for the last scene instead of the drawn card.
"""
import argparse
import json
import math
import os
import subprocess

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CARDS = os.path.join(ROOT, 'frontend', 'public', 'teams', 'Cards')
FONTS = r'C:\Windows\Fonts'

W, H, FPS = 1080, 1920, 30
# Scene start times in seconds; the reel ends at the last one.
T_INTRO, T_GOALS, T_RESULT, T_SCORE, T_CARD, T_END = 0, 2.4, 5.8, 9.2, 11.6, 15.0
FADE = 0.2

BG = (19, 42, 19)
CARD_BG = (49, 87, 44)
LIME = (236, 243, 158)
WHITE = (250, 249, 246)
GOLD = (255, 217, 15)
RED = (206, 17, 38)
MUTED = (144, 169, 85)


def font(size, name='ariblk.ttf'):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


F_TITLE = font(84)
F_HEAD = font(68)
F_NUM = font(76)
F_NAME = font(40)
F_BODY = font(38, 'arialbd.ttf')
F_SMALL = font(28, 'arialbd.ttf')
F_CARD = font(44)
F_REEL = font(110)


def ease(t):
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def pop(t):
    t = max(0.0, min(1.0, t))
    return 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2


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
            'score': (int(i), int(j)), 'score_pct': round(float(grid[i, j]) * 100)}


def read_probs(match):
    if 'odds' in match:
        raw = [1 / o for o in match['odds']]
    else:
        raw = match['probs']
    total = sum(raw)
    return [r / total * 100 for r in raw]


def rounded(img, radius):
    mask = Image.new('L', (img.width * 2, img.height * 2), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, mask.width - 1, mask.height - 1), radius * 2, fill=255)
    out = img.convert('RGBA')
    out.putalpha(mask.resize(img.size, Image.LANCZOS))
    return out


def team_card(code, size, radius=28):
    img = Image.open(os.path.join(CARDS, f'{code}.png')).convert('RGB').resize((size, size), Image.LANCZOS)
    return rounded(img, radius)


def bar_fill(style, w, h):
    """Full-height bar picture; the rising bar shows its bottom part."""
    img = Image.new('RGB', (w, h), MUTED)
    d = ImageDraw.Draw(img)
    if style == 'england':
        d.rectangle((0, 0, w, h), fill=WHITE)
        d.rectangle((w // 2 - 16, 0, w // 2 + 16, h), fill=RED)
    elif style == 'croatia':
        size = w // 5
        for y in range(0, h, size):
            for x in range(0, w, size):
                on = (x // size + y // size) % 2 == 0
                d.rectangle((x, y, x + size, y + size), fill=RED if on else WHITE)
    return img


class Reel:
    def __init__(self, match):
        self.m = match
        self.probs = read_probs(match)
        self.model = fit_model(self.probs)
        self.home_big = team_card(match['home_card'], 400)
        self.away_big = team_card(match['away_card'], 400)
        self.home_small = team_card(match['home_card'], 150, 20)
        self.away_small = team_card(match['away_card'], 150, 20)
        self.home_mid = team_card(match['home_card'], 300, 22)
        self.away_mid = team_card(match['away_card'], 300, 22)
        self.fills = {}
        self.screen = None
        if match.get('game_screen'):
            shot = Image.open(match['game_screen']).convert('RGB')
            ratio = 860 / shot.width
            self.screen = rounded(shot.resize((860, int(shot.height * ratio)), Image.LANCZOS), 40)

    def bar(self, img, cx, base, w, full, style, t):
        full = max(int(full), 2)
        key = (style, w, full)
        if key not in self.fills:
            self.fills[key] = bar_fill(style, w, full)
        h = max(2, int(full * ease(t)))
        part = rounded(self.fills[key].crop((0, full - h, w, full)), min(18, h // 2))
        img.paste(part, (cx - w // 2, base - h), part)
        return base - h

    def footer(self, d):
        d.text((W / 2, 1490), 'Based on market data. Not a guarantee.', font=F_SMALL, fill=MUTED, anchor='mm')

    def intro(self, img, d, t):
        s = ease(t / 0.6)
        img.paste(self.home_big, (int(-420 + 540 * s), 560), self.home_big)
        img.paste(self.away_big, (int(W + 20 - 460 * s), 560), self.away_big)
        d.text((W / 2, 340), self.m['home'].upper(), font=F_TITLE, fill=WHITE, anchor='mm')
        d.text((W / 2, 440), f"vs {self.m['away'].upper()}", font=F_TITLE, fill=WHITE, anchor='mm')
        if t > 0.5:
            d.text((W / 2, 1060), 'What does the data say?', font=F_CARD, fill=GOLD, anchor='mm')
        d.text((W / 2, 1140), f"{self.m['competition']}, {self.m['kickoff']}", font=F_BODY, fill=LIME, anchor='mm')

    def goals(self, img, d, t):
        d.text((W / 2, 300), 'EXPECTED GOALS', font=F_HEAD, fill=LIME, anchor='mm')
        base, top = 1180, 660
        scale = top / max(self.model['home_goals'], self.model['away_goals'])
        sides = [(320, self.model['home_goals'], self.m['home_style'], self.home_small, self.m['home']),
                 (760, self.model['away_goals'], self.m['away_style'], self.away_small, self.m['away'])]
        for k, (cx, val, style, card, name) in enumerate(sides):
            p = (t - 0.2 - k * 0.15) / 1.5
            y = self.bar(img, cx, base, 220, val * scale, style, p)
            d.text((cx, y - 55), f'{val * ease(p):.1f}', font=F_NUM, fill=WHITE, anchor='mm')
            img.paste(card, (cx - 75, base + 25), card)
            d.text((cx, base + 215), name, font=F_NAME, fill=WHITE, anchor='mm')
        self.footer(d)

    def result(self, img, d, t):
        d.text((W / 2, 300), 'WHO WINS?', font=F_HEAD, fill=LIME, anchor='mm')
        base, top = 1180, 660
        scale = top / max(self.probs)
        sides = [(220, self.probs[0], self.m['home_style'], self.home_small, self.m['home']),
                 (540, self.probs[1], 'draw', None, 'Draw'),
                 (860, self.probs[2], self.m['away_style'], self.away_small, self.m['away'])]
        for k, (cx, val, style, card, name) in enumerate(sides):
            p = (t - 0.2 - k * 0.15) / 1.5
            y = self.bar(img, cx, base, 220, val * scale, style, p)
            d.text((cx, y - 55), f'{round(val * ease(p))}%', font=F_NUM, fill=WHITE, anchor='mm')
            if card:
                img.paste(card, (cx - 75, base + 25), card)
            else:
                d.text((cx, base + 100), 'X', font=F_TITLE, fill=MUTED, anchor='mm')
            d.text((cx, base + 215), name, font=F_NAME, fill=WHITE, anchor='mm')
        self.footer(d)

    def score(self, img, d, t):
        d.text((W / 2, 420), 'MOST LIKELY SCORE', font=F_HEAD, fill=LIME, anchor='mm')
        g = self.model['score']
        size = max(10, int(250 * pop(t / 0.45)))
        d.text((W / 2, 780), f'{g[0]}:{g[1]}', font=font(size), fill=GOLD, anchor='mm')
        if t > 0.6:
            d.text((W / 2, 1090), f"Only a {self.model['score_pct']}% chance", font=F_CARD, fill=WHITE, anchor='mm')
        if t > 1.2:
            d.text((W / 2, 1180), 'Can you beat the data?', font=F_CARD, fill=LIME, anchor='mm')
        self.footer(d)

    def game_card(self, img, d, t):
        top = 230 + int(180 * (1 - ease(t / 0.5)))
        if self.screen:
            img.paste(self.screen, (110, top), self.screen)
            bottom = top + self.screen.height
        else:
            bottom = top + 960
            d.rounded_rectangle((90, top, 990, bottom), 44, fill=CARD_BG)
            d.rounded_rectangle((830, top + 28, 960, top + 84), 16, fill=(90, 124, 62))
            d.text((895, top + 56), '3 pts', font=F_SMALL, fill=LIME, anchor='mm')
            d.text((W / 2, top + 75), f"{self.m['home']} vs {self.m['away']}", font=F_CARD, fill=LIME, anchor='mm')
            d.text((W / 2, top + 135), f"Kick-off {self.m['kickoff']}", font=F_SMALL, fill=MUTED, anchor='mm')
            img.paste(self.home_mid, (225, top + 180), self.home_mid)
            img.paste(self.away_mid, (555, top + 180), self.away_mid)
            d.text((W / 2, top + 545), 'Predict the exact score!', font=F_CARD, fill=WHITE, anchor='mm')
            wob = 8 * math.sin(t * 5)
            for cx in (340, 740):
                d.rounded_rectangle((cx - 95, top + 620, cx + 95, top + 810), 30,
                                    fill=(38, 68, 34), outline=MUTED, width=4)
                d.text((cx, top + 715 + wob), '?', font=F_REEL, fill=LIME, anchor='mm')
            d.text((W / 2, top + 715), ':', font=F_REEL, fill=LIME, anchor='mm')
            d.text((W / 2, top + 880), 'Exact score 3 points, right result 1 point', font=F_SMALL, fill=LIME, anchor='mm')
        if t > 0.7:
            d.text((W / 2, bottom + 75), "What's your score?", font=F_HEAD, fill=GOLD, anchor='mm')
            d.text((W / 2, bottom + 170), 'app.bettyscores.com', font=F_CARD, fill=WHITE, anchor='mm')
            d.text((W / 2, bottom + 235), 'Free to play. Top two win Telegram Stars.', font=F_SMALL, fill=LIME, anchor='mm')

    def frame(self, sec):
        scenes = [(T_INTRO, T_GOALS, self.intro), (T_GOALS, T_RESULT, self.goals),
                  (T_RESULT, T_SCORE, self.result), (T_SCORE, T_CARD, self.score), (T_CARD, T_END, self.game_card)]
        for start, end, draw in scenes:
            if start <= sec < end:
                break
        img = Image.new('RGB', (W, H), BG)
        d = ImageDraw.Draw(img)
        draw(img, d, sec - start)
        # Scenes are laid out high; move them clear of the banner, above the app's bottom buttons.
        img = ImageChops.offset(img, 0, 70)
        d = ImageDraw.Draw(img)
        if self.m.get('sample'):
            d.rectangle((0, 130, W, 200), fill=RED)
            d.text((W / 2, 165), 'SAMPLE NUMBERS - NOT FOR POSTING', font=F_SMALL, fill=WHITE, anchor='mm')
        fade_in = 1.0 if start == 0 else (sec - start) / FADE
        fade_out = 1.0 if end == T_END else (end - sec) / FADE
        alpha = min(1.0, fade_in, fade_out)
        if alpha < 1.0:
            img = Image.blend(Image.new('RGB', (W, H), BG), img, max(0.0, alpha))
        return img


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('match')
    ap.add_argument('--out')
    ap.add_argument('--stills')
    args = ap.parse_args()
    with open(args.match, encoding='utf-8') as f:
        match = json.load(f)
    reel = Reel(match)
    m = reel.model
    print(f"{match['home']} {m['home_goals']:.2f} : {m['away_goals']:.2f} {match['away']} | "
          f"{' / '.join(f'{p:.0f}%' for p in reel.probs)} | most likely {m['score'][0]}:{m['score'][1]} ({m['score_pct']}%)")
    if args.stills:
        os.makedirs(args.stills, exist_ok=True)
        for sec in (1.5, 4.5, 7.8, 10.2, 13.0):
            reel.frame(sec).save(os.path.join(args.stills, f'still_{sec}.png'))
        return
    base = os.path.splitext(os.path.basename(args.match))[0]
    out = args.out or os.path.join(ROOT, 'reels', f'{base}.mp4')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
           '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
    enc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for n in range(int(T_END * FPS)):
        enc.stdin.write(reel.frame(n / FPS).tobytes())
    enc.stdin.close()
    enc.wait()
    print(out, os.path.getsize(out) // 1024, 'KB')


if __name__ == '__main__':
    main()
