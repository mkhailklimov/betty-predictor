"""Cut the player out of a team card: python scripts/reels/make_cutout.py ENG CRO"""
import os
import sys

from PIL import Image
from rembg import remove

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
for code in sys.argv[1:]:
    src = Image.open(os.path.join(ROOT, 'frontend', 'public', 'teams', 'Cards', f'{code}.png')).convert('RGB')
    remove(src).save(os.path.join(os.path.dirname(__file__), 'cutouts', f'{code}.png'), optimize=True)
    print(code, 'done')
