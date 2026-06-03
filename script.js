/* ================================================================
   FARAJ AGRI TRADING — script.js  2026
   ================================================================ */
'use strict';

/* ── UTILS ─────────────────────────────────────────────────────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
function makePrng(seed) {
  let s = seed | 0;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

/* ── CUSTOM CURSOR ──────────────────────────────────────────────── */
(function () {
  const dot = $('#curDot');
  const ring = $('#curRing');
  if (!dot || !ring || matchMedia('(pointer:coarse)').matches) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    rx = lerp(rx, mx, 0.13);
    ry = lerp(ry, my, 0.13);
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ── NAVIGATION ─────────────────────────────────────────────────── */
(function () {
  const nav = $('#nav');
  const burger = $('#burger');
  const links = $('#navLinks');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('up', scrollY > 60), { passive: true });
  if (burger && links) {
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.classList.toggle('on', open);
      burger.setAttribute('aria-expanded', open);
    });
    $$('a', links).forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('on');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }
})();

/* ── HERO CANVAS ─────────────────────────────────────────────────── */
(function () {
  const cv = $('#heroCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, t = 0;

  const PARTICLES = Array.from({ length: 65 }, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00035,
    vy: -(Math.random() * 0.0007 + 0.00018),
    r: Math.random() * 1.8 + 0.9,
    a: Math.random() * 0.65 + 0.2,
  }));

  function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* sky */
    const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sky.addColorStop(0, '#020a05');
    sky.addColorStop(1, '#0b1f12');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    /* horizon glow */
    const vpY = H * 0.44;
    const hg = ctx.createRadialGradient(W * 0.5, vpY, 0, W * 0.5, vpY, W * 0.55);
    hg.addColorStop(0, 'rgba(216,167,62,0.15)');
    hg.addColorStop(0.45, 'rgba(80,110,45,0.06)');
    hg.addColorStop(1, 'transparent');
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);

    /* perspective crop rows */
    const VP = { x: W * 0.5, y: vpY };
    const ROWS = 30;
    const SPREAD = 1.15;
    const COLORS = ['#1e3a18','#2a5022','#243818','#183010','#2e4a20','#223c16'];
    for (let i = 0; i < ROWS; i++) {
      const f = i / (ROWS - 1);
      const a1 = (f - 0.5) * SPREAD;
      const a2 = ((i + 1) / (ROWS - 1) - 0.5) * SPREAD;
      const bx1 = VP.x + Math.tan(a1) * (H - VP.y) * 1.35;
      const bx2 = VP.x + Math.tan(a2) * (H - VP.y) * 1.35;
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.globalAlpha = 0.42 + 0.55 * (1 - Math.abs(f - 0.5) * 1.6);
      ctx.beginPath();
      ctx.moveTo(VP.x, VP.y);
      ctx.lineTo(clamp(bx1, -W, W * 2), H + 2);
      ctx.lineTo(clamp(bx2, -W, W * 2), H + 2);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* animated depth lines */
    for (let d = 0; d < 9; d++) {
      const df = d / 9;
      const baseY = VP.y + (H - VP.y) * Math.pow(df, 0.5);
      const offset = (t * 0.3 * (1 - df)) % 28;
      const y = baseY + offset;
      if (y > H) continue;
      ctx.strokeStyle = `rgba(90,150,65,${0.07 * (1 - df)})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    /* ground vignette */
    const gnd = ctx.createLinearGradient(0, VP.y, 0, H);
    gnd.addColorStop(0, 'rgba(4,10,4,0)');
    gnd.addColorStop(0.45, 'rgba(4,10,4,0.38)');
    gnd.addColorStop(1, 'rgba(4,10,4,0.9)');
    ctx.fillStyle = gnd; ctx.fillRect(0, VP.y, W, H - VP.y);

    /* sky top vignette */
    const topVig = ctx.createLinearGradient(0, 0, 0, VP.y);
    topVig.addColorStop(0, 'rgba(2,10,5,0.45)');
    topVig.addColorStop(1, 'transparent');
    ctx.fillStyle = topVig; ctx.fillRect(0, 0, W, VP.y);

    /* pollen particles */
    PARTICLES.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      if (p.x < -0.02) p.x = 1.02;
      if (p.x > 1.02) p.x = -0.02;
      const px = p.x * W, py = p.y * H;
      const pg = ctx.createRadialGradient(px, py, 0, px, py, p.r * 3.8);
      pg.addColorStop(0, `rgba(220,175,70,${p.a})`);
      pg.addColorStop(1, 'transparent');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(px, py, p.r * 3.8, 0, Math.PI * 2); ctx.fill();
    });

    t++;
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── SCENE CANVASES ──────────────────────────────────────────────── */
(function () {
  const PAL = {
    rows:    [['#2d4a1e','#3d6028','#4a7030','#2a4220'],['#1e3a14','#2e5020','#3a6028','#1a3010'],['#3a5a28','#4e7034','#5a8040','#2e4a20']],
    vine:    [['#3a4a28','#4e6234','#2e3c20','#3e5228'],['#2a3a18','#3e5228','#243010','#384818'],['#485828','#5c6e3c','#3a4a20','#4a5c2c']],
    soil:    [['#7a5530','#4a3320','#2c1d12'],['#6a4520','#3a2310','#1c0d06'],['#8a6540','#5a4330','#3a2d22']],
    map:     [['#3a5828','#507a36','#466a30'],['#2a4818','#406228','#365a22'],['#4a6838','#5e8044','#527840']],
    harvest: [['#c89030','#9a6e20','#daa83c'],['#b07820','#886010','#c89028'],['#d8a840','#aa8030','#e8b848']],
    spray:   [['#1a3820','#2a4e2c','#183018'],['#102810','#20381c','#0e2010'],['#243028','#344038','#1e2820']],
  };
  let palIdx = 0;

  function drawCanvas(cv, type, seed) {
    const parent = cv.parentElement;
    const W = cv.width = (parent ? parent.offsetWidth : 0) || 400;
    const H = cv.height = (parent ? parent.offsetHeight : 0) || 300;
    if (!W || !H) return;
    const ctx = cv.getContext('2d');
    const pal = (PAL[type] || PAL.rows)[palIdx % 3];
    const rng = makePrng(seed);
    ctx.clearRect(0, 0, W, H);

    /* base gradient */
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, pal[0]); bg.addColorStop(0.55, pal[1] || pal[0]); bg.addColorStop(1, pal[2] || pal[0]);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    if (type === 'rows' || type === 'harvest') {
      const gold = type === 'harvest';
      const HCOLS = ['#c89030','#9a6e20','#daa83c','#b07820'];
      const VP = { x: W * 0.5, y: H * 0.36 };
      for (let i = 0; i < 26; i++) {
        const f = i / 25, a1 = (f - 0.5) * 1.1, a2 = ((i + 1) / 25 - 0.5) * 1.1;
        const bx1 = VP.x + Math.tan(a1) * (H - VP.y) * 1.3;
        const bx2 = VP.x + Math.tan(a2) * (H - VP.y) * 1.3;
        ctx.fillStyle = gold ? HCOLS[i % 4] : pal[i % pal.length];
        ctx.globalAlpha = 0.42 + 0.55 * (1 - Math.abs(f - 0.5) * 1.5);
        ctx.beginPath(); ctx.moveTo(VP.x, VP.y);
        ctx.lineTo(clamp(bx1, -W, W * 2), H + 2);
        ctx.lineTo(clamp(bx2, -W, W * 2), H + 2);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
      const sk = ctx.createLinearGradient(0, 0, 0, VP.y + 8);
      sk.addColorStop(0, gold ? '#1a1005' : '#040c07');
      sk.addColorStop(1, gold ? '#2a1e0a' : '#0d2218');
      ctx.fillStyle = sk; ctx.fillRect(0, 0, W, VP.y + 8);
      const gv = ctx.createLinearGradient(0, VP.y, 0, H);
      gv.addColorStop(0, 'rgba(4,8,4,0)'); gv.addColorStop(1, 'rgba(4,8,4,0.78)');
      ctx.fillStyle = gv; ctx.fillRect(0, VP.y, W, H - VP.y);
    }

    else if (type === 'vine') {
      for (let r = 0; r < 14; r++) {
        const y = ((r + 0.5) / 14) * H;
        ctx.strokeStyle = `rgba(0,0,0,${0.18 + (r % 2) * 0.1})`;
        ctx.lineWidth = 1.5 + (r % 3) * 0.8;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        for (let l = 0; l < 8; l++) {
          const lx = (l / 7) * W + (rng() - 0.5) * 18;
          const ly = y + (rng() - 0.5) * 12;
          const lr = 4 + rng() * 7;
          ctx.globalAlpha = 0.38 + rng() * 0.35;
          ctx.fillStyle = r % 2 === 0 ? '#4e7034' : '#3a5a28';
          ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      for (let gx = 11; gx < W; gx += 22)
        for (let gy = 11; gy < H; gy += 22) {
          ctx.fillStyle = 'rgba(0,0,0,0.16)';
          ctx.beginPath(); ctx.arc(gx, gy, 1.2, 0, Math.PI * 2); ctx.fill();
        }
    }

    else if (type === 'soil') {
      const layers = [
        [0, 0.22, pal[0] || '#7a5530'],
        [0.22, 0.48, pal[1] || '#4a3320'],
        [0.48, 0.74, pal[2] || '#2c1d12'],
        [0.74, 1, '#12090a'],
      ];
      layers.forEach(([a, b, c]) => {
        const lg = ctx.createLinearGradient(0, a * H, 0, b * H);
        lg.addColorStop(0, c); lg.addColorStop(1, c + 'bb');
        ctx.fillStyle = lg; ctx.fillRect(0, a * H, W, (b - a) * H);
      });
      for (let i = 0; i < 22; i++) {
        ctx.strokeStyle = `rgba(0,0,0,${0.09 + (i % 3) * 0.04})`;
        ctx.lineWidth = 1; ctx.beginPath();
        ctx.moveTo(0, (i / 22) * H); ctx.lineTo(W, (i / 22) * H); ctx.stroke();
      }
      for (let r = 0; r < 10; r++) {
        const rx = (r / 9) * W * 0.8 + W * 0.1;
        ctx.strokeStyle = 'rgba(100,70,30,0.32)'; ctx.lineWidth = 1 + rng();
        ctx.beginPath(); ctx.moveTo(rx, H * 0.1);
        let cx = rx;
        for (let ss = 1; ss <= 7; ss++) {
          cx = clamp(cx + (rng() - 0.5) * 28, 8, W - 8);
          ctx.lineTo(cx, H * 0.1 + ss * H * 0.12);
        }
        ctx.stroke();
      }
    }

    else if (type === 'map') {
      const GX = 5, GY = 4, cw = W / GX, ch = H / GY;
      const PCOLS = ['rgba(80,120,55,0.42)','rgba(60,100,40,0.35)','rgba(50,90,38,0.38)','rgba(70,110,50,0.4)'];
      for (let i = 0; i <= GX; i++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, H); ctx.stroke();
      }
      for (let j = 0; j <= GY; j++) {
        ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, j * ch); ctx.lineTo(W, j * ch); ctx.stroke();
      }
      for (let i = 0; i < GX; i++)
        for (let j = 0; j < GY; j++)
          if (rng() > 0.42) {
            ctx.fillStyle = PCOLS[Math.floor(rng() * 4)];
            ctx.fillRect(i * cw + 3, j * ch + 3, cw - 6, ch - 6);
          }
      for (let c = 0; c < 5; c++) {
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(W * 0.5, H * 0.5, W * (0.14 + c * 0.11), H * (0.12 + c * 0.09), -0.25, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    else if (type === 'spray') {
      const clouds = [
        { cx: W * 0.25, cy: H * 0.38, rx: W * 0.42, ry: H * 0.36, a: 0.45 },
        { cx: W * 0.72, cy: H * 0.64, rx: W * 0.36, ry: H * 0.42, a: 0.38 },
        { cx: W * 0.5,  cy: H * 0.5,  rx: W * 0.27, ry: H * 0.28, a: 0.28 },
      ];
      clouds.forEach(cl => {
        const cg = ctx.createRadialGradient(cl.cx, cl.cy, 0, cl.cx, cl.cy, Math.max(cl.rx, cl.ry));
        cg.addColorStop(0, `rgba(80,140,90,${cl.a})`); cg.addColorStop(1, 'transparent');
        ctx.fillStyle = cg; ctx.beginPath();
        ctx.ellipse(cl.cx, cl.cy, cl.rx, cl.ry, 0, 0, Math.PI * 2); ctx.fill();
      });
      for (let d = 0; d < 100; d++) {
        const dx = rng() * W, dy = rng() * H, dr = rng() * 1.8 + 0.7;
        ctx.fillStyle = `rgba(140,200,130,${rng() * 0.28 + 0.06})`;
        ctx.beginPath(); ctx.arc(dx, dy, dr, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  const canvases = $$('.scene-canvas');
  canvases.forEach((cv, i) => { cv._seed = i * 7919 + 1234; drawCanvas(cv, cv.dataset.type || 'rows', cv._seed); });

  setInterval(() => { palIdx++; canvases.forEach(cv => drawCanvas(cv, cv.dataset.type || 'rows', cv._seed)); }, 2800);

  const ro = new ResizeObserver(() => canvases.forEach(cv => drawCanvas(cv, cv.dataset.type || 'rows', cv._seed)));
  canvases.forEach(cv => { if (cv.parentElement) ro.observe(cv.parentElement); });
})();

/* ── HORIZONTAL SCROLL — PRODUCTS ───────────────────────────────── */
(function () {
  const pin   = $('#prodPin');
  const track = $('#prodTrack');
  if (!pin || !track) return;
  const isMob = () => window.innerWidth <= 960;
  let dist = 0;

  function setup() {
    if (isMob()) { pin.style.height = ''; track.style.transform = ''; return; }
    track.style.transform = '';
    dist = track.scrollWidth - window.innerWidth;
    if (dist > 0) pin.style.height = window.innerHeight + dist + 'px';
    onScroll();
  }
  function onScroll() {
    if (isMob() || dist <= 0) return;
    const progress = clamp(-pin.getBoundingClientRect().top / dist, 0, 1);
    track.style.transform = `translateX(${-dist * progress}px)`;
  }

  setTimeout(() => {
    setup();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => setTimeout(setup, 80));
  }, 250);
})();

/* ── SCROLL REVEAL ───────────────────────────────────────────────── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const siblings = $$('.g-tile,.why-card,.k-card', el.parentElement || document.body);
      const idx = siblings.indexOf(el);
      setTimeout(() => el.classList.add('in'), Math.max(0, idx) * 80);
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  $$('.reveal,.reveal-l,.reveal-scale,.g-tile,.why-card,.k-card').forEach(el => io.observe(el));
})();

/* ── TIMELINE ────────────────────────────────────────────────────── */
(function () {
  const wrap = $('#tlWrap');
  if (!wrap) return;
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    wrap.classList.add('drawn');
    $$('.tstep', wrap).forEach((s, i) => setTimeout(() => s.classList.add('in'), i * 190));
    io.disconnect();
  }, { threshold: 0.18 });
  io.observe(wrap);
})();

/* ── COUNTERS ────────────────────────────────────────────────────── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 1600;
      (function tick(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(performance.now());
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => io.observe(el));
})();

/* ── PRODUCT FINDER ──────────────────────────────────────────────── */
(function () {
  const DB = {
    grapes: {
      fertilizer: [
        { name: 'Vine Nutrition Program',  desc: 'Complete NPK formula for strong canopy growth and high-brix fruit quality.', tag: 'Core Nutrition' },
        { name: 'Potassium Booster',       desc: 'Improves berry size, colour and sugar content at veraison stage.', tag: 'Fruit Quality' },
      ],
      seeds: [
        { name: 'Table Grape Varieties',   desc: 'Certified planting material for premium table and wine grape production.', tag: 'Genetics' },
      ],
      protection: [
        { name: 'Powdery Mildew Control',  desc: 'Preventive and curative treatment for the most common vine disease.', tag: 'Fungicide' },
        { name: 'Botrytis Shield',         desc: 'Protects bunches in high-humidity periods through to harvest.', tag: 'Disease Control' },
      ],
      treatment: [
        { name: 'Foliar Iron & Zinc',      desc: 'Corrects chlorosis and micronutrient deficiency in vine leaves.', tag: 'Micronutrient' },
        { name: 'Growth Regulator',        desc: 'Improves bunch architecture and berry uniformity at fruit set.', tag: 'Physiology' },
      ],
    },
    potatoes: {
      fertilizer: [
        { name: 'Potato Base Fertilizer',  desc: 'Balanced start-up nutrition for rapid canopy establishment.', tag: 'Soil Nutrition' },
        { name: 'Tuber Filler',            desc: 'High-K foliar feed applied at the tuber bulking stage.', tag: 'Yield' },
      ],
      seeds: [
        { name: 'Certified Seed Potato',   desc: 'Disease-free tubers from verified production programs.', tag: 'Planting Material' },
      ],
      protection: [
        { name: 'Late Blight Program',     desc: 'Systematic protection against Phytophthora infestans.', tag: 'Fungicide' },
        { name: 'Aphid & Virus Control',   desc: 'Reduce PVY and PLRV spread at early canopy stage.', tag: 'Insecticide' },
      ],
      treatment: [
        { name: 'Calcium Spray',           desc: 'Reduces internal browning and improves storage quality of tubers.', tag: 'Quality' },
        { name: 'Haulm Desiccant',         desc: 'Controlled vine kill for uniform skin set before harvest.', tag: 'Pre-Harvest' },
      ],
    },
    vegetables: {
      fertilizer: [
        { name: 'Vegetable Starter',       desc: 'Phosphorus-rich formula for strong early root development.', tag: 'Establishment' },
        { name: 'Nitrogen Top-Dress',      desc: 'Fast-release nitrogen for leafy crop biomass and colour.', tag: 'Growth' },
      ],
      seeds: [
        { name: 'Open Pollinated Varieties', desc: 'Trusted vegetable varieties adapted to local growing conditions.', tag: 'Traditional' },
        { name: 'F1 Hybrid Seeds',           desc: 'High-performance hybrids for commercial-scale yield targets.', tag: 'Commercial' },
      ],
      protection: [
        { name: 'Broad-Spectrum Fungicide', desc: 'Covers Downy Mildew, Alternaria and Anthracnose in one pass.', tag: 'Fungicide' },
        { name: 'Caterpillar Control',       desc: 'Selective insecticide safe for beneficial insects.', tag: 'Insecticide' },
      ],
      treatment: [
        { name: 'Post-Harvest Wash',       desc: 'Reduces losses and extends shelf-life after picking.', tag: 'Post-Harvest' },
        { name: 'Biostimulant Blend',      desc: 'Seaweed and amino acid mix for stress recovery and quality.', tag: 'Biostimulant' },
      ],
    },
  };

  const ICONS = {
    fertilizer: `<svg viewBox="0 0 24 24" fill="none"><path d="M9 3h6l-1 4h-4L9 3Zm-2 7h10l-1 11H8L7 10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    seeds:      `<svg viewBox="0 0 24 24" fill="none"><path d="M12 21c5-2 8-6 8-11a8 8 0 1 0-16 0c0 5 3 9 8 11Z" stroke="currentColor" stroke-width="1.5"/><path d="M12 9v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    protection: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" stroke="currentColor" stroke-width="1.5"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    treatment:  `<svg viewBox="0 0 24 24" fill="none"><path d="M12 8v8M9 11h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/></svg>`,
  };

  const cropEl = $('#cropChips');
  const needEl = $('#needChips');
  const out    = $('#finderResults');
  if (!out) return;
  let crop = 'grapes', need = 'fertilizer';

  function render() {
    const items = (DB[crop] || {})[need] || [];
    out.innerHTML = '';
    if (!items.length) {
      out.innerHTML = '<p class="finder-empty">No specific products for this combination — contact us for a tailored recommendation.</p>';
      return;
    }
    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'rcard';
      card.innerHTML = `<div class="rico">${ICONS[need] || ICONS.fertilizer}</div><h4>${item.name}</h4><p>${item.desc}</p><div class="rtag">${item.tag}</div>`;
      out.appendChild(card);
      requestAnimationFrame(() => setTimeout(() => card.classList.add('show'), i * 85));
    });
  }

  function bindChips(el, attr, cb) {
    if (!el) return;
    $$('.chip', el).forEach(c => c.addEventListener('click', () => {
      $$('.chip', el).forEach(x => x.classList.remove('on'));
      c.classList.add('on'); cb(c.dataset[attr]); render();
    }));
  }

  bindChips(cropEl, 'crop', v => crop = v);
  bindChips(needEl, 'need', v => need = v);
  render();
})();

/* ── 3D TILT — PROJECT CARDS ─────────────────────────────────────── */
(function () {
  $$('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(900px) rotateY(${dx * 6}deg) rotateX(${-dy * 5}deg) scale(1.025)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── FORM HANDLER ────────────────────────────────────────────────── */
(function () {
  const form = $('#contactForm');
  const ok   = $('#formOk');
  if (!form || !ok) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }
    setTimeout(() => {
      ok.classList.add('show');
      form.reset();
      if (btn) { btn.disabled = false; btn.innerHTML = 'Send Enquiry <span class="arr">→</span>'; }
      ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1000);
  });
})();

/* ── GSAP SCROLL ANIMATIONS (progressive enhancement) ───────────── */
window.addEventListener('load', function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  /* hero parallax */
  const hcv = $('#heroCanvas');
  if (hcv) gsap.to(hcv, { yPercent: 22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* section heading reveal */
  gsap.utils.toArray('.sec-intro').forEach(el => {
    gsap.from(el.children, { y: 28, opacity: 0, stagger: 0.14, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 76%' } });
  });

  /* project cards */
  gsap.from('.proj-card', { y: 60, opacity: 0, stagger: 0.13, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '#projects', start: 'top 72%' } });

  /* knowledge cards */
  gsap.from('.k-card', { y: 50, opacity: 0, stagger: 0.1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#knowledge', start: 'top 72%' } });
});
