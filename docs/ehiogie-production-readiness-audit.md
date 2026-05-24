# Ehiogie Production Readiness Audit

## 1) Kurze Zusammenfassung
- Ehiogie ist ein eigener Kundenbranch mit eigener `location_id`-Ausrichtung und eigenen Kundenwerten.
- Ziel dieses Audits: Ehiogie production-ready vorbereiten, ohne Kromen-Werte oder andere Kundendaten zu beschädigen.
- Der aktuelle produktive Fallback kommt zu großen Teilen aus `src/lib/customerDefaults.ts`.
- `src/lib/websiteConfig.tsx` ist bereits auf Remote-Website-Config vorbereitet, lädt aber `webseite_*`-Spalten, die sehr wahrscheinlich noch nicht in `public.kunden_config` existieren.

## 2) Was aktuell aus `customerDefaults.ts` kommt
Aktuell sind dort (Fallback-basiert) u. a. definiert:
- **Brand**: Name, Kontakt-E-Mail, Agentur-Link/Alt.
- **Farben**: Primärfarbe/Text/Hintergrund (`design.colors`).
- **Assets**: Header/Footer-Logo, Hero-Image, Agency-Logo.
- **Legal-Werte**: Impressum/Datenschutz-Variablen (Firma, Adresse, E-Mail, Telefon usw.).
- **Hero**: Badge, Headline, Subline, CTA, Result-Hinweis, Alt-Text.
- **Solution**: Image URL/Alt, `image_position`, Headline, Body, CTA, Note.
- **About**: Avatar, Person, Rolle, Social Hint, Social Links, Absätze.
- **HowItWorks**: Headline, CTA, Steps/Items.
- **Problem**: Headline, Problem-Items.
- **Comparison**: Headline, Portals/Assistant Titel & Listen, CTA.
- **Testimonials**: Kicker, Headline, Home-Reviews.
- **Jahresrechnung Reviews**: `sections.jahresrechnung.reviews`.
- **Stats**: Headline + numerische Items.
- **FAQ**: Home-FAQ-Items.
- **Links**: Website/Legal/Tarif/Jahresrechnung/Status-Seiten.

## 3) Welche Remote-Config `websiteConfig.tsx` lädt
`src/lib/websiteConfig.tsx` versucht aus `public.kunden_config` zu lesen:
- `webseite_design_config`
- `webseite_content_config`
- `webseite_layout_config`

## 4) Aktueller Architekturstatus (wichtig)
- Die `webseite_*`-Spalten sind nach aktuellem Stand vermutlich noch nicht in Supabase vorhanden.
- Damit greift die Website voraussichtlich auf Repo-Fallbacks (`customerDefaults.ts`) zurück.
- Für kurzfristige Ehiogie-Production-Readiness ist das akzeptabel.
- Langfristige saubere Lösung gehört in **Issue #73** (strukturierte Remote-Website-Config / Zielstruktur).

## 5) Audit der Homepage-Bereiche
Bewertungskategorien:
- **Config-driven** = nutzt `useWebsiteConfig` + `getText/getArray/getObject`.
- **Hybrid** = teilweise config-driven, teilweise i18n/hardcoded Fallback.
- **i18n-only / hardcoded** = keine WebsiteConfig-Anbindung im sichtbaren Bereich.

- **Header**: **Hybrid** (Logo/Brand via Config; CTA-Label über i18n). 
- **Hero**: **Config-driven** (Texte + Asset aus Config/Fallback).
- **Problem**: **Config-driven** (Headline + Items).
- **Solution**: **Config-driven** inkl. `image_position` left/right.
- **HowItWorks**: **Config-driven** (Steps + CTA).
- **Comparison**: **Config-driven**.
- **Testimonials**: **Hybrid** (Reviews/Kicker/Headline config-driven, unterer CTA nutzt i18n direkt).
- **About**: **Config-driven** (Bild/Text/Social).
- **Stats**: **Config-driven**.
- **FAQ**: **Hybrid** (FAQ-Items + Final-CTA weitgehend config-driven; FAQ-Überschrift i18n).
- **Final CTA (Homepage)**: Teil von FAQ-Sektion, **config-driven** für Headline/Subline/CTA.
- **Footer**: **Hybrid** (Brand/Logos/Agency-Link config-driven; Navigationslabels i18n).

## 6) Audit von `/jahresrechnung` (nur Doku)
- Seite nutzt `useWebsiteConfig` stark für viele sichtbare Texte: Badge, Hero-Text, CTA, Why-Intro, Value-Text, Vergleichstitel, Reviews, finaler Text.
- Sichtbare Überschriften/FAQ-Fragen sind teilweise weiterhin i18n-getrieben (z. B. `t("annual_...")`).
- Fallback-Arrays in der Seite enthalten noch hardcoded Default-Texte (werden genutzt, wenn Content-Key fehlt).
- Keine große Migration in diesem PR (bewusst).

## 7) Audit Links / CTAs (Ehiogie)
Geprüft:
- Start/Survey-Link (`/start`) – intern korrekt verlinkt.
- Tarif-Link (`/tarif`) – Route vorhanden.
- Jahresrechnung-Link (`/jahresrechnung`) – Route vorhanden.
- Datenschutz (`/datenschutz`) – Route + legal page vorhanden.
- Impressum (`/impressum`) – Route + legal page vorhanden.
- Fehlerseiten (`/fehler`, `/rechnung-fehler`) – vorhanden.
- Danke-Seiten (`/auftrag-eingegangen`, `/rechnung-eingegangen`, `/uebermittelt`) – vorhanden.
- Callback/Rückrufseite (`/rueckruf-anfordern`) – vorhanden.

Ergebnis:
- In den geprüften Website-Routen/CTAs wurden keine offensichtlichen Kromen-Domain-Leaks gefunden.
- Keine Link-Korrektur notwendig in diesem PR.

## 8) Manuelle Smoke-Test-Liste vor Production
- [ ] Startseite Desktop
- [ ] Startseite Mobile
- [ ] `/jahresrechnung` Desktop
- [ ] `/jahresrechnung` Mobile
- [ ] `/start` (Setting Survey)
- [ ] `/tarif` (Angebotsseite)
- [ ] Angaben ändern mit `uuid`
- [ ] Closing Survey
- [ ] Rechnung Survey
- [ ] Datenschutz
- [ ] Impressum
- [ ] Fehlerseiten
- [ ] Danke-Seiten
- [ ] Callback/Rückrufseite
- [ ] Sprache grob prüfen
- [ ] Keine Kromen-Leaks
- [ ] Keine falschen Assets
- [ ] Keine falschen Domains

## 9) Folgearbeit für Issue #73
In #73 sollte eingeplant werden:
- Vollständiger Website-Content-Audit (alle sichtbaren Texte + CTAs + legal).
- Saubere Content-Key-Struktur (klarer Namespace je Section/Page).
- Zielmodell für Supabase (`webseite_content_config`, `webseite_design_config`, `webseite_layout_config`) **oder** dokumentierte Alternative.
- Homepage vollständig config-driven machen (Rest-i18n/hardcoded reduzieren).
- `/jahresrechnung` vollständig config-driven machen.
- Header/Footer/CTA konsistent config-driven machen.
- Doku/Onboarding für neue Kundenbranches.
- Regel: kein harter Kundencontent direkt in Komponenten.
