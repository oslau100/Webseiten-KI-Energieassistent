# Aktueller Korrekturstand

Siehe [correction-review.md](correction-review.md): 92 Pfade übersetzt, 22 Offline-Tests bestanden. Der folgende Bericht dokumentiert ausschließlich den historischen 47-Dateien-Stand vor der Korrektur.

---

# Fortsetzung des T08-Auftrags — 14.10.2026

Die ursprüngliche 44-Dateien-ZIP und ihr verifizierter Diff sind unverändert
unter `/workspace/output/T08_RESULT_PATCH.zip` erhalten. Die Fortsetzung
baut auf diesem Stand auf; keine Neuimplementierung und kein Git-/Production-Zugriff.
Die Angaben im ursprünglichen Archiv bleiben dessen historischer Prüfstand.

Nachprüfung aller 94 ursprünglichen Lücken gegen sechs Kataloggruppen mit zwölf
Sprachen und 211 Quelltexteinträgen: **2 exakt geschlossen, 92 nicht belegbar**.
Je Kunde wurde `sections.jahresrechnung.cta` wortgetreu aus
`src/lib/i18n.tsx`, `dictionaries.*.header_check_bill` übernommen; die 22
fehlenden fremdsprachigen Werte entsprechen exakt dem Original.
24 übrige FAQ-Pfade besitzen gleichnamige Katalogeinträge mit abweichendem
Deutsch und sind keine passenden Übersetzungen. Zwei Problem-Arrays sind nur
auf Deutsch belegt. Für 66 Pfade fehlt eine äquivalente Referenz.
Keine Neutextung oder automatisch erzeugte Übersetzung.

Drei im ersten Durchlauf hinzugefügte FAQ-Paare je Kunde hatten keinen
Originalbeleg. Sie wurden aus dem fortgesetzten Stand entfernt; die drei
verbleibenden FAQ-Paare je Kunde entsprechen exakt dem ursprünglichen
freigegebenen Kunden-JSON. Das alte Archiv bleibt zur Nachvollziehbarkeit
unverändert. `translation-recheck.json` führt jeden geprüften Pfad, Original,
Katalogherkunft, fehlende Sprache und Nichtäquivalenz separat auf.
Der Recheck ist mit `node scripts/t08-recheck-translations.mjs
docs/t08/source-evidence/t08-original-44-recheck-input.json` reproduzierbar.

Erneut 13 Offline-Tests bestanden, einschließlich exakter übernommener
Übersetzungen und unveränderter autorisierter FAQ-Einträge. Vitest, ESLint,
TypeScript und Vite bleiben wegen fehlender Dependencies nicht ausführbar.
Kein vollständiger App-Test-/Build- oder Browsernachweis.

Die native Dateiablage ist weiterhin nicht bestätigt: kein Upload-/Datei-
Registrierungswerkzeug ist in diesem Cloud-Kontext verfügbar. Der native Link
zur vorhandenen `/workspace/output/T08_RESULT_PATCH.zip` wurde im Chat versucht;
er ist kein Nachweis eines erfolgreichen Downloads. Als Ersatz wurde der
**gesamte ursprüngliche Unified Diff** in nummerierte, zeilengenaue Textteile
zerlegt, mit SHA-256 je Teil und verlustfreier Wiederzusammensetzung.

---

# T08 Offline-Ergebnis — 14.10.2026

**Lokale Implementierung zur Prüfung; nicht vollständig abgenommen und nicht release-ready.**
Basis ist ausschließlich das angehängte Paket, PR #176 bei
`64de44796d15dc0328b339f8e0621a455af90ad6`. Die sieben vom Exportskript
vorgegebenen Git-Blob-Hashes wurden vor dem Entpacken erfolgreich geprüft.
Arbeitsverzeichnis: `/workspace/work/t08-pr176`, separat vom vorhandenen Checkout.
Das Archiv selbst ist kein Git-Checkout; ein neuer Commit-SHA existiert nicht.

Keine Git-Fetches, Pushes, Netzwerkinstallationen, Produktionsabfragen oder
Schreibaktionen, Deployments, Merges, Issues/PRs, Migrationen oder Änderungen
an `crm/app/**`. Der ursprüngliche Audit war read-only; die Umsetzung beruht
auf der ausdrücklichen Benutzerfreigabe. Dokumente sind Arbeitsgrundlagen,
keine neue Freigabe für externe Aktionen.

## Audit-Abdeckung

| Punkt | Ergebnis und Grenze |
| --- | --- |
| 1 Copy / Location-JSON | Zwei unabhängige versionierte v2-Konfigurationen; 146 Referenzeinträge aus Defaults, i18n und Jahresrechnungs-Arrays inventarisiert. Vorhandene sichere Referenzüberschriften übernommen. Unbelegte Referenzzahlen und Serviceversprechen ausgeschlossen; dafür autorisierte neutrale Kundentexte erhalten. **Nicht vollständig:** 92 kundenbezogene Übersetzungslücken. Exakte Gleichheit mit dem getrennten Ehiogie-Branch kann allein mit diesem Archiv nicht bestätigt werden. |
| 2 Farben | Validierte sechsstellige HEX-Werte werden nach HSL für Tailwind primary/CTA/ring/secondary/accent/background/card/popover umgesetzt. Vordergrund schwarz/weiß wird anhand des Kontrasts gewählt; Primärtext auf hellem Hintergrund erhält bei Bedarf den lesbaren Textfarbwert. CSS-Variablen werden beim Wechsel/Unmount bereinigt. Beide Paletten bestehen die ausführbaren Kontrastprüfungen. |
| 3 Bilder / Logos | Hero und Solution ohne Bildskalierungen, Translates oder negative Bildränder, mit max-width/max-height/object-contain. Originaldateien, Orientierung und Assetpfade unverändert. Tarivia bekommt eigene responsive Höhen- und Breitenbegrenzungen; Öcher behält seine Bildhöhen. Unavailable-CTAs und Badges dürfen umbrechen. Keine Browser-/Screenshot-Abnahme möglich. |
| 4 Layout / Leerzustände | Erlaubte Registry steuert Reihenfolge/Sichtbarkeit für Home und Annual; unbekannte/mehrfache IDs werden verworfen. Header/Footer folgen der Sichtbarkeit und behalten ihre semantischen Außenpositionen. Final-CTA ist ein eigener Home-Abschnitt. Annual kann Stats rendern. Null-Kinder verschieben keine Registry-Indizes. Leere Bewertungen/Statistiken entfallen. Fehlende Array-Übersetzungen erhalten explizite Hinweise statt leerer Karten. Customer-Marketing bekommt keine Repository-Fallback-Copy. |
| 5 Legal | Installiertes Typography-Plugin registriert; Tabellen sind horizontal scrollbar. `parseLegalHtml` und dessen strikte Allowlist bleiben bytegleich; kein Raw-HTML-Pfad auf Legal-Seiten. Customer-Annual ignoriert zudem den bestehenden ungeprüften HTML-Override. |
| 6 Sprachen / Dropdown / RTL | Sprachwechsel per Router-Navigation ohne Dokumentreload, URL und Storage bleiben erhalten; zwölf Sprachoptionen und Arabisch-RTL. Kunden-Marketing löst fehlende Übersetzungen nicht mehr auf Deutsch auf. Vorhandene zulässige Übersetzungen liegen unabhängig in jedem Payload. **Nicht vollständig:** lokalisierte Pending-Hinweise und leere Listen sind keine Marketingübersetzungen. Interaktions-/RTL-Tests hinzugefügt, wegen fehlender Dependencies nicht ausgeführt. Google Translate/Jotform und Consent-Gates nicht aktiviert. |
| 7 Funnel | CustomerBoundary, Loader-Middleware und Order-Bridge bytegleich. Keine Capability oder Order/Survey-Transporte aktiviert. `/start`, `/tarif`, `/rechnung` sind für Kunden keine operativen Marketinglinks: explizit nicht verfügbar, Kontakt nur aus unabhängiger konfigurierter E-Mail. Direkte Routen bleiben gesperrt. |
| 8 Callback | Native Booking-Komponente beibehalten und über Markentokens gestylt. Customer-Seite behauptet keine Kostenlosigkeit/Verfügbarkeit aus dem generischen Kostenhinweis. Keine Kalender/Slots erfunden. Missing-calendar-Test ergänzt. Audit-Befund „0 Kalender“ stammt aus dem Paket, nicht einer neuen Live-Abfrage. Provisionierung und Proxy-E2E bleiben separat. |
| 9 Tests | 13 unabhängige Node-Offline-Prüfungen bestanden; 13 Schutz-/Asset-Dateien bytegleich verifiziert. React-/Legal-/Dropdown-/Layout-/Callback-Regressionsprüfungen ergänzt und alte Fallback-Erwartungen angepasst. **Nicht ausgeführt:** Vitest, ESLint, TypeScript, Vite. Details unten. |
| 10 Diff / Rollback | Deterministische JSONs, Source-Inventar, Dateihashes und `config-review-manifest.json` mit exakt begrenztem späterem Diff-/Apply-/Rollback-Vertrag. Kein ausführbares SQL. ZIP mit beiliegendem Originalskript erstellt; Manifest und unified Diff enthalten alle Änderungen. |

## Prüfungen und tatsächliche Umgebungsfehler

- `python t08_make_offline_bundle.py verify ...`: PASS, sieben erwartete Git-Blob-Hashes, 238 ZIP-Einträge.
- `node --test --test-isolation=none scripts/t08-offline.test.mjs`: **13 PASS / 0 FAIL**. Ausgeführt mit Node v24.19.0; TypeScript-Type-Stripping meldet eine ExperimentalWarning. Die Node-Suite prüft echte Theme-/Layout-/Resolver-Funktionen, Payloads und Regenerierung; statische UI-Constraints sind keine Browser-Abnahme.
- Bytevergleich von Boundary, Middleware, CustomerRuntime, Legal-Parser, Order-Bridge und acht Originalbildern: **13 PASS**; Hashes in `unchanged-boundary-verification.json`.
- `npm ci --offline --ignore-scripts`: `EUSAGE`, im Quellarchiv fehlt eine package-lock.json/npm-shrinkwrap.json. Kein Anwendungsfehler.
- `npm install --offline --ignore-scripts --package-lock=false --cache /tmp/t08-npm-cache`: `ENOTCACHED` für `@eslint/js`; keine Dependencies installiert, keine Netzwerkinstallation.
- `npm test -- --reporter=dot`: `vitest: not found`.
- ESLint-Aufruf: `eslint: not found`. Die hinzugefügten Dateien können nicht gelintet werden.
- `./node_modules/.bin/tsc --noEmit -p tsconfig.app.json`: binary fehlt. Typecheck nicht ausgeführt.
- `npm run build`: `vite: not found`. Build nicht ausgeführt.

Keine bestehenden SWC- oder Typecheck-Fehler bestätigt: diese Werkzeuge konnten
hier nicht starten. TSX, DOM-Verhalten, visuelles Layout und vollständiger
Produktionsbuild bleiben ungeprüft. Vor Übernahme in PR #176 die hinzugefügte
Suite `src/test/t08Remediation.test.tsx`, bestehenden Kundentests, Booking-Tests,
changed-file ESLint, TypeScript und Produktionsbuild mit installierten Dependencies
ausführen. Nicht erfolgreich gestartete Werkzeuge werden nicht als PASS gezählt.

## Echte fachliche/technische Blocker

1. Das Paket enthält keine passenden vorhandenen Übersetzungen für 92
   kundenbezogene Text-/Array-Pfade (jeweils mit den fehlenden Sprachen aufgeführt).
   Quellkopie und Übersetzungslücken stehen in `source-copy-inventory.json`.
   Freigaben für unbelegte Versprechen lassen sich aus der Marketingreferenz nicht
   ableiten. Für vollständige Copy müssen fehlende geeignete Übersetzungen und
   faktisch belegte Leistungsangaben bereitgestellt oder gesondert freigegeben werden.
2. Offline fehlen Lockdatei, Cache und Dependencies für den App-Test-/Build-Stack.
3. Die archivierten JSONs sind historische Vorbereitungsdaten mit `legal.ready=false`
   und symbolischen `supabase-storage://`-Referenzen. Diese Werte wurden bewusst
   nicht als Live-Fakten umgeschrieben. Ein Live-Baseline-Diff fehlt. Nicht ungeprüft
   an die Stelle bereits freigegebener Produktions-Legal-/Assetwerte setzen.
4. Funnel-Capabilities, Zielkalender und öffentliche Config-Isolation sind eigene
   freizugebende Aufgaben; deren Sperren wurden erhalten.

Der Offline-Arbeitsstand ist damit reviewbar, aber erfüllt die vollständige
zwölfsprachige Copy-Abnahme und den geforderten App-Test-/Build-Nachweis noch nicht.
Die geänderten Dateien stehen vollständig in `PATCH_MANIFEST.json` im Ergebnisarchiv.

## Geänderte und neue Dateien

- `docs/t08/README.md`
- `docs/t08/check-results.json`
- `docs/t08/config-review-manifest.json`
- `docs/t08/oecher-strom/content.json`
- `docs/t08/oecher-strom/layout.json`
- `docs/t08/remediation-result.md`
- `docs/t08/source-copy-inventory.json`
- `docs/t08/source-evidence/t08-v1-oecher-strom.json`
- `docs/t08/source-evidence/t08-v1-tarivia.json`
- `docs/t08/tarivia/content.json`
- `docs/t08/tarivia/layout.json`
- `docs/t08/unchanged-boundary-verification.json`
- `scripts/t08-content-inventory.mjs`
- `scripts/t08-offline.test.mjs`
- `scripts/t08-prepare-review-manifest.mjs`
- `src/components/About.tsx`
- `src/components/Comparison.tsx`
- `src/components/FAQ.tsx`
- `src/components/FinalCTA.tsx`
- `src/components/Footer.tsx`
- `src/components/Header.tsx`
- `src/components/Hero.tsx`
- `src/components/HowItWorks.tsx`
- `src/components/MarketingLink.tsx`
- `src/components/PageChrome.tsx`
- `src/components/SectionLayout.tsx`
- `src/components/Solution.tsx`
- `src/components/Stats.tsx`
- `src/components/Testimonials.tsx`
- `src/components/booking/CallbackBookingWidget.test.tsx`
- `src/components/ui/button.tsx`
- `src/index.css`
- `src/lib/i18n.tsx`
- `src/lib/websiteConfig.tsx`
- `src/lib/websiteContentResolver.ts`
- `src/lib/websiteSections.ts`
- `src/lib/websiteTheme.ts`
- `src/pages/Index.tsx`
- `src/pages/Jahresrechnung.tsx`
- `src/pages/RueckrufBuchen.tsx`
- `src/test/customerConfigDrafts.test.tsx`
- `src/test/customerSystemTexts.test.tsx`
- `src/test/t08Remediation.test.tsx`
- `tailwind.config.ts`
