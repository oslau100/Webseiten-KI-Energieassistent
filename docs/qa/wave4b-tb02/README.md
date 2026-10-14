# WAVE4B-TB02 – localized visual remediation

Base branch: `codex/wave4b-tarifbutler-partnerportal-ui-2026-10-13`

Expected remote parent: `f425147ea6ff05c3a240e992e2e0146ac1f0737c` (TB01 / draft PR #177).

The existing local commit `c515e271abb9ba56bb443cd7deffd8c9a5f5d63d` has the exact same root tree `f8422dc3e27209800b8b7e8a9cd2edc7848a7bbb`. Before writes, the remote branch and recursive tree were read through the GitHub connector; all 183 local files were independently compared by path, blob hash, mode and type. TB02 uses this proven source tree locally and the remote TB01 commit as publication parent. No CLI fetch or push.

## Fix and limits

Only the bank/profile dialogs receive a 512 px maximum width, viewport-minus-32 px mobile width and explicit 24 px rounding at both base and sm breakpoints. This overrides the inherited theme-dependent sm rounding without changing the global primitive/theme. Short-height dialogs scroll; the existing bottom safe-area padding remains. Reduced-motion animation suppression is locally important so the primitive's data-state animation cannot override it. Screenshots wait for all running animations to finish before measuring geometry.

Actions stack at 320 px, use two columns from 375 px, and wrap on desktop. Save remains genuinely disabled, with an opaque gray background, border and muted text instead of a faded green action. Format checking is disabled when no raw input exists or the IBAN is already masked; intentional replacement permits a new check. Focus moves to the replacement action after masking and to the new input after replacement. Raw IBAN handling, formal validation, API contracts and business semantics remain unchanged.

Recommendations now say only “Empfehlung” in the first column; the date appears once in the date column. Lists reserve status-column width; payout history uses a compact amount column and a 168 px status column. Badges stay on one line, including “Nicht abgeschlossen”; date cells may wrap naturally. Mobile stacked rows and three desktop columns remain.

No bank/profile mutation, success toast, new endpoint, global styling, primitive, AffiliateLayout, backend, service binding, Supabase/SQL/RLS, public funnel or registration change.

## Validation

- Exact TB01 source-tree baseline: 108 tests passed, 15 files.
- TB02: 108 tests passed, 15 files; existing tests now additionally assert no duplicate referral date, disabled masked format checking and replacement behavior.
- Production build passed (existing large-chunk warning).
- ESLint of all five changed TS/TSX files passed.
- Exact TB01 baseline lint reproduces 22 errors + 1 warning outside the changed files: SurveyWidget.tsx, tarifButlerOfferContentV2.test.ts, FunnelFrame.tsx. Three baseline TypeScript errors in tarifButlerOfferContentV2.test.ts are reproduced on TB02, with no new errors.
- git diff --check passed.
- Chromium/Playwright: 30 settled modal measurements, all 320/375/390/428/760/1024/1440 px, plus 320×360 short viewport. At 1440: before width 1408 px and radius 9999 px; after width 512 px and radius 24 px for both dialogs.
- Automatic checks cover width/radius/opacity/reduced-motion, document and dialog overflow, text/input/button bounds and scroll reachability, focus trap/return and replacement focus, Escape/backdrop/Close, gray disabled save, masked check disabling and replacement re-enabling, raw-value removal and absence in HTML attributes/requests, single date per recommendation, one-line payout badges, and reward availability distinct from fulfillment. All API replies are synthetic; unrecognized writes fail the fixture script.
- 20 before/after images, with dialog inputs redacted. Geometric assertions inspect actual DOM independent of redaction. No customer account/financial data in evidence.

## Gallery

| View | Before desktop | After desktop | Before mobile | After mobile |
| --- | --- | --- | --- | --- |
| Bank dialog | [Before](before-bank-1440.png) | [After](after-bank-1440.png) | [Before](before-bank-390.png) | [After](after-bank-390.png) |
| Profile dialog | [Before](before-profile-1440.png) | [After](after-profile-1440.png) | [Before](before-profile-390.png) | [After](after-profile-390.png) |
| Referrals | [Before](before-referrals-1440.png) | [After](after-referrals-1440.png) | [Before](before-referrals-390.png) | [After](after-referrals-390.png) |
| Payouts | [Before](before-payouts-1440.png) | [After](after-payouts-1440.png) | [Before](before-payouts-390.png) | [After](after-payouts-390.png) |

Masked bank/disabled actions: [desktop](after-masked-1440.png), [mobile](after-masked-390.png). Short viewport: [bank](after-short-bank.png), [profile](after-short-profile.png). [Complete gallery](gallery.html), [measurement/assertion report](results.json), [reproducible browser script](browser.test.cjs).

Run the script from the implementation worktree, with current Vite on localhost:8090 and an archived exact TB01 source tree on localhost:8091. Select installed Playwright/Chromium through WAVE4B_PLAYWRIGHT_MODULE / WAVE4B_CHROMIUM if needed. External hosts are blocked in fixture QA. No fixture routes or dependencies are added to the production application.

## EVIDENCE REQUIRED – live logo and mobile hardware

The existing `vibe.filesafe.space` logo URL is retained byte-for-byte in AffiliateLayout. That host is absent from the enforced allowed-host policy. GitHub reports the TB01 “Cloudflare Pages: tarifbutler” check succeeded, but provides a Cloudflare dashboard link, not evidence that this external image loads. The isolated QA blocks all external assets deliberately. Neither observation proves a defective production logo; no replacement, invented logo or policy bypass was made. A permitted real preview/browser must still verify the actual asset response and displayed logo.

Chromium at mobile sizes and a short viewport are not physical iOS/Safari/software-keyboard certification. CSS viewport/scroll and existing safe-area padding are checked; a real-device keyboard/notch test remains EVIDENCE REQUIRED. Save remains gated on the missing audited backend contracts from TB01. No merge or production deployment was performed.
