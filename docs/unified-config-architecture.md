# Unified Config Architecture v2

**Scope:** This document defines the v2 target architecture for a unified customer-facing configuration system for the current Ehiogie production/work branch (`location_id = tn90CyE3XuYFTy4c1M3F`). It is based on `docs/ehiogie-client-facing-config-audit-v2.md` and the current branch state.

**Repository boundaries:** The website repository contains productive customer branches and productive loaders. The main repository `KI-Energieassistent` contains engines, Edge Functions, loader backups, and system files. The E-Mail repository currently contains only German draft/template mails for a later CRM mail system.

**Non-goals for this PR:** This is documentation only. It does not change runtime code, UI, copy, translations, Supabase data, migrations, SQL, deploy configuration, loader logic, Kromen, Template, the main repository, or the E-Mail repository.

## 1. Target Picture

The target is a single, explicit configuration architecture that separates customer-specific data from application code while preserving safe fallbacks for production. The unified system should make clear which values belong to tenant identity, website content, survey behavior, offer rendering, CRM handoff, legal consent, assets, and integrations.

The target architecture should:

1. Keep the Ehiogie branch operational while configuration is migrated incrementally.
2. Treat Ehiogie as the current leading production/work branch.
3. Treat Kromen as a later catch-up target that must not be changed by this architecture documentation PR.
4. Avoid using the Template branch as technical truth because it is currently not productively maintained.
5. Keep existing Supabase columns available during migration so current Website and Loader flows do not break.
6. Introduce a stable JSON target structure that can later be populated from Supabase, CRM, or a dedicated config service.
7. Make ownership explicit for each config domain before CRM-driven automation starts.
8. Prevent uncontrolled duplication between website config, loader config, survey config, i18n dictionaries, and future CRM mail templates.

## 2. Configuration Domains and Separation

Unified Config must be organized by responsibility, not by the accidental location where a value is currently read.

| Domain | Purpose | Examples | Initial owner/source | Target owner/source |
|---|---|---|---|---|
| `content` | Human-readable website and funnel copy | Hero text, FAQ, testimonials, CTA labels, status page messages | `webseite_content_config`, repo fallbacks, i18n dictionaries, loader fallbacks | Versioned tenant content config with multilingual support |
| `design` | Visual identity and theme tokens | Colors, typography, border radii, shadows, component theme variants | `webseite_design_config`, `design_config`, repo fallbacks | Tenant design config shared by Website, Loader, Offer Page |
| `layout` | Section order, visibility, structural composition | Homepage sections, Jahresrechnung sections, offer page modules | `webseite_layout_config`, code defaults | Tenant layout config with guarded schema |
| `logic` | Non-visual behavior and flow rules | Survey steps, validation rules, branching, language handling, offer rules | Loader/engine config, `runtime_config`, survey logic columns, external engines | Engine-owned versioned logic config with website-visible contract |
| `urls` | Tenant URLs and route targets | Website base URL, offer URL, Auftrag URL, callback URL, proxy paths | `url_config`, loader bootstrap, repo fallbacks | Tenant URL config with environment-aware routing |
| `legal` | Mandatory legal and consent content | Impressum, Datenschutz, cookie consent, survey consent, disclosure text | Static pages, `webseite_content_config`, possible survey consent columns | Approved tenant legal/consent config with review status |
| `assets` | Brand and media references | Header/footer logos, hero image, avatar, agency logo, favicons, social images | `webseite_design_config`, `design_config`, loader bootstrap, repo defaults | Asset registry referenced by tenant design/content config |
| `integrations` | External system connection metadata | Supabase project, engines, proxies, CRM/GHL, Calendly, mail sender, analytics | Loader bootstrap, `runtime_config`, future CRM settings | Environment-scoped integration config with secret/public split |

### 2.1 Content

Content contains user-visible words and structured copy. It must not carry engine credentials, runtime URLs, or design-only values. Multilingual content should use one consistent locale object pattern, with German (`de`) as the current fallback language until every locale is completed.

### 2.2 Design

Design contains presentation tokens and asset choices, not text. The website and loader systems currently use both `webseite_design_config` and `design_config`; the target should converge these into one design schema after compatibility is proven.

### 2.3 Layout

Layout controls which sections are visible and in which order. It should not be used to hide missing legal requirements or bypass required funnel steps. Layout changes must be schema-guarded because they affect user journeys.

### 2.4 Logic

Logic defines behavior. Survey branching, required fields, tariff eligibility, offer generation rules, and consent gates belong here. Logic should be versioned with the engine contract and must not be inferred from website content.

### 2.5 URLs

URLs must be tenant- and environment-aware. Public route URLs, internal proxy URLs, engine URLs, callback URLs, and CRM webhook URLs should not be duplicated across loaders and React pages.

### 2.6 Legal

Legal config is a P0 domain. Impressum, Datenschutz, cookies, and survey consent text require explicit ownership, review state, and rollback capability. Legal values may be rendered on the website, in surveys, in offers, and later in CRM e-mails.

### 2.7 Assets

Assets should be referenced by stable keys plus URLs/metadata. Loader avatars, logos, hero images, favicons, agency logos, and social preview images should not be hardcoded independently per loader.

### 2.8 Integrations

Integrations describe connections to Supabase, engines, proxies, CRM, mail systems, calendars, analytics, and storage. Public values and secrets must be separated. This document does not introduce any new integration or secret handling; it only defines the target separation.

## 3. Existing Supabase Columns That Initially Stay

The following existing Supabase-facing columns/config areas should remain in place during the first migration phases to avoid breaking productive Website and Loader flows:

| Existing column/config area | Current role | Keep initially because |
|---|---|---|
| `kunden_config.webseite_content_config` | Website content overrides for brand, sections, legal/page HTML, links, and marketing content | Already used by the website config provider and is the safest first content override layer |
| `kunden_config.webseite_design_config` | Website design overrides for colors/assets/theme values | Already used by the website config provider and can host website-facing design while a unified schema is prepared |
| `kunden_config.webseite_layout_config` | Website layout overrides | Already part of the website config provider contract, even if not consumed everywhere yet |
| `kunden_config.design_config` | Loader and offer design source | Productive loaders rely on it; removing or renaming it would risk funnel breakage |
| `kunden_config.url_config` | Loader redirect/offer URL source | Productive loaders use it for navigation targets and must keep compatibility |
| `kunden_config.runtime_config` | Loader runtime/engine/proxy-related values | Current loaders read runtime values and need compatibility until bootstrap is redesigned |
| `kunden_config.setting_survey_design` | Legacy/fallback setting survey design | Existing loader compatibility path |
| `kunden_config.closing_survey_design` | Legacy/fallback closing survey design | Existing loader compatibility path |
| `kunden_config.setting_survey_logic` | Expected/possible setting survey logic source | Must remain until the engine contract is audited in the main repository |
| `kunden_config.closing_survey_logic` | Expected/possible closing survey logic source | Must remain until the engine contract is audited in the main repository |
| `kunden_config.setting_language_config` | Expected/possible survey language source | Must remain until language ownership is consolidated |
| `kunden_config.setting_consent_text` | Expected/possible setting survey consent source | Must remain until central legal/consent config is introduced |
| `kunden_config.closing_consent_text` | Expected/possible closing survey consent source | Must remain until central legal/consent config is introduced |
| `kunden_config.ai_offer_content` | Expected/possible offer AI content source | Must remain available for main repo/engine/offer audit, even if not directly consumed by the website repo in the audit |
| `kunden_config.offer_copy_templates` | Expected/possible offer copy template source | Must remain available until offer/CRM copy ownership is defined |
| `auftraege.ai_content` and related offer row fields | Offer page content, tariff and AI conclusion source | Productive offer rendering depends on row-level offer data |

## 4. Existing Supabase Columns to Merge or Replace Later

The following areas should be consolidated only after compatibility contracts are documented and tested:

| Current area | Target consolidation | Timing | Notes |
|---|---|---|---|
| `webseite_design_config` + `design_config` | One `design` schema with website/loader/offer subkeys only where necessary | After Loader Bootstrap and design contract PRs | Keep aliases or migration adapters during transition |
| `webseite_content_config` + i18n dictionaries + loader text fallbacks | One `content` schema with locale objects and approved repo fallback | After Website Content Consolidation PR | Existing i18n may remain as technical fallback during migration |
| `webseite_layout_config` + hardcoded section composition | One `layout` schema for pages and funnel shells | After content/design ownership is stable | Do not make legal/required funnel steps optional without guardrails |
| `url_config` + hardcoded loader bootstrap URLs + repo route constants | One `urls` schema with environment and tenant awareness | After Loader Bootstrap PR | Must cover offer, Auftrag, Start, proxies, website base URL, and callback targets |
| `runtime_config` + hardcoded engine/proxy/bootstrap values | One `integrations.runtime` / `engines` schema | After main repo engine contract audit | Public runtime values and secrets must be separated |
| `setting_survey_design` + `closing_survey_design` + survey design under `design_config` | `survey.setting.design` and `survey.closing.design` inside unified design/survey schema | After survey/engine config contract PR | Preserve backward-compatible loader reads first |
| `setting_survey_logic` + `closing_survey_logic` | `survey.setting.logic` and `survey.closing.logic` with engine-owned versions | After main repo engine audit | Logic versioning must match engine releases |
| `setting_consent_text` + `closing_consent_text` + website CookieBar/legal text | `legal.consent` with channel-specific placements | Before CRM launch | Consent needs review/approval state |
| `ai_offer_content` + `offer_copy_templates` + `auftraege.ai_content` | `offer.content`, `offer.templates`, and row-level generated offer output | Before CRM offer automation | Distinguish reusable templates from generated per-order output |
| Future CRM mail templates + website/offer content | `crm.email` and `notifications` referencing shared brand/legal/contact config | During CRM mail PRs, not before foundational config is stable | E-Mail repo drafts are not current technical truth |

## 5. Fallback Order

All runtime consumers should eventually resolve configuration in the same order. The current implementation is not fully unified yet, so this order is the target rule for future implementation PRs.

1. **Supabase Location Override**
   - Highest-priority tenant/location-specific config.
   - Example sources: `kunden_config.webseite_*`, `design_config`, `url_config`, `runtime_config`, survey config, legal/consent config.
   - Must be schema-validated before use in future implementation PRs.
2. **Repo Customer Fallback**
   - Customer-specific fallback committed in the relevant productive customer branch.
   - For Ehiogie, this reflects the current Ehiogie branch defaults.
   - Should be used when Supabase is unavailable or a specific config key is missing.
3. **Repo Template Fallback**
   - Generic fallback shape for missing config keys only.
   - Must not be treated as current production truth while Template is not productively maintained.
   - Should be minimized and schema-focused rather than containing customer-specific values.
4. **Technical Fallback**
   - Last-resort safe fallback to prevent blank screens or fatal crashes.
   - Should be generic, non-branded where possible, and observable in logs/monitoring.
   - Must not silently replace legal, consent, pricing, or offer-critical content without surfacing the issue.

## 6. JSON Target Structure

The examples below define the target shape, not an implementation change in this PR.

### 6.1 Shared Envelope

```json
{
  "schema_version": "2.0.0",
  "tenant": {
    "location_id": "tn90CyE3XuYFTy4c1M3F",
    "slug": "ehiogie",
    "status": "production"
  },
  "locales": {
    "default": "de",
    "supported": ["de", "en", "tr", "pl", "ar", "ru", "uk", "fr", "es", "it", "ro", "bg"]
  },
  "updated_at": "YYYY-MM-DDTHH:mm:ssZ",
  "review": {
    "content_approved": false,
    "legal_approved": false,
    "design_approved": false
  }
}
```

### 6.2 Website

```json
{
  "website": {
    "brand": {
      "name": "Ehiogie Energieassistent",
      "claim": { "de": "..." },
      "contact": {
        "email": "...",
        "phone": "...",
        "person_name": "..."
      },
      "social_profiles": {
        "youtube": "...",
        "facebook": "...",
        "instagram": "...",
        "tiktok": "..."
      }
    },
    "content": {
      "navigation": {
        "header": {
          "primary_cta": { "label": { "de": "..." }, "href_key": "start" },
          "secondary_cta": { "label": { "de": "..." }, "href_key": "rechnung" }
        },
        "footer": {
          "links": [
            { "label": { "de": "Impressum" }, "href_key": "impressum" },
            { "label": { "de": "Datenschutz" }, "href_key": "datenschutz" }
          ]
        }
      },
      "pages": {
        "home": {
          "hero": {
            "headline": { "de": "..." },
            "subheadline": { "de": "..." },
            "primary_cta": { "label": { "de": "..." }, "href_key": "start" }
          },
          "sections": {
            "problem": {},
            "solution": {},
            "how_it_works": {},
            "comparison": {},
            "testimonials": {},
            "stats": {},
            "faq": {}
          }
        },
        "jahresrechnung": {},
        "callback": {},
        "status_pages": {},
        "not_found": {}
      }
    },
    "design": {
      "colors": {},
      "typography": {},
      "components": {},
      "assets": {
        "logo_header": "asset.logo.header",
        "logo_footer": "asset.logo.footer",
        "hero_image": "asset.hero.main",
        "agency_logo": "asset.agency.logo"
      }
    },
    "layout": {
      "pages": {
        "home": {
          "sections": ["hero", "problem", "solution", "how_it_works", "comparison", "testimonials", "stats", "faq"]
        }
      }
    },
    "seo": {
      "title": { "de": "..." },
      "description": { "de": "..." },
      "canonical_url_key": "website_home",
      "social_image": "asset.social.default"
    }
  }
}
```

### 6.3 Loader

```json
{
  "loader": {
    "bootstrap": {
      "location_id": "tn90CyE3XuYFTy4c1M3F",
      "supabase_project_ref": "public_project_ref_or_alias",
      "public_anon_key_ref": "public_key_reference",
      "cache_strategy": "versioned"
    },
    "engines": {
      "setting": {
        "script_url_key": "engine.setting.script",
        "proxy_url_key": "engine.setting.proxy",
        "version": "pinned-version"
      },
      "closing": {
        "script_url_key": "engine.closing.script",
        "proxy_url_key": "engine.closing.proxy",
        "version": "pinned-version"
      },
      "invoice": {
        "script_url_key": "engine.invoice.script",
        "proxy_url_key": "engine.invoice.proxy",
        "version": "pinned-version"
      }
    },
    "shared_design_ref": "website.design",
    "shared_urls_ref": "urls",
    "shared_assets_ref": "assets",
    "observability": {
      "log_config_source": true,
      "surface_missing_required_keys": true
    }
  }
}
```

### 6.4 Setting Survey

```json
{
  "survey": {
    "setting": {
      "enabled": true,
      "logic": {
        "schema_version": "setting-logic-v1",
        "engine_contract_version": "...",
        "steps": [],
        "validation_rules": [],
        "branching_rules": []
      },
      "content": {
        "intro": { "headline": { "de": "..." }, "body": { "de": "..." } },
        "questions": [],
        "errors": {},
        "success": {}
      },
      "design": {
        "theme_ref": "design.survey",
        "avatar_asset": "asset.avatar.default"
      },
      "consent": {
        "required": true,
        "text_ref": "legal.consent.setting"
      },
      "urls": {
        "next_success_url_key": "offer",
        "fallback_url_key": "start"
      }
    }
  }
}
```

### 6.5 Closing Survey

```json
{
  "survey": {
    "closing": {
      "enabled": true,
      "logic": {
        "schema_version": "closing-logic-v1",
        "engine_contract_version": "...",
        "steps": [],
        "validation_rules": [],
        "branching_rules": []
      },
      "content": {
        "intro": { "headline": { "de": "..." }, "body": { "de": "..." } },
        "questions": [],
        "errors": {},
        "success": {}
      },
      "design": {
        "theme_ref": "design.survey",
        "avatar_asset": "asset.avatar.default"
      },
      "consent": {
        "required": true,
        "text_ref": "legal.consent.closing"
      },
      "urls": {
        "next_success_url_key": "auftrag_success",
        "fallback_url_key": "auftrag"
      }
    }
  }
}
```

### 6.6 Rechnung Survey

```json
{
  "survey": {
    "invoice": {
      "enabled": true,
      "logic": {
        "schema_version": "invoice-logic-v1",
        "engine_contract_version": "...",
        "upload_rules": [],
        "validation_rules": [],
        "branching_rules": []
      },
      "content": {
        "intro": { "headline": { "de": "..." }, "body": { "de": "..." } },
        "upload": {},
        "errors": {},
        "success": {}
      },
      "design": {
        "theme_ref": "design.survey",
        "avatar_asset": "asset.avatar.default"
      },
      "consent": {
        "required": true,
        "text_ref": "legal.consent.invoice"
      },
      "urls": {
        "next_success_url_key": "invoice_success",
        "fallback_url_key": "rechnung"
      }
    }
  }
}
```

### 6.7 Offer Page

```json
{
  "offer": {
    "page": {
      "enabled": true,
      "content": {
        "headline_template": { "de": "..." },
        "savings_summary_template": { "de": "..." },
        "trust_elements": [],
        "cta": {
          "primary": { "label": { "de": "..." }, "href_key": "auftrag" },
          "secondary": { "label": { "de": "..." }, "href_key": "start" }
        }
      },
      "design": {
        "theme_ref": "design.offer",
        "components": {}
      },
      "data_sources": {
        "order_table": "auftraege",
        "generated_ai_content_field": "ai_content",
        "tariff_fields": []
      },
      "rules": {
        "require_valid_uuid": true,
        "require_offer_data": true,
        "fallback_when_missing": "show_error_state"
      }
    },
    "templates": {
      "ai_offer_content": {},
      "offer_copy_templates": {}
    }
  }
}
```

### 6.8 E-Mail/CRM Later

```json
{
  "crm": {
    "status": "planned",
    "provider": {
      "type": "ghl_or_later_provider",
      "integration_ref": "integrations.crm.primary"
    },
    "contacts": {
      "sender_profile_ref": "brand.contact",
      "reply_to_ref": "brand.contact.email"
    },
    "email": {
      "templates": {
        "lead_confirmation": {
          "enabled": false,
          "subject": { "de": "..." },
          "body_template_ref": "email.lead_confirmation.de"
        },
        "offer_followup": {
          "enabled": false,
          "subject": { "de": "..." },
          "body_template_ref": "email.offer_followup.de"
        }
      },
      "legal_footer_ref": "legal.email_footer",
      "unsubscribe_ref": "legal.unsubscribe"
    },
    "handoff": {
      "lead_fields": [],
      "order_fields": [],
      "consent_fields": []
    }
  }
}
```

The E-Mail/CRM section is intentionally marked as later. The current E-Mail repository drafts are useful content input, but they are not a runtime source of truth yet.

## 7. Migration Plan

### Phase 0: Documentation and Inventory

- Create this v2 architecture document.
- Keep all runtime behavior unchanged.
- Record current config sources and hardcoded values from the Ehiogie branch.
- Confirm that only documentation files changed.

### Phase 1: Schema and Compatibility Contracts

- Define JSON schemas for `content`, `design`, `layout`, `logic`, `urls`, `legal`, `assets`, and `integrations`.
- Map current Supabase columns to target schema paths.
- Define compatibility adapters without changing productive loader behavior.
- Agree which fields are required for Ehiogie before any CRM automation.

### Phase 2: Legal and Consent Ownership

- Move legal/consent ownership into an approved tenant config model.
- Cover Impressum, Datenschutz, CookieBar, setting survey consent, closing survey consent, invoice survey consent, and e-mail legal footer requirements.
- Add review state and safe fallback rules for legal content.

### Phase 3: Loader Bootstrap Contract

- Inventory all hardcoded loader bootstrap values.
- Define a single tenant/environment bootstrap contract.
- Keep current loader columns readable until the new contract is proven.
- Add observability for config source and missing required keys in a future implementation PR.

### Phase 4: Survey and Engine Contract

- Audit the main repository engines and Edge Functions against current loader expectations.
- Version the setting, closing, and invoice survey logic contracts.
- Separate survey content/design/logic/consent in the target schema.
- Define migration adapters for existing Supabase survey columns.

### Phase 5: Website Content Consolidation

- Decide ownership between `webseite_content_config` and i18n dictionaries.
- Move duplicated header/footer/status/headline copy toward one multilingual content schema.
- Keep repo customer fallback for Ehiogie until Supabase coverage is complete.

### Phase 6: Offer Page and CRM-Ready Offer Model

- Map `auftraege` row fields, `ai_content`, offer templates, CTA URLs, and offer design into the target model.
- Distinguish reusable templates from generated per-order content.
- Define which offer values can be CRM-managed and which remain generated output.

### Phase 7: CRM Mail and Handoff

- Only after legal, loader, survey, URL, and offer contracts are stable, connect CRM mail/handoff configuration.
- Use E-Mail repository drafts as content inputs, not as runtime truth.
- Add sender, reply-to, unsubscribe, consent, lead field, and order field contracts.

### Phase 8: Catch-up and Cleanup

- Create a separate Kromen catch-up PR after the Ehiogie model is stable.
- Remove deprecated aliases only after all productive consumers have migrated.
- Revisit Template only as a generic schema fallback, not as production truth.

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Legal text remains hardcoded or duplicated | High compliance and tenant risk | Prioritize Legal Config PR before CRM |
| Loader bootstrap values remain duplicated | Wrong tenant, project, URL, or engine can be loaded | Prioritize Loader Bootstrap PR with explicit source logging |
| `webseite_design_config` and `design_config` diverge | Website and loader brand mismatch | Define a shared design schema and adapters |
| i18n dictionaries and `webseite_content_config` diverge | Copy inconsistencies across languages and pages | Define content ownership and migration order |
| Template is treated as production truth | Incorrect fallback values may leak into customer branches | Use Template only as generic shape fallback until maintained |
| CRM starts before consent and legal ownership are stable | Incorrect mail/consent handling | Block CRM mail/handoff until legal/consent PRs are complete |
| Offer generated output and reusable templates are mixed | Wrong or stale offer copy/prices can be shown | Separate row-level generated output from tenant templates |
| Kromen is changed during Ehiogie migration | Cross-customer regression | Keep Kromen for a separate catch-up PR |
| Main repo engine contract is unknown | Survey logic migration may break | Audit engines/Edge Functions before changing loader logic |
| Silent technical fallbacks hide missing required config | Production issues become hard to detect | Add observability and fail-safe states for required keys |

## 9. Follow-up PRs Required Before CRM

The following PRs should happen before CRM start because they define the data and consent foundation CRM will depend on:

1. **P0 Legal Config PR**
   - Define tenant-specific Impressum, Datenschutz, CookieBar, survey consent, and future e-mail legal footer ownership.
   - Add approval/review state to legal content.
2. **P0 Loader Bootstrap PR**
   - Inventory and centralize loader bootstrap values: Supabase public project/key reference, engine URLs, proxy URLs, route URLs, avatar URL, and tenant location.
   - Keep productive compatibility during rollout.
3. **P0 Survey/Engine Config Contract PR**
   - Audit main repo engines and Edge Functions.
   - Define setting, closing, and invoice survey logic/content/design/consent contracts.
4. **P0 URL and Routing Config PR**
   - Consolidate website base URL, Start, Auftrag, Rechnung, Tarif/Offer, callback, proxy, and engine URL references.
5. **P0 Offer/Tarif Mapping PR**
   - Define target ownership for offer page content, row-level `auftraege` data, `ai_content`, offer templates, tariff fields, and CTA targets.
6. **P0 Callback/CRM Scheduling Config PR**
   - Model callback/calendar provider IDs and URLs as tenant config before CRM lead routing.
7. **P1 Website Content Consolidation PR**
   - Define when text comes from `webseite_content_config`, i18n, repo customer fallback, or technical fallback.
8. **P1 Multilingual Completion Plan PR**
   - Establish required locale coverage and fallback behavior for website, survey, offer, legal, and later CRM mail content.

## 10. Tasks That Must Wait Until After CRM Start

These tasks should not block CRM start and should not be mixed into the pre-CRM foundation PRs:

1. Kromen catch-up implementation, except for documenting that it is needed later.
2. Template branch cleanup beyond generic schema fallback discussion.
3. Full removal of legacy Supabase columns after adapters are already live and monitored.
4. Broad copy polish and translation rewrites that are not required for legal/consent correctness.
5. Minor NotFound and utility copy centralization.
6. Optional layout dynamization that is not required for CRM flows.
7. Visual redesign or UI polish unrelated to config ownership.
8. E-Mail template productionization beyond defining the CRM mail config contract.
9. Analytics or tracking enhancements not required for core consent/legal handling.
10. Cleanup of deprecated loader fallbacks before production consumers have been migrated.

## 11. Confirmation of Non-Changes in This PR

This documentation PR intentionally makes no operational changes:

- No runtime code changes.
- No UI changes.
- No text or translation changes in runtime files.
- No Supabase write operation.
- No migration.
- No SQL.
- No deploy.
- No loader logic changes.
- No Kromen changes.
- No Template changes.
- No main repository changes.
- No E-Mail repository changes.
- No reuse of PR #90.
