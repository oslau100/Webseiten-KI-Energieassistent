# Kromen Phase 2: Runtime-/Contract-/Diagnostic-Alignment

## Ziel

Dieses Dokument beschreibt die sichere Phase-2-Absicherung für den produktiven Tenant **Kromen**. Der Fokus liegt ausschließlich auf Runtime-, Config- und Diagnostic-Verträgen, die durch Tests und Dokumentation überprüfbar gemacht werden. Es werden keine sichtbaren Änderungen vorbereitet oder ausgeliefert.

## Nicht-Ziele und Freeze-Grenzen

Für diese Phase gelten weiterhin harte Produktionsgrenzen:

- keine Änderungen an `public/loaders/*`
- keine Änderungen an Kromen-Texten, URLs, Assets oder Consent-/Legal-Werten
- keine Änderungen an Routen
- keine Supabase-Schreiboperationen, SQL-Dateien oder Migrationen
- keine Änderungen an Ehiogie, Templates, Hauptrepo oder E-Mail-Repo
- keine Deployments

## Abgesicherte Runtime-Verträge

Die neue Contract-Testabdeckung dokumentiert folgende bestehende Reihenfolge und Fallbacks:

1. **Runtime-Quelle für Supabase-Konfiguration**
   - Query-Parameter haben Vorrang vor `window.TB_BOOTSTRAP`.
   - `window.TB_BOOTSTRAP` hat Vorrang vor eingebauten Defaults.
   - Ohne Query-Parameter und ohne gültigen Bootstrap bleibt die Website auf Fallback-Defaults und löst keinen Remote-Fetch aus.

2. **Remote-/Fallback-Source-Verhalten**
   - Erfolgreich geladene Remote-Konfiguration setzt `source: "remote"`.
   - Fehlende Remote-Zeile oder nicht nutzbare Remote-Antwort bleibt sichtbar-neutral bei `source: "fallback"` und bestehenden Defaults.

3. **Config-Merge-Vertrag**
   - Objekt-Layer werden rekursiv gemerged.
   - Arrays werden weiterhin ersetzt, nicht zusammengeführt.
   - Fehlende Remote-Layer verändern bestehende Default-Layer nicht.

4. **Kromen-Defaults**
   - Die Website-Default-Exports bleiben an die bestehenden `customerDefaults` gekoppelt.
   - Zentrale Brand-, Legal-, Farb- und Layout-Werte werden in Tests gegen die aktuell produktiven Kromen-Defaults geprüft.

## Diagnostischer Nutzen

Die Phase-2-Tests schaffen eine Sicherheitsleine für spätere Refactorings:

- Änderungen an Prioritäten zwischen Query, Bootstrap und Defaults werden früh erkannt.
- Versehentliches Umschalten von Fallback auf Remote oder umgekehrt wird sichtbar.
- Array-Merge-Regressionen werden erkannt, bevor Layout- oder FAQ-Reihenfolgen unbemerkt abweichen.
- Änderungen an Kromen-Defaultwerten schlagen in Tests fehl, ohne dass produktive Loader, Texte oder Supabase-Daten geändert werden müssen.

## Sichtbare Änderungen

Keine. Diese Phase ergänzt ausschließlich Tests und Dokumentation.

## Risiken

- Die Tests mocken `fetch` und laufen in `jsdom`; sie beweisen die React-Runtime-Verträge des Providers, führen aber keine echten Supabase-Requests aus.
- Die Default-Wert-Assertions sind bewusst streng. Gewollte spätere Änderungen an Kromen-Defaults müssen deshalb explizit und reviewbar angepasst werden.

## Nächste Phase

Erst nach erfolgreicher Contract-Absicherung sollten weitere interne Diagnostics oder Refactorings geplant werden. Jede nächste Phase muss erneut bestätigen, dass Loader, Legal-/Consent-Werte, URLs, Assets und Supabase-Schreibpfade unverändert bleiben.
