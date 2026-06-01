# Kromen Catch-up-Audit und Umsetzungsstrategie

## 0. Zweck, Scope und unverrückbare Grenzen

Dieses Dokument beschreibt einen technischen Catch-up-Audit für den produktiven Tenant **Kromen** mit dem Ziel, Kromen kontrolliert auf denselben technischen Unterbau vorzubereiten, den der modernere **Ehiogie-Referenzstand** bereits nutzt. Der Zweck ist ausdrücklich **nicht** eine direkte Migration und **nicht** ein blindes Kopieren von Inhalten, URLs, Consent-Texten oder produktiven Loadern.

Der Audit ist als Freeze-sichere Entscheidungsgrundlage zu verstehen: zuerst werden Architektur-, Runtime-, Loader-, Config-, Legal- und Handoff-Unterschiede abgegrenzt; erst danach darf eine phasenweise Umsetzung geplant werden. Alle produktiven Kromen-Funnels bleiben während dieses Audits unverändert.

### Harte No-Go-Grenzen

Für die späteren Catch-up-Phasen gelten folgende Grenzen unverändert:

- Keine Kromen-Texte überschreiben.
- Keine Kromen-URLs ändern.
- Keine Consent-, Datenschutz- oder Impressumsänderungen ohne Legal-Freigabe.
- Keine Loader-Änderungen im Freeze ohne expliziten Loader-Vertragstest.
- Keine Runtime-breaking Änderungen an Query-Parametern, UUID-/Lang-Propagation, Supabase-Keys, Proxy-Pfaden oder Engine-URLs.
- Keine Supabase-Schreiboperationen, keine SQL-Migrationen und kein Deploy als Teil dieses Audit-Schritts.
- Keine Ehiogie-Inhalte nach Kromen kopieren; Ehiogie ist nur technische Referenz.

### Bewertungsgrundlage

Der aktuell geprüfte Kromen-Stand enthält bereits Teile einer config-getriebenen Website-Architektur, ist aber weiterhin hybrid: Website-Content, i18n-Fallbacks, Loader-Bootstrap und produktive Survey-/Offer-Flows existieren nebeneinander. Der Catch-up muss daher in zwei Richtungen sauber trennen:

1. **Tenant-neutrale Technik**, die später angeglichen werden darf.
2. **Kromen-spezifische Verträge und Inhalte**, die unverändert bleiben müssen.

## 1. Architektur-Diff Ehiogie vs. Kromen

### 1.1 Kurzfazit Architektur

| Bereich | Ehiogie-Referenzziel | Kromen Ist-Stand | Breaking-Potenzial |
| --- | --- | --- | --- |
| Config-Resolver | zentraler, tenant-neutraler Resolver mit klaren Layern und Snapshot-Verhalten | `WebsiteConfigProvider` lädt Website-JSON direkt aus `kunden_config` und merged gegen Kromen-Defaults | mittel, weil Pfadnamen und Fallback-Prioritäten produktive Texte beeinflussen können |
| Content Defaults | getrennte Default-/Content-Resolver-Mechanik | `customerDefaults.ts` bündelt Design, Layout, Content und Kromen-Fallbacks | hoch bei unkontrolliertem Ersetzen, weil Kromen-Copy und Legal-Variablen dort liegen |
| Website Content Resolver | explizite Resolver-Funktionen pro Content-Typ, i18n-aware | kein separates `websiteContentDefaults.ts` und kein `websiteContentResolver.ts` vorhanden | mittel bis hoch, weil fehlende Resolver neue Snapshot-Mechanik blockieren |
| i18n | Content-Snapshot als erste Quelle, generische Dictionaries nur als Fallback | `i18n.tsx` nutzt lokale Dictionaries plus `content.i18n`-Overrides | hoch, wenn Prioritäten oder Keys geändert werden |
| Loader | stabiler Runtime-Vertrag pro Flow; tenant-spezifische Bootstrap-Werte bleiben isoliert | vier produktive Loader mit eigenem Bootstrap und direkter Supabase-/Runtime-Auflösung | sehr hoch, weil jeder Loader produktive Funnels startet |
| Runtime-/Query-Contracts | identische Pflichtparameter und deterministische Weitergabe | `lang`, `uuid`, `submission_id`, `location_id` werden je Loader unterschiedlich ausgewertet | hoch bei Harmonisierung ohne Kompatibilitätsadapter |
| Consent/Legal | technisch kompatibel, tenant-rechtlich isoliert | CookieBar, Datenschutz und Impressum sind Kromen-spezifisch mit Config-Overrides | sehr hoch, weil Legal-Texte nicht kopiert werden dürfen |
| Routing/Fallback | klare Route Aliases und Fehlerseiten | Kromen hat mehrere Legacy-/Alias-Routen für Start, Rechnung, Auftrag und Fehler | hoch, wenn Alias-Routen entfernt oder anders priorisiert werden |
| CTA-/Offer-/Survey-Handoffs | zentral konfigurierte Handoffs mit unveränderten Tenant-URLs | Loader und React-Seiten propagieren Suchparameter und bauen Top-Level-Navigation | hoch, weil Funnel-Abbrüche möglich sind |

### 1.2 Config-Resolver-Struktur

**Kromen Ist-Stand**

- `src/lib/websiteConfig.tsx` enthält Provider, Fetch, Deep-Merge, Path-Getter und CSS-Variablen-Anwendung in einer Datei.
- Der Provider liest `location_id`/`locationId`, `supabase_url` und `supabase_key` aus Query-Parametern oder `window.TB_BOOTSTRAP`; sonst fallen feste Kromen-Defaults zurück.
- Remote-Quelle sind die Spalten `webseite_design_config`, `webseite_content_config` und `webseite_layout_config` aus `kunden_config`.
- Die Merge-Strategie ersetzt Arrays vollständig und merged Objekte rekursiv.
- `source` unterscheidet nur `fallback` und `remote`; es gibt keine Snapshot-Versionierung, keinen Resolver-Status pro Layer und keine explizite Kompatibilitätsprüfung.

**Ehiogie-Referenzziel**

- Config-Auflösung sollte tenant-neutral in getrennten Resolvern erfolgen: Bootstrap/Runtime lesen, Tenant-Defaults anwenden, Remote-Config validieren, Snapshot-Layer mergen, dann read-only an Komponenten ausgeben.
- Fehler und fehlende Remote-Konfiguration sollten nicht stillschweigend produktive Texte wechseln, sondern als nicht-blockierende Diagnostics sichtbar sein.
- Resolver-Logik sollte nicht mit Komponenten-Context, CSS-Side-Effects und Fallback-Inhalten in einer Datei vermischt sein.

**Breaking-Unterschiede**

- Eine Änderung der Merge-Reihenfolge kann sichtbare Kromen-Texte, Bilder und CTA-Ziele verändern.
- Array-Replacement ist wichtig: ein Ehiogie-Resolver, der Arrays elementweise merged, könnte FAQ- oder Section-Reihenfolgen verfälschen.
- Query-/Bootstrap-Prioritäten sind Runtime-Vertrag; `TB_BOOTSTRAP` darf nicht plötzlich Query-Parameter überschreiben, wenn Kromen produktiv Query-basierte Loader nutzt.

### 1.3 `websiteConfig.tsx`

Kromen nutzt `websiteConfig.tsx` als monolithischen Config-Kontext. Das ist funktional, aber für Catch-up riskant, weil folgende Verantwortlichkeiten gekoppelt sind:

- Default-Konfiguration importieren.
- Remote-Konfiguration laden.
- Merge-Algorithmus definieren.
- Text-/Array-/Object-Getter bereitstellen.
- CSS Custom Properties setzen.
- Supabase-Endpunkt und Location-Fallback kennen.

Für Ehiogie-kompatible Modernisierung sollte diese Datei in Phase 1 nur intern strukturiert werden, ohne öffentliches API-Verhalten zu ändern. Die öffentlichen Consumer-Verträge `useWebsiteConfig()`, `getText()`, `getArray()`, `getObject()` und `interpolate()` müssen stabil bleiben.

### 1.4 `customerDefaults.ts`

**Kromen Ist-Stand**

`customerDefaults.ts` enthält:

- Design-Fallbacks inklusive Kromen-Assets.
- Layout-Fallbacks für Home und Annual.
- Kromen Brand-, Legal-, Solution-, About- und FAQ-Fallbacks.

Diese Datei ist Kromen-sensibel. Sie ist kein neutraler Template-Default, sondern ein produktiver Tenant-Fallback. Sie darf im Catch-up nicht durch Ehiogie-Defaults ersetzt werden.

**Ehiogie-Referenzziel**

Ehiogie sollte technisch eher zwischen generischen Website-Defaults, Tenant-Defaults und Remote-Snapshot unterscheiden. Für Kromen bedeutet das:

- Kromen-spezifische Werte bleiben in einem Tenant-Default-Layer.
- Generische Resolver-/Schema-Defaults dürfen separat eingeführt werden.
- Snapshot-Defaults dürfen Kromen-Werte nur ergänzen, nie überschreiben.

### 1.5 `websiteContentDefaults.ts` und `websiteContentResolver.ts`

Im Kromen-Stand existieren diese Dateien nicht. Das ist eine zentrale Catch-up-Lücke.

**Fehlende Capability**

- Kein isolierter Content-Default-Katalog.
- Kein expliziter Resolver für lokalisierte Objekte.
- Kein Snapshot-normalisiertes Lesen von Content-Pfaden.
- Kein separater Diagnosepunkt für fehlende Keys.

**Sichere Einführung**

- Phase 1 darf Dateien einführen, aber nur als interne Adapter um bestehendes Verhalten.
- `customerDefaults.ts` bleibt Quelle der Kromen-Fallbacks.
- Neue Resolver müssen bit-identische Rückgaben für bestehende Pfade liefern.
- Erst Phase 3 darf Snapshot-Kompatibilität ergänzen.

### 1.6 i18n Usage

**Kromen Ist-Stand**

- `I18nProvider` liest `lang` aus Query-Parameter, dann aus `localStorage.site_lang`, dann aus Legacy-Key `kromen_lang`, sonst `de`.
- Sprachwechsel schreibt `site_lang` und navigiert per `window.location.assign()` auf dieselbe URL mit `lang`.
- Übersetzungen kommen zuerst aus `content.i18n`, dann aus verschiedenen lokalen Dictionaries, dann aus dem Key selbst.
- Website-Komponenten mischen `t()` für Dictionary-Keys mit `getText()` für config-getriebene Inhalte.

**Ehiogie-Referenzziel**

- Content-Snapshot und i18n sollten klar priorisiert und validiert sein.
- Legacy-Dictionaries bleiben nur Rückfallebene.
- `lang`-Propagation zwischen React-Routen und iframe-Loadern muss identisch bleiben.

**Breaking-Risiken**

- Entfernen von `kromen_lang` als Legacy-Fallback kann Bestandsnutzer anders routen.
- Änderung von `withLang()` kann CTA-/Footer-/Legal-Links beeinflussen.
- Änderung der Priorität `content.i18n > dictionaries` kann sichtbare Texte ändern, wenn Remote-Config unvollständig ist.

### 1.7 Loader-Struktur

Kromen hat vier produktive Loader:

- `public/loaders/start.html` für Setting Survey.
- `public/loaders/tarif.html` für Offer/Tarif-Anzeige.
- `public/loaders/auftrag.html` für Closing Survey.
- `public/loaders/rechnung.html` für Rechnung Survey.

Alle Loader sind produktive Runtime-Flows und dürfen nicht im Audit geändert werden. Sie enthalten tenant-spezifische Bootstrap-Werte, Supabase-Projekt, Engine-URLs, Proxy-Pfade und Kromen-Domain-URLs.

**Ehiogie-Referenzziel**

- Loader-Verträge sollten strukturell gleich sein, damit Engines dieselben Runtime-Keys erwarten können.
- Tenant-spezifische Werte bleiben ausschließlich Bootstrap/DB-Konfiguration.
- Loader-Code sollte keine Ehiogie-Inhalte enthalten.

**Breaking-Punkte**

- `rechnung.html` nutzt andere Runtime-Keys als Setting/Closing.
- `tarif.html` liest Auftragsdaten direkt und navigiert per `window.top.location.href`, was in iframe-Kontexten besonders empfindlich ist.
- `start.html` akzeptiert `location_id` zusätzlich über Query; andere Loader nicht in gleicher Weise.

### 1.8 Runtime-/Query-Contracts

Der Kromen-Funnel verwendet mindestens folgende Runtime-/Query-Verträge:

| Wert | Verwendung | Muss stabil bleiben? | Bemerkung |
| --- | --- | --- | --- |
| `locationId` / `location_id` | Tenant-Auswahl, Supabase-Zeile | ja | Default ist Kromen-Location; Query-Fallback existiert in Website/Start-Kontexten |
| `supabaseUrl` / `supabase_url` | Supabase REST/Client | ja | Darf nicht im Browservertrag umbenannt werden |
| `supabaseKey` / `supabase_key` | Supabase anon key | ja | Kein Secret-Rotationsversuch in Catch-up |
| `lang` | UI-Sprache, Loader-Propagation | ja | Wird in React und Loadern weitergereicht |
| `uuid` | Survey-/Offer-Handoff | ja | Zentral für Tarif zu Auftrag/Start |
| `submission_id` | Offer-Fallback neben UUID | ja | `tarif.html` akzeptiert `uuid` oder `submission_id` |
| `setting_engine_url` | Setting Survey Engine | ja | DB-Runtime-Override vor Bootstrap |
| `closing_engine_url` | Closing Survey Engine | ja | DB-Runtime-Override vor Bootstrap |
| `rechnung_engine_url` | Rechnung Survey Engine | ja | separat vom Setting-/Closing-Vertrag |
| `offer_base_url` | Weiterleitung Tarif | ja | Kromen-Domain bleibt tenant-spezifisch |
| `rechnung_success_url` | Rechnung-Erfolg | ja | Kromen Route bleibt tenant-spezifisch |
| `rechnung_error_url` | Rechnung-Fehler | ja | aktueller Kromen-Fallback beachten |

### 1.9 Consent-/Legal-Struktur

Kromen hat zwei Legal-Ebenen:

1. React-Seiten `Datenschutz` und `Impressum` mit Config-Override-Möglichkeit per HTML.
2. `CookieBar` mit lokalem Consent-State `cookie-consent` und config-getriebenen Label-Fallbacks.

Ehiogie-Technik darf hier nur Struktur liefern, nicht Inhalte. Datenschutz, Impressum, Cookie-Texte, Consent-Kategorien und Survey-Consent-Texte sind tenant-/legal-spezifisch.

### 1.10 Routing-/Fallback-Verhalten

Kromen-Routen enthalten produktive Aliases:

- `/`, `/start`, `/rechnungsprüfung`, `/rechnungspruefung`.
- `/tarif`, `/auftrag`, `/auftrag-eingegangen`, `/uebermittelt`.
- `/rechnung`, `/start-rechnung`, `/rechnung-eingegangen`.
- `/fehler`, `/fehler-rechnung`, `/rechnung-fehler`.
- `/datenschutz`, `/impressum`, `/rueckruf-anfordern`.

Diese Aliases dürfen nicht bereinigt werden, bevor Analytics, Loader, E-Mail-Links, QR-Codes und externe Kampagnen geprüft sind.

### 1.11 CTA-/Offer-/Survey-Handoffs

Die Handoffs sind produktiv eng gekoppelt:

- Landing-/Website-CTAs führen mit Sprache zu `/start`.
- `start.html` startet Setting Survey und nutzt `offerUrl`/`offer_base_url` für Tarif-Handoff.
- `tarif.html` liest `uuid` oder `submission_id`, rendert Angebot und baut finale URLs zu `/auftrag` und `/start` mit `uuid`/`lang`.
- `auftrag.html` startet Closing Survey mit `uuid`/`lang`.
- `rechnung.html` startet Rechnung Survey mit Erfolg-/Fehler-/Datenschutz-URLs.

Ein Catch-up darf die Handoff-Namen nicht ändern. Falls Ehiogie modernere CTA-Abstraktionen nutzt, müssen diese zuerst als Adapter über den bestehenden Kromen-Vertrag gelegt werden.

## 2. Runtime-/Loader-Stand

### 2.1 Loader-Inventar

| Loader | Flow | Aktuelle Runtime-Quelle | Tenant-spezifische Werte |
| --- | --- | --- | --- |
| `start.html` | Setting Survey | `TB_BOOTSTRAP`, `kunden_config.runtime_config`, `kunden_config.url_config`, `kunden_config.design_config` | Location, Supabase, Setting Engine, Setting Proxy, Offer URL, Avatar/Design |
| `tarif.html` | Angebots-/Offer-Seite | `TB_BOOTSTRAP`, `auftraege`, optional `kunden_config.design_config` | Kromen-Domain für Auftrag/Start, Design-Farben, Tabellen-/AI-Daten |
| `auftrag.html` | Closing Survey | `TB_BOOTSTRAP`, `kunden_config.runtime_config`, `kunden_config.url_config`, `kunden_config.design_config` | Location, Closing Engine, Closing Proxy, Offer URL, Design |
| `rechnung.html` | Rechnung Survey | `TB_BOOTSTRAP`, `kunden_config.runtime_config`, `kunden_config.url_config`, `kunden_config.design_config` | Rechnung Engine, Rechnung Proxy, Erfolg-/Fehler-/Datenschutz-URL |

### 2.2 Bootstrap-/iframe-Flow

React-Seiten betten die Loader per same-origin iframe unter `/loaders/*.html` ein und reichen `location.search` unverändert weiter. Die iframe-Höhe wird im Parent über `ResizeObserver` aus `contentDocument` berechnet. Dadurch gelten folgende Verträge:

- Loader bleiben same-origin unter der Website-Domain erreichbar.
- Query-Parameter des Parent-Pfads werden 1:1 an den Loader weitergereicht.
- Loader dürfen nicht auf cross-origin HTML verschoben werden, solange der Parent die iframe-Höhe direkt liest.
- Loader müssen ohne Parent-PostMessage funktionieren.

### 2.3 URL-/UUID-/Lang-Propagation

| Flow | Eingabe | Weitergabe | Risiko |
| --- | --- | --- | --- |
| Website CTA zu Start | `withLang('/start')` | `lang` in URL | Sprachverlust, wenn `withLang` geändert wird |
| Start Loader | optional `location_id`, `lang` indirekt engine-seitig | `offerUrl`/DB `offer_base_url` | falscher Tenant, wenn Location-Priorität geändert wird |
| Tarif Loader | `uuid` oder `submission_id`, optional `lang` | finale `/auftrag?uuid=...&lang=...` und `/start?uuid=...&lang=...` | Funnelbruch, wenn Query-Key umbenannt wird |
| Auftrag Loader | `uuid`, `lang` | `SURVEY_CONFIG.uuidOverride/langOverride` | Closing Survey verliert Kontext |
| Rechnung Loader | Engine-Flow, Success/Error URLs | `rechnung_success_url`, `rechnung_error_url`, `privacy_url` | falsches Routing nach Upload |

### 2.4 Runtime-/Fallback-Verhalten

- Website-Konfiguration fällt bei fehlender Supabase-Konfiguration auf `customerDefaults.ts` zurück.
- Loader brechen bei fehlenden Bootstrap-Pflichtwerten mit sichtbaren Fatal-Fehlern ab.
- Engine-URLs werden bevorzugt aus `runtime_config` gelesen, sonst aus `TB_BOOTSTRAP`.
- URL-Ziele werden bevorzugt aus `url_config` gelesen, sonst aus `TB_BOOTSTRAP`.
- Design wird aus `design_config.brand` und `design_config.survey` bzw. Legacy-Designs gemischt.

Diese Fallback-Reihenfolge ist produktiv relevant und darf nur mit Snapshot-Tests geändert werden.

### 2.5 Error-/Success-Routing

- Auftrag-Erfolg und Auftrag-Fehler laufen über React-Routen und i18n-Status-Dictionaries.
- Rechnung-Erfolg und Rechnung-Fehler haben eigene Routen, teilweise Alias-Routen.
- `rechnung.html` nutzt aktuell Kromen-spezifische `rechnungSuccessUrl`, `rechnungErrorUrl` und `privacyUrl`.
- `tarif.html` setzt Fehlertexte direkt im Loader, wenn Auftragsdaten fehlen oder Supabase nicht erreichbar ist.

Ehiogie-Kompatibilität darf Error-/Success-Routing nur adapterbasiert angleichen, nicht direkt URLs ersetzen.

### 2.6 Consent-/Cookie-Verhalten im Runtime-Kontext

- Website-Cookie-Consent liegt in `localStorage.cookie-consent`.
- Loader-Survey-Consent ist in den Loadern bzw. den externen Engines sichtbar und technisch getrennt von der Website-CookieBar.
- Datenschutzlinks in Loadern müssen auf Kromen `/datenschutz` zeigen.
- Eine spätere Zentralisierung darf Consent-State nicht über iframe-Grenzen hinweg neu interpretieren.

### 2.7 Loader-Verträge, die identisch werden müssen

Für technische Vergleichbarkeit mit Ehiogie sollten langfristig folgende Verträge identisch werden:

- Benennung und Semantik von `TB_BOOTSTRAP`-Pflichtfeldern.
- `SURVEY_CONFIG`-Shape je Engine-Typ.
- Fallback-Reihenfolge: DB Runtime > Bootstrap > kontrollierter Default.
- URL-Konfiguration über `url_config` ohne Tenant-Copy.
- Query-Propagation von `lang`, `uuid`, `submission_id`.
- Design-Token-Mapping aus `design_config.brand`/`survey`.
- Fatal-Error-Verhalten ohne stille Weiterleitung.

### 2.8 Loader-Werte, die tenant-spezifisch bleiben müssen

- `locationId` für Kromen.
- Supabase-Projekt-URL und anon key, solange Kromen produktiv daran hängt.
- Kromen-Domain-URLs: `/start`, `/tarif`, `/auftrag`, `/rechnung`, `/datenschutz`, Erfolg-/Fehlerseiten.
- Engine-/Proxy-Pfade, solange keine separate Runtime-Freigabe erfolgt.
- Loader-CSS, soweit es produktive Kromen-Darstellung oder Conversion betrifft.
- Avatar-, Logo- und Design-Assets.

### 2.9 Runtime-Werte, die Kromen-spezifisch bleiben müssen

- `url_config.offer_base_url`.
- `url_config.rechnung_success_url`.
- `url_config.rechnung_error_url`.
- `url_config.privacy_url`.
- `runtime_config.setting_proxy_path`.
- `runtime_config.closing_proxy_path`.
- `runtime_config.rechnung_proxy_path`.
- `runtime_config.setting_engine_url`.
- `runtime_config.closing_engine_url`.
- `runtime_config.rechnung_engine_url`.

## 3. Content-/Config-Stand

### 3.1 Hardcoded, i18n- und Fallback-basierte Inhalte

Kromen ist aktuell hybrid:

- **Config-getrieben:** Teile von Brand, Legal-Variablen, Solution, About, FAQ, CookieBar, Logo/Assets.
- **i18n-Dictionary-getrieben:** Header/Footer-Labels, Statusseiten, viele Landingpage-Headlines und Annual-FAQ-Texte.
- **Hardcoded/Fallback:** Datenschutz-/Impressums-Grundtexte, Legal-Sections, Cookie-Fallbacks, Loader-Fehlertexte, Loader-CSS-Texte, Status-Fallbacks.
- **Remote-JSON:** Supabase-Dateien `webseite_design_config.kromen.json`, `webseite_content_config.kromen.json`, `webseite_layout_config.kromen.json` spiegeln offenbar eine externe Config-Schicht, werden aber nicht im Audit geschrieben.

### 3.2 Fehlende Config-Layer

Für Ehiogie-kompatible Snapshot-Mechanik fehlen bei Kromen mindestens:

- Separater `websiteContentDefaults.ts`-Layer für generische Content-Defaults.
- Separater `websiteContentResolver.ts` für path-/lang-sicheres Lesen.
- Typisierte oder validierte Config-Schemas.
- Snapshot-Version oder Config-Revision.
- Diagnostics für fehlende Keys, falsche Typen und unerwartete Arrays.
- Tenant-neutraler Runtime-Resolver, der Website- und Loader-Konfiguration nicht vermischt.
- Read-only Snapshot-Testdaten für Kromen, die ohne Supabase reproduzierbar sind.

### 3.3 Inkompatible oder sensible Config-Layer

- `customerDefaults.ts` ist in Kromen kein generischer Default, sondern tenant-spezifischer Produktiv-Fallback.
- `content.i18n` kann alle i18n-Dictionary-Keys überschreiben; unvollständige Ehiogie-Snapshots könnten Kromen-Texte ändern.
- Legal-HTML-Overrides `pages.datenschutz.html` und `pages.impressum.html` sind extrem sensibel, weil sie komplette Seiten ersetzen können.
- Loader lesen `design_config`, nicht `webseite_design_config`; Website liest `webseite_design_config`. Diese getrennte Namenswelt darf nicht unbemerkt zusammengelegt werden.
- Runtime- und URL-Konfiguration liegen in `runtime_config`/`url_config`, nicht in `webseite_*_config`.

### 3.4 Zielbereiche für spätere Snapshot-Mechanik

Folgende Bereiche sollten später dieselbe Snapshot-Mechanik wie Ehiogie nutzen, aber erst nach Phase 1/2:

1. Website-Design (`webseite_design_config`) mit stabilen Asset-Fallbacks.
2. Website-Content (`webseite_content_config`) inklusive lokalisierter Objekte.
3. Website-Layout (`webseite_layout_config`) mit Section-Sichtbarkeit und Reihenfolge.
4. Legal-Variablen, aber nicht Legal-Volltexte ohne Freigabe.
5. CookieBar-Labels, ohne Consent-Kategorien oder Rechtsgrundlage zu ändern.
6. Statusseiten-Copy als read-only Snapshot, erst nach Abgleich mit produktiven Funnels.
7. CTA-Ziele als Runtime-Verweise, nicht als kopierte Ehiogie-URLs.

## 4. Freeze-/Legal-/Consent-Kompatibilität

### 4.1 Datenschutz-/Impressum-Struktur

Kromen nutzt Legal-Seiten mit zwei Ebenen:

- Vollständiger HTML-Override per Config-Pfad.
- Fallback-Template mit Kromen-Legal-Variablen.

Regel: Ein technischer Catch-up darf die Render-Struktur vorbereiten, aber keine Datenschutz-/Impressum-Texte, Anbieterlisten, Verantwortlichenangaben, Stand-Datum oder Kontaktangaben ändern.

### 4.2 Cookie-/Consent-Struktur

Die CookieBar speichert `cookie-consent` mit Werten `all` oder `essential`. Marketing-Checkbox und Buttons sind config-getrieben beschriftbar, aber die technische Bedeutung ist im Code fixiert.

Regeln:

- Consent-Key bleibt stabil.
- Bereits gespeicherte Werte bleiben gültig.
- Keine automatische Migration von Consent-State.
- Keine Übernahme von Ehiogie-Cookie-Texten oder Kategorien.
- Keine neue Tracking-/Marketing-Logik im Catch-up.

### 4.3 Survey-Consent

Survey-Consent ist vom Website-Cookie-Consent zu trennen:

- Setting/Closing/Rechnung-Loader zeigen eigene Consent-/Datenschutz-Elemente bzw. übergeben `privacyUrl` an Engines.
- Engine-seitige Consent-Felder dürfen nicht durch Website-Cookiebar-Zustand ersetzt werden.
- Datenschutz-Links müssen Kromen-spezifisch bleiben.

### 4.4 Callback-/Redirect-Verträge

Callback- und Redirect-Ziele sind produktive Verträge:

- Offer-Handoff: Start/Setting -> Tarif.
- Tarif-Handoff: Tarif -> Auftrag oder Start.
- Closing-Handoff: Auftrag -> Erfolg/Fehler engine-seitig.
- Rechnung-Handoff: Rechnung -> Rechnung-Erfolg/Rechnung-Fehler/Datenschutz.
- Footer/Legal: jede Route mit `lang`-Propagation, wo `withLang()` genutzt wird.

### 4.5 Was identisch sein muss

- Struktur und Semantik der Runtime-Keys.
- Query-Parameter `lang`, `uuid`, `submission_id`, `location_id`.
- Fallback-Strategie bei fehlender Remote-Config.
- Read-only Resolver-Verhalten.
- Loader-Error-Handling ohne stille Redirects.

### 4.6 Was tenant-spezifisch bleiben muss

- Alle Kromen-Texte, Legal-Variablen, Impressum, Datenschutz, Cookie-Copy.
- Alle Kromen-URLs und Domainnamen.
- Alle Kromen-Assets, Logos, Avatar-/Agency-Links.
- Kromen-Location-ID und Supabase-Projekt.
- Kromen-Design-Token, sofern produktiv freigegeben.

### 4.7 Was nicht von Ehiogie kopiert werden darf

- Brand-/Personen-/Kontaktangaben.
- Datenschutz-/Impressums-HTML.
- Cookie-/Consent-Texte.
- CTA-Ziel-URLs.
- Supabase Runtime-/Proxy-/Engine-Werte.
- Loader-Dateien als Ganzes.
- CRM-Mapping oder Webhook-Verträge ohne Kromen-spezifische Feldprüfung.

## 5. Sichere Catch-up-Strategie

### Phase 1: Rein technische Architekturangleichung ohne sichtbare Änderungen

**Ziel:** Kromen bekommt dieselbe interne Resolver-Struktur wie Ehiogie, aber mit identischem Output.

Erlaubt:

- Neue interne Resolver-/Default-Dateien einführen.
- `websiteConfig.tsx` in kleine pure Funktionen auslagern.
- Tests für Deep-Merge, Path-Getter, i18n-Fallback und Config-Source ergänzen.
- Diagnostics nur in Development oder Test sichtbar machen.

Nicht erlaubt:

- Keine Textänderungen.
- Keine Route-/URL-Änderungen.
- Keine Loader-Änderungen.
- Keine Supabase-Schreiboperation.

Abnahmekriterien:

- Vorher/Nachher-Snapshots der Website-Config sind für Kromen identisch.
- `getText`, `getArray`, `getObject`, `interpolate` liefern identische Werte.
- Build und Tests laufen ohne Runtime-Änderungen.

### Phase 2: Runtime-/Loader-Kompatibilität ohne sichtbare Änderungen

**Ziel:** Loader-Verträge dokumentieren und adapterfähig machen, ohne Loader-Dateien produktiv zu verändern.

Erlaubt:

- Read-only Tests/Snapshots der Loader-Bootstrap-Keys.
- Contract-Dokumentation für `TB_BOOTSTRAP`, `SURVEY_CONFIG`, Query-Parameter und URL-Fallbacks.
- Optional nicht-invasive Typ-/Schema-Dateien neben den Loadern, solange Loader unverändert bleiben.

Nicht erlaubt:

- Keine Änderung an `public/loaders/*.html` im Freeze.
- Keine Engine-/Proxy-URL-Änderung.
- Keine Query-Key-Umbenennung.

Abnahmekriterien:

- Alle aktuellen Loader-Werte sind als Kromen-Vertrag fixiert.
- Ehiogie-kompatible Adapter können später gegen diesen Vertrag gebaut werden.
- Bestehende iframe-Height-Mechanik bleibt unverändert.

### Phase 3: Config-/Snapshot-Kompatibilität

**Ziel:** Kromen kann denselben Snapshot-Unterbau nutzen, ohne Inhalte zu verlieren.

Erlaubt:

- Snapshot-Reader ergänzen, der bestehende `webseite_*_config` exakt weiterliest.
- Versioniertes Snapshot-Format neben bestehendem Format akzeptieren.
- Tenant-Defaults als letzte sichere Fallback-Ebene behalten.
- Read-only Snapshot-Tests aus vorhandenen Kromen-JSON-Dateien.

Nicht erlaubt:

- Keine Remote-Config überschreiben.
- Keine Inhalte aus Ehiogie importieren.
- Keine automatische Migration von Legal-/Cookie-/CTA-Keys.

Abnahmekriterien:

- Kromen-Snapshot und aktueller Remote-/Fallback-Merge erzeugen dieselbe sichtbare Ausgabe.
- Fehlende Snapshot-Keys fallen auf Kromen-Defaults, nicht auf Ehiogie.
- Legal-/Consent-Overrides bleiben blockiert, bis freigegeben.

### Phase 4: Optionale spätere Zentralisierung

**Ziel:** Gemeinsame technische Module können tenant-neutral wiederverwendet werden.

Möglich nach Phase 3:

- Gemeinsamer Content-Resolver.
- Gemeinsamer Config-Schema-Validator.
- Gemeinsame Runtime-Key-Dokumentation.
- Gemeinsame Loader-Contract-Tests.
- Gemeinsame Snapshot-Diagnostics.

Weiterhin verboten ohne separate Freigabe:

- Gemeinsame Legal-/Consent-Texte.
- Gemeinsame Tenant-URLs.
- Gemeinsame CRM-Feldwerte.
- Gemeinsame produktive Loader-Dateien.

### Phase 5: Erst danach CRM-Anbindung

**Ziel:** CRM-Anbindung erst starten, wenn Architektur, Runtime und Snapshot-Vertrag stabil sind.

Voraussetzungen:

- Fixierter Kromen-Datenvertrag für Setting, Closing, Rechnung und Offer.
- Eindeutige Zuordnung von `uuid`, `submission_id`, Kontaktfeldern, Consent-Feldern und Sprachcode.
- Validierte Erfolg-/Fehler-Routen.
- Keine offenen P0-Lücken in Loadern.
- Legal-Freigabe für Datenweitergabe, Auftragsverarbeitung und Kommunikationszwecke.
- Rollback-Plan ohne Supabase-Datenverlust.

Nicht starten, solange:

- Loader-Verträge nicht eingefroren sind.
- Consent-/Legal-Mapping unklar ist.
- Snapshot-Mechanik nicht reproduzierbar ist.
- Kromen-spezifische Inhalte noch mit generischen Defaults vermischt werden.

## 6. Risikoanalyse

### 6.1 Größte Breaking-Risiken

1. **Loader-Vertrag bricht:** Engine lädt nicht, Proxy-Pfad fehlt oder URL-Key wurde umbenannt.
2. **Query-Kontext geht verloren:** `uuid`, `submission_id` oder `lang` werden nicht weitergereicht.
3. **Fallback-Priorität ändert Texte:** Remote-/Default-/Dictionary-Priorität verschiebt sichtbare Inhalte.
4. **Legal-Override ersetzt Seiten:** `pages.datenschutz.html` oder `pages.impressum.html` wird falsch gemerged.
5. **Tenant-Daten werden überschrieben:** Ehiogie-Inhalte landen in Kromen-Fallbacks oder Supabase-JSON.
6. **Design-Konfiguration kollidiert:** Loader nutzen `design_config`, Website nutzt `webseite_design_config`.

### 6.2 Risiken für produktive Funnels

- Start Survey kann keine Offers erzeugen, wenn `setting_proxy_path` oder `setting_engine_url` geändert wird.
- Tarif-Seite kann keine Daten laden, wenn `uuid`/`submission_id`-Lookup verändert wird.
- Auftrag Survey kann Abschlussdaten nicht dem Angebot zuordnen, wenn `uuidOverride` entfällt.
- Rechnungsprüfung kann Upload nicht korrekt routen, wenn Success-/Error-URLs angepasst werden.

### 6.3 Risiken für Surveys

- Engine-Versionen können implizite `SURVEY_CONFIG`-Keys erwarten.
- Consent-Felder im Survey können anders heißen als Website-Cookie-Consent.
- Loader-CSS kann Eingabefelder, Checkboxen oder mobile Layouts brechen.
- Supabase-Client-Aufrufe im Loader sind produktiv und reagieren empfindlich auf RLS-/Spaltenänderungen.

### 6.4 Risiken für Offer-Seiten

- `tarif.html` liest direkt aus `auftraege`; Schemaänderungen brechen Rendering.
- Top-Level-Navigation kann in iframe-/Browser-Kontexten blockiert werden, wenn geändert.
- AI-Zusammenfassung wird aus mehreren möglichen Feldern normalisiert; Resolver-Änderungen können leere Texte erzeugen.
- Tarif/Start/Auftrag-URLs müssen `uuid` und `lang` behalten.

### 6.5 Risiken für Consent/Legal

- Ehiogie-Legaltexte dürfen nicht auf Kromen erscheinen.
- Cookie-Kategorien dürfen nicht ohne Rechtsprüfung erweitert oder umbenannt werden.
- Survey-Consent darf nicht mit CookieBar-Consent verwechselt werden.
- Datenschutzlinks aus Loadern müssen auf Kromen bleiben.

### 6.6 Risiken für Kromen-spezifische Inhalte

- Kromen-Brand, Marcel-Kromen-Inhalte, Social Links und Agenturhinweise liegen in Defaults und Config.
- Übersetzungs-/i18n-Overrides können Kromen-Texte global ersetzen.
- Fallbacks sind produktiv sichtbar, wenn Supabase nicht erreichbar ist.
- Asset-URLs dürfen nicht gegen Ehiogie-Assets getauscht werden.

### 6.7 Risiken für Cloudflare-/Loader-Deployments

- Loader liegen unter `public/loaders`; jede Änderung wird als statisches Asset ausgeliefert.
- Browser-/CDN-Cache kann alte Loader mit neuer Website kombinieren.
- Engine-Script-URLs enthalten externe Supabase-Storage-Pfade; Cache-Busting und Versionierung sind separat zu testen.
- Same-origin iframe-Höhenberechnung bricht bei CDN-/Domain-Verlagerung.
- Ein Rollback muss Website-Bundle, Loader-Assets und Supabase Runtime-Konfiguration gemeinsam betrachten.

## 7. Finale Bewertung und P0-Lücken

### 7.1 Ampelbewertung

| Bereich | Status | Bewertung |
| --- | --- | --- |
| Architektur-ready | 🟡 teilweise | Kromen hat config-getriebene Ansätze, aber Resolver/Defaults/i18n sind noch gekoppelt. |
| Runtime-ready | 🟡 teilweise | Runtime funktioniert produktiv, ist aber loader-spezifisch und nicht vollständig vereinheitlicht. |
| Config-ready | 🟡 teilweise | `webseite_*_config` existiert, aber ohne isolierte Resolver-/Schema-/Diagnostic-Schicht. |
| Snapshot-ready | 🔴 nein | Kein expliziter Snapshot-Resolver, keine Versionierung, keine read-only Snapshot-Tests. |
| CRM-ready | 🔴 nein | Erst nach stabiler Runtime, Snapshot-Kompatibilität, Consent-/Legal-Mapping und Feldvertrag. |

### 7.2 P0-Lücken vor Umsetzung

- Tatsächlichen Ehiogie-Referenzstand commit-genau gegen Kromen mappen und nur technische Pattern übernehmen.
- Loader-Verträge als Tests/Dokumentation einfrieren, bevor irgendein Loader geändert wird.
- `websiteContentDefaults.ts`/`websiteContentResolver.ts` nur als kompatible Adapter einführen.
- Snapshot-Mechanik read-only gegen Kromen-JSON prüfen.
- Legal-/Consent-Bereiche als gesperrte Zonen markieren.
- CRM-Feldvertrag inklusive Consent, Sprache, UUID und Submission-ID separat spezifizieren.

### 7.3 Go-/No-Go-Entscheidung

**Aktueller Stand:** No-Go für direkte Migration, No-Go für CRM-Anbindung, No-Go für Loader-Änderungen.

**Go nur für Phase 1**, wenn sie rein technische interne Architekturangleichung ohne sichtbare, runtime- oder loader-seitige Änderungen bleibt.

**Go für Phase 2** erst nach Phase-1-Snapshot-Vergleich.

**Go für Phase 3** erst nach fixiertem Loader-/Runtime-Vertrag.

**Go für Phase 5/CRM** erst nach Legal-/Consent-Freigabe und reproduzierbaren Snapshot-/Runtime-Tests.

## 8. Operative Bestätigung dieses Audit-Schritts

Dieser Audit-Schritt ist ausschließlich dokumentarisch. Es wurden keine Runtime-, UI-, Loader-, Consent-, Supabase-, SQL- oder Deploy-Änderungen vorgenommen. Die sichere nächste Aktion ist nicht Migration, sondern die Umsetzung von Phase 1 mit bit-identischem Verhalten und Tests.
