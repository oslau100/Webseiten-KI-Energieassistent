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
};

export type WebsiteTenantConfig = {
  customer: "ehiogie";
  locationId: string;
};

type SupabaseRuntimeConfig = {
  url?: string;
  key?: string;
};

type RuntimeQueryConfig = {
  locationId?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
};

type BootstrapConfig = {
  locationId?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseKey?: string;
};

const EhiogieTenantFallback: WebsiteTenantConfig = {
  customer: "ehiogie",
  locationId: "tn90CyE3XuYFTy4c1M3F",
};

// This is the public Supabase project URL fallback. A key must always come
// from a runtime override or the Vite environment before making a request.
const DEFAULT_SUPABASE_URL = "https://oynhnhkldvpoqhsfirwf.supabase.co";

const isUsablePublicRuntimeValue = (value: unknown) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return Boolean(normalized) && !/^<[^>]+>$/.test(normalized) && !/^(secret|placeholder)$/i.test(normalized);
};

const firstUsablePublicRuntimeValue = (...values: unknown[]) => {
  const value = values.find(isUsablePublicRuntimeValue);
  return typeof value === "string" ? value.trim() : "";
};

const isLegacyJwtPublicKey = (value: string) => /^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);

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
  return mergeWebsiteConfig(repoFallback, overrides);
};

const getBootstrapConfig = (): BootstrapConfig => {
  if (typeof window === "undefined") return {};
  return ((window as Window & { TB_BOOTSTRAP?: BootstrapConfig }).TB_BOOTSTRAP || {}) as BootstrapConfig;
};

const getRuntimeQueryConfig = (): RuntimeQueryConfig => {
  if (typeof window === "undefined") return {};

  const searchParams = new URLSearchParams(window.location.search);
  return {
    locationId: String(searchParams.get("location_id") || searchParams.get("locationId") || "").trim() || undefined,
    supabaseUrl: String(searchParams.get("supabase_url") || "").trim() || undefined,
    supabaseKey: String(searchParams.get("supabase_key") || "").trim() || undefined,
  };
};

const getRuntimeLocationId = (bootstrap: BootstrapConfig, query: RuntimeQueryConfig): string => {
  return firstUsablePublicRuntimeValue(query.locationId, bootstrap.locationId, EhiogieTenantFallback.locationId);
};

const getRuntimeSupabaseConfig = (bootstrap: BootstrapConfig, query: RuntimeQueryConfig): SupabaseRuntimeConfig => {
  const env = import.meta.env as Record<string, string | undefined>;
  return {
    url: firstUsablePublicRuntimeValue(query.supabaseUrl, bootstrap.supabaseUrl, env.VITE_SUPABASE_URL, DEFAULT_SUPABASE_URL) || undefined,
    key: firstUsablePublicRuntimeValue(
      query.supabaseKey,
      bootstrap.supabaseAnonKey,
      bootstrap.supabaseKey,
      env.VITE_SUPABASE_PUBLISHABLE_KEY,
      env.VITE_SUPABASE_ANON_KEY,
    ) || undefined,
  };
};

type WebsiteConfigContextValue = WebsiteConfigState & {
  tenant: WebsiteTenantConfig;
  getText: (path: string, fallback: string, lang?: string) => string;
  getArray: <T = unknown>(path: string, fallback: T[]) => T[];
  getObject: <T extends JsonRecord = JsonRecord>(path: string, fallback: T) => T;
  interpolate: (template: string, vars?: Record<string, string>) => string;
};

const WebsiteConfigContext = createContext<WebsiteConfigContextValue | null>(null);

export const WebsiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WebsiteConfigState>({
    ...resolveWebsiteConfig(),
    loading: true,
    source: "fallback",
  });

  useEffect(() => {
    const run = async () => {
      try {
        const bootstrap = getBootstrapConfig();
        const query = getRuntimeQueryConfig();
        const runtimeSupabase = getRuntimeSupabaseConfig(bootstrap, query);
        const locationId = getRuntimeLocationId(bootstrap, query);

        if (!locationId || !runtimeSupabase.url || !runtimeSupabase.key) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const endpoint = `${runtimeSupabase.url}/rest/v1/kunden_config?select=webseite_design_config,webseite_content_config,webseite_layout_config&location_id=eq.${encodeURIComponent(locationId)}&limit=1`;
        const headers: Record<string, string> = { apikey: runtimeSupabase.key };
        if (isLegacyJwtPublicKey(runtimeSupabase.key)) {
          headers.Authorization = `Bearer ${runtimeSupabase.key}`;
        }
        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const rows = (await response.json()) as Array<{
          webseite_design_config?: unknown;
          webseite_content_config?: unknown;
          webseite_layout_config?: unknown;
        }>;

        const row = rows?.[0];
        if (!row) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        setState({
          ...resolveWebsiteConfig({
            design: row.webseite_design_config,
            content: row.webseite_content_config,
            layout: row.webseite_layout_config,
          }),
          loading: false,
          source: "supabase",
        });
      } catch {
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    void run();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const colors = (state.design.colors || {}) as Record<string, string>;
    if (colors.primary) root.style.setProperty("--website-primary", colors.primary);
    if (colors.background) root.style.setProperty("--website-bg", colors.background);
    if (colors.text) root.style.setProperty("--website-text", colors.text);
  }, [state.design]);

  const value = useMemo<WebsiteConfigContextValue>(() => ({
    ...state,
    tenant: EhiogieTenantFallback,
    getText: (path, fallback, lang) => resolveLocalizedText(state.content, path, fallback, lang),
    getArray: (path, fallback) => resolveArray(state.content, path, fallback),
    getObject: (path, fallback) => resolveObject(state.content, path, fallback),
    interpolate: (template, vars = {}) => interpolateTemplate(template, vars),
  }), [state]);

  return <WebsiteConfigContext.Provider value={value}>{children}</WebsiteConfigContext.Provider>;
};

export const useWebsiteConfig = () => {
  const ctx = useContext(WebsiteConfigContext);
  if (!ctx) throw new Error("useWebsiteConfig must be used within WebsiteConfigProvider");
  return ctx;
};
