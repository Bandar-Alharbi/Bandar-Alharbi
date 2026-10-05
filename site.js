/* Single-page portfolio. Every section is built from window.PROFILE (profile.js);
   this file only arranges the content and handles navigation. */
(() => {
  'use strict';
  const P = window.PROFILE;
  if (!P) return;
  const L = P.links || {};
  const $ = id => document.getElementById(id);
  const list = a => (Array.isArray(a) ? a : []);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ext = 'target="_blank" rel="noopener noreferrer"';
  const SECTIONS = list(P.sections);
  const cvPage = L.cvPage || L.cv; // "View CV" opens the CV page (falls back to the PDF itself)
  document.documentElement.classList.add('js');

  /* ---------- navigation ---------- */
  const navItem = (s, i) =>
    `<li><a href="#${esc(s.id)}" data-sec="${esc(s.id)}"><span class="ix" aria-hidden="true">${i + 1}</span>${esc(s.label)}</a></li>`;
  document.querySelector('[data-nav]').innerHTML = SECTIONS.map(navItem).join('');
  document.querySelector('[data-sheet]').innerHTML = SECTIONS.map(navItem).join('');

  /* ---------- small builders ---------- */
  const chapterNo = id => SECTIONS.findIndex(s => s.id === id) + 1;
  const chapterLabel = id => (SECTIONS.find(s => s.id === id) || {}).label || id;
  const chapter = (id, inner) =>
    `<section class="chapter" id="${id}" aria-labelledby="${id}-title"><div class="wrap chapter-in">
       <p class="chapter-side" aria-hidden="true"><span class="ix">${chapterNo(id)}/${SECTIONS.length}</span>${esc(chapterLabel(id))}</p>
       <div class="chapter-main">${inner}</div>
     </div></section>`;
  const title = (id, text, intro) =>
    `<header class="c-head"><h2 class="c-title" id="${id}-title">${esc(text)}</h2>${intro ? `<p class="c-intro">${esc(intro)}</p>` : ''}</header>`;

  /* ---------- 1. introduction ---------- */
  const nameParts = String(P.name || '').trim().split(/\s+/);
  const nameHTML = nameParts.map((w, i) => `<span class="line l${i + 1}"><span>${esc(w)}</span></span>`).join('');
  const heroFacts = [P.degreeShort, ...list(P.languages).map(l => `${l.name}, ${l.level.toLowerCase()}`)].filter(Boolean);
  $('homeContent').innerHTML =
    `<p class="hero-status"><span class="dot" aria-hidden="true"></span>${esc(P.status)}<span class="sep" aria-hidden="true"></span>${esc(P.location)}</p>
     <h1 class="hero-name" id="home-title">${nameHTML}</h1>
     <div class="hero-foot">
       ${heroFacts.length ? `<ul class="hero-facts" aria-label="Quick facts">${heroFacts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
       <div class="hero-say">
         <p class="hero-headline">${esc(P.headline)}</p>
         ${P.summary ? `<p class="hero-sum">${esc(P.summary)}</p>` : ''}
         <p class="actions">
           <a class="btn" href="#contact">Get in touch</a>
           ${cvPage ? `<a class="btn btn-quiet" href="${esc(cvPage)}">View CV</a>` : ''}
         </p>
       </div>
     </div>`;

  /* ---------- 2. background: about, experience, education ---------- */
  function background() {
    const A = P.about || {}, X = P.experience || {}, E = P.education || {}, D = E.degree;
    const [first, ...rest] = list(A.paragraphs);
    const facts = [
      ['Status', P.status], ['Location', P.location], ['Degree', P.degreeShort],
      ...list(P.languages).map(l => [l.name, l.level]),
    ].filter(f => f[1]);
    const stats = list(P.highlights);

    const about =
      title('background', A.title) +
      `<div class="about">
         <div class="prose">${first ? `<p class="lead">${esc(first)}</p>` : ''}${rest.map(p => `<p>${esc(p)}</p>`).join('')}
           ${P.interestsText ? `<p class="interests">${esc(P.interestsText)}</p>` : ''}</div>
         ${facts.length ? `<dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
       </div>` +
      (stats.length ? `<ul class="figures" aria-label="In numbers">${stats.map(s => `<li><b>${esc(s.value)}</b><span>${esc(s.label)}</span></li>`).join('')}</ul>` : '');

    const exp = list(X.items).length ?
      `<div class="part" aria-labelledby="exp-title">
         <div class="part-head"><h3 class="part-title" id="exp-title">${esc(X.title)}</h3>${X.intro ? `<p>${esc(X.intro)}</p>` : ''}</div>
         ${list(X.items).map(x => `
         <article class="job">
           <div class="job-when"><p class="job-dates">${esc(x.dates)}</p>${x.type ? `<p>${esc(x.type)}</p>` : ''}</div>
           <div class="job-what">
             <h4 class="job-role">${esc(x.role)}</h4>
             <p class="job-org">${esc(x.org)}</p>
             <p class="job-meta">${[x.team, x.location].filter(Boolean).map(esc).join(', ')}</p>
             <div class="job-groups">${list(x.groups).map(g => `
               <div><h5>${esc(g.label)}</h5><ul class="ticks">${list(g.points).map(p => `<li>${esc(p)}</li>`).join('')}</ul></div>`).join('')}
             </div>
           </div>
         </article>`).join('')}
       </div>` : '';

    const certs = list(E.certifications);
    const edu = (D || certs.length) ?
      `<div class="part" aria-labelledby="edu-title">
         <div class="part-head"><h3 class="part-title" id="edu-title">${esc(E.title)}</h3>${E.intro ? `<p>${esc(E.intro)}</p>` : ''}</div>
         ${D ? `<div class="degree"><h4>${esc(D.name)}</h4><p>${esc([D.school, D.note].filter(Boolean).join('. '))}</p></div>` : ''}
         ${certs.length ? `<h4 class="certs-title">Certifications <span>${certs.length}</span></h4>
         <ul class="certs">${certs.map(c => `<li>
             <span class="cert-name">${esc(c.name)}</span>
             <span class="cert-by">${esc(c.issuer)}</span>
             <span class="cert-year">${esc(c.year)}</span>
             ${c.link ? `<a class="cert-link" href="${esc(c.link)}" ${ext}>View credential<span class="sr"> for ${esc(c.name)} (opens in a new tab)</span></a>` : ''}
           </li>`).join('')}</ul>` : ''}
       </div>` : '';

    return about + exp + edu;
  }

  /* ---------- 3. projects ---------- */
  function projects() {
    const J = P.projects || {};
    const items = list(J.items);
    return title('projects', J.title, J.intro) + (items.length ? `<ol class="projects">${items.map(p => {
      const soon = !p.title;
      return `<li class="${soon ? 'is-soon' : ''}">
        <span class="p-label">${esc(p.label)}</span>
        <div class="p-body">
          <h3 class="p-title">${esc(soon ? (p.description || 'Coming soon.') : p.title)}</h3>
          ${!soon && p.description ? `<p>${esc(p.description)}</p>` : ''}
        </div>
        ${p.link ? `<a class="p-link" href="${esc(p.link)}" ${ext}>View project<span class="sr"> (opens in a new tab)</span></a>` : ''}
      </li>`;
    }).join('')}</ol>` : '');
  }

  /* ---------- 4. skills ---------- */
  function skills() {
    const K = P.skills || {};
    return title('skills', K.title) +
      `<div class="skills">${list(K.groups).map(g => `
        <div class="skill-group"><h3>${esc(g.group)}</h3><ul>${list(g.items).map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>`).join('')}
      </div>`;
  }

  /* ---------- 5. contact ---------- */
  function contact() {
    const C = P.contact || {};
    const others = [
      L.linkedin && `<li><span class="k">LinkedIn</span><a href="${esc(L.linkedin)}" ${ext}>View profile<span class="sr"> (opens in a new tab)</span></a></li>`,
      cvPage && `<li><span class="k">CV</span><a href="${esc(cvPage)}">View CV</a></li>`,
      P.status && `<li><span class="k">Availability</span><span>${esc(P.status)}, ${esc(P.location)}</span></li>`,
    ].filter(Boolean).join('');
    return title('contact', C.title, C.text) +
      (L.email ? `<p class="mail-wrap"><span class="k">Email</span><a class="mail" href="mailto:${esc(L.email)}">${esc(L.email)}</a></p>` : '') +
      (others ? `<ul class="reach">${others}</ul>` : '');
  }

  const R = { background, projects, skills, contact };
  $('chapters').innerHTML = SECTIONS.filter(s => R[s.id]).map(s => chapter(s.id, R[s.id]())).join('');

  $('foot').innerHTML =
    `<div class="wrap foot-in"><p>${esc(P.copyright)}</p>
      <ul>${[
        L.email && `<li><a href="mailto:${esc(L.email)}">Email</a></li>`,
        L.linkedin && `<li><a href="${esc(L.linkedin)}" ${ext}>LinkedIn</a></li>`,
        cvPage && `<li><a href="${esc(cvPage)}">CV</a></li>`,
        `<li><a href="#home">Back to top</a></li>`,
      ].filter(Boolean).join('')}</ul></div>`;

  /* ---------- mobile menu ---------- */
  const header = $('top'), sheet = $('sheet'), menuBtn = header.querySelector('.menu-btn');
  const setMenu = open => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    sheet.hidden = !open;
    header.classList.toggle('menu-open', open);
    document.documentElement.classList.toggle('locked', open);
    if (open) { const a = sheet.querySelector('a'); if (a) a.focus(); }
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !sheet.hidden) { setMenu(false); menuBtn.focus(); }
  });
  matchMedia('(min-width: 821px)').addEventListener('change', e => { if (e.matches && !sheet.hidden) setMenu(false); });

  /* ---------- in-page links: smooth scroll (CSS) + move focus to the section heading ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1), target = id && $(id);
    if (!target) return;
    e.preventDefault();
    if (!sheet.hidden) setMenu(false);
    history.replaceState(null, '', id === 'home' ? location.pathname : `#${id}`);
    target.scrollIntoView({ block: 'start' }); // smooth unless reduced motion (see html scroll-behavior)
    const h = id === 'home' ? $('home-title') : $(`${id}-title`);
    if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  });
  // the sections are built by this script, so a link like …/#contact needs a nudge after they exist
  if (location.hash.length > 1) {
    const t = $(decodeURIComponent(location.hash.slice(1)));
    if (t) requestAnimationFrame(() => t.scrollIntoView({ behavior: 'instant', block: 'start' }));
  }

  /* ---------- current section in the menu ---------- */
  const links = [...document.querySelectorAll('a[data-sec]')];
  const mark = id => links.forEach(a => (a.dataset.sec === id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  const onScroll = () => {
    header.classList.toggle('scrolled', scrollY > 8);
    const line = innerHeight * .35;
    let cur = SECTIONS[0] && SECTIONS[0].id;
    for (const s of SECTIONS) { const el = $(s.id); if (el && el.getBoundingClientRect().top <= line) cur = s.id; }
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) cur = SECTIONS[SECTIONS.length - 1].id;
    mark(cur);
  };
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
})();
