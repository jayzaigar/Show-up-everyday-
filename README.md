# The Show Up Everyday Series — Landing Page

A static, mobile-first registration landing page for the free 5-day live experience.

## Files

- `index.html` — the landing page (hero, problem, transformation, 5-day breakdown, why-different, about, what-to-bring, registration form, FAQ, final CTA)
- `confirmation.html` — post-registration page, links to the WhatsApp group
- `css/styles.css` — all styling (light/dark aware, warm neutral palette)
- `js/main.js` — client-side form validation + redirect to `confirmation.html`
- `images/` — placeholder SVGs for Sandra's photos

## Before launch, fill in these placeholders

- `[INSERT DATES]` and `[INSERT TIME AND TIMEZONE]` — in `index.html` (hero + registration section)
- `[INSERT WHATSAPP LINK]` — in `confirmation.html` (Join the WhatsApp Group button)
- `[INSERT RECORDING DETAILS]` — in `index.html` FAQ ("Will recordings be available?")
- `[INSERT VERIFIED CREDENTIALS, CUSTOMER RESULTS OR APPROVED TESTIMONIAL]` — in `index.html` About section
- Replace `images/sandra-hero.svg` and `images/sandra-about.svg` with real photos of Sandra (update the `src` attributes in `index.html` if you change file extensions)
- Set `FORM_ENDPOINT` in `js/main.js` to your email/CRM provider's form submission endpoint so registrations are actually captured (currently the form just validates and redirects to the confirmation page)

## Local preview

Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
python3 -m http.server 8000
```
