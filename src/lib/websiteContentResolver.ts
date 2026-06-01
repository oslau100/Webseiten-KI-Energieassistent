export type JsonRecord = Record<string, unknown>;

export type WebsiteContentResolvers = {
  getText: (path: string, fallback: string, lang?: string) => string;
  getArray: <T = unknown>(path: string, fallback: T[]) => T[];
  getObject: <T extends JsonRecord = JsonRecord>(path: string, fallback: T) => T;
  interpolate: (template: string, vars?: Record<string, string>) => string;
};

export type WebsiteConfigLayers = {
  design: JsonRecord;
  content: JsonRecord;
  layout: JsonRecord;
};

export type RemoteWebsiteConfigLayers = {
  webseite_design_config?: JsonRecord;
  webseite_content_config?: JsonRecord;
  webseite_layout_config?: JsonRecord;
};

export const mergeWebsiteConfigLayer = (base: JsonRecord, override: JsonRecord): JsonRecord => {
  const merged: JsonRecord = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    const current = merged[key];
    if (Array.isArray(value)) {
      merged[key] = value;
      continue;
    }
    if (value && typeof value === "object" && current && typeof current === "object" && !Array.isArray(current)) {
      merged[key] = mergeWebsiteConfigLayer(current as JsonRecord, value as JsonRecord);
      continue;
    }
    merged[key] = value;
  }
  return merged;
};

export const getWebsiteValueByPath = (obj: JsonRecord, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as JsonRecord)[key];
  }, obj);
};

export const resolveWebsiteConfigLayers = (
  defaults: WebsiteConfigLayers,
  remote: RemoteWebsiteConfigLayers = {},
): WebsiteConfigLayers => ({
  design: mergeWebsiteConfigLayer(defaults.design, remote.webseite_design_config || {}),
  content: mergeWebsiteConfigLayer(defaults.content, remote.webseite_content_config || {}),
  layout: mergeWebsiteConfigLayer(defaults.layout, remote.webseite_layout_config || {}),
});

export const createWebsiteContentResolvers = (content: JsonRecord): WebsiteContentResolvers => ({
  getText: (path, fallback, lang) => {
    const raw = getWebsiteValueByPath(content, path);
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
    const raw = getWebsiteValueByPath(content, path);
    return Array.isArray(raw) ? (raw as typeof fallback) : fallback;
  },
  getObject: (path, fallback) => {
    const raw = getWebsiteValueByPath(content, path);
    return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as typeof fallback) : fallback;
  },
  interpolate: (template, vars = {}) => String(template || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => vars[key] ?? ""),
});
