// Self-contained language icons: no request to an optional external image service.
const stripe = (color: string, y: number, height: number) => `<path fill="${color}" d="M0 ${y}h40v${height}H0z"/>`;
const vertical = (color: string, x: number) => `<path fill="${color}" d="M${x} 0h13.34v28H${x}z"/>`;
const star = '<path fill="currentColor" d="m0-5 1.2 3.4h3.6L2-0.4l1.1 3.5L0 1-3.1 2.1-2-1.4-4.8-3.4h3.6z"/>';
const flags: Record<string, string> = {
  de: stripe("#000", 0, 10) + stripe("#d00", 10, 9) + stripe("#ffce00", 19, 9),
  ru: stripe("#fff", 0, 10) + stripe("#0039a6", 10, 9) + stripe("#d52b1e", 19, 9),
  nl: stripe("#ae1c28", 0, 10) + stripe("#fff", 10, 9) + stripe("#21468b", 19, 9),
  pl: stripe("#fff", 0, 14) + stripe("#dc143c", 14, 14),
  fr: vertical("#002395", 0) + vertical("#fff", 13.33) + vertical("#ed2939", 26.66),
  it: vertical("#009246", 0) + vertical("#fff", 13.33) + vertical("#ce2b37", 26.66),
  es: stripe("#aa151b", 0, 7) + stripe("#f1bf00", 7, 14) + stripe("#aa151b", 21, 7),
  gb: stripe("#012169", 0, 28) + '<path stroke="#fff" stroke-width="6" d="m0 0 40 28M0 28 40 0"/><path stroke="#c8102e" stroke-width="2" d="m0 0 40 28M0 28 40 0"/><path stroke="#fff" stroke-width="9" d="M20 0v28M0 14h40"/><path stroke="#c8102e" stroke-width="5" d="M20 0v28M0 14h40"/>',
  tr: stripe("#e30a17", 0, 28) + '<circle fill="#fff" cx="17" cy="14" r="8"/><circle fill="#e30a17" cx="19" cy="14" r="6.5"/><g color="#fff" transform="translate(27 14)">' + star + '</g>',
  cn: stripe("#de2910", 0, 28) + '<g color="#ffde00" transform="translate(9 8)">' + star + '</g><g color="#ffde00" transform="translate(18 4) scale(.35)">' + star + '</g><g color="#ffde00" transform="translate(21 8) scale(.35)">' + star + '</g><g color="#ffde00" transform="translate(21 12) scale(.35)">' + star + '</g><g color="#ffde00" transform="translate(18 16) scale(.35)">' + star + '</g>',
  in: stripe("#ff9933", 0, 10) + stripe("#fff", 10, 9) + stripe("#138808", 19, 9) + '<circle fill="none" stroke="#000080" cx="20" cy="14" r="4"/>' + Array.from({ length: 24 }, (_, i) => `<path stroke="#000080" stroke-width=".3" d="M20 14v-4" transform="rotate(${i * 15} 20 14)"/>`).join(""),
  sa: stripe("#006c35", 0, 28) + '<text x="20" y="13" text-anchor="middle" fill="#fff" font-size="6">لا إله إلا الله</text><path stroke="#fff" stroke-width="1.5" d="M8 20h24"/>',
};

export const languageFlag = (country: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="40" height="28" viewBox="0 0 40 28">${flags[country]}</svg>`)}`;
