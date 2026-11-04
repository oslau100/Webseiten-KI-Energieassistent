import { resolveWebsiteRuntime } from "@/lib/websiteRuntime";
import { readConsent, useOptionalConsent } from "@/lib/cookieConsent";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const EXCLUDED_PATHS = new Set(["/impressum", "/datenschutz", "/signing"]);
const cache = new Map<string, string>();

const normalize = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1")
    .trim();

const splitEdgeWhitespace = (value: string) => {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.slice(leading.length, value.length - trailing.length);
  return { leading, core, trailing };
};

const isOnlyPunctuation = (value: string) =>
  /^[\p{P}\p{S}\s]+$/u.test(value);

const OVERRIDES: Record<string, Record<string, string>> = {
  "Über 2.000 zufriedene Nutzer in ganz Deutschland": {
    en: "Over 2,000 satisfied users across Germany", tr: "Almanya genelinde 2.000'den fazla memnun kullanıcı", ru: "Более 2 000 довольных пользователей по всей Германии", ar: "أكثر من 2,000 مستخدم راضٍ في جميع أنحاء ألمانيا", it: "Oltre 2.000 utenti soddisfatti in tutta la Germania", zh: "德国各地已有 2,000+ 位满意用户", hi: "पूरे जर्मनी में 2,000+ संतुष्ट उपयोगकर्ता", es: "Más de 2.000 usuarios satisfechos en toda Alemania", fr: "Plus de 2 000 utilisateurs satisfaits dans toute l'Allemagne", nl: "Meer dan 2.000 tevreden gebruikers in heel Duitsland", pl: "Ponad 2 000 zadowolonych użytkowników w całych Niemczech"
  },
  "Zahlst du aktuell mehr für Strom oder Gas als nötig?": {
    en: "Are you currently paying more for electricity or gas than necessary?", tr: "Şu anda elektrik veya gaz için gerekenden fazla mı ödüyorsunuz?", ru: "Платите ли вы сейчас за электричество или газ больше, чем нужно?", ar: "هل تدفع حالياً مقابل الكهرباء أو الغاز أكثر مما ينبغي؟", it: "Stai pagando più del necessario per luce o gas?", zh: "你现在是否为电费或燃气费支付了不必要的高价？", hi: "क्या आप अभी बिजली या गैस के लिए जरूरत से ज्यादा भुगतान कर रहे हैं?", es: "¿Estás pagando ahora más de lo necesario por electricidad o gas?", fr: "Payez-vous actuellement plus que nécessaire pour l'électricité ou le gaz ?", nl: "Betaal je momenteel meer voor stroom of gas dan nodig is?", pl: "Czy obecnie płacisz za prąd lub gaz więcej, niż to konieczne?"
  },
  "Finde es in nur 60 Sekunden heraus. Dein digitaler Energieassistent analysiert automatisch hunderte Tarife, filtert Lockangebote und riskante Anbieter heraus und zeigt dir eine sichere Empfehlung mit echter Ersparnis.": {
    en: "Find out in just 60 seconds. Your digital Energy Assistant automatically analyzes hundreds of tariffs, filters out teaser offers and risky providers, and shows you a reliable recommendation with real savings.",
    tr: "Bunu yalnızca 60 saniyede öğrenin. Dijital Enerji Asistanınız yüzlerce tarifeyi otomatik analiz eder, cazip ama riskli teklifleri eler ve gerçek tasarruf sunan güvenli bir öneri gösterir.",
    ru: "Узнайте это всего за 60 секунд. Ваш цифровой Энергоассистент автоматически анализирует сотни тарифов, исключает заманчивые и рискованные предложения и показывает надёжную рекомендацию с реальной экономией.",
    ar: "اكتشف ذلك خلال 60 ثانية فقط. يقوم مساعد الطاقة الرقمي بتحليل مئات التعرفات تلقائياً، ويستبعد العروض المضللة والمزوّدين ذوي المخاطر، ثم يعرض لك توصية موثوقة مع توفير حقيقي.",
    it: "Scoprilo in soli 60 secondi. Il tuo Assistente Energia digitale analizza automaticamente centinaia di tariffe, esclude offerte civetta e fornitori rischiosi e ti mostra una raccomandazione sicura con risparmio reale.",
    zh: "只需 60 秒即可知道答案。你的数字化能源助手会自动分析数百种资费方案，过滤噱头优惠和高风险供应商，并给出真正省钱且可靠的建议。",
    hi: "इसे सिर्फ 60 सेकंड में जानें। आपका डिजिटल एनर्जी असिस्टेंट सैकड़ों टैरिफ का स्वतः विश्लेषण करता है, भ्रामक ऑफ़र और जोखिम वाले प्रदाताओं को हटाता है और वास्तविक बचत के साथ एक भरोसेमंद सिफारिश दिखाता है।",
    es: "Descúbrelo en solo 60 segundos. Tu Asistente Energético digital analiza automáticamente cientos de tarifas, filtra ofertas gancho y proveedores de riesgo, y te muestra una recomendación segura con ahorro real.",
    fr: "Découvrez-le en seulement 60 secondes. Votre Assistant Énergie numérique analyse automatiquement des centaines de tarifs, écarte les offres d'appel et les fournisseurs à risque, puis vous propose une recommandation fiable avec de vraies économies.",
    nl: "Ontdek het in slechts 60 seconden. Je digitale Energieassistent analyseert automatisch honderden tarieven, filtert lokaanbiedingen en risicovolle leveranciers en toont een veilige aanbeveling met echte besparing.",
    pl: "Sprawdź to w zaledwie 60 sekund. Twój cyfrowy Asystent Energii automatycznie analizuje setki taryf, odrzuca oferty-pułapki i ryzykownych dostawców oraz pokazuje bezpieczną rekomendację z realną oszczędnością."
  },
  "Jahresrechnung prüfen": {
    en: "Check annual utility bill", tr: "Yıllık faturayı kontrol et", ru: "Проверить годовой счёт", ar: "تحقق من الفاتورة السنوية", it: "Verifica bolletta annuale", zh: "检查年度账单", hi: "वार्षिक बिल जांचें", es: "Revisar factura anual", fr: "Vérifier la facture annuelle", nl: "Controleer jaarafrekening", pl: "Sprawdź rachunek roczny"
  },
  "Jahresabrechnung prüfen": {
    en: "Check energy bill", tr: "Enerji faturasını kontrol et", ru: "Проверить счёт за энергию", ar: "تحقق من فاتورة الطاقة", it: "Verifica la bolletta energetica", zh: "检查能源账单", hi: "ऊर्जा बिल जांचें", es: "Revisar factura de energía", fr: "Vérifier la facture d'énergie", nl: "Controleer energierekening", pl: "Sprawdź rachunek za energię"
  },
  "So einfach funktioniert's": {
    en: "How it works", tr: "Nasıl çalışır", ru: "Как это работает", ar: "كيف يعمل", it: "Come funziona", zh: "如何运作", hi: "यह कैसे काम करता है", es: "Cómo funciona", fr: "Comment ça marche", nl: "Zo werkt het", pl: "Jak to działa"
  },
  "Häufig gestellte Fragen": {
    en: "Frequently asked questions", tr: "Sık sorulan sorular", ru: "Часто задаваемые вопросы", ar: "الأسئلة الشائعة", it: "Domande frequenti", zh: "常见问题", hi: "अक्सर पूछे जाने वाले सवाल", es: "Preguntas frecuentes", fr: "Questions fréquentes", nl: "Veelgestelde vragen", pl: "Najczęściej zadawane pytania"
  },
};

const QUALITY_REPLACEMENTS: Record<string, Array<[RegExp, string]>> = {
  en: [
    [/annual financial statements/gi, "energy bills"],
    [/financial statements/gi, "energy bills"],
    [/annual statement/gi, "energy bill"],
    [/annual bill/gi, "annual energy bill"],
    [/basic supply/gi, "default utility tariff"],
    [/discount tricks/gi, "bonus-driven teaser offers"],
    [/energy assistant/gi, "Energy Assistant"],
    [/utility settlement/gi, "energy bill"],
    [/electric current/gi, "electricity"],
  ],
  tr: [[/temel tedarik/gi, "standart tarife"]],
  ru: [[/базов[а-я ]+снабжен[а-я ]+/gi, "тариф поставщика по умолчанию"]],
  it: [[/fornitura di base/gi, "tariffa standard"]],
  es: [[/suministro básico/gi, "tarifa estándar"]],
  fr: [[/fourniture de base/gi, "tarif standard"]],
  nl: [[/basisvoorziening/gi, "standaardtarief"]],
  pl: [[/podstawow[a-ząćęłńóśźż ]+/gi, "taryfa standardowa"]],
};

const polishText = (input: string, lang: string) => {
  let value = input
    .replace(/\s+\?/g, "?")
    .replace(/\?\./g, "?")
    .replace(/\.\?/g, "?")
    .replace(/\s+\./g, ".")
    .replace(/\s+,/g, ",")
    .replace(/\s+:/g, ":")
    .replace(/\s+;/g, ";")
    .replace(/\s{2,}/g, " ")
    .replace(/([!?.,:;])\1+/g, "$1")
    .trim();

  for (const [pattern, replacement] of QUALITY_REPLACEMENTS[lang] ?? []) {
    value = value.replace(pattern, replacement);
  }

  if (lang === "ar") {
    value = value.replace(/\?/g, "؟");
  }

  return value;
};

const translateText = async (text: string, targetLang: string, signal: AbortSignal) => {
  const cleanText = normalize(text);
  if (!cleanText || targetLang === "de") return cleanText || text;

  const override = OVERRIDES[cleanText]?.[targetLang];
  if (override) return override;

  const key = `${targetLang}:${cleanText}`;
  if (cache.has(key)) return cache.get(key)!;

  if (readConsent() !== "all" || signal.aborted) return cleanText;

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=de&tl=${encodeURIComponent(
    targetLang,
  )}&dt=t&q=${encodeURIComponent(cleanText)}`;

  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return cleanText;

    const data = (await res.json()) as unknown[];
    const segments = (data?.[0] as unknown[][] | undefined) ?? [];
    const translated = segments.map((segment) => (segment?.[0] as string) ?? "").join("") || cleanText;
    const polished = polishText(translated, targetLang);
    cache.set(key, polished);
    return polished;
  } catch {
    return cleanText;
  }
};

export const AutoPageTranslator = () => {
  const { lang } = useI18n();
  const location = useLocation();
  const consent = useOptionalConsent();
  const customer = resolveWebsiteRuntime().identity.customer;

  useEffect(() => {
    if (customer || !consent || EXCLUDED_PATHS.has(location.pathname.replace(/\/+$/, "").toLowerCase())) return;
    const controller = new AbortController();

    const root = document.querySelector("main") ?? document.body;
    if (!root) return;

    const textNodes: Text[] = [];
    const placeholders: Array<{ element: HTMLElement; original: string }> = [];

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const text = node.nodeValue?.trim() ?? "";
        if (!text) return NodeFilter.FILTER_REJECT;
        if (isOnlyPunctuation(text)) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-no-translate='true']")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

    root.querySelectorAll<HTMLElement>("input[placeholder], textarea[placeholder]").forEach((element) => {
      const original = element.dataset.originalPlaceholder ?? element.getAttribute("placeholder") ?? "";
      element.dataset.originalPlaceholder = original;
      placeholders.push({ element, original });
    });

    const run = async () => {
      if (lang === "de") {
        textNodes.forEach((node) => {
          const original = (node as Text & { __orig?: string }).__orig;
          if (original) node.nodeValue = original;
        });

        placeholders.forEach(({ element, original }) => {
          element.setAttribute("placeholder", original);
        });
        return;
      }

      await Promise.all(
        textNodes.map(async (node) => {
          const textNode = node as Text & { __orig?: string };
          if (!textNode.__orig) textNode.__orig = node.nodeValue ?? "";
          const { leading, core, trailing } = splitEdgeWhitespace(textNode.__orig);
          if (!core) return;

          const translated = await translateText(core, lang, controller.signal);
          if (!controller.signal.aborted) node.nodeValue = `${leading}${translated}${trailing}`;
        }),
      );

      await Promise.all(
        placeholders.map(async ({ element, original }) => {
          const translated = await translateText(original, lang, controller.signal);
          if (!controller.signal.aborted) element.setAttribute("placeholder", translated);
        }),
      );
    };

    void run();
    return () => controller.abort();
  }, [lang, location.pathname, consent, customer]);

  return null;
};
