# Ehiogie Client-Facing Config Audit v2

**Branch-/Scope-Annahme:** Dieser Audit basiert auf dem im Arbeitsbaum vorliegenden Ehiogie-Stand für `location_id = tn90CyE3XuYFTy4c1M3F`. Der Template-Branch, PR #88, das Hauptrepo `KI-Energieassistent`, das E-Mail-Repo und Kromen wurden nicht als Source of Truth verwendet.

**Änderungsart:** reine Dokumentation. Es wurden keine Runtime-, UI-, Loader-, Supabase-, SQL-, Migrations- oder Textänderungen vorgenommen.

## 0. Executive Summary

- Die aktuelle Website besitzt bereits eine produktionsnahe Ehiogie-Website-Config-Schicht: `src/lib/websiteConfig.tsx` existiert und liest optional `webseite_design_config`, `webseite_content_config` und `webseite_layout_config` aus `public.kunden_config`; Repo-Fallbacks kommen aus `src/lib/customerDefaults.ts` und `src/lib/websiteContentDefaults.ts`.
- `src/lib/websiteContentResolver.ts` existiert und stellt Deep-Merge, Pfadauflösung, `resolveLocalizedText`, Array-/Objektauflösung und Template-Interpolation bereit.
- `src/lib/i18n.tsx` existiert und liefert weiterhin eigenständige 12-sprachige Dictionaries für Header/Footer, Statusseiten und viele Headline-Fallbacks. Dadurch gibt es aktuell zwei parallele Textsysteme: Website-Content-Config und i18n-Dictionaries.
- Die produktiven Loader liegen im Webseitenrepo unter `public/loaders/*.html`. Sie enthalten harte Ehiogie-Bootstrap-Werte inklusive Supabase-Projekt, anon key, Engine-/Proxy-URLs, Domain-URLs und Avatar-Assets.
- Die Website-App nutzt Supabase clientseitig nur für `kunden_config.webseite_*`. Die Loader nutzen Supabase direkter und breiter: `kunden_config`, `design_config`, `url_config`, `runtime_config`, Legacy-Survey-Design-Spalten und fachliche Tabellen wie `auftraege`.
- Legal-/Datenschutz-/Cookie-/NotFound- und Teile der Jahresrechnung-/Status-Copy sind noch stark hardcoded bzw. nur teilweise konfigurierbar. Das ist vor CRM-/Whitelabel-Einführung das größte Konsistenz- und Mandantenrisiko.

## 1. Aktuelle Config-Schichten

| Schicht | Datei | Funktion | Client-facing? | Supabase? | Fallback-Verhalten | Risiko |
|---|---|---:|---:|---:|---|---|
| Website Config Provider | `src/lib/websiteConfig.tsx` | Runtime-Kontext für `content`, `design`, `layout`; liest Query, `TB_BOOTSTRAP` und Env; fetch auf `kunden_config` | Ja | Ja, `webseite_*` | Repo-Fallback aus Kunden-Defaults, wenn Runtime-Daten fehlen/Fehler auftreten | Mittel: Query-Parameter können Supabase URL/Key überschreiben; nur Website-Spalten werden gelesen |
| Ehiogie Core Defaults | `src/lib/customerDefaults.ts` | Farben, Assets, Layout-Reihenfolge, Re-Export Content | Ja | Nein | Statischer Ehiogie-Fallback | Hoch für Whitelabel: harte Ehiogie-Asset-URLs und Layout-Defaults |
| Website Content Defaults | `src/lib/websiteContentDefaults.ts` | Brand, Legal-Variablen, Hero, Solution, About, Links, Testimonials, Stats, FAQ etc. | Ja | Nein | Statische deutsch/teilweise mehrsprachige Fallbacks | Hoch: viele CRM-/Mandantenwerte im Repo |
| Resolver | `src/lib/websiteContentResolver.ts` | Merge und Lookup: `getText`, `getArray`, `getObject`, Interpolation | Indirekt | Nein | Localized lookup fällt auf `de`, dann ersten String, dann Fallback zurück | Mittel: fehlende Keys fallen still auf Deutsch oder Code-Fallback zurück |
| i18n | `src/lib/i18n.tsx` | 12-sprachige App-Dictionaries, Sprachrouting, `t`, `withLang` | Ja | Nein | Deutsch/Dictionary-Fallback | Hoch: doppelte Textpflege neben `webseite_content_config` |
| Loader Bootstrap | `public/loaders/start.html`, `auftrag.html`, `rechnung.html`, `tarif.html` | Eigenständige HTML-Bootstraps für Survey/Angebot | Ja | Ja | Harte Ehiogie-Werte, dann `kunden_config` Runtime/Design | Hoch: produktive Pfade/Keys hart im Loader |

## 2. Website-Textquellen-Audit

### 2.1 Header

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Header-Logo und Alt | Ja | Teilweise | Nein | `getText("brand.name")`, `design.assets.logo_header` | Ja, via `webseite_content_config`/`webseite_design_config` | `Energieassistent`, Ehiogie-Asset aus Defaults | Brand-Name aktuell nicht multilingual | Mittel | Hoch |
| Sprachumschalter | Ja | Teilweise | Ja | `getText("header.language_switch_sr")` plus i18n-Sprachliste | Nur indirekt | i18n/Code-Fallback | 12 Sprachen für Labels/Sprachrouting | Niedrig | Mittel |
| Header-CTA | Ja | Nein | Ja | `t("header_check_bill")` / `t("header_check_savings")` | Nein | i18n-Dictionary | 12-sprachig | Mittel wegen separater i18n-Pflege | Mittel |

**Befund:** Header ist hybrid. Branding kommt aus Website-Config, CTA-Texte kommen aus `i18n`. Für Unified Config sollte Header vollständig unter `webseite_content_config.navigation/header` und `webseite_design_config.assets` gemappt werden.

### 2.2 Footer

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Footer Logo/Brand | Ja | Teilweise | Nein | `getText("brand.name")`, `design.assets.logo_footer` | Ja | Ehiogie-Assets/Brand-Fallback | Nein | Mittel | Hoch |
| Rechte/Kontakt/Legal-Labels | Ja | Nein | Ja | `t("footer_*")` | Nein | i18n | 12-sprachig | Mittel | Mittel |
| Rückruf-Link | Ja | Route hardcoded | Ja | i18n Label | Nein | `/rueckruf-anfordern` | 12-sprachiges Label, Route nicht | Mittel | Hoch |
| Legal Links | Ja | Route hardcoded | Ja | i18n Label | Nein | `/datenschutz`, `/impressum` | 12-sprachige Labels, Seiten selbst Deutsch | Hoch | Hoch |
| Agency Logo/URL | Ja | Teilweise | Nein | `getText("brand.agency_url")`, `design.assets.agency_logo`, `getText("brand.agency_alt")` | Ja | Laurent Digital Defaults | Nein | Mittel | Mittel |

**Befund:** Footer ist als Whitelabel-Fläche relevant, aber Labels und Routen sind verteilt. Legal-Zielseiten sind nicht multilingual und müssen vor CRM geklärt werden.

### 2.3 Hero

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Badge, Headline, Subline, CTA, Result Note | Ja | Nein | i18n nur als Fallback | `getText("sections.hero.*", ..., lang)` | Ja | `websiteContentDefaults` plus i18n fallback | Ja, 12 Sprachen in `sections.hero` | Mittel | Hoch |
| Hero-Bild | Ja | Ja in Fallback | Nein | `design.assets.hero_image`, `getText("sections.hero.image_alt")` | Ja | Ehiogie CDN-Asset | Alt nur Deutsch/neutral | Hoch | Hoch |
| Zielroute CTA | Ja | Route hardcoded | Nein | Nein | Nein | `/start` | Route nicht multilingual | Mittel | Hoch |

**Befund:** Hero ist der am weitesten migrierte Bereich: Content ist bereits 12-sprachig in Website-Config-Fallbacks und Supabase-fähig. Asset- und Routing-Werte bleiben Whitelabel-relevant.

### 2.4 About

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Section Headline | Ja | Nein | Ja | Nein | Nein | `t("home_about_h2")` | 12-sprachig in i18n | Mittel | Mittel |
| Person, Rolle, Social Hint, Paragraphs | Ja | Nein im Component, hart im Default | Nein | `getText("sections.about.*", ..., lang)` | Ja | Ehiogie/Marvin-Defaults | Faktisch Deutsch, kein 12-Sprachobjekt | Hoch | Hoch |
| Avatar | Ja | Hart im Default | Nein | `getText("sections.about.avatar_url")` | Ja | Ehiogie CDN-URL | Nein | Hoch | Hoch |
| Social Links | Ja | Hart im Default | Nein | Objektwerte aus `sections.about.social` | Ja, wenn überschrieben | YouTube/Facebook/TikTok/Instagram Ehiogie | Nein | Hoch | Hoch |

**Befund:** About ist CRM-/Whitelabel-kritisch, weil Person, Bio, Avatar und Social Links direkt Mandantenidentität abbilden. Mehrsprachigkeit ist derzeit nur Headline-seitig sauber.

### 2.5 Testimonials

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Home Kicker/Headline | Ja | Teilweise | Headline teils i18n fallback | `getText("sections.testimonials.*")` | Ja | Ehiogie Defaults | Deutsch/Fallback | Mittel | Hoch |
| Home Reviews | Ja | Nein im Component, hart im Default | Nein | `getArray("sections.testimonials.home_reviews")` | Ja | Drei deutsche Beispielreviews | Nein | Hoch | Hoch |
| Jahresrechnung Reviews | Ja | Nein im Component, hart im Default | Nein | `getArray("sections.jahresrechnung.reviews")` | Ja | Drei deutsche Beispielreviews | Nein | Hoch | Hoch |

**Befund:** Reviews sind stark Whitelabel- und Compliance-relevant. Sie sollten vor CRM als strukturierte, tenant-spezifische, freigabefähige Inhalte modelliert werden.

### 2.6 FAQ

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Home FAQ Headline | Ja | Nein | Ja | Nein | Nein | `t("home_faq_h2")` | 12-sprachig | Mittel | Mittel |
| Home FAQ Items | Ja | Nein im Component, hart im Default | Nein | `getArray("sections.faq.home_items")` | Ja | Deutsche FAQs | Nein | Hoch | Hoch |
| Jahresrechnung FAQ Items | Ja | Component-Fallbacks | Nein | `getArray("sections.jahresrechnung.faqs")` | Ja | Deutsche Component-/Config-Fallbacks | Nein | Hoch | Hoch |

**Befund:** FAQ ist inhaltlich mandanten- und rechtsnah. Aktuell sind Headline und Items in unterschiedlichen Systemen gepflegt.

### 2.7 CTA-Blöcke

| Bereich | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Hero/Solution/Comparison CTA | Ja | Route hardcoded | Teils i18n fallback | `getText("sections.*.cta_text")` | Ja | Deutsch/teilweise 12-sprachig | Hero 12-sprachig, andere meist Deutsch | Mittel | Hoch |
| Final CTA Home | Ja | Nein im Component/Default | Nein | `sections.final_cta.*` vorhanden, Nutzungsstatus prüfen bei nächster Code-PR | Ja, wenn konsumiert | Deutsch | Nein | Mittel | Hoch |
| Jahresrechnung CTAs | Ja | Route hardcoded | Headline teils i18n | `getText("sections.jahresrechnung.*")` | Ja | Deutsche Fallbacks | Teils nur Deutsch | Hoch | Hoch |

**Befund:** CTA-Texte, Zielrouten und Funnel-Zuordnung sollten gemeinsam in Unified Config, damit CRM später pro Kampagne/Use Case steuern kann.

### 2.8 Jahresrechnung

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Headline-Struktur | Ja | Teilweise | Ja | Teils `getText` | Teils | i18n Headline-Dictionaries und deutsche `getText` Fallbacks | Headline 12-sprachig, Body oft Deutsch | Hoch | Hoch |
| Process/Why/Value/Comparison | Ja | Component-Fallbacks und Config-Fallbacks | Teils | `getArray`/`getText` unter `sections.jahresrechnung.*` | Ja | Deutsch | Überwiegend Nein | Hoch | Hoch |
| Reviews/FAQ/Final CTA | Ja | Teilweise | Teils | `getArray`/`getText` | Ja | Deutsch | Überwiegend Nein | Hoch | Hoch |
| Loader Route | Ja | Route hardcoded | Nein | Nein | Nein | `/rechnung` → `public/loaders/rechnung.html` | Nein | Hoch | Hoch |

**Befund:** Jahresrechnung ist funktional angebunden, aber textarchitektonisch noch nicht auf demselben multilingualen Niveau wie Hero/Status/i18n.

### 2.9 Impressum

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Legal Variablen | Ja | Fallback hart | Nein | `getText("legal.variables.*")` | Ja | Ehiogie Firma/Inhaber/Adresse/E-Mail/Telefon | Nein | Hoch | P0 |
| Vollständiges HTML Override | Ja | Nein | Nein | `getText("pages.impressum.html")` | Ja | Wenn gesetzt, interpoliert | Abhängig vom Override | Mittel | P0 |
| Legal Fließtexte/Überschriften | Ja | Ja | Nein | Nein außer Variablen | Nein | Deutsche Texte im Component | Nein | Hoch | P0 |
| Umsatzsteuer-ID Platzhalter | Ja | Ja | Nein | Nein | Nein | `[wird ergänzt]` | Nein | Hoch | P0 |

**Befund:** Impressum ist vor CRM/Whitelabel zwingend zu zentralisieren oder pro Tenant rechtlich freizugeben.

### 2.10 Datenschutz

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Legal Variablen | Ja | Fallback hart | Nein | `getText("legal.variables.*")` | Ja | Ehiogie Werte | Nein | Hoch | P0 |
| Vollständiges HTML Override | Ja | Nein | Nein | `getText("pages.datenschutz.html")` | Ja | Wenn gesetzt, interpoliert | Abhängig vom Override | Mittel | P0 |
| Datenschutz-Fließtexte | Ja | Ja | Nein | Nein außer Variablen | Nein | Deutsche DSGVO-Texte im Component | Nein | Hoch | P0 |

**Befund:** Datenschutz ist legal-kritisch und derzeit überwiegend deutsch/hardcoded. Für Unified Config braucht es entweder freigegebene HTML-Blöcke pro Tenant oder ein legales Content-Modell.

### 2.11 CookieBar

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Cookie-Hinweis/Buttons | Ja | Ja/Dictionary | Ja, je nach Implementation | Nicht als Website-Config identifiziert | Nein | Lokale Texte/i18n | Nicht als Supabase-Config | Mittel | Hoch |
| Consent State | Ja/technisch | Local hardcoded key wahrscheinlich | Nein | Nein | Nein | Browser State | Nein | Mittel | Hoch |

**Befund:** Cookie-/Consent-Texte sind in der Website-App nicht an `setting_consent_text` oder `closing_consent_text` angebunden. Späteres CRM/Tracking braucht eine zentrale Consent-Konfiguration.

### 2.12 Callback / Rückruf

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| Titel/Beschreibung/Disabled Text | Ja | Nein im Component, hart im Default | Nein | `getText("sections.callback.*")` | Ja | Deutsch | Nein | Hoch | Hoch |
| Calendar URL | Ja/technisch | Leer im Default | Nein | `getText("sections.callback.calendar_url")` | Ja | deaktivierter Zustand | Nein | Hoch: externe GHL/Calendly-ID später Mandantenwert | P0/P1 |
| Embed Script | Ja/technisch | Ja, dynamisch eingefügt | Nein | Nein | Nur URL aus Config | Lädt nur bei URL | Nein | Mittel | Hoch |

**Befund:** Rückruf ist CRM-nah. Calendar/GHL/Calendly-IDs dürfen nicht im Code landen und gehören in Unified Config/CRM Integration.

### 2.13 NotFound

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| 404, Text, Link | Ja | Ja | Nein | Nein | Nein | Deutsch im Component | Nein | Niedrig/Mittel | Mittel |

**Befund:** Nicht kritisch für Funnel, aber sichtbarer Whitelabel-Randbereich. Sollte in `pages.not_found` wandern.

### 2.14 Tarifseiten

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| `/tarif` React Page | Ja | iframe title | Nein | Nein | Nein direkt | Lädt `/loaders/tarif.html` | Nein | Mittel | Hoch |
| `tarif.html` Angebotsseite | Ja | Bootstrap/Labels teilweise hart | Ja, internes Loader-I18N | Nein | Ja | Supabase `auftraege`, `kunden_config.design_config`, row `ai_content` | Mehrsprachig über Loader-I18N und `ai_content` fallback auf de | Hoch | P0 |
| Angebots-KI-Copy | Ja | Nein/DB-getrieben | Nein in React | Nein | Ja, row `ai_content`, potentiell `ai_offer_content` upstream | DB-/Row-Fallback | abhängig vom Row-Payload | Hoch | P0 |

**Befund:** Tarifseite ist produktiver Abschluss-/Angebots-Funnel und muss vor CRM in das Zielmapping aufgenommen werden. Der Loader ist eigenständig und nicht vom React-Website-Provider gesteuert.

### 2.15 Survey-Seiten

| Quelle | client-facing | hardcoded | i18n | getText/getArray | Supabase | Fallback | multilingual | Risiko | CRM-/Whitelabel-Relevanz |
|---|---:|---:|---:|---:|---:|---|---:|---|---:|
| `/start` | Ja | iframe title + loader path | Nein | Nein | Loader ja | `public/loaders/start.html` | Loader/Engine abhängig | Hoch | P0 |
| `/auftrag` | Ja | iframe title + loader path | Nein | Nein | Loader ja | `public/loaders/auftrag.html` | Loader/Engine abhängig | Hoch | P0 |
| `/rechnung` | Ja | iframe title + loader path | Nein | Nein | Loader ja | `public/loaders/rechnung.html` | Loader/Engine abhängig | Hoch | P0 |
| Statusseiten | Ja | Nein | Ja | Nein | Nein | `i18n` Status-Dictionaries | 12-sprachig | Mittel | Hoch |

**Befund:** Survey-Seiten sind derzeit iframe-Wrapper; die produktive Logik liegt in Loadern/externen Engine-Skripten.

## 3. Supabase-Config-Nutzung

### 3.1 Aktive Supabase-Zugriffe in der React-Website

| Datei | Codepfad | Supabase-Key/Spalte | Nutzung | Client-facing Auswirkung | Fallback | Risiko |
|---|---|---|---|---|---|---|
| `src/lib/websiteConfig.tsx` | `WebsiteConfigProvider` → Runtime Query/Bootstrap/Env → REST Fetch `kunden_config` | `webseite_design_config`, `webseite_content_config`, `webseite_layout_config` | Merge über `resolveWebsiteConfig` | Website-Texte, Assets, Farben, Layout-Config | Falls URL/Key/Row/Response fehlen: Repo-Fallback | Mittel/Hoch: clientseitiger fetch, Query kann Supabase URL/Key setzen, nur read |
| `src/lib/websiteConfig.tsx` | CSS Variable Effect | `webseite_design_config.colors` | Setzt `--website-primary`, `--website-bg`, `--website-text` | Branding/Farbwirkung | Default-Farben | Mittel |

### 3.2 Aktive Supabase-Zugriffe in Loadern

| Datei | Codepfad | Supabase-Key/Spalte/Tabelle | Nutzung | Client-facing Auswirkung | Fallback | Risiko |
|---|---|---|---|---|---|---|
| `public/loaders/start.html` | `TB_BOOTSTRAP` → `supabase.createClient` → `kunden_config.select('*').eq('location_id')` | `kunden_config`, `runtime_config`, `url_config`, `design_config`, `setting_survey_design` | Start-Survey Runtime, Engine, Proxy, Offer URL, Design | Start-Funnel Darstellung und Weiterleitung | Harte Bootstrap-Werte; Legacy-Design-Fallback | Hoch: harte Keys/URLs; produktiver Funnel |
| `public/loaders/auftrag.html` | Bootstrap → `kunden_config.select('*')` | `runtime_config`, `url_config`, `design_config`, `closing_survey_design`, `setting_survey_design` | Closing-Survey Runtime, Engine, Proxy, Offer URL, Design | Auftrag-/Abschluss-Funnel | Harte Bootstrap-Werte; Legacy-Design-Fallback | Hoch |
| `public/loaders/rechnung.html` | analoger Loader/Engine-Bootstrap | Erwartet Invoice-/Setting-/Closing-nahe Runtime/Design-Konfig | Jahresrechnung Upload/Funnel | Rechnungs-Funnel | Harte Bootstrap-Werte/Engine | Hoch |
| `public/loaders/tarif.html` | Bootstrap → Supabase client | `kunden_config.design_config`, `auftraege`, row `ai_content`, row tariff fields | Angebotsseite, Tarifdaten, KI-Fazit, CTA-URLs | Sehr hoch: Angebotstexte, Preise, Anbieter, CTA | Loader-I18N, row-/German fallback | P0-Risiko |

### 3.3 Gesuchte Config-Keys: Befundmatrix

| Gesuchter Key | Aktiver Zugriff gefunden? | Dateien | Nutzung/Befund | Client-facing | Fallback/Risiko |
|---|---:|---|---|---:|---|
| `design_config` | Ja | `public/loaders/start.html`, `auftrag.html`, `tarif.html` | Loader-Design; teils `brand`/`survey` Struktur | Ja | Legacy-Fallbacks; nicht identisch mit `webseite_design_config` |
| `url_config` | Ja | `public/loaders/start.html`, `auftrag.html` | `offer_base_url` für Weiterleitung | Ja | Bootstrap-URLs; Domain-Risiko |
| `ai_offer_content` | Kein direkter Zugriff im Webseitenrepo gefunden | — | Angebotscopy kommt im Tarifloader aus `auftraege.ai_content`; upstream könnte Mainrepo/Edge Function relevant sein | Ja, indirekt | Für CRM-Mapping als Angebotscopy-Quelle vorsehen |
| `offer_copy_templates` | Kein direkter Zugriff im Webseitenrepo gefunden | — | Keine aktive Website-/Loader-Lesestelle im aktuellen Stand | Potenziell | Zielsystem-P1/P2, sobald Engine/Edge angebunden |
| `setting_survey_logic` | Kein direkter Zugriff im Loader-Wrapper gefunden | Externe Engine wahrscheinlich | Start-Engine wird extern geladen; Logic liegt nicht im Wrapper-Code | Ja | Mainrepo/Engine-Audit nötig |
| `setting_survey_design` | Ja | `start.html`, `auftrag.html` als Legacy/Fallback | Legacy Design-Fallback | Ja | Doppelstruktur zu `design_config.survey` |
| `setting_language_config` | Kein direkter Zugriff im Wrapper gefunden | Externe Engine wahrscheinlich | Sprache im Startloader über Engine/URL/Config möglich | Ja | Engine-Audit nötig |
| `setting_consent_text` | Kein direkter Zugriff im Wrapper gefunden | Externe Engine möglich | Consent nicht im Website-Provider integriert | Ja | P0/P1 für CRM Consent |
| `closing_survey_logic` | Kein direkter Zugriff im Wrapper gefunden | Externe Engine wahrscheinlich | Abschlusslogik in externer Engine | Ja | Engine-Audit nötig |
| `closing_survey_design` | Ja | `auftrag.html` | Legacy/Fallback Design | Ja | Doppelstruktur zu `design_config.survey` |
| `closing_consent_text` | Kein direkter Zugriff im Wrapper gefunden | Externe Engine möglich | Consent nicht im Website-Provider integriert | Ja | P0/P1 |
| `webseite_content_config` | Ja | `src/lib/websiteConfig.tsx` | Website-Content Overrides | Ja | Repo-Fallback bei Fehler |
| `webseite_design_config` | Ja | `src/lib/websiteConfig.tsx` | Website-Design Overrides | Ja | Repo-Fallback bei Fehler |
| `webseite_layout_config` | Ja | `src/lib/websiteConfig.tsx` | Website-Layout Overrides | Indirekt/derzeit begrenzt | Repo-Fallback; Layout wird nicht überall dynamisch konsumiert |

## 4. Loader-/Iframe-System

### 4.1 React iframe-Wege

| Route | React-Datei | iframe `src` | Query-Weitergabe | Height-Handling | Footer/Header | Risiko |
|---|---|---|---:|---|---|---|
| `/start` | `src/pages/Start.tsx` | `/loaders/start.html${location.search}` | Ja | same-origin `contentDocument` + `ResizeObserver` | SimpleFooter | Query-Parameter werden direkt an Loader weitergereicht |
| `/auftrag` | `src/pages/Auftrag.tsx` | `/loaders/auftrag.html${location.search}` | Ja | same-origin `contentDocument` + `ResizeObserver` | SimpleFooter | Abschluss-Funnel von Loader abhängig |
| `/rechnung` | `src/pages/Rechnung.tsx` | `/loaders/rechnung.html${location.search}` | Ja | same-origin `contentDocument` + `ResizeObserver` | SimpleFooter | Rechnungs-Funnel von Loader abhängig |
| `/tarif` | `src/pages/Tarif.tsx` | `/loaders/tarif.html${location.search}` | Ja | same-origin `contentDocument` + `ResizeObserver` | SimpleFooter | Angebot/Preise/CTA von Loader abhängig |

### 4.2 Loader-Bootstrap und Runtime-Fetches

| Loader | Query-Parameter | `TB_BOOTSTRAP` | Runtime-Fetches | Supabase-Zugriffe | externe Engine/Skripte | iframe/Navigation | Branding-/Location-Risiken |
|---|---|---|---|---|---|---|---|
| `start.html` | liest mindestens `location_id` indirekt/Config, URL Search Params; Engine kann weitere Survey-Parameter nutzen | harte `locationId`, `supabaseUrl`, `supabaseKey`, `settingEngineUrl`, `closingEngineUrl`, `settingProxyPath`, `closingProxyPath`, `offerUrl`, `auftragUrl`, `startUrl`, `avatarUrl` | Fetch `settingEngineUrl` mit Cachebuster | `kunden_config.select('*')`; liest `runtime_config`, `url_config`, `design_config`, `setting_survey_design` | Supabase JS CDN, Google Fonts, externes Setting-Engine-JS aus Supabase Storage | Läuft im React iframe; Engine steuert UI/Weiterleitung | Ehiogie-Domain, Supabase-Projekt, anon key, avatar hardcoded |
| `auftrag.html` | liest `lang`, `uuid`; evtl. Engine weitere Params | harte Ehiogie/Supabase/Engine/Proxy/URL/Avatar Werte | Fetch `closingEngineUrl` mit Cachebuster | `kunden_config.select('*')`; liest `runtime_config`, `url_config`, `design_config`, `closing_survey_design`, `setting_survey_design` | Supabase JS CDN, Google Fonts, externes Closing-Engine-JS | Läuft im iframe; Closing-Engine | Gleiche Bootstrap-Risiken, plus Abschluss-Funnel |
| `rechnung.html` | Rechnungs-/Upload-Parameter werden an Loader/Engine weitergereicht | harte Ehiogie/Supabase/Engine/Proxy/URL/Avatar Werte | Rechnungs-/Survey-Engine abhängig | Supabase-Zugriff im Loader/Engine-Kontext | Supabase JS CDN/Google Fonts/Engine | iframe | Gleiche Bootstrap-Risiken; Jahresrechnung-Copy und Consent klären |
| `tarif.html` | `uuid`, `submission_id`, `lang` | harte `locationId`, `supabaseUrl`, `supabaseKey`, `auftragUrl`, `startUrl` etc. | Kein externes Engine-JS, aber direkte DB-Ladepfade | `kunden_config.design_config`, Tabelle `auftraege`, row `ai_content` | Supabase JS CDN, Google Fonts | Links werden per Top-Navigation auf `/auftrag` und `/start` gebaut | Höchstes Risiko: Angebotsdaten, Preise, Anbieter, KI-Copy, CTA-Domains |

## 5. Branding-/Hardcoding-Audit

### 5.1 Kromen-Werte

| Suchwert | Befund im aktuellen Ehiogie-Runtime-Pfad | Risiko | Zielpfad |
|---|---|---|---|
| `Kromen` / `Marcel Kromen` / `Kromen Energieassistent` | Keine aktive Ehiogie-Website-/Loader-Quelle als Produktivwert identifiziert; vorhandene Treffer liegen in Docs/Supabase-Kromen-Seeddateien und sollen nicht angefasst werden | Niedrig für Ehiogie, aber Kromen-Catch-up später separat | Separater Kromen-Catch-up PR, nicht dieser Audit |

### 5.2 Ehiogie-/Mandanten-Hardcodings

| Datei | Wert/Typ | Risiko | späterer Zielpfad im Unified Config System |
|---|---|---|---|
| `src/lib/websiteConfig.tsx` | `locationId: tn90CyE3XuYFTy4c1M3F`, `customer: ehiogie` | Tenant-Fallback im Code | `tenant.location_id`, `tenant.slug`, Deployment-/Runtime-Bootstrap |
| `src/lib/customerDefaults.ts` | Farben `#2563eb`, Assets `logo_header`, `logo_footer`, `hero_image`, `agency_logo` | Whitelabel-Branding im Repo | `webseite_design_config.colors/assets` bzw. `unified_config.brand.assets` |
| `src/lib/websiteContentDefaults.ts` | `Ehiogie Energieassistent`, `marvin@...`, `Marvin Ehiogie`, Adresse, Telefon | P0 Legal/CRM | `tenant.brand`, `tenant.legal`, `crm.sender/contact` |
| `src/lib/websiteContentDefaults.ts` | Social Links YouTube/Facebook/TikTok/Instagram | Mandantenidentität | `tenant.social_profiles` |
| `src/lib/websiteContentDefaults.ts` | Zahlen: 1.500 Nutzer, 10.000 Prüfungen, 600.000 € Ersparnis; teils Component-Fallbacks 2.000/15.000/900.000 | Marketing-/Compliance-Risiko und Inkonsistenz | `webseite_content_config.metrics` mit Freigabestatus |
| `src/lib/websiteContentDefaults.ts` | Domains `https://www.ehiogie-energieassistent.de/...` | Domain-/Routing-Risiko | `url_config.website`, `url_config.routes`, `tenant.domains` |
| `public/loaders/*.html` | Supabase-Projekt-URL, anon key, Engine-/Proxy-URLs, Domain-URLs, Avatar-URL | P0 produktiver Funnel; falscher Tenant/Projekt möglich | `loader_bootstrap`, `runtime_config`, Secret-/public-key Management, tenant domain config |
| `src/pages/Impressum.tsx` | Deutsche Rechtstexte, USt-ID Platzhalter | P0 Legal | `pages.impressum.html` oder Legal CMS/CRM Template |
| `src/pages/Datenschutz.tsx` | Deutsche Datenschutztexte | P0 Legal/Consent | `pages.datenschutz.html`, `consent/legal_config` |
| `src/pages/NotFound.tsx` | Deutsche 404 Copy | Niedrig/Mittel | `pages.not_found` |
| `index.html` | Meta Title/Description/Author/OG/Twitter/Canonical Ehiogie | SEO/Whitelabel | `seo_config` / deployment-specific HTML transform |

## 6. Multilingual-Status

| Bereich | Status | Source of Truth aktuell | Inkonsistenzrisiko |
|---|---|---|---|
| Sprachrouting/Language Switch | 12 Sprachen | `src/lib/i18n.tsx` | Mittel: getrennt von Supabase-Config |
| Header/Footer Labels | 12 Sprachen | `src/lib/i18n.tsx` | Mittel |
| Statusseiten Auftrag/Fehler/Rechnung-Fehler | 12 Sprachen | `src/lib/i18n.tsx` | Mittel: nicht CRM-/Supabase-konfigurierbar |
| Headline-Dictionaries für Home/Jahresrechnung | 12 Sprachen | `src/lib/i18n.tsx` | Hoch: Headline teils i18n, Body teils Website-Config |
| Hero | 12 Sprachen | `src/lib/websiteContentDefaults.ts` und optional `webseite_content_config` | Mittel: Fallback zusätzlich i18n |
| About | überwiegend Deutsch | `websiteContentDefaults.sections.about` | Hoch |
| Problem/Solution/HowItWorks/Comparison | überwiegend Deutsch, teils Arrays können sprachspezifisch unter `${path}.${lang}` aufgelöst werden | Website-Config + Code-Fallbacks | Hoch |
| Testimonials/Stats/FAQ | überwiegend Deutsch | Website-Config-Fallbacks | Hoch |
| Jahresrechnung Body/Arrays/FAQ/Reviews | überwiegend Deutsch | Website-Config + Component-Fallbacks | Hoch |
| Impressum/Datenschutz/Cookie/NotFound | Deutsch | Components bzw. mögliche HTML Overrides | Hoch/P0 für Legal |
| Loader Start/Auftrag | Engine-abhängig; Wrapper selbst deutsch/fallback | Externe Engine + Loader-Fallbacks | Hoch, weil Engine nicht im Website-Provider lebt |
| Tarifloader | internes I18N + row `ai_content`, Fallback auf Deutsch | `public/loaders/tarif.html` + DB Row | Hoch |

**Deutsch als faktische Source of Truth:** Legal, Datenschutz, About, Reviews, FAQ, Stats, Jahresrechnung-Bodies, Loader-Fallback-Fehlertexte und viele Component-Fallbacks. 12-sprachige Texte sind vorhanden, aber nicht einheitlich zentralisiert.

## 7. Zielarchitektur-Mapping

| Bereich | Aktuelle Quelle | Aktuelle Datei | Supabase-Key | JSON-Pfad | multilingual? | hardcoded? | Zielsystem | Priorität | CRM-relevant? | Risiko |
|---|---|---|---|---|---:|---:|---|---|---:|---|
| Tenant Identität | Code-Fallback | `websiteConfig.tsx`, `websiteContentDefaults.ts` | `kunden_config.location_id` | `tenant.*` | Nein | Ja | Unified Tenant Config | P0 | Ja | Hoch |
| Brand Name/Contact | Website Content Defaults | `websiteContentDefaults.ts` | `webseite_content_config` | `brand.*` | Nein | Fallback ja | Unified Brand/CRM Contact | P0 | Ja | Hoch |
| Legal Variablen | Website Content Defaults + Components | `websiteContentDefaults.ts`, `Impressum.tsx`, `Datenschutz.tsx` | `webseite_content_config` | `legal.variables.*` | Nein | Ja | Legal Config/CMS | P0 | Ja | Hoch |
| Impressum HTML | optional Config Override | `Impressum.tsx` | `webseite_content_config` | `pages.impressum.html` | abhängig | Fallback ja | Legal Content Store | P0 | Nein/indirekt | Hoch |
| Datenschutz HTML | optional Config Override | `Datenschutz.tsx` | `webseite_content_config` | `pages.datenschutz.html` | abhängig | Fallback ja | Legal/Consent Content Store | P0 | Ja | Hoch |
| Header | i18n + Website Config | `Header.tsx`, `i18n.tsx` | `webseite_content_config`, `webseite_design_config` | `navigation.header.*`, `brand.*`, `assets.logo_header` | Teilweise | Teilweise | Website Unified Config | P1 | Ja | Mittel |
| Footer | i18n + Website Config | `Footer.tsx` | `webseite_content_config`, `webseite_design_config` | `navigation.footer.*`, `brand.*`, `legal.links`, `assets.logo_footer` | Teilweise | Teilweise | Website Unified Config | P1 | Ja | Mittel/Hoch |
| SEO Metadata | Static HTML | `index.html` | keiner | `seo.*` | Nein | Ja | Deployment SEO Config | P1 | Nein | Mittel |
| Hero | Website Content Config | `Hero.tsx`, `websiteContentDefaults.ts` | `webseite_content_config` | `sections.hero.*` | Ja | Assets ja | Website Content Config | P1 | Ja | Mittel |
| Assets/Farben | Customer Defaults + Supabase | `customerDefaults.ts`, `websiteConfig.tsx` | `webseite_design_config` | `colors.*`, `assets.*` | Nein | Fallback ja | Brand Design Config | P0/P1 | Ja | Hoch |
| About | Website Content Config | `About.tsx`, `websiteContentDefaults.ts` | `webseite_content_config` | `sections.about.*` | Nein/teilweise capable | Fallback ja | CRM Profile/Website Content | P0 | Ja | Hoch |
| Social Links | Website Content Defaults | `About.tsx`, `websiteContentDefaults.ts` | `webseite_content_config` | `sections.about.social.*` | Nein | Fallback ja | CRM/Social Profiles | P1 | Ja | Hoch |
| Problem/Solution | Website Content Config | `Problem.tsx`, `Solution.tsx` | `webseite_content_config` | `sections.problem.*`, `sections.solution.*` | Teilweise capable | Fallback ja | Website Content Config | P1 | Ja | Mittel |
| How It Works | Website Content Config | `HowItWorks.tsx` | `webseite_content_config` | `sections.how_it_works.*` | Teilweise capable | Fallback ja | Website Content Config | P1 | Ja | Mittel |
| Comparison | Website Content Config | `Comparison.tsx` | `webseite_content_config` | `sections.comparison.*` | Teilweise capable | Fallback ja | Website Content Config | P1 | Ja | Mittel |
| Testimonials | Website Content Config | `Testimonials.tsx`, `Jahresrechnung.tsx` | `webseite_content_config` | `sections.testimonials.*`, `sections.jahresrechnung.reviews` | Nein | Fallback ja | Approved Testimonials Store | P1 | Ja | Hoch |
| Stats/Metrics | Website Content Config + Component Fallback | `Stats.tsx`, `websiteContentDefaults.ts` | `webseite_content_config` | `sections.stats.*` | Nein | Ja | Marketing Metrics Config | P1 | Ja | Hoch |
| FAQ | Website Content Config + i18n headline | `FAQ.tsx`, `Jahresrechnung.tsx` | `webseite_content_config` | `sections.faq.*`, `sections.jahresrechnung.faqs` | Nein/partial | Fallback ja | FAQ/Knowledge Config | P1 | Ja | Hoch |
| Jahresrechnung Page | i18n + Website Config | `Jahresrechnung.tsx` | `webseite_content_config` | `sections.jahresrechnung.*` | Teilweise | Teilweise | Website Content Config | P1 | Ja | Hoch |
| Callback | Website Content Config | `RueckrufAnfordern.tsx` | `webseite_content_config` | `sections.callback.*` | Nein | Fallback ja | CRM Scheduling Config | P0/P1 | Ja | Hoch |
| Cookie/Consent | Component/local + Engine unknown | `CookieBar.tsx`, Loader/Engine | potenziell `setting_consent_text`, `closing_consent_text` | `consent.*` | unklar | Ja | Consent Config | P0 | Ja | Hoch |
| Start Survey | Loader + external Engine | `Start.tsx`, `public/loaders/start.html` | `kunden_config`, `design_config`, `url_config`, `runtime_config`, `setting_survey_*` | `survey.setting.*` | Engine-abhängig | Ja Bootstrap | Survey Runtime Config | P0 | Ja | Hoch |
| Closing Survey | Loader + external Engine | `Auftrag.tsx`, `public/loaders/auftrag.html` | `kunden_config`, `design_config`, `url_config`, `runtime_config`, `closing_survey_*` | `survey.closing.*` | Engine-abhängig | Ja Bootstrap | Survey Runtime Config | P0 | Ja | Hoch |
| Rechnung Survey | Loader + external Engine | `Rechnung.tsx`, `public/loaders/rechnung.html` | Loader/Engine Config | `survey.invoice.*` | Engine-abhängig | Ja Bootstrap | Survey Runtime Config | P0 | Ja | Hoch |
| Tarif/Offer Page | Loader + DB Rows | `Tarif.tsx`, `public/loaders/tarif.html` | `auftraege`, `kunden_config.design_config`, row `ai_content` | `offer.*`, `offer.ai_content.*` | Ja/partial | Ja Bootstrap | Offer/CRM Config + Offer DB | P0 | Ja | Hoch |
| Statusseiten | i18n | `AuftragEingegangen.tsx`, `Fehler.tsx`, `FehlerRechnung.tsx`, `i18n.tsx` | keiner | `status_pages.*` | Ja | Nein/Dictionary | Website Content Config | P1 | Ja | Mittel |
| NotFound | Component | `NotFound.tsx` | keiner | `pages.not_found.*` | Nein | Ja | Website Content Config | P2 | Nein | Niedrig/Mittel |

## 8. Empfehlungen und Folge-PRs

### 8.1 Zwingend vor CRM / Unified Config

1. **P0 Legal Config PR:** Impressum und Datenschutz vollständig als tenant-spezifische, freigegebene Config/HTML-Quelle definieren; Fallbacks auditieren; keine Platzhalter wie USt-ID ungeklärt lassen.
2. **P0 Loader Bootstrap PR:** `public/loaders/*.html` Bootstrap-Werte inventarisieren und auf ein sicheres, tenantbezogenes Bootstrap-Modell mappen; Supabase-Projekt, anon key, Engine-/Proxy-URLs, Domain-URLs und Avatar-URLs nicht mehr verteilt pro Loader pflegen.
3. **P0 Survey/Engine Config Contract PR:** Externe Engines/Mainrepo gegen aktuelle Loader-Kontrakte auditieren: `setting_survey_logic`, `setting_language_config`, `setting_consent_text`, `closing_survey_logic`, `closing_consent_text`, `ai_offer_content`, `offer_copy_templates`.
4. **P0 Callback/CRM Scheduling PR:** `sections.callback.calendar_url` und spätere GHL/Calendly IDs als CRM-/Tenant-Config modellieren.
5. **P0 Offer/Tarif Mapping PR:** Tarifloader-Datenquellen (`auftraege`, `ai_content`, URLs, CTA-Ziele, Design) in Unified Config/CRM-Angebotsmodell überführen.

### 8.2 Sinnvoll direkt nach P0

1. **P1 Website Content Consolidation PR:** i18n-Headlines und `webseite_content_config` zusammenführen oder klare Ownership definieren, damit Texte nicht doppelt gepflegt werden.
2. **P1 Multilingual Completion PR:** About, FAQ, Testimonials, Stats, Jahresrechnung-Bodies und CTA-Blöcke auf ein einheitliches 12-sprachiges Content-Schema bringen.
3. **P1 Branding/Assets PR:** Logos, Hero-/Avatar-/Agency-Assets, Social Links, Domains, SEO und Metriken in `webseite_design_config`/`webseite_content_config` bzw. Unified Brand Config konsolidieren.
4. **P1 Consent PR:** CookieBar und Survey-Consent-Texte gegen zentrale Consent-Config mappen.

### 8.3 Nach CRM verschiebbar

1. **P2 NotFound/Minor Utility Copy:** 404 und kleine Randtexte zentralisieren.
2. **P2 Layout Dynamisierung:** `webseite_layout_config` stärker in tatsächliche Section-Reihenfolge/Visibility einbinden, falls produktseitig benötigt.
3. **P2 Copy Polish:** Textqualität/Übersetzungen optimieren, aber erst nach sauberer Ownership und Datenstruktur.

## 9. Bestätigung der Nicht-Änderungen

- Keine Runtime-Codeänderung.
- Keine UI-Änderung.
- Keine Text-/Übersetzungsänderung an bestehenden Runtime-Dateien.
- Keine Supabase-Schreiboperation.
- Keine Migration, kein SQL, kein Deploy.
- Keine Loader-Logikänderung.
- Kromen, Template, Hauptrepo und E-Mail-Repo wurden nicht verändert.
