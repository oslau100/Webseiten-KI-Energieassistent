# BeConnected — Standardtexte und verbleibende Freigabeprüfung

Stand: 14. Oktober 2026. `legal.ready = false` bleibt für beide Locations bestehen.
Die vier markenspezifischen HTML-Texte enthalten keine sichtbaren Reviewmarker oder
Platzhalter. Das ist keine rechtliche Freigabe und aktiviert keine Kundenfunktionen.
Die Originale unter `source-evidence/` bleiben unverändert.

## Nachweise und umgesetztes Verhalten

- Betreiberquelle und erneute Bestätigung im Auftrag: BeConnected, Einzelunternehmen,
  Andy Khelifa, Heidchenweg 13, 52080 Aachen, Deutschland, 0241 47595243,
  info@beconnected-aachen.de, USt-ID unverändert 253125657; Betreiber beider Marken.
- Cloudflare-Hosting: bestehende Git-/Pages-Konfiguration und dokumentierte Checks
  von PR #176. Keine Behauptung einer ausschließlich europäischen Verarbeitung.
- Supabase: öffentliche Konfigurationsabrufe in `websiteConfig.tsx` und freigegebener
  Asset-Origin in `customerRuntime.ts`. Read-only `get_project` für
  `oynhnhkldvpoqhsfirwf` bestätigt `region: eu-central-1` (Frankfurt).
  Projektregion bedeutet keine pauschale EU-Garantie für alle Anbieterleistungen.
- Mailgun-EU-Versand: Betreiberangabe im aktuellen Auftrag; Code-Unterstützung
  ebenfalls vom Betreiber angegeben. Eine CRM-Mailgun-Konfiguration für die beiden
  Locations ist nicht nachgewiesen. Kein Versandtest und keine CRM-Änderung.
  Die Texte unterscheiden Betreiber-E-Mail-Versand von gesperrten automatisierten
  Website-/CRM-Funktionen und behaupten keine nachgewiesene Location-Konfiguration.
- Facebook-/Instagram-(Meta)- und TikTok-Werbung: geplant laut Betreiber. Keine
  Pixel, Conversion-API oder zusätzlichen Tracking-Skripte implementiert.
- Beide Kundenruntimes laden weder Google Translate noch Jotform, unabhängig von
  Sprache, gültiger Widget-ID oder Zustimmung. Globale Translate-Einbindung und
  Jotform-DNS-Prefetch/Preconnect sind aus `index.html` entfernt.
- Andere Standorte können den bestehenden Übersetzer und konfigurierte Jotform-
  Bewertungen nach ausdrücklicher Zustimmung nutzen. Sprachwörterbücher bleiben
  verfügbar. Sprachsymbole sind eingebettete SVGs statt Flagcdn-Netzwerkabrufen.
- Rechtsseiten verlangen `legal.ready === true`, Firma, E-Mail und explizites
  sicheres Dokument-HTML. Kein generischer Rechtstext-Fallback. Inerte Template-
  Analyse und React-Rendering erlauben nur semantische Tags und geprüfte Links;
  Scripts, Eventhandler, Styles, Frames, Bilder, SVG und unsichere URLs sperren das
  ganze Dokument. Bestehende Kunden-, Loader- und Preview-Sperren bleiben bestehen.

## Browserpräferenzen und Widerruf

| Schlüssel | Speicher und Inhalt | Laufzeit / Bedeutung |
| --- | --- | --- |
| `site_lang` | Local Storage, gültiger Sprachcode bei ausdrücklicher Sprachwahl/Sprach-URL | Keine automatische Ablaufzeit; kein Cookie. Ohne ausgewählte Sprache wird der Standard nicht gespeichert. Browserdaten löschen entfernt die Präferenz. |
| `cookie-consent` | Local Storage und Host-Cookie; `v2:all:<Ablaufzeit>` oder `v2:essential:<Ablaufzeit>` in Millisekunden | Cookie: 180 Tage, Path=/, SameSite=Lax, Secure bei HTTPS, kein Domain-Attribut. Local Storage läuft nicht automatisch ab und wird nicht als Autorität für optionale Dienste verwendet. |

Nur ein gültiges, nicht abgelaufenes v2-Host-Cookie mit `all` erlaubt optionale
Dienste bei anderen Standorten. Alte Werte, reine Local-Storage-Einträge, ungültige
oder abgelaufene Einträge aktivieren nichts. Marketing ist nicht vorausgewählt.
Der Footer öffnet die vorhandene CookieBar erneut. Deaktivieren und Speichern
widerruft die Auswahl. Übersetzungsanfragen werden abgebrochen und Widgets entfernt;
bei anderen Standorten beendet zusätzlich ein Reload nach Widerruf den bereits
laufenden Vendor-Code. Bei beiden Kundenstandorten sind diese Dienste immer aus.
Der lokale Präferenzeintrag kann bestehen bleiben, gilt aber nach Ablauf nicht als
Zustimmung. Browserdaten löschen entfernt ihn.

## Echte offene Prüfungen vor Veröffentlichung

- [ ] Format/Gültigkeit der gelieferten USt-ID 253125657 bestätigen (kein Präfix
  erfinden). Prüfen, ob zusätzliche Register-/Aufsichts-/Berufsangaben, MStV-
  Verantwortlichkeit oder VSBG-Angaben erforderlich sind. Kein alter ODR-Link.
- [ ] Endgültige Rechtstexte separat für beide Marken prüfen und freigeben;
  Reviewer, Datum, Texthashes und tatsächliche Datenflüsse dokumentieren.
- [ ] Cloudflare-/Supabase-/Mailgun-Verträge, Unterauftragnehmer, tatsächliche
  Drittlandtransfers und erforderliche Garantien prüfen. Kein AVV-Abschluss oder
  vorhandene Transfergarantie wurde durch diese Arbeit verifiziert.
- [ ] Tatsächliche Zugriffsprotokolle, Speicher-/Löschregeln und Sicherheitsmaßnahmen
  der Anbieter und des Betreibers bestätigen; keine konkreten Fristen erfunden.
- [ ] Mailgun-EU-Konfiguration, Versanddaten, mögliche Öffnungs-/Klickauswertung und
  jede Location-Anbindung vor Freischaltung separat nachweisen. Code-Unterstützung
  und Betreiberangabe beweisen keine aktivierte CRM-Konfiguration.
- [ ] Bei späterer Freischaltung von Rückruf, Upload, Tarif-/Rechnungsprüfung,
  Auftragsvermittlung oder KI: Kategorien, Empfänger, Rechtsgrundlagen, Speicherung,
  Sicherheits- und Einwilligungsanforderungen erneut gegen die reale Implementierung
  prüfen. Diese Funktionen werden durch diesen Patch nicht freigeschaltet.
- [ ] Bestehende Asset-/Favicon-/Bucket- und Release-Voraussetzungen aus dem
  Operator-Konfigurationsplan bleiben unabhängig von der Rechtstextarbeit offen.

Keine Änderungen an `crm/app/**`, keine Supabase-/Production-Writes, Migrationen,
manuellen Deployments, neuen PRs oder Merges. Commit/Push auf den bestehenden
PR-Branch sind ausdrücklich beauftragt. Die bestehende Cloudflare-Git-Integration
kann dadurch automatisch Branch-Previews anlegen; Hostingkonfiguration unverändert.
