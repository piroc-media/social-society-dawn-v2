# Performance Audit — thesocialsociety.com

**Theme:** `social-society-dawn-v2` (Shopify Dawn 13.0.x base, customised)
**Branch:** `performance-audit` (branched from `seo-audit`, which is on top of `ada-wcag-2.2`; 6 commits)
**Audit date:** 2026-10-09
**Audited by:** piroc media (Claude Code assisted)

---

## 1. Scope and method

- **Live measurement:** Lighthouse 12 performance category, mobile (simulated Moto G, slow 4G) on home (two runs), `/collections/all`, a product page and `/pages/balloons`; desktop on home. Network inventory, main-thread breakdown, LCP element and phases, layout-shift sources, per-script CPU time.
- **Theme code:** every customised file reviewed for render-blocking assets, font delivery, image delivery (srcset / lazy / priority), dead or duplicated code, inline styles repeated per card or per section, stylesheet links emitted per card, and unreferenced files.
- **Constraint:** no visual change. Every fix applied is markup- or delivery-level; the ones that would change rendering are listed in §5 as optional follow-ups with a check procedure.

---

## 2. Headline results (live site, before this branch)

Mobile Lighthouse performance score:
- Home: 35 and 52 on two runs (high variance, see §3.1)
- /collections/all: 59
- Product page: 45
- /pages/balloons: 48
- Home, desktop: 76

Core Web Vitals, mobile:
- LCP: 4.8 to 12.3 s on home, 3.9 s collection, 5.5 s product, 6.7 s Balloons (target ≤ 2.5 s)
- CLS: 0.76 to 0.84 on every page (target ≤ 0.1)
- TBT: 120 to 270 ms (acceptable)

Page weight on home: 340 requests, 2.9 MB transferred. Scripts 827 KB, images 757 KB, fonts 269 KB. Theme-origin assets are a small share of that; third-party scripts dominate.

---

## 3. Findings

### 3.1 The custom-options app is the single biggest cost (client action)

The "Best Custom Product Options" app embed (`cdn.shopify.com/extensions/…/best_custom_product_options.js`, 200 KB) consumed 12 to 16 seconds of main-thread CPU on the simulated mobile device on the home page and on `/pages/balloons`, pages that have no product form at all. On desktop it was 3 seconds. Its code sets a 1-second `setInterval` that scans the whole page for add-to-cart forms and re-processes them, plus three other intervals. On the home page that is 71 percent of the LCP time (render delay) and it is why the mobile score swings between 35 and 52 from run to run.

This is outside the theme. Options, in order of preference:
1. Ask the app vendor to stop polling on pages without a product form, or to load only on product templates (check the app's settings for a "load on product pages only" option first).
2. If the custom options are only used on a handful of products, consider replacing the app with native Shopify variant/line-item properties for those products and removing the embed.
3. At minimum, disable the app embed on the preview theme to measure the difference: expect mobile LCP on home to drop by several seconds.

Other third-party weight that the client controls in the admin, not the theme: Google Tag Manager (154 KB), Facebook pixel (207 KB, 165 ms blocking), Shopify web pixels, Mailchimp, Intuit pixel, "Wrapped" gift-wrap embed. None are theme code.

### 3.2 Layout shift came entirely from the newsletter popup (fixed)

Every page measured 0.76 to 0.84 CLS, and Lighthouse attributed all of it to the popup's slide-up animation: the 1050 px panel animated the `bottom` property over one second, so every frame was recorded as a layout shift. It now animates with `transform`, which the compositor handles without layout. Same motion. Expected CLS after deploy: near zero on all pages (one small 0.03 shift from web-font swap remains, see §5).

### 3.3 Fonts (fixed)

- Figtree (3 weights) and Imbue were served as TTF. Converted to WOFF2 (39 KB → 16 KB each, 88 KB → 32 KB), same glyphs. The TTF files are removed.
- The two Dawn font preloads pointed at the Assistant fonts from theme settings, which the theme never paints (it hard-codes Figtree and ABC ROM). Those preloads downloaded 12 KB of unused font on every visit. Replaced with preloads for the two above-the-fold fonts and the `preload_tag` filter; the Shopify font CDN preconnect is removed.
- Removed an unreferenced BNChowder face (32 KB) and an invalid `.otf` source (224 KB file) that browsers skipped anyway.

Still loaded on every first visit: about 240 KB of fonts (EdwardianScript 64 KB and ABC ROM 55 KB are display faces used for a few words each). Subsetting them is the remaining lever (§5).

### 3.4 LCP images (fixed)

- Home and page heroes: fixed 1440 px file, no srcset, default priority (done on the SEO branch: responsive srcset, eager, `fetchpriority=high`).
- Collection and product pages: 2.6 to 2.9 s "load delay" before the LCP image even started. The first two collection cards and the first product media now carry `fetchpriority=high`.
- `/pages/balloons`: the LCP was the first sub-hero image, which was lazy-loaded and started 4.2 s in. Sub-heroes in the first two section slots now load eagerly with high priority.
- Event article hero: fixed 900 px, no srcset. Now responsive, eager, high priority.

### 3.5 Oversized images (fixed)

Several custom sections requested one fixed width regardless of the rendered size. Lighthouse estimated 456 KB of wasted image bytes on home. Now served with srcset/sizes matched to the layout:
- Collections circles: 500 px files rendered at 180 px
- Product compilation: six 500 px tiles rendered at about 250 px, plus the 900 px side image
- Image-with-text (random colour) on every product page
- About Us block images (600 px fixed)
- Collection interjection image (700 px fixed)

### 3.6 Dead code and files removed (fixed)

- `about-us.liquid` (GSAP parallax variant) was not assigned to any template but kept `gsap.min.js` (72 KB) and `ScrollTrigger.min.js` (43 KB) in the theme and about 70 lines of dead code in `custom.js`, including a MutationObserver that fired on every header scroll toggle and did nothing.
- `event-ticket-waiver-checkbox.liquid`: unused duplicate of the live waiver block with a broken script.
- `sparkle.gif` (179 KB): Dawn easter-egg asset referenced only by an unused CSS variable.
- Dead CSS selectors in `custom.css` that could never match.
- Theme asset folder: 2,060 KB → 1,396 KB.

### 3.7 Markup bloat (fixed)

- `card-product.liquid` emitted five stylesheet `<link>` tags per card, three added by the customisation. On a 24-product collection page that was 120 link elements and 15 KB of HTML; two of the stylesheets were for a quick-add mode no template uses. Now one set per section as in stock Dawn.
- The five custom-form sections each inlined the same 43-line `<style>` block (emitted twice on the private-event-request page). Moved to one cached stylesheet.
- The sold-out banner `<style>` was emitted once per article card on the events blog. Moved to `custom.css`; the banner PNGs go through Shopify's image CDN with lazy loading on cards.

### 3.8 Checked and fine

- Server response: 10 ms TTFB at origin; Shopify CDN.
- No render-blocking resources flagged by Lighthouse beyond the two theme stylesheets (stock pattern).
- `animations_reveal_on_scroll` is off, so `animations.js` is not loaded.
- Dawn's per-section CSS loading, lazy-loading of below-fold cards, and cart drawer are stock behaviour.
- `base.css` and `global.js` differ from stock only in formatting and small functional changes; no performance regressions.

---

## 4. What to verify after the branch is connected to a theme

1. Run Lighthouse (mobile) on home, `/collections/all`, a product, `/pages/balloons` and an event article. Expect: CLS ≤ 0.05 on all pages; LCP improved on collection, product, Balloons and event pages. Home LCP will remain dominated by the app script until §3.1 is addressed.
2. View source on a collection page: one `component-price.css` link per section, none per card.
3. Check the network panel on the home page: fonts load as `.woff2` only; no `assistant_n4` font request; no `.ttf`.
4. Visual spot-check (expected unchanged): home collections circles and product compilation tiles, About Us block images, a product page's random-colour section, the collection "interjection" block, the custom form pages (heading spacing), an event article with a sold-out banner.
5. Then, with the client, temporarily disable the custom-options app embed on the preview theme and re-run Lighthouse on home to quantify §3.1 for the vendor conversation.

---

## 5. Optional follow-ups (carry some visual risk, need a check on the preview theme)

- **Scope `custom.css` by section.** About 65 percent of the 44 KB file (28 KB raw, 5 KB compressed) is specific to one section or template (hero schemes, about-us, contact/custom forms, events/press blog, product page, interjection). Moving those blocks into per-section stylesheets reduces render-blocking CSS on every page but changes cascade order; every template type would need a visual check. The audit's line-range map is in the branch history (commit message of the audit) if this is picked up.
- **Subset the display fonts.** EdwardianScript and ABC ROM Compressed are used for a few words each; a Latin subset would cut roughly half of their 120 KB.
- **Font-swap shift.** The remaining 0.03 CLS on home comes from the ABC ROM heading swapping in. A metric-matched fallback (`size-adjust` on a local fallback face) removes it; needs a visual check of the fallback frame.
- **Unused colour schemes.** 15 schemes emit about 15 KB of inline CSS in `<head>` on every page; at least two appear unused in templates. Confirm in the theme editor before deleting.
- **Mega menu product cards.** If any featured menu links are products, full product cards render in the hidden menu on every page; a slimmer tile would cut DOM size. Depends on the menu contents in the admin.
- **Unused stock sections** (collage, slideshow, multirow, featured-product, collection-list, page, quick-order-list) and the unused custom-form variants only clutter the editor; no runtime cost.
