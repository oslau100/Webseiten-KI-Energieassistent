import { getByPath, type JsonRecord } from "./websiteContentResolver";
import { legacyCustomerCountTemplates } from "./customerSocialProofLegacy";

export const CUSTOMER_COUNT_PLACEHOLDER = "{customer_count}";

export function validCustomerCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

/** Only absence permits the documented DE-stat fallback; invalid explicit values fail closed. */
export function customerCount(content: JsonRecord): number | undefined {
  const configured = getByPath(content, "sections.stats.customer_count");
  if (configured !== undefined) return validCustomerCount(configured) ? configured : undefined;
  const legacy = getByPath(content, "sections.stats.items.de.1.end");
  return validCustomerCount(legacy) ? legacy : undefined;
}

/** Only explicit templates or exact, inventoried V3 copy may substitute a count. */
export function customerCountText(copy: string, count: number | undefined, locale: string): string {
  const known = legacyCustomerCountTemplates[locale];
  const template = known && Object.prototype.hasOwnProperty.call(known, copy) ? known[copy] : copy;
  // Preserve unrelated configured copy. Never infer a number or a different language.
  if (!template.includes(CUSTOMER_COUNT_PLACEHOLDER)) return copy;
  if (!validCustomerCount(count)) return copy.includes(CUSTOMER_COUNT_PLACEHOLDER) ? "" : copy;
  return template.split(CUSTOMER_COUNT_PLACEHOLDER).join(new Intl.NumberFormat(locale).format(count));
}
