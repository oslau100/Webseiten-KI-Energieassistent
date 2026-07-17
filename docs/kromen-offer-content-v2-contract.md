# Kromen Offer Content: Datenvertrag `format_version: 2`

## Zweck

`format_version: 2` ersetzt die textabhängigen Heuristiken des deutschen Legacy-Renderers optional durch explizite Struktur. Der Vertrag liegt direkt im vorhandenen Usecase-Objekt unter `ai_offer_content.<sprache>.<usecase>` und benötigt weder eine neue Spalte noch eine neue Tabelle. Die Reihenfolge sichtbarer Abschnitte entspricht der Reihenfolge im `sections`-Array.

Phase 1 stellt nur Vertrag, Validierung, Renderer und vollständigen Legacy-Fallback bereit. **Dieser PR ändert keine produktiven Supabase-Daten oder bestehenden Offer-Texte.**

## JSON-Struktur

```json
{
  "format_version": 2,
  "fazit": "Hallo {{vorname}}, hier ist dein Fazit.",
  "ki_zusammenfassung": "Vollständiger bisheriger Klartext für den Legacy-Fallback.",
  "title": {
    "icon": "✨",
    "text": "Deine Tarifprüfung im Detail"
  },
  "methodology_toggle": {
    "collapsed_label": "So wurde dein Tarif geprüft",
    "expanded_label": "Prüfdetails ausblenden"
  },
  "sections": []
}
```

`format_version`, `fazit`, `ki_zusammenfassung`, ein vollständiger `title` und mindestens eine gültige Section sind erforderlich. `methodology_toggle` ist optional. Ungültige oder leere Toggle-Beschriftungen machen den Vertrag nicht ungültig; auf Deutsch werden dann die bestehenden Beschriftungen verwendet.

## Erlaubte Section-IDs und Gruppen

Stabile Section-IDs:

- `central_insight`
- `timing`
- `selection_reason`
- `risks`
- `comparison`
- `effort`
- `changes`
- `inaction`
- `recommendation`

Jede Section besitzt eine eindeutige `id`, einen nicht leeren `icon`- und `title`-String, `group` und ein nicht leeres `blocks`-Array. Erlaubte Gruppen sind:

- `main`: normal sichtbarer Inhalt
- `methodology`: Inhalt im einklappbaren Prüfdetails-Bereich

Methodology-Sections müssen einen zusammenhängenden Block im Array bilden. Main-Sections dürfen vor und nach diesem Block stehen.

## Erlaubte Blocktypen

| Typ | Pflichtfelder | DOM-Ausgabe |
| --- | --- | --- |
| `paragraph` | nicht leerer `text` | `<p class="aiParagraph">` |
| `subheading` | nicht leerer `text` | `<div class="aiSubheading">` |
| `answer` | nicht leerer `text` | `<p class="aiParagraph aiAnswerLead">` |
| `list` | nicht leeres `items` | `<ul class="aiList">` |
| `ordered_list` | nicht leeres `items` | `<ol class="aiList">` |

Ein Listenitem ist entweder ein nicht leerer String oder ein Objekt mit zwei nicht leeren Strings:

```json
{ "title": "Preis", "text": "Prüfung der tatsächlichen Kosten." }
```

Objekt-Items erzeugen `.aiListTitle` und `.aiListText` innerhalb von `.aiListItem`. Der Typ `answer` steuert die Hervorhebung ausdrücklich; sein Wortlaut wird nicht analysiert. Ebenso entsteht `.aiHeadingAfterAnswer` aus der tatsächlichen benachbarten DOM-Struktur und nicht aus Textvergleichen.

## Erlaubte Variablen

Sowohl `{variable}` als auch `{{variable}}` sind zulässig. Die Schreibweise muss exakt sein; nicht geschlossene oder zusätzliche Klammern sowie Namen mit Bindestrich, Punkt oder Leerzeichen machen den gesamten V2-Vertrag ungültig. Erlaubt sind ausschließlich:

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

Die Prüfung umfasst Fazit, Legacy-Fallback, Dokumenttitel, Section-Überschriften und -Icons, Blocktexte, Listenitems sowie vorhandene Toggle-Beschriftungen. Eine unbekannte Variable verwirft den gesamten V2-Pfad.

## Validierung und Legacy-Fallback

V2 wird nur aktiviert, wenn `format_version` numerisch und exakt `2` ist und der vollständige Vertrag validiert wurde. Unter anderem führen folgende Fälle zum Fallback:

- fehlende oder leere Sections, Blocks oder Pflichttexte;
- unbekannte oder doppelte Section-ID;
- unbekannte Gruppe oder unbekannter Blocktyp;
- nicht zusammenhängende Methodology-Sections;
- leere oder strukturell ungültige Listenitems;
- unbekannte Variable;
- ein unerwarteter Fehler während des Renderns.

Bei ungültigem V2-Inhalt wird sachlich über `console.warn` protokolliert. Es erscheint keine partielle strukturierte Ausgabe und keine Endkunden-Fehlermeldung. Stattdessen rendert die Seite vollständig `ki_zusammenfassung` über den unveränderten Legacy-Pfad; das String-Fazit wird weiterhin unabhängig mit der bestehenden sicheren Interpolation und Absatzdarstellung gerendert. Inhalte ohne exakt passende Versionsangabe benutzen ohne Warnung wie bisher den Legacy-Pfad. Nicht-deutsche Legacy-Inhalte und RTL-Verhalten bleiben unverändert.

## Methodology-Toggle

Nur `group: "methodology"` entscheidet über die Zuordnung. Weder Emoji noch sichtbarer Titel werden ausgewertet. Der Renderer verwendet einen echten Button mit `aria-expanded="false"` und `aria-controls`; der Bereich ist initial geschlossen. Beim Öffnen und Schließen werden Beschriftung, versteckter Zustand, vorhandene Animation und bestehende Layout-/iframe-Höhenkorrektur aktualisiert. Es werden keine festen Gesamthöhen und keine neuen PostMessage-Mechanismen verwendet.

## Sicherheit

V2-Inhalte werden ausschließlich über DOM-Erzeugung und `textContent` eingesetzt. HTML- oder Script-Strings werden daher als Text angezeigt und niemals interpretiert. Der V2-Pfad verwendet insbesondere weder `innerHTML` noch `insertAdjacentHTML`, `eval` oder `new Function`. Der bestehende, ausdrücklich nicht zu Phase 1 gehörende Modal-Code bleibt unverändert.

## Vollständiges Usecase-Beispiel

```json
{
  "format_version": 2,
  "fazit": "{{vorname}}, der geprüfte Tarif passt zu deinen Angaben.",
  "ki_zusammenfassung": "✨ Deine Tarifprüfung im Detail\n\nVollständiger produktiver Legacy-Klartext ...",
  "title": { "icon": "✨", "text": "Deine Tarifprüfung im Detail" },
  "methodology_toggle": {
    "collapsed_label": "So wurde dein Tarif geprüft",
    "expanded_label": "Prüfdetails ausblenden"
  },
  "sections": [
    {
      "id": "central_insight",
      "icon": "🔍",
      "title": "Die zentrale Erkenntnis",
      "group": "main",
      "blocks": [
        { "type": "paragraph", "text": "Der Tarif {{tariff_name}} wurde strukturiert geprüft." },
        { "type": "subheading", "text": "Das bedeutet:" },
        { "type": "answer", "text": "Die Empfehlung folgt direkt aus den geprüften Angaben." },
        { "type": "list", "items": ["Transparente Kosten", "Passende Laufzeit"] }
      ]
    },
    {
      "id": "selection_reason",
      "icon": "🛡️",
      "title": "Warum diese Empfehlung ausgewählt wurde",
      "group": "methodology",
      "blocks": [
        { "type": "paragraph", "text": "Mehrere Kriterien wurden gemeinsam betrachtet." },
        {
          "type": "list",
          "items": [
            { "title": "Preis", "text": "Prüfung der tatsächlichen Kosten." },
            { "title": "Preisgarantie", "text": "Prüfung des abgesicherten Zeitraums." }
          ]
        },
        { "type": "ordered_list", "items": ["Tarifdaten prüfen", "Ergebnis einordnen"] }
      ]
    },
    {
      "id": "recommendation",
      "icon": "👉",
      "title": "Abschließende Empfehlung",
      "group": "main",
      "blocks": [
        { "type": "paragraph", "text": "Die Einordnung berücksichtigt deinen Verbrauch von {verbrauch_text}." },
        { "type": "answer", "text": "Der empfohlene Tarif ist die geprüfte Alternative." }
      ]
    }
  ]
}
```

Das Beispiel dokumentiert nur den Vertrag und wird nicht in den ausgelieferten Loader eingebettet. Die produktive Migration der drei deutschen Usecases erfolgt separat nach Review.
