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

// The hero video is self-hosted: no YouTube chrome/branding at all. Starts
// muted (browsers block unmuted autoplay) and unmutes automatically the
// instant the visitor does anything at all on the page (scroll, tap,
// click, key press).
function autoUnmuteOnInteraction(videoEl) {
  const unmute = () => {
    videoEl.muted = false;
    videoEl.volume = 1;
    // A genuine user gesture (this listener only fires on one) can start
    // playback even when the browser blocked the autoplay attribute itself
    // (e.g. iOS Low Power Mode disables autoplaying video outright) - so if
    // it never actually started, this is the fallback that gets it moving.
    videoEl.play().catch(() => {});
  };
  ['click', 'touchstart', 'scroll', 'keydown'].forEach((type) => {
    document.addEventListener(type, unmute, { passive: true, once: true });
  });
}

// Read-only progress bar: reflects playback via width%, but has no click or
// drag handling of its own (and CSS makes it pointer-events:none), so it
// can't be used to seek.
function wireProgressBar(videoEl, fillEl) {
  if (!fillEl) return;
  videoEl.addEventListener('timeupdate', () => {
    if (videoEl.duration) fillEl.style.width = `${(videoEl.currentTime / videoEl.duration) * 100}%`;
  });
}

// Landing-page hero video (the only video in the funnel now - the VIP page
// no longer has its own VSL): no `controls` attribute, and CSS makes it
// pointer-events:none, so it can't be paused, seeked, or fullscreened.
const heroVslVideoEl = document.getElementById('hero-vsl-video');
if (heroVslVideoEl) {
  heroVslVideoEl.play().catch(() => {});
  autoUnmuteOnInteraction(heroVslVideoEl);
  wireProgressBar(heroVslVideoEl, document.getElementById('hero-vsl-progress'));
}
