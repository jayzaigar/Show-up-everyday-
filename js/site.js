// Shared site behavior, loaded on every page.

// Always land at the top of a freshly loaded page. Without this, navigating
// here from a page you'd scrolled down on can leave the new page scrolled
// down too (browser scroll restoration, or the bfcache on back/forward).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('pageshow', () => window.scrollTo(0, 0));

// Fade-up reveal for any element marked .reveal as it scrolls into view.
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
