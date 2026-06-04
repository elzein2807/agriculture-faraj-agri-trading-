/* ================================================================
   FARAJ AGRI TRADING — script.js  2026
   Vanilla JS · no dependencies
   ================================================================ */
'use strict';

const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ── IMAGE LOADER ─────────────────────────────────────────── */
function loadBg(el) {
  const url = el.dataset.bg;
  if (!url) return;
  const img = new Image();
  img.onload = () => { el.style.backgroundImage = `url("${url}")`; el.classList.add('loaded'); };
  img.onerror = () => { el.classList.add('img-failed'); };
  img.src = url;
}
$$('[data-bg]').forEach(loadBg);

/* ── NAVBAR ───────────────────────────────────────────────── */
(function () {
  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('up', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  if (burger && links) {
    const close = () => { links.classList.remove('open'); burger.classList.remove('on'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu'); };
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      burger.classList.toggle('on', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    $$('a', links).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
})();

/* ── HERO ROTATION ────────────────────────────────────────── */
(function () {
  const slides = $$('#heroBg .hero-slide');
  if (!slides.length) return;
  let i = 0;
  slides[0].classList.add('on');
  setInterval(() => {
    slides[i].classList.remove('on');
    i = (i + 1) % slides.length;
    slides[i].classList.add('on');
  }, 2000);
})();

/* ── GENERIC ROTATORS ─────────────────────────────────────── */
(function () {
  $$('.rot').forEach(rot => {
    const slides = $$('.rot-slide', rot);
    if (slides.length < 2) { if (slides[0]) slides[0].classList.add('on'); return; }
    let i = 0;
    slides.forEach(s => s.classList.remove('on'));
    slides[0].classList.add('on');
    const offset = Math.floor(Math.random() * 1400);
    setTimeout(() => {
      setInterval(() => {
        slides[i].classList.remove('on');
        i = (i + 1) % slides.length;
        slides[i].classList.add('on');
      }, 2000);
    }, offset);
  });
})();

/* ── SCROLL REVEAL ────────────────────────────────────────── */
(function () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const group = $$('.reveal', e.target.closest('section') || document);
      const idx = group.indexOf(e.target);
      setTimeout(() => e.target.classList.add('in'), Math.max(0, idx % 4) * 70);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  window.addEventListener('load', () => $$('.hero .reveal').forEach(el => el.classList.add('in')));
})();

/* ── TIMELINE ─────────────────────────────────────────────── */
(function () {
  const wrap = $('#timeline-steps'), fill = $('#tlFill');
  if (!wrap) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    if (fill) fill.style.height = '100%';
    $$('.tl-step', wrap).forEach((s, i) => setTimeout(() => s.classList.add('in'), i * 180));
    io.disconnect();
  }, { threshold: 0.2 });
  io.observe(wrap);
})();

/* ── SOLUTION FINDER ──────────────────────────────────────── */
(function () {
  const ICONS = {
    fertilizer: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 3h6l-1 4h-4L9 3Zm-2 7h10l-1 11H8L7 10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    seeds:      '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21c5-2 8-6 8-11a8 8 0 1 0-16 0c0 5 3 9 8 11Z" stroke="currentColor" stroke-width="1.5"/><path d="M12 9v8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    protection: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" stroke="currentColor" stroke-width="1.5"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    treatment:  '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  };
  const CROP = { grapes: 'Grapes', potatoes: 'Potatoes', vegetables: 'Vegetables' };
  const NEED = { fertilizer: 'Fertilizer', seeds: 'Seeds', protection: 'Crop Protection', treatment: 'Treatment' };
  const DB = {
    grapes: {
      fertilizer: { t: 'Vine Nutrition Program', d: 'Balanced NPK feeding for strong canopy growth and high-quality, high-brix fruit.' },
      seeds:      { t: 'Certified Vine Material', d: 'Quality table and wine grape planting material suited to local vineyards.' },
      protection: { t: 'Grape Protection Support', d: 'Powdery mildew and botrytis control to keep bunches clean through to harvest.' },
      treatment:  { t: 'Vine Foliar Treatment', d: 'Micronutrient and growth support to correct deficiency and improve fruit set.' },
    },
    potatoes: {
      fertilizer: { t: 'Potato Nutrition Plan', d: 'Soil-focused feeding for rapid canopy and strong, healthy tuber development.' },
      seeds:      { t: 'Certified Seed Potato', d: 'Disease-free seed tubers from verified production for a reliable start.' },
      protection: { t: 'Late Blight Program', d: 'Systematic protection against blight, aphids and virus through the season.' },
      treatment:  { t: 'Tuber Quality Treatment', d: 'Calcium and finishing support for storage quality and uniform skin set.' },
    },
    vegetables: {
      fertilizer: { t: 'Vegetable Feeding Program', d: 'Balanced nutrition for strong roots, healthy leaves and market-ready crops.' },
      seeds:      { t: 'Vegetable Seed Range', d: 'Trusted open-pollinated and hybrid varieties for local growing conditions.' },
      protection: { t: 'Vegetable Crop Protection', d: 'Broad-spectrum disease and pest control that stays safe for the crop.' },
      treatment:  { t: 'Post-Harvest Treatment', d: 'Biostimulant and finishing support to extend shelf-life and reduce losses.' },
    },
  };
  const cropEl = $('#cropChips'), needEl = $('#needChips'), out = $('#finderResult');
  if (!out) return;
  let crop = 'grapes', need = 'fertilizer';
  function render() {
    const rec = (DB[crop] || {})[need];
    const ico = ICONS[need] || ICONS.fertilizer;
    out.innerHTML = `<div class="fr-card"><div class="fr-ico">${ico}</div><div><div class="fr-meta">${CROP[crop]} · ${NEED[need]}</div><h3>${rec.t}</h3><p>${rec.d}</p></div></div>`;
    const card = $('.fr-card', out);
    requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('show')));
  }
  function bind(el, key, set) {
    if (!el) return;
    $$('.chip', el).forEach(c => c.addEventListener('click', () => {
      $$('.chip', el).forEach(x => x.classList.remove('on'));
      c.classList.add('on'); set(c.dataset[key]); render();
    }));
  }
  bind(cropEl, 'crop', v => crop = v);
  bind(needEl, 'need', v => need = v);
  render();
})();

/* ── 3D TILT ──────────────────────────────────────────────── */
(function () {
  if (matchMedia('(pointer:coarse)').matches) return;
  $$('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      card.style.transform = `perspective(900px) rotateY(${dx * 5}deg) rotateX(${-dy * 4}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
})();

/* ── CONTACT FORM ─────────────────────────────────────────── */
(function () {
  const form = $('#contactForm'), ok = $('#formOk');
  if (!form || !ok) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const html = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }
    setTimeout(() => {
      ok.classList.add('show');
      form.reset();
      if (btn) { btn.disabled = false; btn.innerHTML = html; }
      ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 900);
  });
})();