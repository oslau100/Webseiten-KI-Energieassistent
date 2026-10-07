# Neutral customer website foundation

This transitional foundation starts at `3c939883d6d8b8d1542806e9978cac6aad75b87b` on `brand-neutral-customer-base-2026-10`. It keeps the existing website, iframe funnels, and `kunden_config` website buckets. It does not implement the later repository/SaaS restructure or a CRM editor.

## Location and browser configuration

`src/lib/websiteRuntime.ts` resolves the first nonempty Location from:

1. `window.TB_BOOTSTRAP.locationId`, explicitly provided before the application starts.
2. Build variable `VITE_LOCATION_ID`.
3. In Vite development only (`import.meta.env.DEV`), `location_id` or `locationId` in the URL.

The selected value is trimmed and must match `[A-Za-z0-9_-]{1,128}`; `secret`, `placeholder`, `undefined`, and `null` are rejected. An invalid selected value fails closed to an empty Location instead of trying a lower-priority customer. Production builds ignore Location, API URL, and key query overrides. Language and existing funnel identifiers still work normally.

WebsiteConfig uses the same three buckets and existing deep-merge / `getText`, `getArray`, `getObject` fallbacks. Without a valid Location, API URL, and public key, it makes no configuration request. A failed request or absent override retains neutral repository content. The context's `tenant.locationId` reports the resolved value, or an empty string; there is no hardcoded customer identity.

API URL precedence: bootstrap `supabaseUrl`, `VITE_SUPABASE_URL`, development-only `supabase_url`, then the existing shared platform URL `https://oynhnhkldvpoqhsfirwf.supabase.co`. URLs must use HTTPS. Key precedence: bootstrap `supabaseAnonKey`, bootstrap `supabaseKey`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_ANON_KEY`, then development-only `supabase_key`. Only `sb_publishable_*` or legacy JWTs with `role: anon` are accepted. Invalid selected keys produce no WebsiteConfig request. A publishable key is sent only as `apikey`; a legacy anon JWT also uses the existing Bearer header. This is format/role screening, not server-side JWT verification; existing server authorization and RLS remain authoritative.

`main.tsx` publishes sanitized resolved values as `window.WEBSITE_LOADER_BOOTSTRAP` before rendering. The four same-origin iframe loaders inherit those values synchronously before creating their clients. Their local bootstrap values remain editable for future standalone use; no Location or key is embedded in this base. A shared static validator rejects invalid Locations and privileged keys. A production loader URL cannot select another tenant. The shared engine/proxy URLs and business logic remain as before; existing database runtime/URL configuration can still override those paths.

Booking resolves the same Location and fails before a request when it is missing. The `booking-proxy` contract still requires a legacy anon JWT, preferring `VITE_SUPABASE_ANON_KEY`, then bootstrap `supabaseAnonKey` / `supabaseKey`, then the development query key. Every request includes the resolved Location and the existing `rueckruf-buchen` calendar slug. The consent URL resolves `/datenschutz` against the current host. No backend, permissions, schema, or data changes are included.

All `VITE_*` variables are public browser configuration. Never supply a service-role key, secret key, or preview credentials through them.

## About content schema

Under `webseite_content_config.sections.about`:

```json
{
  "mode": "company",
  "headline": "Über den Energieassistenten",
  "image_url": "",
  "image_alt": "",
  "name": "Energieassistent",
  "role": "",
  "paragraphs": [
    { "de": "Konfigurierter Inhalt", "en": "Configured content" }
  ],
  "social": {
    "youtube": "",
    "facebook": "",
    "tiktok": "",
    "instagram": ""
  },
  "social_hint": ""
}
```

- `mode`: `company`, `person`, or `hidden`; neutral default is `company`. An unknown mode uses company presentation. `hidden` renders no About section.
- `headline`, `image_url`, `image_alt`, `name`, `role`, `social_hint`, and social values accept existing plain strings or localized objects (`de`, `en`, etc.) via `getText`.
- `paragraphs` is optional and accepts an array of strings or localized objects. When absent, the existing `paragraph_1` through `paragraph_6` fields are used. An empty array omits all paragraphs. Neutral fallback paragraphs contain no personal biography.
- An empty image omits the image. An empty role is omitted. Only nonempty HTTP(S) social URLs render; empty values, `#`, and unsafe schemes are omitted. The hint renders only when at least one social link exists.
- Legacy overrides containing `person_name` or `avatar_url` and no `mode` normalize to `person`; these aliases map to `name`, `image_url`, and `image_alt` unless the new fields are explicitly provided. Existing six-paragraph configurations remain supported. No migration is required.

The same component and current design tokens/layout are used for all modes. The tariff callback card reads the normalized name/image too.

## Branding, legal content, and SEO

Customer logos, hero/solution images, portraits, socials, contacts, and absolute customer links are empty or relative. Platform attribution is retained. Consent cookies are host-only, and language persistence uses `site_lang`.

Legal HTML overrides remain supported. Without configured company name and contact email, the legal routes show a neutral preparation message instead of presenting incomplete customer legal information. Customer legal text still needs review before launch.

`index.html` has neutral title/author/social text and no customer canonical, URL, or share image. The existing generic `E` favicon is retained. Optional `webseite_content_config.seo` fields are `title`, `description`, `site_url`, and `image_url`. Text fields support the existing localization rules. `site_url` must be an explicit HTTPS customer URL; runtime canonical and OpenGraph URLs use its origin plus the current pathname, excluding query tokens. Without it those tags are omitted. Optional share images are omitted when empty. Runtime metadata is client-rendered; customer static metadata should also be reviewed for crawlers that do not run JavaScript.

## Pages preview lock and later project setup

`functions/_middleware.ts` runs before `next()`; `public/_routes.json` includes `/*` with no static-asset exclusions.

| Pages runtime binding | Later configuration |
| --- | --- |
| `SITE_PREVIEW_LOCK` | Set to the string `true` while under construction. Whitespace/case are normalized; all other values leave the lock disabled. |
| `PREVIEW_USERNAME` | Set as a Cloudflare environment secret; do not commit it. |
| `PREVIEW_PASSWORD` | Set as a Cloudflare environment secret; do not commit it. |

When enabled, valid HTTP Basic credentials proceed. Missing, incorrect, or malformed authorization returns `401` with `WWW-Authenticate: Basic realm="Energieassistent Preview"`. Missing/empty/whitespace-only configured credentials return `503` without serving the site. Credentials are never logged. All locked responses, including authenticated website responses, carry `Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow, noarchive`.

For each future Pages project, configure both Production and Preview environments before connecting a hostname:

| Future Location | Future hostname | Build-time Location |
| --- | --- | --- |
| Öcher Strom | `app.oecher-strom.de` | Its own verified Location ID, not assigned in this PR |
| Tarivia | `www.tarivia.de` | Its own verified Location ID, not assigned in this PR |
| Energieassistent Demo | `demo.energieassistent.io` | Its own verified Location ID, not assigned in this PR |

Later setup steps:

1. Use the intended future customer branch/project; no such branches are created by this task. Use repository root, `npm run build`, and `dist` output. Ensure Pages compiles the repository's `functions/` middleware; uploading static `dist` alone does not supply the lock.
2. Configure the three server bindings above in both environments, plus the verified `VITE_LOCATION_ID` and browser-safe Supabase URL/key build variables. Booking additionally needs the existing anon JWT contract. Set the Pages Functions failure mode to fail closed so quota/infrastructure errors cannot fall back to unprotected assets.
3. Supply customer branding, About mode/content, legal text, URLs, and calendar/configuration through the existing website buckets and permitted setup workflow. Keep the lock enabled during setup.
4. Before connecting a host, verify that unauthenticated `/`, `/start`, `/loaders/start.html`, `/assets/...`, `/favicon.svg`, and legal routes return protected responses, valid credentials reach the site, and missing configured credentials fail closed. Verify all aliases and the Pages project hostname as well. These are future deployment checks, not actions performed here.
5. Release the lock only after customer acceptance and legal/content review. Removing `SITE_PREVIEW_LOCK=true` intentionally makes the site public.

No Cloudflare settings, secrets, project hostnames, DNS, or deployment were changed in this task. Implementation commits use `[CF-Pages-Skip] [skip ci]` to avoid automatic Pages/CI builds when publishing the review branch.

## Claims requiring business verification before customer launch

Unrelated marketing copy was retained; no replacement statistics were invented. Verify both configured defaults and secondary component/translation fallbacks:

- `websiteContentDefaults.ts`: 1,500+ users/households; 10,000+ checks; €600,000+ saved; “millions” of households losing up to €1,500 per year; 60-second results; hundreds of tariffs; 100% free services.
- `Stats.tsx`: secondary fallbacks use 15,000+ checks, 2,000+ households, and €900,000+ saved. `i18n.tsx` also has 2,000+ user badges. These differing historical figures require reconciliation.
- `websiteContentDefaults.ts`, `Testimonials.tsx`, and `Jahresrechnung.tsx`: testimonial authenticity, permission to reuse, savings (including €200 / €380 annually), and invoice examples (including €1,420).
- Service promises in translations/status/FAQ/offer text: 14-day supplier confirmation, provider safety/risk filtering, monitoring/reminders, and claims about free/uncommitted services. Confirm applicability per Location.

## Verification

Focused tests cover preview-lock pass-through/auth/fail-closed behavior and static paths; Location precedence and production query isolation; no implicit config or booking requests; iframe bootstrap handoff; all About modes and empty socials; and neutral/configured metadata. Existing offer/booking regression suites remain in place. See the draft PR for exact final test/build/lint counts and the baseline comparison.
