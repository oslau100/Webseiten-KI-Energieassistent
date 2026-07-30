const localeFor = (lang: string) => lang === "zh" ? "zh-CN" : lang;

export function formatBookingDateTime(value: string | Date, lang: string, timeZone: string) {
  const formatted = new Intl.DateTimeFormat(localeFor(lang), {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(typeof value === "string" ? new Date(value) : value);

  if (lang === "de") return `${formatted} Uhr`;
  if (lang === "nl") return `${formatted} uur`;
  return formatted;
}
