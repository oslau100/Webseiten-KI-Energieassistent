# Kromen Phase 1: Config-/Resolver-Architekturangleichung

## Ziel und Grenzen

Diese Phase trennt Kromens bestehende Website-Config technisch in Default- und Resolver-Schichten auf, ohne produktive Inhalte oder Runtime-Verträge sichtbar zu ändern. Ehiogie diente nur als technische Orientierung für die Trennung von Default-Daten, Resolver-Logik und React-Provider. Es wurden keine Ehiogie-Inhalte, Ehiogie-URLs, Ehiogie-Assets oder Ehiogie-Legalwerte übernommen.

## Geänderte Dateien

- `src/lib/websiteConfig.tsx`
  - Der React-Provider bleibt die öffentliche Hook-/Context-Schicht für `useWebsiteConfig()`.
  - Die bisher lokal enthaltene Deep-Merge- und Content-Helper-Logik wird aus Resolver-Funktionen importiert.
  - Query-, Bootstrap-, Supabase- und `source: "fallback" | "remote"`-Verhalten bleiben unverändert.
- `src/lib/websiteContentDefaults.ts`
  - Neue Default-Schicht, die ausschließlich die bestehenden Kromen-Defaults aus `customerDefaults.ts` kapselt.
  - Keine neuen Texte, URLs, Assets, Farben oder Legalwerte für die Anwendung.
- `src/lib/websiteContentResolver.ts`
  - Neue tenant-neutrale Resolver-Schicht für Config-Layer-Merge, Pfadzugriff und Content-Helper.
  - Das Array-Verhalten bleibt bewusst ein vollständiges Ersetzen statt elementweisem Merge.
- `src/lib/websiteContentResolver.test.ts`
  - Neue Vitest-Abdeckung für Merge-, Helper- und Layer-Auflösungsverhalten.
- `docs/kromen-phase1-config-architecture-alignment.md`
  - Diese Dokumentation der Phase-1-Änderung.

## Architekturangleichung

Vor dieser Phase lagen Provider, Remote-Fetch, Deep-Merge, Pfadauflösung, Content-Helper und Default-Weitergabe gemeinsam in `websiteConfig.tsx`. Nach dieser Phase sind die Verantwortlichkeiten getrennt:

1. `customerDefaults.ts` bleibt Quelle der produktiven Kromen-Fallbackwerte.
2. `websiteContentDefaults.ts` stellt diese bestehenden Fallbackwerte als Website-Default-Layer bereit.
3. `websiteContentResolver.ts` löst rein technische Operationen aus:
   - rekursiver Objekt-Merge,
   - vollständiges Ersetzen von Arrays,
   - Pfadzugriff per Dot-Path,
   - `getText`, `getArray`, `getObject`, `interpolate`,
   - Zusammenführen von Remote-Config-Spalten über Defaults.
4. `websiteConfig.tsx` bleibt für React Context, Fetch, Query-/Bootstrap-Prioritäten und CSS-Variablen-Side-Effects zuständig.

## Warum die Änderung sichtbar neutral ist

- Es wurden keine Loader-Dateien geändert.
- Es wurden keine Routen geändert.
- Es wurden keine Komponenten-Layouts geändert.
- Es wurden keine CSS-, Tailwind- oder Farbwerte geändert.
- Es wurden keine App-Texte, URLs, Assets, Consent-Texte oder Legal-Fallbackwerte in `customerDefaults.ts` verändert.
- `defaultWebsiteDesignConfig`, `defaultWebsiteLayoutConfig` und `defaultWebsiteContentConfig` bleiben weiterhin aus denselben Kromen-Defaultobjekten abgeleitet.
- Der Remote-Fetch nutzt weiterhin dieselbe Tabelle, dieselben Spalten und dieselbe Endpoint-Struktur.
- Die Priorität bleibt unverändert: Query-Parameter vor `window.TB_BOOTSTRAP`, danach feste Kromen-Fallbacks.
- `source` bleibt entweder `fallback` oder `remote`; fehlende oder fehlerhafte Remote-Konfiguration fällt weiterhin nicht-blockierend auf Fallback zurück.
- `getText` priorisiert weiterhin String-Werte direkt, danach angefragte Sprache, danach `de`, danach den ersten String-Wert im Objekt, danach den übergebenen Fallback.
- `getArray` und `getObject` geben weiterhin nur typkorrekte Werte aus `content` zurück und sonst den übergebenen Fallback.
- `interpolate` ersetzt weiterhin `{{ key }}`-Platzhalter über das übergebene Variablenobjekt und fehlende Variablen durch einen leeren String.

## Bewusst nicht übernommene Ehiogie-Pattern

- Keine Ehiogie-Inhalte, Ehiogie-URLs, Ehiogie-Assets oder Ehiogie-Legalwerte.
- Kein neuer Snapshot-Status, der `source` oder die öffentliche Hook-API erweitert oder bricht.
- Keine neue i18n-Priorität und keine Änderung an bestehenden Dictionary-/Content-Override-Pfaden.
- Keine Änderung an Query-Parametern, Bootstrap-Namen, Supabase-Keys oder Fetch-Prioritäten.
- Kein elementweiser Array-Merge, weil dadurch Reihenfolgen und sichtbare Content-Listen abweichen könnten.
- Keine Loader-Harmonisierung, da produktive Funnel-Verträge separat abgesichert werden müssen.
- Keine Consent-/Legal-Normalisierung, da diese Werte tenant- und freigabepflichtig sind.
- Keine Migration, kein SQL, keine Supabase-Schreiboperation und kein Deploy.

## Tests und Checks

- `npm test`
  - Vitest bestanden.
  - Zusätzliche Tests prüfen Array-Replacement, rekursiven Merge, Helper-Fallbacks und Remote-over-Default-Layer.
- `npm run build`
  - Vite Production Build bestanden.
  - Der bestehende Chunk-Size-Hinweis bleibt ein Build-Hinweis und ist nicht durch sichtbare Phase-1-Änderungen motiviert.
- `git diff --check`
  - Whitespace-/Patch-Check bestanden.
- `npm run lint`
  - Nicht bestanden wegen bestehenden `no-explicit-any`-Fehlern in `src/components/ui/*` und bestehenden Fast-Refresh-Warnungen; die neuen Resolver-Dateien werden dabei nicht als Fehlerquelle gemeldet.
- Manuelle Diff-Prüfung
  - Keine Loader-Datei geändert.
  - Keine Anwendungstexte in Komponenten oder `customerDefaults.ts` geändert.
  - Keine URLs in produktiven Defaults geändert.
  - Keine Assets in produktiven Defaults geändert.
  - Keine Legal-/Consent-Werte geändert.

## Verbleibende Risiken

- Die neue Resolver-Schicht ist technisch neutral, aber weitere Phasen könnten sichtbare Änderungen verursachen, wenn sie Defaultwerte, i18n-Prioritäten oder Loader-Verträge anfassen.
- Remote-Konfiguration aus Supabase bleibt zur Laufzeit maßgeblich; diese Phase validiert nicht die Inhalte der produktiven Datenbank.
- Der Build erzeugt weiterhin einen großen Hauptchunk. Das ist kein neues Verhalten dieser Phase, sollte aber separat betrachtet werden, falls Performance-Arbeit geplant ist.
- `websiteConfig.tsx` enthält weiterhin Fetch- und Provider-Verantwortung in einer Datei. Eine spätere Extraktion muss erneut gegen Query-/Bootstrap-Prioritäten getestet werden.

## Nächste Phase

Empfohlen ist eine Phase 2 ohne sichtbare Änderung, die ausschließlich Diagnostics und Vertragstests ergänzt:

1. Provider-/Resolver-Vertragstests für Query vor Bootstrap vor Defaults.
2. Contract-Test für `source: "fallback" | "remote"` bei leerer, fehlerhafter und erfolgreicher Remote-Antwort.
3. Snapshot-/Fixture-Test der Kromen-Fallbackobjekte, um unbeabsichtigte Text-, URL-, Asset-, Farb- oder Legal-Änderungen früh zu erkennen.
4. Erst danach weitere technische Extraktion von Bootstrap-/Fetch-Resolvern prüfen.
