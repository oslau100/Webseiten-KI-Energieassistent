import catalog from "./oecherPublicTranslations";

export const OECHER_MARKETING_PATHS = new Set(["/", "/jahresrechnung"]);
const translations: Record<string, Record<string, string>> = catalog;
const originalTexts = new WeakMap<Text, { source: string; rendered: string }>();
const excluded = "script,style,noscript,input,textarea,select,option,code,pre,[contenteditable],[data-no-translate='true'],[translate='no'],.notranslate";
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

export const localizeOecherPublicText = (source: string, lang: string) =>
  lang === "de" ? source : translations[normalize(source)]?.[lang] ?? source;

/** Exact public-copy allowlist. Never sends DOM content to a translation service. */
export function observeOecherPageTranslations(lang: string, pathname: string) {
  if (!OECHER_MARKETING_PATHS.has(pathname)) return;
  let cancelled = false;
  let scheduled = false;
  const translate = () => {
    scheduled = false;
    if (cancelled) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (!node.parentElement || node.parentElement.closest(excluded)) continue;
      const current = node.nodeValue ?? "";
      const previous = originalTexts.get(node);
      // React / runtime config may replace a previously translated text node.
      const source = previous && current === previous.rendered ? previous.source : current;
      const entry = translations[normalize(source)];
      if (!entry) { originalTexts.delete(node); continue; }
      const leading = source.match(/^\s*/)?.[0] ?? "";
      const trailing = source.match(/\s*$/)?.[0] ?? "";
      const translated = lang === "de" ? source : `${leading}${entry[lang] ?? normalize(source)}${trailing}`;
      originalTexts.set(node, { source, rendered: translated });
      // Equal writes are omitted, so our observer cannot create an endless loop.
      if (current !== translated) node.nodeValue = translated;
    }
  };
  const observer = new MutationObserver(() => {
    if (scheduled || cancelled) return;
    scheduled = true;
    queueMicrotask(translate);
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  translate();
  return () => { cancelled = true; observer.disconnect(); };
}
