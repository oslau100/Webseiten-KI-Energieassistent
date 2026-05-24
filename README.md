# vibe-template

A React + TypeScript template powered by Vite, Tailwind CSS, and shadcn/ui components.

## Requirements

- Node.js 18+ (LTS recommended)
- npm

## Getting started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

## Available scripts

- `npm run dev` - start Vite in development mode
- `npm run build` - create a production build
- `npm run build:dev` - create a development-mode build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint checks
- `npm run test` - run Vitest tests once
- `npm run test:watch` - run Vitest in watch mode

## Verification commands

Use these to verify repository health:

```bash
npm run lint
npm run test
npm run build
npx tsc --noEmit
```

## Lockfile policy

This repository does not track `package-lock.json`.

## Kundenbranches als aktuelle Source of Truth

Der bisherige `Template`-Branch ist aktuell **nicht** die operative Wahrheit und darf derzeit nicht als verlässliche Basis für produktive Änderungen behandelt werden.

Stattdessen sind aktuell die produktionsnahen Kundenbranches die relevante Source of Truth:

1. Der Branch **Ehiogie** ist der aktuelle Fokusbranch und wird zuerst production-ready fertiggestellt.
2. Danach wird **Kromen** in einem kontrollierten Catch-up auf denselben funktionalen Stand gebracht.
3. Beim Kromen-Catch-up werden ausschließlich funktionale/systemische Änderungen übernommen; **Kromen-spezifische Werte müssen erhalten bleiben**.
4. Es dürfen im Catch-up **keine Ehiogie-Werte, keine Template-Platzhalter und keine falschen Kundendaten** übernommen werden.
5. Erst wenn **Ehiogie und Kromen production-ready** sind, wird daraus ein neues sauberes `Template`/`main` als Onboarding-Basis für neue Kunden abgeleitet.

## Angebotsseite und Bootstrap-Werte

Die Live-Angebotsseite ist Teil des jeweiligen Kundenbranches und wird über Cloudflare deployed.

Wichtig für Änderungen:

- Die Angebotsseite ist **kein** Supabase-Engine-Asset.
- Änderungen in `KI-Energieassistent/Loaders/angebotsseite-loader.html` werden **nicht automatisch** live.
- Systemische Änderungen müssen bewusst, reviewbar und diff-basiert in den jeweiligen Kundenbranch übernommen werden.
- Produktive Bootstrap-Werte sind kundenspezifisch und dürfen nicht durch Template-Placeholder überschrieben werden.

Geschützte Werte (dürfen nicht unbeabsichtigt überschrieben werden):

- `location_id`
- `supabaseUrl`
- `supabaseKey` / anon key
- `settingProxyPath`
- `closingProxyPath`
- `offerUrl`
- `auftragUrl`
- `startUrl`
- `avatarUrl`
- Domains
- Assets
- Social Links
- Legal Links
- Branding/Farben
- Kalender-/Callback-IDs
- GHL Location-/Pipeline-/Stage-/Field-Werte (falls im Website-Kontext vorhanden)

