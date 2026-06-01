# Ehiogie Live-Content-Migrations-Audit: Repo-Fallbacks → Supabase

## Ziel, Geltungsbereich und harte Nicht-Ziele

Dieser Audit beschreibt, wie der aktuell sichtbare Ehiogie-Website-Content sicher aus Repo-Fallbacks, i18n-Dictionaries und hardcoded Komponenten in Supabase-kompatible JSON-Strukturen gespiegelt werden kann. Das Ziel ist ein **1:1-Snapshot des heutigen sichtbaren Stands** für `location_id = tn90CyE3XuYFTy4c1M3F`, nicht Copy-Optimierung.

**Geltungsbereich:**

- Ehiogie Website und eingebundene Ehiogie Loader unter `public/loaders/*.html`.
- Website-Konfiguration über `webseite_content_config`, `webseite_design_config`, `webseite_layout_config` aus `kunden_config`.
- Sichtbare Texte aus:
  - Repo-Fallbacks in `src/lib/websiteContentDefaults.ts`, `src/lib/customerDefaults.ts` und komponentennahen Fallbacks.
  - i18n-Dictionaries in `src/lib/i18n.tsx`.
  - hardcoded React-Komponenten und Seiten.
  - hardcoded Loader-HTML/-JavaScript in `public/loaders/*.html`.

**Nicht-Ziele / strikt ausgeschlossen:**

- Keine Runtime-Codeänderung.
- Keine UI-Änderung.
- Keine Textänderung, Umformulierung oder Übersetzungsverbesserung.
- Keine Supabase-Schreiboperation.
- Keine Migration.
- Kein SQL.
- Kein Deploy.
- Keine Änderung an Kromen, Template-, Haupt- oder E-Mail-Repos.

## Produktionsrisiko

Ehiogie ist produktiv. Ein späterer Supabase-Import darf die live sichtbaren Inhalte nicht verändern. Besonders riskant sind:

1. **Copy-Drift:** Repo-Fallbacks, i18n-Keys und Komponenten-Fallbacks enthalten teilweise unterschiedliche Formulierungen oder Kennzahlen, z. B. `1.500+` vs. `2.000+`. Für den Snapshot zählt ausschließlich der aktuell sichtbare Resolver-Output pro Seite, Sprache und Route.
2. **Fallback-Priorität:** `webseite_content_config` wird über die Repo-Defaults gemerged; leere oder unvollständige Supabase-Werte können unbeabsichtigte Mischstände erzeugen.
3. **Rechtliche Texte:** Legal-, Datenschutz-, Cookie-/Consent- und Survey-Consent-Texte dürfen nicht automatisch migriert oder verändert werden.
4. **Testimonials/Reviews:** Nutzerzitate und Review-Namen sind fachlich/rechtlich sensibel und müssen vor Migration manuell freigegeben werden.
5. **Loader-Inhalte:** `public/loaders/*.html` enthält produktionsnahe Survey-/Angebots-Texte, Bootstrap-URLs und Consent-/Fehlertexte. Diese Dateien dürfen in diesem Audit nur erfasst, nicht geändert werden.

## Aktuelle Content-Quellen

### 1. Repo-Fallbacks aus Website-Konfiguration

Die Website lädt `kunden_config` über Supabase, liest `webseite_design_config`, `webseite_content_config` und `webseite_layout_config` und merged diese über die Repo-Fallbacks. Ohne valide Supabase-Runtime-Werte bleibt die Quelle `fallback`.

**Direkt aus Repo-Defaults überschreibbar:**

- `brand.*`
  - `brand.name`
  - `brand.contact_email`
  - `brand.agency_url`
  - `brand.agency_alt`
- `legal.variables.*`
  - Firma, Inhaber, Adresse, E-Mail, Telefon, Stand.
- `sections.hero.*`
  - Bild-Alt-Text, Badge, Headline, Subline, CTA, Result-Note.
- `sections.problem.*`
  - Headline und Problem-Karten.
- `sections.how_it_works.*`
  - Headline, Steps, CTA.
- `sections.solution.*`
  - Headline, Body, CTA, Result-Note, optionale Bildfelder.
- `sections.comparison.*`
  - Headline, Spalten-Titel, Portal-/Assistent-Listen, CTA.
- `sections.final_cta.*`
  - Headline, Subline, CTA.
- `sections.callback.*`
  - Rückruf-Titel, Beschreibung, Kalender-URL, Disabled-Text.
- `sections.links.*`
  - Website-, Datenschutz-, Impressum-, Tarif-, Jahresrechnung- und Status-URLs.
- `sections.testimonials.*`
  - Kicker, Headline, Home-Reviews.
- `sections.jahresrechnung.*`
  - teilweise in Repo-Defaults vorhanden und teilweise komponentennah fallback-basiert.
- `sections.stats.*`
  - Headline und KPI-Items.
- `sections.faq.home_items`
  - Fragen und Antworten der Startseiten-FAQ.
- `pages.*.html`
  - optionale HTML-Overrides für einzelne Seiten wie Datenschutz, Impressum und Jahresrechnung.
- `cookie.*`
  - Cookie-Bar-Texte, soweit als `getText(...)` angebunden.

**Audit-Einstufung:**

| Bereich | Status | Begründung |
| --- | --- | --- |
| Brand-Basisdaten ohne rechtliche Wirkung | sofort 1:1 migrierbar | JSON-Pfade existieren, sichtbare Header-/Footer-Texte können unverändert gespiegelt werden. |
| Home-Sections Hero, Problem, How it works, Solution, Comparison, Stats, FAQ | sofort 1:1 migrierbar | Sichtbare Marketing-/Info-Abschnitte sind bereits über `webseite_content_config` adressierbar; Snapshot muss Resolver-Output enthalten. |
| Links/CTA-Ziele | sofort 1:1 migrierbar, aber nicht ändern | URLs dürfen nur als identischer Snapshot übernommen werden; keine Normalisierung. |
| Callback-Texte | sofort 1:1 migrierbar | JSON-Pfade existieren; Kalender-URL leer lassen, falls aktuell leer. |
| Testimonials/Reviews | nur nach manueller Prüfung migrierbar | Zitate, Namen und Zahlen rechtlich/fachlich bestätigen lassen. |
| Legal-Variablen | nur nach manueller Prüfung migrierbar | Rechtliche Stammdaten und `stand` nicht automatisch überschreiben. |
| Vollständige Legal-HTML-Overrides | vorerst Repo-Fallback lassen | Datenschutz/Impressum enthalten rechtliche Langtexte; keine automatische Migration. |
| Cookie-/Consent-Texte | vorerst Repo-Fallback lassen | Rechtlich sensibel; erst Datenschutz-/Consent-Freigabe. |

### 2. Sichtbare Texte aus i18n

`src/lib/i18n.tsx` liefert die Sprachumschaltung, Basis-Dictionaries, Statusseiten-Dictionaries, Headline-Dictionaries und Jahresrechnungs-FAQ-Dictionaries. Supabase kann i18n über `content.i18n` überschreiben; der Resolver fällt pro Key auf Sprache, Deutsch und Repo-Dictionary zurück.

**i18n-Bereiche:**

- Header-CTA:
  - `header_check_bill`
  - `header_check_savings`
- Globale CTA:
  - `cta_check_savings`
- Hero-Fallbacks:
  - `hero_badge`
  - `hero_headline`
  - `hero_subline_prefix`
  - `hero_subline_emphasis`
  - `hero_subline_suffix`
  - `hero_result_note`
- Footer:
  - `footer_contact`
  - `footer_callback`
  - `footer_legal`
  - `footer_privacy`
  - `footer_imprint`
  - `footer_rights`
- Cookie-Fallback-Dictionary:
  - `cookie_title`, `cookie_copy_*`, `cookie_marketing`, `cookie_essential`, `cookie_save`, `cookie_accept_all`
- Home-Headlines:
  - `home_problem_h2`
  - `home_solution_h2`
  - `home_how_it_works_h2`
  - `home_comparison_h2`
  - `home_testimonials_h2`
  - `home_about_h2`
  - `home_faq_h2`
  - `home_final_cta_h2`
- Jahresrechnung-Headlines:
  - `annual_hero_h1`
  - `annual_process_h2`
  - `annual_why_h2`
  - `annual_blue_value_h2`
  - `annual_comparison_h2`
  - `annual_testimonials_h2`
  - `annual_faq_h2`
  - `annual_final_cta_h2`
- Jahresrechnung-FAQ:
  - `annual_faq_1_q` bis `annual_faq_6_a`
- Statusseiten:
  - `status_success_*`
  - `status_error_*`
  - `status_invoice_error_*`

**Audit-Einstufung:**

| Bereich | Status | Begründung |
| --- | --- | --- |
| Header-/Footer-/CTA-i18n | sofort 1:1 migrierbar | Sichtbare UI-Texte; Supabase-Struktur über `i18n.{key}.{lang}` möglich. |
| Home- und Jahresrechnung-Headlines | sofort 1:1 migrierbar | Müssen pro Sprache exakt aus aktuellem `t(key)`-Output exportiert werden. |
| i18n-Statusseiten-Texte | sofort 1:1 migrierbar | Für `/auftrag-eingegangen`, `/fehler`, `/rechnung-fehler`; keine inhaltliche Änderung. `/rechnung-eingegangen` ist separat hardcoded zu erfassen. |
| Jahresrechnung-FAQ-i18n | nur nach manueller Prüfung migrierbar | Energie-/Rechnungsinformationen und Übersetzungen müssen fachlich unverändert bestätigt werden. |
| Cookie-i18n | vorerst Repo-Fallback lassen | Consent-relevant; nicht automatisch migrieren. |

### 3. Hardcoded Texte in React-Komponenten und Seiten

Ein Teil der sichtbaren Inhalte ist als Fallback direkt in Komponenten oder Seiten kodiert. Diese Werte können bereits über `getText`/`getArray` überschreibbar sein oder sind noch nicht sauber in Supabase-Strukturen abgebildet.

#### Home-Komponenten

| Datei/Bereich | Beispiele sichtbarer hardcoded Fallbacks | Überschreibbar? | Einstufung |
| --- | --- | --- | --- |
| `About.tsx` | Social-Hinweis, Person `Team`, Rolle, sechs About-Absätze, Social-URLs | Ja, über `sections.about.*` | sofort 1:1 migrierbar, falls aktueller Output extrahiert wird |
| `Problem.tsx` | vier Problem-Karten mit Titel/Beschreibung/Icon-Key | Ja, über `sections.problem.items` | sofort 1:1 migrierbar |
| `HowItWorks.tsx` | Schritt-Liste | Ja, über `sections.how_it_works.steps` | sofort 1:1 migrierbar |
| `Solution.tsx` | Body, Result-Note, Bild-Alt | Ja, über `sections.solution.*` | sofort 1:1 migrierbar |
| `Comparison.tsx` | Portal-/Assistent-Listen und Spalten-Titel | Ja, über `sections.comparison.*` | sofort 1:1 migrierbar |
| `Testimonials.tsx` | Review-Zitate, Namen und CTA-i18n | Reviews ja über `sections.testimonials.home_reviews` | nur nach manueller Prüfung migrierbar |
| `Stats.tsx` | KPI-Zahlen, Suffixe und Labels | Ja, über `sections.stats.items` | sofort 1:1 migrierbar, Zahlen exakt beibehalten |
| `FAQ.tsx` | Home-FAQ und Final-CTA | FAQ ja über `sections.faq.home_items`, CTA über `sections.final_cta.*` | FAQ sofort 1:1 migrierbar; rechtliche Datenschutz-Antwort prüfen |

#### Seiten

| Seite | Content-Quelle | Einstufung |
| --- | --- | --- |
| `/` | Komponenten-Mix aus `webseite_content_config`, i18n und komponentennahen Fallbacks | sofort 1:1 migrierbar, außer Testimonials/Cookie/Legal |
| `/jahresrechnung` | komponentennahe Fallback-Arrays, i18n-Headlines, optionale `pages.jahresrechnung.html` | teilweise sofort migrierbar; FAQ und Reviews manuell prüfen |
| `/rueckruf-anfordern` | `sections.callback.*` | sofort 1:1 migrierbar |
| `/auftrag-eingegangen` | i18n `status_success_*` | sofort 1:1 migrierbar |
| `/rechnung-eingegangen` | hardcoded Erfolgsseite für Rechnungseingang plus SimpleHeader/SimpleFooter | sofort 1:1 migrierbar, aber zunächst als eigener hardcoded Seitenblock erfassen |
| `/fehler` | i18n `status_error_*` | sofort 1:1 migrierbar |
| `/rechnung-fehler` | i18n `status_invoice_error_*` | sofort 1:1 migrierbar |
| `/datenschutz` | rechtlicher JSX-Fallback plus optionale `pages.datenschutz.html` | vorerst Repo-Fallback lassen |
| `/impressum` | rechtlicher JSX-Fallback plus optionale `pages.impressum.html` | vorerst Repo-Fallback lassen |
| `*` / 404 | hardcoded `404`, `Oops! Seite nicht gefunden.`, `Zurück zur Startseite` | später optimieren; für Migration nicht priorisieren |

### 4. Hardcoded Texte in `public/loaders/*.html`

Die Loader sind produktionsrelevant und werden nur auditiert. Sie dürfen in dieser Migration nicht verändert werden.

| Loader | Sichtbare Textgruppen | Supabase-Bezug | Einstufung |
| --- | --- | --- | --- |
| `public/loaders/start.html` | Loading-/Fehlertexte, Survey-Engine-Ausgabe über externe Engine, Bootstrap-/Runtime-basierte Konfiguration | liest `kunden_config`, `runtime_config`, `url_config`, Design-Konfig | vorerst Repo-/Engine-Fallback lassen; separat auditieren |
| `public/loaders/rechnung.html` | Rechnung-Survey Loading-/Fehlertexte, Datenschutz-Link, Survey-Consent wahrscheinlich Engine-basiert | liest `kunden_config`, `runtime_config`, `url_config`, Design-Konfig | vorerst Repo-/Engine-Fallback lassen; Survey Consent manuell prüfen |
| `public/loaders/tarif.html` | Angebotsseite: `Tarifempfehlung`, `KI-Analyse abgeschlossen`, Tarifdetails, CTA, Kostenlabels, KI-Zusammenfassung, Fehlertexte, de/en I18N | Daten aus Query/Supabase und lokales I18N-Objekt | nur nach separatem Angebots-/Legal-Review migrierbar; in diesem Schritt nicht anfassen |
| `public/loaders/auftrag.html` | Closing-Survey Loading-/Fehlertexte und externe Survey-Engine-Ausgabe | liest `kunden_config`, Engine-Konfiguration | vorerst Repo-/Engine-Fallback lassen; Survey Consent manuell prüfen |

## Bereits überschreibbare Werte nach Config-Bucket

### `webseite_content_config`

Empfohlene Snapshot-Bereiche:

```json
{
  "brand": {},
  "header": {},
  "cookie": {},
  "legal": { "variables": {} },
  "i18n": {},
  "sections": {
    "hero": {},
    "problem": {},
    "how_it_works": {},
    "solution": {},
    "comparison": {},
    "testimonials": {},
    "about": {},
    "stats": {},
    "faq": {},
    "final_cta": {},
    "callback": {},
    "links": {},
    "jahresrechnung": {}
  },
  "pages": {
    "jahresrechnung": {},
    "datenschutz": {},
    "impressum": {}
  }
}
```

**Wichtig:** Diese Struktur ist ein Export-/Dry-Run-Ziel, keine Schreibanweisung. Legal-, Datenschutz- und Consent-Bereiche bleiben im ersten Snapshot leer oder als `manual_review_required` markiert, nicht automatisch produktiv aktivieren.

### `webseite_design_config`

Aktuell überschreibbar sind insbesondere:

- `colors.primary`
- `colors.text`
- `colors.mutedText`
- `colors.background`
- `radius.section`
- `assets.logo_header`
- `assets.logo_footer`
- `assets.hero_image`
- `assets.agency_logo`

**Audit-Einstufung:** Design-Werte sind kein Text-Content. Für diese Migration nur als identischer Snapshot dokumentieren, nicht ändern. Jede Asset-URL-Änderung kann sichtbare UI ändern und gehört nicht in die Content-Migration.

### `webseite_layout_config`

Aktuell überschreibbar sind Section-Reihenfolgen:

- `pages.home.sections`
- `pages.annual.sections`

**Audit-Einstufung:** Nicht migrieren, wenn Ziel nur Content ist. Layout-Reihenfolge unverändert lassen; jeder Unterschied wäre eine Layoutänderung und verletzt die Akzeptanzprüfung.

## Erforderliche Supabase-JSON-Struktur für einen 1:1-Snapshot

### Empfohlene Export-Struktur mit Migrationsstatus

Der Dry-Run-Export sollte nicht direkt die spätere produktive JSON sein, sondern Metadaten enthalten, damit sensible Bereiche getrennt freigegeben werden können:

```json
{
  "location_id": "tn90CyE3XuYFTy4c1M3F",
  "source": "repo_fallback_dom_snapshot",
  "export_type": "dry_run_only",
  "generated_from": {
    "routes": ["/", "/jahresrechnung", "/rueckruf-anfordern", "/auftrag-eingegangen", "/rechnung-eingegangen", "/fehler", "/rechnung-fehler", "/datenschutz", "/impressum"],
    "languages": ["de", "en", "tr", "ru", "ar", "it", "zh", "hi", "es", "fr", "nl", "pl"],
    "config_buckets": ["webseite_content_config", "webseite_design_config", "webseite_layout_config"]
  },
  "migration_classes": {
    "immediate_1_to_1": {},
    "manual_review_required": {},
    "keep_repo_fallback_for_now": {},
    "optimize_later": {}
  }
}
```

### Produktiv nutzbare Zielstruktur nach Freigabe

Nach manueller Freigabe darf nur der freigegebene Teil als `webseite_content_config` vorbereitet werden:

```json
{
  "brand": {
    "name": "<exakter aktueller sichtbarer Wert>",
    "contact_email": "<exakter aktueller Wert>",
    "agency_url": "<exakte aktuelle URL>",
    "agency_alt": "<exakter aktueller Alt-Text>"
  },
  "header": {
    "language_switch_sr": "<exakter aktueller Wert>"
  },
  "i18n": {
    "cta_check_savings": { "de": "<exakt>", "en": "<exakt>" },
    "header_check_bill": { "de": "<exakt>", "en": "<exakt>" },
    "status_success_title": { "de": "<exakt>", "en": "<exakt>" }
  },
  "sections": {
    "hero": {
      "image_alt": "<exakt>",
      "badge": { "de": "<exakt>" },
      "headline": { "de": "<exakt>" },
      "subline": { "de": "<exakt>" },
      "cta_text": "<exakt>",
      "result_note": "<exakt>"
    },
    "problem": {
      "headline": { "de": "<exakt>" },
      "items": [
        { "title": "<exakt>", "description": "<exakt>", "iconKey": "search" }
      ]
    },
    "how_it_works": {
      "headline": { "de": "<exakt>" },
      "steps": [
        { "step": "1", "title": "<exakt>", "description": "<exakt>" }
      ],
      "cta_text": "<exakt>"
    },
    "solution": {},
    "comparison": {},
    "about": {},
    "stats": {},
    "faq": {},
    "final_cta": {},
    "callback": {},
    "links": {},
    "jahresrechnung": {}
  }
}
```

**Regel:** Keine Platzhalter in produktives JSON übernehmen. Platzhalter sind nur im Audit-Beispiel erlaubt.

## Nicht automatisch migrieren

### Vorerst Repo-Fallback lassen

- `pages.datenschutz.html` und alle Datenschutz-Langtexte.
- `pages.impressum.html` und alle Impressums-Langtexte.
- Cookie-/Consent-Texte aus `CookieBar.tsx` und `src/lib/i18n.tsx`.
- Survey Consent oder Datenschutztexte in `public/loaders/rechnung.html`, `public/loaders/start.html`, `public/loaders/auftrag.html` oder extern geladenen Survey-Engines.
- Angebots-/Tarif-Hinweise in `public/loaders/tarif.html`, sofern rechtlich oder vertrieblich relevant.
- Dynamischer Legal-Stand, insbesondere `legal.variables.stand`, solange nicht fachlich freigegeben.

### Nur nach manueller Prüfung migrieren

- Testimonials und Reviews auf Home und Jahresrechnungsseite.
- Review-Namen und Review-Titel.
- Claims mit Zahlen wie `1.500+`, `2.000+`, `10.000+`, `600.000+ €`, `bis zu 1.500 €`.
- FAQ-Antworten mit Datenschutz-, Kosten-, Provisions- oder Versorgungszusagen.
- Jahresrechnungs-FAQ in allen Sprachen.
- Alle fremdsprachigen Inhalte, wenn kein validierter Live-/DOM-Export je Sprache vorliegt.

### Später optimieren

- 404-Copy.
- uneinheitliche Kennzahlen oder Formulierungen.
- Übersetzungsqualität.
- CTA-Wording.
- SEO-/Meta-Texte, falls zukünftig eingeführt.
- Loader-Textarchitektur und Survey-Engine-Content.

## Sichere Migrationssequenz

### 1. Live-/Fallback-Content extrahieren

- Für jede relevante Route und Sprache den tatsächlich gerenderten DOM-Text extrahieren.
- Gleichzeitig Resolver-Output aus `getText`, `getArray` und `t(key)` protokollieren.
- Für jede Zeichenkette Quelle und Pfad erfassen:
  - `webseite_content_config`-Pfad.
  - `i18n`-Key.
  - komponentennaher Fallback.
  - hardcoded JSX.
  - Loader-HTML/-JS.
- Keine Supabase-Schreiboperation ausführen.

### 2. Supabase-JSON als 1:1-Snapshot vorbereiten

- Einen Dry-Run-JSON-Export erzeugen, der `immediate_1_to_1`, `manual_review_required`, `keep_repo_fallback_for_now` und `optimize_later` trennt.
- Nur exakt aktuelle sichtbare Werte übernehmen.
- Reihenfolge von Arrays beibehalten.
- Leerstrings, URLs, Interpunktion, Sonderzeichen, geschützte Leerzeichen, Gedankenstriche, Apostrophe und Währungszeichen exakt beibehalten.
- Keine Übersetzungen ergänzen, falls aktuell kein sichtbarer Wert existiert.

### 3. Dry-Run-Vergleich definieren

- App mit Repo-Fallbacks rendern und DOM-/Screenshot-Baseline speichern.
- App mit lokal injiziertem Dry-Run-JSON rendern, ohne Supabase zu beschreiben.
- DOM-Text-Vergleich je Route/Sprache durchführen.
- Screenshot-Vergleich für Desktop und Mobile durchführen.
- Link-/CTA-Href-Vergleich durchführen.

### 4. Erst nach manueller Freigabe SQL/Update vorbereiten

- Review-Liste für `manual_review_required` mit Business-/Legal-Freigabe erstellen.
- Nur freigegebene Bereiche in produktionsfähiges `webseite_content_config` übernehmen.
- Noch nicht freigegebene Bereiche aus produktivem JSON entfernen, nicht als leere Overrides setzen.
- SQL/Update erst in separater späterer Phase erstellen.

### 5. Nach Migration visuell vergleichen

- Nach Supabase-Update erneut Vorher/Nachher-Vergleich mit identischen Routen, Sprachen, Viewports und Query-Parametern durchführen.
- Bei jeder sichtbaren Text-, URL-, CTA-, Sprach- oder Layoutabweichung rollbacken bzw. Supabase-Overrides entfernen.

### 6. Content-Optimierung erst später

- Copy-Polish, Übersetzungsverbesserungen, Claim-Konsolidierung und UX-Optimierung sind eine eigene Phase nach stabiler 1:1-Migration.
- Diese Optimierungsphase braucht eigene Freigabe, eigenes Diffing und darf nicht mit der Migration vermischt werden.

## Akzeptanzprüfung nach Migration

Eine spätere Migration gilt nur als akzeptiert, wenn alle folgenden Prüfungen bestehen:

- **Keine sichtbaren Textänderungen** auf allen geprüften Routen und Sprachen.
- **Keine URL-/CTA-Änderungen**, einschließlich Query-Parameter und Sprachparameter.
- **Keine Sprachänderungen**, kein unerwarteter Fallback von Fremdsprache auf Deutsch oder Key-Name.
- **Keine Layoutänderungen**, insbesondere keine veränderte Section-Reihenfolge oder Asset-Änderung.
- **Keine Legal-/Consent-Änderungen** ohne gesonderte Freigabe.
- **Keine Loader-Änderungen** in `public/loaders/*.html` durch diese Migration.

Empfohlene Prüfrouten:

- `/`
- `/?lang=de`, `/?lang=en`, und alle weiteren aktiven Sprachen
- `/jahresrechnung?lang=de`
- `/rueckruf-anfordern?lang=de`
- `/auftrag-eingegangen?lang=de`
- `/rechnung-eingegangen?lang=de`
- `/fehler?lang=de`
- `/rechnung-fehler?lang=de`
- `/datenschutz`
- `/impressum`
- `/start`, `/rechnung`, `/tarif`, `/auftrag` nur als Loader-Audit ohne Textmigration

## Konkrete Migrationsklassifizierung

### Sofort 1:1 migrierbar

- `brand.name`, `brand.contact_email`, `brand.agency_url`, `brand.agency_alt`.
- Header-Sprachumschalter-Screenreader-Text.
- Header-/Footer-/CTA-i18n, sofern exakt aus aktuellem Live-Output exportiert.
- Home-Hero, Problem, How-it-works, Solution, Comparison, About, Stats, FAQ und Final-CTA ohne Testimonials/Legal/Consent.
- Callback-Seite.
- Statusseiten `/auftrag-eingegangen`, `/fehler`, `/rechnung-fehler` sowie die hardcoded Rechnungseingangsseite `/rechnung-eingegangen`.
- Nicht-rechtliche Links, sofern URLs exakt gleich bleiben.

### Nur nach manueller Prüfung migrierbar

- Testimonials und Jahresrechnungs-Reviews.
- Claims/Kennzahlen und Einsparversprechen.
- Jahresrechnungs-FAQ und fachliche Jahresrechnungs-Erklärtexte.
- Datenschutzbezogene FAQ-Antworten.
- Mehrsprachige Texte, wenn sie nicht DOM-basiert gegen den aktuellen Live-Stand validiert wurden.

### Vorerst Repo-Fallback lassen

- Datenschutz.
- Impressum.
- Cookie-Bar/Consent.
- Survey Consent in Loadern oder externen Engines.
- Rechtliche Hinweise auf Tarif-/Angebotsseiten.
- Loader-HTML und Loader-I18N.
- `webseite_design_config` und `webseite_layout_config`, sofern nur Content migriert werden soll.

### Später optimieren

- Uneinheitliche Zahlen und Claims.
- Übersetzungsqualität.
- CTA-Varianten.
- 404-Seite.
- Loader-Content-Architektur.
- SEO-/Meta-Content.

## Schlussfolgerung

Der sichere Weg ist ein reiner Dry-Run-/JSON-Export, der den aktuellen sichtbaren Stand 1:1 dokumentiert, aber keine produktive Supabase-Änderung ausführt. Erst nach DOM-/Screenshot-Abgleich und manueller Freigabe sensibler Bereiche darf in einer separaten Phase ein Supabase-Update vorbereitet werden. Bis dahin bleiben Legal, Datenschutz, Cookie/Consent, Survey Consent, Testimonials/Reviews und Loader-Texte unverändert im Repo-/Engine-Fallback.
