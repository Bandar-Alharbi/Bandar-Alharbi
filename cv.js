/* CV page: draws cv.pdf on the page with pdf.js, so the CV opens here on every device
   (phones included) instead of being downloaded. If pdf.js can't load, the page offers
   the PDF link instead. The PDF path comes from profile.js (links.cv). */
const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38';
const P = window.PROFILE || {};
const file = (P.links && P.links.cv) || 'cv.pdf';
const box = document.getElementById('pages');
const note = document.getElementById('cvNote');
document.querySelectorAll('[data-cv]').forEach(a => a.setAttribute('href', file));

const fail = () => {
  note.hidden = false;
  note.innerHTML = `The CV can't be shown on this page right now. <a href="${file}" target="_blank" rel="noopener noreferrer">Open the PDF</a> instead.`;
};

note.hidden = false;
let doc = null, lastWidth = 0, busy = false, again = false;

async function draw() {
  if (busy) { again = true; return; }
  busy = true;
  try { await paint(); } finally { busy = false; }
  if (again) { again = false; draw(); }
}

async function paint() {
  const width = Math.round(box.clientWidth);
  if (!doc || !width || width === lastWidth) return;
  lastWidth = width;
  const ratio = Math.min(3, window.devicePixelRatio || 1);
  const frag = document.createDocumentFragment();
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const view = page.getViewport({ scale: (width / base.width) * ratio });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(view.width);
    canvas.height = Math.floor(view.height);
    canvas.className = 'cv-sheet';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `CV, page ${n} of ${doc.numPages}`);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: view }).promise;
    frag.appendChild(canvas);
  }
  box.querySelectorAll('.cv-sheet').forEach(c => c.remove());
  box.appendChild(frag);
  note.hidden = true;
}

try {
  const pdfjs = await import(`${PDFJS}/build/pdf.min.mjs`);
  pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS}/build/pdf.worker.min.mjs`;
  doc = await pdfjs.getDocument({ url: file, standardFontDataUrl: `${PDFJS}/standard_fonts/` }).promise;
  await draw();
  let t;
  new ResizeObserver(() => { clearTimeout(t); t = setTimeout(draw, 200); }).observe(box);
} catch (err) {
  console.warn('CV preview unavailable:', err);
  fail();
}
