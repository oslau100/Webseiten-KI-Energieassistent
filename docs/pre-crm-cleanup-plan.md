# Pre-CRM Cleanup- und Entscheidungsplan

**Stand:** 2026-06-01  
**Zielbranch für diesen Plan:** `Ehiogie-Energieassistent-tn90CyE3XuYFTy4c1M3F`  
**Scope:** Nur Dokumentation. Dieser Plan schließt keine PRs oder Issues, merged nichts, ändert keine Runtime, keine UI, keine Texte in der Anwendung, keine Supabase-Daten, keine Migrationen, kein SQL und keinen Deploy.

## 1. Leitentscheidungen vor CRM-Start

1. **Ehiogie ist die führende Produktions-/Arbeitsarchitektur.** Alle Entscheidungen vor CRM-Start werden gegen den aktuellen Ehiogie-Branch und `location_id = tn90CyE3XuYFTy4c1M3F` bewertet.
2. **Kromen ist kein paralleler Umbau-Branch für jetzt.** Kromen bekommt später einen kontrollierten Catch-up auf die Ehiogie-Architektur. Kromen-PRs und Kromen-Issues bleiben inhaltlich wertvoll, dürfen aber den CRM-Start nicht blockieren.
3. **Template ist aktuell nicht technische Wahrheit.** Offene PRs gegen `Template` sind vor CRM nicht automatisch mergefähig, selbst wenn sie gute Dokumentation oder alte Implementierungsarbeit enthalten.
4. **Produktive Loader liegen im Webseitenrepo.** Loader, Angebotsseite und iframe-Wrapper müssen als produktionsrelevanter Teil des Webseitenrepos betrachtet werden.
5. **Hauptrepo bleibt Engine-/Edge-/Backup-Grenze.** Engines, Edge Functions und Loader-Backups werden vor CRM nur über klar definierte Anschluss-Tasks synchronisiert, nicht durch diesen Plan geändert.
6. **E-Mail-Repo ist Draft-/Vorlagenbasis.** CRM-Mails dürfen erst nach stabiler Config-/Content-Entscheidung an die Draft-Vorlagen angebunden werden.
7. **Vor CRM zählt Reihenfolge vor Breite.** Erst Architektur- und Cleanup-Entscheidungen abschließen, dann minimale produktionskritische Ehiogie-Anpassungen, dann CRM-Anbindung vorbereiten.

## 2. Offene PRs im Webseitenrepo

### 2.1 Entscheidungsübersicht

| PR | Titel / Inhalt | Aktuelle Einordnung | Entscheidung | CRM-Relevanz | Empfohlene Aktion |
|---|---|---|---|---|---|
| #90 | `Draft: Unified-Config-Architektur (Dokumentation)` | Dokumentations-PR zur konsolidierten Zielarchitektur; aktuell gegen `Template`, inhaltlich aber sehr relevant für CRM-Vorbereitung. | **Behalten, aber nicht gegen Template mergen.** Inhalt als Architektur-Quelle sichern und gegen Ehiogie neu/fortgeführt bewerten. | **Vor CRM zwingend als Entscheidungsgrundlage**, nicht zwingend als genau dieser PR. | Inhalt prüfen, ggf. in Ehiogie-Doku übernehmen; danach #90 als ersetzt/veraltet schließen, falls der Inhalt in Ehiogie enthalten ist. |
| #88 | `Draft: Audit Ehiogie client-facing config map` | Dokumentations-/Audit-PR mit Ehiogie-Fokus, aktuell ebenfalls gegen `Template`. | **Behalten bis Audit-Ergebnisse gesichert sind; danach schließen als ersetzt.** | **Vor CRM zwingend** wegen Mapping von client-facing Config. | Audit-Inhalte in Ehiogie-Doku konsolidieren; nach Übernahme #88 schließen. |
| #82 | `Document website content architecture for Supabase-driven localized copy` | Dokumentation zur Supabase-getriebenen Website-Content-Architektur. | **Behalten oder nach Konsolidierung schließen.** | **Vor CRM relevant**, aber als Architektur-Doku durch #90/#88/aktuellen Plan teilweise überdeckt. | Inhalt gegen Ehiogie prüfen; fehlende Prinzipien in eine Ehiogie-Doku übernehmen; dann #82 schließen, wenn vollständig ersetzt. |
| #53 | `Ehiogie aus Kromen Template livefähig machen` | Alter Implementierungs-/Livefähig-PR aus Kromen-Template-Zeit; passt nicht mehr zur aktuellen Ehiogie-Führungsarchitektur. | **Schließen als veraltet/ersetzt.** | **Nicht vor CRM mergen.** | Nur historische Learnings sichern; keine Codeübernahme vor CRM. |
| #67 | `Webseiten #63/#49: Improve mobile reviews and visible UX` | UX-/Mobile-Review-Implementierungsarbeit; potenziell nützlich, aber sichtbare UI-Änderung. | **Später neu machen oder gezielt nach CRM planen.** | **Nach CRM verschiebbar**, außer ein harter Ehiogie-Regression-Befund entsteht. | Nicht mergen; Anforderungen aus #63/#62/#49 in neuen UI-Task überführen. |
| #71 | `[DRAFT] Follow-up to PR #68 — align visible homepage DE copy to confirmed Canva text` | Sichtbare Copy-Änderung/Canva-Text-Abgleich. | **Nicht vor CRM mergen; später neu machen.** | **Nach CRM verschiebbar**, weil CRM zuerst stabile Config-/Content-Grenzen braucht. | Als durch config-driven Content-Architektur ersetzt markieren; später Content-only Task mit Freigabe erstellen. |
| Weitere offene PRs | Laut GitHub-Liste sind aktuell 6 PRs offen: #90, #88, #82, #71, #67, #53. | Keine weiteren offenen PRs sichtbar. | Keine Aktion. | Keine. | Regelmäßig vor CRM-Start erneut prüfen. |

### 2.2 Empfohlene PR-Schließungen

**Schließen, sobald Inhalte gesichert oder als überholt bestätigt sind:**

1. **#53** sofort als veraltet/ersetzt durch Ehiogie-Produktionsbranch und neue Architekturentscheidung.
2. **#71** nach Vermerk, dass sichtbare Copy erst nach config-driven Content-Entscheidung neu gemacht wird.
3. **#67** nach Vermerk, dass mobile Reviews/UX später als neuer, kleiner Ehiogie-Task umgesetzt werden.
4. **#88, #90, #82** erst schließen, wenn ihre Dokumentationsinhalte vollständig in Ehiogie-basierte Dokumentation übernommen oder explizit ersetzt sind.

**Nicht schließen, bevor gesichert wurde:**

- #88, #90 und #82 enthalten Architektur-/Audit-Wissen, das vor CRM wertvoll ist. Die PRs selbst sind wegen Base `Template` problematisch; der Inhalt ist jedoch nicht automatisch wertlos.

## 3. Offene Website-Issues

### 3.1 Entscheidungsübersicht

| Issue | Titel / Inhalt | Entscheidung | CRM-Relevanz | Empfohlene Aktion |
|---|---|---|---|---|
| #86 | `Prepare website config layer for Supabase-driven kunden_config overrides` | **Behalten / als erledigt schließen, wenn aktueller Ehiogie-Stand diese Grundlage enthält.** | **Vor CRM zwingend erledigen.** | Prüfen, ob Config-Schicht in Ehiogie vorhanden ist; falls ja, Issue mit Verweis auf PR/Commit schließen; falls nein, minimalen Ehiogie-Task erstellen. |
| #81 | `Website content architecture: Supabase-driven localized copy with repo fallback` | **Behalten bis Architektur dokumentiert ist; danach schließen als erledigt/ersetzt.** | **Vor CRM zwingend als Doku-Entscheidung.** | Mit #73/#82/#90 konsolidieren; nicht als separaten parallelen Umbau offen lassen. |
| #75 | `Document customer branch offer page bootstrap rules` | **Behalten; vor CRM erledigen.** | **Vor CRM zwingend**, weil Angebotsseite/Loader produktionsrelevant sind. | Ehiogie-Offer-/Loader-Bootstrap-Regeln dokumentieren; keine Loader-Änderung in diesem Cleanup. |
| #73 | `Webseite Content-System: Alle sichtbaren Texte config-driven und kundenspezifisch editierbar machen` | **Behalten als Master-Epic, aber splitten.** | **Vor CRM teilweise zwingend:** Audit/Zielkeys/Fallbackregeln; vollständige Migration nach CRM möglich. | Issue nicht sofort schließen; Untertasks für Audit, Homepage, Jahresrechnung, Header/Footer, Legal, CRM-Mail-Anschluss erstellen. |
| #70 | `Ehiogie Homepage: Canva-Texte 12-sprachig production-ready übernehmen` | **Später neu machen.** | **Nach CRM verschiebbar**, solange keine falsche produktive Pflichtinformation live ist. | Nicht vor Config-/Content-Architektur umsetzen; später Content-only Task mit 12-Sprachen-Freigabe. |
| #64 | `Ehiogie Solution/Banner Section: Bild links und Text rechts konfigurierbar machen` | **Später neu machen / nach CRM verschiebbar.** | **Nach CRM verschiebbar.** | In Design/Layout-Config-Backlog aufnehmen; nicht vor CRM als UI-Änderung starten. |
| #63/#62 | `Homepage Reviews mobile an /jahresrechnung Design angleichen` | **Duplikate konsolidieren; später neu machen.** | **Nach CRM verschiebbar**, wenn keine kritische mobile Regression vorliegt. | Eines der Duplikate schließen, eines als Backlog behalten oder beide durch neuen Ehiogie-UI-Task ersetzen. |
| #61 | `Homepage Content config-driven machen: Socials, Stats, About, FAQ und Hero Copy` | **Als Teil von #73 behalten oder schließen als ersetzt durch #73/#86.** | **Vor CRM nur Audit/Config-Grenze zwingend; vollständige Umsetzung nach CRM möglich.** | Wenn aktuelle Config-Schicht Socials/Stats/About/FAQ/Hero bereits abdeckt, schließen; fehlende Keys als neue Subtasks zu #73. |
| #54 | `Whitelabel Design-System zentralisieren` | **Behalten als Backlog; nach CRM verschiebbar.** | **Nach CRM verschiebbar**, außer Design-Tokens blockieren CRM-Tenantfähigkeit. | Nicht vor CRM umbauen; später Design-System-Task gegen Ehiogie-Architektur. |
| #51 | `Kromen Social Links vervollständigen und prüfen` | **Später neu machen.** | **Nach CRM verschiebbar.** | Nicht vor CRM; Kromen-Catch-up-Task erstellen. |
| #50 | `Kromen Website-Assets aus unsicheren Fallback-URLs in Kromen Media übertragen` | **Später neu machen, aber Sicherheitsrisiko markieren.** | **Nach CRM verschiebbar**, sofern Kromen nicht produktiv im CRM-Start ist. | Kromen-Catch-up mit Asset-Registry/Media-Check planen. |
| #49 | Älteres Reviews-/UX-/Website-Thema, durch #67/#63/#62 referenziert | **Schließen als ersetzt, wenn #63/#62 oder neuer UI-Task die Anforderungen abdeckt.** | **Nach CRM verschiebbar.** | Inhalt sichern; durch neuen Review-Mobile-Task ersetzen. |
| #48 | Älteres Website-/Kromen-/Template-Thema | **Schließen als veraltet, falls Template/Kromen-Fokus.** | **Nach CRM verschiebbar oder nicht relevant.** | Vor Schließung prüfen, ob Ehiogie-relevante Anforderungen enthalten sind; sonst als Template-alt schließen. |
| #47 | Älteres Website-/Kromen-/Template-Thema | **Schließen als veraltet, falls Template/Kromen-Fokus.** | **Nach CRM verschiebbar oder nicht relevant.** | Vor Schließung prüfen, ob Ehiogie-relevante Anforderungen enthalten sind; sonst als Template-alt schließen. |

### 3.2 Issues, die vor CRM zwingend erledigt oder entschieden sein müssen

1. **#86**: Minimale Website-Config-Schicht / Supabase-Override-Grundlage muss entweder bereits erledigt sein oder als Ehiogie-Task abgeschlossen werden.
2. **#81**: Content-Architektur mit Supabase-Override und Repo-Fallback muss als Doku-Entscheidung final sein.
3. **#75**: Offer-Page-/Loader-Bootstrap-Regeln müssen dokumentiert sein, weil die produktiven Loader im Webseitenrepo liegen.
4. **#73 teilweise**: Audit, Content-Key-Struktur, Fallback-Reihenfolge und Abgrenzung zu i18n/Komponenten-Fallbacks müssen entschieden sein. Vollständige Migration aller sichtbaren Texte ist nicht zwingend vor CRM.

### 3.3 Issues, die geschlossen werden sollen

**Schließen als ersetzt/veraltet nach kurzer Sicherung:**

- **#49, #48, #47**, falls sie alte Template-/Kromen-/Reviews-Anforderungen enthalten, die durch neue Ehiogie-Tasks ersetzt werden.
- **Eines von #63/#62**, weil beide denselben Titel haben. Alternativ beide schließen und einen neuen klaren Ehiogie-Review-Mobile-Task anlegen.
- **#61**, falls seine Anforderungen in #73/#86 und aktueller Config-Doku vollständig enthalten sind.

**Noch nicht schließen:**

- **#73** als Master-Epic, bis die neuen Subtasks angelegt sind.
- **#75** bis Offer-/Loader-Bootstrap-Regeln dokumentiert sind.
- **#81/#86** bis eindeutig auf erledigte Ehiogie-Dokumentation oder Implementierung verwiesen werden kann.

## 4. Neue Tasks, die nötig sind

### 4.1 Vor CRM zwingend

1. **Ehiogie Config Acceptance Check**
   - Prüfen, welche Website-Werte heute tatsächlich über die Config-Schicht laufen.
   - Ergebnis: kurze Tabelle `Wert -> Quelle -> Fallback -> CRM-Relevanz`.
   - Keine Runtime-Änderung ohne separaten PR.

2. **Offer-/Loader-Bootstrap-Dokumentation**
   - Dokumentieren, welche Loader im Webseitenrepo produktiv sind.
   - Trennen zwischen React-Website-Config, Loader-Bootstrap, Angebotsseite und Hauptrepo-Engine.
   - Ergebnis sollte #75 schließen können.

3. **Pre-CRM Content-Key Freeze**
   - Minimalen Satz stabiler Content-/Design-/URL-/Legal-Keys definieren, die CRM später lesen oder befüllen darf.
   - Keine vollständige 12-Sprachen-Migration vor CRM erzwingen.

4. **Cleanup-Kommentar-/Schließrunde**
   - Nach Übernahme dieses Plans gezielt PRs/Issues kommentieren und schließen.
   - Wichtig: Schließungen erst nach menschlicher Freigabe; dieser Plan führt sie nicht aus.

### 4.2 Nach CRM / parallel vorbereitet

1. **Kromen Catch-up auf Ehiogie-Architektur**
   - Kromen-Socials, Assets, Media-Registry, Design-Tokens und Content-Keys auf neue Ehiogie-Struktur bringen.

2. **Review-Mobile-UX neu schneiden**
   - #63/#62/#49/#67 konsolidieren.
   - Kleiner UI-PR mit Screenshot-Vergleich, erst wenn CRM-Start nicht blockiert wird.

3. **Canva-/12-Sprachen-Content-Freigabe**
   - #70/#71 als Content-only Arbeit neu planen.
   - Erst nach Content-Key-Freeze und Freigabe der finalen Texte.

4. **Whitelabel Design-System v2**
   - #54 nach CRM als separater Design-System-Task.

5. **CRM-Mail-Anbindung an Draft-Vorlagen**
   - E-Mail-Repo bleibt bis dahin Draft-/Vorlagenbasis.
   - Keine automatische Mail-Produktion ohne finalen Config-Vertrag.

## 5. Sequenz bis CRM-Start

### Phase 0: Freeze und Sicherung

1. Diesen Cleanup-Plan auf Ehiogie-Basis mergen.
2. Bestätigen, dass keine Runtime-/UI-/Supabase-Änderung enthalten ist.
3. Offene PRs/Issues gegen die Tabelle oben markieren, aber noch nichts automatisch schließen.

### Phase 1: Architektur-Dokumente konsolidieren

1. #88, #90 und #82 inhaltlich gegen Ehiogie prüfen.
2. Relevante Inhalte in Ehiogie-basierte Dokumentation übernehmen.
3. Danach #88/#90/#82 schließen, wenn sie ersetzt sind.
4. Template nicht als technische Wahrheit verwenden.

### Phase 2: Vor-CRM-Pflichtumfang erledigen

1. #86 final prüfen oder minimal abschließen.
2. #75 dokumentieren und schließen.
3. #73 auf Master-Epic reduzieren: vor CRM nur Key-Freeze/Audit/Fallback-Regeln, nicht vollständige Website-Migration.
4. CRM-relevante Grenzen zu Hauptrepo, Loadern und E-Mail-Repo schriftlich fixieren.

### Phase 3: Alte PRs und Issues aufräumen

1. #53 schließen als veraltet.
2. #67 und #71 schließen oder in neue, kleinere Nach-CRM-Tasks überführen.
3. #63/#62/#49 deduplizieren.
4. #48/#47 prüfen und als Template-/Kromen-alt schließen, falls keine Ehiogie-Pflicht übrig bleibt.

### Phase 4: CRM-Start vorbereiten

1. CRM darf nur gegen stabile Ehiogie-Config-/Content-/Loader-Verträge starten.
2. Supabase-Schreiboperationen, Migrationen, SQL und Deploys nur über separate, explizit freigegebene PRs.
3. Kromen-Catch-up erst nach CRM-Basis oder in klar separatem Branch.

## 6. Parallel vs. seriell

### Seriell passieren muss

1. Ehiogie-Architekturentscheidung vor Kromen-Catch-up.
2. Content-Key-Freeze vor Canva-/12-Sprachen-Migration.
3. Loader-/Offer-Bootstrap-Dokumentation vor CRM-Integration in Angebots-/Survey-Flows.
4. Supabase-Schema-/Datenentscheidungen vor jeder CRM-Schreiblogik.
5. Schließrunde erst nach Sicherung der relevanten PR-/Issue-Inhalte.

### Parallel laufen darf

1. Dokumentationsprüfung von #88/#90/#82 parallel zur Sichtung alter UX-Issues.
2. Kromen-Catch-up-Planung parallel, aber ohne Kromen-Codeänderung.
3. E-Mail-Draft-Sichtung parallel, aber ohne CRM-Mail-Produktion.
4. Review-Mobile-UX-Spezifikation parallel, aber Umsetzung nach CRM-Freeze.
5. Hauptrepo-Engine-Vertragsprüfung parallel, aber ohne Edge-/Loader-Deploy.

## 7. Nicht-Aktionen in diesem Plan

Dieser Plan empfiehlt ausschließlich Entscheidungen und Sequenzen. Er führt **nicht** aus:

- PRs schließen
- Issues schließen
- Merges
- Runtime-Codeänderungen
- UI-Änderungen
- sichtbare Textänderungen
- Supabase-Schreiboperationen
- Migrationen oder SQL
- Deploys
- Änderungen an Kromen, Template, Hauptrepo oder E-Mail-Repo

## 8. Empfohlener Zielzustand direkt vor CRM-Start

1. Nur Ehiogie-basierte, aktuelle Architektur-/Config-Dokumentation ist offen relevant.
2. Alte Template-/Kromen-/UX-PRs sind geschlossen oder klar als Nach-CRM neu geplant.
3. #73 ist als kontrolliertes Master-Epic mit kleinen Subtasks statt als großer Umbau-Blocker geführt.
4. #75 ist erledigt, sodass Loader und Offer Page nicht mehr als implizite Blackbox in den CRM-Start gehen.
5. CRM startet erst gegen definierte Config-, Content-, Loader- und Hauptrepo-Grenzen.
