# Ehiogie Client-Facing Config Audit

Stand: 2026-06-01  
Branch-Scope: `Ehiogie-Energieassistent-tn90CyE3XuYFTy4c1M3F` / Audit-Branch `codex/audit-ehiogie-client-facing-config-map`  
Audit-Art: reine Dokumentation. Es wurden keine UI-Texte, keine Runtime-Logik, keine Loader-Logik, keine Supabase-Daten und keine Migrationen geändert.

## 0. Executive Summary

Der aktuelle Webseitenstand ist **nur teilweise config-driven**:

- Die React-Webseite liest sichtbare Website-Texte überwiegend aus `src/lib/i18n.tsx` via `t(...)` oder aus direkt hardcodierten Komponenten-/Page-Arrays. Es gibt im untersuchten Branch **keine** `src/lib/websiteContentDefaults.ts`, `src/lib/customerDefaults.ts`, `src/lib/websiteConfig.tsx` oder `src/lib/websiteContentResolver.ts`.
- Die produktiven Loader `public/loaders/start.html` und `public/loaders/auftrag.html` lesen `kunden_config` aus Supabase, nutzen aber für die eigentliche Survey-Logik externe Engine-Skripte aus Runtime-/Bootstrap-URLs. Dieser Repo-Audit kann daher nur den Loader-Rahmen und die an die Engine übergebenen Werte bewerten, nicht die Engine-Inhalte selbst.
- `public/loaders/tarif.html` liest Angebotsdaten direkt aus `auftraege`, nutzt viele hardcodierte UI-Labels aus einem lokalen `I18N`-Objekt und client-facing KI-/Tariftexte aus `auftraege.ai_content` und weiteren Zeilenfeldern.
- Die Homepage-/Jahresrechnung-Texte sind nicht aus Supabase angebunden. Die gewünschte Remote-Priorität `kunden_config.webseite_content_config` existiert in diesem Repo-Code aktuell nicht als Leseweg.
- Es gibt mehrere Kromen-spezifische Brand-/Personenwerte im Ehiogie-relevanten Webseitenstand. Besonders `sections.about.person_name` ist als Ziel-Key noch nicht vorhanden; im Repo-Fallback steht aktuell **nicht** `Marvin Ehiogie`, sondern an mehreren Stellen `Marcel Kromen`/`Kromen Energieassistent`.

## 1. Repository-/Branch-Rollen

| Bereich | Rolle im Zielbild | Relevanz für diesen Audit | Status in diesem Task |
|---|---|---|---|
| Hauptrepo `oslau100/KI-Energieassistent` | Engines, Supabase Edge Functions, Loader-Backups/Referenzen und Systemdateien. | Nicht technische Wahrheit für die produktive Kundenwebseite dieses Tasks. | Nicht angefasst, nicht geprüft. |
| Webseitenrepo `oslau100/Webseiten-KI-Energieassistent` | Produktive Kundenbranches, produktive Loader und iframe-Seiten. | Audit-Quelle für diesen Task. | Nur Dokumentation ergänzt. |
| Branch `Ehiogie-Energieassistent-tn90CyE3XuYFTy4c1M3F` | Aktuell führender Produktions-/Arbeitsstand für die Website. | Base-/Referenzbranch für diesen Audit. | Ziel-PR soll gegen diese Branch gehen. |
| Kromen-Branch | Später technisch auf Ehiogie catch-up bringen. | Darf in diesem Task nicht verändert werden. | Nicht angefasst. |
| Branch `template` | Aktuell nicht produktive technische Wahrheit. Später aus stabilen Kundenbranches als Vorlage ableiten. | Darf nicht als Wahrheit für diesen Audit verwendet werden. | Nicht angefasst. |
| E-Mail-Repo `oslau100/E-Mails-KI-Energieassistent` | Aktuell deutsche Draft-/Vorlagenmails; später Grundlage für CRM-Sequenzen. | Nur Zielsystem-/Mapping-relevant. | Nicht angefasst. |

## 2. Aktive Website-Textquellen auf Ehiogie

### 2.1 Erwartete Config-Dateien vs. Repo-Realität

| Erwartete Datei | Gefunden? | Bedeutung |
|---|---:|---|
| `src/lib/websiteContentDefaults.ts` | Nein | Kein zentraler Website-Content-Fallback vorhanden. |
| `src/lib/customerDefaults.ts` | Nein | Kein kundenbezogener Repo-Fallback vorhanden. |
| `src/lib/websiteConfig.tsx` | Nein | Keine `getText`-/`getArray`-API im aktuellen Branch vorhanden. |
| `src/lib/websiteContentResolver.ts` | Nein | Kein Resolver für Remote-vor-Repo-vor-technischem-Fallback vorhanden. |
| `src/lib/i18n.tsx` | Ja | Aktuelle zentrale Quelle für einen Teil der sichtbaren Website-Texte und 12 Sprachvarianten. |

**Konsequenz:** Die im ursprünglichen PR-Ziel beschriebene Zielarchitektur (`getText(path, fallback, lang)`, `getArray(path, fallback)`, `kunden_config.webseite_content_config`) ist im untersuchten Webseitenstand noch nicht implementiert.

### 2.2 `src/lib/i18n.tsx`

| Aspekt | Befund |
|---|---|
| Client-facing? | Ja. Header, Hero, Footer, CookieBar, Rückruf-Titel, Homepage-Headlines und Jahresrechnung-FAQ/-Headlines werden hieraus gelesen. |
| Sprachen | 12 Sprachen: `de`, `en`, `tr`, `ru`, `ar`, `it`, `zh`, `hi`, `es`, `fr`, `nl`, `pl`. Arabisch setzt RTL. |
| Zugriffsmuster | Komponenten verwenden `t("key")`; `I18nProvider` priorisiert `annualFaqDictionaries`, dann `headlineDictionaries`, dann `dictionaries`, jeweils Sprache vor Deutsch-Fallback, danach Key-String. |
| Deutsch Source of Truth? | Praktisch ja: Deutsche Dictionaries sind Fallback, aber Übersetzungen sind separate String-Kopien und nicht aus einem Content-Key-System generiert. |
| Supabase? | Nein. Keine Supabase- oder `kunden_config`-Anbindung. |
| Risiko | Mittel bis hoch: Kundenspezifische Website-Copy ist im Code gebunden. Zahl-/Brand-Inkonsistenzen entstehen, weil Zahlen und Branding in mehreren Dictionaries und Komponenten wiederholt werden. |

### 2.3 Komponenten- und Page-Matrix

| Datei | Client-facing Inhalte | Quelle/Zugriff | Sprachen | Hardcoded Branding/Legal/Zahlen | Bewertung/Risiko |
|---|---|---|---|---|---|
| `src/components/Header.tsx` | Logo-Alt, Sprache wechseln, Header-CTA. | CTA via `t`; Screenreader-Text und Logo-Alt hardcoded; Sprache aus `LANGUAGES`. | CTA 12-sprachig; Alt/SR Deutsch/Kromen hardcoded. | `Kromen Energieassistent` im Logo-Alt. | P1: Header shared und kundenspezifisch; Brand muss config-driven werden. |
| `src/components/Hero.tsx` | Badge, Headline, Subline, CTA, Ergebnisnotiz, Bild-Alt. | Texte via `t`; Bild-URL und Alt hardcoded. | 12-sprachig für Textkeys. | Badge enthält `2.000`; Alt `Kromen Energieassistent`. | P0/P1: Hero ist zentrale Conversion-Copy; Zahl muss aus Stats/Content-Key kommen. |
| `src/components/Stats.tsx` | Drei KPI-Zahlen und Labels. | Komplett hardcoded mit `CountUp`. | Nur Deutsch. | `15000+`, `2000+`, `900000+ €`. | P0: Zahlen müssen zentrale Source of Truth werden. |
| `src/components/Problem.tsx` | Section-Headline und Problemkarten. | Headline via `t`; Karten-Array hardcoded. | Headline 12-sprachig; Karten nur Deutsch. | Keine direkten Namen; energiemarktbezogene Copy hardcoded. | P1: Marketing-Copy nicht kunden-/sprachfähig. |
| `src/components/Solution.tsx` | Headline, Nutzenkarten, CTA. | Headline/CTA via `t`; Karten hardcoded. | Headline/CTA 12-sprachig; Karten nur Deutsch. | Keine direkten Namen; Copy hardcoded. | P1. |
| `src/components/HowItWorks.tsx` | Headline, Prozessschritte, CTA. | Headline/CTA via `t`; Schritte hardcoded. | Headline/CTA 12-sprachig; Schritte nur Deutsch. | Keine direkten Namen. | P1. |
| `src/components/Comparison.tsx` | Vergleichsportale vs. Energieassistent, CTA. | Headline/CTA via `t`; Spaltenlabels und Bullet-Arrays hardcoded. | Headline/CTA 12-sprachig; Details nur Deutsch. | `Mit Energieassistent` hardcoded. | P1. |
| `src/components/Testimonials.tsx` | Kicker, Headline, Reviews, Namen, CTA. | Headline/CTA via `t`; Kicker und Reviews hardcoded. | Headline/CTA 12-sprachig; Reviews nur Deutsch. | Headline in i18n enthält `2000`; Review-Namen hardcoded. | P0/P1: konkrete Zahl-/Review-Copy muss zentralisiert und rechtlich freigegeben werden. |
| `src/components/About.tsx` | About-Headline, Foto-Alt, Social-Copy, Links, Name/Rolle/Bio. | Headline via `t`; alles andere hardcoded. | Headline 12-sprachig; Rest nur Deutsch. | `Marcel Kromen`, Social-Links, Foto-Alt `Marcel Kromen`. | P0 für Ehiogie: Personen-/Brandingwerte sind falsch für Whitelabel. Kein Fix in diesem PR. |
| `src/components/FAQ.tsx` | FAQ-Headline, FAQ-Liste, finale CTA. | Headline/finale CTA/Button via `t`; FAQ-Liste und Beschreibung hardcoded. | Teilweise 12-sprachig; FAQ nur Deutsch. | Keine Namen; Service-Claims hardcoded. | P1. |
| `src/components/Footer.tsx` | Logo, Copyright, Kontakt, Legal, Callback, Agentur-Badge. | Labels via `t`; Brand, Logo-Alt, Logos, Agentur-Link hardcoded. | Labels 12-sprachig; Brand/Alt nicht. | `Kromen Energieassistent`, Laurent-Digital-Badge. | P0/P1: Legal/Brand darf nicht kundenübergreifend hardcoded sein. |
| `src/components/SimpleHeader.tsx` | Einfaches Logo. | Bild-URL/Alt hardcoded. | Keine. | `Kromen Energieassistent`. | P1: iframe-Seiten zeigen shared Brand. |
| `src/components/SimpleFooter.tsx` | Copyright und Legal-Links. | Labels via `t`; Brand hardcoded. | Labels 12-sprachig; Brand nicht. | `Kromen Energieassistent`. | P1. |
| `src/components/CookieBar.tsx` | Cookie-Banner. | Texte via `t`; Consent-Key hardcoded. | 12-sprachig. | Keine Kundennamen. | P1/P2: Datenschutz-/Consent-Copy sollte Legal/Location-Config werden. |
| `src/pages/Jahresrechnung.tsx` | Komplette Jahresrechnung-Landingpage: Hero, Prozess, Value, Vergleich, Reviews, Stats, FAQ, CTA. | Einige Headlines/FAQ via `t`; sehr viele Absätze, Buttons, Listen, Reviews und Stats hardcoded. | Headlines/FAQ 12-sprachig; Rest nur Deutsch. | `2.000+`, `15.000+`, `900.000+ €`; Review-Namen; Energieassistent-Claims. | P0/P1: zweite Kern-Landingpage ist noch stark hardcoded. |
| `src/pages/Impressum.tsx` | Impressum/Anbieterangaben. | Hardcoded. | Deutsch. | Konkrete `Kromen`-/Adresse-/Kontakt-/USt-/Aufsichtsangaben. | P0 Legal: muss pro Kunde/Location geschützt und separat freigegeben werden. |
| `src/pages/Datenschutz.tsx` | Datenschutztext. | Hardcoded. | Deutsch. | Verantwortlicher/Adresse/Kontakt `Marcel Kromen`/Kromen-Werte. | P0 Legal. |
| `src/pages/RueckrufAnfordern.tsx` | Callback-Titel, Booking iframe. | Titel via `t`; iframe URL/ID/Title hardcoded. | Titel 12-sprachig; Kalender hardcoded. | LeadConnector Booking-ID hardcoded. | P1: Location-spezifischer Terminlink muss config-driven werden. |
| `src/pages/Start.tsx`, `Tarif.tsx`, `Auftrag.tsx` | iframe Wrapper. | iframe `src` zu Loader-Dateien plus Querystring. | Wrapper keine Copy außer Title. | iframe titles Deutsch hardcoded. | P2 Wrapper; eigentliche Copy in Loader/Engine. |
| `src/pages/NotFound.tsx` | 404-Seite. | Hardcoded + SimpleHeader/Footer. | Deutsch. | Brand im Footer/Header. | P2. |
| `src/pages/Uebermittelt.tsx` | Leerer Status-/Danke-Bereich. | Kein sichtbarer Text außer Header/Footer. | n/a | Brand im Header/Footer. | P2. |

### 2.4 Text-/Zahleninkonsistenzen

| Befund | Stellen | Risiko |
|---|---|---|
| Nutzerzahl `2.000`/`2000` wiederholt. | `hero_badge`, `home_testimonials_h2`, `annual_testimonials_h2`, `Stats`, `Jahresrechnung`-Stats. | Hoch: Wenn Ehiogie `1500+` bestätigt ist, entstehen sichtbare Widersprüche. |
| Schreibweise variiert. | `Über 2.000`, `Über 2000`, `2.000+`, `2000+`. | Mittel: Copy wirkt inkonsistent und erschwert spätere Automatisierung. |
| Stats liegen als Zahlen in Komponenten und als Text in i18n. | `Stats.tsx`, `Jahresrechnung.tsx`, `i18n.tsx`. | Hoch: Keine zentrale Source of Truth. |
| Brand `Kromen Energieassistent` in Ehiogie-Scope. | Header/Footer/SimpleFooter/Hero/About/Legal. | Hoch: Whitelabel- und Legal-Risiko. |
| Person `Marcel Kromen` in About/Legal. | About, Impressum, Datenschutz. | Hoch für Ehiogie. Kein Fix in diesem PR. |

## 3. Aktive Loader-/iframe-Textquellen im Webseitenrepo

### 3.1 Gefundene produktive Loader

| Erwartet/geprüft | Gefunden? | Bemerkung |
|---|---:|---|
| `public/loaders/start.html` | Ja | Setting-Survey-Loader. |
| `public/loaders/auftrag.html` | Ja | Closing-/Auftrag-Survey-Loader. |
| `public/loaders/tarif.html` | Ja | Angebots-/Tarifseite. |
| `public/loaders/rechnung.html` | Nein | Kein separater Rechnung-Loader im Repo vorhanden. Jahresrechnung nutzt derzeit `Start.tsx`/`start.html` für `/rechnungsprüfung` und `/rechnungspruefung`. |
| Weitere Loader | Nein | Unter `public/loaders` wurden nur die drei obigen HTML-Dateien gefunden. |

### 3.2 `public/loaders/start.html` - Setting Survey

| Kategorie | Befund |
|---|---|
| TB_BOOTSTRAP | Liest `locationId`, `supabaseUrl`, `supabaseKey`, `settingEngineUrl`, `closingEngineUrl`, `settingProxyPath`, `closingProxyPath`, `offerUrl`, `auftragUrl`, `startUrl`, `avatarUrl` aus `{{ custom_values.* }}`. |
| Query-Parameter | `location_id` kann `TB_BOOTSTRAP.locationId` ersetzen. Andere URL-Parameter werden in diesem Loader-Rahmen nicht als Content genutzt. |
| Supabase Runtime Fetch | `supabase.createClient(...).from('kunden_config').select('*').eq('location_id', config.locationId).single()`. Lesen, kein Schreiben. |
| Verwendete Supabase-Spalten/JSON-Pfade | `kunden_config.runtime_config.avatar_url`, `runtime_config.setting_proxy_path`, `runtime_config.setting_engine_url`, `url_config.offer_base_url`, `setting_survey_design.*`, `setting_survey_design.start_button.bg_color`, `setting_survey_design.start_button.text_color`, `setting_survey_design.back_button.bg_color`, `setting_survey_design.back_button.text_color`. |
| Engine-Übergabe | Setzt `window.KUNDEN_DATA = data` und `window.SURVEY_CONFIG = {...}`; lädt dann `engineUrl` per `fetch` und hängt das externe Skript in `document.body` ein. |
| Hardcoded Texte im Loader-Rahmen | `Fehler beim Laden.`, technische Error-Meldungen, CSS-/Klassen-Namen; initial Spinner ohne Copy. CSS enthält Consent-/Language-Klassen, aber keine finalen Survey-Fragetexte im Repo-Rahmen. |
| Client-facing Quelle der eigentlichen Fragen | Nicht im Webseitenrepo-Loader selbst. Vermutlich im externen Setting-Engine-Skript und/oder in `window.KUNDEN_DATA`-Config. Dieser Audit hat keine externe Engine abgefragt. |
| Customer-/Location-spezifisch geschützt | `location_id`, Supabase URL/Anon Key, Runtime-URLs, Avatar URL, Offer URL, Designfarben und Buttonfarben. |
| Risiko bei Änderung | Hoch: Start-Loader ist produktiver Einstieg; Runtime-URL- oder Designpfad-Änderungen können Survey vollständig brechen. |

### 3.3 `public/loaders/auftrag.html` - Closing/Auftrag Survey

| Kategorie | Befund |
|---|---|
| TB_BOOTSTRAP | Gleiche Bootstrap-Gruppe wie `start.html`, nutzt hier besonders `closingEngineUrl`, `closingProxyPath`, `offerUrl`, `locationId`, Supabase URL/Key. |
| Query-Parameter | `lang` und `uuid` werden als Overrides gelesen und in `config.langOverride`/`config.uuidOverride` gesetzt. |
| Supabase Runtime Fetch | `kunden_config.select('*').eq('location_id', config.locationId).single()`. Lesen, kein Schreiben. |
| Verwendete Supabase-Spalten/JSON-Pfade | `runtime_config.closing_engine_url`, `runtime_config.closing_proxy_path`, `url_config.offer_base_url`, `closing_survey_design` mit Fallback auf `setting_survey_design`; Designpfade u. a. `primary_color`, `bg_card`, `text_color`, `text_color_strong`, `border_radius`, `back_button.bg_color`, `back_button.text_color`, `start_button.bg_color`, `start_button.text_color`, `card_border_color`, `card_bg_color`, `progress_color`, `progress_bg_color`. |
| Engine-Übergabe | Setzt `window.KUNDEN_DATA`, `window.SURVEY_CONFIG`, lädt externes `engineUrl`-Skript. |
| Hardcoded Texte im Loader-Rahmen | Initial `Loading…`, Error-Fallback mit `Bitte Seite neu laden oder später erneut versuchen.`, technische Error-Meldungen. |
| Client-facing Quelle der eigentlichen Fragen | Nicht im Loader-Rahmen. Externe Closing-Engine und/oder `window.KUNDEN_DATA`. |
| Customer-/Location-spezifisch geschützt | Closing-Engine-/Proxy-URL, Offer URL, Designwerte, UUID-/Language-Weitergabe. |
| Risiko bei Änderung | Hoch: Closing-/Auftrag-Prozess ist Conversion-kritisch; keine Loader-Logik ohne separaten Test-PR ändern. |

### 3.4 `public/loaders/tarif.html` - Offer/Tarif Page

| Kategorie | Befund |
|---|---|
| TB_BOOTSTRAP | Liest Supabase URL/Key sowie URL-Pfade `offerUrl`, `auftragUrl`, `startUrl`; `locationId` ist im Bootstrap vorhanden, wird in der Tariflogik aber nicht für `kunden_config` gelesen. |
| Query-Parameter | `uuid` oder `submission_id` sind erforderlich; `lang` überschreibt/fokussiert Sprache. |
| Supabase Runtime Fetch | Liest direkt aus `auftraege`: `from("auftraege").select("*")`, Filter nach `uuid` oder `submission_id`, `limit(1)`. Lesen, kein Schreiben. |
| Verwendete Row-Felder | `language`, `ai_content`, `ai_usecase`, `usecase`, `verbrauchstyp`, `sparte`, `ersparnis`, `vorname`, `provider_current`, `tariff_provider`, `tariff_name`, `laufzeit_monate`, `preisgarantie_text`, `plz`, `verbrauch`, `consumption_kwh`, `monthly_current`, `alt_jahreskosten`, `jahreskosten`, `monatsabschlag`, `oekotarif`. |
| AI-/JSON-Pfade | `row.ai_content` wird via `safeJson` gelesen; `pickAiBlock` bevorzugt sprach-/usecase-spezifische Blöcke und nutzt Felder wie `fazit`, `status`, `warum`, `hinweise`, `zusammenfassung`. |
| Hardcoded Texte | Großes lokales `I18N`-Objekt für Angebotsseite mit Labels/CTA/Modal-/Metatexten, Error-Fallbacks `Fehlende URL-Parameter...`, `Kein Auftrag gefunden.`, `Konnte Daten nicht laden.`, `Fehler`, Platzhalter `—`, Bullet `Schneller digitaler Wechsel möglich`/entsprechende Übersetzungen. |
| Aus TB_BOOTSTRAP | `auftragUrl` und `startUrl` werden als Zielpfade für CTA/Ändern-Links genutzt; Supabase URL/Key für Fetch. |
| Aus Query-Parametern | `uuid`, `submission_id`, `lang`. |
| Aus Supabase | Angebotspreise, Provider-/Tarifname, KI-Zusammenfassung, Usecase, Verbrauch/PLZ und Sprache. |
| Customer-/Location-spezifisch geschützt | Supabase-Verbindung, UUID/submission IDs, personenbezogene/vertragsbezogene Auftragsdaten, KI-Angebotscopy, Tarifdaten, Anbieter-/Preiswerte. |
| Risiko bei Änderung | Hoch: Direkte Angebotsseite mit personenbezogenen Daten und conversion-kritischem CTA. Hardcoded I18N sollte später in `offer_copy_templates` oder vergleichbarem Config-System landen, aber nicht ohne separaten PR. |

## 4. Supabase-Config-Nutzung aus Code-Sicht

### 4.1 Gefundene Supabase-Lesezugriffe

| Key/Spalte/Pfad | Datei | Codepfad/Funktion | Lesen/Schreiben | Client-facing Auswirkung | Fallback-Verhalten | Risiko bei Änderung |
|---|---|---|---|---|---|---|
| `kunden_config` | `public/loaders/start.html` | Loader-IIFE nach Bootstrap-Validierung | Lesen | Lädt Runtime-/Design-/Engine-Config für Setting Survey. | Fehlerseite `Fehler beim Laden.` bei Fehler. | Hoch. |
| `kunden_config.runtime_config.avatar_url` | `public/loaders/start.html` | `window.SURVEY_CONFIG.avatarUrl` | Lesen | Avatar/Personenbild in externer Survey-Engine möglich. | Bootstrap `avatarUrl`, sonst leer. | Mittel/Hoch: Branding. |
| `kunden_config.runtime_config.setting_proxy_path` | `public/loaders/start.html` | `window.SURVEY_CONFIG.settingProxyPath` | Lesen | Engine-/Proxy-Aufrufpfad für Setting Survey. | Bootstrap `settingProxyPath`, sonst leer. | Hoch. |
| `kunden_config.runtime_config.setting_engine_url` | `public/loaders/start.html` | `engineUrl` Fetch | Lesen | Lädt produktive Survey-Engine. | Bootstrap `settingEngineUrl`; Fehler, wenn leer. | Hoch. |
| `kunden_config.url_config.offer_base_url` | `public/loaders/start.html` | `window.SURVEY_CONFIG.offerUrl` | Lesen | Ziel-URL nach Setting Survey/Offer. | Bootstrap `offerUrl`, sonst leer. | Hoch. |
| `kunden_config.setting_survey_design.primary_color` | `public/loaders/start.html` | CSS-Variable `--primary-color` | Lesen | Survey-Primärfarbe. | `#00ff9d`. | Mittel. |
| `kunden_config.setting_survey_design.bg_card` | `public/loaders/start.html` | CSS-Variable `--bg-card` | Lesen | Survey-Kartenhintergrund. | `#ffffff`. | Mittel. |
| `kunden_config.setting_survey_design.text_color` | `public/loaders/start.html` | CSS-Variable `--text-color` | Lesen | Survey-Textfarbe. | `#334155`. | Mittel. |
| `kunden_config.setting_survey_design.border_radius` | `public/loaders/start.html` | CSS-Variable `--border-radius` | Lesen | Survey-Rundungen. | `2.5rem`. | Niedrig/Mittel. |
| `kunden_config.setting_survey_design.start_button.bg_color` | `public/loaders/start.html` | CSS-Variable `--btn-bg` | Lesen | CTA/Button-Hintergrund. | `#0f172a`. | Mittel. |
| `kunden_config.setting_survey_design.start_button.text_color` | `public/loaders/start.html` | CSS-Variable `--btn-text` | Lesen | CTA/Button-Textfarbe. | `#00ff9d`. | Mittel. |
| `kunden_config.setting_survey_design.back_button.bg_color` | `public/loaders/start.html` | CSS-Variable `--back-bg` | Lesen | Zurück-Button-Hintergrund. | `transparent`. | Niedrig/Mittel. |
| `kunden_config.setting_survey_design.back_button.text_color` | `public/loaders/start.html` | CSS-Variable `--back-text` | Lesen | Zurück-Button-Textfarbe. | `#94a3b8`. | Niedrig/Mittel. |
| `kunden_config.runtime_config.closing_engine_url` | `public/loaders/auftrag.html` | `engineUrl` Fetch | Lesen | Lädt Closing-Engine. | Bootstrap `closingEngineUrl`; Fehler, wenn leer. | Hoch. |
| `kunden_config.runtime_config.closing_proxy_path` | `public/loaders/auftrag.html` | `window.SURVEY_CONFIG.closingProxyPath` | Lesen | Closing-Proxy-Aufrufpfad. | Bootstrap `closingProxyPath`, sonst leer. | Hoch. |
| `kunden_config.url_config.offer_base_url` | `public/loaders/auftrag.html` | `window.SURVEY_CONFIG.offerUrl` | Lesen | Angebotsziel aus Closing-Kontext. | Bootstrap `offerUrl`, sonst leer. | Hoch. |
| `kunden_config.closing_survey_design` | `public/loaders/auftrag.html` | `applyDesignVars` | Lesen | Closing-Survey-Design. | Fallback auf `setting_survey_design`, dann CSS-Defaults. | Mittel/Hoch. |
| `kunden_config.setting_survey_design` | `public/loaders/auftrag.html` | Fallback für `closing_survey_design` | Lesen | Closing-Design, falls keine Closing-spezifische Config. | CSS-Defaults. | Mittel. |
| `auftraege` | `public/loaders/tarif.html` | Angebotsseiten-IIFE | Lesen | Lädt Angebots-/Tarifdaten. | Fehlertexte im UI. | Hoch. |
| `auftraege.ai_content` | `public/loaders/tarif.html` | `safeJson`, `pickAiBlock`, `buildKiSummaryText` | Lesen | KI-Fazit, Status, Gründe, Hinweise/Zusammenfassung. | `—` oder zusammengesetzte Fallbacks. | Hoch: direkt sichtbar und sprach-/usecase-spezifisch. |
| `auftraege.language` | `public/loaders/tarif.html` | `getLang(qp.get("lang") || row.language || "de")` | Lesen | Angebotsseiten-Sprache. | Query `lang`, dann Row, dann Deutsch. | Mittel. |
| `auftraege.* Tarif-/Kundendaten` | `public/loaders/tarif.html` | Render-Vergleich/Modal/Bullets | Lesen | Anbieter, Preise, PLZ, Verbrauch, Laufzeit, Ersparnis. | `—`, berechnete Werte, lokale Label-Fallbacks. | Hoch. |

### 4.2 Nicht gefundene oder nur indirekt mögliche Supabase-Keys

| Angefragter Key | Befund im Webseitenrepo | Einordnung |
|---|---|---|
| `setting_survey_logic` | Nicht direkt referenziert. | Kann in externer Setting-Engine oder `window.KUNDEN_DATA` genutzt werden, aber nicht im Loader-Code dieses Repos. |
| `setting_language_config` | Nicht direkt referenziert. | Nicht im Repo-Loader ausgewertet. |
| `setting_consent_text` | Nicht direkt referenziert. | CSS-Klassen für Consent vorhanden, Textlogik wahrscheinlich extern. |
| `closing_survey_logic` | Nicht direkt referenziert. | Wahrscheinlich externe Closing-Engine. |
| `closing_consent_text` | Nicht direkt referenziert. | Nicht im Loader-Rahmen. |
| `offer_copy_templates` | Nicht gefunden. | Angebotsseiten-Labels sind aktuell lokal in `tarif.html`; KI-Copy kommt aus `auftraege.ai_content`. |
| `ai_offer_content` | Nicht gefunden. | Stattdessen `auftraege.ai_content`. |
| `design_config` | Nicht gefunden. | Website-Design wird nicht aus Supabase gelesen; Loader nutzen `setting_survey_design`/`closing_survey_design`. |
| `webseite_content_config` | Nicht gefunden. | Kritischer Gap: Website-Copy liest aktuell nicht aus Supabase. |
| `webseite_design_config` | Nicht gefunden. | Nicht angebunden. |
| `webseite_layout_config` | Nicht gefunden. | Nicht angebunden. |
| `privat_strom_1..3`, `privat_gas_1..3` | Nicht gefunden. | Alte Tarif-Prioritätsspalten sind in diesem Webseitenrepo-Stand nicht referenziert. |

### 4.3 Schreiboperationen

Im untersuchten Webseitenrepo wurden für Supabase keine `insert`, `update`, `upsert`, `delete` oder `rpc`-Schreibpfade gefunden. Die Loader lesen `kunden_config` bzw. `auftraege`; dieses Audit hat keine Supabase-Abfrage ausgeführt und keine Supabase-Schreiboperation vorgenommen.

## 5. Ziel-Mapping für ein einheitliches Config-/Content-System

| Bereich | Aktueller Speicherort im Repo | Aktuelle Supabase-Spalte | Aktueller JSON-Pfad | Gewünschter Zielpfad | Sprache | Priorität | Risiko |
|---|---|---|---|---|---|---:|---|
| Website global | `src/lib/i18n.tsx`, Header/Footer/Simple* hardcoded | Kein Supabase-Wert | n/a | `kunden_config.webseite_content_config.shared.*` | 12-sprachig für Copy; Brand single/locale-aware | P0 | Hoch |
| Website Hero | `Hero.tsx`, `i18n.tsx` | Kein Supabase-Wert | n/a | `webseite_content_config.pages.home.hero.*` | 12-sprachig | P0 | Hoch |
| Website Stats | `Stats.tsx`, `Jahresrechnung.tsx`, `i18n.tsx` | Kein Supabase-Wert | n/a | `webseite_content_config.shared.stats.{tariffs_checked,households,savings}` | Zahlen single + labels 12-sprachig | P0 | Hoch |
| Homepage Sections | Problem/Solution/HowItWorks/Comparison/Testimonials/About/FAQ | Kein Supabase-Wert | n/a | `webseite_content_config.pages.home.sections.*` | 12-sprachig; Reviews ggf. single approved + translations | P1 | Mittel/Hoch |
| About/Person | `About.tsx`, Legal Pages | Kein Supabase-Wert | n/a | `webseite_content_config.shared.person.*` oder `location_profile.*` | Name/Links single; Bio 12-sprachig | P0 | Hoch |
| Legal | `Impressum.tsx`, `Datenschutz.tsx`, CookieBar | Kein Supabase-Wert | n/a | `kunden_config.legal_config.*` und `setting_consent_text`/`webseite_content_config.legal.*` | Primär Deutsch, später 12-sprachig falls rechtlich freigegeben | P0 | Sehr hoch |
| Header/Footer | `Header.tsx`, `Footer.tsx`, `SimpleHeader.tsx`, `SimpleFooter.tsx` | Kein Supabase-Wert | n/a | `webseite_content_config.shared.header.*`, `.footer.*`, `webseite_design_config.brand_assets.*` | 12-sprachig Labels, Brand assets single | P0/P1 | Hoch |
| Callback | `RueckrufAnfordern.tsx` | Kein Supabase-Wert | n/a | `url_config.callback_booking_url`, `webseite_content_config.pages.callback.*` | 12-sprachig Title | P1 | Mittel/Hoch |
| Setting Survey | `public/loaders/start.html` + externe Engine | `kunden_config` | `runtime_config.*`, `url_config.offer_base_url`, `setting_survey_design.*`; Logic/Text im Repo nicht direkt | `setting_survey_logic`, `setting_language_config`, `setting_consent_text`, `setting_survey_design` klar versionieren | 12-sprachig | P0 | Hoch |
| Closing Survey | `public/loaders/auftrag.html` + externe Engine | `kunden_config` | `runtime_config.*`, `url_config.offer_base_url`, `closing_survey_design.*` fallback `setting_survey_design` | `closing_survey_logic`, `closing_consent_text`, `closing_survey_design` klar versionieren | 12-sprachig | P0 | Hoch |
| Rechnung Survey | Kein eigener `rechnung.html`; Route `/rechnungsprüfung` nutzt `Start.tsx`/`start.html` | Indirekt wie Setting Survey | Indirekt | Separater Usecase in `setting_survey_logic` oder eigener `rechnung_survey_logic`-Pfad | 12-sprachig | P1 | Mittel/Hoch |
| Offer Page | `public/loaders/tarif.html` | `auftraege` | `ai_content`, Row-Felder; kein `offer_copy_templates` | `kunden_config.offer_copy_templates.*` + `auftraege.ai_content` nur für dynamische Ergebnisse | 12-sprachig | P0/P1 | Hoch |
| Loader URLs | `TB_BOOTSTRAP` + `runtime_config`/`url_config` | `kunden_config` | `runtime_config.*`, `url_config.*` | `url_config.{start_url,offer_base_url,auftrag_url,callback_booking_url}` + Runtime getrennt | single | P0 | Hoch |
| E-Mail später | Nicht in diesem Repo | E-Mail-Repo noch Drafts | n/a | CRM-Template-System mit `crm_email_templates.*` und shared customer/location profile | Deutsch zuerst, später 12-sprachig optional | P1/P2 | Mittel/Hoch |

## 6. Spezieller Befund: About-Name / Übersetzungen

### 6.1 Erwartung

Für Ehiogie sollte der Repo-Fallback für `sections.about.person_name` später **`Marvin Ehiogie`** sein. Dieser Audit sollte nur prüfen und dokumentieren, nicht korrigieren.

### 6.2 Repo-Befund

| Suche/Bereich | Befund |
|---|---|
| `sections.about.person_name` | Im Repo nicht vorhanden, weil es kein Website-Content-Key-System gibt. |
| `Marvin Ehiogie` | Im Repo nicht gefunden. |
| `Marcel Kromen` | In `About.tsx`, `Impressum.tsx` und `Datenschutz.tsx` vorhanden. |
| `Kromen Energieassistent` / `Kromen Energy Assistant` | In Header-/Footer-Alttexten, Hero-Alttext, i18n-Headlines und Legal-/Brand-Kontexten vorhanden. |
| Social Links | In `About.tsx` hardcoded auf Kromen-/Marcel-Kromen-Profile. |
| Legal-Verantwortlicher | In `Impressum.tsx`/`Datenschutz.tsx` hardcoded. |

### 6.3 Bewertung

Das ist ein P0-Whitelabel-Befund, aber kein Textfix für diesen Dokumentations-PR. Die nächsten PRs sollten zunächst eine config-driven Person-/Brand-/Legal-Struktur einführen und danach kundenbezogene Werte nur über Config/Defaults austauschen.

## 7. Nicht geändert / bewusst außerhalb Scope

- Keine Textkorrektur.
- Keine Übersetzung verbessert oder geändert.
- Keine sichtbare UI geändert.
- Keine Supabase-Migration.
- Kein SQL.
- Keine Supabase-Abfrage ausgeführt.
- Keine Supabase-Schreiboperation.
- Keine Loader-Logik geändert.
- Keine Runtime-Codeänderung.
- Keine Secrets eingefügt.
- Keine Service-Role-Keys verwendet.
- Kromen-Branch nicht angefasst.
- `template`-Branch nicht angefasst.
- E-Mail-Repo nicht angefasst.
- Hauptrepo nicht angefasst.
- Kein Deploy.

## 8. Ergebnis / Empfehlung

### 8.1 Empfohlene nächste PRs

1. **PR 1 - WebsiteConfig/Content-Resolver einführen**  
   Neue Dateien wie `src/lib/websiteContentDefaults.ts`, `src/lib/customerDefaults.ts`, `src/lib/websiteConfig.tsx`, `src/lib/websiteContentResolver.ts` einführen. Ziel: Remote `kunden_config.webseite_content_config` vor Repo-Fallback vor technischem Komponenten-Fallback. Noch keine großen Copy-Änderungen, nur Infrastruktur und Tests.

2. **PR 2 - Homepage config-driven machen**  
   Hero, Stats, Problem, Solution, HowItWorks, Comparison, Testimonials, About und FAQ auf `getText`/`getArray` migrieren. Zahlen wie Haushalte/Prüfungen/Ersparnis nur noch aus einer zentralen Stats-Struktur lesen.

3. **PR 3 - Jahresrechnung config-driven machen**  
   Alle sichtbaren `/jahresrechnung`-Texte, Reviews, Stats, CTA- und FAQ-Blöcke in Ziel-Keys überführen. Mobile Review-/Carousel-Design dabei nicht verändern.

4. **PR 4 - Shared Brand/Legal/Header/Footer/Callback absichern**  
   Brand Assets, Personendaten, Social Links, Footer, SimpleHeader/SimpleFooter, Cookie-/Legal-/Callback-Werte in eine geschützte Customer-/Location-/Legal-Config überführen. Impressum/Datenschutz nur mit rechtlicher Freigabe pro Kunde austauschen.

5. **PR 5 - Loader/Offer/Survey Copy Mapping für CRM vorbereiten**  
   `offer_copy_templates`, Survey-Language-/Consent-/Logic-Strukturen und CRM-Mail-Template-Zielpfade dokumentieren/verdrahten. `tarif.html`-I18N langfristig aus Config lesen lassen; `ai_content` nur für dynamische KI-Ergebnisse nutzen.

### 8.2 Zwingend vor dem CRM-Issue erledigen

- Zentrale Customer-/Location-Profile definieren: Brandname, Person, Legal Entity, Kontakt, Assets, Social Links, Booking URLs.
- Website-Content-Key-Struktur finalisieren und für Ehiogie/Kromen getrennte Defaults/Remote-Overrides ermöglichen.
- Stats-Zahlen und Testimonials-/Review-Claims zentralisieren und freigeben.
- Legal-/Consent-Zuständigkeit klären: welche Texte dürfen übersetzt/config-driven sein und welche müssen rechtlich fixiert werden.
- Survey-/Offer-Zielpfade abstimmen, damit CRM-Mails dieselben Kunden-/Location-/Offer-Daten referenzieren können.

### 8.3 Optional nach CRM-Start nachziehbar

- Vollständige 12-Sprachen-Pflege aller langen Marketing- und Legal-Texte.
- Admin-/Editor-UI für `webseite_content_config` und CRM-Templates.
- Automatisierte Screenshot-/Visual-Regression-Prüfungen pro Kundenbranch.
- Schema-/Typvalidierung für alle JSON-Config-Pfade.
- Vereinheitlichung alter Loader-Backups/Referenzen in anderen Repos nach Stabilisierung der produktiven Kundenbranches.
