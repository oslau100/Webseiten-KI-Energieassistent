# Ehiogie Offer-Content V2 Contract

`format_version: 2` aktiviert im Ehiogie-Tarifloader einen optionalen, strukturierten Renderer für KI-Angebotsinhalte. Inhalte ohne `format_version: 2` bleiben Legacy-Inhalte und werden weiterhin über den bestehenden Ehiogie-Legacy-Pfad gerendert. Diese Aufgabe migriert keine bestehenden Ehiogie-Inhalte auf V2.

## Vollständige JSON-Struktur

```json
{
  "format_version": 2,
  "fazit": "...",
  "ki_zusammenfassung": "...",
  "title": {
    "icon": "...",
    "text": "..."
  },
  "methodology_toggle": {
    "collapsed_label": "...",
    "expanded_label": "..."
  },
  "sections": []
}
```

`methodology_toggle` ist optional. Wenn Toggle-Texte fehlen oder leer sind, nutzt der Loader die deutschen Fallbacks `So wurde dein Tarif geprüft` und `Prüfdetails ausblenden`.

## Erlaubte Section-IDs

- `central_insight`
- `timing`
- `selection_reason`
- `risks`
- `comparison`
- `effort`
- `changes`
- `inaction`
- `recommendation`

Jede Section benötigt eine eindeutige `id`, einen nicht leeren `icon`-String, einen nicht leeren `title`-String, eine gültige `group` und ein nicht leeres `blocks`-Array.

## Erlaubte Gruppen

- `main`
- `methodology`

Methodology-Sections müssen im Eingabe-Array zusammenhängend stehen. Main-Sections dürfen vor und nach diesem Methodology-Block stehen. Der Renderer sammelt Methodology-Sections separat und zeigt den Toggle immer nach allen Main-Sections an; die Toggle-Position hängt nicht von der Position des Methodology-Blocks im JSON ab.

## Erlaubte Blocktypen

- `paragraph` mit nicht leerem `text`
- `subheading` mit nicht leerem `text`
- `answer` mit nicht leerem `text`
- `list` mit nicht leerem `items`-Array
- `ordered_list` mit nicht leerem `items`-Array

Listenitems dürfen entweder nicht leere Strings sein oder Objekte mit zwei nicht leeren Strings:

```json
{
  "title": "...",
  "text": "..."
}
```

## Erlaubte Variablen und Platzhalterformen

Erlaubte Variablen:

- `vorname`
- `provider_current`
- `tariff_provider`
- `tariff_name`
- `laufzeit_monate`
- `preisgarantie_text`
- `ersparnis_jahr`
- `ersparnis_monat`
- `plz`
- `verbrauch`
- `stadt`
- `energieart`
- `verbrauch_text`
- `aktuelle_monatskosten`
- `aktuelle_jahreskosten`
- `jahreskosten`
- `monatsabschlag`
- `arbeitspreis`
- `grundpreis_monat`
- `laufzeit_text`

Unterstützte Formen sind `{variable}` und `{{variable}}`. Unbekannte Variablen, offene Klammern, zusätzliche Klammern, Bindestriche, Punkte, Leerzeichen und gemischte fehlerhafte Syntax sind ungültig.

## Validierungsregeln

Der Loader validiert `fazit`, `ki_zusammenfassung`, `title.icon`, `title.text`, optionale Toggle-Labels, Section-Titel und -Icons, alle Blocktexte, Listenstrings sowie `title` und `text` von Listenobjekten. `format_version` muss numerisch exakt `2` sein, `sections` muss ein nicht leeres Array sein, und `ki_zusammenfassung` muss als vollständiger Legacy-Fallback vorhanden sein.

## Legacy-Fallback

Ungültige V2-Inhalte werden sachlich per `console.warn` protokolliert und vollständig über `ki_zusammenfassung` im bestehenden Ehiogie-Legacy-Renderer ausgegeben. Es gibt keine partielle V2-Ausgabe und keine Endkunden-Fehlermeldung. Inhalte ohne `format_version: 2` lösen keine Warnung aus.

## Sichere DOM-Ausgabe

V2-Inhalte werden ausschließlich mit `document.createElement` und `textContent` ausgegeben. Payload-Inhalte werden nie als HTML interpretiert; HTML- und Script-Strings erscheinen sichtbar als Text.

## Methodology-Toggle

Der Methodology-Toggle ist ein echtes `button`-Element mit `type="button"`, initial `aria-expanded="false"` und passendem `aria-controls`. Der Detailsbereich ist initial geschlossen und mit `hidden` vollständig aus dem Layout entfernt. Öffnen und Schließen lösen die Layout- beziehungsweise iframe-Höhensynchronisierung aus; es werden keine festen Detailshöhen hinterlassen.

## iframe-Höhenverhalten

Die Tarifseite misst den tatsächlichen unteren Rand von `#tbx2026`, berücksichtigt `body`-`marginBottom`, beobachtet bevorzugt `#tbx2026` per `ResizeObserver`, fällt bei fehlendem Root auf `documentElement` zurück und bündelt Resize-Ereignisse per `requestAnimationFrame`. Dadurch kann der iframe beim Öffnen wachsen und beim Schließen wieder schrumpfen.

## Keine automatischen Datenänderungen

Diese Integration führt keine automatische Supabase-Migration aus, schreibt keine `kunden_config`, ändert keine `auftraege`, erstellt keine Testaufträge und deployt keine Edge Functions. Es gibt auch keine automatische Synchronisierung anderer Kundenbranches.

## Verhältnis zum Generator

Der zugehörige Generator liegt im Hauptrepo `oslau100/KI-Energieassistent` unter `tools/offer-content-v2/`. Der Generator erzeugt SQL nur als Datei beziehungsweise Text und führt SQL niemals selbst aus. Eine visuelle Prüfung der jeweiligen Kundenwebsite bleibt vor einer produktiven Nutzung weiterhin erforderlich.
