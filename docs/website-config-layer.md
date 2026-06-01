# Website Config Layer – Ehiogie

## Zweck

Diese Schicht bereitet den Ehiogie-Branch darauf vor, öffentliche Website-Konfiguration später sauber aus `public.kunden_config` zu lesen. Die dafür vorgesehenen Supabase-Spalten sind:

- `webseite_content_config`
- `webseite_design_config`
- `webseite_layout_config`

Die Spalten dürfen ausschließlich öffentliche Website-Werte enthalten, zum Beispiel Copy, Branding, Layout-Optionen, Legal Links, CTA-Konfiguration und Social Links. **Secrets, Service-Role-Keys, echte Tokens und produktionskritische private Werte gehören niemals in `webseite_*_config`.**

## Fallback-Reihenfolge

Die vorbereitete Resolver-Reihenfolge ist:

1. valide Supabase-Overrides aus `kunden_config.webseite_*_config`, wenn zur Laufzeit eine öffentliche Supabase-URL und ein anon/publishable Key vorhanden sind
2. tenant-/location-spezifischer Repo-Fallback für Ehiogie
3. sicherer technischer Default (`content`, `design` und `layout` als leere Objekte)

Supabase wird in diesem Schritt nur read-only über die REST-Schnittstelle vorbereitet. Es gibt keine Schreiboperation, keine Migration und kein SQL in diesem Task.

## Vorbereitete Werte

Die zentrale Schicht liegt in `src/lib/websiteConfig.tsx`, weil sie bereits der React-Provider für die laufende Website ist. Eine reine `src/lib/websiteConfig.ts`-Datei wäre für die aktuelle Struktur unpassend, da der Provider JSX rendert.

Vorbereitet sind aktuell:

- Typen für `WebsiteConfig`, `WebsiteConfigOverrides`, Config-Buckets und die Quelle der geladenen Werte
- Ehiogie-Tenant-Fallback mit `locationId: tn90CyE3XuYFTy4c1M3F`
- sichere Defaults für Content, Design und Layout
- Repo-Fallbacks aus `src/lib/customerDefaults.ts`
- `mergeWebsiteConfig()` für spätere Overrides
- `resolveWebsiteConfig()` für die Zielreihenfolge aus sicherem Default, Repo-Fallback und Supabase-Overrides
- read-only Runtime-Laden aus `public.kunden_config`, wenn `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` oder passende Bootstrap-Werte vorhanden sind

## Gefundene Hardcodings / verstreute Werte

Beim Audit wurden diese Bereiche als aktuell hart codiert oder historisch verstreut identifiziert:

- Branding und Kontaktwerte in `src/lib/websiteContentDefaults.ts`
- Designfarben, Radien und Asset-URLs in `src/lib/customerDefaults.ts`
- Logo-, Hero- und Agentur-Asset-URLs in `src/lib/customerDefaults.ts`
- SEO-Titel, Favicon, Canonical URL und Open-Graph-/Twitter-Images in `index.html`
- Hero- und Website-Texte in `src/lib/websiteContentDefaults.ts`, `src/lib/i18n.tsx` und einzelnen Komponenten-Fallbacks
- CTA-Texte und CTA-Ziele in `src/lib/websiteContentDefaults.ts`, `src/lib/i18n.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`, `src/components/Hero.tsx` und Seitenkomponenten
- Legal-Werte und Legal-Links in `src/lib/websiteContentDefaults.ts`, `src/pages/Impressum.tsx`, `src/pages/Datenschutz.tsx` und Footer/Header-Navigation
- Social Links in `src/lib/websiteContentDefaults.ts` und `src/components/About.tsx`
- `location_id` / Ehiogie-Location in der Website-Config-Schicht und in bestehenden Loader-/Bootstrap-Kontexten
- Layout-/Section-Reihenfolgen in `src/lib/customerDefaults.ts`
- Tailwind-/Designwerte in `src/index.css`, `tailwind.config.ts` und Komponentenklassen

## Bereits config-driven

Ohne sichtbare UI-Änderung laufen bereits diese Werte über die Config-Schicht:

- `design.assets` für Header-/Footer-Logo, Hero-Bild und Agentur-Logo
- `design.colors` für CSS-Variablen `--website-primary`, `--website-bg` und `--website-text`
- Hero-Copy unter `sections.hero.*`
- viele Home-/Jahresrechnung-Section-Texte unter `sections.*`
- Legal-Variablen unter `legal.variables.*`
- Social Links unter `sections.about.social.*`
- Markenwerte unter `brand.*`

## Bewusst noch nicht migriert

Nicht migriert wurden in diesem Schritt:

- i18n-Dictionaries in `src/lib/i18n.tsx`
- deutsche Source-of-Truth-Texte und Übersetzungen
- große Komponenten-Fallback-Arrays oder CTA-Routen
- Legal-Seitentexte außerhalb bestehender Variablen
- SEO-/Meta-Werte in `index.html`
- Favicon-Datei und statische Public-Assets
- Tailwind-Konfiguration und globale CSS-Tokens
- Loader-/Angebotsseiten-Bootstrap-Dateien
- Supabase-Schema, Migrationen, SQL-Dateien oder produktive Datensätze

Diese Punkte sollen später schrittweise und mit Screenshot-/Copy-Vergleich migriert werden, damit keine sichtbaren Text-, Übersetzungs- oder Designänderungen entstehen.
