# The Show Up Everyday Series — Landing Page

A static, mobile-first registration landing page for the free 5-day live experience, styled to match the black / cream / editorial-serif look of sselfie.ai.

## Files

- `index.html` — the landing page (hero, problem, transformation, 5-day breakdown, why-different, what-to-bring, registration form, FAQ, final CTA)
- `confirmation.html` — post-registration page; tells them to check their email for the WhatsApp group link
- `css/styles.css` — all styling: black + warm cream palette, Fraunces (display) + Inter (body), sharp-cornered buttons, hairline-divided lists — matching sselfie.ai's visual system
- `js/main.js` — client-side form validation + redirect to `confirmation.html`
- `images/sandra-hero.jpg` — cropped from a screenshot of sselfie.ai supplied for this task; swap in final campaign photography before launch

## Before launch, fill in these placeholders

- Dates and time are set to October 4–8, 2026, 7PM CEST (UTC+2) — update in `index.html` (hero + registration section) if this changes
- `[INSERT RECORDING DETAILS]` — in `index.html` FAQ ("Will recordings be available?")
- Replace `images/sandra-hero.jpg` with a final, full-resolution photo (the current one is cropped from a low-res screenshot)
- Set `FORM_ENDPOINT` in `js/main.js` to your email/CRM provider's form submission endpoint so registrations are actually captured (currently the form just validates and redirects to the confirmation page)
- Make sure your email/CRM's confirmation email actually includes the WhatsApp group link — the confirmation page no longer links to it directly, it just tells people to check their email

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```
