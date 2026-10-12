import { customerConfigReadiness } from "./customerRuntime";
import { resolveWebsiteRuntime, isLegacyAnonJwt } from "./websiteRuntime";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  customerDefaultWebsiteContentConfig,
  customerDefaultWebsiteDesignConfig,
  customerDefaultWebsiteLayoutConfig,
} from "./customerDefaults";
import {
  deepMerge,
  interpolateTemplate,
  resolveArray,
  resolveLocalizedText,
  resolveObject,
  type JsonRecord,
} from "./websiteContentResolver";

export type WebsiteConfigSource = "fallback" | "supabase";

export type WebsiteConfigBucket = "content" | "design" | "layout";

export type WebsiteConfig = {
  content: JsonRecord;
  design: JsonRecord;
  layout: JsonRecord;
};

export type WebsiteConfigOverrides = Partial<Record<WebsiteConfigBucket, JsonRecord | null | undefined>>;

type WebsiteConfigState = WebsiteConfig & {
  loading: boolean;
  source: WebsiteConfigSource;
  readiness?: "READY" | "NOT_READY";
  notReadyReason?: string;
};

export type WebsiteTenantConfig = {
  locationId: string;
};

const safeDefaultWebsiteConfig: WebsiteConfig = {
  content: {},
  design: {},
  layout: {},
};

export const tenantFallbackWebsiteConfig: WebsiteConfig = {
  design: {
    ...customerDefaultWebsiteDesignConfig,
  },
  content: {
    ...customerDefaultWebsiteContentConfig,
  },
  layout: {
    ...customerDefaultWebsiteLayoutConfig,
  },
};

export const defaultWebsiteDesignConfig: JsonRecord = tenantFallbackWebsiteConfig.design;
export const defaultWebsiteLayoutConfig: JsonRecord = tenantFallbackWebsiteConfig.layout;
export const defaultWebsiteContentConfig: JsonRecord = tenantFallbackWebsiteConfig.content;

const isJsonRecord = (value: unknown): value is JsonRecord => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

export const mergeWebsiteConfig = (base: WebsiteConfig, overrides: WebsiteConfigOverrides = {}): WebsiteConfig => ({
  content: deepMerge(base.content, isJsonRecord(overrides.content) ? overrides.content : {}),
  design: deepMerge(base.design, isJsonRecord(overrides.design) ? overrides.design : {}),
  layout: deepMerge(base.layout, isJsonRecord(overrides.layout) ? overrides.layout : {}),
});

export const resolveWebsiteConfig = (overrides: WebsiteConfigOverrides = {}): WebsiteConfig => {
  const repoFallback = mergeWebsiteConfig(safeDefaultWebsiteConfig, tenantFallbackWebsiteConfig);
  const content = overrides.content;
  const sections = isJsonRecord(content?.sections) ? content.sections : {};
  const about = isJsonRecord(sections.about) ? sections.about : null;
  if (!about) return mergeWebsiteConfig(repoFallback, overrides);
  // Retain legacy personal About configs without requiring a database migration.
  const normalizedAbout = {
    ...about,
    ...(!("mode" in about) && ("person_name" in about || "avatar_url" in about) ? { mode: "person" } : {}),
    ...(!("name" in about) && "person_name" in about ? { name: about.person_name } : {}),
    ...(!("image_url" in about) && "avatar_url" in about ? { image_url: about.avatar_url } : {}),
    ...(!("image_alt" in about) && "person_name" in about ? { image_alt: about.person_name } : {}),
  };
  return mergeWebsiteConfig(repoFallback, {
    ...overrides,
    content: { ...content, sections: { ...sections, about: normalizedAbout } },
  });
};

type WebsiteConfigContextValue = WebsiteConfigState & {
  tenant: WebsiteTenantConfig;
  customerRuntime: boolean;
  getText: (path: string, fallback: string, lang?: string) => string;
  getArray: <T = unknown>(path: string, fallback: T[]) => T[];
  getObject: <T extends JsonRecord = JsonRecord>(path: string, fallback: T) => T;
  interpolate: (template: string, vars?: Record<string, string>) => string;
};

const WebsiteConfigContext = createContext<WebsiteConfigContextValue | null>(null);

export const WebsiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [runtime] = useState(() => resolveWebsiteRuntime());
  const [state, setState] = useState<WebsiteConfigState>({
    ...(runtime.identity.customer ? safeDefaultWebsiteConfig : resolveWebsiteConfig()),
    readiness: runtime.identity.customer ? "NOT_READY" : "READY",
    notReadyReason: runtime.identity.customer ? runtime.identity.reason || "CONFIG_NOT_READY" : undefined,
    loading: true,
    source: "fallback",
  });

  useEffect(() => {
    const run = async () => {
      try {
        const { locationId, supabaseUrl: url, supabaseKey: key } = runtime;
        const runtimeSupabase = { url, key };

        if (!locationId || !runtimeSupabase.url || !runtimeSupabase.key) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const endpoint = `${runtimeSupabase.url}/rest/v1/kunden_config?select=webseite_design_config,webseite_content_config,webseite_layout_config,location_id&location_id=eq.${encodeURIComponent(locationId)}&limit=1`;
        const headers: Record<string, string> = { apikey: runtimeSupabase.key };
        if (isLegacyAnonJwt(runtimeSupabase.key)) {
          headers.Authorization = `Bearer ${runtimeSupabase.key}`;
        }
        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const rows = (await response.json()) as Array<{
          location_id?: unknown;
          webseite_design_config?: unknown;
          webseite_content_config?: unknown;
          webseite_layout_config?: unknown;
        }>;

        const row = rows?.[0];
        if (!row || (runtime.identity.customer && (rows.length !== 1 || row.location_id !== locationId))) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const overrides = {
          design: isJsonRecord(row.webseite_design_config) ? row.webseite_design_config : {},
          content: isJsonRecord(row.webseite_content_config) ? row.webseite_content_config : {},
          layout: isJsonRecord(row.webseite_layout_config) ? row.webseite_layout_config : {},
        };
        const config = runtime.identity.customer ? overrides : resolveWebsiteConfig(overrides);
        const reason = runtime.identity.customer ? customerConfigReadiness(config) : "READY";
        setState({
          ...(reason === "READY" ? config : safeDefaultWebsiteConfig),
          loading: false,
          source: "supabase",
          readiness: reason === "READY" ? "READY" : "NOT_READY",
          notReadyReason: reason === "READY" ? undefined : reason,
        });
      } catch {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    void run();
  }, [runtime]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = (state.design.colors || {}) as Record<string, string>;
    if (colors.primary) root.style.setProperty("--website-primary", colors.primary);
    if (colors.background) root.style.setProperty("--website-bg", colors.background);
    if (colors.text) root.style.setProperty("--website-text", colors.text);
  }, [state.design]);

  const value = useMemo<WebsiteConfigContextValue>(() => ({
    ...state,
    tenant: { locationId: runtime.locationId },
    customerRuntime: runtime.identity.customer,
    getText: (path, fallback, lang) => resolveLocalizedText(state.content, path, runtime.identity.customer ? "" : fallback, lang),
    getArray: (path, fallback) => resolveArray(state.content, path, runtime.identity.customer ? resolveArray(state.content, path.replace(/\.(de|en|tr|ru|ar|it|zh|hi|es|fr|nl|pl)$/, ""), []) : fallback),
    getObject: (path, fallback) => resolveObject(state.content, path, runtime.identity.customer ? {} as typeof fallback : fallback),
    interpolate: (template, vars = {}) => interpolateTemplate(template, vars),
  }), [state, runtime]);

  return <WebsiteConfigContext.Provider value={value}>{children}</WebsiteConfigContext.Provider>;
};

export const useWebsiteConfig = () => {
  const ctx = useContext(WebsiteConfigContext);
  if (!ctx) throw new Error("useWebsiteConfig must be used within WebsiteConfigProvider");
  return ctx;
};
