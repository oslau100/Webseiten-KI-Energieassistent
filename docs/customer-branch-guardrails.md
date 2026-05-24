# Customer Branch Guardrails

## 1) Zweck
Dieses Dokument schützt Kundenbranches wie **Ehiogie** und **Kromen** davor, dass echte Kundenwerte versehentlich überschrieben oder vermischt werden.

## 2) Grundregel
- Ehiogie und Kromen sind getrennte Kundenbranches.
- Änderungen an Ehiogie dürfen Kromen nicht verändern.
- Kromen Catch-up darf Kromen-spezifische Werte nicht mit Ehiogie- oder Template-Werten überschreiben.

## 3) Kundenspezifische Werte (niemals blind ersetzen)
- `location_id`
- Domains
- Datenschutz-/Impressum-URLs
- Logo
- Hero Image
- Solution/Banner Image
- Avatar/About Image
- Social Links
- Legal-Daten
- Kontakt-E-Mail
- Telefonnummer
- Farben
- Loader-Bootstrap-Werte
- Survey URLs
- GHL Pipeline IDs
- GHL Stage IDs
- GHL Media Folder IDs
- Callback Calendar IDs

## 4) CRM-Lite-Kompatibilität
Neue Änderungen sollen:
- location-basiert sein,
- config-driven sein,
- keine Secrets im Frontend enthalten,
- keine GHL-spezifische Logik unnötig tief in Website-Komponenten verankern,
- später in ein eigenes CRM-/Website-Config-System migrierbar sein.

## 5) PR-Checkliste für Kundenbranches
Vor Merge jedes PRs prüfen:
- [ ] Richtiger Base-Branch verwendet?
- [ ] Fremde Kundenwerte verändert?
- [ ] Echte Kundenwerte durch Platzhalter ersetzt?
- [ ] Änderungen systemisch oder kundenspezifisch sauber getrennt?
- [ ] Kundenspezifische Änderungen in Config/Fallbacks statt hart in Komponenten?
- [ ] Kromen-Leaks in Ehiogie?
- [ ] Ehiogie-Leaks in Kromen?
- [ ] Domains korrekt?
- [ ] Assets korrekt?
- [ ] Keine Secrets im Frontend gelandet?
