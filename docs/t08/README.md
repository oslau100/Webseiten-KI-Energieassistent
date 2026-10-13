# T08 #176 — operator review drafts with original assets

Local preparation only on `codex/t08-oecher-tarivia-runtime-integration`.
Starting local commit: `dc423bf3352dbda896ce82c01ec245f6b7e099fc`.
Expected remote head: `8888b523707241e644261456531270af0533160d`.
Both drafts remain **NOT_READY**, `content.legal.ready = false`.
No upload, config write, preview, deployment, push or merge is authorized.

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

The previous validator accepted arbitrary HTTPS URLs with no trusted-origin or
object-delivery evidence. It now rejects **all absolute/external references** in
required assets and supplied optional solution, About, agency and SEO images.
This includes plausible Supabase public-object URLs and matching Location paths:
there is no accepted external Storage origin/bucket/delivery contract to trust yet.
No browser permission, RLS policy, upload authority, network probe, public UUID
behavior, API endpoint or release flag is added.

Existing safe same-origin root-path references can still satisfy configuration
reference prerequisites, with foreign Location namespaces, protocol-relative and
backslash paths, unsafe/double encoding, malformed escapes, query strings and
fragments rejected. A same-origin path does not prove that an object exists or is
approved Storage delivery. `READY` continues to mean config/legal/reference
prerequisites; independent delivery and release review remain required. A future
external Storage consumer requires separate trusted integration review rather than
relaxing this gate based on public JSON or a self-asserted `deliveryVerified` value.
Customer row identity and no-fallback behavior remain independently tested.

## Legal drafts and remaining review

The complete supplied BeConnected identity is now populated in both content
buckets and legal HTML: Einzelunternehmen, Andy Khelifa, Heidchenweg 13,
52080 Aachen, telephone 0241 47595243, info@beconnected-aachen.de, USt-ID 253125657.
Germany is carried as the source's address-derived country, pending final review.
The supplied USt-ID is not silently corrected; its format/validity needs confirmation.
No blank placeholders remain for known identity/contact data.

The Impressum is adapted from the original with current DDG heading proposed for
legal review. The privacy draft preserves all 14 source sections and distinguishes
source business-process descriptions from verified new-website processing. Tarivia
uses its own brand and does not inherit Aachen-only tariff/service assertions.
Legacy platform claims are replaced by explicit review tasks; no unverified
Cloudflare/Supabase/AI processing, region, DPA, subprocessor, retention or encryption
claim is asserted. Original source documents remain unchanged as evidence.

Both HTML overrides are marked ENTWURF and `legal.ready` stays false. The customer
boundary withholds them. [legal-review-checklist.md](legal-review-checklist.md)
records remaining approval work. No inherited legal fallback can serve as approval.

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
