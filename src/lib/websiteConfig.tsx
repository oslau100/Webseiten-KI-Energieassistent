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

type WebsiteConfigState = {
  design: JsonRecord;
  content: JsonRecord;
  layout: JsonRecord;
  loading: boolean;
  source: "fallback" | "remote";
};

const DEFAULT_LOCATION_ID = "tn90CyE3XuYFTy4c1M3F";
const DEFAULT_SUPABASE_URL = "https://oynhnhkldvpoqhsfirwf.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "<SECRET>";

export const defaultWebsiteDesignConfig: JsonRecord = {
  ...customerDefaultWebsiteDesignConfig,
};

export const defaultWebsiteLayoutConfig: JsonRecord = {
  ...customerDefaultWebsiteLayoutConfig,
};

export const defaultWebsiteContentConfig: JsonRecord = {
  ...customerDefaultWebsiteContentConfig,
};

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
        const supabaseUrl = String(querySupabaseUrl || bootstrap.supabaseUrl || DEFAULT_SUPABASE_URL).trim();
        const supabaseKey = String(querySupabaseKey || bootstrap.supabaseKey || DEFAULT_SUPABASE_ANON_KEY).trim();

        if (!locationId || !supabaseUrl || !supabaseKey || supabaseKey === "<SECRET>") {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }

        const endpoint = `${supabaseUrl}/rest/v1/kunden_config?select=webseite_design_config,webseite_content_config,webseite_layout_config&location_id=eq.${encodeURIComponent(locationId)}&limit=1`;
        const response = await fetch(endpoint, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });

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

        setState({
          design: deepMerge(defaultWebsiteDesignConfig, row.webseite_design_config || {}),
          content: deepMerge(defaultWebsiteContentConfig, row.webseite_content_config || {}),
          layout: deepMerge(defaultWebsiteLayoutConfig, row.webseite_layout_config || {}),
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
