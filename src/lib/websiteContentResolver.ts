export type JsonRecord = Record<string, unknown>;

export const deepMerge = (base: JsonRecord, override: JsonRecord): JsonRecord => {
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

export const getByPath = (obj: JsonRecord, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as JsonRecord)[key];
  }, obj);
};

export const resolveLocalizedText = (obj: JsonRecord, path: string, fallback: string, lang?: string): string => {
  const raw = getByPath(obj, path);
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object") {
    if (lang) {
      const localized = (raw as JsonRecord)[lang];
      if (typeof localized === "string") return localized;
    }
    const de = (raw as JsonRecord).de;
    if (typeof de === "string") return de;
    for (const value of Object.values(raw as JsonRecord)) {
      if (typeof value === "string") return value;
    }
  }
  return fallback;
};

export const resolveArray = <T = unknown>(obj: JsonRecord, path: string, fallback: T[]): T[] => {
  const raw = getByPath(obj, path);
  return Array.isArray(raw) ? (raw as T[]) : fallback;
};

export const resolveObject = <T extends JsonRecord = JsonRecord>(obj: JsonRecord, path: string, fallback: T): T => {
  const raw = getByPath(obj, path);
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as T) : fallback;
};

export const interpolateTemplate = (template: string, vars: Record<string, string> = {}): string =>
  String(template || "").replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => vars[key] ?? "");
