# SEO Audit — thesocialsociety.com

**Theme:** `social-society-dawn-v2` (Shopify Dawn 13.0.x base, customised)
**Branch:** `seo-audit` (branched from `ada-wcag-2.2`, so it includes the accessibility fixes; 4 SEO commits)
**Audit date:** 2026-10-09
**Audited by:** piroc media (Claude Code assisted)

---

## 1. Scope and method

| Layer | What was done |
|---|---|
| Live site | Lighthouse 12 SEO category (mobile) on home, `/collections/all`, a product, an in-store event article and About Us. Head inspection of 20 live URLs (title, meta description, canonical, robots, Open Graph, Twitter card, JSON-LD types, h1, image alt, rel prev/next). robots.txt, sitemap index, 404 status, http→https and www→apex redirects. |
| Theme code | Every file that differs from stock Dawn 13.0.1 plus all custom sections reviewed for: title/meta construction, canonical, robots logic, structured data, heading hierarchy, image delivery (srcset, lazy/eager, LCP), link quality (empty hrefs, absolute internal links, generic anchor text), pagination, template/content hygiene (placeholder sections), and SEO-relevant performance signals. |

Not in scope: keyword strategy, backlinks, Google Business Profile, Search Console data (no access), and the Shopify-hosted checkout and account pages.

---

## 2. Summary

**Platform fundamentals are healthy.** Canonicals are self-referencing, `?page=N` carries rel prev/next and its own canonical, robots.txt (Shopify-managed) disallows cart/checkout/account/filter-sort URLs, the sitemap index lists products, collections, pages, blogs, articles and metaobject pages, 404s return a real 404, and www/http redirect 301 to `https://thesocialsociety.com`. Product pages carry valid Product JSON-LD with price and availability. Lighthouse SEO scores before fixes:

| Page | Score | Failing audit |
|---|---|---|
| Home | 92 | Generic "READ MORE" link text (fixed on the ADA branch) |
| /collections/all | 100 | — |
| Product | 100 | — |
| In-store event article | 92 | Generic "READ MORE" link text (fixed) |
| About Us | 85 | No meta description (fixed via fallback); "here" anchor text (content, see §5) |

**What was actually hurting the site** was all in the custom layer and the content:

1. The `noindex` tag on the duplicate Terms of Service page was written with typographic quotes and never worked, so two copies of the policy compete.
2. 11 of 20 sampled URLs had **no meta description** (every blog index, About Us, Contact, Party in a Box, Slumber Parties, policies), and two had junk ones ("Coming soon", "And Have Fun Doing It!").
3. Article structured data pointed `mainEntityOfPage` at the homepage on every article.
4. No local-business structured data for a physical store, and no Event data for the in-store events, which are the site's most distinctive content.
5. Several key pages had **no h1** (About Us, Balloons, Party in a Box, Slumber Parties, custom-form pages, every event article) and the home page had two.
6. The default article template rendered Dawn's placeholder sections ("HEADLINE", "Share information about your brand…", a dead "Button label" button) on live articles.
7. The hero image, the LCP element on the home page and eight page templates, was a fixed 1440px file with no srcset or fetch priority.

---

## 3. Findings and status

Status key: **Fixed** = on the `seo-audit` branch. **Content** = merchant/client action in the Shopify admin. **Open** = recommended, not done (reason given). **Phase 3** = handled in the performance phase.

### 3.1 Indexing and metadata

| # | Issue | Where | Status |
|---|---|---|---|
| I1 | `noindex` for `/pages/terms-of-service` used `’robots’` quotes and was ignored; the canonical copy is `/policies/terms-of-service`. | `layout/theme.liquid` | Fixed. Also noindex,follow on internal search results and the 404 page. |
| I2 | No meta description on 11/20 sampled URLs. `page_description` is only set when an SEO description was typed in the admin. | `layout/theme.liquid` | Fixed. Fallback chain: admin SEO description → product/collection description, article excerpt-or-content, page content (155 chars) → shop description. og/twitter description use the same chain. |
| I3 | Weak admin descriptions: `/pages/balloons` "Coming soon"; `/collections/all` and `/collections/balloons` use the collection description ("And Have Fun Doing It!", blank). | Admin content | **Content** — write 120–155 char descriptions for the top collections and pages (list in §5). |
| I4 | Titles are fine: `Page title – The Social Society`, pagination suffix, home title "The Social Society, Ponte Vedra Beach". | — | OK |
| I5 | Blog index titles are bare ("In-Store Events – The Social Society"). | Admin (blog SEO title) | **Content** — e.g. "In-Store Events in Ponte Vedra Beach – The Social Society". |
| I6 | `og:image` fallback is a hard-coded Instagram icon URL for every page without its own image (home, blogs, pages). | `snippets/meta-tags.liquid` | **Open** — upload a 1200×630 share image in Theme settings → Social media → Share image (Dawn's `page_image` then uses it automatically); then the hard-coded fallback can be removed. |
| I7 | Collection tag pages (`/collections/x/tag`) are indexable with a "– tagged" title. | — | OK while tags are few; add `current_tags` to the noindex condition if tag pages multiply. |

### 3.2 Structured data

| # | Issue | Where | Status |
|---|---|---|---|
| SD1 | Organization node only; the business is a physical store (address, phone, hours exist on the Contact page). `sameAs` contained empty strings. | `sections/header.liquid` | Fixed — `Store` node (`@id …/#store`) with address/phone/email from **Settings → Store details**, opening hours and optional price range/geo from new header section settings (hours default = the Contact page hours), clean `sameAs`. |
| SD2 | Article JSON-LD `mainEntityOfPage.@id` = homepage on every article (inherited Dawn bug); type `Article`; no `dateModified`; UTC-suffixed dates. | `main-article`, `events-article`, `private-events-article` | Fixed — `BlogPosting`, `@id` = article URL, `dateModified`, store-timezone offsets, description fallback. |
| SD3 | No Event structured data for in-store events. | `sections/events-article.liquid` | Fixed — `Event` with name, start/end from the `event_date_time` metafields, location = store address, offers (price, FREE → 0, SOLD OUT → `SoldOut`, ticket link from `press_link_url`), image, organizer. Only emitted when a start date exists. |
| SD4 | Product JSON-LD is stock Dawn and valid. | `sections/main-product.liquid` | OK (Merchant Center may warn about `priceValidUntil`; not needed for Search). |
| SD5 | `WebSite` + `SearchAction` on the home page. | `sections/header.liquid` | OK |
| SD6 | No `BreadcrumbList`. | — | **Open** — the site has no visible breadcrumb trail; Google expects breadcrumb markup to reflect visible navigation. Add together with a breadcrumb bar if wanted. |

### 3.3 Headings

| # | Issue | Where | Status |
|---|---|---|---|
| H1 | No h1 on About Us, Celebrate With Us, Balloons, Party in a Box, Slumber Parties, the three custom-form pages, `/collections`, and every in-store event article. | hero, about-us-static, main-list-collections, events-article | Fixed — hero and about-us-static headline tag settings (set to h1 in the affected templates), event title is the h1, collections list falls back to the page title. |
| H2 | Home page had two h1s: Dawn's logo h1 plus an `<h1>` typed into the product-compilation richtext. | `sections/product-compilation.liquid` | Fixed — a typed h1 in that richtext is rendered as h2. |
| H3 | Card headings are h3 under section h2s. | — | OK |

### 3.4 Images and LCP

| # | Issue | Where | Status |
|---|---|---|---|
| IM1 | Hero image: single 1440px `src`, no `srcset`, no `fetchpriority`. It is the LCP element on the home page and eight page templates. | `sections/hero.liquid` | Fixed — `image_tag` with 375–1920 widths, `sizes`, `loading="eager"`, `fetchpriority="high"`. |
| IM2 | Sub-hero image: fixed 700px, no srcset. | `sections/sub-hero-section.liquid` | Fixed — srcset, lazy. |
| IM3 | Event article hero (900px fixed) and collection interjection image (700px fixed). | `events-article.liquid`, `main-collection-product-grid.liquid` | **Phase 3** |
| IM4 | Alt text: all sampled live images have alt attributes; quality depends on admin content. | — | OK |

### 3.5 Links

| # | Issue | Where | Status |
|---|---|---|---|
| L1 | Generic "READ MORE" / "VIEW ARTICLE" card links (Lighthouse `link-text`). | article-card snippets | Fixed (ADA branch + this branch for the Little Miss Party cards). |
| L2 | Empty `href=""` when a metafield is blank: press card title, Little Miss Party cards, related-products collection link. | snippets, related-products | Fixed — guards/fallbacks. |
| L3 | Internal links written as `https://thesocialsociety.com/…` and/or `target="_blank"` in home, About Us and Celebrate With Us content. | templates JSON | Fixed — root-relative, same tab. |
| L4 | Weak anchor text in page copy: "here", "Click here to learn more", "LEARN MORE HERE". | About Us, Celebrate With Us content | **Content** — see §5. |
| L5 | `/collections` only lists collections in the `all-collections` menu; collections missing from that menu are orphaned from the index page. | `sections/main-list-collections.liquid` | Fixed fallback when the menu is empty; **Content** — keep the menu complete (or empty it to list everything). |
| L6 | External links got `rel="noreferrer"`, hiding referrals from the sister site littlemisspartyplanner.com. | `assets/custom.js` | Fixed — `noopener` only. |
| L7 | Pagination has no rel prev/next in theme markup. | `snippets/pagination.liquid` | OK — Shopify injects them in `content_for_header` (confirmed live). |

### 3.6 Templates and content hygiene

| # | Issue | Where | Status |
|---|---|---|---|
| T1 | Default article template rendered Dawn placeholder sections on live articles. | `templates/article.json` | Fixed — removed. |
| T2 | `press-blog` section would error if assigned to another blog. | `sections/press-blog.liquid` | Fixed — paginate default. |
| T3 | Disabled sections/blocks left in many templates (no rendering cost). | templates | **Open** — cosmetic; clean up when convenient. |
| T4 | Dead `about-us.liquid` section and its GSAP assets. | sections/assets | **Phase 3** |

### 3.7 SEO-relevant performance signals (handled in phase 3)

- Two render-blocking stylesheets (`base.css` + 2,300-line `custom.css`).
- Font preloads point at the Dawn setting fonts (Assistant), which `custom.css` overrides with Figtree / ABC ROM; the preloads are wasted and the custom fonts are not preloaded. `.otf`/`.ttf` sources; one unused font face (BNChowder).
- GSAP + ScrollTrigger assets exist for an unused section.

---

## 4. Verification after the branch is connected to a theme

1. **Rich Results Test** (search.google.com/test/rich-results) on: the home page (expect `Store` + `WebSite`), a product (`Product`), an in-store event article (`BlogPosting` + `Event`, check `startDate` has the `-04:00/-05:00` offset), a press article (`BlogPosting`).
2. **View source** on `/pages/about-us`, `/pages/party-in-a-box`, `/pages/slumber-parties`, `/pages/balloons`, `/collections` and an event article: exactly one `<h1>`. Home page: exactly one (the logo).
3. **Meta descriptions**: `/pages/about-us`, `/blogs/in-store-events`, `/pages/contact` now have one; spot-check that the 155-char truncation reads cleanly on the top 10 products.
4. **Lighthouse SEO** on the same five pages: expect 100 except About Us until the "here" link is reworded.
5. **Store details**: confirm Settings → Store details has the street address, phone and email filled in (the Store and Event schema read from there), and the header section's opening hours match the Contact page.
6. After go-live: request indexing of `/pages/terms-of-service` in Search Console so the noindex is picked up, and submit the sitemap if it is not already.

---

## 5. Content actions for the client (admin, no code)

| Page | Action |
|---|---|
| `/pages/balloons` | Replace the SEO description "Coming soon" with a real one (balloon bar, helium bundles, garlands, Nocatee / Ponte Vedra Beach). |
| `/collections/all`, `/collections/balloons`, other top collections | Add a collection description or SEO description (120–155 chars). |
| Blog SEO titles | "In-Store Events in Ponte Vedra Beach – The Social Society", "Press", "Private Events at The Social Society". |
| `/pages/about-us` | Change the link text "here" → "read the story behind The Social Society"; "Click here to learn more" → "learn more about custom party boxes". |
| `/pages/celebrate-with-us` | "LEARN MORE HERE" → "learn more about our balloon services". |
| Theme settings → Social media | Upload a 1200×630 share image (replaces the Instagram-icon fallback). |
| Navigation → `all-collections` menu | Make sure every collection that should be discoverable is in it. |
| Header section (theme editor) | Confirm opening hours; add latitude/longitude if the client wants map-ready local data. |

---

## 6. Notes for phase 3 (performance)

Items IM3, T4 and §3.7 above, plus: `custom.css` size, font format conversion (ttf/otf → woff2) and preloads, GSAP/ScrollTrigger removal, `sparkle.gif`, image widths on the event article hero and collection interjection, and the `body.overflow-hidden` override flagged in the accessibility audit.
