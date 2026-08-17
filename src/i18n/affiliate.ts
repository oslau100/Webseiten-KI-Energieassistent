export const affiliateLanguages = ["de", "en", "es", "pl", "tr", "ar", "zh", "fr", "it", "ru", "hi", "nl"] as const;
export type AffiliateLanguage = typeof affiliateLanguages[number];
export const languageNames: Record<AffiliateLanguage, string> = { de: "Deutsch", en: "English", es: "Español", pl: "Polski", tr: "Türkçe", ar: "العربية", zh: "中文", fr: "Français", it: "Italiano", ru: "Русский", hi: "हिन्दी", nl: "Nederlands" };
export const affiliateDE = {
  title: "TarifButler empfehlen. Gemeinsam profitieren.",
  intro: "Teile deinen persönlichen Empfehlungslink. Wenn daraus ein bestätigter Abschluss entsteht, kann eine Belohnung gemäß den aktuellen Programmbedingungen verfügbar werden.",
  unavailable: "Der Portal-Service ist zurzeit noch nicht verfügbar. Bitte versuche es später erneut.",
};

export function getAffiliateLanguage(search: string): AffiliateLanguage {
  const requested = new URLSearchParams(search).get("lang") as AffiliateLanguage | null;
  return requested && affiliateLanguages.includes(requested) ? requested : "de";
}
