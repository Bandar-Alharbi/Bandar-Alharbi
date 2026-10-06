/* Single-page portfolio: navigation, sections (rendered from window.PROFILE in profile.js) and scroll behaviour. */
(() => {
  'use strict';
  const P = window.PROFILE;
  if (!P) return;
  const L = P.links || {};
  const $ = id => document.getElementById(id);
  const list = a => (Array.isArray(a) ? a : []);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ARROW = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h9.5M7.5 3l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const EXT = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1h6v6M9 1 1.5 8.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  // full motion normally; with "reduce motion" (e.g. Windows "Animation effects" off) the site still
  // transitions, but only with gentle fades — no movement, sliding, 3D or depth
  const motion = !reduceMotion.matches && 'IntersectionObserver' in window;
  const calm = reduceMotion.matches && 'IntersectionObserver' in window;
  if (motion) document.documentElement.classList.add('motion');
  if (calm) document.documentElement.classList.add('calm');
  const SECTIONS = list(P.sections);

  /* ---------- text fills (home screen + header) ---------- */
  const tagline = [P.role, P.location].filter(Boolean).join(' · ');
  const get = path => path.split('.').reduce((o, k) => (o == null ? o : o[k]), P);
  document.querySelectorAll('[data-p]').forEach(el => {
    const v = el.dataset.p === 'tagline' ? tagline : get(el.dataset.p);
    if (v) el.textContent = v; else el.remove();
  });

  /* ---------- navigation ---------- */
  const nav = document.querySelector('[data-nav]');
  const link = (s, i, num) => `<a href="#${esc(s.id)}" data-sec="${esc(s.id)}">${esc(s.label)}${num && i ? `<small>0${i}</small>` : ''}</a>`;
  nav.innerHTML =
    `<div class="navpill"><span class="nav-ind" aria-hidden="true"></span>${SECTIONS.map((s, i) => link(s, i)).join('')}</div>` +
    `<button type="button" class="tl menu-btn" aria-expanded="false" aria-haspopup="true"><svg viewBox="0 0 14 10" aria-hidden="true"><path d="M1 1.5h12M1 8.5h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Menu</button>` +
    `<div class="navsheet">${SECTIONS.map((s, i) => link(s, i, true)).join('')}</div>`;
  const menuBtn = nav.querySelector('.menu-btn');
  const setMenu = open => { nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); };
  menuBtn.addEventListener('click', e => { e.stopPropagation(); setMenu(!nav.classList.contains('open')); });
  document.addEventListener('click', e => { if (!nav.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });

  /* ---------- sections ---------- */
  const num = id => String(SECTIONS.findIndex(s => s.id === id)).padStart(2, '0');
  const labelOf = id => (SECTIONS.find(s => s.id === id) || {}).title || (SECTIONS.find(s => s.id === id) || {}).label || id;
  // headline words rise one after another when the section scrolls in
  const words = t => String(t || '').split(/\s+/).filter(Boolean).map((w, i) => `<span class="w"><span style="--i:${i}">${esc(w)}</span></span>`).join(' ');
  const head = (id, title, intro) =>
    `<header class="s-head"><div><div class="eyebrow"><span class="n">${num(id)}</span>&nbsp;·&nbsp;${esc(labelOf(id))}</div><h2 class="s-title" id="${id}-title" aria-label="${esc(title)}">${words(title)}</h2></div>${intro ? `<p class="s-intro">${esc(intro)}</p>` : ''}</header>`;
  const DECO = '<div class="deco" aria-hidden="true"><i class="glow g1"></i><i class="glow g2"></i><i class="ring"></i><i class="lines"></i></div>';
  let blockIndex = 0;
  // data-theme gives each section its own color and pattern (see "SECTION THEMES" in site.css)
  const block = (id, inner) => `<section class="block" id="${id}" data-theme="${id}" data-v="${blockIndex++ % 2}" aria-labelledby="${id}-title">${DECO}<div class="wrap">${inner}</div></section>`;
  const rows = r => `<ul class="rows">${r.filter(x => x[1]).map(([a, b]) => `<li><span>${esc(a)}</span><span>${b}</span></li>`).join('')}</ul>`;

  const R = {
    about() {
      const A = P.about || {};
      const facts = rows([
        ['Status', P.status ? `<span class="status">${esc(P.status)}</span>` : ''],
        ['Location', esc(P.location)],
        ['Degree', esc(P.degreeShort)],
        ...list(P.languages).map(l => [l.name, esc(l.level)]),
      ]);
      const interests = list(P.interests).length ? `<div class="label" style="margin-top:22px">Interests</div><div class="chips">${list(P.interests).map(s => `<span>${esc(s)}</span>`).join('')}</div>` : '';
      const [first, ...rest] = list(A.paragraphs);
      return head('about', A.title, P.interestsText) +
        `<div class="split"><div class="body-text">${first ? `<p class="lead">${esc(first)}</p>` : ''}${rest.map(p => `<p>${esc(p)}</p>`).join('')}</div><aside class="card" aria-label="Quick facts">${facts}${interests}</aside></div>`;
    },

    experience() {
      const X = P.experience || {};
      return head('experience', X.title, X.intro) + list(X.items).map(x =>
        `<article class="xp"><div><div class="label">${esc(x.dates)}</div><h3 class="xp-role">${esc(x.role)}</h3><p class="meta">${[x.org, [x.team, x.type].filter(Boolean).join(' · '), x.location].filter(Boolean).map(esc).join('<br>')}</p></div>
          <div class="grid g2">${list(x.groups).map(g => `<div class="card"><div class="label">${esc(g.label)}</div><ul class="bullets">${list(g.points).map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}</div></article>`).join('');
    },

    projects() {
      const J = P.projects || {};
      const cards = list(J.items).map((p, i) => {
        const soon = !p.title;
        return `<article class="card proj${soon ? ' is-soon' : ''}"><div class="label">${esc(p.label)}</div>
          <h3>${esc(p.title || p.description)}</h3>${!soon && p.description ? `<p class="meta">${esc(p.description)}</p>` : ''}
          ${p.link ? `<a class="text-link" href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">View project ${EXT}</a>` : ''}
          <div class="num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</div></article>`;
      }).join('');
      return head('projects', J.title, J.intro) + (cards ? `<div class="grid g4 proj-grid">${cards}</div>` : '');
    },

    skills() {
      const K = P.skills || {}, E = P.education || {}, D = E.degree;
      const groups = list(K.groups).map(g => `<div class="card"><h3>${esc(g.group)}</h3><div class="chips">${list(g.items).map(s => `<span>${esc(s)}</span>`).join('')}</div></div>`).join('');
      const certs = list(E.certifications).map(c => {
        const inner = `<div class="label">${esc([c.issuer, c.year].filter(Boolean).join(' · '))}</div><h3>${esc(c.name)}</h3>`;
        return c.link
          ? `<a class="card c-card" href="${esc(c.link)}" target="_blank" rel="noopener noreferrer">${inner}<span class="text-link">View credential ${EXT}</span></a>`
          : `<div class="card">${inner}</div>`;
      }).join('');
      const degree = D ? `<div class="card"><div class="label">Degree</div><h3>${esc(D.name)}</h3><p class="meta">${esc([D.school, D.note].filter(Boolean).join(' — '))}</p></div>` : '';
      return head('skills', K.title, '') +
        (groups ? `<div class="grid g4 skill-grid">${groups}</div>` : '') +
        `<div class="sub"><div class="sub-head"><div><div class="label">Education</div><h3 class="sub-title">${esc(E.title)}</h3></div>${E.intro ? `<p>${esc(E.intro)}</p>` : ''}</div>${degree}` +
        (certs ? `<div class="label certs-label">Certifications · ${list(E.certifications).length}</div><div class="grid g3">${certs}</div>` : '') + `</div>`;
    },

    contact() {
      const C = P.contact || {};
      const email = L.email ? `<div class="card c-email"><div><div class="label">Email</div><h3>${esc(L.email)}</h3></div><a class="btn-main" href="mailto:${esc(L.email)}">Send an email ${ARROW}</a></div>` : '';
      const cards = [
        L.linkedin && `<a class="card c-card" href="${esc(L.linkedin)}" target="_blank" rel="noopener noreferrer"><div class="label">LinkedIn</div><h3>${esc(P.name)}</h3><span class="text-link">View profile ${EXT}</span></a>`,
        L.cv && `<a class="card c-card" href="${esc(L.cv)}" target="_blank" rel="noopener noreferrer"><div class="label">CV</div><h3>Curriculum vitae</h3><span class="text-link">View CV ${EXT}</span></a>`,
        P.status && `<div class="card c-card"><div class="label">Availability</div><h3>${esc(P.status)}</h3><p class="meta">${esc(P.location)}</p></div>`,
      ].filter(Boolean).join('');
      return head('contact', C.title, C.text) + `<div class="grid contact-grid">${email}${cards}</div>`;
    },
  };

  /* ---------- first screen: who I am ---------- */
  const hl = String(P.headline || ''), acc = P.headlineHighlight, at = acc ? hl.indexOf(acc) : -1;
  const title = at < 0 ? esc(hl) : `${esc(hl.slice(0, at))}<em>${esc(acc)}</em>${esc(hl.slice(at + acc.length))}`;
  const facts = [P.degreeShort, ...list(P.languages).map(l => `${l.name}: ${l.level}`)].filter(Boolean);
  const stats = list(P.highlights);
  $('homeContent').innerHTML =
    `<div class="eyebrow">${esc([P.status, P.location].filter(Boolean).join(' · '))}</div>
     <h1 class="home-title" id="home-title">${title}</h1>
     ${P.summary ? `<p class="home-sum">${esc(P.summary)}</p>` : ''}
     ${facts.length ? `<ul class="facts">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
     <div class="home-cta">
       <a class="btn-main" href="#contact">Get in touch ${ARROW}</a>
       ${L.cv ? `<a class="btn-sub" href="${esc(L.cv)}" target="_blank" rel="noopener noreferrer">View CV ${EXT}</a>` : ''}
     </div>
     ${stats.length ? `<div class="home-stats">${stats.map(s => `<div><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join('')}</div>` : ''}`;

  $('sections').innerHTML = SECTIONS.filter(s => R[s.id]).map(s => block(s.id, R[s.id]())).join('');

  const footLinks = [
    L.email && `<a href="mailto:${esc(L.email)}">Email</a>`,
    L.linkedin && `<a href="${esc(L.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`,
    L.cv && `<a href="${esc(L.cv)}" target="_blank" rel="noopener noreferrer">CV</a>`,
    `<a href="#home">Back to top ↑</a>`,
  ].filter(Boolean).join('');
  $('foot').innerHTML = `<div class="wrap"><div class="foot-row"><span>${esc(P.copyright)}</span><nav aria-label="Contact links">${footLinks}</nav></div></div>`;

  /* ---------- reveal on scroll ---------- */
  const blocks = [...document.querySelectorAll('.block')];
  if (motion || calm) {
    const REVEAL = '.home-in > *, .s-head .eyebrow, .s-head .s-intro, .body-text > p, .split > .card, .grid > .card, .xp > div:first-child, .sub-head > *, .sub > .card, .certs-label'; // (not the footer: it sits at the very bottom and must always show)
    document.querySelectorAll(REVEAL).forEach(el => {
      el.classList.add('rv');
      el.style.setProperty('--d', Math.min(6, [...el.parentNode.children].indexOf(el)));
    });
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add(en.target.classList.contains('block') ? 'seen' : 'in');
      io.unobserve(en.target);
    }), { rootMargin: '0px 0px -10% 0px', threshold: .12 });
    document.querySelectorAll('.rv, .s-title, .block').forEach(el => io.observe(el));
  }

  /* ---------- 3D (see the "3D LAYER" block in site.css) ---------- */
  const homeEl = $('home');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (motion && finePointer) {
    // first screen: ease the tilt toward the mouse so it feels weighty, not twitchy
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const tick = () => {
      cx += (tx - cx) * .07; cy += (ty - cy) * .07;
      homeEl.style.setProperty('--mx', cx.toFixed(4));
      homeEl.style.setProperty('--my', cy.toFixed(4));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    homeEl.addEventListener('pointermove', e => {
      const r = homeEl.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width * 2 - 1));
      ty = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height * 2 - 1));
      kick();
    });
    homeEl.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }

  /* ---------- box interaction (see "BOX INTERACTION" in site.css) ----------
     With a mouse: the card lifts and leans toward the cursor (up to 5°), a soft light and a glowing
     edge in the section's color follow it. On click/tap (any device): a ripple of light spreads from
     the point and the card presses in. These respond only to what the visitor does, so they run
     with "reduce motion" too. */
  document.querySelectorAll('.sections .card').forEach(card => {
    if (finePointer) {
      let t;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', `${((x - .5) * 10).toFixed(2)}deg`);
        card.style.setProperty('--rx', `${((.5 - y) * 10).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
        clearTimeout(t); card.classList.remove('tilt-off'); card.classList.add('tilt-on');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg');
        card.classList.replace('tilt-on', 'tilt-off');
        t = setTimeout(() => card.classList.remove('tilt-off'), 750);
      });
    }
    card.addEventListener('pointerdown', e => {
      const r = card.getBoundingClientRect(), d = Math.hypot(r.width, r.height) * 2;
      const rip = document.createElement('span');
      rip.className = 'ripple';
      rip.setAttribute('aria-hidden', 'true');
      Object.assign(rip.style, { left: `${e.clientX - r.left}px`, top: `${e.clientY - r.top}px`, width: `${d}px`, height: `${d}px` });
      card.appendChild(rip);
      rip.addEventListener('animationend', () => rip.remove());
    });
  });

  /* ---------- smooth scrolling ---------- */
  const header = document.querySelector('.site-top');
  const progress = document.createElement('i');
  progress.className = 'progress';
  progress.setAttribute('aria-hidden', 'true');
  header.appendChild(progress);
  const topOf = el => el.getBoundingClientRect().top + scrollY;

  /* ---------- smooth wheel scrolling (Lenis; touch scrolling stays native) ---------- */
  let lenis = null;
  try {
    if (window.Lenis) {
      lenis = new window.Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: 1 });
      const loop = t => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  } catch (err) { lenis = null; } // if the library can't load, normal browser scrolling still works
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const goTo = (y, instant) => {
    if (lenis) lenis.scrollTo(y, { immediate: !!instant, duration: 1.1, easing: easeOut, force: true });
    else scrollTo({ top: y, behavior: instant ? 'instant' : (reduceMotion.matches ? 'auto' : 'smooth') });
  };
  const focusHeading = target => {
    const h = target.querySelector('h1, h2');
    if (!h) return;
    h.setAttribute('tabindex', '-1');
    h.focus({ preventScroll: true });
  };

  /* ---------- page transition (see "PAGE TRANSITION" in site.css) ---------- */
  const veil = document.createElement('div');
  veil.className = 'veil';
  veil.hidden = true;
  veil.setAttribute('aria-hidden', 'true');
  veil.innerHTML = '<div class="wrap veil-in"><div class="eyebrow"></div><div class="veil-title"></div><i class="veil-line"></i></div>';
  document.body.appendChild(veil);
  const EASE = 'cubic-bezier(.76,0,.24,1)';
  let changing = false;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; // the browser must not move the page after a transition

  async function changePage(id, target) {
    changing = true;
    const s = SECTIONS.find(x => x.id === id) || { label: id };
    veil.querySelector('.eyebrow').innerHTML = `<span class="n">${num(id)}</span>&nbsp;·&nbsp;${esc(s.label)}`;
    veil.querySelector('.veil-title').textContent = id === 'home' ? P.name : (s.title || s.label);
    // the panel takes on the color of the section you're going to
    const cs = getComputedStyle(target);
    ['--c1', '--c2', '--acc'].forEach(v => { const val = cs.getPropertyValue(v).trim(); if (val) veil.style.setProperty(v, val); else veil.style.removeProperty(v); });
    veil.hidden = false;
    const inner = veil.querySelector('.veil-in'), line = veil.querySelector('.veil-line');

    // 1. bring the panel over the screen: a sweep, or a soft fade with "reduce motion"
    let cover;
    if (calm) {
      veil.style.clipPath = 'none';
      line.style.transform = 'scaleX(1)';
      cover = veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: 'ease', fill: 'forwards' });
      inner.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 480, delay: 120, easing: 'ease', fill: 'both' });
    } else {
      cover = veil.animate([{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 560, easing: EASE, fill: 'forwards' });
      inner.animate([{ opacity: 0, transform: 'translate3d(0,48px,0)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: 140, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
      line.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 760, delay: 220, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
    }
    await cover.finished;

    // 2. behind the panel: jump to the section and reset its entrance animations
    const again = [...target.querySelectorAll('.rv.in, .s-title.in')];
    again.forEach(el => { el.style.transition = 'none'; el.classList.remove('in'); });
    void target.offsetHeight;
    again.forEach(el => { el.style.transition = ''; });
    goTo(topOf(target), true);
    update();
    await new Promise(r => setTimeout(r, calm ? 320 : 260));

    // 3. take the panel away; the section plays in like a freshly loaded page
    const reveal = calm
      ? veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, easing: 'ease', fill: 'forwards' })
      : veil.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 100% 0)' }], { duration: 680, easing: EASE, fill: 'forwards' });
    if (!calm) inner.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate3d(0,-40px,0)' }], { duration: 420, easing: EASE, fill: 'forwards' });
    setTimeout(() => again.forEach(el => el.classList.add('in')), 160);
    await reveal.finished;
    veil.hidden = true;
    veil.getAnimations({ subtree: true }).forEach(a => a.cancel());
    veil.style.clipPath = ''; line.style.transform = '';
    focusHeading(target);
    changing = false;
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1), target = id && $(id);
    if (!target) return;
    e.preventDefault();
    setMenu(false);
    history.replaceState(null, '', id === 'home' ? location.pathname : `#${id}`);
    const far = Math.abs(topOf(target) - scrollY) > innerHeight * .5;
    if ((motion || calm) && far && 'animate' in veil) { if (!changing) changePage(id, target); return; }
    // short hops: glide there (window only — scrollIntoView could also scroll clipped inner boxes)
    goTo(topOf(target), false);
    focusHeading(target);
  });

  /* ---------- active section, header state ---------- */
  const links = [...nav.querySelectorAll('a[data-sec]')];
  const pill = nav.querySelector('.navpill'), ind = nav.querySelector('.nav-ind');
  function moveInd() {
    const a = pill.querySelector('a[aria-current]');
    if (!a || !pill.offsetParent) return;
    ind.style.transform = `translateX(${a.offsetLeft}px)`;
    ind.style.width = `${a.offsetWidth}px`;
    if (!ind.classList.contains('ready') && motion) requestAnimationFrame(() => ind.classList.add('ready'));
  }
  if (document.fonts) document.fonts.ready.then(moveInd);
  let current = '', ticking = false;
  function update() {
    ticking = false;
    const line = header.offsetHeight + innerHeight * .3;
    let cur = SECTIONS[0] && SECTIONS[0].id;
    for (const s of SECTIONS) { const el = $(s.id); if (el && el.getBoundingClientRect().top <= line) cur = s.id; }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4 && SECTIONS.length) cur = SECTIONS[SECTIONS.length - 1].id;
    if (cur !== current) {
      current = cur;
      links.forEach(a => (a.dataset.sec === cur ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
      moveInd();
    }
    header.classList.toggle('scrolled', scrollY > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    header.style.setProperty('--sp', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    if (motion) {
      // 3D: how far the first screen has scrolled away (0 … 1) — its text tips back and recedes
      homeEl.style.setProperty('--hs', Math.min(1, Math.max(0, scrollY / homeEl.offsetHeight)).toFixed(4));
      // each section's position relative to the middle of the screen (-1 … 1) drives the pattern's depth
      for (const b of blocks) {
        const r = b.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) continue;
        const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
        b.style.setProperty('--p', p.toFixed(4));
      }
    }
  }
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { queue(); moveInd(); });
  addEventListener('load', queue);        // the browser may jump to a #section after this script runs
  addEventListener('hashchange', queue);
  update();
  moveInd();
  requestAnimationFrame(queue);
})();
