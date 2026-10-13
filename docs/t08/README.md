# T08 #176 — customer configuration drafts

Operator review only. Prepared against runtime head
`8888b523707241e644261456531270af0533160d` on
`codex/t08-oecher-tarivia-runtime-integration`. Neither draft is approved,
activated, uploaded or written to `kunden_config`. Both are **NOT_READY**.

| Draft | Location | Host | Colors |
| --- | --- | --- | --- |
| [Öcher Strom](oecher-strom/) | `NPhuVMAaBPQz6OhIPpkj` | `app.oecher-strom.de` | Primary `#FFBD59`, CTA `#E7AC24` |
| [Tarivia](tarivia/) | `uGJsQ3CWvFTraTfrRgjC` | `www.tarivia.de` | Primary `#102A43`, accent/CTA `#38E8A0`, white `#FFFFFF` |

Each directory has three independent JSON objects: `design.json`, `content.json`,
`layout.json`. Assemble locally as `{ design, content, layout }` for the existing
`WebsiteConfig` type. If separately authorized in a later task, these correspond
respectively to `webseite_design_config`, `webseite_content_config`, and
`webseite_layout_config` in the one matching Location row. These files contain no
write script, credential, bootstrap, environment change or activation instruction.
`websiteConfig` accepts `JsonRecord` buckets; there is no strict field-by-field
schema. The drafts use the current consumers' field names and item shapes.

## Evidence and unresolved inputs

The task supplies exact brand names, Locations, hosts, colors, approved marketing
labels (177 tariffs / 477 EUR), and BeConnected's authorized legal-operator role.
The checked branch, neutral customer bases (both at
`8e5f406d41deff31c056695a6ec32976bcfb2de9`) and available workspace have no supplied
approved brand originals or complete BeConnected legal record. **Source mapping is
therefore planned, not a claim that any artwork has been identified or delivered.**
`source`, hash, MIME type, dimensions and delivery URL in the manifest remain null.
No other customer's repository branding, legal details, agency logo, testimonials,
statistics, review integration, calendar or social accounts are copied.

German customer copy is differentiated: Öcher Strom focuses on the household's
current contract; Tarivia on understanding costs and contract conditions. The
shared components, section order, routes and central navigation/cookie/status
translations stay intact. Product/marketing overrides use German fallback within
the existing localization resolver; this is not a complete marketing translation
set. Factual badges, statistics and reviews stay empty pending approved evidence.
Annual FAQ overrides avoid unverified pricing, deletion and processing promises.

## Asset plan

See [asset-manifest.json](asset-manifest.json). A planned bucket name is
`customer-website-assets`; it has not been checked or created. Object keys use
`locations/<exact Location>/t08/v1/`. The `.original` planning filenames intentionally
make no claim about a missing file's format. Once originals are supplied, record
source provenance, SHA-256, MIME type and dimensions, then replace `.original` with
the verified original extension consistently in manifest and draft references.

| Approved role | Current consumer |
| --- | --- |
| Brand logo | `design.assets.logo_header`, `design.assets.logo_footer` |
| Straight smartphone | `design.assets.hero_image` |
| Angled smartphone | `content.sections.solution.image_url` |
| About image | `content.sections.about.image_url` |

Both smartphone orientations must use the supplied originals **byte-for-byte**,
including the approved 177 tariff / 477 EUR content. Do not regenerate, recolor,
crop away the labels or replace them with computed figures. Alt text, nearby
result notes and FAQ explicitly distinguish the static illustration from a future
personal calculation; the assets do not initialize tariffs or live savings.

`supabase-storage://customer-website-assets/locations/...` is a planning reference,
not a browser URL and not an existing public object. The current readiness gate
rejects it. Even a premature `legal.ready = true` remains `ASSETS_NOT_READY` until
real references replace it. All mapped required images, optional supplied solution,
About, agency and SEO images are checked by the customer runtime. A reference
containing another known customer's Location path segment, or a `locations/`
namespace belonging to a different Location, fails closed. Matching row identity
is independently required. This presentation check is not Storage authorization,
proof of URL ownership, existence or delivery; arbitrary external URLs are not
made trustworthy by this check.

For a separately authorized future asset integration, verify the actual bucket,
access model and Location-isolated objects before recording any real HTTPS delivery
URL. Supabase's `getPublicUrl` constructs a URL without proving bucket visibility;
URL generation is not delivery verification. Folder names alone are not access
control. Review Storage policies without changing them in this preparation task.
No fake Supabase project host or public URL is embedded in the drafts.

## Legal gate and review

[legal-review-checklist.md](legal-review-checklist.md) lists the required evidence.
Both `content.legal.ready` values stay false. Only `legal.variables.firma` contains
the supplied operator label `BeConnected`; legal form, address, representative,
contact and registration fields are empty rather than invented. Both accepted
`pages.impressum.html` and `pages.datenschutz.html` override slots contain explicitly
marked review drafts with open fields. No WordPress, Elementor, own-server,
Mailgun, anonymized-only AI, confirmed subprocessors or exclusive-cookie claims
are carried into these drafts. The customer boundary withholds HTML overrides
until all readiness prerequisites are satisfied.

Do not approve by flipping a flag alone. Replace open legal fields and review
both HTML documents before any later approval. The legacy fallback legal pages
contain assumptions (including an obsolete dispute-resolution link) and must not
be used instead of the approved customer HTML overrides.

## Existing rendering limits

The provider writes `--website-primary`, `--website-bg` and `--website-text`, but
the existing Tailwind components use separate `--primary`, `--background` and
`--foreground` tokens. CTA/accent/white values are retained in `design.colors` for
review, but are not fully wired to rendered buttons; no pixel-accurate brand preview
is claimed. The current pages compose sections directly, not from `layout.pages`.
The layout drafts mirror the shared accepted structure and do not promise runtime
reordering. Empty review/stat arrays suppress facts, not necessarily section shells.
These UI limitations require a separately scoped decision before activation.

## Release and branch constraints

No CRM UI, funnel security, public UUID behavior, base branch, deployment config,
Storage policy, Supabase row or Production setting is changed. Customer funnels
remain dormant and guarded. Tests use mocked config reads and fixture delivery
URLs; they make no live readiness claim.

PR #176 reports that its previous branch push triggered seven automatic Cloudflare
Pages preview deployments. A new push cannot currently be represented as complying
with the task's no-deployment constraint. Keep the tested commit local until the
operator confirms that automatic deployments for this push are disabled, or
explicitly resolves the constraint. Do not alter hosting integrations in this task.
