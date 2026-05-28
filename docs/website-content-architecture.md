# Website Content Architecture (Phase 1 Audit) – Ehiogie Branch

## 1) Zielbild

- **Langfristig** ist Supabase die kundenspezifische Source of Truth für Website-Texte.
- Das Repository hält vollständige **Standard-Fallbacks in 12 Sprachen** (`de`, `en`, `tr`, `ru`, `ar`, `it`, `zh`, `hi`, `es`, `fr`, `nl`, `pl`).
- Bei Supabase-Ausfall oder fehlender Verbindung muss die Website stabil mit Repo-Fallback-Copy laufen.
- **Deutsch ist die Master-Copy**.
- Übersetzungen sind lokalisierte Varianten der deutschen Master-Copy und semantisch daran gekoppelt.
- Komponenten sollen langfristig nicht mehr unterscheiden müssen, ob Text aus Supabase, `i18n`, `customerDefaults` oder technischem Fallback kommt.
- Komponenten sollen stattdessen zentral über einen Resolver lesen.

## 2) Ist-Zustand im Ehiogie-Branch

### Rolle von `src/lib/customerDefaults.ts`

- Enthält die projektweiten Default-Konfigurationen für Design, Layout und Content:
  - `customerDefaultWebsiteDesignConfig`
  - `customerDefaultWebsiteLayoutConfig`
  - `customerDefaultWebsiteContentConfig`
- In `customerDefaultWebsiteContentConfig.sections.hero` liegt die Ehiogie-Hero-Copy **mehrsprachig** (12 Sprachen) inklusive `badge`, `headline`, `subline`, `cta_text`, `result_note`.
- Außerdem liegen hier viele weitere section-basierte Content-Fallbacks (u. a. `problem`, `solution`, `how_it_works`, `comparison`, `testimonials`, `about`, `stats`, `faq`, `jahresrechnung`, `final_cta`, `callback`, `links`).

### Rolle von `src/lib/i18n.tsx`

- Enthält Spracheinstellungen (`LANGUAGES`) und Dictionaries für UI-/Navigations-/Status-/Headline-Texte.
- Liefert `t()`-basierte Keys für viele Headings/Labels/Fallbacks (z. B. Header-CTA, Footer-Labels, FAQ-Headlines, Annual-Headlines, Statusseiten-Texte).
- Ist aktuell parallel zu sectionbasierten Content-Defaults aktiv.

### Rolle von `src/lib/websiteConfig.tsx`

- Zentraler Config-Provider (`WebsiteConfigProvider`) für `design`, `content`, `layout`.
- Nutzt per Default `customerDefault...Config` aus dem Repo.
- Ist auf Supabase-Runtime-Overrides vorbereitet: Fetch aus `public.kunden_config` mit `webseite_design_config`, `webseite_content_config`, `webseite_layout_config`.
- Verwendet `deepMerge` für Objekt-Overrides.
- `getText`, `getArray`, `getObject` liefern Inhalte aus `content` inklusive lokalisierter Auflösung (`lang`, dann `de`, dann erster Stringwert, sonst Fallback-Argument).

### Welche Texte kommen aktuell primär aus `customerDefaults.ts`

- Hero-Copy der Startseite (`sections.hero.*`) inkl. Mehrsprachigkeit.
- Große Teile der Sections auf Home/Jahresrechnung über `sections.*` (`problem`, `how_it_works`, `comparison`, `testimonials`, `about`, `stats`, `faq`, `jahresrechnung`, `final_cta` etc.).
- Marken-/Kontakt-/Link-Felder unter `brand`, `links`, `legal.variables`.

### Welche Texte kommen aktuell primär aus `i18n.tsx`

- Navigations-/UI-Texte (z. B. Header-/Footer-Labels), Cookie-UI-Texte, Statusseiten-Texte.
- Mehrere strukturierende Headlines/CTA-Fallbacks per `t(...)`.
- Jahresrechnung-FAQ-Fragen/-Antworten (per `annual_faq_*` Keys).

### Direkte/lokale Fallback-Texte oder Arrays in Komponenten

- Mehrere Komponenten enthalten lokale Hardcoded-Fallbacks (Arrays/Strings), die an `getArray`/`getText` übergeben werden.
- Besonders deutlich in `Jahresrechnung.tsx` (Process/Why/Comparison/Reviews-Fallback-Arrays) und in Home-Komponenten wie `Problem`, `HowItWorks`, `Comparison`, `Testimonials`, `FAQ`, `Stats`, `About`, `Solution`.

### Supabase-Vorbereitung

- Die Architektur ist bereits auf Supabase-Content-Konfiguration vorbereitet (`webseite_content_config` wird bereits gelesen, wenn vorhanden).
- Die produktive/echte Spalte `webseite_content_config` soll später per Migration sichergestellt werden, wird aber in Phase 1 **nicht** angelegt.

## 3) Komponenten-Matrix

| Datei / Komponente | sichtbare Textbereiche | aktuelle Quelle | aktueller Key oder Pfad | aktuelles Fallback-Verhalten | Risiko | Zielzustand |
|---|---|---|---|---|---|---|
| `src/components/Header.tsx` | Sprachwechsel-SR, CTA-Buttons, Logo-Alt | `i18n` + `websiteConfig.content` + `design` | `t(...)`, `brand.name`, `header.*` | `getText(..., fallback)` + `t(...)` | Mischquellen können divergieren | Resolver-only, klare Prioritätskette |
| `src/components/Footer.tsx` | Kontakt/Legal-Navigation, Marken-/Agenturinfos | `i18n` + `websiteConfig.content` | `footer_*`, `brand.*`, `sections.links.*` | `t(...)` und `getText(..., fallback)` | Lokale Fallbacks/Key-Streuung | Resolver mit stabilem Schema |
| `src/components/Hero.tsx` | Badge, Headline, Subline, CTA, Result-Note | **Primär `customerDefaults.sections.hero.*` via `websiteConfig`**, teils `i18n` Fallback | `sections.hero.badge/headline/subline/cta_text/result_note` | `lang`-Pfad -> neutraler Pfad -> Inline-Fallback | Falsche Annahme „nur i18n“ wäre fachlich falsch | Resolver mit expliziter Hero-Map |
| `src/components/Problem.tsx` | Section-Headline, Problem-Items | `websiteConfig.content` + `i18n` fallback | `sections.problem.*`, `t(home_problem_h2)` | `getArray/getText` mit lokalen Defaults | Array-Sync über Sprachen | ID-basierte Items im Resolver |
| `src/components/Solution.tsx` | Headline, Body, CTA, Note | `websiteConfig.content` + `i18n` fallback | `sections.solution.*` | Inline-Fallbackstrings | Copy-Drift durch redundante Fallbacks | Zentralisierte Defaults |
| `src/components/HowItWorks.tsx` | Headline, Steps, CTA | `websiteConfig.content` + `i18n` fallback | `sections.how_it_works.*` | Lokale Item-Fallbacks | Reihenfolge/Übersetzungs-Sync | Stable IDs für Steps |
| `src/components/Comparison.tsx` | Headline, Spaltentitel, Listen, CTA | `websiteConfig.content` + `i18n` fallback | `sections.comparison.*` | Lokale String-Arrays als Fallback | Indexbasierte Listen-Differenzen | ID-basierte Listeneinträge |
| `src/components/Testimonials.tsx` | Kicker, Headline, Reviews, CTA | `websiteConfig.content` + `i18n` fallback | `sections.testimonials.*`, `t(cta_check_savings)` | Lokales Review-Fallbackarray | Uneinheitliche Review-Sets je Sprache | ID-stabile Reviews |
| `src/components/About.tsx` | Person, Rolle, Social-Hint, Paragraphen | `websiteConfig.content` + `i18n` headline | `sections.about.*`, `t(home_about_h2)` | Viele Inline-Textfallbacks | Lange Copy kann unbemerkt abweichen | Vollständig resolver-basiert |
| `src/components/Stats.tsx` | Headline, KPI-Items | `websiteConfig.content` | `sections.stats.headline`, `sections.stats.items` | lokales KPI-Array als Fallback | Zahlen/Labels können driften | ID-basierte KPI-Struktur |
| `src/components/FAQ.tsx` | FAQ-Headline, FAQ-Liste, Final-CTA | `i18n` + `websiteConfig.content` | `t(home_faq_h2)`, `sections.faq.home_items`, `sections.final_cta.*` | lokales FAQ-Fallbackarray | FAQ-Reihenfolge/Sync-Risiko | FAQ-Items mit stabiler ID |
| `src/pages/Index.tsx` | Seitenkomposition Home | Kompositionsdatei (indirekt alle oben) | n/a | keine eigenen Textfallbacks | Änderungen an Sections wirken global | Unverändert, nur Resolver-Nutzung in Children |
| `src/pages/Jahresrechnung.tsx` | Vollständige Annual-Copy inkl. FAQ | `i18n` + `websiteConfig.content` + lokale Arrays | `sections.jahresrechnung.*`, `annual_*`, `annual_faq_*` | viele lokale Fallbackarrays/-strings + optional `pages.jahresrechnung.html` override | Höchstes Drift-/Sync-Risiko | Resolver + schemaisierte Annual-Struktur |

## 4) Ziel-Datenstruktur (`public.kunden_config.webseite_content_config`)

Empfehlte Form (vereinfacht):

```json
{
  "schemaVersion": 1,
  "defaultLanguage": "de",
  "availableLanguages": ["de", "en", "tr", "ru", "ar", "it", "zh", "hi", "es", "fr", "nl", "pl"],
  "sections": {
    "hero": {
      "badge": { "de": "...", "en": "..." },
      "headline": { "de": "...", "en": "..." },
      "subline": { "de": "...", "en": "..." },
      "ctaText": { "de": "...", "en": "..." },
      "resultNote": { "de": "...", "en": "..." }
    },
    "problem": {
      "items": [
        {
          "id": "market_complexity",
          "iconKey": "search",
          "title": { "de": "...", "en": "..." },
          "description": { "de": "...", "en": "..." }
        }
      ]
    }
  }
}
```

### Arrays: bevorzugtes Modell

**Bevorzugt:**

```json
"items": [
  {
    "id": "stable_id",
    "title": { "de": "...", "en": "..." },
    "description": { "de": "...", "en": "..." }
  }
]
```

**Nicht bevorzugt:**

```json
"items": {
  "de": [ ... ],
  "en": [ ... ]
}
```

**Begründung:** stabile Reihenfolge, stabile Icons, bessere Admin-UI-Fähigkeit, geringeres Entkopplungsrisiko zwischen Sprachen, Merge nach `id` statt Array-Index.

## 5) Resolver-Konzept

Gewünschte Fallback-Reihenfolge:
1. Supabase Override in aktueller Sprache
2. Supabase Override auf Deutsch
3. Repo-Fallback in aktueller Sprache
4. Repo-Fallback auf Deutsch
5. technischer Fallback

Gewünschte API:
- `getLocalizedText(path, lang, fallback?)`
- `getLocalizedArray(path, lang, fallback?)`
- `getLocalizedObject(path, lang, fallback?)`

Technik:
- Deep Merge für Objekte.
- Array Merge über stabile `id`.
- Keine indexbasierten Array-Merges.
- Optionales Logging für fehlende Keys (z. B. Dev-Warnungen/Telemetry).

## 6) Supabase-Migrationsplan (nur dokumentiert)

Geplante spätere Migration (nicht in diesem PR):

```sql
alter table public.kunden_config
add column if not exists webseite_content_config jsonb not null default '{}'::jsonb;
```

Optional später:
- `webseite_content_version`
- `webseite_content_updated_at`
- `webseite_content_source`

**Wichtig:** In diesem PR keine Migration ausführen, keine SQL-Datei anlegen.

## 7) Refactor-Plan in Phasen

1. **Phase 1:** Audit + Architektur-Dokumentation.
2. **Phase 2:** Repo-Defaults zentralisieren, ohne sichtbare Copy zu ändern.
3. **Phase 3:** Zentralen Resolver einführen, ohne sichtbare Copy zu ändern.
4. **Phase 4:** Komponenten schrittweise auf Resolver umstellen.
5. **Phase 5:** Supabase-Spalte per Migration hinzufügen.
6. **Phase 6:** Ehiogie/Kromen Content Overrides in Supabase pflegen.
7. **Phase 7:** Template/Main vorbereiten, sodass neue Kunden saubere Repo-Fallback-Copy nutzen und kundenspezifische Texte aus Supabase kommen.

## 8) Risiken

- Copy könnte versehentlich geändert werden.
- Übersetzungen könnten versehentlich geändert werden.
- Arrays könnten zwischen Sprachen unsynchron werden.
- Supabase-Ausfall darf Website nicht brechen.
- Kundenwerte dürfen später nicht hart im Template landen.
- Browser-Auto-Translate darf nicht mit echter i18n verwechselt werden.
- Keine Service-Role-Secrets im Frontend.
- Supabase-Content darf nur öffentliche Website-Copy enthalten, keine Secrets.

## 9) Testplan

- Vorher/Nachher-Screenshot-Vergleich.
- Home-Seite auf Deutsch prüfen.
- Home-Seite mit `?lang=en` prüfen.
- Sprach-Toggle prüfen.
- Header/Footer prüfen.
- Hero prüfen.
- Problem/Solution/HowItWorks/Comparison/FAQ prüfen.
- Jahresrechnung-Seite prüfen.
- Callback-Seite prüfen (falls vorhanden).
- Später explizit Supabase-unavailable-Fallback testen.
- Build ausführen.

### Validierung

- `git diff -- docs/website-content-architecture.md`
- `git status --short`
- `npm run build`

### Akzeptanzkriterien

- Neuer PR gegen `Ehiogie-Energieassistent-tn90CyE3XuYFTy4c1M3F`.
- PR nicht gegen `Template`.
- Nur `docs/website-content-architecture.md` geändert.
- Keine Source-/Komponenten-/Copy-/Übersetzungsänderung.
- Keine Supabase-Datei geändert.
- Keine Migration angelegt/ausgeführt.
- Dokument bildet Ist-Zustand des Ehiogie-Branches korrekt ab.
- `customerDefaults.ts` und `websiteConfig.tsx` sind korrekt als vorhanden berücksichtigt.
- Build erfolgreich oder sauber begründet.
