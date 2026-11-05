// 3D scenes for the data reel. make_reel.py calls init(data), then renderAt(seconds) per frame.
// Everything depends only on the time passed in, so a frame always renders the same.
const T = { goals: 2.4, result: 5.8, score: 9.2, card: 11.6, end: 15 };
const FADE = 0.22;
const $ = id => document.getElementById(id);
const ease = t => { t = Math.min(1, Math.max(0, t)); return 1 - Math.pow(1 - t, 3); };
const back = t => { t = Math.min(1, Math.max(0, t)); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

let D, renderer, scene, camera, bars3, bars2, introGroup, confetti, beams;

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function drawChecks(x, w, h, cols, rows, a, b, ox, oy) {
  const sx = w / cols, sy = h / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    x.fillStyle = (r + c) % 2 ? b : a;
    x.fillRect(ox + c * sx, oy + r * sy, sx + 1, sy + 1);
  }
}

// The flags are drawn, not loaded, so they stay sharp on a big cloth. Add a style per new team.
function flagTex(style) {
  return canvasTex(1024, 1024, (x, w, h) => {
    if (style === 'england') {
      x.fillStyle = '#f7f7f4'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#ce1126';
      x.fillRect(w * .41, 0, w * .18, h);
      x.fillRect(0, h * .42, w, h * .16);
    } else if (style === 'croatia') {
      ['#d4122b', '#f7f7f4', '#17479e'].forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * h / 3, w, h / 3 + 1); });
      const sw = w * .36, sh = h * .4, ox = (w - sw) / 2, oy = (h - sh) / 2;
      x.save();
      x.beginPath();
      x.moveTo(ox, oy);
      x.lineTo(ox + sw, oy);
      x.lineTo(ox + sw, oy + sh * .62);
      x.quadraticCurveTo(ox + sw, oy + sh * .9, ox + sw / 2, oy + sh);
      x.quadraticCurveTo(ox, oy + sh * .9, ox, oy + sh * .62);
      x.closePath();
      x.clip();
      drawChecks(x, sw, sh, 5, 6, '#d4122b', '#f7f7f4', ox, oy);
      x.restore();
    } else if (style === 'draw') {
      const g = x.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#f6e27a'); g.addColorStop(.5, '#d9a520'); g.addColorStop(1, '#f6e27a');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
    } else {
      x.fillStyle = '#90a955'; x.fillRect(0, 0, w, h);
    }
  });
}

function stadiumTex() {
  return canvasTex(1536, 2048, (x, w, h) => {
    const sky = x.createLinearGradient(0, 0, 0, h * .6);
    sky.addColorStop(0, '#040a1c'); sky.addColorStop(.7, '#0e2a48'); sky.addColorStop(1, '#1a4560');
    x.fillStyle = sky; x.fillRect(0, 0, w, h);
    const r = rng(77);
    // Roof line and stands, tier by tier, with the crowd as thousands of soft dots.
    x.fillStyle = '#050c16';
    x.beginPath(); x.moveTo(0, h * .13); x.quadraticCurveTo(w / 2, h * .2, w, h * .13); x.lineTo(w, 0); x.lineTo(0, 0); x.fill();
    const crowd = ['#ffffff', '#ce1126', '#f2d4b0', '#1b4b9b', '#d9d9d9', '#ff5a5a', '#8fb7ff', '#2a2f3a'];
    for (let i = 0; i < 60000; i++) {
      const px = r() * w, py = h * (.2 + r() * .42);
      const tier = Math.floor((py / h - .2) / .14);
      if ((py / h - .2) % .14 < .012) continue;
      x.globalAlpha = .22 + r() * .4 + tier * .03;
      x.fillStyle = crowd[Math.floor(r() * crowd.length)];
      x.beginPath(); x.arc(px, py, .9 + r() * 1.3 + tier * .28, 0, 7); x.fill();
    }
    x.globalAlpha = 1;
    // Soften the whole crowd once; blurring dot by dot takes minutes.
    x.filter = 'blur(1.6px)';
    x.drawImage(x.canvas, 0, 0);
    x.filter = 'none';
    // Glowing boards along the pitch.
    const led = x.createLinearGradient(0, 0, w, 0);
    led.addColorStop(0, '#0b5a44'); led.addColorStop(.5, '#2f9a63'); led.addColorStop(1, '#0b5a44');
    x.fillStyle = led; x.fillRect(0, h * .62, w, h * .035);
        // Below the boards is out of shot; keep it dark.
    x.fillStyle = '#0a2a16'; x.fillRect(0, h * .655, w, h);
    // Evening haze over the crowd.
    const haze = x.createRadialGradient(w / 2, h * .32, 30, w / 2, h * .32, w * .75);
    haze.addColorStop(0, 'rgba(150,200,255,.2)'); haze.addColorStop(1, 'rgba(120,180,255,0)');
    x.fillStyle = haze; x.fillRect(0, 0, w, h);
  });
}

function pitchTex() {
  return canvasTex(1024, 1024, (x, w, h) => {
    for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#1c6b2e' : '#237d37'; x.fillRect(0, i * h / 10, w, h / 10 + 1); }
    const r = rng(5);
    for (let i = 0; i < 16000; i++) {
      x.fillStyle = r() > .5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.05)';
      x.fillRect(r() * w, r() * h, 2, 5);
    }
  });
}

function glowTex(inner, outer) {
  return canvasTex(256, 256, (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, inner); g.addColorStop(.25, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, w);
  });
}

// A rounded column, rebuilt for its current height so the rounding never stretches.
function columnGeom(w, d, h) {
  const r = Math.min(w, d) * .14, x = w / 2 - r, z = d / 2 - r;
  const s = new THREE.Shape();
  s.moveTo(-x, -z - r);
  s.lineTo(x, -z - r); s.quadraticCurveTo(x + r, -z - r, x + r, -z);
  s.lineTo(x + r, z); s.quadraticCurveTo(x + r, z + r, x, z + r);
  s.lineTo(-x, z + r); s.quadraticCurveTo(-x - r, z + r, -x - r, z);
  s.lineTo(-x - r, -z); s.quadraticCurveTo(-x - r, -z - r, -x, -z - r);
  const bevel = Math.min(.09, h * .3);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(.01, h - bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: .03, bevelSegments: 4, curveSegments: 8,
  });
  g.rotateX(-Math.PI / 2);
  return g;
}

// The flag draped over a bar: the cloth wraps the front and rolls round the sides, with folds.
function makeDrape(style, w, d) {
  const geo = new THREE.PlaneGeometry(1, 1, 56, 70);
  const mat = new THREE.MeshStandardMaterial({ map: flagTex(style), roughness: .62, metalness: .05, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.update = (h, t, phase) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = geo.attributes.uv.getX(i), v = geo.attributes.uv.getY(i);
      // Across the bar: flat in the middle, wrapped back round both edges.
      const a = (u - .5) * 2, wrap = Math.abs(a) > .7 ? (Math.abs(a) - .7) / .3 : 0;
      const sign = Math.sign(a);
      const px = sign * (Math.min(Math.abs(a), .7) / .7) * (w / 2 + .06);
      const pz = d / 2 + .02 - wrap * wrap * d * .62;
      const fold = Math.sin(a * 7 + t * 1.6 + phase + v * 2.2) * .055 + Math.sin(a * 13 - t * 2.3 + v * 5) * .022;
      const flare = (1 - v) * .05;
      p.setXYZ(i, px, v * h, pz + (fold + flare) * (1 - wrap * .85) + .13);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  };
  return mesh;
}

function makeBar(style, w, d, x0) {
  const group = new THREE.Group();
  group.position.x = x0;
  const col = new THREE.Mesh(columnGeom(w, d, 1), new THREE.MeshStandardMaterial({ color: 0x1a2430, roughness: .32, metalness: .75 }));
  col.castShadow = true;
  group.add(col);
  const drape = makeDrape(style, w, d);
  group.add(drape);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex('rgba(255,235,150,.8)', 'rgba(255,200,60,.22)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.set(w * 2.3, w * 1.1, 1);
  glow.position.y = .05;
  group.add(glow);
  group.set = (h, t, phase) => {
    col.geometry.dispose();
    col.geometry = columnGeom(w, d, Math.max(.06, h));
    drape.update(Math.max(.06, h), t, phase);
  };
  return group;
}

function cloth(tex, w, h, x, y, z) {
  const geo = new THREE.PlaneGeometry(w, h, 60, 60);
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: .7, side: THREE.DoubleSide }));
  mesh.position.set(x, y, z);
  const base = geo.attributes.position.array.slice();
  mesh.wave = (t, phase) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1];
      p.setZ(i, Math.sin(bx * 1.5 + by * .6 + t * 2.1 + phase) * .24 + Math.sin(bx * 3.1 - by * 1.1 + t * 3 + phase) * .08);
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  };
  return mesh;
}

function loadTex(url) {
  return new Promise((ok, no) => new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; ok(t); }, undefined, no));
}

function playerPlane(tex, size) {
  // Lit a little from the side so the figure sits in the scene rather than on top of it.
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: .35, roughness: .55, side: THREE.DoubleSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.castShadow = true;
  m.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: .35 });
  return m;
}

async function init(data) {
  D = data;
  renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(1080, 1920, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a2030, 22, 60);
  camera = new THREE.PerspectiveCamera(35, 1080 / 1920, .1, 200);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(52, 70), new THREE.MeshBasicMaterial({ map: stadiumTex(), fog: false, color: 0x8f9aa8 }));
  wall.position.set(0, 10.5, -24);
  scene.add(wall);

  const pt = pitchTex();
  pt.wrapS = pt.wrapT = THREE.RepeatWrapping;
  pt.repeat.set(1, 4);
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), new THREE.MeshStandardMaterial({ map: pt, roughness: .95 }));
  pitch.rotation.x = -Math.PI / 2;
  pitch.position.z = 0;
  pitch.receiveShadow = true;
  scene.add(pitch);

  scene.add(new THREE.HemisphereLight(0xbcd7ff, 0x1a3a22, 1.05));
  const key = new THREE.DirectionalLight(0xfff4e0, 3.0);
  key.position.set(5, 13, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 11, bottom: -3, near: 1, far: 40 });
  key.shadow.bias = -.0006;
  scene.add(key);
  const rimL = new THREE.PointLight(0x66aaff, 90, 30); rimL.position.set(-7, 6, -2); scene.add(rimL);
  const rimR = new THREE.PointLight(0xffc86a, 70, 30); rimR.position.set(7, 5, -1); scene.add(rimR);

  // Floodlights and their beams.
  const flare = glowTex('rgba(255,255,255,1)', 'rgba(190,225,255,.5)');
  [[-8, 15.5], [-3, 16.5], [3, 16.5], [8, 15.5]].forEach(([x, y]) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flare, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
    s.position.set(x, y, -20);
    s.scale.set(6.5, 6.5, 1);
    scene.add(s);
  });
  const beamTex = canvasTex(64, 512, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    // Fade both sides so the beam has no hard edge.
    x.globalCompositeOperation = 'destination-in';
    const side = x.createLinearGradient(0, 0, w, 0);
    side.addColorStop(0, 'rgba(0,0,0,0)'); side.addColorStop(.5, 'rgba(0,0,0,1)'); side.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = side; x.fillRect(0, 0, w, h);
  });
  beams = [[-5, -1], [5, 1]].map(([x, dir]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 26), new THREE.MeshBasicMaterial({ map: beamTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    m.position.set(x, 5, -9);
    m.dir = dir;
    scene.add(m);
    return m;
  });

  // Intro: each team's flag waving behind its player, who stands in front of the cloth.
  introGroup = new THREE.Group();
  scene.add(introGroup);
  const [cutHome, cutAway] = await Promise.all([loadTex(data.home_cut), loadTex(data.away_cut)]);
  introGroup.flagH = cloth(flagTex(data.home_style), 4.6, 6.4, -2.1, 4.1, -3.6);
  introGroup.flagA = cloth(flagTex(data.away_style), 4.6, 6.4, 2.1, 4.1, -3.2);
  introGroup.add(introGroup.flagH, introGroup.flagA);
  introGroup.pH = playerPlane(cutHome, 5.1);
  introGroup.pA = playerPlane(cutAway, 5.1);
  introGroup.add(introGroup.pH, introGroup.pA);

  // Two bars for goals, three for the result.
  bars2 = [makeBar(data.home_style, 1.8, 1.2, -1.22), makeBar(data.away_style, 1.8, 1.2, 1.22)];
  bars3 = [makeBar(data.home_style, 1.32, 1.0, -1.66), makeBar('draw', 1.32, 1.0, 0), makeBar(data.away_style, 1.32, 1.0, 1.66)];
  bars2.concat(bars3).forEach(b => scene.add(b));

  // Confetti for the score reveal.
  const n = 420, r = rng(11), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const palette = [[1, .85, .1], [1, 1, 1], [.81, .07, .15], [.93, .95, .62]];
  confetti = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ size: .13, vertexColors: true, transparent: true, depthWrite: false }));
  confetti.seed = [];
  for (let i = 0; i < n; i++) {
    const c = palette[Math.floor(r() * 4)];
    col.set(c, i * 3);
    confetti.seed.push([r() * 11 - 5.5, r() * 12, r() * 6 - 4, r() * 7, .8 + r() * 1.6]);
  }
  confetti.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  confetti.geometry.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(confetti);

  $('iHome').textContent = data.home.toUpperCase();
  $('iAway').textContent = data.away.toUpperCase();
  $('iWhen').textContent = `${data.competition}, ${data.kickoff}`;
  $('sBig').textContent = `${data.score[0]}:${data.score[1]}`;
  $('sPct').textContent = `Only a ${data.score_pct}% chance`;
  $('cTitle').textContent = `${data.home} vs ${data.away}`;
  $('cKick').textContent = `Kick-off ${data.kickoff}`;
  $('cHome').src = data.home_card_url;
  $('cAway').src = data.away_card_url;
  await Promise.all([$('cHome').decode(), $('cAway').decode()]);
  if (data.sample) $('sample').style.display = 'block';
}

function setBars(list, values, top, t, labels) {
  const scale = top / Math.max(...values);
  const box = $('bLabels');
  let html = '';
  list.forEach((b, i) => {
    const p = ease((t - .25 - i * .16) / 1.55);
    const h = values[i] * scale * p;
    b.visible = true;
    b.set(h, t, i * 1.7);
    const tip = new THREE.Vector3(b.position.x, h + .1, .6).project(camera);
    const foot = new THREE.Vector3(b.position.x, 0, .9).project(camera);
    const x = (tip.x + 1) * 540, y = (1 - tip.y) * 960, fy = (1 - foot.y) * 960;
    html += `<div class="num" style="left:${x}px;top:${y}px">${labels.text(values[i] * p, p, i)}</div>`;
    html += `<div class="name" style="left:${x}px;top:${fy + 22}px;font-size:${labels.size}px">${labels.names[i]}</div>`;
  });
  box.innerHTML = html;
}

function renderAt(sec) {
  const scenes = [[0, T.goals, 'intro'], [T.goals, T.result, 'goals'], [T.result, T.score, 'result'], [T.score, T.card, 'score'], [T.card, T.end, 'end']];
  const [start, end, name] = scenes.find(s => sec >= s[0] && sec < s[1]) || scenes[4];
  const t = sec - start;
  const layer = { intro: 'intro', goals: 'bars', result: 'bars', score: 'score', end: 'end' }[name];
  ['intro', 'bars', 'score', 'end'].forEach(id => { $(id).style.opacity = id === layer ? 1 : 0; });

  introGroup.visible = name === 'intro';
  bars2.concat(bars3).forEach(b => { b.visible = false; });
  confetti.visible = name === 'score' || name === 'end';

  // A slow push-in keeps every scene moving.
  const drift = t / (end - start);
  beams.forEach(b => { b.rotation.z = b.dir * (.42 + Math.sin(sec * .9 + b.dir) * .13); });

  if (name === 'intro') {
    camera.position.set(Math.sin(sec * .7) * .35, 3.5, 15.6 - drift * 1.1);
    camera.lookAt(0, 3.3, 0);
    introGroup.flagH.wave(sec, 0);
    introGroup.flagA.wave(sec, 2);
    const inH = ease(t / .7), inA = ease((t - .12) / .7);
    introGroup.pH.position.set(-6 + 4.65 * inH, 3.02, .55);
    introGroup.pA.position.set(6 - 4.65 * inA, 3.02, .95);
    const face = Math.sin(sec * 1.3) * .05;
    introGroup.pH.rotation.y = .16 + face;
    introGroup.pA.rotation.y = -.16 + face;
  } else if (name === 'goals' || name === 'result') {
    camera.position.set(Math.sin(sec * .55) * .55, 3.6, 16.4 - drift * .9);
    camera.lookAt(0, 2.95, 0);
    camera.updateMatrixWorld();
    if (name === 'goals') {
      $('bHead').textContent = 'EXPECTED GOALS';
      setBars(bars2, [D.home_goals, D.away_goals], 5.2, t, {
        text: v => v.toFixed(1), names: [D.home, D.away], size: 44,
      });
    } else {
      $('bHead').textContent = 'WHO WINS?';
      setBars(bars3, D.pct, 5.2, t, {
        text: (v, p, i) => `${Math.round(D.pct[i] * p)}%`, names: [D.home, 'Draw', D.away], size: 36,
      });
    }
  } else {
    camera.position.set(Math.sin(sec * .5) * .5, 3.4, 14.5 - drift * .8);
    camera.lookAt(0, 4.2, 0);
  }

  if (confetti.visible) {
    const c = sec - T.score, p = confetti.geometry.attributes.position;
    confetti.seed.forEach((s, i) => {
      const y = 13 - ((s[1] + c * s[4]) % 13);
      p.setXYZ(i, s[0] + Math.sin(c * 1.5 + s[3]) * .3, y, s[2]);
    });
    p.needsUpdate = true;
  }

  if (name === 'score') {
    const k = back(t / .42), big = $('sBig');
    big.style.transform = `scale(${k})`;
    big.style.opacity = Math.min(1, t / .12);
    $('sPct').style.opacity = t > .55 ? 1 : 0;
    document.querySelector('#score .l2').style.opacity = t > 1.05 ? 1 : 0;
  }
  if (name === 'intro') {
    document.querySelector('#intro .ask').style.opacity = t > .55 ? 1 : 0;
    document.querySelector('#intro .vs').style.transform = `scale(${.85 + .15 * ease(t / .5)})`;
  }
  if (name === 'end') {
    const r = ease(t / .6);
    $('card').style.transform = `translateY(${(1 - r) * 170}px) rotateX(${(1 - r) * 20 + Math.sin(sec * 1.5) * 1.6}deg) rotateY(${Math.sin(sec * 1.1) * 3}deg)`;
    $('cta').style.opacity = t > .65 ? 1 : 0;
    $('cta').style.transform = `scale(${t > .65 ? back((t - .65) / .3) : .8})`;
  }

  const fadeIn = start === 0 ? 1 : t / FADE, fadeOut = end === T.end ? 1 : (end - sec) / FADE;
  $('fade').style.opacity = 1 - Math.max(0, Math.min(1, fadeIn, fadeOut));
  renderer.render(scene, camera);
}
