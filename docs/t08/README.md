# T08 #176 — operator review drafts with original assets

Local preparation only on `codex/t08-oecher-tarivia-runtime-integration`.
Starting local commit: `dc423bf3352dbda896ce82c01ec245f6b7e099fc`.
Expected remote head: `8888b523707241e644261456531270af0533160d`.
Both drafts remain **NOT_READY**, `content.legal.ready = false`.
These are historical preparation inputs. The follow-up at start SHA
`71e6e15c5d29e0a7c03727d3d2f88e8e50e95a20` prepares the exact public-asset
consumer and [operator config plan](operator-config-plan.md). Its commit/push is
restricted to PR #176; uploads, Production writes, deploy commands and merge remain
excluded. Existing Git integrations may create automatic previews after a push.

| Draft | Location | Host | Colors |
| --- | --- | --- | --- |
| [Öcher Strom](oecher-strom/) | `NPhuVMAaBPQz6OhIPpkj` | `app.oecher-strom.de` | Primary `#FFBD59`, CTA `#E7AC24` |
| [Tarivia](tarivia/) | `uGJsQ3CWvFTraTfrRgjC` | `www.tarivia.de` | Primary `#102A43`, accent/CTA `#38E8A0`, white `#FFFFFF` |

Each directory contains separate `design.json`, `content.json`, `layout.json`
buckets for the accepted `WebsiteConfig` consumers. They correspond to
`webseite_design_config`, `webseite_content_config`, `webseite_layout_config`.
No database-write or activation script is included. German marketing copy remains
brand-specific; accepted shared UI, controlled translations, routes and UI waves
are unchanged. Missing reviews, statistics, calendars and social accounts are
not filled from another customer.

## Supplied evidence and exact asset mapping

The operator supplied `T08_approved_assets_and_legal_inputs_2026-10-13.zip`.
[asset-manifest.json](asset-manifest.json) records all eight actual originals,
original upload names, review file paths, SHA-256, MIME types, dimensions and bytes.
These were independently checked against the actual files with SHA-256 and Pillow
image-header inspection. All originals are preserved byte-for-byte under
`docs/t08/assets/`; they are review evidence, outside `public/` and runtime imports.
No transformations, crops, regenerated imagery or substitutions were made.
The four smartphone originals were visually checked for orientation and the
approved static 177 tariff / 477 EUR artwork.

| Consumer | Öcher Strom original | Tarivia original |
| --- | --- | --- |
| Header/footer logo | `assets/oecher-strom/logo.png` | `assets/tarivia/logo.jpg` |
| Hero — angled phone | `assets/oecher-strom/hero-angled.jpeg` | `assets/tarivia/hero-angled.jpeg` |
| Second section — straight phone | `assets/oecher-strom/section-straight.jpeg` | `assets/tarivia/section-straight.jpeg` |
| About | `assets/oecher-strom/about.webp` | `assets/tarivia/about.png` |

Manifest fields map Hero to `design.assets.hero_image`, the second section to
`content.sections.solution.image_url`, About to `content.sections.about.image_url`.
Alt text and tests match the corrected orientations. Captions retain the distinction
between approved static artwork and future personal calculations. The graphic's
177 tariffs and 477 EUR do not initialize live tariff or savings values.

The supplied manifest, firm data and original legal text are preserved under
`source-evidence/` as input evidence, not executable instructions or publication
approval. Logos and About images use exactly their brand-specific manifest entries;
the operator confirms and authorizes the shared real team for both brands.

## Storage plan — NICHT FREIGEGEBEN

Handover source: [KI-Energieassistent PR #664](https://github.com/oslau100/KI-Energieassistent/pull/664),
`docs/PRODUCTION_HANDOVER.md` at head
`a666af6e7bc3b3065bb7c19ff396e1f26a878a36`, sections “Website branding, content and
legal Source of Truth” and “Website asset / Supabase Storage decision — REQUIRED
BEFORE PUBLIC RELEASE”. This was read directly; it does not declare production
readiness or approve a bucket. The old proposed `customer-website-assets` does not
exist according to the supplied operator inspection and is removed from draft
references. No fresh Storage inspection or mutation is claimed by this task.

The preferred direction is a dedicated Location-scoped website bucket, exemplified
by `website-assets`, rather than scattered branches, arbitrary public URLs or
unrelated existing buckets. The manifest's `website-assets` bucket and
`locations/<Location>/t08/v1/<verified-filename>` keys are **proposals only** based
on the supplied manifest. Handover's logo/favicon/hero/about/content folder examples
are not a finalized object-key contract. T01/T08/T11 must decide the final namespace.
No proposed bucket exists or is approved in these inputs; no bucket is created.

`supabase-storage://website-assets/...` is an intentionally non-fetchable planning
reference, not a URL or proof of delivery. `publicUrl` stays null,
`storageExists` and `deliveryVerified` stay false. Supplied files have real extensions;
there are no `.original` filename placeholders in the corrected manifest/drafts.
Even premature legal approval cannot make these planning references READY.

Before any separately authorized integration, agree and verify bucket ownership,
public/private reads, authorized admin/server writes, Location-scoped policies,
MIME allowlist, size limits, key normalization, replacement/versioning, cache
invalidation, orphan cleanup, audit, deletion/rollback and stored reference format.
Verify each actual delivered object against its approved hash and on its actual
customer hostname. URL construction alone does not establish delivery or ownership.
Do not reuse a private-record/document bucket or another customer's files.

## Runtime trust boundary

The validator now permits only the eight manifest-listed external public-object
references on the code-owned exact origin `https://oynhnhkldvpoqhsfirwf.supabase.co`,
bucket `website-assets`, the explicitly supplied matching Location, and exact
`t08/v1/<filename>` path. Whole-string equality rejects URL normalization,
credentials, ports, encoded paths, traversal, query/hash and foreign projects,
buckets or Locations. Customer JSON and bootstrap API URLs cannot expand trust.
Unknown Locations and missing Location IDs cannot authorize external references.

Existing same-origin root-path validation is preserved. Required assets and supplied
optional solution, About, agency and SEO images (including every localized value)
all pass through the same validation boundary. No network probe, Storage permission,
upload authority, API endpoint or release flag is added. `READY` still means only
config/legal/reference prerequisites: it proves neither ownership nor object delivery.
The symbolic draft references remain rejected and `legal.ready` remains false.
See the operator plan for the separate delivery, legal and release gates.

## Legal drafts and remaining review

The complete supplied BeConnected identity is now populated in both content
buckets and legal HTML: Einzelunternehmen, Andy Khelifa, Heidchenweg 13,
52080 Aachen, telephone 0241 47595243, info@beconnected-aachen.de, USt-ID 253125657.
Germany is carried as the source's address-derived country, pending final review.
The supplied USt-ID is not silently corrected; its format/validity needs confirmation.
No blank placeholders remain for known identity/contact data.

The four brand-specific standard legal texts now contain no visible review markers
or placeholders. Hosting, browser preferences and planned external advertising
reflect the current evidence. Both keep `legal.ready=false`; final legal and
processing review remains separate. See [legal-review-checklist.md](legal-review-checklist.md)
for verified facts, consent behavior and remaining blockers. Historical source
texts remain unchanged. Legal pages require explicit approved, safe HTML and do
not publish generic legal fallback bodies.

## Favicon and existing rendering limits

Handover #664 requires Location-specific logo and favicon, including preview;
guidance accepts SVG or square PNG. Neither supplied asset pack has a separately
approved favicon. `index.html` currently references generic `/favicon.svg`; it is
removed by `CustomerRuntimeBoundary` while NOT_READY. `WebsiteMetadata` consumes
SEO fields but has no config-driven favicon consumer. Merely adding a manifest
reference or using the logo would not wire it into the runtime.

Favicon is **NOT_READY_NOT_SUPPLIED** for each brand: obtain an approved SVG/square
PNG, decide its Location key and trusted delivery, and separately scope the consumer
and preview implementation before release. Öcher's square 512×512 PNG logo could
be evaluated by the operator; Tarivia's 1600×533 JPEG is not a ready square/favicon
asset. No conversion, inferred approval or favicon UI change is made here.

The provider's `--website-primary`, `--website-bg`, `--website-text` remain distinct
from Tailwind component tokens. CTA/accent are preserved as requested draft values
without claiming fully wired brand styling. Pages still compose the accepted shared
sections directly rather than using `layout.pages` to reorder them. These limits
are documented, not changed by the remediation.
