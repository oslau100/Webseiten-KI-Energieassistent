# Website Content Architecture Audit (Phase 1)

## Scope and constraints (Phase 1)

- This document is an **audit + target architecture spec only**.
- No UI, component, copy, translation, Supabase data, migration, loader, or engine changes are part of Phase 1.
- The current German copy in the `Ehiogie-Energieassistent-tn90CyE3XuYFTy4c1M3F` branch remains the source of truth.
- Existing translations remain unchanged in this phase.

---

## 1) Zielbild (Target Architecture)

1. **Supabase as customer-specific source of truth**
2. **Repository as complete fallback in 12 languages**
3. **German as master copy**
4. **Localized fields per text key**
5. **Components consume one central resolver**

---

## 2) Ist-Zustand (Current State)

### 2.1 Current text sources

1. **`src/lib/i18n.tsx`**: dictionaries + headline dictionaries + `t(key)` API.
2. **Direct hardcoded strings in components/pages**: especially in `Jahresrechnung.tsx`, plus sections in `Solution.tsx`, `FAQ.tsx`, `Testimonials.tsx`.
3. **Branch baseline files for customer defaults/config**:
   - `src/lib/customerDefaults.ts` provides customer-level defaults as part of the Ehiogie baseline.
   - `src/lib/websiteConfig.tsx` provides website config wiring for branch-specific runtime configuration.

### 2.2 `i18n.tsx` supplied texts

- Header labels, hero labels, footer labels, cookie/callback labels.
- Home headline keys (`home_*_h2`) and annual headline keys (`annual_*`).
- CTA key (`cta_check_savings`) and annual FAQ keys (`annual_faq_*`).

### 2.3 `customerDefaults.ts` supplied texts

- Customer defaults are provided in the Ehiogie branch baseline and should be treated as existing fallback/config inputs in the architecture model.

### 2.4 Direct component/page fallback texts

- `Solution.tsx`: body paragraph + helper note hardcoded.
- `FAQ.tsx`: final CTA paragraph hardcoded.
- `Testimonials.tsx`: section intro label hardcoded.
- `Jahresrechnung.tsx`: large inline arrays/paragraphs/buttons hardcoded.

### 2.5 Supabase columns currently expected

- Long-term target: `public.kunden_config.webseite_content_config` for customer overrides.
- Gap today: this column is planned/not reliably available in current implementation state.

### 2.6 Note on `websiteConfig.tsx`

- `websiteConfig.tsx` is part of the Ehiogie branch baseline and should be used as the canonical integration point for `webseite_content_config`.
- This architecture therefore assumes existing config wiring and focuses only on the content model + resolver contract.

---

## 3) Komponenten-Matrix

| Komponente / Datei | Sichtbare Textbereiche | Aktuelle Quelle | Aktueller Key/Pfad | Aktuelles Fallback-Verhalten | Risiko | Zielzustand |
|---|---|---|---|---|---|---|
| `src/components/Header.tsx` | Header CTA | i18n | `header_check_bill`, `header_check_savings` | i18n fallback | Medium | Resolver path `shared.header.*` |
| `src/components/Footer.tsx` | Footer labels/links/rights + brand line | i18n + literal | `footer_*` + literal brand | Mixed | Medium | Resolver-backed footer block |
| `src/components/Hero.tsx` | Badge, H1, subline, CTA, note | i18n | `hero_*`, `cta_check_savings` | i18n fallback | Low-Medium | `home.hero.*` |
| `src/components/Problem.tsx` | H2 + cards | i18n + local array | `home_problem_h2` + local cards | Mixed | High | stable `items[]` + localized fields |
| `src/components/Solution.tsx` | H2, body, CTA, note | i18n + literals | `home_solution_h2`, `cta_check_savings` + literals | Mixed | High | `home.solution.*` |
| `src/components/HowItWorks.tsx` | H2 + steps + CTA | i18n + local steps | `home_how_it_works_h2`, `cta_check_savings` + steps | Mixed | High | `home.howItWorks.items[]` |
| `src/components/Comparison.tsx` | H2 + lists + CTA | i18n + locals | `home_comparison_h2`, `cta_check_savings` + local lists | Mixed | High | stable comparison blocks |
| `src/components/Testimonials.tsx` | Intro, H2, reviews, CTA | i18n + local reviews | `home_testimonials_h2`, `cta_check_savings` + reviews | Mixed | High | `home.testimonials.items[]` by id |
| `src/components/About.tsx` | H2 + text block | i18n + literals | `home_about_h2` + literals | Mixed | Medium | `home.about.*` |
| `src/components/Stats.tsx` | stats labels | local | component-local | literal | Medium | `home.stats.items[]` |
| `src/components/FAQ.tsx` | H2, FAQ, final CTA | i18n + local + literals | `home_faq_h2`, `home_final_cta_h2`, `cta_check_savings` + local/literal | Mixed | High | `home.faq.items[]` by id |
| `src/pages/Index.tsx` | layout composition | composition | N/A | inherited | Low | keep composition only |
| `src/pages/Jahresrechnung.tsx` | full page sections | i18n + many literals | `annual_*` + many inline arrays/literals | Mixed/hardcoded heavy | Very High | full `annual.*` content map |

---

## 4) Ziel-Datenstruktur (`webseite_content_config`)

Preferred model: stable items + localized fields.

```json
{
  "schemaVersion": 1,
  "home": {
    "problem": {
      "items": [
        {
          "id": "market_complexity",
          "iconKey": "search",
          "title": { "de": "...", "en": "..." },
          "description": { "de": "...", "en": "..." }
        }
      ]
    },
    "howItWorks": {
      "items": [
        {
          "id": "upload_bill",
          "step": 1,
          "title": { "de": "...", "en": "..." },
          "description": { "de": "...", "en": "..." }
        }
      ]
    },
    "testimonials": {
      "items": [
        {
          "id": "lisa_k",
          "name": "Lisa K.",
          "title": { "de": "...", "en": "..." },
          "text": { "de": "...", "en": "..." }
        }
      ]
    },
    "faq": {
      "items": [
        {
          "id": "is_free",
          "question": { "de": "...", "en": "..." },
          "answer": { "de": "...", "en": "..." }
        }
      ]
    }
  }
}
```

Not preferred: `items.de = [...]`, `items.en = [...]`.

---

## 5) Resolver-Konzept

Fallback order per field:
1. Supabase override in current language.
2. Supabase override in German.
3. Repo fallback in current language.
4. Repo fallback in German.
5. Technical fallback.

Design notes:
- One centralized resolver API.
- Array merge by stable `id` (never by index).
- Missing-key telemetry.

---

## 6) Supabase-Migrationsplan (document only)

```sql
alter table public.kunden_config
add column if not exists webseite_content_config jsonb not null default '{}'::jsonb;
```

Optional later:
- `webseite_content_version`
- `webseite_content_updated_at`
- `webseite_content_source`

---

## 7) Refactor-Plan in Phasen

1. Phase 1: Dokumentation/Audit.
2. Phase 2: Defaults zentralisieren.
3. Phase 3: Resolver einführen.
4. Phase 4: Komponenten umstellen.
5. Phase 5: Supabase-Spalte/Migration.
6. Phase 6: Ehiogie/Kromen Overrides.
7. Phase 7: Template/Main aufräumen.

---

## 8) Risiken

- Copy versehentlich ändern.
- Übersetzungen versehentlich ändern.
- Arrays unsynchron.
- Supabase-Ausfall ohne Repo-Fallback.
- Kundenwerte hartcodiert im Template.

---

## 9) Testplan

- Vor/nach Screenshot-Vergleich.
- Sprach-Toggle testen.
- Header/Footer testen.
- Home-Seite testen.
- Jahresrechnung-Seite testen.
- Statusseiten testen.
- Supabase-unavailable fallback testen (soweit lokal möglich).

---

## Validation commands

- `git diff -- docs/website-content-architecture.md`
- `git status --short`
- Optional: `npm run build`
