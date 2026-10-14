import type { JsonRecord } from "./websiteContentResolver";

const hex = (value: unknown): string | undefined => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : undefined;
const rgb = (value: string) => [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16) / 255);
export function hexToHsl(value: string): string {
  const [r, g, b] = rgb(value), max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const light = (max + min) / 2;
  const hue = !delta ? 0 : max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  const saturation = !delta ? 0 : delta / (1 - Math.abs(2 * light - 1));
  return `${+(hue * 60).toFixed(2)} ${+(saturation * 100).toFixed(2)}% ${+(light * 100).toFixed(2)}%`;
}
export function luminance(value: string): number {
  return rgb(value).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((total, c, i) => total + c * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(a: string, b: string): number {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
const foreground = (background: string) => contrast(background, "#000000") > contrast(background, "#FFFFFF") ? "#000000" : "#FFFFFF";
export function websiteThemeTokens(design: JsonRecord): Record<string, string> {
  const colors = (design.colors || {}) as JsonRecord;
  const primary = hex(colors.primary);
  if (!primary) return {};
  const background = hex(colors.background) || "#FFFFFF";
  const text = hex(colors.text) || foreground(background);
  const readableText = contrast(text, background) >= 4.5 ? text : foreground(background);
  const cta = hex(colors.cta) || primary;
  const accent = hex(colors.accent) || primary;
  const muted = hex(colors.mutedText) || readableText;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries({
    primary, "primary-foreground": foreground(primary), ring: primary,
    "primary-ink": contrast(primary, background) >= 4.5 ? primary : readableText,
    cta, "cta-foreground": foreground(cta),
    secondary: accent, "secondary-foreground": foreground(accent),
    accent, "accent-foreground": foreground(accent),
    background, foreground: readableText, card: background, "card-foreground": readableText,
    popover: background, "popover-foreground": readableText,
    "muted-foreground": contrast(muted, background) >= 4.5 ? muted : readableText,
  })) result[`--${key}`] = hexToHsl(value);
  result["--website-primary"] = primary;
  result["--website-bg"] = background;
  result["--website-text"] = readableText;
  return result;
}
