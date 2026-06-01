# Ehiogie Config Acceptance Check vor CRM-Start

**Scope:** finaler Acceptance-Check für den im Arbeitsbaum vorliegenden Ehiogie-Stand (`location_id = tn90CyE3XuYFTy4c1M3F`) vor Start der CRM-Foundation-Arbeit.

**Grundlagen:**

- `docs/ehiogie-client-facing-config-audit-v2.md`
- `docs/unified-config-architecture.md`
- `docs/pre-crm-cleanup-plan.md`

**Änderungsart:** reine Dokumentation. Dieser Check ändert keine Runtime, keine UI, keine sichtbaren Texte, keine Supabase-Daten, keine Migrationen, kein SQL, keine Loader-Logik, keine Deploys und keine Kromen-/Template-/Hauptrepo-/E-Mail-Repo-Dateien.

## 0. Executive Result

**Ampelstatus: 🟡 Go nur nach P0-Fixes.**

Ehiogie ist config-/whitelabel-seitig ausreichend weit, um die CRM-Foundation fachlich zu planen und gegen eine klare Zielarchitektur zu schneiden. Es gibt bereits eine Website-Config-Schicht mit Repo-Fallbacks, Supabase-Lesevorbereitung für `webseite_*_config`, Content-Resolver, Ehiogie-Defaults und produktive Loader-Bootstraps. Für einen stabilen CRM-Start fehlen aber noch P0-Entscheidungen/Fixes in Legal, Loader-/URL-Vertrag, Content-Key-Freeze und Survey-/Offer-Vertrag.

**Nicht akzeptabel vor CRM:** CRM-Schreiblogik oder CRM-UI gegen implizite, harte oder doppelte Quellen starten. Das würde die bestehenden parallelen Text-/Config-Systeme verfestigen und Whitelabel-Risiken in produktive Datenflüsse tragen.

**Go-Bedingung:** CRM Foundation darf starten, sobald die P0-Liste in Abschnitt 7.2 entschieden oder erledigt ist und klar dokumentiert ist, welche Werte CRM lesen, schreiben oder nur anzeigen darf.

## 1. Website Config Layer

| Prüffrage | Status | Befund | CRM-Relevanz | Entscheidung vor CRM |
|---|---:|---|---:|---|
| `websiteConfig.tsx` vorhanden? | ✅ Ja | `src/lib/websiteConfig.tsx` stellt Provider, Tenant-Fallback, `content`/`design`/`layout`, Query-/Bootstrap-/Env-Auflösung und Supabase-Read bereit. | P0 | Als technische Grundlage akzeptieren; keinen Umbau im Acceptance-PR. |
| `customerDefaults.ts` vorhanden? | ✅ Ja | `src/lib/customerDefaults.ts` bündelt Ehiogie-Design-/Layout-Fallbacks und re-exportiert Content-Defaults. | P0 | Als Repo-Fallback akzeptieren; harte Ehiogie-Werte als Whitelabel-Risiko dokumentieren. |
| `websiteContentDefaults.ts` vorhanden? | ✅ Ja | `src/lib/websiteContentDefaults.ts` enthält Brand-, Legal-, Section-, Link-, FAQ-, Stats- und Review-Fallbacks. | P0 | Als Fallback akzeptieren; CRM darf diese Datei nicht als editierbare Wahrheit behandeln. |
| `websiteContentResolver.ts` vorhanden? | ✅ Ja | Resolver liefert Deep-Merge, Pfadauflösung, lokalisierte Textauflösung, Array-/Objektauflösung und Template-Interpolation. | P0 | Als Resolver-Grundlage akzeptieren; fehlende Keys bleiben vor CRM sichtbar zu klassifizieren. |
| i18n parallel noch aktiv? | ⚠️ Ja | `src/lib/i18n.tsx` bleibt für Sprachrouting, Header-/Footer-/Status-Texte und mehrere Fallbacks aktiv. | P0/P1 | Vor CRM muss klar sein, welche i18n-Texte P0 sind und welche nach CRM migriert werden dürfen. |
| Fallback-Reihenfolge klar? | 🟡 Teilweise | Für Website-Config gilt praktisch: Runtime Query/`TB_BOOTSTRAP`/Env für Supabase-Zugang und Location, dann `kunden_config.webseite_*`, dann Repo-Fallbacks, dann Komponenten-/i18n-Fallbacks. | P0 | Als Vertrag schriftlich einfrieren; Komponenten-/i18n-Fallbacks nicht still als CRM-Quelle behandeln. |
| Supabase `webseite_*_config` lesbar vorbereitet? | ✅ Ja | Website-Provider liest `webseite_design_config`, `webseite_content_config`, `webseite_layout_config` aus `kunden_config` per anon key und `location_id`. | P0 | Leseweg akzeptiert; keine Supabase-Schreibannahmen ohne separaten CRM-Vertrag. |

### 1.1 Akzeptierte Fallback-Reihenfolge für CRM Foundation

Für die Website-App sollte die folgende Reihenfolge als Pre-CRM-Vertrag gelten:

1. **Runtime-Einstieg:** `location_id`/`locationId`, Supabase URL und Supabase anon key aus Query, `TB_BOOTSTRAP` oder Environment.
2. **Remote-Config:** `kunden_config.webseite_design_config`, `kunden_config.webseite_content_config`, `kunden_config.webseite_layout_config` für die konkrete Location.
3. **Repo-Fallback:** Ehiogie-Defaults aus `customerDefaults.ts` und `websiteContentDefaults.ts`.
4. **Resolver-Fallback:** lokalisierter Wert, dann `de`, dann erster String im Objekt, dann übergebener Fallback.
5. **Rest-Fallback:** i18n-Dictionary oder lokale Komponenten-Fallbacks.

**Acceptance-Hinweis:** CRM darf nur auf Ebene 2 arbeiten. Ebenen 3 bis 5 sind Sicherheitsnetze, keine redaktionelle Quelle.

## 2. Client-facing Content

### 2.1 Bereits config-driven oder config-vorbereitet

| Bereich | Heute config-driven? | Quelle | Rest-Risiko | CRM-Priorität |
|---|---:|---|---|---:|
| Brand-Name / Logo-Alt | ✅ Teilweise | `webseite_content_config.brand.*`, `webseite_design_config.assets.*`, Repo-Fallbacks | Nicht überall multilingual; Fallback ist Ehiogie-spezifisch. | P0 |
| Logo-/Asset-URLs Website | ✅ Teilweise | `webseite_design_config.assets.*`, `customerDefaults.ts` | Harte CDN-/Ehiogie-Fallbacks bleiben im Repo. | P0 |
| Hero | ✅ Weitgehend | `sections.hero.*` via `getText`, mit i18n-Fallbacks | i18n und Content-Config parallel. | P1, P0 nur falls falsche Live-Copy |
| Problem/Solution/How-it-works/Comparison | ✅ Weitgehend | `sections.*` via `getText`/`getArray` | Lokale Fallbacks und i18n-Fallbacks bleiben. | P1 |
| About / Social / Agency | ✅ Teilweise | `sections.about.*`, `brand.agency_*`, Design-Assets | Social-/Agency-Werte sind mandantenkritisch, aber nicht vollständig als Legal-/CRM-Vertrag eingefroren. | P0/P1 |
| Testimonials / Stats / FAQ | ✅ Teilweise | `sections.testimonials.*`, `sections.stats.*`, `sections.faq.*` | Review-/FAQ-Arrays können je Sprache/Reihenfolge abweichen; lokale Fallbacks. | P1 |
| Jahresrechnung-Section | ✅ Teilweise | `sections.jahresrechnung.*` und i18n-Fallbacks | Mehrere sichtbare Texte/Fallbacks noch hybrid. | P1 |
| Footer Brand/Agency | ✅ Teilweise | `brand.*`, `design.assets.*` | Legal-Links/Labels teils i18n/hardcoded. | P0/P1 |
| Impressum/Datenschutz Variablen | ✅ Teilweise | `legal.variables.*`, optionale HTML-Overrides | Seitenstruktur und viele Abschnitte hardcoded. | P0 |

### 2.2 Noch i18n oder hardcoded

| Bereich | Quelle heute | Warum relevant | P0 vor CRM? | Entscheidung |
|---|---|---|---:|---|
| Header-CTA-/Footer-Labels | i18n | Sichtbar, aber relativ generisch. | Nein, sofern korrekt für Ehiogie | Nach CRM migrierbar. |
| Statusseiten Erfolg/Fehler | i18n | CRM kann später Status- und Follow-up-Kommunikation berühren. | Nur falls CRM direkt darauf referenziert | Nach CRM oder parallel als P1. |
| NotFound | hardcoded/i18n-nah | Geringe Conversion-Relevanz. | Nein | Nach CRM. |
| Datenschutz-Seitenstruktur | hardcoded mit Variablen | Rechtlich sichtbar, mandantenkritisch. | ✅ Ja | Vor CRM Legal-Config-Entscheidung/Freigabe. |
| Impressum-Seitenstruktur | hardcoded mit Variablen | Rechtlich sichtbar, mandantenkritisch. | ✅ Ja | Vor CRM Legal-Config-Entscheidung/Freigabe. |
| CookieBar/Consent-Texte | hardcoded bzw. nicht vollständig als Legal-Config-Vertrag dokumentiert | Consent- und Tracking-Aussagen dürfen CRM nicht implizit übernehmen. | ✅ Ja | Vor CRM in Legal-/Consent-Keyset aufnehmen. |
| Survey Consent | Loader-/Engine-nah, nicht einheitlich in Website-Config | CRM verarbeitet Leads/Aufträge; Consent muss eindeutig versioniert sein. | ✅ Ja | Vor CRM Vertrag für Consent-Text, Privacy-Link und Versionierung. |
| Loader Loading-/Error-/Offer-Copy | hardcoded in Loadern/Engines | Direkter Funnel, nicht React-Website-Config. | ✅ für Pflicht-/Consent-/URL-Texte, sonst P1 | Loader-Vertrag vor CRM, vollständige Textmigration später. |
| Tarif-/Offer-Seite Texte | hardcoded/i18n-Objekt im Loader | Angebot ist conversion- und rechtlich relevant. | ✅ für CTA-/Pflicht-/Hinweis-/URL-Vertrag | Stabilisieren; visuelle/mehrsprachige Perfektion nach CRM. |

### 2.3 P0 vor CRM vs. nach CRM verschiebbar

**P0 vor CRM:**

1. Legal-/Consent-Minimum: Impressum, Datenschutz, Cookie/Consent, Survey Consent, Privacy-Link, Consent-Version/Review-Status.
2. CRM-schreibbare Content-Key-Grenze: Welche `webseite_content_config`-Keys darf CRM pflegen, welche bleiben read-only oder engine-owned?
3. Loader-/Offer-/Survey-URL-Vertrag: offer, auftrag, start, success/error, privacy, callback/proxy/engine.
4. Mandantenidentität: Brand, Legal Entity, Kontakt, Domain, Location-ID, Supabase-Projekt/anon key als Umgebungs-/Tenantwerte.
5. Fallback-Regel: Kein CRM-Feature darf lokale/i18n-Fallbacks als erfolgreiche Mandantenkonfiguration interpretieren.

**Nach CRM verschiebbar:**

1. Vollständige 12-Sprachen-Migration aller Website-Texte.
2. Review-/Stats-/FAQ-Array-Normalisierung mit stabilen IDs.
3. Mobile Review-/UX-Angleichung.
4. Whitelabel Design-System v2.
5. Canva-/Marketing-Copy-Freigabe, sofern keine falschen Pflichtangaben live sind.

## 3. Legal Acceptance

| Thema | Aktueller Stand | Harte Werte / Risiko | Muss vor CRM in Config? | Acceptance-Entscheidung |
|---|---|---|---:|---|
| Impressum | Teilweise variable Legal-Werte aus `legal.variables.*`; Seitenstruktur bleibt hart. | Firma/Inhaber/Adresse/E-Mail sind als Fallback Ehiogie-spezifisch. | ✅ Ja | Legal Entity, Adresse, Kontakt, Verantwortlicher und optional HTML-Override/Review-Status als P0-Keyset einfrieren. |
| Datenschutz | Teilweise variable Legal-Werte und optional HTML-Override; viele Abschnitte sind hart. | Verarbeitungstexte, Supabase-Hinweise, Rechte, Cookie-Aussage und Energieassistent-Beschreibung sind nicht vollständig config-owned. | ✅ Ja | Vor CRM prüfen/freigeben; CRM darf keine Datenflüsse starten, die nicht von Datenschutz/Consent gedeckt sind. |
| Cookie/Consent | CookieBar/Consent-Texte sind nicht als einheitlicher Legal-Config-Vertrag nachgewiesen. | Consent-Aussagen können von Datenschutz und Survey abweichen. | ✅ Ja | Consent-Texte, Zwecke, Version, Datum und Privacy-Link als P0-Vertrag. |
| Survey Consent | Rechnung-/Setting-/Closing-Survey sind Loader-/Engine-nah; Consent ist nicht zentral als Website-Config-Legal-Domäne eingefroren. | Lead-/Auftragsdaten und Dokumentuploads brauchen eindeutige Einwilligungs-/Datenschutzgrundlage. | ✅ Ja | Survey Consent mit Versionierung, Pflichttext, Privacy-Link und CRM-Handoff-Regel vor CRM. |
| Offer Legal Hint | Tarif-Loader enthält Angebots-/Tarifdetails und Hinweistext im Loader. | Angebots-Hinweise können mandanten-/anbieterrelevant sein. | ✅ für Pflicht-Hinweise | Pflicht-/Disclaimer-Texte vor CRM stabilisieren; Layout/Textpolitur später. |

**P0 Legal-Keyset vor CRM:**

- `legal.variables.firma`
- `legal.variables.inhaber` / Verantwortlicher
- `legal.variables.strasse`, `plz`, `ort`, `land`
- `legal.variables.email`, optional Telefon
- `legal.privacy_url` oder URL-Vertrag zu `/datenschutz`
- `legal.impressum_html` / `pages.impressum.html` oder strukturierte Impressum-Felder
- `legal.datenschutz_html` / `pages.datenschutz.html` oder strukturierte Datenschutz-Felder
- `legal.cookie_consent.*`
- `legal.survey_consent.*`
- `legal.offer_disclaimer.*`
- `legal.review_status`, `legal.version`, `legal.updated_at`

## 4. Loader / iframe / Bootstrap Acceptance

Die Loader sind produktive, eigenständige HTML-Bootstraps und nicht nur React-Routen. Sie dürfen vor CRM nicht implizit durch die Website-Config-Schicht ersetzt oder als bereits vollständig whitelabel-safe betrachtet werden.

| Loader | Zweck | Harte Bootstrap-Werte | Runtime-Read | P0 vor CRM |
|---|---|---|---|---:|
| `public/loaders/start.html` | Setting-Survey Einstieg | `locationId`, Supabase URL/key, setting/closing Engine URLs, setting/closing Proxy URLs, offer/auftrag/start URLs, Avatar URL | `kunden_config.*`, `runtime_config`, `url_config`, Design | ✅ Setting Survey Vertrag |
| `public/loaders/auftrag.html` | Closing-/Auftrag-Survey Einstieg | `locationId`, Supabase URL/key, closing Engine/Proxy, offer/start URLs, Avatar URL | `kunden_config.*`, `runtime_config`, `url_config`, `design_config`, Legacy-Design | ✅ Closing Survey Vertrag |
| `public/loaders/rechnung.html` | Rechnung-Survey Einstieg | `locationId`, Supabase URL/key, Rechnung Engine/Proxy, success/error/privacy URLs | `kunden_config.*`, `runtime_config`, `url_config`, `design_config`, Legacy-Design | ✅ Rechnung Survey Vertrag |
| `public/loaders/tarif.html` | Tarif-/Offer-Seite | `locationId`, Supabase URL/key, offer/auftrag/start URLs, Engine-/Proxy-Fallbacks im Bootstrap | `kunden_config.design_config`, `auftraege`, Query `uuid`/`submission_id` | ✅ Offer/Handoff Vertrag |

### 4.1 Query-Parameter und Bootstrap-Werte

| Wert | Website-App | Loader | Acceptance vor CRM |
|---|---|---|---|
| `location_id` / `locationId` | Query kann Location überschreiben; Fallback Ehiogie Location. | Loader nutzen Bootstrap Location; einzelne Loader lesen Query-/URL-Parameter für Datensatzbezug. | P0: Quelle und erlaubte Override-Regel dokumentieren. |
| `supabase_url` / Supabase URL | Website-App kann Query, `TB_BOOTSTRAP`, Env verwenden. | Loader haben harte Supabase URL im `TB_BOOTSTRAP`. | P0: Nicht aus CRM frei editierbar machen; Umgebung/Tenant-Vertrag. |
| `supabase_key` / anon key | Website-App kann Query, `TB_BOOTSTRAP`, Env verwenden. | Loader haben harten anon key im `TB_BOOTSTRAP`. | P0: Public anon key ist technisch ok, aber Rotation/Umgebung dokumentieren. |
| `uuid` / `submission_id` | Nicht primärer Website-Config-Wert. | Offer/Closing nutzen Datensatzbezug. | P0: CRM darf Datensatz-IDs nicht mit Tenant-Config verwechseln. |
| `lang` | Website-Routing/i18n. | Offer baut URLs mit Sprache weiter. | P1: Sprachvertrag nach CRM schärfen; P0 nur wenn CRM-Sprachkommunikation startet. |

### 4.2 URLs, die vor CRM stabil sein müssen

**Engine-/Proxy-URLs:**

- `setting_engine_url`
- `closing_engine_url`
- `rechnung_engine_url`
- `setting_proxy_path`
- `closing_proxy_path`
- `rechnung_proxy_path`

**Domain-/Funnel-URLs:**

- Website Base URL
- `offer_base_url` / Tarifseite
- `auftragUrl`
- `startUrl`
- Rechnung Success URL
- Rechnung Error URL
- Privacy URL
- spätere CRM Callback-/Webhook-URLs

**Acceptance:** Diese Werte gehören nicht in verstreute harte Loader-Fallbacks plus CRM-Datenmodell gleichzeitig. Vor CRM muss feststehen, ob sie aus `runtime_config`, `url_config`, `TB_BOOTSTRAP` oder einer neuen CRM-eigenen URL-Domäne kommen.

## 5. Survey / Offer Readiness

| Flow | Readiness | Bekannte Risiken | P0 vor CRM | Verweis auf bekannte Blocker |
|---|---:|---|---:|---|
| Setting Survey Einstieg | 🟡 Teilweise bereit | Loader existiert; Engine-/Proxy-/Offer-URLs hart plus `runtime_config`-Override; Consent-/Legal-Vertrag nicht zentral. | ✅ Ja | #110, #91, #87, #122 als bekannte Blocker-/Tracking-Referenzen vor CRM abgleichen. |
| Closing Survey Einstieg | 🟡 Teilweise bereit | Closing Engine/Proxy und Offer-Handoff vorhanden; Datensatz-/Consent-/URL-Vertrag muss CRM-sicher sein. | ✅ Ja | #110, #91, #87, #122 abgleichen. |
| Rechnung Survey Einstieg | 🟡 Teilweise bereit | Upload-/Rechnungsdaten, Success/Error/Privacy URLs und Consent sind besonders rechtlich relevant. | ✅ Ja | #110, #91, #87, #122 abgleichen. |
| Tarif-/Offer-Seite | 🟡 Teilweise bereit | `uuid`/`submission_id`, `auftraege`-Read, CTA zur Auftrag-Seite, harte Texte/Hinweise; nicht vollständig Website-Config-driven. | ✅ Ja | #110, #91, #87, #122 abgleichen. |

### 5.1 Known blockers aus #110, #91, #87, #122

Da dieser Acceptance-Check bewusst keine GitHub-Issue-Schließung und keine Runtime-Prüfung ausführt, werden die Issues hier als **P0-Referenzen** geführt, die vor CRM-Start inhaltlich gegen den finalen Stand abgeglichen werden müssen:

1. **#110:** als Survey-/Offer-/Handoff-Blocker behandeln, bis bestätigt ist, dass kein Setting-/Closing-/Rechnung-/Tarif-Flow den CRM-Start blockiert.
2. **#91:** als Architektur-/Config-Vertragsreferenz behandeln, bis die Unified-Config-Entscheidungen für CRM übernommen oder bewusst abgegrenzt sind.
3. **#87:** als Website-Config-/Supabase-Override-Referenz behandeln, bis bestätigt ist, dass `webseite_*_config` für Ehiogie lesbar und fallback-sicher ist.
4. **#122:** als finaler Pre-CRM-Blocker behandeln, bis geprüft ist, dass keine offenen Loader-, Legal-, Survey-, Offer- oder Kromen-Abhängigkeiten in den CRM-Start rutschen.

**P0-Akzeptanz:** Jedes dieser Issues muss vor CRM entweder geschlossen, als erledigt referenziert oder explizit als nicht-blockierend mit Begründung markiert sein. Ohne diesen Abgleich bleibt die Ampel gelb.

## 6. Kromen Catch-up Readiness

Kromen wird in diesem PR nicht geändert. Für Kromen ist nur festzuhalten, welche Ehiogie-Architektur später übertragen werden soll und welche Kromen-spezifischen Werte nicht überschrieben werden dürfen.

### 6.1 Später auf Kromen zu übertragen

| Ehiogie-Architekturteil | Kromen-Catch-up-Aufgabe | Priorität nach CRM |
|---|---|---:|
| `webseite_design_config` für Brand, Farben, Assets | Kromen-Design-Tokens und Asset-Registry in gleicher Struktur anlegen. | P1 |
| `webseite_content_config` mit Section-Keys | Kromen-Content-Keys auf Ehiogie-Schema mappen, ohne Ehiogie-Texte zu übernehmen. | P1 |
| `webseite_layout_config` | Kromen-Layout-Reihenfolge und Sichtbarkeit separat konfigurieren. | P2 |
| Legal-/Consent-Keyset | Kromen-eigene Legal Entity, Datenschutz, Consent und Review-Status pflegen. | P1 |
| URL-/Runtime-Vertrag | Kromen-Domains, Loader-/Offer-/Proxy-/Engine-URLs separat erfassen. | P1 |
| Fallback-Regeln | Kromen darf nicht still auf Ehiogie-Fallbacks zurückfallen. | P1 |

### 6.2 Kromen-spezifische Werte, die nie überschrieben werden dürfen

- Kromen `location_id`
- Kromen Domain/Base URL
- Kromen Supabase-Projekt oder Tenant-Zugangswerte
- Kromen Brand-Name, Logo, Farben, Assets, Media-Registry
- Kromen Social Links
- Kromen Legal Entity, Adresse, Datenschutz, Impressum, Consent-Versionen
- Kromen Survey-/Offer-/Callback-/Proxy-/Engine-URLs
- Kromen E-Mail-/CRM-Absenderdaten

### 6.3 Kromen-Issues bleiben separat

Kromen-Catch-up darf den Ehiogie-CRM-Start nicht blockieren, solange Kromen nicht Teil des CRM-Startumfangs ist. Kromen-spezifische Themen wie Social Links, unsichere Asset-Fallbacks, Kromen-Media-Übertragung, Kromen-Design-Tokens und Kromen-Legal-Werte bleiben separate Nach-CRM-Issues.

## 7. Finales Ergebnis und Go/No-Go

### 7.1 Ampel

| Bereich | Ampel | Begründung |
|---|---:|---|
| Website Config Layer | 🟢 | Provider, Defaults, Resolver und Supabase-Read für `webseite_*` sind vorhanden. |
| Client-facing Content | 🟡 | Viele Website-Sections sind config-driven, aber i18n/hardcoded Fallbacks bleiben parallel. |
| Legal | 🔴 | Impressum, Datenschutz, Cookie/Consent und Survey Consent sind noch nicht als finaler CRM-/Whitelabel-Vertrag akzeptiert. |
| Loader / iframe / Bootstrap | 🟡 | Produktive Loader sind vorhanden, aber harte Bootstrap-Werte und Runtime-/URL-Quellen müssen vor CRM eingefroren werden. |
| Survey / Offer | 🟡 | Flows sind vorhanden, aber Consent-/Handoff-/URL-/Issue-Blocker müssen abgenommen werden. |
| Kromen Catch-up | 🟢 für Ehiogie-CRM | Kromen ist getrennt und darf nach CRM folgen; nur keine Ehiogie-Werte übertragen. |
| CRM Foundation Start | 🟡 | Go nur nach P0-Fixes/Entscheidungen. |

### 7.2 P0-Blocker vor CRM Foundation

1. **Legal-/Consent-Freeze:** Impressum, Datenschutz, Cookie/Consent, Survey Consent und Offer-Disclaimer als configfähiges oder bewusst hardcoded freigegebenes P0-Keyset mit Review-Status dokumentieren.
2. **Loader-/URL-/Runtime-Vertrag:** Für `start.html`, `auftrag.html`, `rechnung.html`, `tarif.html` festlegen, welche Werte aus `TB_BOOTSTRAP`, `runtime_config`, `url_config`, Query oder CRM kommen dürfen.
3. **CRM Content-Key-Freeze:** Minimalen Satz CRM-schreibbarer Keys in `webseite_content_config`, `webseite_design_config`, `webseite_layout_config` definieren; i18n/lokale Fallbacks bleiben read-only Sicherheitsnetz.
4. **Survey-/Offer-Handoff-Freeze:** Setting, Closing, Rechnung und Tarif müssen klare Datensatz-, Consent-, Privacy-, Success-/Error- und Auftrag-/Offer-Handoff-Regeln haben.
5. **Issue-Abgleich #110/#91/#87/#122:** Jedes Issue vor CRM als erledigt, nicht-blockierend oder separater Nach-CRM-Task markieren.
6. **Keine Supabase-Schreibannahme:** CRM Foundation darf erst mit separatem Vertrag schreiben; dieser Acceptance-Stand bestätigt nur bestehende Lese-/Fallback-Vorbereitung.

### 7.3 Was vor CRM zwingend ist

- P0 Legal-/Consent-Keyset und Freigabe.
- P0 Loader-/URL-/Runtime-Vertrag.
- P0 CRM-schreibbare Config-Key-Liste.
- P0 Survey-/Offer-Handoff-Regeln.
- P0 Abgleich der bekannten Blocker #110, #91, #87, #122.
- Bestätigung, dass CRM nicht gegen i18n-, Komponenten- oder Repo-Fallbacks als editierbare Wahrheit arbeitet.

### 7.4 Was nach CRM verschiebbar ist

- Vollständige 12-Sprachen-Migration aller sichtbaren Texte.
- Vollständige Entfernung aller i18n-/Komponenten-Fallbacks.
- Review-/FAQ-/Stats-ID-Normalisierung.
- Mobile Review-/UX-Angleichung.
- Canva-/Marketing-Copy-Freigabe.
- Whitelabel Design-System v2.
- Kromen Catch-up, sofern Kromen nicht Teil des CRM-Startumfangs ist.

## 8. Acceptance Statement

**Finale Entscheidung:** 🟡 **Go für CRM Foundation nur nach P0-Fixes.**

Ehiogie hat eine tragfähige technische Config-Grundlage, aber noch keinen vollständig stabilen CRM-/Whitelabel-Vertrag für Legal, Consent, Loader, Survey, Offer und CRM-schreibbare Keys. Der nächste sinnvolle Schritt ist nicht ein breiter Runtime-Umbau, sondern ein kurzer P0-Freeze-/Fix-Zyklus mit klaren Verträgen und Issue-Abgleich.

**Bestätigung dieses PR-Scopes:**

- Keine Runtime-Änderung.
- Keine UI-Änderung.
- Keine sichtbare Textänderung in der Anwendung.
- Keine Supabase-Schreiboperation.
- Keine Migration.
- Kein SQL.
- Kein Deploy.
- Keine Loader-Logik geändert.
- Kromen nicht geändert.
- Template nicht geändert.
- Hauptrepo nicht geändert.
- E-Mail-Repo nicht geändert.
