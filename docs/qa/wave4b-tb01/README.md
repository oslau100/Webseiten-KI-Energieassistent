# WAVE4B-TB01 – UI review and production boundaries

Repository: `oslau100/Webseiten-KI-Energieassistent`
Base: `TarifButler-zMzYbmm0fF0pPpuzSBL7`
Verified start: `27ace32b6904c3a2632ab5f619f30763f6e024b7`

The user supplied the 2026-10-10 decision register in the continuation attachment on 2026-10-13. It is a planning snapshot, not proof of today's backend enums, authorization or deployment. The original register is not committed here.

## UI-ready versus production-wired

| Area | UI-ready | Production boundary |
| --- | --- | --- |
| Recommendations | Responsive recommendation/status/date rows; German reference labels; neutral unknowns | Existing authenticated read endpoint unchanged. No names, email, internal IDs or customer contracts shown. |
| Rewards | Amount/status/date rows; `available` differs from paid/fulfilled; safe method labels | Historical reference statuses mapped conservatively. Unknown statuses remain neutral. No commission or eligibility inference. Voucher label omitted because its privacy projection is not independently verified. |
| Payout history | Historical amount/status/date retained regardless of current method | Only `paid` plus a supplied `paidAt` produces a payment date. Otherwise the supplied creation date is explicitly labelled. No transfer action. |
| Bank details | Local input, incomplete/invalid/valid format, masked review, accessible dialog, replacement-only editing | Save is always disabled. No write endpoint, fake success, local retention or third-party bank check. Submitting/save rejection/saved acknowledgment states are not simulated as runtime behavior. |
| Profile | Authorized first/last name form, required-field feedback, cancel/reset | Save is always disabled. No profile-update or email-edit endpoint added. Existing DTO has no authorized email field, so no email address is fabricated. |
| Gift card | Explanation from explicit `gift_card` method, no bank fields | No issuance or fulfillment action. No inference from null method. |
| No remuneration | Isolated synthetic card and visual fixture only | NOT connected to runtime. Requires an authoritative participation-policy DTO. `manual_no_reward` is never treated as a payment method; historical payouts remain visible in the fixture. |
| Password | Existing authenticated operation retained and tested | Same endpoint and payload. Capturing the form element before `await` fixes the existing React `currentTarget` reset issue without changing auth semantics. |
| Tab navigation | Stable existing shell, quiet local skeleton, honest `aria-busy`, generation guards | Session and bootstrap remain checked on every navigation. No private React Query cache or persistence introduced. Cached instant revisits and bootstrap deduplication are deferred. |

Bank/profile dialogs explicitly say that the entry is not saved, in plain end-user language. An empty/unknown payment method remains neutral and does not select a banking or voucher rule. Method status is not interpreted because its canonical API contract is missing. Only already-masked read values reach page state; unexpected full or malformed server values are discarded.

## Security and loading

The raw IBAN exists only in the active input's DOM value and transient edit state. It is not written into HTML `value` attributes, summaries, URLs, browser storage, logs, clipboard or API requests. Blur removes the raw value and state, retaining only a local masked representation when syntax is valid. Cancel, Escape, outside dismissal and unmount destroy the edit form; reopening starts blank. A local valid-format message never means saved or ownership verified.

ISO 13616 mod-97 uses a bounded streaming remainder. Spaces/case are normalized, illegal characters, unsupported prefixes, wrong lengths and checksums fail safely. Supported country lengths are explicit in `src/lib/iban.ts`; this is not an exhaustive bank registry or country-specific account-existence check.

No sensitive query-cache entries exist. Section/context changes suppress previous data before effects; focus/visibility revalidation first clears the displayed data and unmounts edit forms. Logout hides private content immediately and prevents pending auth/read sequences from continuing or repopulating state. Unauthenticated sessions and 401/403 redirect; errors never become stale success. Generation/unmount guards ignore obsolete success and failure responses. The existing API has no AbortSignal/session-expiry metadata, so in-flight transport is not cancelled and expiry is detected on the next authenticated request/focus/navigation. No continuous real-time session-revocation guarantee is claimed.

The previous literal `Portal wird geladen …` notice is gone. This is layout stabilization, not a cache/performance PASS: subsequent navigation still performs session → bootstrap → section reads. Timings in the browser report are synthetic local measurements with a fixed request delay and browser overhead, not live-backend latency or a demonstrated speedup.

## Validation

- `npm test`: 108 tests passed across 15 files. Unchanged base snapshot: 73 tests passed across 12 files.
- `npm run build`: passed; existing large-chunk warning remains.
- `npm run lint`: existing 22 errors and one warning outside the changed files. Same findings reproduced on the exact base snapshot: `SurveyWidget.tsx`, `tarifButlerOfferContentV2.test.ts`, `FunnelFrame.tsx`.
- ESLint on all changed TypeScript files: passed.
- Additional TypeScript check: same three pre-existing errors in `tarifButlerOfferContentV2.test.ts` on base and head; no new errors.
- `git diff --check`: passed.
- Test dependencies installed without changing package files. There is no npm lockfile; SWC was installed at the repository's `bun.lock` version, 1.15.18, after a newer range-resolved native build failed this environment's cache checks. Proxy settings and TLS verification were preserved.
- Chromium/Playwright fixture QA: all four sections and both dialogs at 320, 375, 390, 428, 760, 1024 and 1440 CSS px. Document and dialog overflow checks, reduced-motion rendering, and a 320×400 short-viewport keyboard/focus check. See reports beside this document.
- This is Chromium rendering at iPhone-sized widths, not a physical iPhone/Safari or real software-keyboard certification. No live Platform Worker, account/financial data or production E2E used.

## Review gallery

All screenshots use synthetic API responses. Input fields inside dialogs are redacted. External requests were blocked in both original and final screenshots; the existing remote logo could not be visually checked. Header/nav/theme tokens and four destinations are unchanged. The HTML gallery can be downloaded with its adjacent PNGs; GitHub links below work directly without a preview deployment.

| Section | Desktop 1440 | iPhone-sized 390 |
| --- | --- | --- |
| Overview | [Image](portal-1440.png) | [Image](portal-390.png) |
| Recommendations | [Image](empfehlungen-1440.png) | [Image](empfehlungen-390.png) |
| Rewards | [Image](belohnungen-1440.png) | [Image](belohnungen-390.png) |
| Settings/history | [Image](profil-1440.png) | [Image](profil-390.png) |
| Gift card | [Image](settings-voucher-1440.png) | [Image](settings-voucher-390.png) |
| Unknown method | [Image](settings-unknown-1440.png) | [Image](settings-unknown-390.png) |
| Absent method | [Image](settings-absent-1440.png) | [Image](settings-absent-390.png) |
| Bank without saved details | [Image](settings-bank-empty-1440.png) | [Image](settings-bank-empty-390.png) |
| No remuneration – isolated fixture | [Image](isolated-no-reward-1440.png) | [Image](isolated-no-reward-390.png) |
| Profile dialog | [Image](profile-edit-1440.png) | [Image](profile-edit-390.png) |
| Initial loading | [Image](initial-loading-1440.png) | [Image](initial-loading-390.png) |
| Read error | [Image](read-error-1440.png) | [Image](read-error-390.png) |

| Bank dialog | Desktop | Mobile |
| --- | --- | --- |
| Empty | [Image](bank-empty-1440.png) | [Image](bank-empty-390.png) |
| Incomplete | [Image](bank-incomplete-1440.png) | [Image](bank-incomplete-390.png) |
| Invalid checksum | [Image](bank-invalid-1440.png) | [Image](bank-invalid-390.png) |
| Valid format, input redacted | [Image](bank-valid-format-redacted-1440.png) | [Image](bank-valid-format-redacted-390.png) |
| Masked, saving unavailable | [Image](bank-masked-save-disabled-1440.png) | [Image](bank-masked-save-disabled-390.png) |

Empty rows: [recommendations desktop](empty-empfehlungen-1440.png), [mobile](empty-empfehlungen-390.png); [rewards desktop](empty-belohnungen-1440.png), [mobile](empty-belohnungen-390.png); [payouts desktop](empty-profil-1440.png), [mobile](empty-profil-390.png).

Before: [recommendations](before-empfehlungen-1440.png), [rewards](before-belohnungen-1440.png), [settings](before-profil-1440.png), [loading notice](before-loading-1440.png). After: [tab revisit](tab-revisit-1440.png). [Complete HTML gallery](gallery.html).

## Later integration gates

T07/T08 must supply and approve authenticated, location-scoped bank/profile write contracts, authoritative participant policy, current method/status projections, error/conflict/idempotency and audit requirements, and safe masked read acknowledgment. No server-save states should be enabled before that review. Legal/account ownership checks and true live E2E remain separate. Existing API contracts, binding proxy, SQL/Supabase, public funnel, registration/referral capture and other branches were not modified. No merge, production deployment, payment/voucher request or external notification was performed.

## Reproduce the browser review

Run from the implementation worktree with Playwright and Chromium available (optional `WAVE4B_PLAYWRIGHT_MODULE` / `WAVE4B_CHROMIUM` select installed binaries). The fixture scripts intercept every API call and block external hosts. They fail on unrecognized API actions. First create an exact baseline snapshot under `work/base` using `git archive` of the start SHA, and link the installed `node_modules` there. Run the current Vite server on localhost:8080 and the baseline server on localhost:8081; neither is a deployment. Run `node docs/qa/wave4b-tb01/browser.test.cjs` and `node docs/qa/wave4b-tb01/keyboard.test.cjs`. The first script creates its isolated no-remuneration HTML entry under `work/`, regenerates the gallery and writes its report under `work/`. No fixture route is added to the production app. Lint was run with `--ignore-pattern 'work/**'` to exclude these generated scratch files.
