import { getByPath, type JsonRecord } from "./websiteContentResolver";

/** Only identifiers in the page-owned registry can render. First occurrence wins. */
export function websiteSections(layout: JsonRecord, page: "home" | "annual", allowed: readonly string[], customer = false): string[] {
  const configured = getByPath(layout, `pages.${page}.sections`);
  if (!Array.isArray(configured)) return customer ? [] : [...allowed];
  const seen = new Set<string>();
  return configured.flatMap(entry => {
    const id = typeof entry === "string" ? entry : entry && typeof entry === "object" ? entry.id : undefined;
    if (typeof id !== "string" || !allowed.includes(id) || seen.has(id)) return [];
    seen.add(id);
    return entry && typeof entry === "object" && (entry.visible === false || entry.enabled === false) ? [] : [id];
  });
}
