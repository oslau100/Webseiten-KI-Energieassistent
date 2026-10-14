# WAVE4B-TB03 – customer-facing copy cleanup

Base: `codex/wave4b-tb02-modal-visual-remediation-2026-10-14` at `71a5d98aa9079df1bb612521cbdd5f5baf7c301a` (#178 → #177).

Before any implementation, GitHub branch/commit/tree were read through the connector. Local `ea5e4e399a11ae16f434a2dc85cf0ab2d6263cfe` has the identical source tree `2a95630582634851a9802481fa6bf6a6ace1c718`; all 207 paths, blob hashes and modes were independently compared. Publication uses the verified remote TB02 SHA as parent, not the local metadata-different commit. No fallback or CLI fetch/push.

## Complete before/after copy matrix

| Location | Before | After |
| --- | --- | --- |
| Bank dialog description | Prüfe das Format deiner Bankverbindung. Diese Eingabe wird nicht gespeichert. | Removed |
| Bank explanation | Nur eine formale Prüfung. Sie bestätigt weder das Konto noch die Kontoinhaberschaft. | Removed |
| Bank save explanation | Deine Eingabe wird nicht gespeichert. | Removed |
| Profile dialog description | Prüfe deine Angaben. Änderungen werden hier nicht gespeichert. | Removed |
| Profile save explanation | Deine Änderungen werden nicht gespeichert. | Removed |
| Shared portal/auth failure | Der Portal-Service ist zurzeit noch nicht verfügbar. Bitte versuche es später erneut. | Das hat leider nicht geklappt. Bitte versuche es später erneut. |
| Unsupported/unknown country prefix validation | Dieses Länderkennzeichen kann hier nicht geprüft werden. | Bitte prüfe das Länderkennzeichen deiner IBAN. |

No replacement notices, new cards, hints or placeholders were added. Removed descriptions are also removed from accessibility references; dialog titles still provide their accessible names, and live validation retains its valid `iban-check` description target. The always-present live validation region is retained for announcements, not replaced with a blank development notice.

Customer text in Affiliate.tsx (landing, all auth variants, four portal sections and password form), AffiliateLayout, PartnerSettings, PartnerList, affiliate.ts translations, IBAN messages and status/date/amount presentation was audited. [Full source-literal inventory](copy-inventory.json) captures 185 before / 180 after occurrences, including static parts of dynamic labels; repeated occurrences are retained. It is a manually reviewed candidate inventory, not a count of simultaneously rendered labels. Dynamic personal values, amounts and dates are excluded. [Reproducible audit](copy-audit.cjs).

Necessary input errors, “Das IBAN-Format ist gültig”, permission redirects, empty/loading/error states, registration consent, payout status, dates, amounts and financial semantics are preserved. No known separately evidenced legal mandate was identified for the removed implementation explanations. No ownership/account-existence/saved-success claim replaces them. This is not a legal or live-backend readiness certification.

## Frozen design and safety

All card/dialog/action/disabled-action/action-layout style constants are unchanged. Width, radius, navigation, tables and global primitives/theme are unchanged. Compiled CSS is byte-for-byte identical to the exact TB02 build (SHA-256 `013fc47280cffde49c4540e94d3c3221d1198fa6f0a8ff7c8a84d3df600f4e78`). [Freeze proof](freeze-proof.json).

Only unwanted prose and its invalidated accessibility references were removed; shorter content reflows naturally. No padding/height/layout workaround or empty replacement paragraph was added. Save remains natively disabled and gray in bank/profile forms. No mutation, success toast, new API, live bank/profile transmission or storage. Country validation changes only its instruction string; normalization, known lengths, checksum, masking, transient-data erasure and focus remain unchanged.

The missing audited bank/profile write contracts remain an internal production-wiring dependency, documented here and in TB01/TB02. Their explanation is intentionally absent from customer UI. No backend, proxy, Supabase, SQL/RLS, other customer branch, public funnel or production website write; no merge/deployment.

## Validation and regression

- Exact TB02 baseline: 108 tests passed, 15 files. TB03: 112 tests passed, 16 files.
- Build passed; existing large-chunk warning retained. Changed TS/TSX files lint clean; git diff --check passed.
- Exact TB02 baseline reproduces 22 unrelated lint errors and one warning; no global lint-clean claim. No unrelated repairs.
- Browser runs use separately built TB02/TB03 bundles on local preview ports 8103/8102, avoiding duplicate React instances caused by shared Vite dev caches. No project configuration change or deployment.
- Chromium fixture QA at 320/375/390/428/760/1024/1440 plus 320×360: 30 settled modal measurements; 16 redacted before/after images. All modal max-width/radius, opacity/reduced-motion, overflow, field/text/action reachability, scroll, focus trap/return/replacement, Escape/backdrop/Close, disabled gray save, disabled masked format check, replacement re-entry and raw-value absence assertions pass.
- Normal portal/auth screens and a synthetic read failure were checked for internal copy; auth/link/required-input/IBAN errors remain honest. Existing regression tests cover protected routes, logout/401/403, stale response guards, normalization/checksum and sensitive-field cleanup.
- Synthetic replies only; all external assets blocked and unexpected write requests rejected. No full IBAN embedded in evidence scripts/images/reports; browser input uses the existing public synthetic unit-test fixture and screenshots redact dialog inputs.
- External logo and physical iOS/keyboard/notch evidence gaps remain inherited from TB02. Logo unchanged. No live backend or real financial evidence claimed.

## Review gallery

| Screen | Before desktop | After desktop | Before mobile | After mobile |
| --- | --- | --- | --- | --- |
| Bank | [Before](before-bank-1440.png) | [After](after-bank-1440.png) | [Before](before-bank-390.png) | [After](after-bank-390.png) |
| Profile | [Before](before-profile-1440.png) | [After](after-profile-1440.png) | [Before](before-profile-390.png) | [After](after-profile-390.png) |
| Settings | [Before](before-settings-1440.png) | [After](after-settings-1440.png) | [Before](before-settings-390.png) | [After](after-settings-390.png) |

Masked format check: [desktop](after-masked-1440.png), [mobile](after-masked-390.png). Short viewport: [bank](after-short-bank.png), [profile](after-short-profile.png). [HTML gallery](gallery.html), [measurements and assertions](results.json), [browser script](browser.test.cjs).

To reproduce, archive the verified equivalent TB02 source tree under work/tb03-base and link installed dependencies; build both trees and serve their local Vite previews on 8103/8102 respectively. Run the browser script from the implementation worktree with installed Playwright/Chromium selected through its optional environment variables. Run copy-audit.cjs after the baseline snapshot exists. No production routes or dependencies were added.
