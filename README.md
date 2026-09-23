# The Show Up Everyday Series: Landing Page

A static, mobile-first funnel for the free 5-day live experience, with a VIP upsell after registration.
Strict black/white/warm-gray editorial look, matched to sselfie.ai: near-black background (`#0B0B0B`),
cream headlines (`#F5F3EE`), muted warm-gray body copy (`#A8A49C`), solid white CTA buttons with black
text, thin hairline dividers, no gradients, glow, grain texture or color accents. Instrument Serif
(display) + Inter (body).

## The funnel

```
index.html (register: first name, email, WhatsApp number, reminder consent)
  -> join-whatsapp-free.html ("Join the WhatsApp group to lock in your spot")

index.html ("Choose your path" section)
  -> Get VIP Pass -> Whop checkout -> (after purchase, Whop redirects to)
                       join-whatsapp-vip.html -> VIP WhatsApp group link
```

The `name` from registration is carried through the URL (`?name=...`) to `join-whatsapp-free.html`, so
it's available to personalize it further if you want. If Airtable is configured (see below), the
registrant's new record id is also carried through as `?rid=...`.

## Files

- `index.html`: the free-series landing page: hero, who-this-is-for, five-day breakdown (with a
  scroll-drawn trail connecting the five days, see below), why-free, registration form, social proof
  (placeholder), FAQ, final CTA
- `vip-offer.html`: standalone VIP ticket pitch page, no longer linked from the main funnel (the landing
  page's "Choose your path" section links straight to the Whop checkout instead); kept in the repo in
  case it's needed again
- `join-whatsapp-free.html`: where registrants land immediately after submitting the registration form,
  with a button to the free WhatsApp group
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
  one after another instead of popping in all at once), and holds the `AIRTABLE_*` config +
  `airtableRequest()` helper used to write registrants into your dashboard's data source
- `js/main.js`: client-side registration form validation, writes the registrant into Airtable, then
  redirects straight to `join-whatsapp-free.html`
- `images/sandra-hero.jpg`: no longer used on the page; kept in the repo in case it's needed again

## The registration form

Four fields only: first name, email, WhatsApp number (with a country-code dropdown covering ~50
countries), and a required consent checkbox ("I agree to receive event reminders on WhatsApp"). The
country code and number are combined into one `whatsapp` field in the submitted payload.

## The day-by-day scroll trail on index.html

The "What the five days look like" list has a winding, map-style route connecting day 01 through 05,
drawn progressively as you scroll past it, with hollow ring markers at each day and a small filled mark
traveling along it to show current scroll position. The route's shape is computed at runtime from each
`.day-number`'s real position (so it stays aligned even if content reflows) and rebuilt on resize. Built
with [GSAP](https://gsap.com) plus its ScrollTrigger, DrawSVG, and MotionPath plugins, loaded from a CDN
only on `index.html` (no other page needs it). If any of those four scripts fail to load, a guard at
the top of the inline script just returns early, the day-by-day list still works fine without the
effect, nothing else on the page breaks. It also respects `prefers-reduced-motion`, showing the line
fully drawn and the mark at rest instead of animating. The line itself and the mark are plain
monochrome (matching `--line`/`--cream`), no color added.

## The starfield background

Every customer-facing page (`index.html`, `vip-offer.html`, `join-whatsapp-free.html`,
`join-whatsapp-vip.html`) has a subtly drifting starfield behind its
near-black hero/wrap section: three layers of plain `var(--cream)` dots (~120 total, deliberately
sparse), each layer looping upward at a different speed (90s/150s/220s) so it reads as ambient texture
rather than a distraction. Pure CSS (the classic `box-shadow`-per-dot technique), no JS, no gradient
background or gradient text anywhere, matching the strict monochrome brief. Respects
`prefers-reduced-motion` (stops the drift entirely). The shared markup is:
```html
<div class="stars-layer" aria-hidden="true">
  <div id="stars"></div>
  <div id="stars2"></div>
  <div id="stars3"></div>
</div>
```
placed as the first child inside the page's `.hero` or `.confirm-wrap`, both of which have
`position: relative` so the star layer's `position: absolute; inset: 0;` clips correctly.
**`dashboard.html` deliberately does not have this.** It's an internal data tool, not a brand moment,
and decorative motion isn't worth the distraction there.

## The hero countdown on index.html

A custom split-flap digit display counts down to the first live day (October 4, 2026, 7PM CEST),
sitting between the event facts and the "Save My Spot" button. No external dependency, pure vanilla
JS/CSS. Days/Hrs/Min/Sec, each digit built from seven clip-path bar segments (matching a real
seven-segment display), lit or dimmed via a `--act` custom property per digit value. Once the target
time passes, it swaps to a plain "We're live now." message instead of counting into negative numbers.
Respects `prefers-reduced-motion` (disables the digit-change transition) and includes the same Safari
clip-path rendering fix as the original reference snippet this was adapted from.

If you ever touch this component's CSS: every digit is a `<figure>`, and this project's global reset
only sets `box-sizing` (not `margin: 0`), so `<figure>`'s browser-default `margin: 1em 40px` will leak
back in if that explicit `margin: 0` on `.digit-group .digit` is ever removed, it did once during
development and silently blew the layout out to several times its intended width.

## The VIP inclusions stagger on vip-offer.html

The three "What you get with VIP" cards scale and fade in with a restrained bounce (`back.out(1.2)`,
not GSAP's default punchier overshoot), staggered outward from the center card as the section scrolls
into view. Built with GSAP + ScrollTrigger only (no DrawSVG/MotionPath needed here), loaded from a CDN
only on `vip-offer.html`. Uses `gsap.fromTo()` with explicit start and end values rather than
`gsap.from()`, since `.from()` can mis-capture its "to" state when combined with ScrollTrigger's
refresh cycle (it did, in testing, animate from opacity 0 back to opacity 0). Same fail-safe pattern as
the day-trail: if GSAP or ScrollTrigger fail to load, or `prefers-reduced-motion` is set, the cards just
show normally with no animation.

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

- **Headline**: three options for `index.html`'s hero are written out in an HTML comment above the hero.
  The first one is live; swap in a different one by editing the `<h1>`.
- **Open Graph image**: `index.html`'s `<meta property="og:image">` points to `images/og-cover.jpg`, which
  doesn't exist yet. Export the series cover art at 1200×630 and drop it in at that path.
- The grain texture and ring/lens-mark motif in both heroes are built with CSS/SVG, not the actual series
  cover art (which wasn't available to build from). Swap in the real cover art treatment if you have it.
- Set up Airtable so registrations and survey answers are actually captured, see "Registrations
  dashboard" above. Until then, the form validates and redirects but nothing is stored anywhere.
- `FORM_ENDPOINT` in `js/main.js` is an optional second hook, if you also want registrations sent to an
  ESP/automation tool (Resend, ManyChat, etc.) in addition to Airtable. Leave it empty to skip that.

The start date (October 4, 2026, 7PM CEST / UTC+2) is already filled in across `index.html`'s hero, registration
section, and final CTA. Update there if they change.

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```
