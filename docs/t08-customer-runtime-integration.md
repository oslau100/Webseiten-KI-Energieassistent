# T08 customer runtime integration

Child of `codex/t08-shared-secure-funnel-bridge` at
`c8c079300da65c806b9202cf72a6105a742c80cd`. No customer base branch is modified.

| Runtime Location | Customer hostname |
| --- | --- |
| `NPhuVMAaBPQz6OhIPpkj` | `app.oecher-strom.de` |
| `uGJsQ3CWvFTraTfrRgjC` | `www.tarivia.de` |

`resolveWebsiteRuntime` checks the explicit bootstrap/build Location against the
hostname. Customer hostname/Location mismatch, missing Location, and disagreement
between bootstrap and build Location fail closed. Production query parameters
cannot select a tenant, API endpoint, or key. This is a presentation/configuration
binding, not server authorization or proof of deployment ownership.

For a future authenticated Pages preview, supply the exact preview hostname in
`VITE_CUSTOMER_PREVIEW_HOSTNAME` and the intended `VITE_LOCATION_ID`; only exact
`*.pages.dev` host matches qualify. Localhost is permitted only in development.
These are public configuration values, never credentials. The existing server
`SITE_PREVIEW_LOCK`, `PREVIEW_USERNAME`, and `PREVIEW_PASSWORD` contract remains
unchanged, including authentication before customer loader gating. If using the
preview path, the Location/preview hostname must also be available to Pages
Functions; a build-only variable does not establish a server runtime binding.
No environment or hosting settings were written by this task.

The existing `kunden_config` read includes `location_id` with the three existing
config buckets. Customer responses must contain exactly one matching row.
Customer consumption uses only supplied buckets: no repository content, design,
assets, testimonials, statistics, or dictionary fallbacks are merged in. Localized
arrays may use an actual supplied unlocalized array. Missing individual copy is
omitted, never replaced with repository customer facts.

Required configuration prerequisites:

- Nonempty content, design, and layout buckets.
- Existing `content.legal.ready === true` plus nonempty
  `legal.variables.firma` and `legal.variables.email`.
- Supplied `design.assets.logo_header`, `logo_footer`, and `hero_image`, each a
  same-origin root path or HTTPS URL. This validates references, not remote asset
  availability or ownership; actual asset delivery must be verified before release.

Missing runtime/key/config, empty or mismatched rows, failed/malformed responses,
missing legal approval, and missing required asset references expose `NOT_READY`.
Unsafe customer config is withheld from consumers. The page boundary prevents
page, metadata, translator, booking, and iframe effects from mounting while
not ready and clears inherited metadata. Readiness is a configuration prerequisite
check, not legal review or release approval. Existing legal HTML overrides cannot
bypass this customer-wide approval gate.

Home, annual landing, legal pages, and callback booking can consume ready customer
config through the existing provider. All other customer entry routes remain
`NOT_READY` with `TRANSPORT_NOT_READY`: existing iframe funnels contain legacy
order consumers whose capability/consumer contracts are not accepted. Direct
`/loaders/*` requests on customer runtimes are also rejected by Pages middleware
with HTTP 503, no-store and noindex, after preview authentication if configured.
The shared `publicOrderBridge` remains untouched and dormant; no transport is
injected, no UUID-only order read is activated, and no new API is introduced.

No live customer config, branding, tariff data, assets, legal copy, or deployment
state is asserted here. Test names and content use fixtures only. No database,
Production, domain, or deployment writes are required by this integration.

## Validation

- Focused Vitest: 8 files, 146 tests pass (customer identity/config/page/funnel
  guards, existing runtime/config/legal readiness, direct loader guard, preview
  authentication, dormant public order bridge).
- Changed-file ESLint: 0 errors, 8 existing Fast Refresh warnings.
- `tsc --noEmit -p tsconfig.node.json`: passes.
- Full app TypeScript: 13 existing errors; diagnostics match the untouched base
  byte-for-byte with the same installed dependencies.
- Full `npm run lint`: 106 errors and 11 warnings, identical counts on the base.
- Vite production build: passes with the existing >500 kB chunk warning.
- `git diff --check`: passes.

The workspace rejects SWC native materialization (`ERR_SWC_NATIVE_CACHE`), so the
standard `npm test` and `npm run build` commands were attempted but fail before
project compilation. Successful Vitest/build checks used temporary configs under
`/workspace/work/`, replacing the SWC plugin with Vite's esbuild automatic JSX
transform and preserving project aliases, test environment/setup and other Vite
options. Repository configs and dependency manifests were not changed for this
workaround. These results do not assert that the native SWC commands passed.
