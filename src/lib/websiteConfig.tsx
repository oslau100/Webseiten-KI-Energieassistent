import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  websiteDefaultContentConfig,
  websiteDefaultDesignConfig,
  websiteDefaultLayoutConfig,
} from "./websiteContentDefaults";
import {
  createWebsiteContentResolvers,
  resolveWebsiteConfigLayers,
  type JsonRecord,
} from "./websiteContentResolver";

type WebsiteConfigState = {
  design: JsonRecord;
  content: JsonRecord;
  layout: JsonRecord;
  loading: boolean;
  source: "fallback" | "remote";
};

const DEFAULT_LOCATION_ID = "Ddc0DVM8MT67wmLP3wAA";
// This URL has deliberately been the public Kromen fallback. A key must always
// come from a runtime override or the Vite environment before making a request.
const DEFAULT_SUPABASE_URL = "https://oynhnhkldvpoqhsfirwf.supabase.co";

const isUsablePublicRuntimeValue = (value: unknown) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return Boolean(normalized) && !/^<[^>]+>$/.test(normalized) && !/^(secret|placeholder)$/i.test(normalized);
};

const firstUsablePublicRuntimeValue = (...values: unknown[]) => {
  const value = values.find(isUsablePublicRuntimeValue);
  return typeof value === "string" ? value.trim() : "";
};

// Legacy Supabase anon keys are JWTs. Modern sb_publishable_* keys are not and
// must only be sent through the apikey header.
const isLegacyJwtPublicKey = (value: string) => /^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);

export const defaultWebsiteDesignConfig: JsonRecord = websiteDefaultDesignConfig;

export const defaultWebsiteLayoutConfig: JsonRecord = websiteDefaultLayoutConfig;

export const defaultWebsiteContentConfig: JsonRecord = websiteDefaultContentConfig;

type WebsiteConfigContextValue = WebsiteConfigState & {
  getText: (path: string, fallback: string, lang?: string) => string;
  getArray: <T = unknown>(path: string, fallback: T[]) => T[];
  getObject: <T extends JsonRecord = JsonRecord>(path: string, fallback: T) => T;
  interpolate: (template: string, vars?: Record<string, string>) => string;
};

const WebsiteConfigContext = createContext<WebsiteConfigContextValue | null>(null);

export const WebsiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WebsiteConfigState>({
    design: defaultWebsiteDesignConfig,
    content: defaultWebsiteContentConfig,
    layout: defaultWebsiteLayoutConfig,
    loading: true,
    source: "fallback",
  });

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const queryLocation = url.searchParams.get("location_id") || url.searchParams.get("locationId");
        const querySupabaseUrl = url.searchParams.get("supabase_url");
        const querySupabaseKey = url.searchParams.get("supabase_key");

        const bootstrap = (window as Window & { TB_BOOTSTRAP?: Record<string, string> }).TB_BOOTSTRAP || {};

        const locationId = String(queryLocation || bootstrap.locationId || DEFAULT_LOCATION_ID).trim();
        const supabaseUrl = firstUsablePublicRuntimeValue(
          querySupabaseUrl,
          bootstrap.supabaseUrl,
          import.meta.env.VITE_SUPABASE_URL,
          DEFAULT_SUPABASE_URL,
        );
        const supabaseKey = firstUsablePublicRuntimeValue(
          querySupabaseKey,
          bootstrap.supabaseKey,
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
        );

        if (!locationId || !supabaseUrl || !supabaseKey) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const endpoint = `${supabaseUrl}/rest/v1/kunden_config?select=webseite_design_config,webseite_content_config,webseite_layout_config&location_id=eq.${encodeURIComponent(locationId)}&limit=1`;
        const headers: Record<string, string> = { apikey: supabaseKey };
        if (isLegacyJwtPublicKey(supabaseKey)) {
          headers.Authorization = `Bearer ${supabaseKey}`;
        }

        const response = await fetch(endpoint, { headers });

        if (!response.ok) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const rows = (await response.json()) as Array<{
          webseite_design_config?: JsonRecord;
          webseite_content_config?: JsonRecord;
          webseite_layout_config?: JsonRecord;
        }>;

        const row = rows?.[0];
        if (!row) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const resolved = resolveWebsiteConfigLayers(
          {
            design: defaultWebsiteDesignConfig,
            content: defaultWebsiteContentConfig,
            layout: defaultWebsiteLayoutConfig,
          },
          row,
        );

        setState({
          ...resolved,
          loading: false,
          source: "remote",
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
    ...createWebsiteContentResolvers(state.content),
  }), [state]);

  return <WebsiteConfigContext.Provider value={value}>{children}</WebsiteConfigContext.Provider>;
};

export const useWebsiteConfig = () => {
  const ctx = useContext(WebsiteConfigContext);
  if (!ctx) throw new Error("useWebsiteConfig must be used within WebsiteConfigProvider");
  return ctx;
};
