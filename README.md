# The Show Up Everyday Series: Landing Page

A static, mobile-first registration landing page for the free 5-day live experience. Dark editorial look:
near-black backgrounds, clay/terracotta accents, cream text, Playfair Display (display) + Inter (body).

## Files

- `index.html`: the landing page: hero, who-this-is-for, five-day breakdown, why-free, registration form,
  social proof (placeholder), FAQ, final CTA
- `confirmation.html`: post-registration page ("You're in, check your email"), tells them the WhatsApp
  group link is in their confirmation email
- `css/styles.css`: all styling: near-black + clay/terracotta + cream palette, grain-texture overlay, a
  thin ring/lens-mark motif in the hero, Playfair Display + Inter
- `js/main.js`: client-side form validation + redirect to `confirmation.html`; payload is already shaped
  as `{ first_name, email }` to drop into most ESP/automation form-submission APIs
- `images/sandra-hero.jpg`: no longer used on the page (see VSL placeholder below); kept in the repo in
  case it's needed again

## Placeholders still to fill in

- **VSL video**: the hero's photo slot is now a placeholder (dashed border, play icon, "[VSL VIDEO
  PLACEHOLDER]" label) reserving the space for the video sales letter. Swap the `.hero-media-placeholder`
  block in `index.html` for the real embed (YouTube/Vimeo/Wistia iframe, or a `<video>` tag) once the VSL
  is ready. The surrounding `.hero-media` container already has the right sizing/aspect-ratio.
- **Headline**: three options are written out in an HTML comment at the top of `index.html`, above the
  hero. The first one is live; swap in a different one by editing the `<h1>`.
- **`[TESTIMONIAL 1/2/3: PENDING SANDRA APPROVAL]`**: in the "What it's like inside" section. Do not
  replace with invented quotes; wait for real, approved testimonials.
- **Open Graph image**: `<meta property="og:image">` points to `images/og-cover.jpg`, which doesn't exist
  yet. Export the series cover art at 1200×630 and drop it in at that path.
- The grain texture and ring/lens-mark motif in the hero are built with CSS/SVG, not the actual series
  cover art (which wasn't available to build from). Swap in the real cover art treatment if you have it.
- Set `FORM_ENDPOINT` in `js/main.js` to your ESP/automation provider's form endpoint (Resend, ManyChat,
  etc.) so registrations are actually captured. Right now the form just validates and redirects.
- Make sure that provider's confirmation email actually includes the WhatsApp group link. The
  confirmation page doesn't link to it directly, it just tells people to check their email.

Dates (October 4–8, 2026, 7PM CEST / UTC+2) are already filled in across the hero, registration section,
and final CTA. Update in `index.html` if they change.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```
