# ADA / WCAG 2.2 Level AA Audit — thesocialsociety.com

**Theme:** `social-society-dawn-v2` (Shopify Dawn 13.0.x base, heavily customised)
**Branch:** `ada-wcag-2.2` (6 fix commits on top of `main` as of 2026-10-09)
**Audit date:** 2026-10-09
**Audited by:** piroc media (Claude Code assisted)

---

## 1. Scope and method

| Layer | What was done |
|---|---|
| Live site | axe-core 4.10.2 (WCAG 2.0/2.1/2.2 A+AA rules) run on 12 page types: home, collection, product, Balloons page, About Us, events blog + article, private-event request, contact, search, helium-bundle form page, helium bundles collection. Manual keyboard testing of the newsletter popup, mega menu, header search, event RSVP modal and text inputs. |
| Theme code | Every file that differs from stock Dawn 13.0.1 (about 110 files, plus 40 fully custom sections/snippets/assets) was read in full and checked against a WCAG 2.2 A/AA checklist, including the new 2.2 criteria (2.4.11 Focus Not Obscured, 2.5.7 Dragging, 2.5.8 Target Size, 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication). |
| Colour | Contrast ratios computed with the WCAG relative-luminance formula for all 15 theme colour schemes in `config/settings_data.json`, the 10 hard-coded hero schemes in `assets/custom.css`, and every other hard-coded colour pair. |

Not in scope / not testable from the theme: Shopify-hosted customer accounts and checkout, the "Best Custom Product Options" app markup, the Instafeed app block, hCaptcha (not enabled on any form at audit time), and image alt text typed by merchants in the admin (the code passes it through correctly).

Mobile layouts were audited from code only; the browser automation used for the live checks could not emulate a phone viewport.

---

## 2. Summary

| Severity | Found | Fixed in code on this branch | Needs theme-editor change | Needs content / merchant decision |
|---|---|---|---|---|
| Critical | 6 | 6 | 0 | 0 |
| Serious | 24 | 20 | 4 (colour schemes) | 0 |
| Moderate | 22 | 15 | 2 | 5 |
| Minor | 14 | 8 | 0 | 6 |

The site's stock Dawn foundations are sound: skip link, landmarks, `lang`, mega menu (details/summary with `aria-expanded`, Enter/Escape, visible focus), drawers, sliders, header icon target sizes and the facet UI all pass. Nearly every failure comes from the custom layer (custom sections, custom forms, `custom.css`, `custom.js`).

**Three issues would have blocked a keyboard or screen-reader user outright and are now fixed:**
1. The newsletter popup opened on the first visit with focus left behind it, Escape did nothing, and the close control was a non-focusable `<div>`.
2. The event RSVP modal threw a JavaScript error on open (no dialog role), had placeholder-only inputs and a `<div>` close control.
3. Two forms on `/pages/private-event-request` shared every id, so the second form's labels pointed at the first form's inputs.

---

## 3. Findings

Status key: **Fixed** = corrected in code on `ada-wcag-2.2`. **Editor** = must be changed in the Shopify theme editor (colour schemes live in `settings_data.json`, which the editor overwrites). **Content** = merchant content or a design decision. **Open** = deliberately not changed; see note.

### 3.1 Critical

| # | SC | Where | Issue | Status |
|---|---|---|---|---|
| C1 | 2.1.1, 2.1.2, 2.4.3, 2.4.11, 4.1.2 | Newsletter popup, every page (`footer.liquid`, `custom.js`, `custom.css`) | Auto-opens on load; focus never moved into it; Esc inert; Tab cycles the page hidden under the overlay; close is `<div>✖</div>`; dialog has no name or `aria-modal`. Verified live. | Fixed — dialog container is focusable/named/modal, close is a `<button>`, opens after 4 s via `ModalDialog.show(opener)` (focus trap + Esc + focus return), skipped if the visitor is already interacting. |
| C2 | 2.1.1, 2.4.3, 4.1.2 | Event RSVP modal (`events-article.liquid`, `private-events-article.liquid`) | No `[role=dialog]` so Dawn's `show()` throws; focus stays behind overlay; close is a 16×36 px `<div>`. Verified live. | Fixed — dialog wrapper with `aria-modal`/`aria-labelledby`/`tabindex=-1`, 36 px close button, opener has `aria-haspopup`. |
| C3 | 1.3.1, 3.3.2, 4.1.2 | Event RSVP modal fields | Six inputs with placeholder-only labels, no required marking, no `autocomplete`. Verified live. | Fixed — Dawn field pattern with visible labels, `required`/`aria-required`, `autocomplete` tokens, inline `role=alert` error; modal re-opens on server-side error. |
| C4 | 1.3.1, 4.1.2 | `/pages/private-event-request` | Two custom form sections render identical ids (`ContactForm`, `ContactForm-name`, …); labels bind to the wrong form. | Fixed — all ids suffixed with `section.id` in all five custom form sections. |
| C5 | 4.1.2 | Footer "Site Credits" | Click-only `<div>` revealing two hidden links; unreachable by keyboard. | Fixed — `<button aria-expanded>` + `hidden` span. |
| C6 | 3.3.2, 3.3.1, 4.1.2 | Event-ticket waiver checkbox (`main-product.liquid`) | Not marked required; Add-to-cart silently `disabled`; only feedback is a native `alert()`; `id="agree"` duplicated by an unused section. | Fixed — `required`/`aria-required`/`aria-describedby`, button stays enabled, inline `role=alert` message focused on submit. |

### 3.2 Serious

| # | SC | Where | Issue | Status |
|---|---|---|---|---|
| S1 | 2.4.7 | Every text input (`base.css`) | Resting border and `:focus` box-shadow were made identical by the customisation; keyboard focus on inputs invisible. Verified live. | Fixed — distinct double ring on `:focus-visible`. |
| S2 | 2.4.7, 1.4.11 | Header search input (`custom.css`) | Focus box-shadow nulled; no visible boundary. | Fixed. |
| S3 | 2.4.7 | Popup email input | `outline:none; box-shadow:none`. | Fixed. |
| S4 | 2.4.7 | "I'm a local" custom checkbox (newsletter section + popup) | Native input hidden, painted box has no focus state. | Fixed — `:focus-visible ~ .custom-checkmark` ring. |
| S5 | 2.4.3 | Header search close | Summary is `display:none` while open, so Dawn cannot return focus to it; focus dropped to `<body>`. | Fixed — refocus on `toggle`. |
| S6 | 2.4.11 | Always-sticky header | No `scroll-padding-top`; Shift+Tab targets scroll under the header. | Fixed — `html { scroll-padding-top: var(--header-height) }`. |
| S7 | 1.4.3 | Add-to-cart and every quick-add button | White 12 px text on violet `#BFA3DE` = **2.2:1**. Verified live on collection and product pages. | Fixed — dark `#141417` text (8.3:1). |
| S8 | 1.4.3 | Hero / sub-hero colour schemes (`custom.css`) | pink/orange 2.4:1 (live on Balloons page), blue/red 3.3:1 (fails body copy), red/pink 3.9:1 (fails body copy), orange scheme text same colour as background, forced white `<strong>` 1.3–2.2:1 on light schemes. | Fixed — see commit for the new pairs (all ≥ 4.5:1 for body text). Design review recommended: the pink hero now uses deep blue (same pair as the existing pink theme scheme). |
| S9 | 1.4.3 | Theme colour scheme **scheme-5** (pink bg / orange text) | 2.43:1. Used by the home image-with-text section and collection banner blocks. Verified live on home. | **Editor** — change text/button to `#2e159b` (8.1:1) or `#141417` (12.1:1). |
| S10 | 1.4.3 | Theme colour scheme **fc47b201** (orange bg / pink text) | 2.43:1. Home "Let's Get Spooky" featured collection. Verified live. | **Editor** — text `#141417` (5.5:1) or `#ffffff` (3.7:1, headings only). |
| S11 | 1.4.3 | Theme colour scheme **baf667b2** (cream bg / violet text) | 2.12:1. Collection interjection + random image-with-text block on every product template. | **Editor** — text `#141417` (17.6:1) or `#2e159b` (11.9:1). |
| S12 | 1.4.3 | Theme colour schemes **36c0b6f9** (blue / red) and **356e8cfa** (red / blue) | 3.25:1 — passes only for ≥ 24 px text; fails the 16 px body copy in rich-text, newsletter and image-with-text-rnd sections. | **Editor** — use `#2e159b` on blue (7.3:1) and `#ffffff` on red (5.9:1). |
| S13 | 1.4.3 | About Us / Celebrate With Us static blocks (block colour settings) | pink/orange 2.43:1 on two blocks. Verified live on About Us. | **Editor** — set those blocks' text colour to `#141417` or `#2e159b`. |
| S14 | 1.4.3 | Contact page address block | red on pink at 13 px = 3.9:1. Verified live. | Fixed — deep blue (8.1:1). |
| S15 | 1.4.3 | Product card "red" badge | pink on red at 16 px = 3.9:1. | Fixed — white (5.9:1). |
| S16 | 1.4.3 | Collection interjection orange scheme | pink on orange 2.4:1. | Fixed — dark (5.5:1). |
| S17 | 1.4.4 | Hero and collection titles | Font size in pure `vw/vh` units ignores browser zoom (F94). | Fixed — rem component added. |
| S18 | 2.5.8 | Footer menu links (20 per page) | 21 px tall, no padding. Flagged by axe on every page. | Fixed — padded to ≥ 24 px. |
| S19 | 4.1.2, 1.3.1 | `mce-MMERGE60` duplicate id | Popup "I'm a local" label toggled the on-page section's checkbox. | Fixed. |
| S20 | 4.1.3, 3.3.1 | Popup form result | After submit the page reloads with the popup hidden for a year, so success/error messages were invisible. | Fixed — re-opened when a form message is present. |
| S21 | 4.1.3 | Quick-order list live region | JS looked up an id the snippet had renamed; status updates threw. | Fixed. |
| S22 | 1.3.1 | Collection "interjection" block | `<div>` as a direct child of the product `<ul>` (axe `list`). | Fixed — `<li>`, heading markup. |
| S23 | 2.4.4 | Share buttons on event articles | Shared the homepage instead of the article (`product.url` on an article). | Fixed — uses the passed link/title/image. |
| S24 | 2.4.4 | Press cards | Title `display:none`; every card exposed an identical "VIEW ARTICLE" link. | Fixed — visually-hidden title, link carries the article name. |

### 3.3 Moderate

| # | SC | Where | Issue | Status |
|---|---|---|---|---|
| M1 | 1.3.1, 2.4.6 | Balloons, About Us, custom-form pages, event articles | No `<h1>` (or an empty one). Verified live. | Fixed — hero headline is `h1` when it is the first section (editor override available); event title is `h1`; empty custom-form `<h1>` suppressed. Note: pages whose first section is not a hero (e.g. a rich-text or main-page section) still rely on the merchant's content for an h1. |
| M2 | 1.3.1 | About Us blocks, interjection, teaser, popup | Visual headings coded as `<div>`. | Fixed. |
| M3 | 1.1.1 | About Us, image-with-text-rnd, contact form | Decorative inline SVGs read as "image". | Fixed — `aria-hidden`. |
| M4 | 1.1.1, 2.4.4 | Mega menu images, collections section | alt duplicated link text or contained junk (`Title _ handle`). | Fixed — `alt=""` inside text links. |
| M5 | 2.4.4 | Featured collection "SHOP NOW", card "READ MORE" | Repeated generic links. | Fixed — visually-hidden product/article name appended. |
| M6 | 2.4.4 | Article cards (`article-card.liquid`) | Undefined `article_url` produced empty `href`. | Fixed. |
| M7 | 4.1.3 | Search page result count | `display:none` on the `role=status` region. | Fixed — visually hidden. |
| M8 | 3.3.1 | Contact/custom forms after a server error | Script hid the whole form on the error heading too. | Fixed. |
| M9 | 3.3.2 | Custom forms | Required fields marked only by "*" in text; no `required`. | Fixed. |
| M10 | 1.4.1 | Random-colour section links | Same colour as text, no underline. | Fixed — underlined. |
| M11 | 2.4.4 | External links forced to `target=_blank` by `custom.js` | No new-window notice. | Fixed — `aria-describedby="a11y-new-window-message"`. |
| M12 | 1.3.1, 4.1.2 | Drawer search input id | Duplicated the search page's input id. | Fixed. |
| M13 | 3.2.4, 1.4.3 | `main-collection-banner.liquid`, `image-with-text-rnd.liquid` | A **random** colour scheme is picked on every page load; with the failing schemes above, contrast failures appear intermittently. | **Editor** (fix the schemes, S9–S12). Recommendation: pick the scheme deterministically. **Open** as a design decision. |
| M14 | 3.3.2 | Custom forms date/time fields | Free-text date with no format hint. | **Open** — recommend `type="date"` + `type="time"`, or a hint via `aria-describedby`; left as is because it changes what the merchant receives by email. |
| M15 | 1.3.1 | Custom forms `<select>` floating label | Label precedes the select so Dawn's float rules never fire; may overlap chosen value. | **Open** — needs a visual check once deployed. |
| M16 | 1.4.10 | Blog "empty" state, 100 px blog titles | Fixed 600 px width; no mobile size for 100 px uppercase titles. | **Open** — needs a 320 px visual check once deployed. |
| M17 | 2.2.2 | Announcement bar `auto_rotate: true`, 3 s | Only one block is enabled, so nothing rotates today. | **Content** — set auto-rotate off or ≥ 5 s if a second message is added. |
| M18 | 3.2.3 | Mobile menu drawer | Drops the last two links of every submenu (they are the desktop "featured" cards). | **Content** — confirm those destinations are reachable on mobile; otherwise render them as plain links. |
| M19 | 1.1.1 | Cart drawer upload thumbnails | `alt="Uploaded file"` for every file. | **Open** — minor; main cart uses the property name. |
| M20 | 1.4.13 | Volume-pricing popover | Hover-opened popover closes with Escape only when opened by click. | **Open** — stock Dawn behaviour with a partial customisation. |
| M21 | 2.4.4 | Blog rich-text buttons | "DOWNLOAD HERE" (PDF) / "LEARN MORE" with no context; `article.json` has placeholder "Button label" sections. | **Content**. |
| M22 | 4.1.3, 2.3.3 | Bulk quick-add progress bar | Purely visual loading state; infinite animation with no reduced-motion guard. | **Open**. |

### 3.4 Minor

| # | SC | Where | Issue | Status |
|---|---|---|---|---|
| m1 | 2.1.1, 2.3.3 | Card clip-path hover animation | Mouse-only; no reduced-motion guard; could throw on cards without a clip. | Fixed. |
| m2 | 1.3.1 | Footer column titles | `<span>` styled as headings. | Fixed — `<h3>`. |
| m3 | 1.1.1 | Hero image alt | Unescaped. | Fixed. |
| m4 | 4.1.2 | RSVP / newsletter openers | No `aria-haspopup="dialog"`. | Fixed (RSVP); newsletter opener button not enabled in any template. |
| m5 | 1.3.1 | `<p>` inside `<h2>` (richtext headings) | Invalid nesting. | Fixed where rendered (hero, address heading, interjection). |
| m6 | 2.4.11 | `body.overflow-hidden { overflow: visible !important }` | Lets the page scroll behind open drawers/modals. | **Open** — reason for the override is unknown; removing it may affect the GSAP/parallax section. |
| m7 | 3.1.2 | Hardcoded English strings ("Back to Events", "READ MORE") | Not translatable. | **Open** — single-locale store. |
| m8 | 4.1.2 | Header search keeps `role="dialog" aria-modal` while rendered inline | Semantics no longer match the visual. | **Open**. |
| m9 | 2.5.3 | Facet swatch names rely on `title` | Stock Dawn pattern. | **Open**. |
| m10 | — | Duplicate `Details-HeaderMenu-N` ids between primary and secondary menus | Not referenced by ARIA. | **Open**. |
| m11 | — | `.no-js` progressive-enhancement fallbacks removed from stock sections | Not a WCAG failure. | **Open**. |
| m12 | 2.5.8 | Facet swatches | Exactly 24 px. | Passes. |
| m13 | — | Popup SIGN UP button 9 px | Readability. | Fixed — 1.2 rem. |
| m14 | 3.2.6 | Consistent Help | Contact link is in the footer on every page. | Passes. |

---

## 4. Theme-editor actions (cannot be done in code)

Colour schemes are stored in `config/settings_data.json`, which the theme editor overwrites, so these are changed in **Online Store → Themes → Customize → Theme settings → Colors**. Suggested values keep the brand backgrounds and change only the text/button colour:

| Scheme (editor label order may differ) | Background | Current text | Ratio | Suggested text | Ratio |
|---|---|---|---|---|---|
| scheme-5 | `#ffbfe1` pink | `#f5420d` orange | 2.43 | `#2e159b` deep blue | 8.13 |
| fc47b201… | `#f5420d` orange | `#ffbfe1` pink | 2.43 | `#141417` dark | 5.5 |
| baf667b2… | `#fcfaf5` cream | `#bfa3de` violet | 2.12 | `#2e159b` deep blue | 11.9 |
| 36c0b6f9… | `#a6c4eb` blue | `#c91325` red | 3.25 | `#2e159b` deep blue | 7.3 |
| 356e8cfa… | `#c91325` red | `#a6c4eb` blue | 3.25 | `#ffffff` white | 5.9 |
| About Us / Celebrate With Us blocks 1 & 3 | pink / orange | orange / pink | 2.43 | `#141417` | ≥ 5.5 |

After changing them, re-run axe on the home page, `/collections/all`, a product page, `/pages/about-us` and `/blogs/press`.

---

## 5. Verification after the branch is connected to a theme

1. Preview theme → run axe DevTools (or Lighthouse accessibility) on the 12 page types above. Expected: 0 colour-contrast violations once section 4 is done; 0 target-size; 0 list; every page has one h1.
2. Keyboard: load the home page in a private window, wait 4 s — the popup opens with focus on the dialog, Tab stays inside it, Escape closes it and focus returns to the page. Tab to the header search icon, Enter, Escape — focus returns to the icon. Tab into any input — a double ring is visible.
3. Screen reader (VoiceOver): open an event article → RSVP → every field announces its label and "required"; close button announces "Close, button".
4. Mobile (real device or DevTools 390 px and 320 px): popup close button visible top-right; hero and blog titles do not overflow; drawer submenus complete.
5. Product `/products/event-ticket…`: Add to cart without the waiver box → inline error, focus on the checkbox, nothing added.

---

## 6. Notes for the later phases

- **SEO (phase 2):** `layout/theme.liquid` line 27 writes `<meta name=’robots’ content=’noindex’>` with typographic quotes, so the terms-of-service noindex is not parsed. Several pages had no h1 (now fixed). `snippets/meta-tags.liquid` has a hard-coded fallback `og:image`.
- **Performance (phase 3):** GSAP + ScrollTrigger (116 KB) are loaded on every page although the only section using them (`about-us.liquid`) is not assigned to any template; `.otf`/`.ttf` font files are served alongside woff2; `custom.css` is 2,300 lines loaded globally.
