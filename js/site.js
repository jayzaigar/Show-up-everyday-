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

// VSL videos: autoplay muted on load (browsers block unmuted autoplay).
// Landing-page hero video is temporarily YouTube-hosted again (swap back to
// the self-hosted <video id="hero-vsl-video"> once videos/hero-vsl.mp4 is
// pushed) — no native chrome, and pointer-events:none on its iframe means
// it can't be paused, seeked, or fullscreened. It unmutes automatically on
// the visitor's first interaction anywhere on the page, no button needed.
// The VIP page video keeps a click-to-unmute button, and — only there —
// the Keep Free Ticket / Upgrade to VIP buttons stay hidden until the
// video's final 10 seconds, then fade in.
const heroVslPlayerEl = document.getElementById('hero-vsl-player');
const vipVslPlayerEl = document.getElementById('vsl-player');
const pathChoice = document.querySelector('.path-choice');

function wireVslUnmuteButton(btn, getPlayer) {
  if (!btn) return;
  const label = btn.querySelector('span');
  btn.addEventListener('click', () => {
    const player = getPlayer();
    if (!player || typeof player.isMuted !== 'function') return;
    if (player.isMuted()) {
      player.unMute();
      if (label) label.textContent = 'Mute';
      btn.setAttribute('aria-label', 'Mute video');
    } else {
      player.mute();
      if (label) label.textContent = 'Unmute';
      btn.setAttribute('aria-label', 'Unmute video');
    }
  });
}

if (heroVslPlayerEl || vipVslPlayerEl) {
  // rel:0 keeps YouTube's end-of-video "recommended videos" grid limited to
  // this channel's own uploads; YouTube doesn't offer a way to remove it
  // entirely from an embed.
  const basePlayerVars = { autoplay: 1, mute: 1, rel: 0, playsinline: 1 };
  // controls:0 (plus disablekb/fs) strips YouTube's title bar and control
  // bar entirely; the iframe itself is also set pointer-events:none in CSS
  // so nothing short of removing that CSS can pause, seek, or mute it.
  const heroPlayerVars = { ...basePlayerVars, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3 };
  let revealed = false;
  const revealPath = () => {
    if (revealed || !pathChoice) return;
    revealed = true;
    pathChoice.classList.add('is-visible');
  };

  window.onYouTubeIframeAPIReady = () => {
    if (heroVslPlayerEl) {
      let heroReady = null;
      let unmuteRequested = false;
      const tryUnmuteHero = () => {
        if (heroReady) {
          heroReady.unMute();
          heroReady.setVolume(100);
        } else {
          unmuteRequested = true;
        }
      };
      new YT.Player('hero-vsl-player', {
        videoId: 'TflvXmt7Da0',
        width: '100%',
        height: '100%',
        playerVars: heroPlayerVars,
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
            heroReady = event.target;
            if (unmuteRequested) {
              event.target.unMute();
              event.target.setVolume(100);
            }
          },
        },
      });
      ['click', 'touchstart', 'scroll', 'keydown'].forEach((type) => {
        document.addEventListener(type, tryUnmuteHero, { passive: true, once: true });
      });
    }

    if (vipVslPlayerEl) {
      let progressTimer = null;
      const vipPlayer = new YT.Player('vsl-player', {
        videoId: 'Ae_Y2XhjISY',
        width: '100%',
        height: '100%',
        playerVars: basePlayerVars,
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            clearInterval(progressTimer);
            if (event.data === YT.PlayerState.PLAYING) {
              progressTimer = setInterval(() => {
                const duration = event.target.getDuration();
                const current = event.target.getCurrentTime();
                if (duration && duration - current <= 10) revealPath();
              }, 1000);
            } else if (event.data === YT.PlayerState.ENDED) {
              revealPath();
            }
          },
        },
      });
      wireVslUnmuteButton(document.getElementById('vip-vsl-unmute'), () => vipPlayer);
    }
  };

  const apiTag = document.createElement('script');
  apiTag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(apiTag);
} else if (pathChoice) {
  // No VSL player on the page: don't block the path choice on a video
  // that doesn't exist.
  pathChoice.classList.add('is-visible');
}
