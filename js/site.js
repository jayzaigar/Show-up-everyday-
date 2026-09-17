// Shared site behavior, loaded on every page.

// ---------- Airtable (registrations dashboard) ----------
// Fill these in once you've created your Airtable base (see README's
// "Registrations dashboard" section). Left empty, nothing is ever sent and
// the funnel behaves exactly as it did before.
const AIRTABLE_BASE_ID = 'appiomSorktNJKzAK';
const AIRTABLE_TABLE_NAME = 'tblKK43dOhOtkMdaF';
const AIRTABLE_TOKEN = 'patpQwVflHZZQdqjR.ee8e95e90823723bea5189b686216e94afafca2de6498f1497bd55d801516a48';

// Creates a record (no recordId) or patches one (with recordId). Never
// throws and never blocks the funnel: on any failure or timeout it just
// resolves to null so registration/redirects always proceed regardless of
// whether Airtable is configured or reachable.
function airtableRequest(method, fields, recordId) {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TOKEN) return Promise.resolve(null);
  const base = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;
  const url = recordId ? `${base}/${recordId}` : base;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AIRTABLE_TOKEN}` },
    body: JSON.stringify({ fields }),
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Airtable responded ${res.status}`);
      return res.json();
    })
    .then((data) => data.id || recordId || null)
    .catch((err) => {
      console.error('Airtable request failed', err);
      return null;
    })
    .finally(() => clearTimeout(timeout));
}

// Perceived-value loading screen: nothing is actually being analyzed or
// verified, this is purely a few seconds of reassurance before moving on.
// Reused wherever a page has the .analyzing-overlay markup (currently
// index.html, on form submit, and confirmation.html, before the VIP page).
function runAnalyzingSequence(messages, totalDuration, onDone) {
  const overlay = document.getElementById('analyzing-overlay');
  if (!overlay) { onDone(); return; }

  const messageEl = document.getElementById('analyzing-message');
  const barFill = document.getElementById('analyzing-bar-fill');
  const stepDuration = totalDuration / messages.length;

  overlay.classList.add('is-active');
  // Force layout before adding the visible class, so the opacity transition runs.
  overlay.getBoundingClientRect();
  overlay.classList.add('is-visible');
  barFill.getBoundingClientRect();
  barFill.style.width = '100%';

  let step = 0;
  messageEl.textContent = messages[0];
  const interval = setInterval(() => {
    step += 1;
    if (step < messages.length) {
      messageEl.textContent = messages[step];
    }
  }, stepDuration);

  setTimeout(() => {
    clearInterval(interval);
    onDone();
  }, totalDuration);
}

// Always land at the top of a freshly loaded page. Without this, navigating
// here from a page you'd scrolled down on can leave the new page scrolled
// down too (browser scroll restoration, or the bfcache on back/forward).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('pageshow', () => window.scrollTo(0, 0));

// Fade-up reveal for any element marked .reveal as it scrolls into view.
// Elements that share a direct parent (cards in the same list/grid, FAQ
// items, etc.) get a small incremental delay so they cascade in one after
// another instead of all popping in at once.
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const groups = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach((els) => {
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
    });
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  }
}

// VSL-gated path choice (only present on vip-offer.html): the Keep Free
// Ticket / Upgrade to VIP buttons stay hidden until the VSL's final 10
// seconds, then fade in.
const vslVideo = document.getElementById('vsl-video');
const vslOverlay = document.getElementById('vsl-placeholder');
const pathChoice = document.querySelector('.path-choice');

if (pathChoice) {
  const revealPath = () => pathChoice.classList.add('is-visible');
  const hasSource = vslVideo && vslVideo.querySelector('source[src]');

  if (hasSource) {
    if (vslOverlay) vslOverlay.hidden = true;
    vslVideo.setAttribute('controls', '');
    vslVideo.addEventListener('timeupdate', () => {
      if (vslVideo.duration && vslVideo.duration - vslVideo.currentTime <= 10) {
        revealPath();
      }
    });
    vslVideo.addEventListener('ended', revealPath);
  } else {
    // No real VSL wired up yet: don't block the page on a video that
    // doesn't exist. Remove this branch once a real <source> is added
    // to #vsl-video in vip-offer.html.
    revealPath();
  }
}
