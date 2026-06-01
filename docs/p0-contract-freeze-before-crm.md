# P0 Contract Freeze before CRM Foundation

**Base / Scope:** Dieser Freeze gilt für den Ehiogie-Stand vor CRM-Foundation gegen `Ehiogie-Energieassistent-tn90CyE3XuYFTy4c1M3F` und `location_id = tn90CyE3XuYFTy4c1M3F`.

**Verbindlichkeit:** Dieses Dokument ist der P0-Vertrag für CRM-Startfähigkeit. CRM darf erst gegen Kundenkonfiguration schreiben, wenn die unten definierten Ownership-, Read-/Write- und No-Go-Grenzen eingehalten werden.

**Grundlage:** Dieser Freeze konsolidiert die Entscheidungen aus:

- `docs/ehiogie-client-facing-config-audit-v2.md`
- `docs/unified-config-architecture.md`
- `docs/pre-crm-cleanup-plan.md`
- `docs/ehiogie-config-acceptance-check.md`

**Änderungsart:** reine Dokumentation. Keine Runtime-Codeänderung, keine UI-Änderung, keine Text-/Übersetzungsänderung, keine Supabase-Schreiboperation, keine Migration, kein SQL, kein Deploy und keine Loader-Logikänderung.

## 1. Legal Contract

### 1.1 P0 Legal-Domänen

| Legal-Domäne | Verbindlicher Zweck | CRM-Leserecht | CRM-Schreibrecht | Owner vor CRM | Status vor CRM Foundation |
|---|---|---:|---:|---|---|
| Impressum | Anbieterkennzeichnung, juristische Identität, Adresse, Vertretung, Kontakt, Register-/Steuerangaben, soweit verpflichtend | Ja | Nein | Legal-owned | Muss final geprüft/freigegeben oder explizit als offener Blocker markiert sein |
| Datenschutz | Datenschutzhinweise für Website, Survey, Angebot, CRM-Handoff und spätere E-Mail-Verarbeitung | Ja | Nein | Legal-owned | Muss final geprüft/freigegeben oder explizit als offener Blocker markiert sein |
| Cookie/Consent | CookieBar-/Tracking-/Consent-Hinweise und Einwilligungszustände | Ja | Nein | Legal-owned | Consent-Text, Version und Review-Status müssen eingefroren sein |
| Survey Consent | Einwilligungs-/Hinweistexte für Start-, Auftrag-/Closing- und Rechnungs-Funnel | Ja | Nein | Legal-owned mit Engine-Contract | Text, Version, Pflichtfeldbindung und Handoff müssen eingefroren sein |
| Privacy URLs | Links auf Datenschutz, Impressum, Consent-Details und ggf. externe Datenschutzseiten | Ja | Nur nach Legal-Freigabe über separaten Config-Prozess | Legal-owned / URL-owned | Ziel-URLs müssen tenant- und environment-sicher dokumentiert sein |
| Pflichtfelder | Rechtlich/fachlich notwendige Felder für Lead, Auftrag, Rechnung, Consent und Kontakt | Ja | Nein, solange sie Engine-/Legal-Logik betreffen | Engine-owned / Legal-owned | CRM darf Pflichtfeldstatus nicht eigenständig lockern |
| Review-/Freigabe-Status | Freigabezustand, Reviewer, Version, Datum und Quelle pro Legal-Artefakt | Ja | Nein | Legal-owned | Muss vor CRM als Gate vorhanden sein |

### 1.2 Legal-Werte, die CRM lesen darf

CRM darf diese Werte lesen, um Lead-/Auftragskontext, Anzeigezustände und spätere Kommunikation korrekt zu referenzieren:

- `legal.imprint.*` als geprüfte Impressumsdaten.
- `legal.privacy.*` als geprüfte Datenschutzdaten und Datenschutz-URLs.
- `legal.cookie_consent.*` als geprüfte Cookie-/Consent-Texte, Consent-Kategorien und Versionen.
- `legal.survey_consent.setting.*`, `legal.survey_consent.closing.*` und `legal.survey_consent.invoice.*` als geprüfte Survey-Consent-Texte und Versionen.
- `legal.email_footer.*` und `legal.unsubscribe.*` nur als späterer, noch nicht produktiver E-Mail-Vertrag.
- `legal.review_status.*`, `legal.approval.*`, `legal.version`, `legal.approved_at`, `legal.approved_by` und `legal.source` als Audit-Kontext.
- Consent- und Legal-Referenzen an Lead-/Auftragsdatensätzen, sofern sie durch Survey/Offer/Engine erzeugt wurden.

### 1.3 Legal-Werte, die CRM nicht schreiben darf

CRM darf diese Werte nicht erzeugen, überschreiben oder automatisch aktualisieren:

- Impressumstexte, Datenschutztexte, Cookie-/Consent-Texte, Survey-Consent-Texte und rechtliche Disclaimer.
- Consent-Versionen, Review-Status, Freigabezeitpunkte und Reviewer.
- Pflichtfelddefinitionen, die rechtlich oder engine-fachlich erforderlich sind.
- Privacy URLs, wenn dadurch produktive Website-, Survey-, Offer- oder E-Mail-Links verändert werden.
- Lokale Repo-Fallbacks oder i18n-Fallbacks, selbst wenn sie aktuell sichtbar gerendert werden.
- Legal-Texte aus KI-Generierung, CRM-Templates oder E-Mail-Drafts ohne separate Legal-Freigabe.

## 2. Loader / URL / Runtime Contract

### 2.1 Produktive Loader im Freeze

| Loader | Aktuelle Rolle | CRM-Status | Freeze-Regel |
|---|---|---|---|
| `public/loaders/start.html` | Start-/Setting-Survey im iframe, Engine-Bootstrap, Kundenconfig-Lesezugriff | CRM darf Kontext lesen, aber keine Loader-Logik schreiben | Bootstrap-, Engine-, Proxy-, Offer-, Start- und Avatar-Werte bleiben bis Migration kompatibel |
| `public/loaders/auftrag.html` | Auftrag-/Closing-Survey im iframe, Engine-Bootstrap, Kundenconfig-Lesezugriff | CRM darf Handoff-Ergebnis lesen, aber keine Closing-Logik schreiben | Closing-Engine, Consent, Pflichtfelder und Weiterleitungen bleiben engine-/legal-owned |
| `public/loaders/rechnung.html` | Rechnungs-/Upload-Funnel im iframe, Engine-/Loader-Kontext | CRM darf Handoff-Kontext lesen, aber keine Rechnungslogik schreiben | Invoice-/Upload-Parameter, Consent und Engine-Contract dürfen nicht ohne Migrationsplan geändert werden |
| `public/loaders/tarif.html` | Angebots-/Tarifseite, direkte Daten aus `auftraege`, `ai_content`, Tariffeldern und Design | CRM darf Angebotsstatus lesen und spätere Follow-ups vorbereiten | Row-generierte Angebotsdaten bleiben nicht als CRM-editierbare Stammdaten zu behandeln |

### 2.2 Query-Parameter

| Parameter / Gruppe | Aktuelle Bedeutung | CRM-Regel | Migration-Regel |
|---|---|---|---|
| `location_id` | Tenant-/Kundenkontext, aktuell Ehiogie `tn90CyE3XuYFTy4c1M3F` | CRM darf lesen und muss Tenant-Isolation respektieren | Muss später aus sicherer Tenant-Config kommen; Query bleibt bis Migration kompatibel |
| `lang` | Sprachwahl für Loader/Offer und teilweise Engine | CRM darf lesen | Deutsch bleibt Source of Truth; Fallback-Regeln nicht überschreiben |
| `uuid` | Auftrags-/Submission-/Offer-Kontext, besonders Auftrag/Tarif | CRM darf lesen und an CRM-Leads referenzieren | Nicht als Config-Key behandeln; Datensatzreferenz bleibt row-/engine-owned |
| `submission_id` | Submission-/Offer-Kontext im Tarifloader | CRM darf lesen | Nicht in Kundenconfig zurückschreiben |
| Weitere Survey-/Engine-Parameter | Können von Loader/Engine ausgewertet werden | CRM darf nicht ohne Engine-Freigabe schreiben | Vollständige Parametermigration erst nach Engine-Audit |

### 2.3 `TB_BOOTSTRAP`

`TB_BOOTSTRAP` ist bis zur Migration ein produktiver Kompatibilitätsvertrag. CRM darf daraus keine editierbaren Kundenstammdaten ableiten und darf die Werte nicht eigenständig überschreiben.

| Wert | Bedeutung | Ziel-Owner | CRM-Regel | Bis zur Migration kompatibel bleiben? |
|---|---|---|---|---:|
| `locationId` | Tenant-Kontext | Tenant Config | Lesen ja, schreiben nein | Ja |
| `supabaseUrl` / `supabase_url` | Öffentliches Supabase-Projekt für clientseitige Reads | Integrations Config | Lesen nur als technische Quelle, schreiben nein | Ja |
| `supabaseKey` / `supabase_key` / anon key | Öffentlicher anon key für clientseitige Reads | Integrations Config mit Public/Secret-Split | CRM darf nie Service Role Keys speichern; anon key nicht frei editieren | Ja |
| `settingEngineUrl` | Start-/Setting-Engine-Skript | Engine-owned Runtime Config | Schreiben nein | Ja |
| `closingEngineUrl` | Auftrag-/Closing-Engine-Skript | Engine-owned Runtime Config | Schreiben nein | Ja |
| `settingProxyPath` | Setting-Proxy/API-Pfad | Engine-/Proxy-owned URL Config | Schreiben nein | Ja |
| `closingProxyPath` | Closing-Proxy/API-Pfad | Engine-/Proxy-owned URL Config | Schreiben nein | Ja |
| `offerUrl` / `offer_base_url` | Ziel für Angebot/Tarif | URL-owned / Offer-owned | Nur lesen; Änderung nur mit Freigabe | Ja |
| `auftragUrl` | Ziel für Auftrag/Closing | URL-owned / Funnel-owned | Nur lesen; Änderung nur mit Freigabe | Ja |
| `startUrl` | Ziel für Start-Survey | URL-owned / Funnel-owned | Nur lesen; Änderung nur mit Freigabe | Ja |
| `successUrl` | Erfolgsziel nach Funnel-Schritt | URL-owned / Funnel-owned | Nur lesen; Änderung nur mit Freigabe | Ja, sofern vorhanden |
| `errorUrl` | Fehlerziel nach Funnel-Schritt | URL-owned / Funnel-owned | Nur lesen; Änderung nur mit Freigabe | Ja, sofern vorhanden |
| `callbackUrl` / calendar URL | Rückruf-/Termin-Ziel | CRM Scheduling Config, nach P0 getrennt | Vor CRM nur lesen; spätere Schreibbarkeit separat | Ja |
| `avatarUrl` | sichtbares Loader-/Survey-Asset | Design-/Asset-owned | CRM darf nicht schreiben | Ja |

### 2.4 Supabase und Config-Keys im Loader-Kontext

| Supabase-/Config-Key | Aktuelle Nutzung | CRM darf lesen? | CRM darf schreiben? | Owner |
|---|---|---:|---:|---|
| `kunden_config` | Tenant-Row und Runtime-/Design-/URL-Kontext | Ja, scoped auf Tenant | Nein, außer explizit freigegebene CRM-writable Keys aus Abschnitt 3 | Tenant Config |
| `runtime_config` | Loader-/Engine-Runtimewerte | Ja | Nein | Engine-owned / Runtime-owned |
| `url_config` | Offer-, Funnel-, Proxy- und Domain-Ziele | Ja | Nein vor URL-Freigabe | URL-owned |
| `design_config` | Loader-/Offer-Design und Legacy-Survey-Design | Ja | Nur spätere Design-Keys mit Design-Freigabe | Design-owned |
| `setting_survey_design` | Legacy/Fallback für Setting-Survey | Ja | Nein | Design-owned / Engine compatibility |
| `closing_survey_design` | Legacy/Fallback für Closing-Survey | Ja | Nein | Design-owned / Engine compatibility |
| `webseite_design_config` | Website-Design-Overrides | Ja | Nur freigegebene Design-Keys, nicht in CRM Foundation P0 | Design-owned |
| `webseite_content_config` | Website-Content-Overrides | Ja | Nur freigegebene Content-Keys, nicht Legal/Engine/i18n-Fallbacks | Content-owned |
| `webseite_layout_config` | Website-Layout-Overrides | Ja | Nur nach Layout-Schema-Freigabe | Design-/Layout-owned |
| `auftraege` | Auftrag/Offer-Row, Tarifdaten, `ai_content` | Ja, auftragsbezogen | CRM darf CRM-Status/Referenzen später separat schreiben, aber keine generierten Angebotsdaten überschreiben | Offer-/Engine-owned |
| `ai_content` | generierter Angebots-/KI-Inhalt auf Row-Ebene | Ja | Nein | Engine-/Offer-owned |
| `ai_offer_content` | upstream/indirekte Angebotscopy-Quelle | Ja, sobald vorhanden | Nein | Engine-/Offer-owned |
| `offer_copy_templates` | spätere Angebotsvorlagen | Ja, sobald freigegeben | Nein in CRM Foundation | Content-/Offer-owned |

### 2.5 Werte, die später aus Config kommen müssen

Diese Werte müssen langfristig aus einem versionierten Tenant-/Runtime-Config-Modell kommen und dürfen nicht dauerhaft verteilt in Loadern gepflegt werden:

- `location_id` / Tenant-Slug / Kundenidentität.
- `supabase_url` und öffentlicher anon key mit klarer Public/Secret-Trennung.
- Engine URLs für Setting, Closing und Rechnung.
- Proxy URLs und API-Pfade.
- Offer URL, Auftrag URL, Start URL, Success URL, Error URL und Callback-/Kalender-URL.
- Avatar-, Logo-, Font- und weitere öffentliche Asset-URLs.
- Survey-Consent- und Pflichtfeldreferenzen.
- Offer-/Tarif-Handoff-Ziele und CTA-Ziele.

### 2.6 Werte, die bis zur Migration kompatibel bleiben müssen

Bis ein separater Migrationsplan mit Rollback existiert, müssen die folgenden Verbraucher unverändert funktionieren:

- React iframe-Routen `/start`, `/auftrag`, `/rechnung` und `/tarif` inklusive Query-Weitergabe.
- `public/loaders/start.html`, `public/loaders/auftrag.html`, `public/loaders/rechnung.html` und `public/loaders/tarif.html`.
- Bestehende `TB_BOOTSTRAP`-Werte und Aliasnamen wie `supabaseUrl`/`supabase_url` oder `supabaseKey`/`supabase_key`.
- Aktuelle `kunden_config`-Reads, Legacy-Design-Fallbacks und Loader-I18N-Fallbacks.
- Bestehende Auftrags-/Offer-Links mit `uuid`, `submission_id` und `lang`.

## 3. CRM Writable Config Keys

### 3.1 Grundregel

CRM Foundation startet read-first. Schreibrechte werden nur für explizit freigegebene, schema-validierte und auditierbare Keys aktiviert. Kein CRM-Write darf Legal-, Engine-, Proxy-, Secret-, i18n- oder lokale Repo-Fallback-Grenzen umgehen.

### 3.2 Supabase-/Config-Keys, die CRM später lesen darf

| Key / Bereich | Leserecht | Begründung |
|---|---:|---|
| `kunden_config.location_id` | Ja | Tenant-Isolation und Zuordnung |
| `kunden_config.webseite_content_config` | Ja | Website-Content-Kontext und spätere Content-Workflows |
| `kunden_config.webseite_design_config` | Ja | Brand-/Asset-Kontext |
| `kunden_config.webseite_layout_config` | Ja | Sichtbarkeits-/Layout-Kontext |
| `kunden_config.design_config` | Ja | Loader-/Offer-Design-Kontext |
| `kunden_config.url_config` | Ja | Handoff-/Routing-Kontext |
| `kunden_config.runtime_config` | Ja | Runtime-Kontext, aber nicht editierbar |
| `setting_survey_*` / `closing_survey_*` | Ja, soweit vorhanden | Survey-Kontext, Engine-Freigabe erforderlich |
| `auftraege` | Ja, row-scoped | Lead-/Auftrags-/Offer-Handoff |
| `auftraege.ai_content` | Ja | Angebotsanzeige und Follow-up-Kontext, aber nicht Stammdaten |
| Legal-/Consent-Config | Ja | E-Mail-/Lead-Kontext und Audit, aber nicht editierbar |

### 3.3 Keys, die CRM später schreiben darf

Schreibrechte sind **später** möglich, aber nicht automatisch Teil dieses P0-Freeze. Voraussetzung sind Schema, Rollenmodell, Audit-Log, Preview/Review und Rollback.

| Zielbereich | Potenziell CRM-writable Keys | Bedingungen |
|---|---|---|
| CRM Lead/Contact Mapping | `crm.lead_fields.*`, `crm.contact_fields.*`, `crm.pipeline.*`, `crm.tags.*` | Separates CRM-Schema; keine Überschreibung von Survey-/Offer-Rohdaten |
| CRM Handoff Status | `crm_handoff.status`, `crm_handoff.last_synced_at`, `crm_handoff.external_id`, `crm_handoff.error_code` | Auftrags-/Lead-bezogen, auditierbar, nicht als Kundenconfig-Fallback |
| Callback/Scheduling Metadaten | `crm.callback.provider`, `crm.callback.calendar_id`, `crm.callback.routing_queue` | Erst nach Callback-/Kalender-Vertrag; keine produktiven URLs ohne Freigabe ändern |
| E-Mail Workflow Metadaten | `crm.email.workflow_id`, `crm.email.template_ref`, `crm.email.sender_profile_ref` | Erst nach E-Mail-/Legal-Footer-Vertrag; keine Legal-Texte erzeugen |
| Content Drafts | `content_drafts.*` oder `webseite_content_config`-Draft-Bereich | Nur Draft/Review, nicht Live-Write; Deutsch Source of Truth; keine i18n-Fallbacks überschreiben |
| CRM-notizen | `crm.notes.*`, `crm.owner.*` | Nur CRM-eigene Bereiche ohne Runtime-Auswirkung |

### 3.4 Read-only Keys

Diese Keys bleiben für CRM read-only:

- `location_id`, Tenant-Slug und Tenant-Basisidentität.
- `supabase_url`, `supabase_key`, anon key und alle Integrations-/Credential-Felder.
- `runtime_config`, Engine URLs, Proxy URLs und Engine-Versionen.
- `url_config` für produktive Funnel-, Offer-, Success-, Error- und Callback-Ziele, solange keine URL-Freigabe existiert.
- `webseite_layout_config`, solange kein Layout-Schema mit Preview/Freigabe existiert.
- `auftraege.ai_content`, Tarifpreise, Anbieter-/Tarifdaten und generated offer output.
- Consent-Versionen, Legal-Review-Status und Legal-Texte.
- i18n-Dictionaries, Repo-Fallbacks und Loader-Fallbacks.

### 3.5 Engine-owned Keys

Engine-owned und nicht CRM-writable:

- `setting_survey_logic`, `closing_survey_logic`, invoice/rechnung survey logic.
- Survey branching, Validierungsregeln, Pflichtfeldlogik, Tariffähigkeit und Offer-Generation.
- Engine URLs, Engine-Versionen, Storage-Pfade und Proxy-Pfade.
- `ai_offer_content`, `offer_copy_templates`, sofern sie von Engine/Edge Function erzeugt oder interpretiert werden.
- Row-generierte Angebotswerte in `auftraege` inklusive Preise, Anbieter, Tarifdetails und KI-Fazit.

### 3.6 Legal-owned Keys

Legal-owned und nicht CRM-writable:

- Impressum, Datenschutz, Cookie-/Consent-Texte, Survey-Consent-Texte.
- Privacy URLs, soweit sie rechtlich relevante Ziele sind.
- Consent-Versionen, Review-/Freigabe-Status, Reviewer und Freigabedatum.
- Pflichtfelddefinitionen mit Legal-Bezug.
- E-Mail Legal Footer und Unsubscribe-Rechtsrahmen.

### 3.7 Content-owned Keys

Content-owned und nur nach Content-Freigabe CRM-writable:

- Website Section Copy wie Hero, Problem, Solution, How-it-works, Comparison, FAQ, Reviews, Stats, About und Callback-Texts.
- Offer Copy Templates, sofern sie nicht row-generiert oder engine-owned sind.
- Spätere CRM-/E-Mail-Text-Drafts.
- Content darf nicht zur Ablage von URLs, Secrets, Engine-Logik, Consent-Versionen oder Design-Tokens missbraucht werden.

### 3.8 Design-owned Keys

Design-owned und nur nach Design-Freigabe CRM-writable:

- Logos, Farben, Typography, Border Radius, Shadows, Button-/Card-Styles und Asset-Refs.
- Loader-/Survey-/Offer-Design-Tokens nach Schemaharmonisierung von `webseite_design_config` und `design_config`.
- CRM darf Design nicht nutzen, um Legal-Hinweise auszublenden oder Survey-Pflichtschritte zu umgehen.

## 4. Content-Key Freeze

### 4.1 Website Keys

Website-Content-Keys bleiben im Freeze content-owned. CRM darf sie lesen, aber nicht ohne Draft-/Review-Prozess live schreiben.

| Bereich | Key-Familie | Freeze-Regel |
|---|---|---|
| Brand / Navigation | `brand.*`, `header.*`, `footer.*`, `navigation.*` | Content-/Design-Trennung einhalten; Legal-Links nicht frei ändern |
| Homepage Sections | `sections.hero.*`, `sections.problem.*`, `sections.solution.*`, `sections.how_it_works.*`, `sections.comparison.*` | Deutsch ist Source of Truth; keine parallele CRM-Wahrheit |
| Trust / Proof | `sections.testimonials.*`, `sections.stats.*`, `sections.faq.*` | Reviews, Zahlen und FAQ brauchen Freigabe vor Live-Write |
| Jahresrechnung | `sections.jahresrechnung.*` | P1-Content-Konsolidierung; keine CRM-Schreibrechte vor Key-Abnahme |
| Callback | `sections.callback.*` | Text content-owned; Calendar URL ist CRM Scheduling/URL-owned und separat zu behandeln |
| Status / Fehler / NotFound | `status_pages.*`, `pages.not_found.*` | i18n-/Komponenten-Fallbacks bleiben read-only bis Konsolidierung |

### 4.2 Survey Keys

Survey-Keys bleiben im Freeze getrennt nach Content, Design, Logic und Legal.

| Bereich | Key-Familie | Owner | CRM-Regel |
|---|---|---|---|
| Setting Survey Copy | `survey.setting.content.*` / bestehende Engine-Content-Keys | Content-owned / Engine-visible | Lesen ja, schreiben nur nach Engine-/Content-Freigabe |
| Setting Survey Logic | `setting_survey_logic`, `survey.setting.logic.*` | Engine-owned | Nicht CRM-writable |
| Setting Consent | `setting_consent_text`, `legal.survey_consent.setting.*` | Legal-owned | Nicht CRM-writable |
| Closing Survey Copy | `survey.closing.content.*` | Content-owned / Engine-visible | Lesen ja, schreiben nur nach Freigabe |
| Closing Survey Logic | `closing_survey_logic`, `survey.closing.logic.*` | Engine-owned | Nicht CRM-writable |
| Closing Consent | `closing_consent_text`, `legal.survey_consent.closing.*` | Legal-owned | Nicht CRM-writable |
| Invoice Survey | `survey.invoice.*` | Engine-/Content-/Legal-owned nach Subdomain | Nicht ohne Contract writable |
| Survey Design | `setting_survey_design`, `closing_survey_design`, `design_config.survey.*` | Design-owned | Nicht in CRM Foundation writable |

### 4.3 Offer Keys

| Bereich | Key-Familie | Owner | CRM-Regel |
|---|---|---|---|
| Offer Row | `auftraege.*` | Offer-/Engine-owned | Lesen row-scoped; keine generierten Angebotsdaten überschreiben |
| AI Content | `auftraege.ai_content`, `ai_offer_content` | Engine-/Offer-owned | Lesen ja, schreiben nein |
| Offer Templates | `offer_copy_templates`, `offer.templates.*` | Content-/Offer-owned | Später Draft/Review möglich, nicht CRM Foundation |
| Tarifdaten | Anbieter, Tarifname, Preise, Einsparungen, CTA-Ziele | Offer-/Engine-owned | Nicht als CRM-Stammdaten editieren |
| Offer Design | `design_config.offer.*`, `webseite_design_config.offer.*` | Design-owned | Nur nach Design-Schema-Freigabe |

### 4.4 Email/CRM Keys später

E-Mail-/CRM-Keys sind bewusst **nach CRM Foundation** oder als separater CRM-Vertrag zu modellieren:

- `crm.email.sender_profile_ref`
- `crm.email.reply_to_ref`
- `crm.email.workflow_id`
- `crm.email.template_ref`
- `crm.email.legal_footer_ref`
- `crm.email.unsubscribe_ref`
- `crm.lead_fields.*`
- `crm.contact_fields.*`
- `crm.pipeline.*`
- `crm.tags.*`
- `crm.calendar.*`

Die E-Mail-Repo-Drafts sind Content-Input, aber keine Runtime Source of Truth.

### 4.5 Deutsch als Source of Truth

Deutsch (`de`) ist vor und während CRM Foundation die verbindliche Source of Truth für Content, Legal, Survey-Fallbacks und Offer-/E-Mail-Drafts. Andere Sprachen dürfen Deutsch nicht semantisch überschreiben. Wenn eine Übersetzung fehlt oder unsicher ist, muss auf Deutsch oder einen geprüften technischen Fallback zurückgefallen werden.

### 4.6 12-Sprachen-Struktur

Die Zielstruktur bleibt 12-sprachig. Locale-Objekte sollen konsistent aufgebaut sein:

- `de`
- `en`
- `fr`
- `es`
- `it`
- `tr`
- `pl`
- `ru`
- `ar`
- `uk`
- `ro`
- `bg`

Die konkrete Locale-Abdeckung pro Key muss in Content-/Legal-/Survey-/Offer-Schemas validierbar werden. CRM darf keine fehlenden Übersetzungen automatisch erzeugen oder bestehende i18n-Dictionaries überschreiben.

### 4.7 Fallback-Regeln

1. Supabase-/Tenant-Config ist bevorzugte Quelle, wenn Key, Locale, Review-Status und Schema gültig sind.
2. Deutsch (`de`) ist der erste fachliche Fallback.
3. Bestehende i18n-Dictionaries sind ein technisches Sicherheitsnetz, nicht CRM-editierbare Wahrheit.
4. Lokale Repo-Fallbacks sind nur Produktionssicherheit, nicht echte Kundenconfig.
5. Loader-Fallbacks bleiben bis Migration kompatibel, aber dürfen nicht als Zielmodell verstanden werden.
6. Fehlende Legal-/Consent-Pflichtwerte dürfen nicht still durch Marketing-Copy ersetzt werden.
7. Generated Offer Content darf nicht als wiederverwendbare Content-Vorlage zurückgeschrieben werden.

## 5. Handoff-Regeln

### 5.1 Website → Survey

- Website-Routen `/start`, `/auftrag`, `/rechnung` und `/tarif` geben Query-Parameter an iframe-Loader weiter.
- Website darf Survey-Kontext starten, aber Survey-Logik, Pflichtfelder, Consent und Engine-Versionen bleiben Loader-/Engine-owned.
- CRM darf Website-CTA-Kontext lesen, aber nicht aus lokalen Website-Fallbacks auf echte Kundenconfig schließen.

### 5.2 Survey → Auftrag

- Setting-/Closing-/Invoice-Survey erzeugen oder referenzieren fachliche Submission-/Auftragskontexte.
- `uuid`, `submission_id`, Consent-Referenzen, Sprache und Tenant müssen als Handoff-Kontext erhalten bleiben.
- CRM darf Auftrags-/Lead-Kontext lesen, aber nicht Survey-Rohdaten, Pflichtfelder oder Consent-Versionen rückwirkend verändern.

### 5.3 Auftrag → Offer

- Auftrag/Closing führt zur Angebots-/Tarifansicht oder erzeugt Offer-relevante Row-Daten.
- Offer-Daten aus `auftraege`, Tariffeldern und `ai_content` sind row-generierte Ergebnisse, keine CRM-editierbaren Templates.
- CRM darf Angebotsstatus, externe IDs und Follow-up-Kontext separat speichern, aber nicht Preise, Anbieter, Tarifdetails oder KI-Fazit überschreiben.

### 5.4 Offer → CRM

- CRM übernimmt nur freigegebene Lead-/Auftrags-/Offer-Referenzen und Handoff-Metadaten.
- CRM muss Tenant, Sprache, Consent-Version, Privacy-/Legal-Referenzen und Offer-Row-ID beibehalten.
- CRM darf fehlende Angebotscopy nicht aus E-Mail-Drafts, i18n-Fallbacks oder lokalen Loader-Fallbacks auffüllen.

### 5.5 CRM → E-Mail später

- CRM-E-Mail ist ein späterer Vertrag nach Legal-/Consent-/Sender-/Unsubscribe-Freeze.
- E-Mail-Repo-Drafts dürfen als redaktionelle Vorlage dienen, aber nicht als produktive Runtime-Wahrheit.
- CRM darf keine E-Mail senden, die auf ungeprüfte Legal-Texte, fehlende Consent-Versionen oder ungeprüfte Übersetzungen verweist.

### 5.6 CRM → Kalender später

- Kalender-/Callback-Anbindung ist später über `crm.calendar.*` oder `crm.callback.*` zu modellieren.
- Calendar URL, Provider IDs, Queue-/Owner-Routing und externe CRM/GHL/Calendly-IDs dürfen nicht vorab frei in Website-/Loader-Config geschrieben werden.
- Bis zur Freigabe bleibt `sections.callback.calendar_url` bzw. ein späterer Scheduling-Key read-only oder deaktiviert.

## 6. No-Go-Regeln

CRM darf nicht:

1. Lokale Repo-Fallbacks als echte Kundenconfig interpretieren.
2. i18n-Fallbacks, Komponenten-Fallbacks oder Loader-Fallbacks überschreiben.
3. Legal-Texte automatisch generieren, umformulieren oder ändern.
4. Consent-Versionen, Review-Status, Freigabedaten oder Reviewer verändern.
5. Engine-/Proxy-URLs ohne explizite technische Freigabe ändern.
6. Service Role Keys, Secrets, private Tokens oder nicht-öffentliche Credentials im Frontend speichern.
7. Produktive Loader-Werte ohne Migrationsplan, Rollback und Kompatibilitätsnachweis überschreiben.
8. `TB_BOOTSTRAP`-Werte als CRM-editierbare Stammdaten behandeln.
9. `location_id` oder Tenant-Isolation aus Query-Parametern ableiten und unvalidiert für andere Kunden verwenden.
10. Supabase anon keys frei editierbar machen oder mit Secret Keys vermischen.
11. `runtime_config`, `url_config`, Engine-Versionen oder Proxy-Pfade als Content behandeln.
12. Survey-Pflichtfelder, Branching, Validierung oder Consent Gates lockern.
13. Generated Offer Content, Preise, Anbieter, Tarifdaten oder KI-Fazit als Content-Template zurückschreiben.
14. Fehlende Übersetzungen automatisch in die 12-Sprachen-Struktur schreiben.
15. Deutsch als Source of Truth durch ungeprüfte Übersetzungen ersetzen.
16. Kromen-, Template-, Hauptrepo- oder E-Mail-Repo-Werte in Ehiogie-Kundenconfig übernehmen.
17. Produktive Website-, Survey-, Offer- oder E-Mail-Texte ohne Review-Prozess live ändern.
18. Legal-/Consent-Pflichtwerte durch Marketing- oder CRM-Copy ersetzen.

## 7. Finale Checkliste

### 7.1 Muss vor CRM Foundation erledigt sein

- [ ] Legal-/Consent-Freeze für Impressum, Datenschutz, Cookie/Consent, Survey Consent, Privacy URLs, Pflichtfelder und Review-/Freigabe-Status ist bestätigt.
- [ ] Loader-/URL-/Runtime-Vertrag für `start.html`, `auftrag.html`, `rechnung.html`, `tarif.html`, Query-Parameter, `TB_BOOTSTRAP`, Supabase, Engine URLs, Proxy URLs, Offer/Success/Error/Callback URLs ist abgenommen.
- [ ] CRM-writable/read-only Grenzen sind in Schema, Rollenmodell, Audit-Log und Preview/Review-Prozess überführt oder als read-first blockiert.
- [ ] Website-, Survey-, Offer- und spätere Email/CRM-Content-Key-Familien sind eindeutig content-, legal-, engine- oder design-owned.
- [ ] Deutsch (`de`) ist als Source of Truth bestätigt und die 12-Sprachen-Fallback-Regeln sind dokumentiert.
- [ ] Handoff-Regeln Website → Survey → Auftrag → Offer → CRM sind fachlich und technisch abgenommen.
- [ ] No-Go-Regeln sind als CRM-Guardrails akzeptiert.
- [ ] Bekannte P0-Blocker/Referenzen aus Cleanup und Acceptance sind als erledigt, nicht-blockierend oder separater Folge-Task markiert.
- [ ] Bestätigung liegt vor: keine CRM-Schreiboperation gegen produktive Loader-, Legal-, Engine-, URL-, Secret- oder i18n-/Fallback-Werte.

### 7.2 Darf parallel zum CRM Foundation Issue laufen

- [ ] Read-only CRM-Discovery gegen freigegebene Tenant-/Lead-/Offer-Kontexte.
- [ ] CRM-Schemaentwurf für Lead-, Contact-, Pipeline-, Tag-, Handoff-, Callback- und E-Mail-Metadaten.
- [ ] Audit-Log-/Rollenmodell-/Preview-Konzept für spätere Config-Schreibrechte.
- [ ] Mapping-Dokumentation von Survey-/Offer-Handoff-Feldern zu CRM-Feldern.
- [ ] E-Mail-/Kalender-Konzept ohne produktive Aktivierung und ohne Änderung am E-Mail-Repo.
- [ ] Monitoring-/Observability-Konzept für fehlende Pflichtkonfigurationen.

### 7.3 Wird bewusst nach CRM verschoben

- [ ] Vollständige Entfernung lokaler Repo-, i18n- und Loader-Fallbacks.
- [ ] Vollständige 12-Sprachen-Migration und Übersetzungspolitur aller Website-, Survey-, Offer- und E-Mail-Texte.
- [ ] Breiter Copy-Polish, Canva-/Marketing-Copy-Abgleich und optionale UI-/UX-Verbesserungen.
- [ ] Vollständige Harmonisierung von `webseite_design_config` und `design_config`.
- [ ] Layout-Dynamisierung über alle Sections.
- [ ] Kromen Catch-up.
- [ ] Template-Cleanup.
- [ ] E-Mail-Repo-Productionization.
- [ ] Entfernung alter Supabase-/Loader-Aliase nach produktiver Migration.

## 8. Freeze-Bestätigung

Dieser P0-Freeze bestätigt ausschließlich den Dokumentationsvertrag für CRM-Startfähigkeit. Er ändert keine Runtime, keine UI, keine sichtbaren Texte, keine Übersetzungen, keine Supabase-Daten, keine Migrationen, kein SQL, keinen Deploy und keine Loader-Logik. CRM Foundation muss mit diesen Grenzen starten: read-first, explizite Schreibfreigaben, Legal-/Engine-/Design-/Content-Ownership und keine Interpretation technischer Fallbacks als echte Kundenkonfiguration.
