# T08 draft validation

Compared against untouched PR #176 head
`8888b523707241e644261456531270af0533160d` using the same installed dependencies.
No dependency manifest, lockfile, Vite/Vitest config or CI config changed.

- Focused Vitest: 10 files / 208 tests pass, including 42 new tests loading the
  actual JSON drafts, both customer runtimes, page/config/asset guards, legal
  readiness, shared system translations, preview authentication, direct loader
  boundary and dormant public-order bridge.
- Changed-file ESLint: 0 errors, 7 existing Fast Refresh warnings in
  `websiteConfig.tsx`.
- Full lint: 106 errors / 11 warnings; output is byte-identical to the untouched
  baseline with the same dependencies.
- Full app TypeScript (`tsc --noEmit -p tsconfig.app.json`): 13 existing errors;
  diagnostics are byte-identical to baseline. No new diagnostic in changed files.
- Node TypeScript (`tsc --noEmit -p tsconfig.node.json`): passes.
- Vite production build: passes with the existing >500 kB chunk-size warning.
- `git diff --check`: passes.

Standard `npm test` and `npm run build` were attempted on the untouched baseline;
SWC fails before project compilation with `ERR_SWC_NATIVE_CACHE`. Successful
checks use ignored temporary `work/vitest.esbuild.config.ts` and
`work/vite.esbuild.config.ts`: same project root, alias, test setup/environment and
automatic JSX transform, omitting the unavailable native SWC plugin. Native SWC
checks remain unverified; the workaround does not establish their success.

Focused command:

```sh
npx vitest run --config work/vitest.esbuild.config.ts \
  src/test/customerConfigDrafts.test.tsx \
  src/lib/customerRuntime.test.ts src/lib/websiteConfig.test.tsx \
  src/components/CustomerRuntimeBoundary.test.tsx \
  src/test/customerSystemTexts.test.tsx src/pages/legalReadiness.test.tsx \
  src/lib/websiteRuntime.test.ts src/test/customerLoaderBoundary.test.ts \
  src/test/previewLock.test.ts src/lib/publicOrderBridge.test.ts
```

The temporary test config is equivalent to the repository config with
`plugins: [react()]` removed and `esbuild: { jsx: "automatic" }` added. The build
config makes the same transform substitution and retains the source alias; no
hosting or deployment command is involved.

Positive tests use local copies with fixture-only legal approval/contact and
`assets.example.test` URLs. They prove consumer behavior, not actual customer
readiness. Persisted drafts remain legally unapproved with undelivered symbolic
Storage references. Tests perform no Storage, database, CRM or deployment writes.

Supabase Storage documentation was checked through the read-only documentation
connector: `getPublicUrl` is a URL-construction helper, not bucket visibility or
object delivery verification. Direct changelog/document fetches were denied by
the environment HTTP policy; no new Supabase API/feature is implemented here.
