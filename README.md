# The Show Up Everyday Series: Landing Page

A static, mobile-first funnel for the free 5-day live experience, with a VIP upsell after registration.
Strict black/white/warm-gray editorial look, matched to sselfie.ai: near-black background (`#0B0B0B`),
cream headlines (`#F5F3EE`), muted warm-gray body copy (`#A8A49C`), solid white CTA buttons with black
text, thin hairline dividers, no gradients, glow, grain texture or color accents. Instrument Serif
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
the VIP page, so it's available to personalize any of them further if you want. If Airtable is
configured (see below), the registrant's new record id is also carried through as `?rid=...` from
`index.html` to `confirmation.html` to `survey.html`, so the survey's answers land on that same row
instead of creating a duplicate.

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
  you to the right track" -> "Almost there", then redirects to `vip-offer.html`.
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

- `index.html`: the free-series landing page: hero, who-this-is-for, five-day breakdown (with a
  scroll-drawn trail connecting the five days, see below), why-free, registration form, social proof
  (placeholder), FAQ, final CTA
- `confirmation.html`: post-registration page ("Thank you for registering"), single button that runs a
  5-second "analyzing" loading screen before landing on `survey.html`
- `survey.html`: 7 quick multiple-choice questions, one at a time, with a progress bar, auto-advance on
  selection, a Back button on the last question, and a "Skip this for now" link that's always available.
  Finishing (or skipping) runs the analyzing loading screen, then lands on `vip-offer.html`.
- `vip-offer.html`: the VIP ticket pitch, same hero/VSL-placeholder structure as `index.html`, with two
  buttons: **Keep Free Ticket** (runs the analyzing loading screen, then -> `join-whatsapp-free.html`)
  and **Upgrade to VIP** (-> your live Whop checkout link)
- `join-whatsapp-free.html`: where free-ticket registrants land, with a button to the free WhatsApp group
- `join-whatsapp-vip.html`: where VIP buyers land after Whop checkout. Thanks them, explains that
  everything they paid for is already waiting inside Whop (download the app or use a browser, log in
  with the email they paid with), and gives two buttons: **Open Whop** and **Join the VIP WhatsApp
  Group**. **This page's deployed URL is what you set as the "after purchase" redirect in your Whop VIP
  product settings.**
- `dashboard.html`: internal, unlisted page (not part of the funnel), a custom stat-tile + filterable
  table view of your registrants, styled to match the site and polling Airtable every 30 seconds, see
  "Registrations dashboard" below
- `css/styles.css`: all styling: strict near-black + cream + warm-gray palette (no gradients, glow,
  grain or color accents), a thin hairline ring motif in the hero, Instrument Serif + Inter
- `js/site.js`: shared behavior loaded on every page: forces new pages to open scrolled to the top
  (fixes the browser landing mid-page after a click), fades sections and individual cards/list items in
  as you scroll to them (each `.reveal` element animates independently via IntersectionObserver; items
  sharing a parent, like the day cards or FAQ entries, get a small incremental delay so they cascade in
  one after another instead of popping in all at once), (on `vip-offer.html` only) gates the Keep Free
  Ticket / Upgrade to VIP buttons behind the VSL's last 10 seconds, provides the reusable
  `runAnalyzingSequence()` loading-screen sequence used across `index.html`, `confirmation.html`,
  `survey.html` and `vip-offer.html`, and holds the `AIRTABLE_*` config + `airtableRequest()` helper used
  to write registrants and survey answers into your dashboard's data source
- `js/main.js`: client-side registration form validation, writes the registrant into Airtable, then
  redirects to `confirmation.html`
- `images/sandra-hero.jpg`: no longer used on the page; kept in the repo in case it's needed again

## The registration form

Four fields only: first name, email, WhatsApp number (with a country-code dropdown covering ~50
countries), and a required consent checkbox ("I agree to receive event reminders on WhatsApp"). The
country code and number are combined into one `whatsapp` field in the submitted payload.

## The survey

Reachable only after registering (via confirmation.html), never as its own upfront ask, so it doesn't
hurt the initial opt-in rate. All 7 questions are single-choice. Selecting an answer auto-advances to
the next question after a short pause, except on the last question, where a "Submit Answers" button
submits. A "Skip this for now" link is always visible so nobody gets stuck. If Airtable is configured
and a `rid` was passed in from registration, submitting adds the seven answers (`Q1`-`Q7`) to that same
Airtable record. Skipping the survey doesn't send anything, there are no answers to save.

## The day-by-day scroll trail on index.html

The "What the five days look like" list has a thin vertical line connecting day 01 through 05, drawn
progressively as you scroll past it, with a small mark traveling along it. Built with
[GSAP](https://gsap.com) plus its ScrollTrigger, DrawSVG, and MotionPath plugins, loaded from a CDN
only on `index.html` (no other page needs it). If any of those four scripts fail to load, a guard at
the top of the inline script just returns early, the day-by-day list still works fine without the
effect, nothing else on the page breaks. It also respects `prefers-reduced-motion`, showing the line
fully drawn and the mark at rest instead of animating. The line itself and the mark are plain
monochrome (matching `--line`/`--cream`), no color added.

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

## Registrations dashboard (Airtable)

Registrant data (name, email, WhatsApp, country, consent, survey answers) is stored in Airtable, and
Airtable's own grid view (filterable and groupable by Country or VIP) is the dashboard. This is a
one-time setup:

1. Create a free account at [airtable.com](https://airtable.com) if you don't have one.
2. Create a new base, e.g. "Show Up Everyday Registrations". Rename its default table to
   `Registrants` (must match exactly, it's used in the code below).
3. Add these fields to the `Registrants` table, with these exact names and types:
   - `First Name` - Single line text
   - `Email` - Single line text
   - `WhatsApp` - Single line text
   - `Country` - Single line text
   - `Consent` - Checkbox
   - `VIP` - Checkbox (leave unchecked; see "VIP tagging" below)
   - `Q1` through `Q7` - Single line text, one per survey question
   - `Registered At` - Created time (so you can filter/sort by signup date)
4. Generate a Personal Access Token: click your account icon -> "Developer hub" -> "Personal access
   tokens" -> "Create token". Give it any name, add only the `data.records:write` scope, and under
   "Access" pick this one base specifically (not "All resources"). Copy the token (starts with `pat...`),
   you only see it once.
5. Get your Base ID: open the base, go to Help -> "API documentation" (or airtable.com/api and select
   this base). The Base ID is shown near the top and starts with `app...`.
6. Open `js/site.js`, find near the top:
   ```js
   const AIRTABLE_BASE_ID = '';
   const AIRTABLE_TABLE_NAME = 'Registrants';
   const AIRTABLE_TOKEN = '';
   ```
   Paste in your Base ID and token.
7. **Security note**: because this is a static site with no server, that token has to live in public
   front-end code. That's exactly why step 4 scopes it to `data.records:write` only, with that scope,
   even if someone found it in their browser's dev tools, the most they could do is create junk rows,
   they could not read, edit, or delete your registrants' data.
8. For the dashboard: `dashboard.html` is a custom page (built in the site's own black/white/warm-gray
   look, not an embedded Airtable view) that polls Airtable directly every 30 seconds and renders stat
   tiles (total, VIP, free, countries reached), a country breakdown, and a filterable/searchable table.
   It needs its own **read-only** Personal Access Token, separate from the write-only one in
   `js/site.js`: repeat step 4, but scope this one to `data.records:read` only. Keeping it separate
   means read access to registrant PII is confined to this one unlisted page instead of every public
   page of the funnel.
9. Open `dashboard.html`, find near the top of its script:
   ```js
   const AIRTABLE_BASE_ID = '';
   const AIRTABLE_TABLE_NAME = '';
   const AIRTABLE_READ_TOKEN = '';
   const AIRTABLE_OPEN_URL = ''; // optional: a Share view link, for the "Open in Airtable" fallback
   ```
   Paste in the same Base ID and table ID you used in `js/site.js`, and your new read-only token.
   `AIRTABLE_OPEN_URL` is optional, if you want a link out to the real Airtable base too (see its own
   "Share view" button in Airtable if you want that), it's just a convenience, not required for the
   dashboard to work.
10. That dashboard page has no login of its own, just an unlisted, `noindex` URL. Don't link to it from
    anywhere public, and only share the link with people who should see registrant PII (names, emails,
    phone numbers).

**VIP tagging**: the site itself has no way to know who actually paid, that happens entirely inside
Whop. There's no automatic link between a Whop sale and an Airtable row in this setup, so check Whop's
own sales list for who's paid, find that person's row in Airtable (search by email), and tick their
`VIP` checkbox yourself.

## Placeholders still to fill in

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
- Set up Airtable so registrations and survey answers are actually captured, see "Registrations
  dashboard" above. Until then, the form validates and redirects but nothing is stored anywhere.
- `FORM_ENDPOINT` in `js/main.js` is an optional second hook, if you also want registrations sent to an
  ESP/automation tool (Resend, ManyChat, etc.) in addition to Airtable. Leave it empty to skip that.

Dates (October 4–8, 2026, 7PM CEST / UTC+2) are already filled in across `index.html`'s hero, registration
section, and final CTA. Update there if they change.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```
