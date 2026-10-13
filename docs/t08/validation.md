# T08 original-asset review remediation — validation

Starting local commit: `dc423bf3352dbda896ce82c01ec245f6b7e099fc`.
Remote checked read-only and unchanged at expected
`8888b523707241e644261456531270af0533160d`.
Same branch; prior commit is preserved as the parent of the remediation.

## Input verification

All eight delivered originals independently matched the supplied SHA-256 manifest,
file size, actual MIME format and dimensions (Pillow image-header inspection).
All four phone images were visually checked: angled Hero, straight second section,
177 tariff / 477 EUR marketing content retained. Review copies under docs/t08/assets
are byte-identical, outside public/ and runtime imports; no generated replacement.

The operator archive hash is recorded in asset-manifest.json. Source texts and
operator manifest are preserved unchanged under source-evidence/. Handover #664
was read directly in KI-Energieassistent at
`a666af6e7bc3b3065bb7c19ff396e1f26a878a36`; its relevant excerpt is included for
independent review. There was no live Storage inspection or write in this task.

## Checks

- Focused Vitest: **13 files / 242 tests pass**. Actual draft/hash checks, corrected
  rendered Hero/second-section images, full known legal identity/14-section privacy,
  legal gate, arbitrary HTTPS rejection, unsafe root paths, foreign Location assets,
  matching row identity/no fallback, translations, legal/metadata/About/Footer,
  preview auth, direct loader boundary and dormant public-order bridge.
- Changed-file ESLint: **0 errors / 0 warnings** for customerRuntime.ts,
  customerRuntime.test.ts and customerConfigDrafts.test.tsx.
- Full lint: **106 errors / 11 warnings**, byte-identical to the untouched starting
  local commit's baseline with the same installed dependencies.
- Full app TypeScript: **13 existing errors**, diagnostics byte-identical to that
  baseline; no new diagnostic. `tsc --noEmit -p tsconfig.app.json`.
- Node TypeScript: **passes**. `tsc --noEmit -p tsconfig.node.json`.
- Vite production build: **passes** using the temporary esbuild config, with the
  existing >500 kB chunk-size warning. Build output contains no review originals.
- `git diff --check` excluding the byte-preserved original legal source: **passes**.
  The unfiltered check reports 14 intentional Markdown hard-break trailing-space
  lines in the supplied original legal document. They are preserved unchanged as
  evidence; this is not a code diagnostic or a reason to alter the original.

Standard `npm test` and `npm run build` were attempted again on the untouched
starting commit; both fail during native SWC startup (`ERR_SWC_NATIVE_CACHE`),
before project compilation. Successful tests/build use ignored temporary
`work/vitest.esbuild.config.ts` and `work/vite.esbuild.config.ts` with automatic JSX,
the same root, alias and test setup/environment, and no unavailable SWC plugin.
Native SWC checks remain unverified. Repository config, dependencies and lockfiles
are unchanged. This workaround does not assert standard native commands passed.

Focused command:

```sh
npx vitest run --config work/vitest.esbuild.config.ts \
  src/test/customerConfigDrafts.test.tsx src/lib/customerRuntime.test.ts \
  src/lib/websiteConfig.test.tsx src/components/CustomerRuntimeBoundary.test.tsx \
  src/test/customerSystemTexts.test.tsx src/pages/legalReadiness.test.tsx \
  src/lib/websiteRuntime.test.ts src/test/customerLoaderBoundary.test.ts \
  src/test/previewLock.test.ts src/lib/publicOrderBridge.test.ts \
  src/components/WebsiteMetadata.test.tsx src/components/About.test.tsx \
  src/components/Footer.test.tsx
```

Positive render tests replace symbolic references only in local copies with
same-origin fixture paths and legal approval. They do not assert actual Storage
existence, approved delivery or publication. Both saved legal.ready flags remain
false, the bucket remains NICHT FREIGEGEBEN and deliveryVerified remains false.
No network probe of a supplied image is treated as delivery verification.

No push, Cloudflare preview/deployment, Supabase mutation, merge, UI-wave change,
funnel-security change or customer-base-branch modification is performed.

## Standard-Rechtstexte und Consent — 14. Oktober 2026

Ausgangspunkt: PR #176, Branch `codex/t08-oecher-tarivia-runtime-integration`,
SHA `12045f5c1f72be35449a7214ca22eabd13cb1a4f`. Kein neuer PR und kein Merge.

- 13 relevante Vitest-Dateien / **307 Tests bestanden**: Rechtstext-Readiness und
  HTML-Sicherheit (auch bei Fixture-Freigabe beider Kunden), vollständige
  markenspezifische Texte, Browserpräferenzen, optionale Ressourcen vor/nach
  Zustimmung und Widerruf, Kundenisolation sowie Runtime-/Loader-/Preview-Sperren.
  Aufruf: `npm test -- --config work/vitest.esbuild.ts` mit den Dateien
  `legalReadiness`, `customerConfigDrafts`, `customerSystemTexts`,
  `privacyIntegrations`, `i18nStorage`, `JotformReviewWidget`, `reviewsIntegration`,
  `customerRuntime`, `websiteRuntime`, `previewLock`, `customerLoaderBoundary`,
  `CustomerRuntimeBoundary`, `Footer`.
- `npm run build` mit regulärer Konfiguration ausgeführt: SWC-Start scheitert
  umgebungsbedingt mit `ERR_SWC_NATIVE_CACHE` / `Failed to load native binding`.
  Ein eigener Cachepfad behebt die Vertrauensprüfung der Vorfahren nicht.
  `npm run build -- --config work/vite.esbuild.ts` **bestanden**, nur vorhandene
  Chunk-Größenwarnung. Wie zuvor werden automatische JSX/esbuild-Konfigurationen
  ausschließlich im ignorierten `work/` genutzt. Keine Vite-/Vitest-/Dependency-
  Konfiguration für diesen Umgebungsfehler geändert. Native SWC-Prüfung bleibt offen.
- `npm run lint` ausgeführt: **106 Fehler / 11 Warnungen**, identische Diagnostik
  gegenüber einem unveränderten Worktree des Start-SHA. Geänderte Dateien einzeln:
  **0 Fehler / 2 vorhandene Fast-Refresh-Warnungen**.
- Zusätzlich TypeScript geprüft: **13 vorhandene Fehler**, Ausgabe byte-identisch
  zum unveränderten Startstand; keine neuen TypeScript-Diagnosen.
- `git diff --check` **bestanden**.
- Supabase-Projektmetadaten ausschließlich read-only abgerufen: `eu-central-1`.
  Keine Datenbank-/Storage-/Production-Writes, Migrationen oder Versandtests.
- Keine Änderungen an `crm/app/**`, keine zusätzlichen Tracking-Skripte und keine
  Änderungen der Hostingkonfiguration oder manuellen Deployments. Der beauftragte
  Push kann über die bestehende Git-Integration automatische Branch-Previews
  auslösen. Beide gespeicherten Configs behalten `legal.ready=false`.

Verbleibende rechtliche/technische Nachweise stehen im aktualisierten
[legal-review-checklist.md](legal-review-checklist.md); insbesondere finale
Text-/Datenflussfreigabe, USt-ID-Prüfung, Dienstleisterverträge/Transfers,
Speicherregeln sowie Location-spezifische Mailgun-Konfiguration. Diese werden
nicht durch sichtbare Platzhalter in den Veröffentlichungstexten ersetzt.
