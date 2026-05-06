import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  customerDefaultWebsiteContentConfig,
  customerDefaultWebsiteDesignConfig,
  customerDefaultWebsiteLayoutConfig,
} from "./customerDefaults";

type JsonRecord = Record<string, unknown>;

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

const deepMerge = (base: JsonRecord, override: JsonRecord): JsonRecord => {
  const merged: JsonRecord = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    const current = merged[key];
    if (Array.isArray(value)) {
      merged[key] = value;
      continue;
    }
    if (value && typeof value === "object" && current && typeof current === "object" && !Array.isArray(current)) {
      merged[key] = deepMerge(current as JsonRecord, value as JsonRecord);
      continue;
    }
    merged[key] = value;
  }
  return merged;
};

const getByPath = (obj: JsonRecord, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as JsonRecord)[key];
  }, obj);
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
    getText: (path, fallback, lang) => {
      const raw = getByPath(state.content, path);
      if (typeof raw === "string") return raw;
      if (raw && typeof raw === "object") {
        if (lang) {
          const localized = (raw as JsonRecord)[lang];
          if (typeof localized === "string") return localized;
        }
        const de = (raw as JsonRecord).de;
        if (typeof de === "string") return de;
        for (const v of Object.values(raw as JsonRecord)) {
          if (typeof v === "string") return v;
        }
      }
      return fallback;
    },
    getArray: (path, fallback) => {
      const raw = getByPath(state.content, path);
      return Array.isArray(raw) ? (raw as typeof fallback) : fallback;
    },
    getObject: (path, fallback) => {
      const raw = getByPath(state.content, path);
      return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as typeof fallback) : fallback;
    },
    interpolate: (template, vars = {}) => String(template || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => vars[key] ?? ""),
  }), [state]);

  return <WebsiteConfigContext.Provider value={value}>{children}</WebsiteConfigContext.Provider>;
};

export const useWebsiteConfig = () => {
  const ctx = useContext(WebsiteConfigContext);
  if (!ctx) throw new Error("useWebsiteConfig must be used within WebsiteConfigProvider");
  return ctx;
};
