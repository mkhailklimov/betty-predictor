"""Data for the xG reel of one match (Betty xG forecast).

    python scripts/reels/xg_data.py scripts/reels/matches/GAL_AVL.json

Match file: ESPN event id, both teams (ESPN team id + league for the squad stats,
our crest code), decimal odds [home, draw, away], the eleven of each side
(names as ESPN writes them, goalkeeper first) and the "star" each side must show
in its top three (owner's pick, e.g. Batrakov). Writes <match>.data.json next to it.

How the numbers are made (simple and explainable):
- Team totals: the expected goals whose Poisson win/draw/loss chances match the
  bookmaker odds (margin removed). So the bars always agree with the odds.
- Keeper effect: an opposing keeper with a save rate above an average keeper (70%)
  takes goals off, below it adds goals: (0.70 - save rate) x team total, kept within 0.15.
- Players: each outfield player's share of the rest comes from his season shots per game
  (on target 0.30, off target 0.06) plus a bit of his goals per game (0.3 x goals).
"""
import json
import math
import os
import sys
import unicodedata
import urllib.request

import numpy as np

AVG_SAVE = 0.70


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFKD', s) if not unicodedata.combining(c)).lower().replace('ı', 'i')


def squad(league, team_id):
    url = f'https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/teams/{team_id}/roster'
    with urllib.request.urlopen(url, timeout=20) as r:
        d = json.load(r)
    out = {}
    for p in d.get('athletes', []):
        st = {}
        for c in (p.get('statistics') or {}).get('splits', {}).get('categories', []):
            for s in c.get('stats', []):
                st[s['name']] = s.get('value') or 0
        out[fold(p['displayName'])] = {
            'name': p['displayName'], 'number': p.get('jersey') or '',
            'pos': (p.get('position') or {}).get('abbreviation', ''), 'stats': st}
    return out


def fit_model(probs):
    total = sum(probs)
    tw, td = probs[0] / total, probs[1] / total
    goals = np.arange(0, 13)
    fact = np.array([math.factorial(int(g)) for g in goals], dtype=float)
    pmf = lambda lam: np.exp(-lam) * lam ** goals / fact
    best = None
    for a in np.arange(0.2, 4.01, 0.01):
        pa = pmf(a)
        for b in np.arange(0.2, 4.01, 0.01):
            grid = np.outer(pa, pmf(b))
            w, dr = np.tril(grid, -1).sum(), np.trace(grid)
            err = (w - tw) ** 2 + (dr - td) ** 2
            if best is None or err < best[0]:
                best = (err, a, b)
    return float(best[1]), float(best[2])


def whole_percents(probs):
    out = [math.floor(p) for p in probs]
    order = sorted(range(len(probs)), key=lambda i: probs[i] - out[i], reverse=True)
    for i in order[:100 - sum(out)]:
        out[i] += 1
    return out


def side(team, sq):
    players = []
    for name in team['eleven']:
        p = sq.get(fold(name))
        if not p:
            raise SystemExit(f"{name}: not in the {team['name']} squad at ESPN")
        players.append(p)
    gk, outfield = players[0], players[1:]
    st = gk['stats']
    faced = st.get('saves', 0) + st.get('goalsConceded', 0)
    save = st.get('saves', 0) / faced if faced else AVG_SAVE
    raw = []
    for p in outfield:
        s = p['stats']
        apps = max(s.get('appearances', 0), 1)
        on, shots, goals = s.get('shotsOnTarget', 0), s.get('totalShots', 0), s.get('totalGoals', 0)
        raw.append((0.30 * on + 0.06 * (shots - on) + 0.3 * goals) / apps + 0.005)
    return gk, save, outfield, raw


def main():
    path = sys.argv[1]
    with open(path, encoding='utf-8') as f:
        m = json.load(f)
    raw_probs = [1 / o for o in m['odds']]
    probs = [r / sum(raw_probs) * 100 for r in raw_probs]
    t_home, t_away = fit_model(probs)
    h, a = m['home'], m['away']
    h_gk, h_save, h_out, h_raw = side(h, squad(h['league'], h['espn_id']))
    a_gk, a_save, a_out, a_raw = side(a, squad(a['league'], a['espn_id']))
    # keeper effects: the home keeper changes the away total and the other way round
    clip = lambda x: max(-0.15, min(0.15, x))
    h_gk_eff = round(clip((AVG_SAVE - h_save) * t_away), 2)
    a_gk_eff = round(clip((AVG_SAVE - a_save) * t_home), 2)

    def players(out, raw, total, star):
        scale = total / sum(raw)
        rows = [{'name': p['name'], 'number': p['number'], 'pos': p['pos'],
                 'xg': round(r * scale, 2), 'goals': int(p['stats'].get('totalGoals', 0)),
                 'shots': int(p['stats'].get('totalShots', 0)), 'apps': int(p['stats'].get('appearances', 0))}
                for p, r in zip(out, raw)]
        # rounding: the last-but-biggest player takes the spare hundredths so the rows add up exactly
        diff = round(round(total, 2) - sum(r['xg'] for r in rows), 2)
        max(rows, key=lambda r: r['xg'])['xg'] = round(max(rows, key=lambda r: r['xg'])['xg'] + diff, 2)
        ranked = sorted(rows, key=lambda r: -r['xg'])
        top = [r for r in ranked if star and fold(star) in fold(r['name'])][:1]
        top += [r for r in ranked if r not in top][:3 - len(top)]
        top.sort(key=lambda r: r['xg'])   # build up to the biggest
        return rows, top

    h_rows, h_top = players(h_out, h_raw, t_home - a_gk_eff, h.get('star'))
    a_rows, a_top = players(a_out, a_raw, t_away - h_gk_eff, a.get('star'))
    pct = whole_percents(probs)
    data = {**{k: m[k] for k in ('competition', 'kickoff_label')},
            'home': {'name': h['name'], 'short': h['short'], 'crest': h['crest'], 'color': h['color'],
                     'players': h_rows, 'top': h_top,
                     'gk': {'name': h_gk['name'], 'number': h_gk['number'], 'save': round(h_save * 100), 'effect': h_gk_eff},
                     'total': round(t_home, 2)},
            'away': {'name': a['name'], 'short': a['short'], 'crest': a['crest'], 'color': a['color'],
                     'players': a_rows, 'top': a_top,
                     'gk': {'name': a_gk['name'], 'number': a_gk['number'], 'save': round(a_save * 100), 'effect': a_gk_eff},
                     'total': round(t_away, 2)},
            'forecast': [round(t_home), round(t_away)], 'pct': pct}
    out = os.path.splitext(path)[0] + '.data.json'
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    for k in ('home', 'away'):
        s = data[k]
        print(f"{s['name']}: total {s['total']} | keeper {s['gk']['name']} save {s['gk']['save']}% effect on the other side {s['gk']['effect']:+}")
        for r in sorted(s['players'], key=lambda r: -r['xg']):
            print(f"   {r['xg']:.2f}  {r['name']} ({r['pos']}, {r['goals']} goals, {r['shots']} shots, {r['apps']} games)")
        print('   top 3:', [r['name'] for r in s['top']])
    print('forecast', data['forecast'], 'win/draw/win %', pct)


if __name__ == '__main__':
    main()
