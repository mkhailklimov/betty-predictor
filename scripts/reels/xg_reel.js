// Betty xG reel: every frame is a pure function of time (renderAt), so the video renders frame by frame.
let D, T = [], LEN = 0;
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const clamp = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const prog = (t, a, b) => ease((t - a) / (b - a));
const fx = (v, n = 2) => v.toFixed(n);
const sign = (v) => (v > 0 ? '+' : v < 0 ? '−' : '±') + Math.abs(v).toFixed(2);
const FADE = 0.35;

function scene(start, dur, build) {
  const root = el('div', 'scene');
  $('#scenes').appendChild(root);
  const s = { start, end: start + dur, root, anim: () => {} };
  build(s, root);
  T.push(s);
  return start + dur;
}

function crestImg(code) { const i = el('img', 'crest'); i.src = `/frontend/public/avatars/clubs/${code}.png`; return i; }

function playerScene(t0, team, p, i) {
  return scene(t0, 3.0, (s, r) => {
    const glow = el('div', 'p-glow'); r.appendChild(glow);
    const conf = confetti(r, team, i);
    const mini = el('div', 'p-mini'); mini.appendChild(crestImg(team.crest)); r.appendChild(mini);
    r.appendChild(el('div', 'p-count', `${team.short} TOP ${i + 1}/3`));
    // the owner's avatar when there is one, else the big shirt number
    const av = el('div', 'p-av'); const img = el('img'); img.src = `/scripts/reels/players/${p.avatar}`; av.appendChild(img);
    const num = el('div', 'p-num', p.number || ''); num.style.display = 'none';
    img.onerror = () => { av.style.display = 'none'; num.style.display = ''; };
    r.append(av, num);
    r.appendChild(el('div', 'p-name', p.name));
    r.appendChild(el('div', 'p-meta', `This season: ${p.goals} goal${p.goals === 1 ? '' : 's'}, ${p.shots} shots in ${p.apps} games`));
    r.appendChild(el('div', 'p-xg-l', 'xG IN THIS MATCH'));
    const v = el('div', 'p-xg'); v.style.color = '#ffd90f'; r.appendChild(v);
    const b = el('div', 'p-bar'); const f = el('i'); f.style.background = 'linear-gradient(90deg, #2f8a35, #ffd90f)'; b.appendChild(f); r.appendChild(b);
    const name = r.querySelector('.p-name');
    s.anim = (t) => {
      const k = prog(t, t0 + 0.3, t0 + 1.5);
      v.textContent = fx(p.xg * k);
      f.style.width = `${Math.min(100, p.xg / 0.8 * 100) * k}%`;
      const n = prog(t, t0, t0 + 0.5);
      name.style.transform = `translateY(${(1 - n) * 60}px)`; name.style.opacity = n;
      // celebration: pop in with an overshoot, then jump and sway
      const dt = t - t0;
      const pop = dt < 0.45 ? 0.55 + 0.6 * Math.sin(clamp(dt / 0.45) * Math.PI * 0.62) : 1;
      const live = clamp((dt - 0.35) / 0.3);
      const jump = -Math.abs(Math.sin(dt * Math.PI * 2.4)) * 34 * live;
      const sway = Math.sin(dt * Math.PI * 1.7 + i) * 5 * live;
      const squash = 1 + Math.sin(dt * Math.PI * 4.8) * 0.025 * live;
      av.style.transform = `translateX(-50%) translateY(${jump}px) rotate(${sway}deg) scale(${pop * squash}, ${pop / squash})`;
      glow.style.opacity = 0.55 + 0.35 * Math.sin(dt * Math.PI * 2.4) * live;
      glow.style.transform = `translateX(-50%) scale(${0.9 + 0.15 * Math.abs(Math.sin(dt * Math.PI * 1.2))})`;
      conf(t - t0);
    };
  });
}

// Confetti for a player's celebration: same pieces every render (seeded), falling and spinning.
function confetti(root, team, seed) {
  let x = 1234567 + seed * 7919;
  const rnd = () => ((x = (x * 16807) % 2147483647) / 2147483647);
  const cols = ['#ffd90f', '#ecf39e', '#2f8a35', '#ffffff', team.color[0], team.color[1]];
  const box = el('div', 'p-conf'); root.appendChild(box);
  const bits = Array.from({ length: 46 }, () => {
    const b = el('i'); b.style.background = cols[Math.floor(rnd() * cols.length)];
    b.style.width = `${10 + rnd() * 14}px`; b.style.height = `${18 + rnd() * 18}px`;
    box.appendChild(b);
    return { b, x0: rnd() * 1080, vy: 420 + rnd() * 520, drift: (rnd() - 0.5) * 220, spin: (rnd() - 0.5) * 900, delay: 0.25 + rnd() * 0.6, y0: -60 - rnd() * 300 };
  });
  return (dt) => {
    for (const c of bits) {
      const u = dt - c.delay;
      c.b.style.opacity = u > 0 ? Math.min(1, u * 4) * clamp((2.9 - dt) / 0.4) : 0;
      c.b.style.transform = `translate(${c.x0 + c.drift * Math.sin(u * 2)}px, ${c.y0 + c.vy * Math.max(0, u)}px) rotate(${c.spin * u}deg)`;
    }
  };
}

// Pitch positions: formation "4-2-3-1" -> lines from the back, players left to right.
function pitchSpots(formation) {
  const lines = formation.split('-').map(Number);
  const H = 1120, W = 980, ys = [];
  const gkY = H - 150, topY = 120, step = (gkY - topY) / lines.length;
  const spots = [{ x: W / 2, y: gkY }];
  lines.forEach((n, li) => {
    const y = gkY - step * (li + 1) + 20;
    for (let k = 0; k < n; k++) spots.push({ x: W * (k + 1) / (n + 1), y });
  });
  return spots;
}

function elevenScene(t0, team, other, carry) {
  const step = 0.42, first = t0 + 0.8 + (carry ? 0.8 : 0);
  // players add up from the smallest xG to the biggest; the keeper comes last
  const order = team.players.map((p, i) => i).sort((a, b) => team.players[a].xg - team.players[b].xg);
  const gkAt = first + order.length * step + 0.3;
  const dur = gkAt - t0 + 2.0;
  return scene(t0, dur, (s, r) => {
    const h = el('div', 'x-head'); const c = el('div', 'c'); c.appendChild(crestImg(team.crest)); h.appendChild(c);
    h.appendChild(el('div', '', `<div class="t">${team.name}</div><div class="s">LIKELY XI &middot; ${team.formation} &middot; xG EACH</div>`));
    r.appendChild(h);
    const pitch = el('div', 'pitch'); r.appendChild(pitch);
    // lines of our half: halfway line at the top, centre circle, box and six-yard box at the bottom
    const ln = (css) => { const d = el('div', 'ln'); Object.assign(d.style, css); pitch.appendChild(d); };
    ln({ left: '-4px', right: '-4px', top: '-3px', height: '0', borderWidth: '3px 0 0 0' });
    ln({ left: '370px', top: '-120px', width: '240px', height: '240px', borderRadius: '50%' });
    ln({ left: '200px', bottom: '-3px', width: '580px', height: '250px' });
    ln({ left: '370px', bottom: '-3px', width: '240px', height: '90px' });
    const spots = pitchSpots(team.formation);
    const mk = (p, spot, gk) => {
      const d = el('div', 'pl' + (gk ? ' gk' : ''));
      d.style.left = `${spot.x}px`; d.style.top = `${spot.y - 46}px`;
      const short = p.name.split(' ').slice(-1)[0];
      d.innerHTML = `<div class="dot" style="background:${gk ? '#ffd90f' : team.color[0]};color:${gk ? '#050a05' : team.color[1]}">${p.number}</div>` +
        `<div class="nm">${short}</div><div class="xg">${gk ? `${sign(p.effect)} to ${other.short}` : fx(p.xg)}</div>`;
      pitch.appendChild(d);
      return d;
    };
    const gkEl = mk({ ...team.gk }, spots[0], true);
    const els = team.players.map((p, i) => mk(p, spots[i + 1], false));
    const carryEl = el('div', 'x-carry', carry ? `${sign(carry)} from the ${other.short} keeper` : ''); r.appendChild(carryEl);
    const tot = el('div', 'x-total');
    tot.innerHTML = `<div class="l">${team.name} xG<small>${carry ? 'attack + the other keeper' : 'attack, before the other keeper'}</small></div><div class="v"></div>`;
    r.appendChild(tot);
    const tv = tot.querySelector('.v');
    s.anim = (t) => {
      const appear = prog(t, t0 + 0.2, t0 + 0.7);
      [gkEl, ...els].forEach((e) => { e.style.opacity = appear; });
      let sum = 0;
      if (carry) { const k = prog(t, t0 + 0.6, t0 + 1.1); carryEl.style.opacity = k; sum += carry * k; }
      order.forEach((idx, n) => {
        const at = first + n * step, k = prog(t, at, at + 0.35);
        const chip = els[idx].querySelector('.xg'); chip.style.opacity = k;
        els[idx].querySelector('.dot').style.transform = `scale(${1 + 0.25 * Math.sin(Math.PI * clamp((t - at) / 0.4))})`;
        sum += team.players[idx].xg * k;
      });
      const g = prog(t, gkAt, gkAt + 0.4);
      gkEl.querySelector('.xg').style.opacity = g;
      gkEl.querySelector('.dot').style.transform = `scale(${1 + 0.25 * Math.sin(Math.PI * clamp((t - gkAt) / 0.4))})`;
      tv.textContent = fx(Math.max(0, sum));
    };
  });
}

function totalsScene(t0) {
  return scene(t0, 4.6, (s, r) => {
    r.appendChild(el('div', 't-title', 'Expected goals'));
    const cols = el('div', 't-cols'); r.appendChild(cols);
    const max = Math.max(D.home.total, D.away.total) * 1.15;
    const mk = (team, other) => {
      const c = el('div', 't-col');
      const v = el('div', 'val'); v.style.color = team.color[1];
      const b = el('div', 'bar'); b.style.background = `linear-gradient(180deg, ${team.color[1]}, ${team.color[0]})`;
      const cr = el('div', 'c'); cr.appendChild(crestImg(team.crest));
      const attack = team.total - other.gk.effect;
      const nt = el('div', 'nt', `attack ${fx(attack)}<br>${other.short} keeper ${sign(other.gk.effect)}`);
      c.append(v, b, cr, nt); cols.appendChild(c);
      return { v, b, total: team.total };
    };
    const a = mk(D.home, D.away), b = mk(D.away, D.home);
    const fc = el('div', 't-fc', `<div class="l">BETTY FORECAST</div><div class="s">${D.forecast[0]} : ${D.forecast[1]}</div>`);
    r.appendChild(fc);
    r.appendChild(el('div', 't-src', 'Betty model: season shots and goals (ESPN), keepers’ save rates, bookmaker odds'));
    s.anim = (t) => {
      const k = prog(t, t0 + 0.3, t0 + 1.8);
      for (const c of [a, b]) { c.b.style.height = `${c.total / max * 460 * k}px`; c.v.textContent = fx(c.total * k, 1); }
      const f = prog(t, t0 + 2.0, t0 + 2.6);
      fc.style.opacity = f; fc.style.transform = `scale(${0.8 + 0.2 * f})`;
    };
  });
}

function outcomeScene(t0) {
  return scene(t0, 4.4, (s, r) => {
    r.appendChild(el('div', 'o-title', 'Who wins?'));
    const cols = el('div', 'o-cols'); r.appendChild(cols);
    const spec = [[`${D.home.name}<br>win`, D.pct[0], D.home.color], ['Draw', D.pct[1], ['#2f8a35', '#d9e6c8']], [`${D.away.name}<br>win`, D.pct[2], D.away.color]];
    const max = Math.max(...D.pct) * 1.1;
    const bars = spec.map(([lb, p, col], i) => {
      const c = el('div', 'o-col');
      const v = el('div', 'val'); v.style.color = col[1];
      const b = el('div', 'bar'); b.style.background = `linear-gradient(180deg, ${col[1]}, ${col[0]})`;
      c.append(v, b, el('div', 'lb', lb)); cols.appendChild(c);
      return { v, b, p, i };
    });
    r.appendChild(el('div', 'o-src', 'Chances from bookmaker odds, margin removed'));
    s.anim = (t) => {
      for (const x of bars) {
        const k = prog(t, t0 + 0.3 + x.i * 0.3, t0 + 1.6 + x.i * 0.3);
        x.b.style.height = `${x.p / max * 640 * k}px`; x.v.textContent = `${Math.round(x.p * k)}%`;
      }
    };
  });
}

async function init(data) {
  D = data;
  const st = $('#stage');
    $('#comp').textContent = D.competition; $('#when').textContent = D.kickoff_label;
  let t = 0;
  t = scene(0, 3.2, (s, r) => {
    const cr = el('div', 'intro-crests');
    const h = el('div', 'c'); h.appendChild(crestImg(D.home.crest));
    const a = el('div', 'c'); a.appendChild(crestImg(D.away.crest));
    cr.append(h, el('div', 'intro-vs', 'v'), a); r.appendChild(cr);
    r.appendChild(el('div', 'intro-names', `${D.home.name}<span class="v">VS</span>${D.away.name}`));
    r.appendChild(el('div', 'intro-q', 'Who brings the goals tonight? Player by player.'));
    s.anim = (tt) => {
      const k = prog(tt, 0.1, 0.9);
      h.style.transform = `translateX(${(1 - k) * -500}px)`; a.style.transform = `translateX(${(1 - k) * 500}px)`;
    };
  });
  D.home.top.forEach((p, i) => { t = playerScene(t, D.home, p, i); });
  t = elevenScene(t, D.home, D.away, 0);
  D.away.top.forEach((p, i) => { t = playerScene(t, D.away, p, i); });
  t = elevenScene(t, D.away, D.home, D.home.gk.effect);
  t = totalsScene(t);
  t = outcomeScene(t);
  t = scene(t, 3.4, (s, r) => {
    const cr = el('div', 'cta-crests');
    const h = el('div', 'c'); h.appendChild(crestImg(D.home.crest));
    const a = el('div', 'c'); a.appendChild(crestImg(D.away.crest));
    cr.append(h, a); r.appendChild(cr);
    r.appendChild(el('div', 'cta-q', 'Your exact score?'));
    r.appendChild(el('div', 'cta-s', 'Predict it in Betty Scores.<br>Weekly prizes in Telegram Stars.'));
    r.appendChild(el('div', 'cta-b', '@bettyscores_bot'));
  });
  LEN = t;
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((ok) => { i.onload = i.onerror = ok; }))));
  return LEN;
}

function renderAt(t) {
  for (const s of T) {
    const vis = t >= s.start - 0.01 && t < s.end + 0.01;
    const op = Math.min(clamp((t - s.start) / FADE + (s.start === 0 ? 1 : 0)), clamp((s.end - t) / FADE + (s.end >= LEN ? 1 : 0)));
    s.root.style.opacity = vis ? op : 0;
    s.root.style.display = vis ? 'block' : 'none';
    if (vis) s.anim(t);
  }
}
