# Ehiogie Supabase Content Snapshot-/Migration-Plan

**Scope:** Ehiogie-Stand für `location_id = tn90CyE3XuYFTy4c1M3F` auf Branch `codex/ehiogie-supabase-content-snapshot-plan` gegen Base `Ehiogie-Energieassistent-tn90CyE3XuYFTy4c1M3F`.

**Ziel:** Dieser Plan hält ausschließlich fest, wie der aktuell sichtbare LIVE-/Fallback-Stand später 1:1 als Supabase-JSON eingefroren und übernommen werden kann. Der Plan ändert keine Runtime, keine UI, keine Texte, keine Übersetzungen, keine Consent-Logik, keine Supabase-Daten, keine Migrationen, kein SQL und keinen Deploy.

**Grundsatz:** Supabase soll später zuerst den sichtbaren Ist-Stand spiegeln, nicht verbessern. Jede Optimierung, Übersetzungskorrektur oder rechtliche Überarbeitung ist ausdrücklich eine spätere Phase nach erfolgreichem Snapshot-Vergleich.

## 1. Aktueller Live-Content-Ursprung

### 1.1 Globale Quellschichten

| Quellschicht | Aktueller Zweck | Snapshot-Bedeutung |
|---|---|---|
| `webseite_content_config` | Wird von der React-Website optional aus `kunden_config` gelesen und über Repo-Fallbacks gemerged. | Zielcontainer für sichtbare Website-Texte, Legal-Variablen, Section-Arrays, Links und optionale HTML-Overrides. |
| `webseite_design_config` | Wird von der React-Website optional aus `kunden_config` gelesen und über Repo-Fallbacks gemerged. | Zielcontainer für Website-Farben und Website-Assets, soweit sie sichtbaren Stand beeinflussen. |
| `webseite_layout_config` | Wird von der React-Website optional aus `kunden_config` gelesen und über Repo-Fallbacks gemerged. | Zielcontainer für reine Section-Reihenfolge. Keine Textquelle. |
| `customerDefaults` | Ehiogie-spezifische Repo-Fallbacks für Design, Assets und Layout. | Muss als Snapshot-Ausgang gelesen, aber später nicht als CRM-Wahrheit behandelt werden. |
| `websiteContentDefaults` | Ehiogie-spezifische Repo-Fallback-Copy für Brand, Legal, Sections, Links, FAQ, Stats und Reviews. | Muss vollständig in den Snapshot einfließen, wenn Supabase keinen Wert liefert. |
| `i18n` | Parallel aktive Sprach-/Fallback-Schicht für Navigation, Header, Footer, Statusseiten, Jahresrechnung und diverse Section-Fallbacks. | Muss für alle aktuell sichtbaren i18n-Texte als Snapshot-Quelle aufgenommen werden, solange noch kein `webseite_content_config`-Key existiert. |
| Hardcoded Komponenten-/Loader-Texte | Lokale Fallbacks in React-Komponenten und statische Texte in HTML-Loadern. | Müssen 1:1 übernommen oder explizit als bewusst hart bleibend klassifiziert werden. |
| `runtime_config` | Loader-URLs, Engine-/Proxy-/Asset-Werte aus `kunden_config`; parallel Bootstrap-Fallbacks. | Tenant-owned Runtime-Vertrag, aber keine Textoptimierung. Später nur snapshotten, nicht in dieser PR schreiben. |
| `design_config` | Legacy Loader-Design-Werte aus `kunden_config`, z. B. Survey-/Offer-Design. | Für Loader-/Tarif-Sicht relevant; getrennt von `webseite_design_config` dokumentieren. |
| `url_config` | Loader-Ziel-URLs, z. B. Offer-, Success-, Error- und Privacy-URLs. | Tenant-owned URL-Vertrag; keine Copy-Quelle außer Link-Ziel. |
| Tabellen-/Engine-Daten | `auftraege`, Survey-Engine-Antworten, `ai_content`, Tarifdaten. | Kein statischer Website-Content. Nicht in Content-Snapshot übernehmen. |

### 1.2 Bereichsmatrix

| Bereich | Aktueller Ursprung | Bereits vorhandene Zielkeys | Fehlende/zusätzliche Snapshot-Keys | Problematische Punkte | Tenant-owned vs. global |
|---|---|---|---|---|---|
| Homepage | Zusammengesetzt aus `layout_config.pages.home.sections`, React-Komponenten, `webseite_content_config`, `websiteContentDefaults`, `i18n` und lokalen Komponenten-Fallbacks. | `sections.hero`, `sections.problem`, `sections.solution`, `sections.how_it_works`, `sections.comparison`, `sections.testimonials`, `sections.about`, `sections.stats`, `sections.faq`, `sections.final_cta`; `webseite_layout_config.pages.home.sections`. | Alle heute nur in `i18n` oder hardcoded Fallbacks sichtbaren Labels der Homepage müssen als Snapshot-Key aufgenommen oder ausdrücklich als global/hart markiert werden. | Mehrere parallele Fallbacks können denselben sichtbaren Bereich beliefern. Reihenfolge darf beim Snapshot nicht geraten werden. | Mandantenspezifisch: sichtbare Texte, Links, Assets, Section-Reihenfolge. Global: Komponentenstruktur, Animationen, technische Layout-Logik. |
| Hero | `sections.hero.*` aus `webseite_content_config`/`websiteContentDefaults`; CTA-/Fallback-Texte zusätzlich aus `i18n`; Bild aus `webseite_design_config.assets.hero_image`/`customerDefaults`. | `sections.hero.image_alt`, `badge`, `headline`, `subline`, `cta_text`, `result_note`; `assets.hero_image`. | Keine separate Key-Struktur für alle Button-/Header-Abhängigkeiten außerhalb `sections.hero`; Sprachobjekte müssen vollständig für aktuell unterstützte Sprachen eingefroren werden. | Hero ist sehr sichtbar; Abweichungen fallen sofort auf. Auto-Translator darf nicht als Snapshot-Quelle genutzt werden. | Tenant-owned: alle sichtbaren Hero-Texte und Bild-URL. Global: Hero-Komponentenaufbau. |
| About | `sections.about.*`, `brand.agency_*`, Social-Links, `design_config/assets.agency_logo`; Fallbacks in Komponente und Defaults. | `sections.about.avatar_url`, `person_name`, `role`, `social_hint`, `social.*`, `paragraph_1` bis `paragraph_6`, `brand.agency_url`, `brand.agency_alt`, `assets.agency_logo`. | Optional: `sections.about.*` pro Sprache, falls zukünftig mehrsprachig in Supabase statt i18n/Translator gespiegelt werden soll. | Persönliche Angaben und externe Social-/Agency-Links sind tenant-spezifisch und dürfen nicht auf Kromen kopiert werden. | Tenant-owned: Person, Rolle, Socials, About-Copy, Agency-Link/Logo. Global: Card-/Section-Layout. |
| FAQ | `sections.faq.home_items` aus Content-Config/Defaults; zusätzlicher lokaler `fallbackFaqs`; Überschrift aus `i18n`; finaler CTA darunter aus `sections.final_cta` und `i18n`. | `sections.faq.home_items`; `sections.final_cta.headline`, `subline`, `cta_text`. | `sections.faq.headline` fehlt als Website-Content-Key; aktuell kommt die Überschrift aus `i18n`. Falls Supabase vollständige Copy-Wahrheit werden soll, `sections.faq.headline` snapshotten. | FAQ-Reihenfolge und Wortlaut sind sensibel für Vertrauen/Erwartung; Arrays brauchen stabile IDs oder unveränderte Reihenfolge. | Tenant-owned: Fragen, Antworten, FAQ-Headline, finaler CTA. Global: Accordion-Verhalten. |
| Testimonials | `sections.testimonials.*` und `sections.jahresrechnung.reviews`; Fallbacks in Defaults und Jahresrechnung-Seite. | `sections.testimonials.kicker`, `headline`, `home_reviews`; `sections.jahresrechnung.reviews`. | Für Jahresrechnung existieren zusätzliche lokale Review-Fallbacks, falls Config-Array leer ist. Diese müssen beim Snapshot als sichtbare Quelle geprüft werden. | Namen/Zitate sind reputationssensibel; keine Kopie zu anderem Mandanten. | Tenant-owned: alle Review-Texte, Namen, Reihenfolge. Global: Carousel/Card-Layout. |
| Stats | `sections.stats.*` aus Content-Config/Defaults; Zählerdarstellung in Komponente. | `sections.stats.headline`, `sections.stats.items[].end`, `suffix`, `label`. | Optional stabile `id` je Item für CRM-Reorder/Updates. | Zahlen sind claims/reputationsrelevant; dürfen nicht still optimiert werden. | Tenant-owned: sichtbare Zahlen/Labels. Global: Count-up-Animation. |
| CTA | Hero-/Solution-/Comparison-/Jahresrechnung-/Final-CTA gemischt aus `sections.*.cta_text`, `sections.jahresrechnung.cta`, `i18n` und hardcoded Fallbacks. | `sections.hero.cta_text`, `sections.solution.cta_text`, `sections.comparison.cta_text`, `sections.final_cta.cta_text`, `sections.jahresrechnung.cta`. | Header-CTA-Labels, Statusseiten-CTA und Loader-CTA liegen noch in `i18n`/Loadern und brauchen Snapshot-Entscheidung. | CTA-Ziele beeinflussen Funnel und Conversion; URL und Text getrennt snapshotten. | Tenant-owned: CTA-Texte und Ziel-URLs. Global: Button-Komponenten. |
| Footer | Brand/Logos aus Content-/Design-Config; Footer-Texte und Labels aus `i18n`; Rückruf-Link zu `/rueckruf-anfordern`; Legal-Links zu `/datenschutz` und `/impressum`; Agency-Link aus `brand.agency_url`. | `brand.name`, `brand.agency_url`, `brand.agency_alt`, `assets.logo_footer`, `assets.agency_logo`, `sections.links.datenschutz`, `sections.links.impressum`. | `footer.rights`, `footer.contact`, `footer.callback`, `footer.legal`, `footer.privacy`, `footer.imprint` fehlen als Content-Keys, weil aktuell i18n. | Footer ist legal/reputationsrelevant; Jahr ist dynamisch und soll nicht als Snapshot-Text eingefroren werden. | Tenant-owned: Brand, Kontakt-/Rückruf-/Legal-/Agency-Ziele und Labels. Global: aktuelles Jahr, Footer-Layout. |
| Datenschutz | Seitenstruktur hardcoded; Legal-Variablen aus `legal.variables.*`; optionaler HTML-Override `pages.datenschutz.html`; Auto-Translator ausgeschlossen. | `legal.variables.firma`, `inhaber`, `strasse`, `plz`, `ort`, `land`, `email`, `stand`; optional `pages.datenschutz.html`. | Vollständiger `pages.datenschutz.html`-Snapshot fehlt, falls Supabase die komplette Seite 1:1 tragen soll. | Rechtlich sensibel. HTML-Override kann komplette Struktur ersetzen und ist besonders breaking. | Tenant-owned: alle Legal-Variablen und ggf. vollständiger HTML-Override. Global nur technische Render-Hülle. |
| Impressum | Seitenstruktur hardcoded; Legal-Variablen aus `legal.variables.*`; optionaler HTML-Override `pages.impressum.html`; Auto-Translator ausgeschlossen. | `legal.variables.firma`, `inhaber`, `strasse`, `plz`, `ort`, `land`, `email`, `telefon`, `stand`; optional `pages.impressum.html`. | Vollständiger `pages.impressum.html`-Snapshot fehlt, falls Supabase die komplette Seite 1:1 tragen soll. | Rechtlich sensibel; falsche Kontaktdaten/Inhaber wären kritisch. Dynamischer `stand` muss eingefroren werden. | Tenant-owned: Legal Entity, Adresse, Kontakt, Stand und ggf. HTML. Global nur Render-Hülle. |
| Cookie/Consent | Cookie-Bar-Texte über `getText("cookie.*")` mit hardcoded Fallbacks; Brandname aus `brand.name`; Farbe aus `webseite_design_config.colors.primary`; Consent-State in LocalStorage/Cookie. | Keine `cookie.*`-Defaults in `websiteContentDefaults`; Brand/Design existieren. | `cookie.title`, `copy_intro`, `copy_intro_suffix`, `essential_label`, `essential_copy`, `marketing_label`, `marketing_copy`, `more_info`, `privacy_link`, `imprint_link`, `marketing`, `essential`, `save`, `accept_all`. | Rechtlich und funktional sensibel; Consent-Mechanik darf nicht verändert werden. Textsnapshot darf keine Consent-Kategorie ändern. | Tenant-owned: sichtbare Consent-Texte, Brand, Link-Ziele. Global/niemals CRM ohne Freigabe: Speicherlogik, Kategorien, Cookie-Namen, Laufzeit. |
| Start/Setting | React-Seite lädt `/loaders/start.html`; Loader nutzt `TB_BOOTSTRAP`, `kunden_config.runtime_config`, `url_config`, `design_config`; Survey-Fragen kommen aus externem Setting-Engine-Script. | Kein `webseite_content_config`-Bereich für Survey-Copy; Runtime: `runtime_config.setting_engine_url`, `setting_proxy_path`, `avatar_url`; URLs: `url_config.offer_base_url`; Design: `design_config.*`. | Separater `survey_content_config.setting` oder Engine-Snapshot-Vertrag fehlt. Für 1:1 muss das aktuell geladene Engine-Asset versioniert/snapshotbar sein. | Breaking-Risiko sehr hoch: Funnel-Einstieg, Datenschutz-Hinweise, Engine-URL, Proxy und Offer-Ziel. | Tenant-owned: Engine-/Proxy-/URL-/Avatar-/Design-Werte und Survey-Copy. Global: generische Loader-Technik. CRM darf Engine-/Proxy-Werte nicht ohne Admin-Freigabe überschreiben. |
| Auftrag/Closing | React-Seite lädt `/loaders/auftrag.html`; Loader nutzt `TB_BOOTSTRAP`, `runtime_config.closing_engine_url`, `closing_proxy_path`, `design_config`; Survey-Copy kommt aus Closing-Engine. | Kein `webseite_content_config`-Bereich für Closing-Copy; Runtime: `runtime_config.closing_engine_url`, `closing_proxy_path`; URL-Fallbacks im Bootstrap. | Separater `survey_content_config.closing` oder Engine-Snapshot-Vertrag fehlt. | Sehr breaking: Vertrags-/Auftragsabschluss darf nicht textlich/technisch driften. | Tenant-owned: Closing-Copy, Engine-/Proxy-/URL-/Design-Werte. CRM darf Abschlusslogik, rechtliche Checkboxen und Proxy niemals ohne Admin/Legal überschreiben. |
| Rechnung | React-Seite lädt `/loaders/rechnung.html`; Loader nutzt `TB_BOOTSTRAP`, `kunden_config.runtime_config`, `url_config`, `design_config`; Survey-Copy kommt aus Rechnung-Engine. | Runtime: `runtime_config.rechnung_engine_url`, `rechnung_proxy_path`; URLs: `rechnung_success_url`, `rechnung_error_url`, `privacy_url`; Design: `design_config.*`. | Separater `survey_content_config.rechnung` oder Engine-Snapshot-Vertrag fehlt. | Upload-/Rechnungsdatenfluss und Datenschutz-Hinweise sind rechtlich/technisch sensibel. | Tenant-owned: Rechnungs-Survey-Copy, Runtime, URLs, Design. CRM darf Upload-/Privacy-/Proxy-Werte nur mit Admin-Freigabe ändern. |
| Tarif/Offer | `/loaders/tarif.html`; Texte aus lokalem Loader-`I18N`, Daten aus `auftraege`, `ai_content`, Tarif-Snapshot, `design_config` für Offer-Styling; Navigation über Bootstrap/URL-Konfiguration. | Kein `webseite_content_config`-Ziel; partiell `design_config.brand`/`design_config.offer`; Auftrag-/Start-URLs über Bootstrap. | Separater `offer_content_config` für Loader-I18N fehlt, falls Offer-Texte tenant-owned werden sollen. | Extrem breaking: Tarifzahlen, CTA, Details, KI-Zusammenfassung und Vertragsübergang. Datenwerte dürfen nicht als statische Content-Defaults snapshotten. | Tenant-owned: Offer-I18N, Design, Ziel-URLs. Datensatzbezogen: Tarif-/Auftragsdaten. CRM darf nur definierte Text-/Design-Keys ändern, niemals berechnete Tarifwerte. |
| Danke-/Fehlerseiten | React-Statusseiten nutzen `i18n` für Titel, Body und CTA; SimpleHeader/Footer nutzen Brand/Design/Content. | Keine dedizierten `pages.status.*`-Content-Keys; Brand/Logo existieren. | `pages.auftrag_eingegangen.*`, `pages.rechnung_eingegangen.*`, `pages.fehler.*`, `pages.rechnung_fehler.*` fehlen als Content-Keys. | Fehlerseiten sind UX- und Support-sensibel; CTA-Ziele müssen exakt bleiben. | Tenant-owned: sichtbarer Status-Text und CTA-Ziele. Global: Statusseitenlayout. |
| Rückruf-Seite | `sections.callback.*`; Header/Footer gemischt aus Content/Design/i18n. | `sections.callback.title`, `description`, `calendar_url`, `disabled_text`. | Optional Support-/Fallback-Kontaktangaben als eigene Keys. | Kalender-URL ist tenant-spezifisch und darf nicht auf andere Mandanten kopiert werden. | Tenant-owned: Titel, Beschreibung, Kalender-URL, Disabled-Text. Global: Embed-Script und Layout. |
| Jahresrechnung | React-Seite mit `sections.jahresrechnung.*`, `i18n`, lokalen Arrays/Fallbacks und optional `pages.jahresrechnung.html`; About/Footer/Header wiederverwendet. | `sections.jahresrechnung.reviews`; teilweise genutzte Keys wie `process`, `why`, `comparison_self`, `comparison_assistant`, `cta`, `final_text`, `hero_*`, `reviews_kicker`; optional `pages.jahresrechnung.html`. | Viele Jahresrechnung-Keys sind genutzt, aber nicht vollständig in `websiteContentDefaults` angelegt; i18n-Headlines/Fallbacks müssen als Snapshot-Keys ergänzt werden. | Hohe Sichtbarkeit und Funnel-Relevanz; Überschneidung mit Homepage-About/Stats/FAQ kann ungewollte globale Änderungen auslösen. | Tenant-owned: Jahresrechnung-Copy, Reviews, CTA und HTML-Override. Global: Komponentenlayout und Routing. |

## 2. Zielstruktur in Supabase

### 2.1 Ziel-JSONs

Der spätere Snapshot soll ohne produktive Umschaltung in separaten JSON-Spalten oder versionierten JSON-Dateien vorbereitet werden. Erst danach darf entschieden werden, welche Spalte produktiv gelesen wird.

#### `kunden_config.webseite_content_config`

```json
{
  "_snapshot_meta": {
    "tenant": "ehiogie",
    "location_id": "tn90CyE3XuYFTy4c1M3F",
    "source_branch": "Ehiogie-Energieassistent-tn90CyE3XuYFTy4c1M3F",
    "source_kind": "live_plus_repo_fallbacks",
    "captured_at": "<ISO-8601>",
    "no_copy_polish": true
  },
  "brand": {
    "name": "<aktueller sichtbarer Wert>",
    "contact_email": "<aktueller sichtbarer Wert>",
    "agency_url": "<aktueller sichtbarer Wert>",
    "agency_alt": "<aktueller sichtbarer Wert>"
  },
  "legal": {
    "variables": {
      "firma": "<aktueller sichtbarer Wert>",
      "inhaber": "<aktueller sichtbarer Wert>",
      "strasse": "<aktueller sichtbarer Wert>",
      "plz": "<aktueller sichtbarer Wert>",
      "ort": "<aktueller sichtbarer Wert>",
      "land": "<aktueller sichtbarer Wert>",
      "email": "<aktueller sichtbarer Wert>",
      "telefon": "<aktueller sichtbarer Wert>",
      "stand": "<eingefrorener sichtbarer Wert>"
    }
  },
  "cookie": {
    "title": "<aktueller Fallback-Wert>",
    "copy_intro": "<aktueller Fallback-Wert>",
    "copy_intro_suffix": "<aktueller Fallback-Wert>",
    "essential_label": "<aktueller Fallback-Wert>",
    "essential_copy": "<aktueller Fallback-Wert>",
    "marketing_label": "<aktueller Fallback-Wert>",
    "marketing_copy": "<aktueller Fallback-Wert>",
    "more_info": "<aktueller Fallback-Wert>",
    "privacy_link": "<aktueller Fallback-Wert>",
    "imprint_link": "<aktueller Fallback-Wert>",
    "marketing": "<aktueller Fallback-Wert>",
    "essential": "<aktueller Fallback-Wert>",
    "save": "<aktueller Fallback-Wert>",
    "accept_all": "<aktueller Fallback-Wert>"
  },
  "header": {
    "language_switch_sr": "<aktueller Fallback-Wert>",
    "check_bill": "<aktueller i18n-Wert>",
    "check_savings": "<aktueller i18n-Wert>"
  },
  "footer": {
    "rights": "<aktueller i18n-Wert>",
    "contact": "<aktueller i18n-Wert>",
    "callback": "<aktueller i18n-Wert>",
    "legal": "<aktueller i18n-Wert>",
    "privacy": "<aktueller i18n-Wert>",
    "imprint": "<aktueller i18n-Wert>"
  },
  "sections": {
    "hero": {},
    "problem": {},
    "solution": {},
    "how_it_works": {},
    "comparison": {},
    "testimonials": {},
    "about": {},
    "stats": {},
    "faq": {
      "headline": "<aktueller i18n-Wert>",
      "home_items": []
    },
    "final_cta": {},
    "callback": {},
    "jahresrechnung": {}
  },
  "pages": {
    "datenschutz": {
      "html": "<nur falls kompletter HTML-Override produktiv gewollt>"
    },
    "impressum": {
      "html": "<nur falls kompletter HTML-Override produktiv gewollt>"
    },
    "jahresrechnung": {
      "html": "<nur falls kompletter HTML-Override produktiv gewollt>"
    },
    "auftrag_eingegangen": {},
    "rechnung_eingegangen": {},
    "fehler": {},
    "rechnung_fehler": {},
    "not_found": {}
  },
  "links": {
    "website": "<aktueller Wert>",
    "datenschutz": "<aktueller Wert>",
    "impressum": "<aktueller Wert>",
    "tarif": "<aktueller Wert>",
    "jahresrechnung": "<aktueller Wert>",
    "auftrag_eingegangen": "<aktueller Wert>",
    "rechnung_eingegangen": "<aktueller Wert>",
    "fehler": "<aktueller Wert>",
    "rechnung_fehler": "<aktueller Wert>",
    "callback": "<aktueller Wert>"
  }
}
```

#### `kunden_config.webseite_design_config`

```json
{
  "_snapshot_meta": {
    "tenant": "ehiogie",
    "location_id": "tn90CyE3XuYFTy4c1M3F",
    "source_kind": "live_plus_customer_defaults"
  },
  "colors": {
    "primary": "<aktueller sichtbarer Wert>",
    "text": "<aktueller sichtbarer Wert>",
    "mutedText": "<aktueller sichtbarer Wert>",
    "background": "<aktueller sichtbarer Wert>"
  },
  "radius": {
    "section": "<aktueller sichtbarer Wert>"
  },
  "assets": {
    "logo_header": "<aktueller sichtbarer Wert>",
    "logo_footer": "<aktueller sichtbarer Wert>",
    "hero_image": "<aktueller sichtbarer Wert>",
    "agency_logo": "<aktueller sichtbarer Wert>"
  }
}
```

#### `kunden_config.webseite_layout_config`

```json
{
  "_snapshot_meta": {
    "tenant": "ehiogie",
    "location_id": "tn90CyE3XuYFTy4c1M3F",
    "source_kind": "live_plus_customer_defaults"
  },
  "pages": {
    "home": {
      "sections": ["header", "hero", "problem", "solution", "how_it_works", "comparison", "testimonials", "about", "stats", "faq", "footer"]
    },
    "annual": {
      "sections": ["header", "hero", "process", "why", "value", "comparison", "testimonials", "about", "stats", "faq", "final_cta", "footer"]
    }
  }
}
```

#### Loader-/Funnel-nahe Configs

Diese Werte sind nicht Teil der React-Website-Content-Defaults, beeinflussen aber den sichtbaren Live-Stand der Start-/Auftrag-/Rechnung-/Tarif-Flows. Sie dürfen nicht nebenbei in `webseite_content_config` gemischt werden.

```json
{
  "runtime_config_snapshot": {
    "setting_engine_url": "<aktueller Live-/Fallback-Wert>",
    "setting_proxy_path": "<aktueller Live-/Fallback-Wert>",
    "closing_engine_url": "<aktueller Live-/Fallback-Wert>",
    "closing_proxy_path": "<aktueller Live-/Fallback-Wert>",
    "rechnung_engine_url": "<aktueller Live-/Fallback-Wert>",
    "rechnung_proxy_path": "<aktueller Live-/Fallback-Wert>",
    "avatar_url": "<aktueller Live-/Fallback-Wert>"
  },
  "url_config_snapshot": {
    "offer_base_url": "<aktueller Live-/Fallback-Wert>",
    "auftrag_url": "<aktueller Live-/Fallback-Wert>",
    "start_url": "<aktueller Live-/Fallback-Wert>",
    "rechnung_success_url": "<aktueller Live-/Fallback-Wert>",
    "rechnung_error_url": "<aktueller Live-/Fallback-Wert>",
    "privacy_url": "<aktueller Live-/Fallback-Wert>"
  },
  "design_config_snapshot": {
    "brand": "<aktueller Loader-Design-Wert>",
    "offer": "<aktueller Tarif-Offer-Design-Wert>",
    "survey": "<aktueller Survey-Design-Wert>"
  },
  "offer_content_config_snapshot": {
    "i18n": "<aktuelles lokales Tarif-Loader-I18N unverändert>"
  },
  "survey_content_config_snapshot": {
    "setting": "<aktuell geladene Setting-Engine-Copy/versioniertes Asset>",
    "closing": "<aktuell geladene Closing-Engine-Copy/versioniertes Asset>",
    "rechnung": "<aktuell geladene Rechnung-Engine-Copy/versioniertes Asset>"
  }
}
```

### 2.2 Keys: existierend, fehlend, problematisch

**Schon vorhanden oder vorbereitet:**

- `brand.*`
- `legal.variables.*`
- `sections.hero.*`
- `sections.solution.*`
- `sections.about.*`
- `sections.how_it_works.*`
- `sections.problem.*`
- `sections.comparison.*`
- `sections.final_cta.*`
- `sections.callback.*`
- `sections.links.*`
- `sections.testimonials.*`
- `sections.jahresrechnung.reviews`
- `sections.stats.*`
- `sections.faq.home_items`
- `webseite_design_config.colors`, `radius`, `assets`
- `webseite_layout_config.pages.home.sections`, `pages.annual.sections`

**Fehlende oder noch nicht vollständig gefüllte Content-Keys:**

- `cookie.*`
- `header.check_bill`, `header.check_savings`, `header.language_switch_sr`
- `footer.*`
- `sections.faq.headline`
- Vollständige `sections.jahresrechnung.*`-Keysets für Hero, Prozess, Why, Value, Comparison, FAQ und Final-CTA
- `pages.datenschutz.html`, `pages.impressum.html`, `pages.jahresrechnung.html`, falls vollständige Seiten-HTML-Snapshots gewünscht sind
- `pages.auftrag_eingegangen.*`, `pages.rechnung_eingegangen.*`, `pages.fehler.*`, `pages.rechnung_fehler.*`, `pages.not_found.*`
- `offer_content_config.i18n` oder gleichwertiger Tarif-Loader-Textvertrag
- `survey_content_config.setting`, `survey_content_config.closing`, `survey_content_config.rechnung`

**Problematische Keys/Werte:**

- `legal.variables.stand`: aktuell dynamisch erzeugbar; im Snapshot als sichtbarer String einfrieren.
- `pages.*.html`: ersetzt ganze Seiten und kann Struktur, Rechtliches und Tracking unbeabsichtigt ändern.
- `cookie.*`: darf nur Text spiegeln, nie Consent-Kategorien oder Speicherlogik ändern.
- `runtime_config.*_engine_url` und `*_proxy_path`: technische Produktionspfade, nur Admin-owned.
- `url_config.*`: Funnel-Ziele; falsche Werte brechen Conversion und Status-Routing.
- `sections.testimonials.*` und `sections.stats.*`: Reputations-/Claim-Risiko.
- `sections.callback.calendar_url`: mandantenspezifisch und nicht kopierbar.
- Tarif-/Auftragsdaten aus `auftraege`: keine statischen Content-Keys.

### 2.3 Tenant-owned vs. global

**Tenant-owned und später snapshot-/CRM-fähig nach Freigabe:**

- Brand, Legal-Variablen, Kontakt, Agency/Socials
- Website-Texte, Section-Arrays, CTA-Texte, FAQ, Testimonials, Stats
- Linkziele, Kalender-URL, Logos/Bilder/Farben
- Statusseiten-Texte und -CTA-Ziele
- Loader sichtbare Texte, falls ein separater Loader-Content-Vertrag existiert

**Global oder nur Admin-owned:**

- React-Komponentenstruktur, Routing, Layoutlogik, Animationsverhalten
- Consent-Speicherlogik, Cookie-Namen, Kategorien und Max-Age
- Supabase URL/Anon-Key-Bootstrap-Mechanik
- Engine-/Proxy-URLs, Storage-Pfade, Functions-Pfade
- Tarifberechnung, AI-Auswahl, Auftrags-/Submission-Daten
- Auto-Translator-Mechanik und ausgeschlossene Legal-Pfade

## 3. Snapshot-Regeln

1. **Read-only Snapshot:** Snapshot-Erstellung darf nur lesen: Live-DOM, aktuell geladene Supabase-Zeile, Repo-Fallbacks, i18n-Dictionary, Loader-HTML und versionierte Engine-Assets. Keine Supabase-Schreiboperation, kein SQL, keine Migration.
2. **Effektive Werte statt Quellannahmen:** Für jeden Key wird der effektiv sichtbare Wert gespeichert: Remote-Wert, falls vorhanden; sonst Repo-/i18n-/Komponenten-Fallback gemäß Runtime-Reihenfolge.
3. **Keine Textnormalisierung:** Keine Rechtschreibkorrektur, keine Typografie-Verbesserung, keine Übersetzungskorrektur, keine Whitespace-Glättung außer technisch notwendigem JSON-Escaping.
4. **Arrays mit Reihenfolge einfrieren:** FAQ, Reviews, Stats, Prozess-/Comparison-Listen und Loader-Listen müssen exakt in sichtbarer Reihenfolge gespeichert werden. Optional dürfen stabile interne IDs ergänzt werden, aber niemals sichtbare Texte verändern.
5. **Fallbacks explizit markieren:** Jeder Snapshot-Wert erhält intern eine Quellenmarkierung wie `source: webseite_content_config | websiteContentDefaults | i18n | hardcoded | runtime_config | design_config | url_config | engine_asset`. Diese Metadaten dürfen nicht in sichtbare Renderpfade gelangen.
6. **Fehlende Keys nicht erraten:** Wenn ein Zielkey fehlt, wird er als `missing_target_key` dokumentiert und mit dem sichtbaren Fallback-Wert gefüllt. Er darf nicht inhaltlich neu formuliert werden.
7. **Dynamische Werte trennen:** Jahr im Footer, Datum/Stand, Tarifpreise, Nutzername, PLZ, Verbrauch, KI-Zusammenfassung und Submission-Daten werden nicht als globale Copy eingefroren. Nur Templates/Labels werden eingefroren.
8. **Legal-Freeze:** Datenschutz, Impressum und Consent werden als rechtlich sensibel markiert. Jede spätere Änderung braucht separaten Legal-/Owner-Review.
9. **Engine-Freeze:** Für Start, Auftrag und Rechnung muss zusätzlich zum URL-Wert die tatsächlich geladene Engine-Version/Asset-Checksumme dokumentiert werden, sonst ist kein 1:1-Snapshot möglich.
10. **Screenshot-/DOM-Baseline:** Vor jeder produktiven Umschaltung wird eine DOM-Textliste und Screenshot-Baseline je Route/Sprache erzeugt. Supabase-Snapshot gilt nur als korrekt, wenn DOM-Text und Screenshots keinen unfreigegebenen Unterschied zeigen.

## 4. Migrationsreihenfolge

### Phase 1: Reine JSON-Snapshots, keine produktive Umschaltung

- Live-/Fallback-Stand für Ehiogie read-only erfassen.
- Effektive `webseite_content_config`, `webseite_design_config`, `webseite_layout_config` als versionierte Snapshot-Dateien oder nicht-produktive Snapshot-Spalten ablegen.
- Loader-nahe `runtime_config`, `url_config`, `design_config`, Offer-I18N und Survey-Engine-Copy nur dokumentieren/versionieren.
- Keine Änderung an produktiv gelesenen Supabase-Werten.
- Keine Runtime-Codeänderung, keine UI-Änderung, kein Deploy.

### Phase 2: Dry-Run gegen Staging/Test

- Snapshot in Staging/Test laden, niemals direkt in Produktion.
- React-Website gegen Snapshot starten.
- DOM-Textvergleich pro Route und Sprache ausführen.
- Screenshot-Vergleich für Desktop und Mobile ausführen.
- Legal-/Consent-Seiten manuell prüfen.
- Loader-Flows mit Test-Submissions prüfen, ohne echte Aufträge oder produktive Schreibpfade auszulösen.

### Phase 3: Kontrollierte Aktivierung einzelner Config-Bereiche

1. Nur `webseite_design_config` aktivieren, wenn Screenshots stabil bleiben.
2. Danach einzelne ungefährliche Content-Bereiche aktivieren: Brand, Header/Footer-Labels, Hero, About.
3. Danach Arrays aktivieren: FAQ, Testimonials, Stats.
4. Danach rechtlich sensible Bereiche nur nach Review: Datenschutz, Impressum, Cookie/Consent.
5. Danach Funnel-Bereiche nur mit Rollback: Start, Auftrag, Rechnung, Tarif/Offer, Statusseiten.
6. Jede Aktivierung braucht Vorher/Nachher-DOM, Screenshots und Rollback-Snapshot.

### Phase 4: Erst danach echte Content-Optimierung

- Erst wenn Snapshot-Parität bestätigt ist, darf Copy-Optimierung geplant werden.
- Optimierung erfolgt mandantenspezifisch, versioniert und mit Review.
- Kromen-Catch-up darf erst nach stabiler Ehiogie-Snapshot-Mechanik beginnen.

## 5. Risikoanalyse

### 5.1 Riskanteste Bereiche

1. **Start/Setting, Auftrag/Closing, Rechnung:** Engine-/Proxy-/URL-Abhängigkeiten können Funnel, Uploads oder Abschlüsse brechen.
2. **Tarif/Offer:** Vermischt Loader-I18N, Auftragsdaten, AI-Content, Tarifwerte und CTAs; keine statische Copy-Migration ohne strikte Trennung.
3. **Cookie/Consent:** Textänderungen können rechtliche Aussage oder Nutzerentscheidung beeinflussen.
4. **Datenschutz/Impressum:** Falsche Variablen oder HTML-Overrides sind rechtlich kritisch.
5. **Jahresrechnung:** Viele lokale Fallbacks und i18n-Abhängigkeiten; hohes Risiko für sichtbare Drift.
6. **Footer/Links:** Falsche Legal-/Callback-/Agency-Ziele sind klein, aber produktiv sichtbar und rechtlich/reputationsrelevant.

### 5.2 Rechtlich sensible Bereiche

- Datenschutz
- Impressum
- Cookie/Consent
- Survey-Privacy-Hinweise und Privacy-URLs
- Auftrag/Closing-Texte, Checkboxen, Einwilligungen und Abschluss-CTAs
- Rechnungsupload-/Rechnungssurvey-Texte
- Kontakt, Inhaber, Adresse, Telefonnummer und E-Mail

### 5.3 Besonders breaking

- `runtime_config.*_engine_url`
- `runtime_config.*_proxy_path`
- `url_config.offer_base_url`, `auftrag_url`, `start_url`, `rechnung_success_url`, `rechnung_error_url`, `privacy_url`
- Tarif-CTA-Ziele im Offer-Loader
- `pages.*.html`-Overrides
- `sections.callback.calendar_url`
- `webseite_layout_config.pages.*.sections`, falls Section-Namen/Reihenfolge falsch sind

### 5.4 Kromen-Einfluss

Kromen kann beeinflusst werden, wenn Ehiogie-spezifische Repo-Fallbacks, Asset-URLs, Legal-Daten, Testimonials, Stats, Social-Links, Kalender-URLs oder Engine-/Proxy-Pfade als globale Defaults missverstanden werden. Deshalb darf kein Ehiogie-Wert in Template-, Hauptrepo-, Kromen- oder E-Mail-Defaults verschoben werden. Kromen muss dieselbe Mechanik nutzen, aber eigene Werte snapshotten.

### 5.5 CRM-Grenzen

**CRM darf später nach Freigabe überschreiben:**

- Website-Copy in klar definierten `webseite_content_config`-Keys
- FAQ/Review/Stats-Arrays mit stabiler Reihenfolge
- Brand-/Kontakt-/Social-/Callback-Werte
- Bilder/Logos/Farben in freigegebenen Asset-/Design-Keys
- Statusseiten-Texte und CTA-Ziele, sofern Rollback vorhanden ist

**CRM darf niemals ohne Admin-/Legal-Freigabe überschreiben:**

- Supabase URL/Anon-Key, Storage- und Function-Pfade
- Engine-/Proxy-URLs
- Consent-Kategorien, Cookie-Name, Laufzeit, Speicherlogik
- Legal-HTML-Overrides und rechtliche Pflichtangaben
- Auftrag-/Closing-Rechts- oder Einwilligungstexte
- Tarifberechnungen, Tarifwerte, Auftragsdaten, AI-Content-Auswahl
- Kromen- oder Template-Werte

## 6. Kromen Catch-up Vorbereitung

Die Snapshot-/Migration-Mechanik soll später identisch für Kromen nutzbar sein:

1. Tenant anhand eigener `location_id` isolieren.
2. Live-Remote-Werte plus Repo-/i18n-/hardcoded Fallbacks read-only auflösen.
3. Effektive JSONs mit Quellenmetadaten erstellen.
4. Keine produktive Umschaltung in Phase 1.
5. Staging-Dry-Run mit DOM-/Screenshot-Vergleich.
6. Bereichsweise Aktivierung mit Rollback.
7. Erst nach Parität Copy-Optimierung.

**Nicht von Ehiogie nach Kromen kopieren:**

- Brandname, Kontakt, Inhaber, Adresse, Telefon, E-Mail
- Datenschutz-/Impressum-Variablen und HTML
- Logos, Hero-/Avatar-/Agency-Bilder, CDN-URLs
- Testimonials, Namen, Zitate, Stats/Claims
- About-Person, Social-Links, Agency-Link/Logo
- Callback-Kalender-URL
- Engine-/Proxy-/URL-Konfiguration, sofern nicht explizit mandantenübergreifend freigegeben
- Tarif-/Auftrags-/Submission-/AI-Daten
- Consent-Textvarianten ohne Legal-Freigabe für Kromen

## 7. Finales Ergebnis

### 7.1 Sichere Reihenfolge

1. Ist-Quellen inventarisieren: Supabase read-only, Repo-Defaults, i18n, hardcoded Fallbacks, Loader, Engine-Assets.
2. Effektive JSON-Snapshots erzeugen, inklusive Quellenmetadaten und Checksummen.
3. Fehlende Keys in Zielstruktur ergänzend dokumentieren, nicht produktiv aktivieren.
4. Staging-Dry-Run mit DOM-/Screenshot-Parität.
5. Bereichsweise Aktivierung mit Rollback.
6. Legal-/Consent-/Funnel-Bereiche separat freigeben.
7. Erst danach Content-Optimierung.

### 7.2 Freeze-Regeln

- Aktuelle sichtbare Texte werden exakt eingefroren.
- Aktuelle sichtbare Übersetzungen werden exakt eingefroren.
- Fallback-Texte werden nicht neu geschrieben, sondern als Werte übernommen.
- Dynamische Daten werden als dynamisch markiert, nicht als statische Copy gespeichert.
- Legal-/Consent-/Funnel-Texte bleiben bis Review gesperrt.
- Repo-Default-Werte gelten nur als Snapshot-Quelle, nicht als zukünftige CRM-Wahrheit.

### 7.3 Migration-Grenzen

- Keine Migration direkt nach Produktion.
- Keine SQL-Ausführung im Snapshot-Schritt.
- Keine Supabase-Schreiboperation im Snapshot-Schritt.
- Keine Runtime-/UI-/Textänderung im Planungs-PR.
- Keine Kromen-, Template-, Hauptrepo- oder E-Mail-Repo-Änderung.
- Keine Vermischung von Website-Content und Loader-/Runtime-Konfiguration.

### 7.4 CRM-Grenzen

- CRM darf nur dokumentierte tenant-owned Keys bearbeiten.
- CRM muss Legal-/Consent-/Funnel-/Runtime-Keys als gesperrt oder Admin-only behandeln.
- CRM darf Fallbacks nicht als editierbare Wahrheit anzeigen, ohne sie vorher in Supabase-Snapshot-Werte zu materialisieren.
- CRM muss Änderungen versionieren, diffen und rollbackfähig halten.

### 7.5 Nicht anfassen

- Runtime-Code
- UI-Komponenten
- Texte und Übersetzungen
- Consent-Mechanik
- Supabase-Daten
- SQL/Migrationen
- Deployments
- Kromen
- Template-/Hauptrepo-/E-Mail-Repo-Dateien
- Tarif-/Auftrags-/AI-Laufzeitdaten

## 8. Bestätigung für diese Dokumentationsänderung

Diese Datei ist ein reiner Plan. Sie führt keine Migration aus, schreibt keine Supabase-Daten, ändert keine Runtime, ändert keine UI, ändert keine Texte/Übersetzungen, ändert keine Consent-Logik, deployt nichts und berührt Kromen/Template/Hauptrepo/E-Mail-Repo nicht.
