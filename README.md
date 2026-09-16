# The Show Up Everyday Series: Landing Page

A static, mobile-first funnel for the free 5-day live experience, with a VIP upsell after registration.
Dark editorial look: near-black backgrounds, clay/terracotta accents, cream text, Playfair Display
(display) + Inter (body).

## The funnel

```
index.html (register: first name, email, WhatsApp number, reminder consent)
  -> [5s analyzing loading screen]
  -> confirmation.html ("Thank you for registering" + Click Here to Join the WhatsApp Group)
       -> [5s analyzing loading screen]
       -> survey.html (7 quick questions, one at a time, under 2 minutes; skippable)
            -> [5s analyzing loading screen]
            -> vip-offer.html (VIP pitch: hero + VSL placeholder + two paths)
                 -> Keep Free Ticket -> [5s analyzing loading screen] -> join-whatsapp-free.html
                 -> Upgrade to VIP   -> Whop checkout -> (after purchase, Whop redirects to)
                                         join-whatsapp-vip.html -> VIP WhatsApp group link
```

The `name` from registration is carried through the URL (`?name=...`) across confirmation, survey and
the VIP page, so it's available to personalize any of them further if you want.

## Analyzing loading screens

Two points in the funnel show a 5-second full-screen loading sequence (spinner, progress bar, four
rotating status lines) before moving on. This is purely perceived-value UX; nothing is actually being
analyzed or verified.

- **After submitting the registration form** (`index.html`): "Reviewing what you shared" -> "Matching
  your answers to the right track" -> "Personalizing your experience" -> "Saving your spot", then
  redirects to `confirmation.html`.
- **After clicking "Click Here to Join the WhatsApp Group"** (`confirmation.html`): "Verifying your
  registration" -> "Connecting to the WhatsApp group" -> "Setting up your access" -> "Almost there",
  then redirects to `survey.html`.
- **After finishing (or skipping) the survey** (`survey.html`): "Analyzing your answers" -> "Matching
  you to the right track" -> "Personalizing your VIP recommendation" -> "Almost there", then redirects
  to `vip-offer.html`.
- **After clicking "Keep Free Ticket"** (`vip-offer.html`): "Locking in your free ticket" -> "Setting up
  your access" -> "Getting your group ready" -> "Almost there", then redirects to
  `join-whatsapp-free.html`. "Upgrade to VIP" skips this and goes straight to the Whop checkout, since
  that's leaving the site for an external payment page.

Both reuse the same `.analyzing-overlay` markup pattern and the shared `runAnalyzingSequence(messages,
durationMs, onDone)` function in `js/site.js`. To add this to another transition, copy the
`.analyzing-overlay` block from either page, give the page's link/button a click handler that calls
`runAnalyzingSequence([...messages], 5000, () => window.location.href = '...')`, and call
`event.preventDefault()` first so the click doesn't navigate immediately.

## Files

- `index.html`: the free-series landing page: hero, who-this-is-for, five-day breakdown, why-free,
  registration form, social proof (placeholder), FAQ, final CTA
- `confirmation.html`: post-registration page ("Thank you for registering"), single button that runs a
  5-second "analyzing" loading screen before landing on `survey.html`
- `survey.html`: 7 quick multiple-choice questions, one at a time, with a progress bar, auto-advance on
  selection, a Back button on the last question, and a "Skip this for now" link that's always available.
  Finishing (or skipping) runs the analyzing loading screen, then lands on `vip-offer.html`.
- `vip-offer.html`: the VIP ticket pitch, same hero/VSL-placeholder structure as `index.html`, with two
  buttons: **Keep Free Ticket** (runs the analyzing loading screen, then -> `join-whatsapp-free.html`)
  and **Upgrade to VIP** (-> your live Whop checkout link)
- `join-whatsapp-free.html`: where free-ticket registrants land, with a button to the free WhatsApp group
- `join-whatsapp-vip.html`: where VIP buyers land after Whop checkout, with a button to the VIP WhatsApp
  group. **This page's deployed URL is what you set as the "after purchase" redirect in your Whop VIP
  product settings.**
- `css/styles.css`: all styling: near-black + clay/terracotta + cream palette, grain-texture overlay, a
  thin ring/lens-mark motif in the hero, Playfair Display + Inter
- `js/site.js`: shared behavior loaded on every page: forces new pages to open scrolled to the top
  (fixes the browser landing mid-page after a click), fades sections in as you scroll past them,
  (on `vip-offer.html` only) gates the Keep Free Ticket / Upgrade to VIP buttons behind the VSL's last
  10 seconds, and provides the reusable `runAnalyzingSequence()` loading-screen sequence used across
  `index.html`, `confirmation.html`, `survey.html` and `vip-offer.html`
- `js/main.js`: client-side registration form validation + redirect to `confirmation.html`; payload is
  `{ first_name, email, whatsapp, whatsapp_consent }` (whatsapp is the country code + number combined,
  e.g. `+447911123456`), shaped to drop into most ESP/automation form-submission APIs
- `images/sandra-hero.jpg`: no longer used on the page; kept in the repo in case it's needed again

## The registration form

Four fields only: first name, email, WhatsApp number (with a country-code dropdown covering ~50
countries), and a required consent checkbox ("I agree to receive event reminders on WhatsApp"). The
country code and number are combined into one `whatsapp` field in the submitted payload.

## The survey

Reachable only after registering (via confirmation.html), never as its own upfront ask, so it doesn't
hurt the initial opt-in rate. All 7 questions are single-choice. Selecting an answer auto-advances to
the next question after a short pause, except on the last question, where a "See My VIP Offer" button
submits. A "Skip this for now" link is always visible so nobody gets stuck. No answers are sent
anywhere yet, add a `SURVEY_ENDPOINT` fetch call in `survey.html`'s script (mirroring the pattern in
`js/main.js`) if you want to capture them.

## The VSL-gated buttons on vip-offer.html

The Keep Free Ticket / Upgrade to VIP buttons stay hidden (and unclickable) until the VSL reaches its
last 10 seconds, then fade in. This is wired up in `js/site.js` against `<video id="vsl-video">` in
`vip-offer.html`. Until a real `<source>` is added to that video, there's nothing to watch, so the
buttons show immediately instead of waiting on a video that doesn't exist. Once you add the real VSL:

1. In `vip-offer.html`, uncomment the `<source src="...">` line inside `#vsl-video` and point it at your
   video file (or swap the whole `<video>` block for a YouTube/Vimeo/Wistia iframe if you're hosting it
   there instead, in which case you'll want to adjust the gating logic in `js/site.js` to that platform's
   player API).
2. The placeholder overlay (`#vsl-placeholder`, the dashed box with the play icon) hides itself
   automatically once a real `<source>` is present.
3. The buttons will then stay hidden until 10 seconds before the video ends.

## Placeholders still to fill in

- **VIP WhatsApp group link**: `join-whatsapp-vip.html`, the button's `href` is
  `[INSERT VIP WHATSAPP GROUP LINK]`.
- **VIP VSL**: `vip-offer.html`'s headline, offer copy and "What's included" list are filled in. The VSL
  is still a placeholder (see above); swap in the real video once you have it.
- **Free-series VSL video**: `index.html`'s hero photo slot is a placeholder (dashed border, play icon,
  "[VSL VIDEO PLACEHOLDER]" label). Swap the `.hero-media-placeholder` block for the real embed
  (YouTube/Vimeo/Wistia iframe, or a `<video>` tag) once that VSL is ready.
- **Headline**: three options for `index.html`'s hero are written out in an HTML comment above the hero.
  The first one is live; swap in a different one by editing the `<h1>`.
- **`[TESTIMONIAL 1/2/3: PENDING SANDRA APPROVAL]`**: in `index.html`'s "What it's like inside" section.
  Do not replace with invented quotes; wait for real, approved testimonials.
- **Open Graph image**: `index.html`'s `<meta property="og:image">` points to `images/og-cover.jpg`, which
  doesn't exist yet. Export the series cover art at 1200×630 and drop it in at that path.
- The grain texture and ring/lens-mark motif in both heroes are built with CSS/SVG, not the actual series
  cover art (which wasn't available to build from). Swap in the real cover art treatment if you have it.
- Set `FORM_ENDPOINT` in `js/main.js` to your ESP/automation provider's form endpoint (Resend, ManyChat,
  etc.) so registrations are actually captured. Right now the form just validates and redirects.

Dates (October 4–8, 2026, 7PM CEST / UTC+2) are already filled in across `index.html`'s hero, registration
section, and final CTA. Update there if they change.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```
