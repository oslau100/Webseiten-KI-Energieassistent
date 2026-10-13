# Handover #664 — read-only source excerpt

Repository: oslau100/KI-Energieassistent
PR: https://github.com/oslau100/KI-Energieassistent/pull/664
Head: a666af6e7bc3b3065bb7c19ff396e1f26a878a36
File: docs/PRODUCTION_HANDOVER.md
Retrieved during the 2026-10-13 local review remediation.
This excerpt is source evidence, not permission to publish or mutate infrastructure.


Location-specific website configuration must be config-driven from Supabase rather than hard-coded into customer branches.

The current canonical website configuration fields are:

```text
public.kunden_config.webseite_design_config
public.kunden_config.webseite_content_config
public.kunden_config.webseite_layout_config
```

The three newly provisioned Locations currently have these JSON configuration objects present but without customer-specific keys. Therefore they still rely on neutral repository fallback configuration and are NOT customer-content Production-ready.

Before public Production release, every applicable Location must have its customer-specific, reviewed configuration populated and verified.

This includes at minimum:

```text
brand/company name
logo
favicon
primary brand color and allowed derived design tokens
public contact presentation
SEO title/description/site URL/social image
hero/about/approved customer-specific website content
required public images
social links where applicable
callback/calendar configuration where applicable
customer-facing links
Impressum
Datenschutz
Partnerprogramm public/legal content where the feature is exposed
other Location-specific legal/company fields explicitly permitted by the
existing Settings/config contract
```

Controlled system marketing copy, controlled translations and system-owned funnel copy remain governed by their existing Source-of-Truth/review contracts and must not become arbitrary customer-editable text merely because Supabase configuration exists.

### Legal content readiness

Impressum, Datenschutz and Partnerprogramm-related public/legal content must be Location-scoped and Supabase-config-driven.

The neutral website foundation already contains config-driven legal readiness behavior for Impressum and Datenschutz. A Location must not publish inherited/generic legal text merely because a route renders.

Before release:

```text
legal/company variables are complete
required legal text is reviewed
the Location legal readiness flag/state is explicit
all public legal links resolve to the correct Location
no other Location's legal/company data can leak
the rendered legal document is tested on the actual customer hostname
```

The Partnerprogramm public/legal content contract must be brought under the same Location-scoped Supabase configuration model before it is publicly exposed. If the current neutral foundation does not yet provide the required route/config schema, that is an implementation task rather than permission to hard-code customer text into a branch.

Any HTML legal override stored through configuration must be limited to an authorized/trusted administrative publication path, versioned/audited as required, and must not become an arbitrary untrusted HTML injection surface.

### Website asset / Supabase Storage decision — REQUIRED BEFORE PUBLIC RELEASE

Website images/files must not be scattered across Git branches, arbitrary public URLs or unrelated Storage buckets.

Fresh read-only Production audit observed the following existing public Storage buckets:

```text
crm-assets
crm-lp-assets
engine-assets
raw-egon-csv
TarifButler Specifics
```

None is currently accepted by this handover as the canonical cross-Location website-content asset store.

Before public release, T01/T08/T11 must explicitly decide and document one canonical website-asset strategy.

Preferred direction to validate is a dedicated Location-scoped public website asset bucket, for example:

```text
website-assets/
  locations/<location_id>/logo/...
  locations/<location_id>/favicon/...
  locations/<location_id>/hero/...
  locations/<location_id>/about/...
  locations/<location_id>/content/...
```

If an existing bucket is intentionally reused instead, the decision and equivalent security/ownership guarantees must be documented explicitly.

The final asset solution must define at minimum:

```text
canonical bucket ownership
public-read versus private-read rules
server/admin-only or appropriately authorized writes
Location-scoped object paths
MIME allowlist
file-size limits
filename/object-key normalization
replacement/versioning semantics
cache invalidation
orphan cleanup
audit/attribution where required
cross-Location isolation
safe deletion/rollback
reference format stored in website config
```

Website asset storage must contain only appropriate public website material. Secrets, private customer records, contract documents and other sensitive artifacts must use their separately defined private-storage domains.

For every one of the six Production target Locations, all required public images/files must be inventoried, uploaded to the accepted canonical asset location, referenced from the correct Supabase website configuration, and verified on the actual Location website.
