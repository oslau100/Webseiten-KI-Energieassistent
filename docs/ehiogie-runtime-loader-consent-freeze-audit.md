# Ehiogie Runtime-/Loader-/Consent-Freeze-Audit

**Stand:** 2026-06-01
**Tenant / Location:** Ehiogie `tn90CyE3XuYFTy4c1M3F`
**Ziel:** finale Dokumentation des aktuellen produktiven Runtime-, Loader-, URL- und Consent-Vertrags vor CRM-Start und vor späterem Kromen-Catch-up.
**Änderungsumfang dieses Audits:** ausschließlich Dokumentation. Keine Runtime-, Loader-, UI-, Text-, Übersetzungs-, Consent-, Supabase-, SQL- oder Deploy-Änderung.

## 0. Executive Summary

Ehiogie ist produktiv und muss bis CRM-Start als Runtime-Freeze behandelt werden. Die produktiven Funnel-Loader werden über React-Seiten als same-origin-iframes eingebettet und laden anschließend Supabase-Konfiguration, Design-Overrides und Engine-Skripte. Der aktuelle Stand ist grundsätzlich freeze-fähig, aber die produktiven Verträge sind eng gekoppelt an:

- `locationId = tn90CyE3XuYFTy4c1M3F`
- Supabase-Projekt `https://oynhnhkldvpoqhsfirwf.supabase.co`
- öffentliche Engine-Assets im Bucket `engine-assets`
- Edge Functions `setting-proxy`, `closing-proxy`, `rechnung-proxy`
- Website-URLs auf `https://www.ehiogie-energieassistent.de`
- Query-Parameter `uuid`, `submission_id`, `lang`, in einem Sonderfall `location_id`
- Survey-/Offer-Daten in `kunden_config` und `auftraege`

Der Freeze ist ein **Kompatibilitäts-Freeze**, kein Code-Freeze für alle Zeiten. Bis CRM und Kromen-Catch-up dürfen Loader-Contracts nur dokumentiert, nicht verändert werden. CRM darf an bestätigten Handoff-Punkten lesen/anschließen, aber nicht Loader-, Engine-, Consent-, Pflichtfeld- oder Redirect-Logik übernehmen.

## 1. Scope, Quellen und Nicht-Ziele

### 1.1 Geprüfte Loader

| Datei | Rolle | Produktiver Freeze-Status |
|---|---|---|
| `public/loaders/start.html` | Setting-/Start-Survey Bootstrap | Eingefroren bis CRM/Kromen-Catch-up |
| `public/loaders/auftrag.html` | Closing-/Auftrag-Survey Bootstrap | Eingefroren bis CRM/Kromen-Catch-up |
| `public/loaders/rechnung.html` | Rechnung-/Upload-Survey Bootstrap | Eingefroren bis CRM/Kromen-Catch-up |
| `public/loaders/tarif.html` | Angebots-/Tarif-Renderer auf Basis von `auftraege` | Eingefroren bis CRM/Kromen-Catch-up |

### 1.2 Mitgeprüfte Einbettung und Legal-Flows

- React-Routen und iframe-Einbettung: `/start`, `/auftrag`, `/rechnung`, `/tarif`.
- Cookie-/Website-Consent: `CookieBar`.
- Legal-Links: `/datenschutz`, `/impressum`.
- Rückruf-/Kalender-Handoff: `/rueckruf-anfordern`.
- Website-Konfigurationsauflösung: Repo-Fallback + Supabase-Konfiguration.

### 1.3 Explizite Nicht-Ziele

Nicht durchgeführt und weiterhin verboten im Freeze-Kontext:

- Runtime-Codeänderung
- Loader-Änderung
- UI-Änderung
- Text-/Übersetzungsänderung
- Consent-Änderung
- Supabase-Schreiboperation
- Migration / SQL
- Deploy
- Kromen-, Template-, Hauptrepo- oder E-Mail-Repo-Änderungen

## 2. Loader-Struktur-Audit

### 2.1 Gemeinsame iframe-Struktur

Die Seiten `/start`, `/auftrag`, `/rechnung` und `/tarif` rendern jeweils einen same-origin iframe auf `/loaders/*.html` und übernehmen die aktuelle Query-String-Weitergabe unverändert via `location.search`.

| React-Seite | iframe `src` | Titel | Query-Propagation | Höhenlogik |
|---|---|---|---|---|
| `/start` | `/loaders/start.html${location.search}` | `Setting Survey Loader` | unverändert | `ResizeObserver` auf iframe-Dokument |
| `/auftrag` | `/loaders/auftrag.html${location.search}` | `Closing Survey Loader` | unverändert | `ResizeObserver` auf iframe-Dokument |
| `/rechnung` | `/loaders/rechnung.html${location.search}` | `Rechnung Survey Loader` | unverändert | `ResizeObserver` auf iframe-Dokument |
| `/tarif` | `/loaders/tarif.html${location.search}` | `Angebotsseite Loader` | unverändert | `ResizeObserver` auf iframe-Dokument |

**Freeze-Regel:** Die iframe-URLs, Query-Weitergabe, `scrolling="no"`, same-origin-Annahme und automatische Höhenmessung dürfen bis CRM/Kromen-Catch-up nicht refactored werden. CRM darf nicht versuchen, diese iframes durch eigene Embeds zu ersetzen.

### 2.2 `public/loaders/start.html`

#### Bootstrap und harte Werte

`start.html` definiert `window.TB_BOOTSTRAP` mit:

- `locationId`: `tn90CyE3XuYFTy4c1M3F`
- `supabaseUrl`: `https://oynhnhkldvpoqhsfirwf.supabase.co`
- `supabaseKey`: öffentlicher Supabase anon key aus dem Loader
- `settingEngineUrl`: `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/engine-assets/setting-survey-engine.js`
- `closingEngineUrl`: aktuell ebenfalls im Bootstrap vorhanden, aber im Start-Loader nicht als aktive Engine genutzt
- `settingProxyPath`: `https://oynhnhkldvpoqhsfirwf.supabase.co/functions/v1/setting-proxy`
- `closingProxyPath`: aktuell im Bootstrap vorhanden, aber im Start-Loader nicht als aktiver Proxy genutzt
- `offerUrl`: `https://www.ehiogie-energieassistent.de/tarif`
- `auftragUrl`: `https://www.ehiogie-energieassistent.de/auftrag`
- `startUrl`: `https://www.ehiogie-energieassistent.de/start`
- `avatarUrl`: `https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69d3fc76bc1d4a17f7def171.png`

#### Bootstrap-Flow

1. Loader liest `TB_BOOTSTRAP` und `window.location.search`.
2. `locationId` wird aus `bootstrap.locationId` oder fallbackweise aus Query `location_id` gelesen.
3. `supabaseUrl`, `supabaseKey`, `offerUrl`, `settingProxyPath`, `settingEngineUrl`, `avatarUrl` kommen aus Bootstrap.
4. Loader validiert `locationId`, `supabaseUrl`, `supabaseKey`.
5. Loader liest `kunden_config` per `.eq('location_id', config.locationId).single()`.
6. `window.KUNDEN_DATA` wird gesetzt.
7. `runtime_config` überschreibt `avatar_url`, `setting_proxy_path`, `setting_engine_url`.
8. `url_config.offer_base_url` überschreibt `offerUrl`.
9. Design wird aus `design_config.brand`, `design_config.survey` und `setting_survey_design` gemerged.
10. Engine wird über `fetch(engineUrl + ?v=Date.now())` geladen und als Inline-Skript in `document.body` eingefügt.

#### Query-Contract

| Parameter | Verwendung | Stabilität |
|---|---|---|
| `location_id` | nur fallback für `locationId`, falls Bootstrap keinen Wert liefert | Muss kompatibel bleiben, aber Bootstrap bleibt Source of Truth |
| alle weiteren Parameter | werden vom React-Router an den iframe weitergegeben; Auswertung ggf. durch Engine | Nicht entfernen/filtern |

#### Fallback-/Fehlerverhalten

- Fehlen `locationId`, `supabaseUrl` oder `supabaseKey`, wirft der Loader einen Fehler.
- Fehlt `setting_engine_url`, wird ein Fehler ausgelöst.
- Catch zeigt hart codiert: `Fehler beim Laden.`
- Engine-URL wird cache-bustend mit `v=Date.now()` geladen.

#### Runtime-Annahmen

- `supabase-js@2` ist via jsDelivr erreichbar.
- Supabase anon key darf im Browser verwendet werden.
- Tabelle `kunden_config` ist per anon key lesbar nach `location_id`.
- `runtime_config.setting_engine_url` und `runtime_config.setting_proxy_path` dürfen, falls gesetzt, Bootstrap-Werte überschreiben.
- Engine erwartet `window.SURVEY_CONFIG`, `window.KUNDEN_DATA` und ggf. `survey-app` als Mountpunkt.

### 2.3 `public/loaders/auftrag.html`

#### Bootstrap und harte Werte

`auftrag.html` nutzt denselben Ehiogie-Bootstrap-Block wie `start.html`. Produktiv aktiv sind insbesondere:

- `locationId`
- `supabaseUrl`
- `supabaseKey`
- `closingEngineUrl`
- `closingProxyPath`
- `offerUrl`

#### Bootstrap-Flow

1. Loader liest `TB_BOOTSTRAP`.
2. Initiale `config` enthält `locationId`, Supabase-Werte, `closingEngineUrl`, `closingProxyPath`, `offerUrl`.
3. Loader liest `lang` und `uuid` aus der aktuellen URL und legt sie als `config.langOverride` und `config.uuidOverride` ab.
4. Loader validiert `locationId`, `supabaseUrl`, `supabaseKey`.
5. Loader liest `kunden_config` für `locationId`.
6. `window.KUNDEN_DATA` wird gesetzt.
7. `runtime_config.closing_engine_url` und `runtime_config.closing_proxy_path` überschreiben Bootstrap-Werte.
8. `url_config.offer_base_url` überschreibt `offerUrl`.
9. Design wird aus `design_config.brand`, `design_config.survey`, `closing_survey_design` oder `setting_survey_design` gemerged.
10. Engine wird per `<script src="engineUrl?...v=Date.now()" async>` geladen.

#### Query-Contract

| Parameter | Verwendung | Stabilität |
|---|---|---|
| `uuid` | wird als `uuidOverride` an Engine-Kontext weitergegeben | Breaking-Verbot |
| `lang` | wird als `langOverride` an Engine-Kontext weitergegeben | Breaking-Verbot |
| sonstige Parameter | werden durch iframe-URL erhalten; potentielle Engine-Verwendung | Nicht filtern |

#### Fallback-/Fehlerverhalten

- Fehlende Bootstrap-Basiswerte lösen Fehler aus.
- Fehlende `closing_engine_url` löst Fehler aus.
- Script-Load-Fehler zeigt `Engine konnte nicht geladen werden (Bucket Asset nicht erreichbar).`.
- Allgemeiner Catch zeigt `Fehler beim Laden. Bitte versuche es erneut.`.

#### Runtime-Annahmen

- Closing Engine liest `window.SURVEY_CONFIG.closingProxyPath`, `offerUrl`, `langOverride`, `uuidOverride`.
- `uuid` muss von Angebot/Website stabil an Auftrag übergeben werden.
- `lang` muss stabil für Sprache/Legal-/Consent-Texte weitergegeben werden.

### 2.4 `public/loaders/rechnung.html`

#### Bootstrap und harte Werte

`rechnung.html` hat einen eigenen Bootstrap-Vertrag:

- `locationId`: `tn90CyE3XuYFTy4c1M3F`
- `supabaseUrl`: `https://oynhnhkldvpoqhsfirwf.supabase.co`
- `supabaseKey`: öffentlicher Supabase anon key aus dem Loader
- `rechnungEngineUrl`: `https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/engine-assets/rechnung-survey-engine.js`
- `rechnungProxyPath`: `https://oynhnhkldvpoqhsfirwf.supabase.co/functions/v1/rechnung-proxy`
- `rechnungSuccessUrl`: `https://www.ehiogie-energieassistent.de/rechnung-eingegangen`
- `rechnungErrorUrl`: `https://www.ehiogie-energieassistent.de/rechnung-fehler`
- `privacyUrl`: `https://www.ehiogie-energieassistent.de/datenschutz`

#### Bootstrap-Flow

1. Loader liest `TB_BOOTSTRAP`.
2. Loader validiert `locationId`, `supabaseUrl`, `supabaseKey`.
3. Loader liest `kunden_config` für `locationId`.
4. `window.KUNDEN_DATA` wird gesetzt.
5. `runtime_config.rechnung_proxy_path` und `runtime_config.rechnung_engine_url` überschreiben Bootstrap-Werte.
6. `url_config.rechnung_success_url`, `url_config.rechnung_error_url`, `url_config.privacy_url` überschreiben Bootstrap-Werte.
7. Design wird aus `design_config.brand`, `design_config.survey` und `setting_survey_design` gemerged.
8. Engine wird per `<script src="engineUrl?...v=Date.now()" async>` geladen.

#### Query-Contract

Der Loader selbst wertet keine Query-Parameter aus. Alle Query-Parameter bleiben aber über den iframe-`src` erhalten und können von der Rechnungs-Engine gelesen werden.

#### Fallback-/Fehlerverhalten

- Fehlende Bootstrap-Basiswerte lösen Fehler aus.
- Fehlende `rechnung_engine_url` löst Fehler aus.
- Script-Load-Fehler zeigt `Engine aktuell nicht erreichbar. Bitte Seite neu laden oder später erneut versuchen.`.
- Allgemeiner Catch zeigt `Fehler beim Laden der Konfiguration. Bitte später erneut versuchen.`.
- Fatal-Card-Titel: `Rechnung-Survey konnte nicht geladen werden`.

#### Runtime-Annahmen

- Rechnungs-Engine erwartet `window.SURVEY_CONFIG.proxyPath`, `successUrl`, `errorUrl`, `privacyUrl`.
- Success/Error Redirects sind URL-owned und dürfen nicht von CRM überschrieben werden.
- Privacy-Link ist Legal-owned und rechtlich eingefroren.

### 2.5 `public/loaders/tarif.html`

#### Bootstrap und harte Werte

`tarif.html` nutzt denselben Ehiogie-Bootstrap-Block wie `start.html`; produktiv aktiv sind:

- `locationId`
- `supabaseUrl`
- `supabaseKey`
- `auftragUrl`
- `startUrl`

`offerUrl`, Engine- und Proxy-Werte sind im Bootstrap vorhanden, werden im Offer-Renderer selbst aber nicht als aktive Engine-URLs verwendet.

#### Bootstrap-Flow

1. Loader liest `TB_BOOTSTRAP`.
2. Loader validiert `supabaseUrl` und `supabaseKey`.
3. Supabase Client wird erzeugt.
4. `PATHS.auftrag` und `PATHS.start` kommen aus Bootstrap oder fallbackweise `/auftrag`, `/start`.
5. Design wird aus `kunden_config.design_config` anhand `locationId` geladen.
6. Query muss `uuid` oder `submission_id` enthalten.
7. Loader liest genau einen Datensatz aus `auftraege` per `uuid` oder `submission_id`.
8. Sprache kommt aus Query `lang`, fallback `row.language`, fallback `de`.
9. Offer-Inhalte, Tarifdaten und KI-Texte werden aus `auftraege` gerendert.
10. CTA-URLs werden mit `uuid` und `lang` gebaut.
11. Navigation nutzt bevorzugt `window.top.location.href`, sonst `window.location.href`.

#### Query-Contract

| Parameter | Verwendung | Stabilität |
|---|---|---|
| `uuid` | primärer Schlüssel zur `auftraege`-Abfrage und Weitergabe an Auftrag/Start | Absolutes Breaking-Verbot |
| `submission_id` | alternativer Schlüssel zur `auftraege`-Abfrage | Absolutes Breaking-Verbot |
| `lang` | Sprache für Offer und Weitergabe an Auftrag/Start | Absolutes Breaking-Verbot |

#### Fallback-/Fehlerverhalten

- Fehlen `supabaseUrl` oder `supabaseKey`, wird ein Fehler geworfen.
- Fehlen `uuid` und `submission_id`, wird `Fehlende URL-Parameter: uuid oder submission_id` ausgelöst.
- Findet die Abfrage keinen Auftrag, wird `Kein Auftrag gefunden.` ausgelöst.
- UI-Fallback im Catch setzt: `Konnte Daten nicht laden.`, Label `Fehler`, Details = Fehlermeldung.
- Fehlt `lang` oder ist unbekannt, fällt der Loader auf `de` zurück.

#### Runtime-Annahmen

- `auftraege` ist per anon key für die benötigten Felder lesbar.
- `uuid` bleibt stabil über Website → Offer → Auftrag.
- `submission_id` bleibt als Legacy-/Fallback-Identifier kompatibel.
- `row.language` bleibt als Sprachfallback erhalten.
- `ai_content`, Tarif- und Einsparfelder behalten Struktur/Benennung für Offer-Rendering.

## 3. Runtime Contract

### 3.1 Produktiv kritische URLs

| Kategorie | Aktueller Wert | Owner | Freeze-Regel |
|---|---|---|---|
| Website Domain | `https://www.ehiogie-energieassistent.de` | Website/Runtime | Muss für alle produktiven Links kompatibel bleiben |
| Supabase URL | `https://oynhnhkldvpoqhsfirwf.supabase.co` | Runtime/Supabase | Nicht ändern ohne vollständige Migration |
| Setting Engine | `/storage/v1/object/public/engine-assets/setting-survey-engine.js` | Engine/Runtime | Nicht ändern ohne Engine-Migration und Cache-/Rollback-Plan |
| Closing Engine | `/storage/v1/object/public/engine-assets/closing-survey-engine.js` | Engine/Runtime | Nicht ändern bis CRM/Kromen-Catch-up |
| Rechnung Engine | `/storage/v1/object/public/engine-assets/rechnung-survey-engine.js` | Engine/Runtime | Nicht ändern bis CRM/Kromen-Catch-up |
| Setting Proxy | `/functions/v1/setting-proxy` | Runtime/Supabase | Nicht breaking ändern |
| Closing Proxy | `/functions/v1/closing-proxy` | Runtime/Supabase | Nicht breaking ändern |
| Rechnung Proxy | `/functions/v1/rechnung-proxy` | Runtime/Supabase | Nicht breaking ändern |
| Offer URL | `/tarif` | Offer/Funnel | Muss `uuid`/`submission_id`/`lang` kompatibel halten |
| Auftrag URL | `/auftrag` | Closing/Funnel | Muss `uuid`/`lang` kompatibel halten |
| Start URL | `/start` | Setting/Funnel | Muss Query-Forwarding behalten |
| Rechnung Success | `/rechnung-eingegangen` | Invoice/Funnel | CRM darf nicht überschreiben |
| Rechnung Error | `/rechnung-fehler` plus Route-Alias `/fehler-rechnung` | Invoice/Funnel | Beide kompatibel halten |
| Datenschutz | `/datenschutz` | Legal | Nicht ohne Legal-Freigabe ändern |
| Impressum | `/impressum` | Legal | Nicht ohne Legal-Freigabe ändern |
| Rückruf | `/rueckruf-anfordern` | Website/CRM Scheduling | CRM darf später an Kalenderdaten anschließen, aber nicht Legal-/Funnel-Contracts ändern |

### 3.2 Aktuell hardcoded

| Wert | Ort | Später config-driven? | Bis CRM/Kromen stabil? |
|---|---|---|---|
| Ehiogie `locationId` | alle Loader | Ja, tenant-config | Ja |
| Supabase URL / anon key | alle Loader | Ja, Runtime Config/Environment | Ja |
| Engine Asset URLs | Loader Bootstrap; teilweise runtime-overridable | Ja, `runtime_config` | Ja |
| Proxy URLs | Loader Bootstrap; teilweise runtime-overridable | Ja, `runtime_config` | Ja |
| Website Funnel URLs | Loader Bootstrap; teilweise `url_config` | Ja, `url_config` | Ja |
| Error-/Fallback-Texte | Loader/Repo | Teilweise ja, nach Legal/UX-Freigabe | Ja |
| Cookie Consent Storage-Key | `cookie-consent` | Nein / nur mit Migration | Ja |
| Cookie Max-Age | 180 Tage | Ja, Legal Config denkbar | Ja |
| Cookie Domain | `.ehiogie-energieassistent.de` | Tenant-spezifisch | Ja |
| CDN Avatar URL | Loader Bootstrap; `runtime_config.avatar_url` override | Ja | Ja |

### 3.3 Später config-driven, aber jetzt nicht anfassen

Diese Werte sollen langfristig in eine zentrale Tenant-/Runtime-Konfiguration, dürfen aber vor CRM/Kromen nicht geändert werden:

- Supabase-Projekt-URL und anon key pro Tenant/Environment.
- Engine-Asset-URLs pro Funnel.
- Proxy-/Edge-Function-URLs pro Funnel.
- Funnel-Ziel-URLs (`offer_base_url`, Auftrag, Start, Success/Error).
- Privacy-/Impressum-/Legal-URLs.
- Survey-Consent-Texte und Consent-Versionen.
- Callback-/Kalender-URL.
- Avatar-/Brand-/Designwerte.

### 3.4 Nicht breaking änderbare Runtime-Parameter

Folgende Parameter sind für externe Handoffs, Bookmarks, iframe-Forwarding und Engine-Logik eingefroren:

| Parameter | Kontext | Breaking verboten, weil... |
|---|---|---|
| `uuid` | Offer, Auftrag, Start/Change | primärer Auftrags-/Offer-Identifier |
| `submission_id` | Offer | Legacy-/Fallback-Identifier |
| `lang` | Offer, Auftrag, ggf. Engine | Sprach- und Consent-Kontext |
| `location_id` | Start fallback, Website Runtime Query | Tenant-Kontext/Fallback |
| `locationId` | Website Runtime Query Alias | bestehender Alias in Website-Konfigurationsauflösung |
| `supabase_url` | Website Runtime Query | Runtime Bootstrap-Fallback |
| `supabase_key` | Website Runtime Query | Runtime Bootstrap-Fallback |

**Freeze-Regel:** Parameter dürfen ergänzt, aber nicht umbenannt, entfernt, semantisch geändert oder in Redirects verloren werden.

## 4. Consent / Legal Runtime Audit

### 4.1 Cookie Banner

Aktueller Cookie-Banner-Contract:

- Storage-Key: `cookie-consent`.
- Werte: `all` oder `essential`.
- Speicherung: `localStorage` plus Cookie.
- Cookie `Path=/`, `Max-Age=15552000` Sekunden / 180 Tage, `SameSite=Lax`.
- Cookie-Domain nur für `ehiogie-energieassistent.de` oder Subdomains: `.ehiogie-energieassistent.de`.
- `Secure` nur bei HTTPS.
- Marketing ist initial im sichtbaren Banner eingeschaltet, kann aber vor Speichern deaktiviert werden.
- Essenziell ist immer aktiv und disabled.
- Links im Banner: `/datenschutz`, `/impressum`.

**Freeze-Regel:** Storage-Key, Werte, Cookie-Domain, Linkziele, Pflichtkategorie und UX-Verhalten nicht vor Legal-/Consent-Migration ändern.

### 4.2 Consent-Texte: repo-basiert vs. config-driven

| Bereich | Aktueller Ursprung | Details | Freeze-Regel |
|---|---|---|---|
| Cookie Banner | `useWebsiteConfig().getText(...)` mit Repo-Fallback | `cookie.title`, `cookie.copy_intro`, `cookie.essential_*`, `cookie.marketing_*`, `cookie.privacy_link`, `cookie.imprint_link`, Buttons | Rechtlich einfrieren; Änderung nur Legal-owned |
| Datenschutz/Impressum Links im Cookie Banner | Repo-Routen `/datenschutz`, `/impressum` | Linkpfade sind hart in React-Komponente | Nicht ändern |
| Footer Legal Links | i18n + `withLang('/datenschutz')`, `withLang('/impressum')` | sprachpropagierende Legal-Links | Nicht breaking ändern |
| Rechnungs-Privacy URL | `url_config.privacy_url` oder Bootstrap `privacyUrl` | in `window.SURVEY_CONFIG.privacyUrl` | Legal-owned, stabil halten |
| Survey Consent Texte | Engine-/Config-getrieben plus Loader-CSS/Container | konkrete Texte liegen nicht vollständig im Repo-Loader; Loader stellt Consent-UI-Klassen bereit | Nicht ohne Engine-/Legal-Audit ändern |
| Loader Error-/Fallback-Texte | hart im jeweiligen Loader | sichtbar bei Konfigurations-/Enginefehlern | Bis CRM nicht ändern |
| Website Legal-Seiten | React-Routen `/datenschutz`, `/impressum` und Website Config/Fallbacks | Inhalte können config-driven sein | Keine Legal-Textänderung in diesem Freeze |

### 4.3 Rechtlich eingefroren

Bis CRM-Start rechtlich eingefroren:

- Cookie-Banner-Texte und Kategorieverhalten.
- Datenschutz- und Impressum-URLs.
- Survey-Consent-Pflichtbindung in Setting, Closing und Rechnung.
- Rechnungs-Upload-Privacy-Link.
- Consent-/Legal-Hinweise in Engines.
- Error-/Fallback-Texte, soweit sie Nutzer rechtlich/operativ informieren.

### 4.4 Später migrierbar

Später in kontrollierter Migration migrierbar, aber nicht jetzt:

- Cookie-Texte und Consent-Versionen in `legal.cookie_consent.*`.
- Survey-Consent-Texte in `legal.survey_consent.setting/closing/invoice.*`.
- Legal-URLs in tenant-spezifische URL-Konfiguration.
- Consent-Audit-Referenzen in Lead-/Auftrags-/Rechnungsdatensätzen.
- Kalender-/Callback-Hinweise in CRM-/Scheduling-Konfiguration.

## 5. Offer-/Survey-Handoff

### 5.1 Website → Setting Survey

- Website-Route `/start` bettet `/loaders/start.html${location.search}` ein.
- Loader nutzt `locationId` aus Bootstrap oder fallback `location_id`.
- Setting Engine erhält `window.SURVEY_CONFIG` mit `settingProxyPath`, `offerUrl`, `avatarUrl`, Supabase-Werten und Kundenkonfiguration.
- Harte Verträge: iframe-Query-Weitergabe, `setting-proxy`, `setting_engine_url`, `offer_base_url`, `locationId`.
- CRM darf hier frühestens nach Lead-Erzeugung lesen, aber nicht Setting-Fragen, Consent, Pflichtfelder, Proxy-Format oder Redirect zur Offer-Seite ändern.

### 5.2 Setting → Auftrag / Offer

- Setting Survey führt produktiv zum Offer unter `/tarif` bzw. `offer_base_url`.
- Offer erwartet `uuid` oder `submission_id`; ohne einen dieser Parameter kann kein Auftrag geladen werden.
- Offer-CTA baut `/auftrag?uuid=...&lang=...`.
- `Angebot ändern` baut `/start?uuid=...&lang=...`.
- Harte Verträge: `uuid`, `submission_id`, `lang`, `auftraege`-Felder, `offer_base_url`, `auftragUrl`, `startUrl`.
- CRM darf Offer-Status lesen und Follow-ups planen, aber nicht Offer-Renderer, Tarifdaten, KI-Content oder CTA-Parameter mutieren.

### 5.3 Auftrag / Closing → GHL / CRM

- Auftrag-Route `/auftrag` bettet `auftrag.html` ein.
- Closing Engine erhält `uuidOverride` und `langOverride` aus Query.
- Closing Engine nutzt `closingProxyPath` und `offerUrl`.
- CRM/GHL darf nach Abschluss/Submission anschließen, aber nicht:
  - `closing-proxy` Payload-Contract ohne Versionierung verändern,
  - Consent-/Pflichtfeldlogik lockern,
  - `uuid`/`lang` verlieren,
  - Offer-/Success-/Error-Redirects umbiegen,
  - Loader oder Engine ersetzen.

### 5.4 Rechnung → GHL / CRM

- Rechnung-Route `/rechnung` bzw. `/start-rechnung` bettet `rechnung.html` ein.
- Rechnungs-Engine nutzt `rechnungProxyPath`, `rechnungSuccessUrl`, `rechnungErrorUrl`, `privacyUrl`.
- CRM darf Rechnungslead-/Upload-Status lesen oder nachgelagerte Kommunikation starten.
- CRM darf nicht Upload-, Consent-, Privacy-, Success/Error- oder Proxy-Contracts ändern.

### 5.5 Offer → CTA

- Offer-CTA setzt `href` auf Auftrag-URL plus `uuid` und `lang`.
- Navigation verwendet top-level redirect, damit iframe-Umgebung verlassen werden kann.
- `tbBtnCta`, `tbBtnCta2`, `tbBtnChange` sind funktionale Contract-Elemente.
- CRM darf keine eigenen CTA-Parameter erzwingen, die `uuid`/`lang` ersetzen oder überschreiben.

### 5.6 Callback → Kalender

- Website-Route `/rueckruf-anfordern` liest `sections.callback.calendar_url` aus Website Config.
- Ist eine URL vorhanden, wird `https://link.msgsndr.com/js/form_embed.js` geladen und ein iframe mit Kalender-URL gerendert.
- Ist keine URL vorhanden, wird ein repo-/config-basierter Disabled-Text gezeigt.
- CRM darf später den Kalender anbinden, aber nur in der dafür vorgesehenen `sections.callback.calendar_url`-Grenze und ohne Legal-/Survey-/Loader-Flows zu beeinflussen.

### 5.7 Success/Error → Redirect

| Funnel | Success | Error | Freeze-Regel |
|---|---|---|---|
| Rechnung | `/rechnung-eingegangen` | `/rechnung-fehler` | URLs kompatibel halten, CRM darf nicht überschreiben |
| Auftrag | Engine-/Proxy-owned; Website enthält `/auftrag-eingegangen`, `/uebermittelt`, `/fehler` | Engine-/Proxy-owned | Nur nach Engine-Audit ändern |
| Setting/Offer | Offer `/tarif` mit Identifier | Loader-/Engine-owned | `uuid`/`submission_id`/`lang` stabil halten |

## 6. Ehiogie Runtime Freeze-Liste

### 6.1 Werte/Contracts, die bis CRM nicht geändert werden dürfen

- `locationId = tn90CyE3XuYFTy4c1M3F`.
- Supabase URL und anon key in den produktiven Loadern.
- Public Engine Asset URLs und deren Script-Ladeverhalten.
- Edge Function URLs: `setting-proxy`, `closing-proxy`, `rechnung-proxy`.
- `kunden_config` Lesecontract nach `location_id`.
- `auftraege` Lesecontract nach `uuid` oder `submission_id` im Offer.
- `window.TB_BOOTSTRAP`, `window.KUNDEN_DATA`, `window.SURVEY_CONFIG` als globale Runtime-Contracts.
- iframe-Einbettung der Loader über `/loaders/*.html${location.search}`.
- Query-Parameter `uuid`, `submission_id`, `lang`, `location_id`.
- Legal URLs `/datenschutz`, `/impressum`.
- Rechnung Success/Error URLs.
- Cookie-Consent Storage-Key und Werte.

### 6.2 Loader, die bis Kromen-Catch-up nicht refactored werden dürfen

- `public/loaders/start.html`
- `public/loaders/auftrag.html`
- `public/loaders/rechnung.html`
- `public/loaders/tarif.html`
- Wrapper-Seiten `/start`, `/auftrag`, `/rechnung`, `/tarif`, soweit iframe- und Query-Contracts betroffen sind.

### 6.3 URLs, die kompatibel bleiben müssen

- `https://www.ehiogie-energieassistent.de/start`
- `https://www.ehiogie-energieassistent.de/tarif`
- `https://www.ehiogie-energieassistent.de/auftrag`
- `https://www.ehiogie-energieassistent.de/rechnung`
- `https://www.ehiogie-energieassistent.de/start-rechnung`
- `https://www.ehiogie-energieassistent.de/rechnung-eingegangen`
- `https://www.ehiogie-energieassistent.de/rechnung-fehler`
- `https://www.ehiogie-energieassistent.de/auftrag-eingegangen`
- `https://www.ehiogie-energieassistent.de/uebermittelt`
- `https://www.ehiogie-energieassistent.de/fehler`
- `https://www.ehiogie-energieassistent.de/datenschutz`
- `https://www.ehiogie-energieassistent.de/impressum`
- `https://www.ehiogie-energieassistent.de/rueckruf-anfordern`

### 6.4 Query-Parameter, die stabil bleiben müssen

- `uuid`
- `submission_id`
- `lang`
- `location_id`
- `locationId`
- `supabase_url`
- `supabase_key`

### 6.5 Consent-Flows, die nicht breaking verändert werden dürfen

- Cookie-Banner: `all` / `essential`, `cookie-consent`, 180 Tage, Ehiogie-Domainlogik.
- Datenschutz-/Impressum-Verlinkung aus Cookie Banner und Footer.
- Survey-Consent-Pflichtfelder in Setting/Closing/Rechnung.
- Rechnungs-Privacy-URL.
- Loader-Fallbacktexte und Engine-Fehlertexte.

## 7. Kromen Catch-up Vorbereitung

### 7.1 Verträge, die für Kromen identisch sein müssen

Kromen sollte später denselben strukturellen Contract bekommen:

- iframe-Seiten je Funnel mit unveränderter Query-Propagation.
- `window.TB_BOOTSTRAP` als Bootstrap-Einstieg.
- `window.KUNDEN_DATA` aus tenant-spezifischem `kunden_config`.
- `window.SURVEY_CONFIG` als Engine-Vertrag.
- Engine-/Proxy-Trennung für Setting, Closing und Rechnung.
- Offer-Identifier `uuid` und Legacy-Fallback `submission_id`.
- `lang`-Propagation vom Survey über Offer bis Auftrag.
- Legal URLs für Datenschutz/Impressum.
- Cookie-Consent Storage- und Kategoriecontract, tenant-sicher angepasst.
- Success/Error-Redirects pro Funnel.

### 7.2 Tenant-spezifisch bleiben müssen

Nicht globalisieren oder blind übernehmen:

- `locationId`.
- Supabase-Projekt/anon key, falls Kromen ein anderes Projekt nutzt.
- Domain und Cookie-Domain.
- Engine-/Proxy-URLs, sofern Kromen eigene Assets/Functions nutzt.
- Offer-/Auftrag-/Start-/Success-/Error-URLs.
- Datenschutz-/Impressum-Inhalte und Links.
- Brand-, Design-, Avatar- und Asset-URLs.
- Callback-/Kalender-URL.
- Texte, Testimonials, Legal-Freigaben und Consent-Versionen.

### 7.3 Dinge, die NICHT von Ehiogie kopiert werden dürfen

- Ehiogie `locationId` `tn90CyE3XuYFTy4c1M3F`.
- Ehiogie Domain `www.ehiogie-energieassistent.de`.
- Ehiogie Cookie-Domain `.ehiogie-energieassistent.de`.
- Ehiogie Legal-Texte oder Legal-Freigabestatus ohne Kromen-Freigabe.
- Ehiogie Avatar-/CDN-Assets.
- Ehiogie Kalender-/Callback-Konfiguration.
- Ehiogie `kunden_config` Inhalte.
- Ehiogie Auftrags-/Offer-Daten.
- Ehiogie Supabase-Projekt, falls Kromen getrennt laufen soll.

## 8. CRM-Grenzen

### 8.1 CRM darf anschließen

CRM darf nachgelagert anschließen an:

- erzeugte Leads/Aufträge/Rechnungsanfragen,
- Status- und Follow-up-Prozesse,
- Kalender-/Callback-Konfiguration,
- Benachrichtigung und Pipeline-Automatisierung,
- lesende Auswertung von `uuid`, `submission_id`, `lang`, Funnel-Status und Consent-Referenzen.

### 8.2 CRM darf NICHT eingreifen

CRM darf nicht:

- Loader-Dateien verändern oder ersetzen,
- Engine-URLs oder Proxy-URLs umbiegen,
- Survey-Pflichtfelder ändern,
- Consent-Texte, Consent-Checkboxen oder Legal-Links verändern,
- `uuid`, `submission_id` oder `lang` überschreiben,
- Success/Error-Redirects ohne Funnel-/Legal-Freigabe steuern,
- Offer-Tarifdaten oder KI-Angebotsinhalte als CRM-Stammdaten überschreiben,
- Supabase-Schema/Policies/Migrationen ohne separates Migrationsprojekt ausführen.

## 9. Migrationsrelevante Hinweise für spätere Supabase-Migration

Für eine spätere sichere Supabase-Migration müssen vorab versioniert und getestet werden:

- `kunden_config` Leserechte und Felder:
  - `runtime_config`
  - `url_config`
  - `design_config`
  - `setting_survey_design`
  - `closing_survey_design`
  - Website-Konfigurationen `webseite_*`
- `auftraege` Leserechte und Offer-Felder:
  - `uuid`, `submission_id`, `language`
  - Tarifdaten, Einsparwerte, Anbieter-/Tarifnamen
  - `ai_content`, `ai_usecase`, `case_type`, `spart`
- Edge Functions und Payload-Contracts:
  - `setting-proxy`
  - `closing-proxy`
  - `rechnung-proxy`
- Public Storage Assets:
  - `setting-survey-engine.js`
  - `closing-survey-engine.js`
  - `rechnung-survey-engine.js`
- Legal-/Consent-Referenzen und Versionen.

**Migrationsregel:** Erst Contract-Tests bauen, dann parallel migrieren, dann dual-read/dual-config validieren, dann produktiven Switch durchführen. Kein Direkt-Switch ohne Rollback.

## 10. Finale Ampelbewertung

| Bereich | Ampel | Bewertung | Begründung |
|---|---|---|---|
| Runtime freeze-ready | 🟢 Grün | Ja | Produktive Werte und Query-/URL-Verträge sind identifiziert; keine Änderung nötig. |
| Consent freeze-ready | 🟡 Gelb | Fachlich ja, Legal-final separat bestätigen | Cookie-/Legal-/Survey-Consent-Flows sind identifiziert; rechtliche Textfreigabe bleibt Legal-owned. |
| Loader freeze-ready | 🟢 Grün | Ja | Loader-Struktur ist stabil dokumentiert; Refactor bis Kromen-Catch-up verboten. |
| CRM-ready | 🟡 Gelb | Ja für Anschluss, nein für Eingriff | CRM kann lesen/nachgelagert anschließen, darf aber keine Loader-/Engine-/Consent-Contracts steuern. |
| Kromen-catchup-ready | 🟡 Gelb | Vorbereitet | Struktur ist übertragbar; tenant-spezifische Werte dürfen nicht kopiert werden. |

## 11. Abschließende Freeze-Bestätigung

Dieser Audit dokumentiert den aktuellen produktiven Stand als Freeze-Grundlage für:

- sichere Supabase-Migration,
- CRM-Anbindung,
- Kromen-Angleichung,
- späteren Template-Neuaufbau.

Bestätigung für diesen Dokumentationsstand:

- Keine Runtime-Codeänderung.
- Keine Loader-Änderung.
- Keine UI-Änderung.
- Keine Text-/Übersetzungsänderung.
- Keine Consent-Änderung.
- Keine Supabase-Schreiboperation.
- Keine Migration.
- Kein SQL.
- Kein Deploy.
- Keine Kromen-, Template-, Hauptrepo- oder E-Mail-Repo-Änderung.
