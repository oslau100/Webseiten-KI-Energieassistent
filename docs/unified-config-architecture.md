# Unified-Config-Architektur für Ehiogie und spätere Kundenbranches

Status: Entwurf für Folge-Architektur auf Basis des client-facing Config-Audits.
Scope dieses Dokuments: ausschließlich Dokumentation. Keine Runtime-Codeänderung, keine UI-Änderung, keine Textänderung, keine Übersetzungsänderung, keine Loader-Logikänderung, keine Supabase-Schreiboperation, keine Migration, kein SQL, kein Deploy.

## 1. Ausgangspunkt und Zielbild

Das Audit `docs/ehiogie-client-facing-config-audit-v2.md` beschreibt den Ist-Zustand als gewachsene Mischung aus Website-i18n, hardcodierten Komponenten-/Page-Texten, Loader-Bootstrap-Werten, Supabase-Lesezugriffen und noch nicht vereinheitlichten Kunden-/Location-Konfigurationen. Dieses Dokument leitet daraus ein Zielbild ab, das **vor dem CRM-Ausbau** eine klare Konfigurationsgrenze schafft.

Ziel ist ein einheitliches Config-System, in dem kundenspezifische Werte nicht mehr in Komponenten, Loadern, i18n-Fallbacks oder einzelnen Supabase-Spalten verstreut gepflegt werden. Stattdessen soll jedes client-facing Feld einem klaren Bereich, einem klaren Besitzer und einer klaren Fallback-Reihenfolge zugeordnet sein.

### Leitprinzipien

1. **Supabase Location Override ist der fachliche Override-Layer.** Pro `location_id` dürfen Kunden-/Standortwerte später gezielt überschrieben werden.
2. **Repo Customer Fallback ist der versionierte Kunden-Fallback.** Für produktive Kundenbranches existiert ein gepflegter, reviewbarer Default ohne Supabase-Abhängigkeit.
3. **Repo Template Fallback ist die stabile Neukunden-Vorlage.** Er wird erst aus stabilen Kundenbranches abgeleitet und darf nicht aus dem aktuell ungepflegten `template`-Branch als Wahrheit übernommen werden.
4. **Technischer Fallback ist nur eine Sicherheitsleine.** Komponenten, Loader und Engines dürfen technische Minimaltexte behalten, aber nicht als fachliche Source of Truth.
5. **Deutsch bleibt initial Source of Truth.** Mehrsprachigkeit wird strukturell vorbereitet, aber Übersetzungsänderungen gehören in eigene PRs.
6. **CRM kommt erst nach Config-Stabilisierung.** E-Mail-/CRM-Sequenzen dürfen später dieselben Brand-, URL-, Legal- und Consent-Bausteine lesen, sollen aber nicht vor der Website-/Loader-Struktur erzwungen werden.

## 2. Trennung der Config-Domänen

| Domäne | Inhalt | Darf enthalten | Darf nicht enthalten | Ziel-Owner |
| --- | --- | --- | --- | --- |
| `content` | Sichtbare Copy, Headlines, CTA-Texte, FAQ, Reviews, Hinweis-/Status-Texte | Textbausteine, Arrays, optionale sprachliche Varianten | Farben, URLs, Logikschalter, rechtliche Stammdaten | Content/Marketing |
| `design` | Visuelle Tokens | Farben, Radius, Logo-Varianten, Avatar-/Bilddarstellung, Schrift-/Theme-Tokens | Copy, Survey-Flow-Entscheidungen, rechtliche Pflichtangaben | Design/Brand |
| `layout` | Reihenfolge und Sichtbarkeit von Sections | Section-Reihenfolge, Feature-Flags für Blöcke, Navigationsstruktur | Copy-Inhalte, Formularlogik | Website/Product |
| `logic` | Fachliche Regeln und Flow-Konfiguration | Usecase-Regeln, Survey-Schritte, Validierungsschalter, Tarif-/Offer-Entscheidungsparameter | Marketingtexte, Brandfarben | Product/Operations |
| `urls` | Ziel- und Integrationspfade | Survey-, Offer-, Auftrag-, Callback-, Privacy-, Imprint-, CRM-URLs | Texte, Tokens, Secrets | Tech/Ops |
| `legal` | Rechtliche Stammdaten | Betreiber, Anschrift, Impressum, Datenschutzkontakt, Consent-Texte, Stand-Datum | Marketingversprechen, Designwerte | Legal/Operations |
| `assets` | Medien und statische Ressourcen | Logo, Avatar, Hero-/About-Bilder, Favicons, OG-Bilder | Texte als Bildersatz, Secrets | Brand/Tech |
| `integrations` | Externe Systeme | Supabase public anon config, CRM-/Booking-/Analytics-IDs, Webhook-/Proxy-Pfade | Service-Role-Keys, private Secrets im Client | Tech/Ops |

## 3. Bestehende Supabase-Spalten, die zunächst bleiben

Diese Spalten sollen im ersten Architektur-Schritt erhalten bleiben, weil Loader/Survey/Offer-Flows bereits darauf lesen oder sie als produktive Brücke dienen. Das Ziel ist **stabilisieren, dokumentieren, dann schrittweise ablösen**.

| Bestehende Spalte / Wert | Status im Zielbild | Grund |
| --- | --- | --- |
| `kunden_config.location_id` | bleibt dauerhaft als Lookup-Schlüssel | Zentrale Location-Auflösung für Overrides. |
| `kunden_config.url_config` | bleibt zunächst | Produktive Loader verwenden URLs/Fallbacks daraus; später in `config.urls` normalisieren. |
| `kunden_config.setting_survey_design` | bleibt zunächst | Aktiver Design-Fallback für Setting Survey Loader. |
| `kunden_config.closing_survey_design` | bleibt zunächst | Aktiver Design-Fallback für Closing Survey Loader; Fallback auf Setting-Design bleibt bis Migration dokumentiert. |
| `kunden_config.setting_survey_logic` | bleibt zunächst | Fachliche Survey-Regeln sollen nicht mit Content vermischt werden. |
| `kunden_config.closing_survey_logic` | bleibt zunächst | Closing-Flow bleibt separat, bis gemeinsames `logic.surveys.closing` bereit ist. |
| `kunden_config.setting_language_config` | bleibt zunächst | Bestehende Survey-Sprachlogik nicht im Website-Content verstecken. |
| `kunden_config.setting_consent_text` | bleibt zunächst | Consent-Texte sind legal/content-nah, benötigen aber kontrollierte Migration. |
| `kunden_config.closing_consent_text` | bleibt zunächst | Wie Setting Consent; keine Zusammenführung ohne Legal-Freigabe. |
| `kunden_config.offer_copy_templates` | bleibt zunächst | Offer-Seite und KI-Angebotscopy brauchen backward-compatible Templates. |
| `kunden_config.ai_offer_content` | bleibt zunächst | KI-/Offer-Content kann operative Speziallogik enthalten. |
| `kunden_config.design_config` | bleibt zunächst als Legacy-/Shared-Design-Layer | Später mit Website-/Survey-Designstruktur normalisieren. |
| `kunden_config.webseite_content_config` | bleibt als Zielspalte für Website-Content | Soll primärer Supabase-Override für Website-Copy werden. |
| `kunden_config.webseite_design_config` | bleibt als Zielspalte für Website-Design | Separat von Content, Survey-Design und Layout halten. |
| `kunden_config.webseite_layout_config` | bleibt als Zielspalte für Website-Layout | Sichtbarkeit/Reihenfolge separat von Texten halten. |
| `auftraege.ai_content` | bleibt als auftragsbezogener Offer-/Ergebnisinhalt | Nicht in Kundenconfig verschieben; enthält submission-spezifische Inhalte. |
| `auftraege.language`, `auftraege.ai_usecase`, Tarif-/Kostenfelder | bleiben als Transaktionsdaten | Ergebnis-/Offer-Seite braucht submission-spezifische Daten. |

## 4. Bestehende Supabase-Spalten, die später zusammengeführt oder abgelöst werden sollen

| Bestehende Spalte / Legacy-Wert | Ziel | Migrationsrichtung | Priorität |
| --- | --- | --- | --- |
| `url_config` | `config.urls` | JSON-Pfade normalisieren, Loader weiterhin backward-compatible lesen lassen. | P0 vor CRM |
| `design_config`, `webseite_design_config`, `setting_survey_design`, `closing_survey_design` | `config.design.website`, `config.design.surveys.setting`, `config.design.surveys.closing`, `config.design.shared` | Keine pauschale Zusammenführung; erst Schema definieren, dann Adapter. | P1 |
| `webseite_content_config` | `config.content.website` | WebsiteConfig-API auf diese Zielstruktur ausrichten. | P0 vor CRM |
| `webseite_layout_config` | `config.layout.website` | Layout-Flags nicht in Content mischen. | P1 |
| `setting_consent_text`, `closing_consent_text` | `config.legal.consent.setting`, `config.legal.consent.closing` | Legal-Texte versioniert migrieren. | P1 vor produktiver CRM-Automation |
| `setting_language_config` | `config.content.surveys.setting.i18n` plus `config.logic.surveys.setting.language` | Sprachinhalte und Sprachlogik trennen. | P1 |
| `offer_copy_templates`, `ai_offer_content` | `config.content.offer`, `config.logic.offer`, transaktionsbezogen weiter in `auftraege.ai_content` | Templates von KI-/Usecase-Logik trennen. | P1/P2 |
| alte Tarif-Prioritätsspalten wie `privat_strom_1..3`, `privat_gas_1..3` | `config.logic.tariffs.priorities` | Nur falls im produktiven Flow noch gelesen; vor Änderung gesondert auditieren. | P2 |
| hardcodierte Booking-/Callback-URLs | `config.urls.callback` oder `config.integrations.booking` | Aus Komponenten/Page-Fallbacks herauslösen. | P0 vor CRM |
| hardcodierte Legal-/Brand-Werte | `config.legal.operator` und `config.content.website.brand` | Nicht per Textfix im Architektur-PR ändern; gesonderte Content-/Legal-PR. | P0 vor CRM |

## 5. Fallback-Reihenfolge

Die Ziel-Fallback-Reihenfolge ist für alle Domänen identisch, aber je Domäne mit separaten Pfaden umgesetzt:

1. **Supabase Location Override**
   - Quelle: `kunden_config` pro `location_id`.
   - Zweck: produktiver Kunden-/Standort-Override ohne Codeänderung.
   - Beispiel: `webseite_content_config.sections.hero.headline.de` oder später normalisiert `config.content.website.sections.hero.headline.de`.
2. **Repo Customer Fallback**
   - Quelle: versionierte Kunden-Fallbackdatei im Kundenbranch.
   - Zweck: deterministischer Betrieb ohne Supabase-Override; reviewbare kundenspezifische Defaults.
   - Beispiel: `src/config/customers/ehiogie/website.content.ts` oder äquivalente JSON-Datei in einem späteren PR.
3. **Repo Template Fallback**
   - Quelle: stabile, aus produktionsreifen Kundenbranches abgeleitete Vorlage.
   - Zweck: Neukunden-Startpunkt; nicht identisch mit dem derzeit nicht produktiv gepflegten `template`-Branch.
4. **Technischer Fallback**
   - Quelle: Komponenten-/Loader-Minimalwerte.
   - Zweck: Rendern statt Absturz, Logging/Diagnose, nicht fachliche Wahrheit.

Pseudo-Auflösung:

```ts
resolveConfig(path, domain, lang) =
  supabaseLocationOverride[path][lang]
  ?? supabaseLocationOverride[path]
  ?? repoCustomerFallback[path][lang]
  ?? repoCustomerFallback[path]
  ?? repoTemplateFallback[path][lang]
  ?? repoTemplateFallback[path]
  ?? technicalFallback
```

## 6. JSON-Zielstruktur

Die folgenden Strukturen sind Zielschemas, keine in diesem PR eingeführten Runtime-Dateien.

### 6.1 Website

```json
{
  "content": {
    "website": {
      "meta": {
        "title": { "de": "..." },
        "description": { "de": "..." },
        "ogTitle": { "de": "..." },
        "ogDescription": { "de": "..." }
      },
      "brand": {
        "displayName": "...",
        "shortName": "...",
        "personName": "...",
        "roleLabel": { "de": "..." }
      },
      "navigation": {
        "primary": [
          { "id": "bill", "label": { "de": "..." }, "urlKey": "annualBill" },
          { "id": "savings", "label": { "de": "..." }, "urlKey": "start" }
        ]
      },
      "sections": {
        "hero": {
          "badge": { "de": "..." },
          "headline": { "de": "..." },
          "subline": { "de": "..." },
          "primaryCta": { "label": { "de": "..." }, "urlKey": "start" },
          "resultNote": { "de": "..." }
        },
        "stats": {
          "items": [
            { "id": "checked", "value": "...", "label": { "de": "..." } },
            { "id": "households", "value": "...", "label": { "de": "..." } },
            { "id": "savings", "value": "...", "label": { "de": "..." } }
          ]
        },
        "about": {
          "personName": "...",
          "headline": { "de": "..." },
          "bio": [{ "de": "..." }],
          "socialKicker": { "de": "..." },
          "imageAssetKey": "aboutPortrait"
        },
        "testimonials": {
          "kicker": { "de": "..." },
          "headline": { "de": "..." },
          "items": [
            { "id": "...", "name": "...", "title": { "de": "..." }, "text": { "de": "..." } }
          ]
        },
        "faq": {
          "headline": { "de": "..." },
          "items": [{ "id": "...", "question": { "de": "..." }, "answer": { "de": "..." } }]
        },
        "annualBill": {
          "hero": {},
          "process": {},
          "testimonials": {},
          "faq": {},
          "finalCta": {}
        },
        "cookie": {
          "title": { "de": "..." },
          "body": [{ "de": "..." }],
          "buttons": {}
        },
        "notFound": {
          "headline": { "de": "..." },
          "body": { "de": "..." },
          "homeLink": { "de": "..." }
        }
      }
    }
  },
  "design": {
    "website": {
      "theme": { "primary": "...", "secondary": "...", "radius": "..." },
      "assets": { "logo": "logo", "aboutPortrait": "aboutPortrait", "favicon": "favicon" }
    }
  },
  "layout": {
    "website": {
      "homeSections": ["hero", "stats", "problem", "solution", "comparison", "testimonials", "about", "faq", "finalCta"],
      "annualBillSections": ["hero", "uploadCta", "process", "testimonials", "about", "stats", "faq", "finalCta"],
      "hiddenSections": []
    }
  }
}
```

### 6.2 Loader

```json
{
  "content": {
    "loaders": {
      "shared": {
        "loadingTitle": { "de": "..." },
        "loadingBody": { "de": "..." },
        "errorMissingConfig": { "de": "..." }
      },
      "start": {
        "title": { "de": "..." },
        "statusMessages": { "loading": { "de": "..." }, "error": { "de": "..." } }
      },
      "auftrag": {
        "title": { "de": "..." },
        "statusMessages": { "loading": { "de": "..." }, "error": { "de": "..." } }
      },
      "tarif": {
        "labels": {
          "currentTariff": { "de": "..." },
          "recommendedTariff": { "de": "..." },
          "perYear": { "de": "..." },
          "perMonth": { "de": "..." },
          "cta": { "de": "..." }
        }
      }
    }
  },
  "design": {
    "loaders": {
      "shared": { "primary": "...", "avatarAssetKey": "avatar" },
      "start": {},
      "auftrag": {},
      "tarif": {}
    }
  },
  "urls": {
    "start": "...",
    "auftrag": "...",
    "tarif": "...",
    "offer": "...",
    "settingEngine": "...",
    "closingEngine": "...",
    "settingProxyPath": "...",
    "closingProxyPath": "..."
  },
  "integrations": {
    "supabase": { "urlPublic": "...", "anonKeyPublic": "..." }
  }
}
```

### 6.3 Setting Survey

```json
{
  "content": {
    "surveys": {
      "setting": {
        "language": { "default": "de", "supported": ["de", "en", "tr", "ru", "ar", "it", "zh", "hi", "es", "fr", "nl", "pl"] },
        "steps": {
          "welcome": { "title": { "de": "..." }, "body": { "de": "..." }, "cta": { "de": "..." } },
          "address": { "labels": {}, "helpTexts": {} },
          "consumption": { "labels": {}, "helpTexts": {} },
          "contact": { "labels": {}, "helpTexts": {} }
        },
        "errors": {}
      }
    }
  },
  "design": { "surveys": { "setting": { "primary": "...", "progressStyle": "..." } } },
  "logic": {
    "surveys": {
      "setting": {
        "flowVersion": "...",
        "requiredFields": [],
        "usecaseRules": {},
        "validation": {}
      }
    }
  },
  "legal": { "consent": { "setting": { "checkboxes": [], "privacyUrlKey": "privacy" } } }
}
```

### 6.4 Closing Survey

```json
{
  "content": {
    "surveys": {
      "closing": {
        "steps": {
          "contractData": { "labels": {}, "helpTexts": {} },
          "confirmation": { "title": { "de": "..." }, "body": { "de": "..." } },
          "submitted": { "title": { "de": "..." }, "body": { "de": "..." } }
        },
        "errors": {}
      }
    }
  },
  "design": { "surveys": { "closing": { "primary": "...", "avatarAssetKey": "avatar" } } },
  "logic": {
    "surveys": {
      "closing": {
        "flowVersion": "...",
        "requiredFields": [],
        "handoffRules": {},
        "validation": {}
      }
    }
  },
  "legal": { "consent": { "closing": { "checkboxes": [], "privacyUrlKey": "privacy" } } }
}
```

### 6.5 Rechnung Survey

```json
{
  "content": {
    "surveys": {
      "rechnung": {
        "entryPage": {
          "headline": { "de": "..." },
          "subline": { "de": "..." },
          "uploadCta": { "de": "..." }
        },
        "upload": { "labels": {}, "helpTexts": {}, "errors": {} },
        "analysisResult": { "labels": {}, "statusMessages": {} }
      }
    }
  },
  "design": { "surveys": { "rechnung": { "primary": "...", "uploadCardStyle": "..." } } },
  "logic": {
    "surveys": {
      "rechnung": {
        "acceptedFileTypes": [],
        "maxFileSizeMb": 0,
        "analysisRules": {},
        "handoffRules": {}
      }
    }
  },
  "legal": { "consent": { "rechnung": { "checkboxes": [], "privacyUrlKey": "privacy" } } }
}
```

### 6.6 Offer Page

```json
{
  "content": {
    "offer": {
      "labels": {
        "currentTariff": { "de": "..." },
        "recommendedTariff": { "de": "..." },
        "savings": { "de": "..." },
        "details": { "de": "..." },
        "changeTariff": { "de": "..." }
      },
      "templates": {
        "default": { "headline": { "de": "..." }, "summary": { "de": "..." } },
        "spart": {},
        "neueinzug": {},
        "bleibt": {}
      },
      "aiBlocks": {
        "fazit": { "de": "..." },
        "warum": [{ "de": "..." }],
        "hinweise": [{ "de": "..." }]
      }
    }
  },
  "design": { "offer": { "primary": "...", "cards": {}, "modal": {} } },
  "logic": {
    "offer": {
      "usecaseMapping": {},
      "savingsDisplayRules": {},
      "ctaRules": {}
    }
  },
  "urls": { "auftrag": "...", "start": "..." }
}
```

### 6.7 E-Mail/CRM später

```json
{
  "content": {
    "crm": {
      "emails": {
        "settingSubmitted": {
          "subject": { "de": "..." },
          "preheader": { "de": "..." },
          "bodyBlocks": [{ "id": "...", "text": { "de": "..." } }],
          "cta": { "label": { "de": "..." }, "urlKey": "tarif" }
        },
        "offerReady": {},
        "closingReminder": {},
        "billAnalysisReady": {}
      },
      "sms": {},
      "whatsapp": {}
    }
  },
  "design": { "crm": { "logoAssetKey": "logo", "primary": "..." } },
  "legal": { "crm": { "unsubscribeText": { "de": "..." }, "footerLegal": { "de": "..." } } },
  "urls": { "crmBase": "...", "unsubscribe": "...", "privacy": "...", "imprint": "..." },
  "integrations": { "crm": { "provider": "...", "locationId": "...", "pipelineIds": {} } }
}
```

## 7. Ziel-Mapping nach Produktbereich

| Bereich | Aktuelle Quelle | Aktuelle Supabase-Spalte | Zielpfad | Sprache | Priorität | Risiko |
| --- | --- | --- | --- | --- | --- | --- |
| Website Homepage | Komponenten, `src/lib/i18n.tsx`, hardcodierte Arrays | künftig `webseite_content_config`; aktuell im Code nicht durchgehend wired | `content.website.sections.*` | initial DE, 12-sprachig vorbereitet | P0 | Inkonsistente Zahlen/Branding, wenn alte i18n-Fallbacks aktiv bleiben. |
| Website `/jahresrechnung` | Page-Fallbacks, i18n-Keys, hardcodierte Reviews/Stats | künftig `webseite_content_config` | `content.website.sections.annualBill.*` | initial DE, 12-sprachig vorbereitet | P0 | Mobile Review-Struktur darf beim Wiring nicht brechen. |
| Header/Footer/Shared CTA | i18n, Komponenten-Fallbacks | künftig `webseite_content_config`, `url_config` | `content.website.navigation`, `content.website.footer`, `urls.*` | initial DE, 12-sprachig vorbereitet | P0 | Falsche Links/Labels betreffen Conversion. |
| Legal | Legal Pages hardcodiert | später `legal.operator`, `legal.privacy`, ggf. `setting_consent_text`/`closing_consent_text` | `legal.*` | vorerst DE | P0 vor CRM | Rechtliches Risiko bei ungeprüfter Migration. |
| Loader Start | `public/loaders/start.html`, `TB_BOOTSTRAP`, Runtime-Fetch | `url_config`, `setting_survey_design` | `content.loaders.start`, `design.loaders.start`, `urls.*`, `logic.surveys.setting` | DE + Survey-Sprachen | P0/P1 | Loader sind produktiv; nur Adapter-PR mit Tests. |
| Loader Auftrag | `public/loaders/auftrag.html`, `TB_BOOTSTRAP`, Runtime-Fetch | `url_config`, `closing_survey_design`, Fallback `setting_survey_design` | `content.loaders.auftrag`, `design.loaders.auftrag`, `logic.surveys.closing` | DE + Survey-Sprachen | P0/P1 | Closing-Handoff darf nicht unterbrochen werden. |
| Offer Page | `public/loaders/tarif.html`, `auftraege.ai_content` | `auftraege.*`, später `offer_copy_templates`, `ai_offer_content` | `content.offer`, `logic.offer`, transaktionsbezogen `auftraege.ai_content` | DE + vorhandene Ergebnis-Sprachen | P1 | KI-/Usecase-Templates nicht mit transaktionsbezogenen Ergebnisdaten vermischen. |
| Rechnung Survey | Website-Page und später eigener Loader/Flow | noch nicht eindeutig | `content.surveys.rechnung`, `logic.surveys.rechnung` | initial DE | P1 | Upload-/Analyse-Flow braucht separate fachliche Freigabe. |
| E-Mail/CRM | separates E-Mail-Repo als Draft-Basis | noch nicht final | `content.crm`, `legal.crm`, `urls.crm`, `integrations.crm` | initial DE, 12-sprachig später | P2 nach Vorarbeiten | CRM darf keine abweichenden Brand-/Legal-/URL-Wahrheiten aufbauen. |

## 8. Migrationsplan in Phasen

### Phase 0 — Dokumentation und Freeze-Regeln

- Dieses Dokument als Architekturgrundlage einführen.
- Keine Runtime-Änderung, keine Supabase-Operation, keine Migration.
- Festhalten: Kromen, `template`, Hauptrepo und E-Mail-Repo bleiben unberührt.
- Akzeptanz: `git diff --name-only` zeigt nur Doku-Dateien.

### Phase 1 — WebsiteConfig-Leseschema und Repo-Fallbacks vorbereiten

- Schema für `content.website`, `design.website`, `layout.website`, `urls`, `legal`, `assets` finalisieren.
- Repo Customer Fallback für Ehiogie als neue, getrennte Config-Datei vorbereiten.
- Repo Template Fallback nur als neutrales Schema, nicht aus ungepflegtem `template` ableiten.
- Resolver/Adapter so entwerfen, dass alte Keys aus `webseite_content_config` backward-compatible bleiben.
- Noch keine Copy-/Übersetzungsänderung in derselben PR.

### Phase 2 — Homepage config-driven machen

- Homepage-Komponenten auf `getText(path, fallback, lang)` / `getArray(path, fallback)` oder äquivalente WebsiteConfig-API migrieren.
- Zahlen wie Nutzeranzahl, Stats und Testimonials-Headline aus einem gemeinsamen Pfad beziehen.
- Technische Fallbacks erhalten, aber als letzte Ebene.
- Keine Design-/Layout-Änderung.

### Phase 3 — `/jahresrechnung` config-driven machen

- Jahresrechnung-Hero, Steps, Trust-Blöcke, Reviews, Stats, FAQ und Final CTA an WebsiteConfig anbinden.
- Mobile Review-/Carousel-Design unverändert lassen.
- Rechnung-Survey-Zielstruktur dokumentiert halten, aber produktive Survey-Logik nicht ungeprüft ändern.

### Phase 4 — Shared, Legal, URLs und Assets normalisieren

- Header/Footer/Shared CTA, Callback-Link, Booking-Integration, Legal Pages, Meta Tags, Bilder und Favicons aus getrennten Domänen lesen.
- `url_config` auf Zielpfade mappen.
- Betreiber-/Legal-Werte nur mit Legal-Freigabe ändern.

### Phase 5 — Loader-/Survey-/Offer-Adapter

- Start-/Auftrag-/Tarif-Loader mit Adapter-Layer ausstatten, der bestehende Spalten weiter liest und Zielstruktur bevorzugt.
- `setting_survey_design` und `closing_survey_design` nicht pauschal zusammenführen; erst Adapter, dann Datenmigration.
- Offer-Templates von transaktionsbezogenem `auftraege.ai_content` trennen.

### Phase 6 — CRM-Vorbereitung

- CRM darf dieselben `brand`, `legal`, `urls`, `assets` und freigegebenen Content-Bausteine nutzen.
- E-Mail-Repo-Drafts erst nach stabiler Website-/Loader-/Legal-Konfiguration in CRM-Struktur überführen.
- Opt-in/Consent und Unsubscribe-Pfade vor produktiver CRM-Automation verbindlich definieren.

### Phase 7 — Datenmigration und Cleanup nach Stabilisierung

- Erst nach produktiv getesteten Adaptern Supabase-Daten normalisieren.
- Legacy-Spalten nicht entfernen, bevor Monitoring zeigt, dass keine produktive Location mehr darauf angewiesen ist.
- Technische Komponenten-Fallbacks ausdünnen, aber nie komplett ohne sichere Minimalwerte entfernen.

## 9. Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
| --- | --- | --- |
| Vermischung von Content, Legal und Logic | CRM oder Website könnten falsche oder rechtlich ungeprüfte Aussagen ausspielen. | Strikte Domänen und Review-Owner je Pfad. |
| Ungesteuerte Text-/Übersetzungsänderungen während Wiring | Sichtbare Regression trotz technischer Migration. | Content-Freeze je Wiring-PR; nur Quellen ändern, nicht Copy. |
| Loader-Ausfall durch zu frühe Schema-Umstellung | Setting/Closing/Offer-Flows brechen produktiv. | Adapter first, alte Spalten weiter lesen, keine direkte Datenmigration. |
| `template` als falsche Wahrheit | Neukunden übernehmen veraltete oder falsche Werte. | Template erst später aus stabilen Kundenbranches ableiten. |
| Kromen-/Ehiogie-Vermischung | Falsches Branding oder Legal-Daten im Kundenbranch. | Kundenspezifische Repo-Fallbacks und Supabase-Overrides strikt trennen. |
| CRM startet vor Legal-/URL-Normalisierung | E-Mails verlinken falsch oder enthalten abweichende Pflichtangaben. | CRM-Start an P0-Vorarbeiten koppeln. |
| Alte Supabase-Spalten werden zu früh entfernt | Bestehende produktive Loader/Engines verlieren Fallbacks. | Legacy-Spalten erst nach Adapter, Monitoring und separater Migration entfernen. |
| Mehrsprachigkeit wird als reine Übersetzung statt Content-Struktur behandelt | 12-Sprachen-Ausbau wird inkonsistent und schwer wartbar. | Sprachobjekte im Schema vorsehen, aber Übersetzungs-PRs separat planen. |

## 10. Folge-PRs, die vor dem CRM nötig sind

1. **WebsiteConfig-Schema + Resolver-Fallbacks**
   - Ziel: `Supabase Location Override → Repo Customer Fallback → Repo Template Fallback → technischer Fallback` technisch abbilden.
   - Scope: Schema/Resolver/Tests, keine sichtbare Copy-Änderung.
2. **Homepage auf WebsiteConfig migrieren**
   - Ziel: Hero, Stats, Problem/Solution, Comparison, Testimonials, About, FAQ, CTAs config-driven.
   - Scope: Quelle ändern, Design und Texte unverändert lassen.
3. **`/jahresrechnung` auf WebsiteConfig migrieren**
   - Ziel: Jahresrechnung-Seite inklusive Reviews/Stats/FAQ/Final CTA config-driven.
   - Scope: Mobile Layout schützen, keine Review-Copy ändern.
4. **Shared Brand/Legal/URLs/Assets normalisieren**
   - Ziel: Header, Footer, Meta, Callback, Impressum, Datenschutz, Cookie/Consent und Asset-Referenzen aus getrennten Domänen lesen.
   - Scope: Legal-Freigabe für tatsächliche Wertänderungen separat einholen.
5. **Loader-/Offer-/Survey-Config-Adapter dokumentieren und implementieren**
   - Ziel: produktive Loader lesen Zielstruktur bevorzugt, bestehende Spalten bleiben Fallback.
   - Scope: keine Supabase-Migration im Adapter-PR; erst Runtime-Kompatibilität beweisen.

## 11. Aufgaben, die erst nach CRM-Start kommen dürfen

Diese Aufgaben sind wichtig, sollen aber den CRM-Start nicht blockieren, sofern die P0-Config-Bausteine stabil sind:

- Vollständige 12-Sprachen-Content-Erweiterung für alle Website-, Survey-, Offer- und CRM-Texte.
- Cleanup alter Komponenten-Fallbacks, sobald Monitoring zeigt, dass Supabase- und Repo-Fallbacks stabil sind.
- Entfernung oder harte Ablösung alter Supabase-Spalten nach separater Datenmigration.
- Ableitung eines neuen produktionsreifen `template`-Branches aus stabilen Kundenbranches.
- Kromen-Catch-up auf Basis der stabilen Ehiogie-Architektur.
- Admin-UI für Location-/Content-Editoren.
- Erweiterte A/B-Test- oder Layout-Experiment-Struktur.
- CRM-Feinoptimierungen wie segmentierte Sequenzen, Timing-Experimente und kanalübergreifende Varianten.

## 12. Validierung für diesen Dokumentations-PR

Erwartete Validierung:

```bash
git diff --name-only
```

Erwartetes Ergebnis für diesen PR:

```text
docs/unified-config-architecture.md
```

Build/Test ist für diesen PR optional, weil ausschließlich Dokumentation erstellt wird. Sinnvolle Checks sind:

```bash
git diff --check -- docs/unified-config-architecture.md
test "$(git diff --name-only | tr '\n' ' ')" = "docs/unified-config-architecture.md "
```

## 13. Explizite Nicht-Änderungen in diesem PR

- Keine UI-Änderung.
- Keine Textänderung in Runtime-Dateien.
- Keine Übersetzungsänderung.
- Keine Supabase-Schreiboperation.
- Keine Migration.
- Kein SQL.
- Kein Deploy.
- Keine Loader-Logikänderung.
- Kromen nicht anfassen.
- Template nicht anfassen.
- Hauptrepo nicht anfassen.
- E-Mail-Repo nicht anfassen.
