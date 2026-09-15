# The Show Up Everyday Series: Landing Page

A static, mobile-first funnel for the free 5-day live experience, with a VIP upsell after registration.
Dark editorial look: near-black backgrounds, clay/terracotta accents, cream text, Playfair Display
(display) + Inter (body).

## The funnel

```
index.html (register: first name + email)
  -> confirmation.html ("Thank you for registering" + Click Here to Join the WhatsApp Group)
       -> vip-offer.html (VIP pitch: hero + VSL placeholder + two paths)
            -> Keep Free Ticket -> join-whatsapp-free.html -> free WhatsApp group link
            -> Upgrade to VIP   -> Whop checkout -> (after purchase, Whop redirects to)
                                    join-whatsapp-vip.html -> VIP WhatsApp group link
```

## Files

- `index.html`: the free-series landing page: hero, who-this-is-for, five-day breakdown, why-free,
  registration form, social proof (placeholder), FAQ, final CTA
- `confirmation.html`: post-registration page ("Thank you for registering"), single button to
  `vip-offer.html`
- `vip-offer.html`: the VIP ticket pitch, same hero/VSL-placeholder structure as `index.html`, with two
  buttons: **Keep Free Ticket** (-> `join-whatsapp-free.html`) and **Upgrade to VIP** (-> your Whop
  checkout link)
- `join-whatsapp-free.html`: where free-ticket registrants land, with a button to the free WhatsApp group
- `join-whatsapp-vip.html`: where VIP buyers land after Whop checkout, with a button to the VIP WhatsApp
  group. **This page's deployed URL is what you set as the "after purchase" redirect in your Whop VIP
  product settings.**
- `css/styles.css`: all styling: near-black + clay/terracotta + cream palette, grain-texture overlay, a
  thin ring/lens-mark motif in the hero, Playfair Display + Inter
- `js/main.js`: client-side form validation + redirect to `confirmation.html`; payload is already shaped
  as `{ first_name, email }` to drop into most ESP/automation form-submission APIs
- `images/sandra-hero.jpg`: no longer used on the page; kept in the repo in case it's needed again

## Placeholders still to fill in

- **Whop checkout link**: `vip-offer.html`, the "Upgrade to VIP" button's `href` is
  `[INSERT WHOP CHECKOUT LINK]`. Replace with your real Whop product checkout URL.
- **Free WhatsApp group link**: `join-whatsapp-free.html`, the button's `href` is
  `[INSERT FREE WHATSAPP GROUP LINK]`.
- **VIP WhatsApp group link**: `join-whatsapp-vip.html`, the button's `href` is
  `[INSERT VIP WHATSAPP GROUP LINK]`.
- **VIP ticket copy and VSL**: `vip-offer.html` has placeholder headline/body copy
  (`[INSERT VIP TICKET HEADLINE]`, `[INSERT VIP TICKET OFFER DETAILS...]`) and a VSL placeholder block
  (same pattern as the free page's hero) reserving space for the VIP pitch video. Swap in the real
  headline, offer details, and video embed once you have them.
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
