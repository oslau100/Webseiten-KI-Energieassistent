# T08 operator config plan — NOT_READY

Prepared from PR #176 at `71e6e15c5d29e0a7c03727d3d2f88e8e50e95a20`.
This plan makes no Storage or Production configuration change. The saved JSON drafts,
eight original image files, manifest and BeConnected source evidence stay unchanged.
A URL accepted by the consumer does not establish delivery, approval or public readiness.

## Previous state and exact proposed buckets

The supplied [handover excerpt](source-evidence/HANDOVER_664_WEBSITE_ASSETS_EXCERPT.md)
reports present JSON objects without customer-specific keys. Treat `{}` below as the
**reported preparation baseline**, not a fresh Production read. No current live values
were fetched. Before any later authorized write, export the exact Location row's three
JSON columns and timestamp/revision, compare with this baseline, review any differences,
and retain that export for rollback. Never overwrite unseen fields or another Location.

| Location / host | Column | Reported previous | Proposed full JSON source |
| --- | --- | --- | --- |
| `NPhuVMAaBPQz6OhIPpkj` / `app.oecher-strom.de` | `webseite_design_config` | `{}`; customer keys absent | [oecher-strom/design.json](oecher-strom/design.json), with only the asset substitutions below and later reviewed legal text |
| `NPhuVMAaBPQz6OhIPpkj` / `app.oecher-strom.de` | `webseite_content_config` | `{}`; customer keys absent | [oecher-strom/content.json](oecher-strom/content.json), with only the asset substitutions below and later reviewed legal text |
| `NPhuVMAaBPQz6OhIPpkj` / `app.oecher-strom.de` | `webseite_layout_config` | `{}`; customer keys absent | [oecher-strom/layout.json](oecher-strom/layout.json), with only the asset substitutions below and later reviewed legal text |
| `uGJsQ3CWvFTraTfrRgjC` / `www.tarivia.de` | `webseite_design_config` | `{}`; customer keys absent | [tarivia/design.json](tarivia/design.json), with only the asset substitutions below and later reviewed legal text |
| `uGJsQ3CWvFTraTfrRgjC` / `www.tarivia.de` | `webseite_content_config` | `{}`; customer keys absent | [tarivia/content.json](tarivia/content.json), with only the asset substitutions below and later reviewed legal text |
| `uGJsQ3CWvFTraTfrRgjC` / `www.tarivia.de` | `webseite_layout_config` | `{}`; customer keys absent | [tarivia/layout.json](tarivia/layout.json), with only the asset substitutions below and later reviewed legal text |

The column JSON roots are `design`, `content`, `layout` in the runtime, not extra
nested wrappers in the stored columns. Use those existing sources for every planned
value, including localized copy; do not reconstruct the full buckets from this summary.

| JSON fields absent from reported baseline | Öcher Strom proposed | Tarivia proposed |
| --- | --- | --- |
| `content.brand.name` | `Öcher Strom` | `Tarivia` |
| `content.brand.contact_email` | `info@beconnected-aachen.de` | same |
| `design.colors.primary` / `cta` / `accent` | `#FFBD59` / `#E7AC24` / `#FFBD59` | `#102A43` / `#38E8A0` / `#38E8A0` |
| `design.colors.white` / `background` / `text` / `mutedText` | `#FFFFFF` / `#FFFFFF` / `#102A43` / `#64748B` | same |
| `design.radius.section` | `2.5rem` | same |
| `content.seo.title`, `description` | exact strings in own content draft | exact strings in own content draft |
| `content.seo.site_url` | `https://app.oecher-strom.de` | `https://www.tarivia.de` |
| `content.legal.ready` | `false` | `false` |
| `content.legal.variables` | full BeConnected object below | same |
| `content.pages.impressum.html`, `datenschutz.html` | own standard legal HTML, withheld pending separate review | own standard legal HTML, withheld pending separate review |
| `content.i18n`, `integrations`, `sections` | exact objects in own content draft; empty values remain empty | exact objects in own content draft; empty values remain empty |
| `layout.pages.home.sections`, `annual.sections` | exact arrays in own layout draft | same |

Planned `content.legal.variables` (source data, not final legal approval):

```json
{
  "firma": "BeConnected",
  "inhaber": "Andy Khelifa",
  "strasse": "Heidchenweg 13",
  "plz": "52080",
  "ort": "Aachen",
  "land": "Deutschland",
  "email": "info@beconnected-aachen.de",
  "telefon": "0241 47595243",
  "stand": "14. Oktober 2026",
  "rechtsform": "Einzelunternehmen",
  "ust_id": "253125657"
}
```

## Exact asset substitutions for each Location

Origin is pinned in code independently of config/bootstrap API selection:
`https://oynhnhkldvpoqhsfirwf.supabase.co`. Every planned URL below is still
**undelivered/unverified**. Bucket decision remains NOT_APPROVED; these URL strings
are the consumer contract to verify in the later authorized step, not an upload order.
Only the exact eight v1 object paths are accepted; a future version requires code review.
Retain the original bytes; hashes, MIME, dimensions and lengths are in
[asset-manifest.json](asset-manifest.json) and
[source operator manifest](source-evidence/asset-manifest.operator.json).

### Öcher Strom — `NPhuVMAaBPQz6OhIPpkj`

| Runtime JSON field | Previous saved draft value | Planned value after approval and delivery |
| --- | --- | --- |
| `design.assets.logo_header` | `supabase-storage://website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/logo.png` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/logo.png` |
| `design.assets.logo_footer` | `supabase-storage://website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/logo.png` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/logo.png` |
| `design.assets.hero_image` | `supabase-storage://website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/hero-angled.jpeg` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/hero-angled.jpeg` |
| `content.sections.solution.image_url` | `supabase-storage://website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/section-straight.jpeg` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/section-straight.jpeg` |
| `content.sections.about.image_url` | `supabase-storage://website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/about.webp` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/NPhuVMAaBPQz6OhIPpkj/t08/v1/about.webp` |

### Tarivia — `uGJsQ3CWvFTraTfrRgjC`

| Runtime JSON field | Previous saved draft value | Planned value after approval and delivery |
| --- | --- | --- |
| `design.assets.logo_header` | `supabase-storage://website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/logo.jpg` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/logo.jpg` |
| `design.assets.logo_footer` | `supabase-storage://website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/logo.jpg` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/logo.jpg` |
| `design.assets.hero_image` | `supabase-storage://website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/hero-angled.jpeg` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/hero-angled.jpeg` |
| `content.sections.solution.image_url` | `supabase-storage://website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/section-straight.jpeg` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/section-straight.jpeg` |
| `content.sections.about.image_url` | `supabase-storage://website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/about.png` | `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/website-assets/locations/uGJsQ3CWvFTraTfrRgjC/t08/v1/about.png` |

Hero remains angled (`design.assets.hero_image`); the second solution section
remains straight (`content.sections.solution.image_url`). No swapping, cropping,
conversion or inferred logo/favicon reuse. Approved static 177 tariff / 477 EUR
artwork does not initialize personal calculations.

## Fields deliberately empty in both proposed configs

These are empty in the saved drafts and stay empty in the later proposed payload unless
separately sourced, reviewed and authorized. No inherited customer values are inserted.

```text
design.assets.agency_logo = ""
content.brand.agency_url = ""
content.brand.agency_alt = ""
content.seo.image_url = ""
content.i18n.annual_testimonials_h2.de = ""
content.i18n.home_testimonials_h2.de = ""
content.integrations.google_reviews.jotform_widget_id = ""
content.sections.hero.badge = ""
content.sections.testimonials.kicker = ""
content.sections.testimonials.headline = ""
content.sections.testimonials.home_reviews = []
content.sections.stats.headline = ""
content.sections.stats.items = []
content.sections.about.social_hint = ""
content.sections.about.social.youtube = ""
content.sections.about.social.facebook = ""
content.sections.about.social.tiktok = ""
content.sections.about.social.instagram = ""
content.sections.callback.description = ""
content.sections.callback.calendar_url = ""
content.sections.jahresrechnung.free_note = ""
content.sections.jahresrechnung.reviews_kicker = ""
content.sections.jahresrechnung.reviews = []
content.sections.jahresrechnung.badge = ""
```

Favicon has no approved original or accepted config-driven consumer; do not invent
a JSON key that the runtime cannot consume. SEO/social image is intentionally empty.
Calendars, widgets, social links, reviews, stats and agency branding need their own
evidence/consent review before population. Preview colors/CTA tokens and
layout-driven ordering also need visual acceptance: saved values do not prove full
consumer support (see [README rendering limits](README.md#favicon-and-existing-rendering-limits)).

## Required gates before later release

1. **Storage/operator:** T01/T08/T11 approve project/origin ownership, `website-assets`,
   public reads, admin/server-only writes, Location isolation and the exact v1 namespace.
   Document MIME/size constraints, normalization, immutable replacement/versioning,
   cache, attribution/audit, orphan cleanup and deletion/rollback. No private records
   belong in this public bucket. Manifest `publicUrl=null`, `storageExists=false`,
   `deliveryVerified=false` remain factual until separately verified.
2. **Delivery:** after separately authorized provisioning/upload, check all eight delivered
   originals against SHA-256, MIME and byte length; test each actual URL on its customer
   hostname, image orientation and no cross-Location leakage. A generated public URL or
   a successful config-reference check cannot substitute for this verification.
3. **Config/operator:** freshly export and compare both exact rows, review all three JSON
   payloads and URL substitutions, public contact/SEO/content, both legal overrides,
   favicon/consumer support and visual design limits. Record reviewer/date, payload
   hashes, asset evidence and rollback snapshots. Write only through the accepted
   trusted administrative path with explicit later authorization and concurrency checks.
4. **Legal:** use [both BeConnected sources](source-evidence/BEConnected_LEGAL_INPUT.md)
   and [original 14-section review basis](source-evidence/BEConnected_ORIGINAL_RECHTSTEXTE_REVIEWBASIS.md).
   Resolve every item in [legal-review-checklist.md](legal-review-checklist.md):
   firm/contact and country; supplied USt-ID `253125657` format/validity; DDG,
   MStV/VSBG and regulator/DPO applicability; each brand's scope; actual enabled
   contact/callback/order flows; categories, purposes, bases, recipients, contracts,
   regions/transfers, retention/deletion, security, rights and withdrawal.
   Verify actual hosting/config/asset/logging, cookies and local storage, external
   language/translation/review resources and §25 TDDDG consent behavior.
   Do not reuse historical WordPress/Elementor, hosting, cookie, EU-region/DPA,
   AI, retention or encryption assertions as facts for these sites.
   Final HTML must have no review placeholders; record per-Location reviewer/date
   and final-text hashes. `legal.ready` remains **false in this patch and plan**;
   only separately approved publication may change it.
5. **Runtime/release:** exact runtime Location/host (and exact configured preview host)
   with browser-safe credentials; test own row identity, no generic/legal fallback,
   actual customer URLs and legal links. Keep construction/preview Basic Auth.
   Keep NOT_READY for unmet prerequisites and all legacy funnel/loader restrictions.
   This validator adds no transport, API or order capability. Independently scope any
   partner-program exposure and favicon implementation. Obtain separate release
   authorization; no upload, Production write, deploy command or merge occurs here.

Commit/push is restricted to the existing PR #176 branch. The PR records that the
existing Cloudflare Git integration can automatically create branch previews on push;
no deploy command, hosting change or Production deployment is authorized by this plan.

## Patch validation

- Focused Vitest: 13 files / 299 tests pass, including both brands, original hashes,
  exact public URL positives/negatives, orientation, legal/NOT_READY, Basic Auth,
  loader boundaries and dormant order bridge.
- Changed-code ESLint and unfiltered `git diff --check`: pass.
- Vite build: passes with the existing chunk-size warning. Standard test/build
  commands fail at native SWC startup (`ERR_SWC_NATIVE_CACHE`); successful checks
  use temporary automatic-JSX esbuild configs outside the repository, preserving
  root, aliases, test environment and setup. Native SWC remains unverified.
- App TypeScript: 13 errors, diagnostics byte-identical to untouched start SHA
  with the same dependencies. Node TypeScript passes.
- Originals, manifest, JSON drafts, legal source evidence, Basic Auth middleware,
  loader code and order bridge are unchanged. No `crm/app/**` changes.
