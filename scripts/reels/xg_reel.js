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
  return scene(t0, 2.4, (s, r) => {
    const c = el('div', 'p-crest'); c.appendChild(crestImg(team.crest)); r.appendChild(c);
    r.appendChild(el('div', 'p-count', `${team.short} TOP ${i + 1}/3`));
    r.appendChild(el('div', 'p-num', p.number || ''));
    r.appendChild(el('div', 'p-name', p.name));
    r.appendChild(el('div', 'p-meta', `This season: ${p.goals} goal${p.goals === 1 ? '' : 's'}, ${p.shots} shots in ${p.apps} games`));
    r.appendChild(el('div', 'p-xg-l', 'xG IN THIS MATCH'));
    const v = el('div', 'p-xg'); v.style.color = team.color[1]; r.appendChild(v);
    const b = el('div', 'p-bar'); const f = el('i'); f.style.background = `linear-gradient(90deg, ${team.color[0]}, ${team.color[1]})`; b.appendChild(f); r.appendChild(b);
    const name = r.querySelector('.p-name');
    s.anim = (t) => {
      const k = prog(t, t0 + 0.25, t0 + 1.4);
      v.textContent = fx(p.xg * k);
      f.style.width = `${Math.min(100, p.xg / 0.8 * 100) * k}%`;
      const n = prog(t, t0, t0 + 0.5);
      name.style.transform = `translateY(${(1 - n) * 60}px)`; name.style.opacity = n;
    };
  });
}

function elevenScene(t0, team, other, carry) {
  // 10 outfield players add up, then the keeper's effect goes to the other side.
  const rows = [...team.players].sort((a, b) => a.xg - b.xg);
  const step = 0.42, first = t0 + 0.7 + (carry ? 0.8 : 0);
  const gkAt = first + rows.length * step + 0.3;
  const dur = gkAt - t0 + 1.9;
  return scene(t0, dur, (s, r) => {
    const h = el('div', 'x-head'); const c = el('div', 'c'); c.appendChild(crestImg(team.crest)); h.appendChild(c);
    h.appendChild(el('div', '', `<div class="t">${team.name}</div><div class="s">LIKELY STARTING XI &middot; xG EACH</div>`));
    r.appendChild(h);
    const list = el('div', 'x-rows'); r.appendChild(list);
    const items = [];
    if (carry) {
      const cr = el('div', 'x-row carry');
      cr.innerHTML = `<div class="nm">From the ${other.name} keeper</div><div class="v" style="width:200px;color:#ecf39e">${sign(carry)}</div>`;
      list.appendChild(cr); items.push({ e: cr, at: t0 + 0.6 });
    }
    rows.forEach((p, i) => {
      const row = el('div', 'x-row');
      row.innerHTML = `<div class="n" style="background:${team.color[1]}">${p.number}</div><div class="nm">${p.name}</div>` +
        `<div class="ps">${p.pos}</div><div class="bar"><i style="width:${Math.min(100, p.xg / 0.7 * 100)}%;background:${team.color[1]}"></i></div><div class="v">${fx(p.xg)}</div>`;
      list.appendChild(row); items.push({ e: row, at: first + i * step, xg: p.xg });
    });
    const gk = el('div', 'x-row gk');
    gk.innerHTML = `<div class="n" style="background:#ecf39e">${team.gk.number}</div><div class="nm">${team.gk.name} &middot; GK, saves ${team.gk.save}%</div>` +
      `<div class="v">${sign(team.gk.effect)} to ${other.short}</div>`;
    list.appendChild(gk); items.push({ e: gk, at: gkAt });
    const tot = el('div', 'x-total');
    tot.innerHTML = `<div class="l">${team.name} xG<small>${carry ? 'attack + the other keeper' : 'attack, before the other keeper'}</small></div><div class="v" style="color:${team.color[1]}"></div>`;
    r.appendChild(tot);
    const tv = tot.querySelector('.v');
    s.anim = (t) => {
      let sum = carry && t >= t0 + 0.6 ? carry * prog(t, t0 + 0.6, t0 + 1.0) : 0;
      for (const it of items) {
        const k = prog(t, it.at, it.at + 0.35);
        it.e.style.opacity = k; it.e.style.transform = `translateX(${(1 - k) * -80}px)`;
        if (it.xg != null) sum += it.xg * prog(t, it.at + 0.1, it.at + 0.4);
      }
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
    const spec = [[`${D.home.name}<br>win`, D.pct[0], D.home.color], ['Draw', D.pct[1], ['#4b5675', '#c9d3ea']], [`${D.away.name}<br>win`, D.pct[2], D.away.color]];
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
  st.style.setProperty('--h1g', D.home.color[0] + '88');
  st.style.setProperty('--a1g', D.away.color[0] + '88');
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
