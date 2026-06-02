/* ================================================================
   FARAJ AGRI TRADING — script.js
   Vanilla JS · no dependencies
   ================================================================ */

(function () {
  'use strict';

  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE   = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  /* ----------------------------------------------------------------
     1. SCENE ENGINE
     CSS-drawn agricultural visuals that rotate every 2 seconds.
     Each scene type has 3 palette variants; the engine crossfades them.
  ---------------------------------------------------------------- */
  var SCENE_TYPES = {
    rows: [
      { s1:'#2d4a1e', s2:'#3d6028', s3:'#4a7030', s4:'#2a4220' },
      { s1:'#344f22', s2:'#446824', s3:'#527034', s4:'#304820' },
      { s1:'#263e1a', s2:'#32561e', s3:'#406828', s4:'#243a18' }
    ],
    vine: [
      { s1:'#3a4a28', s2:'#4e6234', s3:'#2e3c20' },
      { s1:'#425430', s2:'#503e28', s3:'#344228' },
      { s1:'#384428', s2:'#4c3430', s3:'#2e2a18' }
    ],
    soil: [
      { s1:'#7a5530', s2:'#4a3320', s3:'#2c1d12' },
      { s1:'#886030', s2:'#523726', s3:'#301f14' },
      { s1:'#6a4a28', s2:'#3e2c1c', s3:'#261610' }
    ],
    map: [
      { s1:'#3a5828', s2:'#507a36', s3:'#466a30' },
      { s1:'#446428', s2:'#5a8038', s3:'#4e7232' },
      { s1:'#305020', s2:'#486e2e', s3:'#3c602a' }
    ],
    harvest: [
      { s1:'#c89030', s2:'#9a6e20', s3:'#daa83c' },
      { s1:'#d0983a', s2:'#a07828', s3:'#e0b040' },
      { s1:'#b88028', s2:'#906018', s3:'#ca9832' }
    ],
    spray: [
      { s1:'#1a3820', s2:'#2a4e2c', s3:'#183018' },
      { s1:'#1c4022', s2:'#2e5230', s3:'#1a321a' },
      { s1:'#18341e', s2:'#264828', s3:'#163016' }
    ]
  };

  function applyPalette(el, p) {
    for (var k in p) { el.style.setProperty('--' + k, p[k]); }
  }

  function buildStage(stageEl) {
    var sceneKey = stageEl.getAttribute('data-scene') ||
      (stageEl.parentElement && stageEl.parentElement.getAttribute('data-scene')) || 'rows';
    if (!SCENE_TYPES[sceneKey]) sceneKey = 'rows';
    var variants = SCENE_TYPES[sceneKey];
    var nodes = [];
    variants.forEach(function (pal) {
      var s = document.createElement('div');
      s.className = 'scene scene-' + sceneKey;
      applyPalette(s, pal);
      stageEl.appendChild(s);
      nodes.push(s);
    });
    nodes[0].classList.add('active');
    stageEl._scenes = nodes;
    stageEl._idx = 0;
    return stageEl;
  }

  var allStages = [];

  function initScenes() {
    allStages = Array.prototype.slice.call(document.querySelectorAll('.stage'));
    allStages.forEach(buildStage);
  }

  function tickScenes() {
    allStages.forEach(function (st) {
      if (!st._scenes || st._scenes.length < 2) return;
      st._scenes[st._idx].classList.remove('active');
      st._idx = (st._idx + 1) % st._scenes.length;
      st._scenes[st._idx].classList.add('active');
    });
  }

  initScenes();
  if (!REDUCE) setInterval(tickScenes, 2000);

  /* ----------------------------------------------------------------
     2. NAVIGATION
  ---------------------------------------------------------------- */
  var nav    = document.getElementById('nav');
  var navLinks = document.getElementById('navLinks');
  var burger = document.getElementById('navBurger');

  function onNavScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
  onNavScroll();
  window.addEventListener('scroll', onNavScroll, { passive: true });

  if (burger) {
    burger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.matches('a, button')) {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  /* ----------------------------------------------------------------
     3. HERO TEXT REVEAL
  ---------------------------------------------------------------- */
  setTimeout(function () {
    var heroCopy  = document.getElementById('heroCopy');
    var heroCards = document.getElementById('heroCards');
    if (heroCopy)  heroCopy.classList.add('reveal-ready');
    if (heroCards) heroCards.classList.add('reveal-ready');
    document.querySelectorAll('#heroCopy .fade-rise, #heroCards .fade-rise').forEach(function (el) {
      el.classList.add('in');
    });
  }, 100);

  /* ----------------------------------------------------------------
     4. POLLEN / SEED PARTICLE CANVAS
  ---------------------------------------------------------------- */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && canvas.getContext && !REDUCE) {
    var ctx = canvas.getContext('2d');
    var hero = document.querySelector('.hero');
    var particles = [];
    var animFrame, W, H, DPR;

    function sizeCanvas() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth;
      H = hero.clientHeight;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function seedParticles() {
      var count = Math.max(20, Math.min(48, Math.floor(W / 24)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x:  Math.random() * W,
          y:  Math.random() * H,
          r:  Math.random() * 2.1 + 0.5,
          vx: (Math.random() - 0.5) * 0.22,
          vy: Math.random() * 0.32 + 0.1,
          o:  Math.random() * 0.45 + 0.15,
          p:  Math.random() * Math.PI * 2
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (d) {
        d.p  += 0.012;
        d.x  += d.vx + Math.sin(d.p) * 0.18;
        d.y  += d.vy;
        if (d.y > H + 6)  { d.y = -6; d.x = Math.random() * W; }
        if (d.x < -6)     d.x = W + 6;
        if (d.x > W + 6)  d.x = -6;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(230,196,106,' + d.o + ')';
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      animFrame = requestAnimationFrame(drawParticles);
    }

    sizeCanvas();
    seedParticles();
    drawParticles();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { sizeCanvas(); seedParticles(); }, 200);
    });

    // Pause particles when hero is off-screen
    var heroIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          if (!animFrame) drawParticles();
        } else {
          cancelAnimationFrame(animFrame);
          animFrame = null;
        }
      });
    }, { threshold: 0 });
    heroIO.observe(hero);
  }

  /* ----------------------------------------------------------------
     5. SCROLL REVEAL — IntersectionObserver
  ---------------------------------------------------------------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      var delay = el.getAttribute('data-delay') || 0;
      setTimeout(function () { el.classList.add('in'); }, parseInt(delay, 10));
      revealIO.unobserve(el);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.reveal, .reveal-scale, .sec-head, .pcard, .proj, .kcard, .why-card, .rcard').forEach(function (el) {
    revealIO.observe(el);
  });

  /* ----------------------------------------------------------------
     6. TIMELINE — draw line + step reveal on scroll
  ---------------------------------------------------------------- */
  var tlWrap = document.getElementById('tlWrap');
  if (tlWrap) {
    var tlPath  = tlWrap.querySelector('.tl-svg path');
    var tsteps  = tlWrap.querySelectorAll('.tstep');
    var tlDrawn = false;

    var tlIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || tlDrawn) return;
        tlDrawn = true;
        tlWrap.classList.add('drawn');
        tsteps.forEach(function (step, i) {
          var d = step.getAttribute('data-delay') || i * 200;
          setTimeout(function () { step.classList.add('in'); }, parseInt(d, 10));
        });
        tlIO.disconnect();
      });
    }, { threshold: 0.2 });
    tlIO.observe(tlWrap);
  }

  /* ----------------------------------------------------------------
     7. PRODUCT FINDER
  ---------------------------------------------------------------- */
  var DB = {
    grapes: {
      fertilizer: [
        { name: 'Vine Balance NPK',    desc: 'Complete foliar and soil nutrition for healthy vines.',     tag: 'Fertilizer' },
        { name: 'Potash Boost',         desc: 'Improves berry sugar content, colour, and fruit firmness.', tag: 'Fertilizer' }
      ],
      seeds: [
        { name: 'Rootstock Guide',      desc: 'Expert rootstock selection matched to your site.',          tag: 'Seeds' }
      ],
      protection: [
        { name: 'Downy Mildew Shield',  desc: 'Protects leaves, stems, and grape clusters from downy mildew.', tag: 'Protection' },
        { name: 'Botrytis Guard',       desc: 'Reduces bunch rot risk in humid conditions.',                tag: 'Protection' }
      ],
      treatment: [
        { name: 'Powdery Mildew Cure',  desc: 'Curative treatment for active powdery mildew infection.',   tag: 'Treatment' },
        { name: 'Leafhopper Control',   desc: 'Targeted treatment for leafhopper damage on vines.',         tag: 'Treatment' }
      ]
    },
    potatoes: {
      fertilizer: [
        { name: 'Tuber Grow NPK',       desc: 'Balanced tuber nutrition for strong underground growth.',   tag: 'Fertilizer' },
        { name: 'Calcium Plus',         desc: 'Strengthens skin quality and reduces common defects.',       tag: 'Fertilizer' }
      ],
      seeds: [
        { name: 'Certified Seed Tuber', desc: 'High-germination, disease-free certified seed potatoes.',   tag: 'Seeds' }
      ],
      protection: [
        { name: 'Blight Defense',       desc: 'Late-blight protection — effective and reliable.',           tag: 'Protection' },
        { name: 'Pre-Emerge Weed Clear',desc: 'Suppresses weeds before they compete with emerging crop.',  tag: 'Protection' }
      ],
      treatment: [
        { name: 'Aphid Stop',           desc: 'Targeted aphid control to prevent virus spread.',            tag: 'Treatment' },
        { name: 'Nematode Shield',      desc: 'Soil treatment to reduce nematode pressure.',                tag: 'Treatment' }
      ]
    },
    vegetables: {
      fertilizer: [
        { name: 'Leaf & Fruit NPK',     desc: 'All-round nutrition for leaf, fruit, and root vegetables.',  tag: 'Fertilizer' },
        { name: 'Bio Soil Mix',         desc: 'Organic-based blend that builds long-term soil health.',      tag: 'Fertilizer' }
      ],
      seeds: [
        { name: 'Hybrid Veg Pack',      desc: 'Vigorous hybrid varieties selected for market quality.',     tag: 'Seeds' },
        { name: 'Open-Field Seed Range',desc: 'Reliable open-pollinated seeds for field production.',       tag: 'Seeds' }
      ],
      protection: [
        { name: 'Broad Pest Barrier',   desc: 'Wide-spectrum pest protection for mixed vegetable beds.',    tag: 'Protection' },
        { name: 'Soil Sterilant',       desc: 'Pre-planting soil treatment for cleaner crop establishment.', tag: 'Protection' }
      ],
      treatment: [
        { name: 'Fungus Stop',          desc: 'Curative treatment for leaf and stem fungal diseases.',       tag: 'Treatment' },
        { name: 'Virus Control Spray',  desc: 'Reduces vector populations to protect against viral spread.', tag: 'Treatment' }
      ]
    }
  };

  var ICONS = {
    Fertilizer: '<path d="M12 3v18M5 8l7-5 7 5M5 8v8l7 5 7-5V8" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    Seeds:      '<path d="M12 21c5-2 8-6 8-11a8 8 0 1 0-16 0c0 5 3 9 8 11Z" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    Protection: '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" stroke="currentColor" stroke-width="1.5"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    Treatment:  '<path d="M9 3h6l-1 4h-4L9 3Zm-2 7h10l-1 11H8L7 10Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>'
  };

  var finderState = { crop: 'grapes', need: 'fertilizer' };
  var resultsEl = document.getElementById('finderResults');

  function renderResults() {
    if (!resultsEl) return;
    var list = (DB[finderState.crop] && DB[finderState.crop][finderState.need]) || [];
    resultsEl.innerHTML = '';
    if (!list.length) {
      resultsEl.innerHTML = '<p class="finder-empty">No products listed for this combination yet — contact us for a tailored recommendation.</p>';
      return;
    }
    list.forEach(function (item, i) {
      var c = document.createElement('div');
      c.className = 'rcard';
      c.innerHTML =
        '<div class="rico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        (ICONS[item.tag] || '') + '</svg></div>' +
        '<h4>' + item.name + '</h4>' +
        '<p>' + item.desc + '</p>' +
        '<div class="rtag">' + finderState.crop + ' · ' + item.tag + '</div>';
      resultsEl.appendChild(c);
      setTimeout(function () { c.classList.add('show'); }, 60 + i * 90);
    });
  }

  function bindChipGroup(id, stateKey) {
    var group = document.getElementById(id);
    if (!group) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.chip');
      if (!btn) return;
      group.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      btn.classList.add('active');
      finderState[stateKey] = btn.getAttribute('data-' + stateKey);
      renderResults();
    });
  }

  bindChipGroup('cropChips', 'crop');
  bindChipGroup('needChips', 'need');
  renderResults();

  /* ----------------------------------------------------------------
     8. 3D CARD TILT (project cards)
  ---------------------------------------------------------------- */
  if (!REDUCE && FINE) {
    document.querySelectorAll('.tilt-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width  - 0.5;
        var py = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = 'rotateY(' + (px * 9) + 'deg) rotateX(' + (-py * 9) + 'deg) translateY(-5px)';
        card.style.boxShadow = '0 28px 80px -30px rgba(0,0,0,.95)';
        card.style.transition = 'box-shadow .3s, transform .12s';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform  = '';
        card.style.boxShadow  = '';
        card.style.transition = 'box-shadow .6s var(--ease), transform .5s var(--ease)';
      });
    });
  }

  /* ----------------------------------------------------------------
     9. MAGNETIC BUTTONS
  ---------------------------------------------------------------- */
  if (!REDUCE && FINE) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width  / 2) * 0.28;
        var y = (e.clientY - r.top  - r.height / 2) * 0.38;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ----------------------------------------------------------------
     10. CONTACT FORM (simulated submit)
  ---------------------------------------------------------------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = document.getElementById('fname');
      if (!nameEl || !nameEl.value.trim()) {
        if (nameEl) { nameEl.focus(); nameEl.style.borderColor = 'var(--gold)'; }
        return;
      }
      var ok = document.getElementById('formSuccess');
      if (ok) { ok.classList.add('show'); }
      form.reset();
      if (nameEl) nameEl.style.borderColor = '';
      setTimeout(function () { if (ok) ok.classList.remove('show'); }, 6000);
    });
    var nameInput = document.getElementById('fname');
    if (nameInput) {
      nameInput.addEventListener('input', function () { nameInput.style.borderColor = ''; });
    }
  }

  /* ----------------------------------------------------------------
     11. STAGGER DELAY FOR REVEAL CARDS
     Apply CSS transition-delay based on sibling index for grids.
  ---------------------------------------------------------------- */
  document.querySelectorAll('.prod-grid .pcard, .why-grid .why-card, .know-grid .kcard').forEach(function (el, i) {
    if (!el.style.transitionDelay) {
      el.style.transitionDelay = (i * 0.1) + 's';
    }
  });

})();
