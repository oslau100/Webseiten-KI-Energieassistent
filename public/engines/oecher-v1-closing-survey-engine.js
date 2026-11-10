/* closing-survey-engine.js
   Supabase Bucket Asset:
   https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/engine-assets/closing-survey-engine.js

   CRITICAL ASSUMPTION (to keep existing data model stable):
   - Legal checkbox (AGB/Widerruf/Korrektheit) persists into auftraege.consent_accepted (existing boolean).

   NOTE (critical assumption):
   - New cancellation answers are persisted into auftraege.closing_payload (jsonb) to keep existing schema stable.
*/

(async function () {
  const state = {
    currentStep: null,
    history: [],
    answers: {},
    language: "de",
    isSubmitting: false,
    sessionId: null,

    uuid: "",
    locationId: "",
    urlLang: "",
    orderRow: null,
    orderLoaded: false,

    providerLinks: {
      agb_url: "#",
      widerruf_url: "#",
      datenschutz_url: "#",
    },

    mediatorLinks: {
      datenschutz_url: "#",
      agb_url: "#",
      widerruf_url: "#",
    },

    patchTimer: null,
    lastOrderPatch: {},

    flatpickrReady: false,

    // signature runtime state
    sig: {
      hasUnsavedStroke: false,
      lastAutosaveDataUrl: "",
      cleanup: null,
    },
  };

  // -------------------------
  // Utilities
  // -------------------------
  const getLanguageConfig = () => window.KUNDEN_DATA?.setting_language_config || {};
  const availableLanguages = (() => {
    const arr = getLanguageConfig().available_languages || getLanguageConfig().active_languages;
    if (Array.isArray(arr) && arr.length) return arr.map((x) => String(x).toLowerCase());
    return ["de", "en", "tr", "ru", "ar", "it", "zh", "hi", "es", "fr", "nl", "pl"];
  })();
  const serviceCfg = () => window.KUNDEN_DATA?.service_config || {};
  const urlCfg = () => window.KUNDEN_DATA?.url_config || {};
  const phoneCfg = () => window.KUNDEN_DATA?.phone_config || {};
  const resolveClosingTheme = () => {
    const kundenData = window.KUNDEN_DATA || {};
    const designCfg = kundenData.design_config || {};
    const designSurvey = designCfg.survey || {};
    const closingDesign = kundenData.closing_survey_design || {};
    const settingsSurvey = kundenData.setting_survey_design || {};

    const pick = (...vals) => {
      for (const v of vals) {
        const s = safeString(v);
        if (s) return s;
      }
      return "";
    };

    const primaryColor =
      pick(
        designCfg.brand?.primary_color,
        designSurvey.primary_color,
        designSurvey.choice_card?.selected_border_color,
        closingDesign.primary_color,
        closingDesign.start_button?.bg_color,
        settingsSurvey.primary_color
      ) || "#42f77a";

    const textColor = pick(closingDesign.text_color, designCfg.brand?.text_color) || "#334155";
    const primaryButtonBg =
      pick(
        designSurvey.start_button?.bg_color,
        designSurvey.submit_button?.bg_color,
        closingDesign.start_button?.bg_color,
        closingDesign.submit_button?.bg_color,
        primaryColor
      ) || primaryColor;
    const primaryButtonText =
      pick(
        designSurvey.start_button?.text_color,
        designSurvey.submit_button?.text_color,
        closingDesign.start_button?.text_color,
        closingDesign.submit_button?.text_color
      ) || "#ffffff";

    return { primaryColor, textColor, primaryButtonBg, primaryButtonText };
  };

  const normalizeLang = (l) => {
    const s = String(l || "").trim().toLowerCase();
    return availableLanguages.includes(s) ? s : "";
  };

  const escapeHtml = (str) =>
    String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const safeString = (v) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());
  const isValidUuid = (v) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(safeString(v));

  const supa = () => supabase.createClient(window.SURVEY_CONFIG.supabaseUrl, window.SURVEY_CONFIG.supabaseKey);

  const cryptoRandomId = () => {
    try {
      return crypto.getRandomValues(new Uint32Array(4)).join("-");
    } catch {
      return String(Math.random()).slice(2) + "-" + Date.now();
    }
  };

  const newSubmissionId = () => "sub_" + cryptoRandomId();

  const resolveSupabaseClientKey = () => {
    const surveyCfg = window.SURVEY_CONFIG || {};
    const kundenData = window.KUNDEN_DATA || {};

    const candidates = [
      surveyCfg.supabaseKey,
      surveyCfg.supabaseAnonKey,
      surveyCfg.anonKey,
      surveyCfg.supabase_anon_key,
      kundenData.supabaseKey,
      kundenData.supabase_anon_key,
      kundenData.supabaseAnonKey,
      kundenData.anonKey,
      kundenData.supabase?.anonKey,
      kundenData.supabase?.supabaseAnonKey,
      surveyCfg.supabase?.anonKey,
      surveyCfg.supabase?.supabaseAnonKey,
    ];

    for (const candidate of candidates) {
      const key = safeString(candidate);
      if (key) return key;
    }
    return "";
  };
  function navigateTop(url) {
    if (!url) return;
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = url;
        return;
      }
    } catch (_) {}
    window.location.href = url;
  }
  const toBool = (v) => {
    if (v === true) return true;
    if (v === false || v == null) return false;
    if (typeof v === "number") return v === 1;
    const normalized = safeString(v).toLowerCase();
    if (!normalized) return false;
    if (["1", "true", "yes", "ja", "y", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "nein", "n", "off"].includes(normalized)) return false;
    return false;
  };
  const getSelectedPreisliste = () => state.orderRow?.tarif_snapshot?.selected_preisliste || {};
  const isIbanRequired = () => {
    const r = state.orderRow || {};
    const p = getSelectedPreisliste();
    if (p?.iban_pflicht !== undefined) return toBool(p.iban_pflicht);
    if (p?.iban_required !== undefined) return toBool(p.iban_required);
    if (r?.iban_pflicht !== undefined) return toBool(r.iban_pflicht);
    if (r?.iban_required !== undefined) return toBool(r.iban_required);
    return false;
  };
  const isMaloRequired = () => {
    const r = state.orderRow || {};
    const p = getSelectedPreisliste();
    if (p?.malo_pflicht !== undefined) return toBool(p.malo_pflicht);
    if (p?.malo_required !== undefined) return toBool(p.malo_required);
    if (r?.malo_pflicht !== undefined) return toBool(r.malo_pflicht);
    if (r?.malo_required !== undefined) return toBool(r.malo_required);
    return false;
  };
  const logValidationWarning = (code, details = {}) => {
    console.warn(`[closing-survey][validation] ${code}`, details);
  };
  const syncStepViewport = () => {
    const app = document.getElementById("survey-app");
    if (app) {
      app.style.height = "auto";
      app.style.minHeight = "0px";
    }
    const scrollTop = () => {
      const targets = [window, document.scrollingElement, document.documentElement, document.body];
      targets.forEach((target) => {
        try {
          if (target && typeof target.scrollTo === "function") {
            target.scrollTo({ top: 0, behavior: "auto" });
          } else if (target) {
            target.scrollTop = 0;
          }
        } catch {}
      });
      try {
        const frame = window.frameElement;
        const parentWindow = window.parent;
        if (frame && parentWindow && parentWindow !== window) {
          const frameTop = frame.getBoundingClientRect().top + parentWindow.scrollY;
          parentWindow.scrollTo({ top: frameTop, behavior: "auto" });
        }
      } catch {}
    };
    scrollTop();
    requestAnimationFrame(scrollTop);
  };

  const t = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[state.language] || obj.de || Object.values(obj)[0] || "";
  };

  const getOrderEnergy = () =>
    safeString(state.orderRow?.energy_type || "strom").toLowerCase() === "gas" ? "gas" : "strom";

  const getOrderProviderName = () => state.ewvLegal?.legal_name || safeString(state.orderRow?.anbieter || state.orderRow?.tariff_provider || "");
  const getOrderTariffName = () => safeString(state.orderRow?.tarif || state.orderRow?.tariff_name || "");

  const getMediatorName = () => safeString(window.KUNDEN_DATA?.firma || "Mediator");

  const readUrlParams = () => {
    const url = new URL(window.location.href);
    const urlUuid = safeString(url.searchParams.get("uuid"));
    const cfgUuid = safeString(window.SURVEY_CONFIG?.uuidOverride);
    state.uuid = urlUuid || cfgUuid;
    state.locationId = safeString(window.SURVEY_CONFIG?.locationId);

    const urlLang = normalizeLang(url.searchParams.get("lang"));
    const cfgLang = normalizeLang(window.SURVEY_CONFIG?.langOverride);
    state.urlLang = urlLang || cfgLang;

    console.log("[closing-survey] uuid source", urlUuid ? "url" : cfgUuid ? "config" : "missing");
    console.log("[closing-survey] lang source", urlLang ? "url" : cfgLang ? "config" : "fallback");
  };

  const resolveLanguage = () => {
    if (state.urlLang) return state.urlLang;
    const fromOrder = normalizeLang(state.orderRow?.language);
    if (fromOrder) return fromOrder;
    return String(getLanguageConfig().default_language || "de");
  };

  const queueOrderPatch = (patch) => {
    if (!state.uuid || !state.locationId) return;
    if (!patch || typeof patch !== "object") return;

    state.lastOrderPatch = { ...state.lastOrderPatch, ...patch };

    if (state.patchTimer) clearTimeout(state.patchTimer);
    state.patchTimer = setTimeout(async () => {
      const toSend = { ...state.lastOrderPatch };
      state.lastOrderPatch = {};
      state.patchTimer = null;

      try {
        const client = supa();
        const { error } = await client
          .from("auftraege")
          .update(toSend)
          .eq("uuid", state.uuid)
          .eq("location_id", state.locationId);
        if (error) throw error;
        state.orderRow = { ...(state.orderRow || {}), ...toSend };
      } catch (e) {
        console.warn("Order patch failed:", e?.message || e);
      }
    }, 350);
  };

  const canBindColumn = (col) => {
    if (!col) return false;
    const r = state.orderRow || {};
    return Object.prototype.hasOwnProperty.call(r, col);
  };

  const persistBoundValue = (col, value) => {
    if (!col) return;
    if (!canBindColumn(col)) return;
    queueOrderPatch({ [col]: value });
  };

  const persistClosingPayloadField = (key, value) => {
    if (!key) return;
    if (!canBindColumn("closing_payload")) return;
    const base =
      state.orderRow && state.orderRow.closing_payload && typeof state.orderRow.closing_payload === "object"
        ? state.orderRow.closing_payload
        : {};
    const next = { ...base, [key]: value };
    persistBoundValue("closing_payload", next);
  };

  // -------------------------
  // URL sanitation (fix broken provider/mediator links)
  // -------------------------
  const normalizeUrl = (raw) => {
    let s = safeString(raw);
    if (!s) return "#";
    s = s.trim();
    if (!s || s === "#") return "#";

    // already absolute
    if (/^(https?:\/\/)/i.test(s)) return s;

    // protocol-relative
    if (s.startsWith("//")) return "https:" + s;

    // common: "https.vattenfall.de/..." (missing ://)
    if (/^https\./i.test(s)) return "https://" + s.replace(/^https\./i, "");
    if (/^http\./i.test(s)) return "http://" + s.replace(/^http\./i, "");

    // "www.example.com/..."
    if (/^www\./i.test(s)) return "https://" + s;

    // domain.tld/... without scheme
    if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(s)) return "https://" + s;

    return "#";
  };

  // -------------------------
  // Date handling (Flatpickr)
  // -------------------------
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

  const loadCss = (href) =>
    new Promise((resolve) => {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = href;
      l.onload = resolve;
      document.head.appendChild(l);
    });

  const langToFlatpickrLocale = (lang) => {
    const map = { de: "de", tr: "tr", ru: "ru", ar: "ar", it: "it", zh: "zh", hi: "hi", es: "es", fr: "fr", nl: "nl", pl: "pl", en: null };
    return map[lang] ?? null;
  };

  const ensureFlatpickr = async () => {
    if (state.flatpickrReady) return;
    const flatpickrBase = String(
      serviceCfg().flatpickr_base ||
        "https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist"
    ).replace(/\/+$/, "");
    await loadCss(`${flatpickrBase}/flatpickr.min.css`);
    await loadScript(`${flatpickrBase}/flatpickr.min.js`);
    const loc = langToFlatpickrLocale(state.language);
    if (loc) await loadScript(`${flatpickrBase}/l10n/${loc}.js`);
    state.flatpickrReady = true;
  };

  const toDDMMYYYY = (v) => {
    const s = safeString(v);
    if (!s) return "";
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
    const de = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (de) return s;
    const digits = s.replace(/[^\d]/g, "");
    if (digits.length === 8) {
      const dd = digits.slice(0, 2);
      const mm = digits.slice(2, 4);
      const yyyy = digits.slice(4, 8);
      return `${dd}.${mm}.${yyyy}`;
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = String(d.getFullYear());
      return `${dd}.${mm}.${yyyy}`;
    }
    return s;
  };

  const isValidDDMMYYYY = (s) => {
    const m = safeString(s).match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!m) return false;
    const dd = Number(m[1]);
    const mm = Number(m[2]);
    const yyyy = Number(m[3]);
    if (yyyy < 1900 || yyyy > 2100) return false;
    if (mm < 1 || mm > 12) return false;
    if (dd < 1 || dd > 31) return false;
    const max = new Date(yyyy, mm, 0).getDate();
    return dd <= max;
  };

  const enforceDDMMYYYYTyping = (input) => {
    input.addEventListener("input", () => {
      let v = input.value.replace(/[^\d]/g, "");
      if (v.length > 8) v = v.slice(0, 8);
      const dd = v.slice(0, 2);
      const mm = v.slice(2, 4);
      const yyyy = v.slice(4, 8);
      let out = dd;
      if (mm) out += "." + mm;
      if (yyyy) out += "." + yyyy;
      input.value = out;
    });
  };

  // -------------------------
  // IBAN
  // -------------------------
  const normalizeIban = (raw) => String(raw || "").replace(/\s+/g, "").toUpperCase();

  const isValidIban = (ibanRaw) => {
    const iban = normalizeIban(ibanRaw);
    if (!iban) return false;
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    let expanded = "";
    for (const ch of rearranged) expanded += ch >= "A" && ch <= "Z" ? String(ch.charCodeAt(0) - 55) : ch;
    let remainder = 0;
    for (let i = 0; i < expanded.length; i += 7) {
      const block = String(remainder) + expanded.slice(i, i + 7);
      remainder = Number(block) % 97;
    }
    return remainder === 1;
  };

  // -------------------------
  // Phone (DE-only UI)
  // -------------------------
  const DE_FLAG = String(phoneCfg().flag_url || "https://flagcdn.com/w40/de.png");
  const DE_PREFIX = String(phoneCfg().dial_prefix || "+49");

  const normalizeToNationalDE = (raw) => {
    let s = safeString(raw);
    if (!s) return "";
    s = s.replace(/\s+/g, "");
    if (s.startsWith(DE_PREFIX)) s = s.slice(DE_PREFIX.length);
    if (s.startsWith("0049")) s = s.slice(4);
    s = s.replace(/^\+/, "");
    s = s.replace(/[^\d]/g, "");
    return s;
  };

  const normalizeToE164DE = (nationalRaw) => {
    const digits = normalizeToNationalDE(nationalRaw);
    if (!digits) return "";
    const d = digits.startsWith("0") ? digits.slice(1) : digits;
    return DE_PREFIX + d;
  };

  // -------------------------
  // Templates + vars
  // -------------------------
  const getTemplates = () => {
    const tpl = window.CLOSING_TEXT_TEMPLATES;
    return tpl && typeof tpl === "object" ? tpl : null;
  };

  const computeSummaryNormalized = () => {
    const r = state.orderRow || {};

    const normalizeMonthNumber = (raw) => {
      const s = safeString(raw);
      if (!s) return "";
      const n = s.replace(/[^\d]/g, "");
      if (!n) return "";
      const num = Number(n);
      if (!Number.isFinite(num) || num <= 0 || num > 120) return "";
      return String(num);
    };

    const normalizeMaybeDate = (raw) => {
      const s = safeString(raw);
      if (!s) return "";
      const ddmmyyyy = toDDMMYYYY(s);
      if (isValidDDMMYYYY(ddmmyyyy)) return ddmmyyyy;
      return "";
    };

    const laufzeitRaw = r.laufzeit_monate ?? r.vertragslaufzeit ?? r.vertragslaufzeit_monate ?? "";
    const laufzeitMonths = normalizeMonthNumber(laufzeitRaw);

    const monthsWord = t({
      de: "Monate",
      en: "months",
      tr: "ay",
      ru: "мес.",
      ar: "شهر",
      it: "mesi",
      zh: "个月",
      hi: "महीने",
      es: "meses",
      fr: "mois",
      nl: "maanden",
      pl: "mies.",
    });

    const vertragslaufzeit_display = laufzeitMonths ? `${laufzeitMonths} ${monthsWord}` : "";

    const pgRaw = r.preisgarantie_text ?? r.preisgarantie ?? "";
    const pgTrim = safeString(pgRaw);

    const pgMonths = normalizeMonthNumber(pgTrim);
    const pgDate = pgMonths ? "" : normalizeMaybeDate(pgTrim);

    const untilWord = t({
      de: "bis",
      en: "until",
      tr: "… tarihine kadar",
      ru: "до",
      ar: "حتى",
      it: "fino al",
      zh: "截至",
      hi: "तक",
      es: "hasta",
      fr: "jusqu’au",
      nl: "tot",
      pl: "do",
    });

    const preisgarantie_display = pgMonths ? `${pgMonths} ${monthsWord}` : pgDate ? `${untilWord} ${pgDate}` : "";

    return { vertragslaufzeit_display, preisgarantie_display };
  };

  const buildTemplateVars = () => {
    const r = state.orderRow || {};
    const provider = getOrderProviderName();
    const tariff = getOrderTariffName();
    const summary = computeSummaryNormalized();

    return {
      anbieter: provider,
      vermittler: getMediatorName(),

      agb_url: state.providerLinks.agb_url || "#",
      widerruf_url: state.providerLinks.widerruf_url || "#",
      datenschutz_url: state.providerLinks.datenschutz_url || "#",

      vermittler_datenschutz_url: state.mediatorLinks.datenschutz_url || "#",

      tarif: tariff,
      arbeitspreis: safeString(r.arbeitspreis), // ct/kWh
      grundpreis: safeString(r.grundpreis), // €/Monat
      vertragslaufzeit: summary.vertragslaufzeit_display,
      preisgarantie: summary.preisgarantie_display,

      abschlaege_pro_jahr: safeString(r.abschlaege_pro_jahr),
      jahreskosten: safeString(r.jahreskosten),
      monatsabschlag: safeString(r.monatsabschlag),
      ersparnis: safeString(r.ersparnis),
    };
  };

  const renderTemplate = (txt, vars) => {
    let s = String(txt || "");
    for (const [k, v] of Object.entries(vars || {})) {
      s = s.replaceAll(`{{${k}}}`, String(v ?? ""));
    }
    return s;
  };

  // -------------------------
  // UI / i18n
  // -------------------------
  const UI = {
    next: { de: "Weiter", en: "Next", tr: "Devam", ru: "Далее", ar: "التالي", it: "Avanti", zh: "下一步", hi: "आगे", es: "Siguiente", fr: "Suivant", nl: "Volgende", pl: "Dalej" },
    back: { de: "Zurück", en: "Back", tr: "Geri", ru: "Назад", ar: "رجوع", it: "Indietro", zh: "返回", hi: "वापस", es: "Atrás", fr: "Retour", nl: "Terug", pl: "Wstecz" },
    required: {
      de: "Bitte fülle dieses Feld aus, damit wir weitermachen können.",
      en: "Please fill out this field so we can continue.",
      tr: "Devam edebilmemiz için lütfen bu alanı doldurun.",
      ru: "Пожалуйста, заполните это поле, чтобы продолжить.",
      ar: "يرجى تعبئة هذا الحقل للمتابعة.",
      it: "Compila questo campo per continuare.",
      zh: "请填写此字段以继续。",
      hi: "आगे बढ़ने के लिए कृपया यह फ़ील्ड भरें।",
      es: "Completa este campo para continuar.",
      fr: "Veuillez remplir ce champ pour continuer.",
      nl: "Vul dit veld in om door te gaan.",
      pl: "Wypełnij to pole, aby kontynuować.",
    },
    invalid: {
      de: "Bitte prüfe deine Eingabe.",
      en: "Please check your input.",
      tr: "Lütfen girdini kontrol et.",
      ru: "Проверьте введённые данные.",
      ar: "يرجى التحقق من الإدخال.",
      it: "Controlla l’inserimento.",
      zh: "请检查你的输入。",
      hi: "कृपया अपनी प्रविष्टि जाँचें।",
      es: "Revisa tu entrada.",
      fr: "Veuillez vérifier votre saisie.",
      nl: "Controleer je invoer.",
      pl: "Sprawdź wpisaną wartość.",
    },
    missingUuid: {
      de: "Dieser Link ist unvollständig. Bitte öffne die Seite über den Button in deinem Angebot.",
      en: "This link is incomplete. Please open the page using the button in your offer.",
      tr: "Bu bağlantı eksik. Lütfen teklifinizdeki düğmeyle açın.",
      ru: "Ссылка неполная. Откройте страницу через кнопку в вашем предложении.",
      ar: "الرابط غير مكتمل. افتح الصفحة عبر زر العرض.",
      it: "Link incompleto. Apri la pagina dal pulsante nell’offerta.",
      zh: "链接不完整。请通过报价页按钮打开。",
      hi: "लिंक अधूरा है। कृपया ऑफ़र के बटन से खोलें।",
      es: "El enlace está incompleto. Abre la página desde el botón de tu oferta.",
      fr: "Lien incomplet. Ouvrez la page via le bouton de votre offre.",
      nl: "Link is onvolledig. Open de pagina via de knop in je aanbod.",
      pl: "Link jest niekompletny. Otwórz stronę przyciskiem w ofercie.",
    },
    loadError: {
      de: "Fehler beim Laden. Bitte versuche es erneut.",
      en: "Loading failed. Please try again.",
      tr: "Yükleme başarısız. Lütfen tekrar deneyin.",
      ru: "Ошибка загрузки. Повторите попытку.",
      ar: "فشل التحميل. حاول مرة أخرى.",
      it: "Caricamento non riuscito. Riprova.",
      zh: "加载失败，请重试。",
      hi: "लोड नहीं हुआ। कृपया फिर से प्रयास करें।",
      es: "Error al cargar. Inténtalo de nuevo.",
      fr: "Échec du chargement. Veuillez réessayer.",
      nl: "Laden mislukt. Probeer opnieuw.",
      pl: "Nie udało się załadować. Spróbuj ponownie.",
    },
    submit: {
      de: "Vertrag verbindlich abschließen",
      en: "Confirm contract",
      tr: "Sözleşmeyi onayla",
      ru: "Подтвердить договор",
      ar: "تأكيد العقد",
      it: "Conferma il contratto",
      zh: "确认合同",
      hi: "अनुबंध पुष्टि करें",
      es: "Confirmar contrato",
      fr: "Confirmer le contrat",
      nl: "Contract bevestigen",
      pl: "Potwierdź umowę",
    },
    infoLink: {
      de: "Wo finde ich diese Nummer?",
      en: "Where can I find this number?",
      tr: "Bu numarayı nerede bulabilirim?",
      ru: "Где найти этот номер?",
      ar: "أين أجد هذا الرقم؟",
      it: "Dove trovo questo numero?",
      zh: "在哪里可以找到这个号码？",
      hi: "यह नंबर कहाँ मिलेगा?",
      es: "¿Dónde encuentro este número?",
      fr: "Où trouver ce numéro ?",
      nl: "Waar vind ik dit nummer?",
      pl: "Gdzie znajdę ten numer?",
    },

    purposeHint: {
      de: "Bitte bestätige kurz deine Auswahl von vorhin, damit dein Vertrag korrekt und passend erstellt werden kann.",
      en: "Please briefly confirm your previous selection so your contract can be created correctly.",
      tr: "Lütfen önceki seçimini kısaca doğrula, böylece sözleşmen doğru şekilde oluşturulabilir.",
      ru: "Пожалуйста, кратко подтвердите свой предыдущий выбор, чтобы договор был создан корректно.",
      ar: "يرجى تأكيد اختيارك السابق بإيجاز حتى يتم إنشاء عقدك بشكل صحيح.",
      it: "Conferma brevemente la tua scelta precedente affinché il contratto venga creato correttamente.",
      zh: "请简要确认你之前的选择，以便正确生成你的合同。",
      hi: "कृपया अपने पिछले चयन की संक्षेप में पुष्टि करें, ताकि आपका अनुबंध सही तरीके से बनाया जा सके।",
      es: "Confirma brevemente tu selección anterior para que tu contrato pueda crearse correctamente.",
      fr: "Veuillez confirmer brièvement votre choix précédent afin que votre contrat soit créé correctement.",
      nl: "Bevestig kort je eerdere keuze, zodat je contract correct kan worden opgesteld.",
      pl: "Potwierdź krótko swój wcześniejszy wybór, aby Twoja umowa mogła zostać przygotowana poprawnie.",
    },

    signatureHintDefault: {
      de:
        "Mit deiner Unterschrift bestätigst du verbindlich den Abschluss des oben dargestellten Energievertrags mit {{anbieter}}.\n" +
        "Deine Signatur wird elektronisch erfasst und ausschließlich zum Zweck der Vertragserstellung verwendet. Sie wird in das offizielle Vertragsformular des Anbieters eingefügt und im Rahmen der Vertragsabwicklung an {{anbieter}} übermittelt.\n" +
        "Eine weitergehende Nutzung erfolgt nicht.\n" +
        "Bitte unterschreibe gut lesbar im vorgesehenen Feld.",
      en:
        "By signing, you confirm the binding conclusion of the energy contract shown above with {{anbieter}}.\n" +
        "Your signature is captured electronically and used exclusively to generate the contract. It is inserted into the provider’s official contract form and transmitted to {{anbieter}} for processing.\n" +
        "No further use is made.\n" +
        "Please sign clearly in the field provided.",
      tr:
        "İmzalayarak yukarıda gösterilen enerji sözleşmesini {{anbieter}} ile bağlayıcı olarak onaylarsınız.\n" +
        "İmzanız elektronik olarak alınır ve yalnızca sözleşme oluşturmak için kullanılır. Sağlayıcının resmi formuna eklenir ve işlem için {{anbieter}}’e iletilir.\n" +
        "Başka bir amaçla kullanılmaz.\n" +
        "Lütfen ayrılan alana okunaklı şekilde imzalayın.",
      ru:
        "Подпись подтверждает заключение указанного выше договора энергоснабжения с {{anbieter}}.\n" +
        "Подпись фиксируется в электронном виде и используется только для создания договора. Она вставляется в официальный бланк и передается в {{anbieter}} для оформления.\n" +
        "Иное использование исключено.\n" +
        "Пожалуйста, распишитесь разборчиво в указанном поле.",
      ar:
        "بالتوقيع تؤكد بشكل ملزم إبرام عقد الطاقة الموضح أعلاه مع {{anbieter}}.\n" +
        "يتم التقاط توقيعك إلكترونيًا ويُستخدم حصريًا لإنشاء العقد. يُدرج في النموذج الرسمي ويُرسل إلى {{anbieter}} لإتمام المعالجة.\n" +
        "لا يتم استخدامه لأي غرض آخر.\n" +
        "يرجى التوقيع بوضوح داخل الحقل المخصص.",
      it:
        "Con la firma confermi in modo vincolante la conclusione del contratto di energia mostrato sopra con {{anbieter}}.\n" +
        "La firma viene acquisita elettronicamente ed è utilizzata esclusivamente per generare il contratto. Viene inserita nel modulo ufficiale e trasmessa a {{anbieter}} per l’elaborazione.\n" +
        "Nessun ulteriore utilizzo.\n" +
        "Firma in modo leggibile nel campo previsto.",
      zh:
        "签名即表示你确认并具有约束力地与 {{anbieter}} 完成上述能源合同。\n" +
        "你的签名将以电子方式采集，仅用于生成合同。签名会被插入供应商官方表格并在办理过程中提交给 {{anbieter}}。\n" +
        "不会用于其他用途。\n" +
        "请在指定区域清晰签名。",
      hi:
        "हस्ताक्षर करके आप ऊपर दिखाए गए ऊर्जा अनुबंध को {{anbieter}} के साथ बाध्यकारी रूप से पुष्टि करते हैं।\n" +
        "आपका हस्ताक्षर इलेक्ट्रॉनिक रूप से लिया जाता है और केवल अनुबंध बनाने के लिए उपयोग होता है। इसे आधिकारिक फॉर्म में जोड़ा जाता है और प्रक्रिया हेतु {{anbieter}} को भेजा जाता है।\n" +
        "इसके अलावा कोई उपयोग नहीं किया जाता।\n" +
        "कृपया दिए गए क्षेत्र में साफ़ हस्ताक्षर करें।",
      es:
        "Al firmar, confirmas de forma vinculante la contratación del contrato de energía mostrado arriba con {{anbieter}}.\n" +
        "Tu firma se captura electrónicamente y se utiliza exclusivamente para generar el contrato. Se inserta en el formulario oficial y se envía a {{anbieter}} para su tramitación.\n" +
        "No se realiza ningún uso adicional.\n" +
        "Firma de forma clara en el campo previsto.",
      fr:
        "En signant, vous confirmez de manière contraignante la conclusion du contrat d’énergie affiché ci-dessus avec {{anbieter}}.\n" +
        "Votre signature est capturée électroniquement et utilisée exclusivement pour générer le contrat. Elle est intégrée au formulaire officiel et transmise à {{anbieter}} dans le cadre du traitement.\n" +
        "Aucune autre utilisation.\n" +
        "Veuillez signer clairement dans le champ prévu.",
      nl:
        "Door te tekenen bevestig je bindend het afsluiten van het hierboven getoonde energiecontract met {{anbieter}}.\n" +
        "Je handtekening wordt elektronisch vastgelegd en uitsluitend gebruikt voor het opstellen van het contract. Ze wordt in het officiële formulier geplaatst en voor afhandeling aan {{anbieter}} verzonden.\n" +
        "Geen verder gebruik.\n" +
        "Teken duidelijk in het daarvoor bestemde veld.",
      pl:
        "Składając podpis, wiążąco potwierdzasz zawarcie przedstawionej powyżej umowy energetycznej z {{anbieter}}.\n" +
        "Podpis jest rejestrowany elektronicznie i wykorzystywany wyłącznie do przygotowania umowy. Zostanie wstawiony do oficjalnego formularza i przekazany do {{anbieter}} w ramach realizacji.\n" +
        "Brak dalszego wykorzystania.\n" +
        "Podpisz się czytelnie w przeznaczonym polu.",
    },

    successTitle: {
      de: "Danke! Wir übermitteln jetzt deinen Auftrag …",
      en: "Thanks! We’re submitting your request …",
      tr: "Teşekkürler! Talebini iletiyoruz …",
      ru: "Спасибо! Отправляем заявку …",
      ar: "شكرًا! جارٍ إرسال طلبك …",
      it: "Grazie! Stiamo inviando la richiesta …",
      zh: "谢谢！正在提交你的请求…",
      hi: "धन्यवाद! हम आपका अनुरोध भेज रहे हैं…",
      es: "¡Gracias! Estamos enviando tu solicitud…",
      fr: "Merci ! Nous envoyons votre demande…",
      nl: "Dank je! We versturen je aanvraag…",
      pl: "Dziękujemy! Wysyłamy Twoje zgłoszenie…",
    },

    editDetailsTitle: {
      de: "Deine Angaben",
      en: "Your details",
      tr: "Bilgilerin",
      ru: "Ваши данные",
      ar: "بياناتك",
      it: "I tuoi dati",
      zh: "你的信息",
      hi: "आपकी जानकारी",
      es: "Tus datos",
      fr: "Vos informations",
      nl: "Jouw gegevens",
      pl: "Twoje dane",
    },
    edit: {
      de: "Ändern",
      en: "Edit",
      tr: "Düzenle",
      ru: "Изменить",
      ar: "تعديل",
      it: "Modifica",
      zh: "修改",
      hi: "बदलें",
      es: "Editar",
      fr: "Modifier",
      nl: "Wijzigen",
      pl: "Edytuj",
    },
    consentLegalLabel: {
      de: "Ich bestätige die korrekten Angaben und akzeptiere AGB & Widerruf.",
      en: "I confirm my details and accept T&Cs & withdrawal information.",
      tr: "Bilgilerimi onaylıyorum ve şartlar/iptal bilgisini kabul ediyorum.",
      ru: "Подтверждаю данные и принимаю условия и информацию об отказе.",
      ar: "أؤكد البيانات وأوافق على الشروط ومعلومات الإلغاء.",
      it: "Confermo i dati e accetto termini e recesso.",
      zh: "我确认信息并接受条款与撤回说明。",
      hi: "मैं जानकारी की पुष्टि करता/करती हूँ और शर्तें/वापसी जानकारी स्वीकार करता/करती हूँ।",
      es: "Confirmo mis datos y acepto condiciones y desistimiento.",
      fr: "Je confirme mes informations et j’accepte les conditions et la rétractation.",
      nl: "Ik bevestig mijn gegevens en accepteer voorwaarden en herroeping.",
      pl: "Potwierdzam dane i akceptuję warunki oraz informacje o odstąpieniu.",
    },
  };

  const ui = (key) => (UI[key] ? UI[key][state.language] || UI[key].de || key : key);

  // -------------------------
  // Styling additions
  // -------------------------
  const injectEngineStyles = () => {
    if (document.getElementById("closing-engine-extra-styles")) return;
    const style = document.createElement("style");
    style.id = "closing-engine-extra-styles";
    style.textContent = `
      .survey-card-container{ align-items: stretch !important; padding-top: 56px !important; }
      .btn-back{ top: 18px !important; left: 18px !important; }
      .survey-question{ margin-top: 18px !important; margin-bottom: 18px !important; }

      .survey-card-container, .survey-card-container *{
        font-family: Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji" !important;
      }

      /* ✅ all buttons except back -> black text */
      .btn-start-action{ color:var(--btn-text, #ffffff) !important; }
      .tb-ov-close{ color:var(--text-color, #334155) !important; }
      .sig-clear-link{ color:var(--text-color, #334155) !important; }
      .consent-row a{ color:var(--text-color, #334155) !important; }
      :root{
        --closing-primary: #42f77a;
        --closing-primary-soft: rgba(66, 247, 122, 0.12);
        --closing-primary-text: #334155;
      }

      .phone-wrap{
        display:flex; align-items:stretch; width:100%;
        border-radius: 1.25rem;
        border: 2px solid #f1f5f9;
        background:#f8fafc;
        overflow:hidden;
        margin-top: 10px;
      }
      .phone-prefix{
        display:flex; align-items:center; gap:10px;
        padding: 0 12px;
        border-right: 1px solid #e2e8f0;
        user-select:none;
        min-width: 92px;
        justify-content:center;
      }
      .phone-flag-img{ width:22px; height:16px; object-fit:cover; border-radius:3px; border:1px solid #e2e8f0; }
      .phone-code{ font-weight:900; color:#0f172a; font-size:0.95rem; }
      .phone-input{
        flex:1; border:none; outline:none; background:transparent;
        padding: 1.05rem; font-size:1.05rem; font-weight:800; color: var(--text-color, #334155);
      }
      .phone-wrap:focus-within{ background:#ffffff; border-color:#cbd5e1; }

      .info-link{ margin-bottom: 10px; display:flex; justify-content:center; }
      .info-link button{
        border:none; background:transparent; cursor:pointer;
        font-weight:1000; color:#0f172a; font-size:0.92rem;
        display:flex; align-items:center; gap:8px;
        padding: 6px 10px; border-radius: 999px;
      }
      .info-link button:hover{ background:#f1f5f9; }
      .info-ico{ width: 18px; height: 18px; display:inline-flex; align-items:center; justify-content:center; }
      .info-ico svg{ width:18px; height:18px; }

      .summary-card{
        width:100%; border-radius: 18px; border: 1px solid #e6edf6;
        background: #ffffff; padding: 14px; box-sizing:border-box;
      }
      .summary-title{ font-weight: 1000; color:#0f172a; text-align:center; font-size:1.05rem; margin-bottom: 10px; }
      .summary-grid{ display:flex; flex-direction:column; gap:8px; }
      .summary-row{
        display:flex; justify-content:space-between; gap:12px;
        padding: 10px 10px; border-radius: 14px;
        background:#f8fafc; border: 1px solid #eef2f7;
      }
      .summary-k{ color:#64748b; font-weight:900; font-size:0.82rem; line-height:1.1rem; max-width: 52%; }
      .summary-v{ color:#0f172a; font-weight:1000; font-size:0.88rem; text-align:right; line-height:1.15rem; max-width: 48%; word-break: break-word; }

      .legal-block{
        margin-top: 12px; font-size: 0.88rem; color:#475569;
        line-height:1.35rem; font-weight:750; text-align:left;
        background:#ffffff; border:1px solid #e6edf6;
        border-radius: 18px; padding: 12px;
      }
      .legal-block a{ color:#0f172a; font-weight:1000; text-decoration: underline; }

      .hint-card{
        width:100%;
        box-sizing:border-box;
        max-width:100%;
        background:#ffffff; border:1px solid #e6edf6;
        border-radius: 18px; padding: 12px; margin-bottom: 12px;
        color:#475569; font-weight:750; line-height:1.35rem; font-size:0.9rem;
      }

      .flatpickr-calendar{
        border-radius: 18px !important; border: 1px solid #e6edf6 !important;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.12) !important;
        overflow:hidden !important;
        font-family: Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial !important;
      }
      .flatpickr-current-month{ font-size: 0.95rem !important; font-weight: 1000 !important; }
      .flatpickr-current-month .numInputWrapper{
        border-radius: 10px !important; border: 1px solid #eef2f7 !important;
        padding: 2px 6px !important; background: #f8fafc !important;
      }
      .flatpickr-day{ border-radius: 999px !important; font-weight: 800 !important; }
      .flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange{
        background: var(--closing-primary, #42f77a) !important; border-color: var(--closing-primary, #42f77a) !important; color: var(--closing-primary-text, #334155) !important;
      }
      .flatpickr-weekday{ font-weight: 900 !important; color:#64748b !important; }

      .sig-shell{ background:#fff; border:1px solid #e6edf6; border-radius: 18px; padding: 12px; }
      .sig-topbar{ display:flex; justify-content:flex-end; margin-bottom: 8px; }
      .sig-clear-link{
        border:none; background:transparent; cursor:pointer;
        font-weight:1000; text-decoration: underline;
        font-size:0.9rem; padding: 6px 8px; border-radius: 10px;
      }
      .sig-clear-link:hover{ background:#f1f5f9; }

      /* ✅ mobile signature: prevent page scroll/gesture interference */
      #sig-canvas{ touch-action: none; -webkit-user-select:none; user-select:none; }

      .tb-loading{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; padding: 20px 0; }
      .tb-spinner{
        width: 34px; height: 34px; border-radius: 999px;
        border: 4px solid #e2e8f0; border-top-color: var(--closing-primary, #42f77a);
        animation: tbspin 0.9s linear infinite;
      }
      @keyframes tbspin{ to{ transform: rotate(360deg); } }

      /* ✅ stronger placeholder visibility on iOS + birthdate */
      #p-geburtsdatum::placeholder{ color:#94a3b8 !important; opacity:1 !important; }
      #p-geburtsdatum{ -webkit-text-fill-color: var(--text-color, #334155) !important; }

      /* ✅ consent rows (for summary) */
      .consent-row{
        display:flex; align-items:flex-start; gap:10px;
        width:100%;
        border-radius: 18px;
        border: 1px solid #e6edf6;
        background:#ffffff;
        padding: 12px;
        box-sizing:border-box;
      }
      .consent-row input[type="checkbox"]{
        margin-top: 3px;
        width: 18px; height: 18px;
        accent-color: var(--closing-primary, #42f77a);
        flex: 0 0 auto;
      }
      .consent-text{
        color:#475569; font-weight:750; line-height:1.35rem; font-size:0.9rem;
      }
      .consent-text b{ color:#0f172a; }
      .consent-text a{ color:#0f172a; font-weight:1000; text-decoration: underline; }

      /* ✅ edit details block */
      .edit-card{
        width:100%; border-radius: 18px; border: 1px solid #e6edf6;
        background: #ffffff; padding: 14px; box-sizing:border-box;
        margin-top: 12px;
      }
      .edit-title{ font-weight:1000; color:#0f172a; text-align:center; font-size:1.02rem; margin-bottom: 10px; }
      .edit-row{
        display:flex; justify-content:space-between; align-items:center; gap:12px;
        padding: 10px 10px; border-radius: 14px;
        background:#f8fafc; border: 1px solid #eef2f7;
      }
      .edit-left{ display:flex; flex-direction:column; gap:3px; min-width: 0; }
      .edit-k{ color:#64748b; font-weight:900; font-size:0.82rem; line-height:1.1rem; }
      .edit-v{ color:#0f172a; font-weight:1000; font-size:0.9rem; line-height:1.15rem; word-break: break-word; }
      .edit-btn{
        border:none; cursor:pointer;
        border-radius: 999px;
        padding: 8px 12px;
        background: var(--closing-primary, #42f77a);
        color: var(--closing-primary-text, #334155);
        font-weight:1000;
        font-size:0.9rem;
        flex: 0 0 auto;
      }
      .edit-btn:hover{ filter: brightness(0.98); }
    `;
    document.head.appendChild(style);
  };

  const applyClosingTheme = () => {
    const theme = resolveClosingTheme();
    const root = document.documentElement;
    root.style.setProperty("--closing-primary", theme.primaryColor);
    root.style.setProperty("--closing-primary-soft", `${theme.primaryColor}1f`);
    root.style.setProperty("--closing-primary-text", theme.primaryButtonText || theme.textColor || "#334155");
    root.style.setProperty("--btn-bg", theme.primaryButtonBg);
    root.style.setProperty("--btn-text", theme.primaryButtonText);
    root.style.setProperty("--text-color", theme.textColor);
  };

  // -------------------------
  // Overlay
  // -------------------------
  const showOverlay = (html) => {
    const existing = document.getElementById("tb-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "tb-overlay";
    overlay.innerHTML = `
      <div class="tb-ov-backdrop"></div>
      <div class="tb-ov-card" role="dialog" aria-modal="true">
        <div class="tb-ov-body">${html}</div>
        <button class="tb-ov-close" id="tb-ov-close">${escapeHtml(ui("back"))}</button>
      </div>
      <style>
        #tb-overlay{ position:fixed; inset:0; z-index:999999; display:flex; align-items:center; justify-content:center; padding:18px; box-sizing:border-box; }
        .tb-ov-backdrop{ position:absolute; inset:0; background: rgba(15,23,42,0.55); }
        .tb-ov-card{
          position:relative; width: min(560px, 100%);
          background:#fff; border-radius: 22px; border: 1px solid #eef2f7;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.18);
          padding: 16px; overflow:hidden;
          font-family: Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial !important;
        }
        .tb-ov-body{ max-height: 72vh; overflow:auto; }
        .tb-ov-close{
          margin-top: 12px; width: 100%; border: none; cursor: pointer;
          border-radius: 16px; padding: 12px 14px;
          background: var(--btn-bg, #0f172a);
          color: var(--btn-text, #00ff9d);
          font-weight: 1000; font-size: 0.98rem;
        }
        .tb-ov-img{ width:100%; border-radius: 16px; border:1px solid #eef2f7; }
        .tb-ov-text{ margin-top: 10px; color:#475569; font-weight: 750; line-height: 1.35; font-size: 0.95rem; }
      </style>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector(".tb-ov-backdrop")?.addEventListener("click", () => overlay.remove());
    overlay.querySelector("#tb-ov-close")?.addEventListener("click", () => overlay.remove());
  };

  // OECHER_V1_EWV_LEGAL_START: only in Oecher V1's isolated local closing asset.
  const enforceOecherEwvLegalLinks = async () => {
    const OECHER_V1_ID = "uuDEvEGcyd3mMiKWKH4Z";
    const EWV_PROVIDER = "EWV Energie- und Wasser-Versorgung GmbH";
    const EWV_NAMES = new Set([EWV_PROVIDER, EWV_PROVIDER + " Stolberg"]);
    const EWV_PROVIDER_ID = "1599c81f-0ba2-4f87-b17a-96b723e53f7a";
    const EWV_TARIFFS = {
      52071: { uuid: "5426805f-8551-4c76-8266-118365289ff8", product: "regiostrom", name: "heimatheld", sha256: "ea71501afa0ca4c98a40964327abc8f01fe1a485860d6d50c28880ff1dd09c8c" },
      52072: { uuid: "ce451ecf-876a-435a-9e62-a13fcfef075f", product: "regiostrom", name: "aktionsheld", sha256: "c2fa5921c8b4420cc85fc18270bf1292ed49e0f9c35e5929513559de7f78b3bc" },
      52073: { uuid: "cda069f6-b345-4311-a05c-5f1da5482f14", product: "regiogas", name: "heimatheld", sha256: "b39d70ed95b3e69f875c31612e563e52862d184bc310ca60258697903203ab14" },
      52074: { uuid: "9e46835a-1a89-4bd6-bd64-8694a95b2b12", product: "regiogas", name: "aktionsheld", sha256: "1089b9291fe5099945c3f3da926dbb2ddfd9e709c223e31f4fe38dcbcd16f2d4" },
    };
    const selected = getSelectedPreisliste();
    const row = state.orderRow || {};
    const snapshot = row.tarif_snapshot || {};
    const providerRecords = [row.anbieter, snapshot.anbieter, selected?.anbieter].filter(value => value && typeof value === "object");
    const providerNames = [row.tariff_provider, snapshot.tariff_provider,
      ...[row.anbieter, snapshot.anbieter, selected?.anbieter].filter(value => typeof value === "string"),
      ...providerRecords.map(value => value.name)].map(safeString).filter(Boolean);
    const rawId = selected?.tarif_id;
    const id = typeof rawId === "number" || typeof rawId === "string" ? String(rawId).trim() : "";
    const isKnownEwvId = Object.prototype.hasOwnProperty.call(EWV_TARIFFS, id);
    const providerIds = [row.anbieter_id, snapshot.anbieter_id, selected?.anbieter_id, ...providerRecords.map(value => value.id)]
      .filter(value => value != null).map(safeString);
    const isEwvProvider = providerNames.length > 0 && providerNames.every(name => EWV_NAMES.has(name));
    const potentiallyEwv = providerNames.some(name => /\bewv\b/i.test(name)) || /regiostrom|regiogas/i.test(getOrderTariffName());

    // All other providers remain on the current, unchanged V1 consent path.
    if (!potentiallyEwv && !isKnownEwvId && !providerIds.includes(EWV_PROVIDER_ID)) { state.ewvLegal = null; return; }

    const fail = (reason) => {
      const error = new Error("Die Vertragsunterlagen für diesen EWV-Tarif sind zurzeit nicht eindeutig verfügbar. Bitte versuche es später erneut oder kontaktiere uns.");
      error.code = "ewv_contract_docs_unavailable";
      console.error("EWV contract consent blocked:", reason);
      throw error;
    };
    if (state.locationId !== OECHER_V1_ID || row.location_id !== OECHER_V1_ID) fail("wrong location");
    if (!isEwvProvider || !isKnownEwvId) fail("missing or inconsistent provider/tariff");
    if (providerIds.some(value => value !== EWV_PROVIDER_ID)) fail("conflicting provider ID");
    for (const candidate of [row.tarif_id, snapshot.tarif_id]) {
      if (candidate !== undefined && candidate !== null && String(candidate).trim() !== id) fail("conflicting tariff ID");
    }
    const expected = EWV_TARIFFS[id];
    const tariffUuids = [row.tarif_uuid, snapshot.tarif_uuid, selected?.tarif_uuid].filter(value => value != null).map(safeString);
    // Production stores just selected_preisliste.tarif_uuid and often no provider ID.
    // Require one canonical tariff UUID, not a second copy (nor the order's row.uuid).
    if (!tariffUuids.length || tariffUuids.some(value => value.toLowerCase() !== expected.uuid)) fail("missing or noncanonical tariff UUID");
    const norm = value => safeString(value).replace(/\s+/g, " ").toLowerCase();
    const productNames = [row.tariff_name, row.tarif, snapshot.tariff_name, selected?.tarif, selected?.tarifname].map(safeString).filter(Boolean);
    if (!productNames.length || productNames.some(value => norm(value) !== `${expected.product} ${expected.name}`)) fail("missing or conflicting tariff label");
    const pdfPath = `/legal/ewv/${id}.pdf`;
    const pdfUrl = new URL(pdfPath, window.location.origin).href;
    let response;
    try {
      response = await fetch(pdfUrl, { method: "GET", credentials: "omit", cache: "no-store" });
    } catch (_error) {
      fail("PDF fetch failed");
    }
    if (!response?.ok) fail("PDF URL not available");
    let bytes;
    try {
      bytes = new Uint8Array(await response.arrayBuffer());
    } catch (_error) {
      fail("PDF read failed");
    }
    if (bytes.length < 10000 || bytes.length > 1048576 ||
        bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46 || bytes[4] !== 0x2d) {
      fail("PDF header/size invalid");
    }
    if (!globalThis.crypto?.subtle?.digest) fail("secure PDF hash verification unavailable");
    let hash;
    try {
      const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
      hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (_error) {
      fail("PDF hash calculation failed");
    }
    if (hash !== expected.sha256) fail("PDF content differs from approved tariff PDF");
    state.providerLinks = {
      agb_url: pdfUrl,
      widerruf_url: pdfUrl,
      datenschutz_url: "https://www.ewv.de/datenschutzhinweise",
    };
    state.ewvLegal = { legal_name: EWV_PROVIDER, tarif_id: id, pdf_sha256: hash };
  };
  // OECHER_V1_EWV_LEGAL_END

  // -------------------------
  // Providers links loader
  // -------------------------
  const loadProviderLinks = async () => {
    const provider = getOrderProviderName();
    if (!provider) return;

    try {
      const client = supa();
      const { data, error } = await client
        .from("anbieter")
        .select("name, agb_url, widerruf_url, datenschutz_url")
        .eq("name", provider)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      state.providerLinks = {
        agb_url: normalizeUrl(data.agb_url),
        widerruf_url: normalizeUrl(data.widerruf_url),
        datenschutz_url: normalizeUrl(data.datenschutz_url),
      };
    } catch (e) {
      console.warn("anbieter link load failed (ok):", e?.message || e);
    }
  };

  // -------------------------
  // Meter info (image + text)
  // -------------------------
  const meterInfo = () => {
    const energy = getOrderEnergy();
    const meterImages = window.KUNDEN_DATA?.closing_consent_text?.meter_image_urls || {};
    const img = String(
      energy === "gas"
        ? meterImages.gas || serviceCfg().meter_image_gas || ""
        : meterImages.strom || serviceCfg().meter_image_strom || ""
    ).trim();

    const text = {
      de: "Du findest die Zählernummer meist direkt am Zähler – häufig neben dem Barcode – oder auf deiner letzten Rechnung bzw. Abrechnung.",
      en: "You can usually find the meter number on the meter itself—often next to the barcode—or on your latest bill/statement.",
      tr: "Sayaç numarasını genellikle sayacın üzerinde (çoğu zaman barkodun yanında) veya son faturanda/hesap dökümünde bulabilirsin.",
      ru: "Номер счётчика обычно указан на самом счётчике (часто рядом со штрих-кодом) или в последнем счёте/выписке.",
      ar: "عادةً تجد رقم العداد على العداد نفسه (غالبًا بجوار الباركود) أو في آخر فاتورة/كشف.",
      it: "Di solito trovi il numero del contatore sul contatore stesso (spesso vicino al codice a barre) oppure sull’ultima bolletta/estratto.",
      zh: "表号通常在表本体上（多在条形码旁），也可在最近一张账单/对账单上找到。",
      hi: "मीटर नंबर आमतौर पर मीटर पर (अक्सर बारकोड के पास) या आपकी पिछली बिल/स्टेटमेंट में मिलता है।",
      es: "Suele estar en el contador (a menudo junto al código de barras) o en tu última factura/recibo.",
      fr: "Vous la trouvez généralement sur le compteur (souvent près du code-barres) ou sur votre dernière facture/relevé.",
      nl: "Je vindt het meternummer meestal op de meter zelf (vaak naast de barcode) of op je laatste factuur/afrekening.",
      pl: "Numer licznika znajdziesz zwykle na samym liczniku (często obok kodu kreskowego) albo na ostatniej fakturze/rozliczeniu.",
    };

    return { img, text };
  };

  // -------------------------
  // Formatting helpers
  // -------------------------
  const asNumber = (v) => {
    const n = typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : null;
  };

  const formatDE = (n, digits = 2) => {
    if (n == null) return "";
    try {
      return n.toLocaleString("de-DE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    } catch {
      return String(n.toFixed(digits)).replace(".", ",");
    }
  };

  const formatDEInt = (n) => {
    if (n == null) return "";
    try {
      return n.toLocaleString("de-DE", { maximumFractionDigits: 0 });
    } catch {
      return String(Math.round(n));
    }
  };

  const formatMoneyEUR = (v, digits = 2) => {
    const n = asNumber(v);
    if (n == null) return safeString(v);
    return `${formatDE(n, digits)} €`;
  };

  const monthWord = () =>
    t({ de: "Monat", en: "month", tr: "ay", ru: "мес.", ar: "شهر", it: "mese", zh: "月", hi: "माह", es: "mes", fr: "mois", nl: "maand", pl: "mies." });

  const formatGrundpreis = (v) => {
    const n = asNumber(v);
    if (n == null) return safeString(v);
    return `${formatDE(n, 2)} €/${monthWord()}`;
  };

  // ✅ CHANGE (display only): grundpreis in auftraege is yearly, but UI shows "Grundpreis/Monat" in summary -> divide by 12
  const formatGrundpreisFromAnnualToMonthly = (annualValue) => {
    const n = asNumber(annualValue);
    if (n == null) return safeString(annualValue);
    return formatGrundpreis(n / 12);
  };

  const formatArbeitspreis = (v) => {
    const n = asNumber(v);
    if (n == null) return safeString(v);
    return `${formatDE(n, 2)} ct/kWh`;
  };

  const formatJahreskosten = (v) => formatMoneyEUR(v, 2);

  const formatMonatsabschlag = (v) => {
    const n = asNumber(v);
    if (n == null) return safeString(v);
    return `${formatDE(n, 2)} €/${monthWord()}`;
  };

  const getOrderVerbrauch = () => {
    const r = state.orderRow || {};
    const raw = r.verbrauch ?? r.verbrauch_kwh ?? r.jahresverbrauch ?? r.jahresverbrauch_kwh ?? r.consumption_kwh ?? "";
    return raw;
  };

  const formatVerbrauchKwh = (v) => {
    const n = asNumber(v);
    if (n == null) return safeString(v);
    return `${formatDEInt(n)} kWh`;
  };

  const translateCaseType = (raw) => {
    const v = safeString(raw);
    if (!v) return "";
    const map = {
      anbieterwechsel: t({
        de: "Anbieterwechsel",
        en: "Provider switch",
        tr: "Sağlayıcı değişimi",
        ru: "Смена поставщика",
        ar: "تغيير المزوّد",
        it: "Cambio fornitore",
        zh: "更换供应商",
        hi: "प्रदाता बदलना",
        es: "Cambio de proveedor",
        fr: "Changement de fournisseur",
        nl: "Overstappen",
        pl: "Zmiana dostawcy",
      }),
      umzug: t({
        de: "Umzug",
        en: "Move",
        tr: "Taşınma",
        ru: "Переезд",
        ar: "انتقال",
        it: "Trasloco",
        zh: "搬家",
        hi: "स्थानांतरण",
        es: "Mudanza",
        fr: "Déménagement",
        nl: "Verhuizing",
        pl: "Przeprowadzka",
      }),
    };
    return map[v] || v;
  };

  // -------------------------
  // Steps / Logic
  // -------------------------
  const steps = () => {
    const energy = getOrderEnergy();

    return [
      { id: "partner", type: "partner_form", question: { de: "Wer ist der Vertragspartner?", en: "Who is the contract partner?", tr: "Sözleşme sahibi kim?", ru: "Кто является владельцем договора?", ar: "من هو صاحب العقد؟", it: "Chi è l’intestatario del contratto?", zh: "合同签约人是谁？", hi: "अनुबंध धारक कौन है?", es: "¿Quién es el titular del contrato?", fr: "Qui est le titulaire du contrat ?", nl: "Wie is de contracthouder?", pl: "Kto jest stroną umowy?" }, required: true, next: "delivery_address" },
      { id: "delivery_address", type: "address_form", question: { de: "Wie lautet die Lieferadresse?", en: "What is the delivery address?", tr: "Teslimat adresi nedir?", ru: "Какой адрес поставки?", ar: "ما عنوان التوريد؟", it: "Qual è l’indirizzo di fornitura?", zh: "供货地址是什么？", hi: "डिलीवरी पता क्या है?", es: "¿Cuál es la dirección de suministro?", fr: "Quelle est l’adresse de fourniture ?", nl: "Wat is het leveradres?", pl: "Jaki jest adres dostawy?" }, required: true, next: "purpose" },

      {
        id: "purpose",
        type: "single_choice_with_hint",
        question: { de: "Worum geht’s?", en: "What is this about?", tr: "Konu nedir?", ru: "О чём речь?", ar: "ما الموضوع؟", it: "Di cosa si tratta?", zh: "这次是关于什么？", hi: "यह किस बारे में है?", es: "¿De qué se trata?", fr: "De quoi s’agit-il ?", nl: "Waar gaat het om?", pl: "O co chodzi?" },
        required: true,
        bind_column: "case_type",
        persist_on_select: true,
        options: [
          { value: "anbieterwechsel", label: { de: "Anbieterwechsel", en: "Provider switch", tr: "Sağlayıcı değişimi", ru: "Смена поставщика", ar: "تغيير المزوّد", it: "Cambio fornitore", zh: "更换供应商", hi: "प्रदाता बदलना", es: "Cambio de proveedor", fr: "Changement de fournisseur", nl: "Overstappen", pl: "Zmiana dostawcy" }, next: "price_increase_received" },
          { value: "umzug", label: { de: "Umzug", en: "Move", tr: "Taşınma", ru: "Переезд", ar: "انتقال", it: "Trasloco", zh: "搬家", hi: "स्थानांतरण", es: "Mudanza", fr: "Déménagement", nl: "Verhuizing", pl: "Przeprowadzka" }, next: "move_in_date" },
        ],
      },

      {
        id: "price_increase_received",
        type: "single_choice",
        question: {
          de: "Hast du innerhalb der letzten 6 Wochen ein Preiserhöhungsschreiben von deinem Stromanbieter erhalten?",
          en: "Have you received a price increase notice from your energy provider within the last 6 weeks?",
          tr: "Son 6 hafta içinde enerji sağlayıcından bir fiyat artışı bildirimi aldın mı?",
          ru: "Получали ли вы за последние 6 недель уведомление о повышении цены от вашего поставщика энергии?",
          ar: "هل تلقيت خلال آخر 6 أسابيع إشعارًا بزيادة السعر من مزوّد الطاقة لديك؟",
          it: "Hai ricevuto negli ultimi 6 settimane una comunicazione di aumento prezzi dal tuo fornitore di energia?",
          zh: "过去 6 周内你是否收到你的能源供应商发来的涨价通知？",
          hi: "क्या पिछले 6 हफ्तों में आपके ऊर्जा प्रदाता से कीमत बढ़ोतरी का नोटिस मिला है?",
          es: "¿Has recibido en las últimas 6 semanas una notificación de subida de precio de tu proveedor de energía?",
          fr: "Avez-vous reçu au cours des 6 dernières semaines un avis d’augmentation de prix de votre fournisseur d’énergie ?",
          nl: "Heb je in de afgelopen 6 weken een brief over een prijsverhoging van je energieleverancier ontvangen?",
          pl: "Czy w ciągu ostatnich 6 tygodni otrzymałeś/-aś pismo o podwyżce od swojego dostawcy energii?",
        },
        required: true,
        bind_column: "preiserhoehung_erhalten",
        persist_on_select: true,
        options: [
          { value: "ja", label: { de: "Ja", en: "Yes", tr: "Evet", ru: "Да", ar: "نعم", it: "Sì", zh: "是", hi: "हाँ", es: "Sí", fr: "Oui", nl: "Ja", pl: "Tak" }, next: "price_increase_effective_date" },
          { value: "nein", label: { de: "Nein", en: "No", tr: "Hayır", ru: "Нет", ar: "لا", it: "No", zh: "否", hi: "नहीं", es: "No", fr: "Non", nl: "Nee", pl: "Nie" }, next: "customer_number" },
        ],
      },
      { id: "price_increase_effective_date", type: "date_input", question: { de: "Ab wann wird die Preiserhöhung wirksam?", en: "From when does the price increase take effect?", tr: "Fiyat artışı ne zaman geçerli olacak?", ru: "С какой даты повышение цены вступает в силу?", ar: "متى تصبح زيادة السعر سارية؟", it: "Da quando entra in vigore l’aumento?", zh: "涨价从何时生效？", hi: "कीमत बढ़ोतरी कब से लागू होगी?", es: "¿Desde cuándo entra en vigor la subida?", fr: "À partir de quand l’augmentation s’applique-t-elle ?", nl: "Vanaf wanneer gaat de prijsverhoging in?", pl: "Od kiedy obowiązuje podwyżka?" }, placeholder: { de: "TT.MM.JJJJ", en: "DD.MM.YYYY", tr: "GG.AA.YYYY", ru: "ДД.ММ.ГГГГ", ar: "DD.MM.YYYY", it: "GG.MM.AAAA", zh: "DD.MM.YYYY", hi: "DD.MM.YYYY", es: "DD.MM.YYYY", fr: "JJ.MM.AAAA", nl: "DD.MM.JJJJ", pl: "DD.MM.RRRR" }, required: true, bind_column: "preiserhoehung_datum", next: "customer_number" },

      {
        id: "customer_number",
        type: "text_input",
        question:
          energy === "gas"
            ? { de: "Wie lautet die Kundennummer oder Vertragskontonummer deines aktuellen Gasvertrags?", en: "What is the customer or contract account number of your current gas contract?", tr: "Mevcut gaz sözleşmenin müşteri/hesap numarası nedir?", ru: "Номер клиента/договора по текущему газовому контракту?", ar: "ما رقم العميل/حساب العقد لعقد الغاز الحالي؟", it: "Qual è il numero cliente/contratto del tuo attuale contratto gas?", zh: "当前燃气合同的客户/合同账号是多少？", hi: "आपके वर्तमान गैस अनुबंध का ग्राहक/खाता नंबर क्या है?", es: "¿Cuál es el número de cliente/cuenta de tu contrato de gas actual?", fr: "Quel est le numéro client/compte contrat de votre contrat gaz actuel ?", nl: "Wat is het klant-/contractnummer van je huidige gascontract?", pl: "Jaki jest numer klienta/konta umowy w Twojej obecnej umowie gazowej?" }
            : { de: "Wie lautet die Kundennummer oder Vertragskontonummer deines aktuellen Stromvertrags?", en: "What is the customer or contract account number of your current electricity contract?", tr: "Mevcut elektrik sözleşmenin müşteri/hesap numarası nedir?", ru: "Номер клиента/договора по текущему контракту на электроэнергию?", ar: "ما رقم العميل/حساب العقد لعقد الكهرباء الحالي؟", it: "Qual è il numero cliente/contratto del tuo attuale contratto luce?", zh: "当前电力合同的客户/合同账号是多少？", hi: "आपके वर्तमान बिजली अनुबंध का ग्राहक/खाता नंबर क्या है?", es: "¿Cuál es el número de cliente/cuenta de tu contrato eléctrico actual?", fr: "Quel est le numéro client/compte contrat de votre contrat d’électricité actuel ?", nl: "Wat is het klant-/contractnummer van je huidige stroomcontract?", pl: "Jaki jest numer klienta/konta umowy w Twojej obecnej umowie prądu?" },
        placeholder: { de: "z. B. aus der letzten Rechnung", en: "e.g. from your last bill", tr: "ör. son faturadan", ru: "например, из последнего счёта", ar: "مثلاً من آخر فاتورة", it: "es. dall’ultima bolletta", zh: "例如在上一张账单上", hi: "जैसे पिछले बिल से", es: "p. ej., de tu última factura", fr: "ex. sur votre dernière facture", nl: "bijv. van je laatste rekening", pl: "np. z ostatniej faktury" },
        required: true,
        bind_column: "kundennummer_aktuell",
        next: "contract_cancelled",
      },

      {
        id: "contract_cancelled",
        type: "single_choice",
        question: {
          de: "Hast du deinen Vertrag bereits gekündigt?",
          en: "Have you already cancelled your contract?",
          tr: "Sözleşmeni zaten iptal ettin mi?",
          ru: "Вы уже расторгли договор?",
          ar: "هل قمت بإلغاء عقدك بالفعل؟",
          it: "Hai già disdetto il tuo contratto?",
          zh: "你已经取消你的合同了吗？",
          hi: "क्या आपने अपना अनुबंध पहले ही रद्द कर दिया है?",
          es: "¿Ya has cancelado tu contrato?",
          fr: "Avez-vous déjà résilié votre contrat ?",
          nl: "Heb je je contract al opgezegd?",
          pl: "Czy wypowiedziałeś/-aś już umowę?",
        },
        required: true,
        options: [
          { value: "ja", label: { de: "Ja", en: "Yes", tr: "Evet", ru: "Да", ar: "نعم", it: "Sì", zh: "是", hi: "हाँ", es: "Sí", fr: "Oui", nl: "Ja", pl: "Tak" }, next: "contract_cancel_date" },
          { value: "nein", label: { de: "Nein", en: "No", tr: "Hayır", ru: "Нет", ar: "لا", it: "No", zh: "否", hi: "नहीं", es: "No", fr: "Non", nl: "Nee", pl: "Nie" }, next: "meter_number" },
        ],
      },

      {
        id: "contract_cancel_date",
        type: "date_input",
        question: {
          de: "Zu welchem Datum hast du gekündigt?",
          en: "For what date did you cancel?",
          tr: "Hangi tarihe kadar iptal ettin?",
          ru: "На какую дату вы расторгли договор?",
          ar: "لأي تاريخ قمت بالإلغاء؟",
          it: "A quale data hai disdetto?",
          zh: "你取消到哪个日期？",
          hi: "आपने किस तारीख से रद्द किया?",
          es: "¿Para qué fecha cancelaste?",
          fr: "Pour quelle date avez-vous résilié ?",
          nl: "Per welke datum heb je opgezegd?",
          pl: "Na jaką datę wypowiedziałeś/-aś umowę?",
        },
        placeholder: { de: "TT.MM.JJJJ", en: "DD.MM.YYYY", tr: "GG.AA.YYYY", ru: "ДД.ММ.ГГГГ", ar: "DD.MM.YYYY", it: "GG.MM.AAAA", zh: "DD.MM.YYYY", hi: "DD.MM.YYYY", es: "DD.MM.YYYY", fr: "JJ.MM.AAAA", nl: "DD.MM.JJJJ", pl: "DD.MM.RRRR" },
        required: true,
        next: "meter_number",
      },

      { id: "move_in_date", type: "date_input", question: { de: "Wann ist das Einzugsdatum?", en: "What is the move-in date?", tr: "Taşınma tarihi nedir?", ru: "Дата заселения?", ar: "ما تاريخ الانتقال؟", it: "Qual è la data di ingresso?", zh: "入住日期是什么？", hi: "प्रवेश तिथि क्या है?", es: "¿Cuál es la fecha de entrada?", fr: "Quelle est la date d’emménagement ?", nl: "Wat is de inhuisdatum?", pl: "Jaka jest data wprowadzenia?" }, placeholder: { de: "TT.MM.JJJJ", en: "DD.MM.YYYY", tr: "GG.AA.YYYY", ru: "ДД.ММ.ГГГГ", ar: "DD.MM.YYYY", it: "GG.MM.AAAA", zh: "DD.MM.YYYY", hi: "DD.MM.YYYY", es: "DD.MM.YYYY", fr: "JJ.MM.AAAA", nl: "DD.MM.JJJJ", pl: "DD.MM.RRRR" }, required: true, bind_column: "einzugsdatum", next: "meter_known" },

      {
        id: "meter_known",
        type: "single_choice",
        question:
          energy === "gas"
            ? { de: "Kennst du bereits deine neue Gaszählernummer?", en: "Do you already know your new gas meter number?", tr: "Yeni gaz sayaç numaranı biliyor musun?", ru: "Вы уже знаете новый номер газового счётчика?", ar: "هل تعرف رقم عداد الغاز الجديد؟", it: "Conosci già il nuovo numero del contatore gas?", zh: "你已经知道新的燃气表号了吗？", hi: "क्या आपको नया गैस मीटर नंबर पता है?", es: "¿Ya conoces tu nuevo número de contador de gas?", fr: "Connaissez-vous déjà votre nouveau numéro de compteur gaz ?", nl: "Weet je je nieuwe gasmeternummer al?", pl: "Czy znasz już swój nowy numer licznika gazu?" }
            : { de: "Kennst du bereits deine neue Stromzählernummer?", en: "Do you already know your new electricity meter number?", tr: "Yeni elektrik sayaç numaranı biliyor musun?", ru: "Вы уже знаете новый номер электросчётчика?", ar: "هل تعرف رقم عداد الكهرباء الجديد؟", it: "Conosci già il nuovo numero del contatore luce?", zh: "你已经知道新的电表号了吗？", hi: "क्या आपको नया बिजली मीटर नंबर पता है?", es: "¿Ya conoces tu nuevo número de contador eléctrico?", fr: "Connaissez-vous déjà votre nouveau numéro de compteur électrique ?", nl: "Weet je je nieuwe stroommeternummer al?", pl: "Czy znasz już swój nowy numer licznika prądu?" },
        required: true,
        bind_column: "meter_status",
        persist_on_select: true,
        options: [
          { value: "ja", label: { de: "Ja", en: "Yes", tr: "Evet", ru: "Да", ar: "نعم", it: "Sì", zh: "是", hi: "हाँ", es: "Sí", fr: "Oui", nl: "Ja", pl: "Tak" }, next: "meter_number" },
          { value: "nein, noch nicht erhalten", label: { de: "Nein, noch nicht erhalten", en: "No, not yet", tr: "Hayır, henüz değil", ru: "Нет, ещё нет", ar: "لا، ليس بعد", it: "No, non ancora", zh: "没有，还没收到", hi: "नहीं, अभी नहीं", es: "No, todavía no", fr: "Non, pas encore", nl: "Nee, nog niet", pl: "Nie, jeszcze nie" }, next: "meter_expected_date" },
        ],
      },

      {
        id: "meter_number",
        type: "meter_number_input",
        question:
          energy === "gas"
            ? { de: "Wie lautet deine Gaszählernummer?", en: "What is your gas meter number?", tr: "Gaz sayaç numaran nedir?", ru: "Какой номер газового счётчика?", ar: "ما رقم عداد الغاز؟", it: "Qual è il numero del contatore gas?", zh: "你的燃气表号是多少？", hi: "आपका गैस मीटर नंबर क्या है?", es: "¿Cuál es tu número de contador de gas?", fr: "Quel est votre numéro de compteur gaz ?", nl: "Wat is je gasmeternummer?", pl: "Jaki jest numer Twojego licznika gazu?" }
            : { de: "Wie lautet deine Stromzählernummer?", en: "What is your electricity meter number?", tr: "Elektrik sayaç numaran nedir?", ru: "Какой номер электросчётчика?", ar: "ما رقم عداد الكهرباء؟", it: "Qual è il numero del contatore luce?", zh: "你的电表号是多少？", hi: "आपका बिजली मीटर नंबर क्या है?", es: "¿Cuál es tu número de contador eléctrico?", fr: "Quel est votre numéro de compteur électrique ?", nl: "Wat is je stroommeternummer?", pl: "Jaki jest numer Twojego licznika prądu?" },
        placeholder: { de: "Zählernummer", en: "Meter number", tr: "Sayaç numarası", ru: "Номер счётчика", ar: "رقم العداد", it: "Numero contatore", zh: "表号", hi: "मीटर नंबर", es: "Número de contador", fr: "Numéro de compteur", nl: "Meternummer", pl: "Numer licznika" },
        required: true,
        bind_column: "meter_number",
        next: () => (isIbanRequired() ? "iban" : isMaloRequired() ? "malo" : "summary"),
      },

      { id: "meter_expected_date", type: "date_input", question: energy === "gas" ? { de: "Wann erhältst du die Gaszählernummer voraussichtlich?", en: "When do you expect to receive the gas meter number?", tr: "Gaz sayaç numarasını ne zaman almayı bekliyorsun?", ru: "Когда вы ожидаете получить номер газового счётчика?", ar: "متى تتوقع استلام رقم عداد الغاز؟", it: "Quando prevedi di ricevere il numero del contatore gas?", zh: "你预计何时会收到燃气表号？", hi: "आपको गैस मीटर नंबर कब मिलने की उम्मीद है?", es: "¿Cuándo esperas recibir el número del contador de gas?", fr: "Quand pensez-vous recevoir le numéro de compteur gaz ?", nl: "Wanneer verwacht je het gasmeternummer te ontvangen?", pl: "Kiedy spodziewasz się otrzymać numer licznika gazu?" } : { de: "Wann erhältst du die Stromzählernummer voraussichtlich?", en: "When do you expect to receive the electricity meter number?", tr: "Elektrik sayaç numarasını ne zaman almayı bekliyorsun?", ru: "Когда вы ожидаете получить номер электросчётчика?", ar: "متى تتوقع استلام رقم عداد الكهرباء؟", it: "Quando prevedi di ricevere il numero del contatore luce?", zh: "你预计何时会收到电表号？", hi: "आपको बिजली मीटर नंबर कब मिलने की उम्मीद है?", es: "¿Cuándo esperas recibir el número del contador eléctrico?", fr: "Quand pensez-vous recevoir le numéro de compteur électrique ?", nl: "Wanneer verwacht je het stroommeternummer te ontvangen?", pl: "Kiedy spodziewasz się otrzymać numer licznika prądu?" }, placeholder: { de: "TT.MM.JJJJ", en: "DD.MM.YYYY", tr: "GG.AA.YYYY", ru: "ДД.ММ.ГГГГ", ar: "DD.MM.YYYY", it: "GG.MM.AAAA", zh: "DD.MM.YYYY", hi: "DD.MM.YYYY", es: "DD.MM.YYYY", fr: "JJ.MM.AAAA", nl: "DD.MM.JJJJ", pl: "DD.MM.RRRR" }, required: true, bind_column: "meter_expected_date", next: () => (isIbanRequired() ? "iban" : isMaloRequired() ? "malo" : "summary") },

      { id: "iban", type: "iban_input", question: { de: "IBAN für die Zahlung", en: "IBAN for payment", tr: "Ödeme için IBAN", ru: "IBAN для оплаты", ar: "IBAN للدفع", it: "IBAN per il pagamento", zh: "用于付款的 IBAN", hi: "भुगतान के लिए IBAN", es: "IBAN para el pago", fr: "IBAN pour le paiement", nl: "IBAN voor betaling", pl: "IBAN do płatności" }, placeholder: { de: "DE00 0000 0000 0000 0000 00", en: "DE00 0000 0000 0000 0000 00", tr: "DE00 ...", ru: "DE00 ...", ar: "DE00 ...", it: "DE00 ...", zh: "DE00 ...", hi: "DE00 ...", es: "DE00 ...", fr: "DE00 ...", nl: "DE00 ...", pl: "DE00 ..." }, required: true, bind_column: "iban", next: () => (isMaloRequired() ? "malo" : "summary") },
      {
        id: "malo",
        type: "text_input",
        question: {
          de: "Marktlokations-ID (MaLo-ID)",
          en: "Market Location ID (MaLo-ID)",
          tr: "Marktstandort-ID (MaLo-ID)",
          ru: "Идентификатор рыночной локации (MaLo-ID)",
          ar: "معرّف موقع السوق (MaLo-ID)",
          it: "ID della località di mercato (MaLo-ID)",
          zh: "市场位置编号（MaLo-ID）",
          hi: "मार्केट लोकेशन आईडी (MaLo-ID)",
          es: "ID de ubicación de mercado (MaLo-ID)",
          fr: "Identifiant de localisation du marché (MaLo-ID)",
          nl: "Marktlocatie-ID (MaLo-ID)",
          pl: "Identyfikator lokalizacji rynkowej (MaLo-ID)",
        },
        placeholder: {
          de: "z. B. aus Unterlagen vom Netzbetreiber",
          en: "e.g. from your grid operator documents",
          tr: "ör. şebeke işletmecisi belgelerinden",
          ru: "напр., в документах вашего оператора сети",
          ar: "مثلاً من مستندات مشغّل شبكة الكهرباء",
          it: "ad es. dai documenti del gestore di rete",
          zh: "例如：来自电网运营商文件",
          hi: "जैसे, आपके ग्रिड ऑपरेटर के दस्तावेज़ों से",
          es: "p. ej., de documentos de tu operador de red",
          fr: "ex. dans les documents de votre gestionnaire de réseau",
          nl: "bijv. uit documenten van je netbeheerder",
          pl: "np. z dokumentów operatora sieci",
        },
        help: {
          de: "Die MaLo-ID findest du häufig in Unterlagen deines Netzbetreibers oder auf Vertrags-/Zählerunterlagen.",
          en: "You can often find the MaLo-ID in your grid operator documents or on contract/meter documents.",
          tr: "MaLo-ID’yi genellikle şebeke işletmecisi belgelerinde veya sözleşme/sayaç evraklarında bulabilirsin.",
          ru: "MaLo-ID часто можно найти в документах сетевого оператора или в договорных/счётчиковых документах.",
          ar: "غالبًا ما تجد MaLo-ID في مستندات مشغّل الشبكة أو في مستندات العقد/العداد.",
          it: "Spesso trovi il MaLo-ID nei documenti del gestore di rete o nella documentazione di contratto/contatore.",
          zh: "你通常可以在电网运营商文件或合同/电表资料中找到 MaLo-ID。",
          hi: "MaLo-ID अक्सर आपके ग्रिड ऑपरेटर के दस्तावेज़ों या अनुबंध/मीटर दस्तावेज़ों में मिलती है।",
          es: "A menudo encontrarás la MaLo-ID en documentos de tu operador de red o en documentos de contrato/contador.",
          fr: "La MaLo-ID se trouve souvent dans les documents de votre gestionnaire de réseau ou sur les documents de contrat/compteur.",
          nl: "Je vindt de MaLo-ID vaak in documenten van je netbeheerder of op contract-/meterdocumenten.",
          pl: "MaLo-ID często znajdziesz w dokumentach operatora sieci albo na dokumentach umowy/licznika.",
        },
        required: true,
        bind_column: "malo",
        next: "summary",
      },

      { id: "summary", type: "summary_view", question: { de: "Tarifübersicht", en: "Tariff overview", tr: "Tarife özeti", ru: "Обзор тарифа", ar: "ملخص التعرفة", it: "Riepilogo tariffa", zh: "费率概览", hi: "टैरिफ़ सारांश", es: "Resumen de tarifa", fr: "Récapitulatif du tarif", nl: "Tariefoverzicht", pl: "Podsumowanie taryfy" }, required: true, next: "signature" },

      { id: "signature", type: "signature_pad", question: { de: "Unterschrift", en: "Signature", tr: "İmza", ru: "Подпись", ar: "التوقيع", it: "Firma", zh: "签名", hi: "हस्ताक्षर", es: "Firma", fr: "Signature", nl: "Handtekening", pl: "Podpis" }, required: true, next: "END" },
    ];
  };

  const stepById = (id) => steps().find((s) => String(s.id) === String(id));

  // -------------------------
  // Prefill helpers
  // -------------------------
  const seedPrefills = () => {
    const r = state.orderRow || {};
    const cp = r.closing_payload && typeof r.closing_payload === "object" ? r.closing_payload : {};

    state.answers.partner = {
      anrede: safeString(r.anrede),
      vorname: safeString(r.vorname),
      nachname: safeString(r.nachname),
      geburtsdatum: r.geburtsdatum ? toDDMMYYYY(r.geburtsdatum) : "",
    };

    const phoneE164 = safeString(r.phone_e164 || r.phone || r.telefon || "");
    state.answers.delivery_address = {
      strasse: safeString(r.strasse),
      hausnummer: safeString(r.hausnummer),
      plz: safeString(r.plz),
      stadt: safeString(r.stadt),
      email: safeString(r.email),
      phone_national: normalizeToNationalDE(phoneE164),
    };

    const ct = safeString(r.case_type);
    if (ct === "anbieterwechsel" || ct === "umzug") state.answers.purpose = ct;

    if (typeof r.preiserhoehung_erhalten === "boolean") state.answers.price_increase_received = r.preiserhoehung_erhalten ? "ja" : "nein";
    if (r.preiserhoehung_datum) state.answers.price_increase_effective_date = toDDMMYYYY(r.preiserhoehung_datum);
    if (r.kundennummer_aktuell) state.answers.customer_number = safeString(r.kundennummer_aktuell);

    if (cp.contract_cancelled === true) state.answers.contract_cancelled = "ja";
    if (cp.contract_cancelled === false) state.answers.contract_cancelled = "nein";
    if (cp.contract_cancel_date) state.answers.contract_cancel_date = toDDMMYYYY(cp.contract_cancel_date);

    if (r.einzugsdatum) state.answers.move_in_date = toDDMMYYYY(r.einzugsdatum);

    if (r.meter_status) state.answers.meter_known = safeString(r.meter_status).toLowerCase() === "ja" ? "ja" : "nein";
    if (r.meter_number) state.answers.meter_number = safeString(r.meter_number);
    if (r.meter_expected_date) state.answers.meter_expected_date = toDDMMYYYY(r.meter_expected_date);

    if (r.iban) state.answers.iban = normalizeIban(r.iban);
    if (r.malo) state.answers.malo = safeString(r.malo);
    else if (r.malo_id) state.answers.malo = safeString(r.malo_id);

    state.answers.summary_consents = {
      legal: !!r.consent_accepted,
      privacy: !!r.closing_privacy_accepted,
    };

    // ✅ IMPORTANT: NEVER prefill signature from DB on load (user must always sign fresh)
    state.answers.signature = "";
  };

  // -------------------------
  // Rendering helpers
  // -------------------------
  const showError = (msg) => {
    const el = document.getElementById("survey-error");
    if (!el) return;
    if (!msg) {
      el.textContent = "";
      el.classList.add("hidden-v");
      return;
    }
    el.textContent = msg;
    el.classList.remove("hidden-v");
  };

  const renderFooter = (step) => {
    if (step.type === "single_choice" || step.type === "single_choice_with_hint") return "";
    const isFinal = step.next === "END";
    return `
      <div class="survey-actions">
        <button id="survey-primary-btn" type="button" class="btn-start-action">
          ${escapeHtml(isFinal ? ui("submit") : ui("next"))}
        </button>
      </div>
    `;
  };

  const renderTextInput = (step, value) => {
    const prev = value != null ? String(value) : "";
    const helpText = t(step.help);
    return `
      <div class="input-container">
        <input id="survey-input" class="modern-input text-left" placeholder="${escapeHtml(t(step.placeholder))}" value="${escapeHtml(prev)}" autocomplete="off" />
        ${helpText ? `<div style="font-size:13px; color:#64748b; margin-top:8px; line-height:1.45;">${escapeHtml(helpText)}</div>` : ""}
      </div>
    `;
  };

  const renderPartnerForm = () => {
    const prev = state.answers.partner || {};
    const anredeVal = safeString(prev.anrede).toLowerCase();

    const anredeLabel = t({ de: "Anrede", en: "Salutation", tr: "Hitap", ru: "Обращение", ar: "اللقب", it: "Titolo", zh: "称谓", hi: "सम्बोधन", es: "Tratamiento", fr: "Civilité", nl: "Aanhef", pl: "Zwrot grzecznościowy" });

    const optHerr = t({ de: "Herr", en: "Mr.", tr: "Bay", ru: "Г-н", ar: "السيد", it: "Sig.", zh: "先生", hi: "श्री", es: "Sr.", fr: "M.", nl: "Dhr.", pl: "Pan" });
    const optFrau = t({ de: "Frau", en: "Ms.", tr: "Bayan", ru: "Г-жа", ar: "السيدة", it: "Sig.ra", zh: "女士", hi: "श्रीमती", es: "Sra.", fr: "Mme", nl: "Mevr.", pl: "Pani" });
    const optDivers = t({ de: "Divers", en: "Other", tr: "Diğer", ru: "Другое", ar: "آخر", it: "Altro", zh: "其他", hi: "अन्य", es: "Otro", fr: "Autre", nl: "Anders", pl: "Inne" });

    return `
      <div class="input-container">
        <select id="p-anrede" class="modern-input select-left" aria-label="${escapeHtml(anredeLabel)}">
          <option value="" ${!anredeVal ? "selected" : ""}>${escapeHtml(anredeLabel)}</option>
          <option value="herr" ${anredeVal === "herr" ? "selected" : ""}>${escapeHtml(optHerr)}</option>
          <option value="frau" ${anredeVal === "frau" ? "selected" : ""}>${escapeHtml(optFrau)}</option>
          <option value="divers" ${anredeVal === "divers" ? "selected" : ""}>${escapeHtml(optDivers)}</option>
        </select>

        <input id="p-vorname" class="modern-input text-left" placeholder="${escapeHtml(t({de:"Vorname",en:"First name",tr:"Ad",ru:"Имя",ar:"الاسم",it:"Nome",zh:"名",hi:"पहला नाम",es:"Nombre",fr:"Prénom",nl:"Voornaam",pl:"Imię"}))}" value="${escapeHtml(prev.vorname||"")}" autocomplete="given-name" />
        <input id="p-nachname" class="modern-input text-left" placeholder="${escapeHtml(t({de:"Nachname",en:"Last name",tr:"Soyad",ru:"Фамилия",ar:"اسم العائلة",it:"Cognome",zh:"姓",hi:"उपनाम",es:"Apellidos",fr:"Nom",nl:"Achternaam",pl:"Nazwisko"}))}" value="${escapeHtml(prev.nachname||"")}" autocomplete="family-name" />
        <input id="p-geburtsdatum" class="modern-input text-left" placeholder="${escapeHtml(t({de:"Geburtsdatum (TT.MM.JJJJ)",en:"Date of birth (DD.MM.YYYY)",tr:"Doğum tarihi (GG.AA.YYYY)",ru:"Дата рождения (ДД.ММ.ГГГГ)",ar:"تاريخ الميلاد (DD.MM.YYYY)",it:"Data di nascita (GG.MM.AAAA)",zh:"出生日期 (DD.MM.YYYY)",hi:"जन्म तिथि (DD.MM.YYYY)",es:"Fecha de nacimiento (DD.MM.YYYY)",fr:"Date de naissance (JJ.MM.AAAA)",nl:"Geboortedatum (DD.MM.JJJJ)",pl:"Data urodzenia (DD.MM.RRRR)"}))}" value="${escapeHtml(prev.geburtsdatum||"")}" inputmode="numeric" autocomplete="bday" aria-label="${escapeHtml(t({de:"Geburtsdatum",en:"Date of birth",tr:"Doğum tarihi",ru:"Дата рождения",ar:"تاريخ الميلاد",it:"Data di nascita",zh:"出生日期",hi:"जन्म तिथि",es:"Fecha de nacimiento",fr:"Date de naissance",nl:"Geboortedatum",pl:"Data urodzenia"}))}" />
      </div>
    `;
  };

  const renderAddressForm = () => {
    const prev = state.answers.delivery_address || {};
    const emailLabel = t({ de: "E-Mail", en: "Email", tr: "E-posta", ru: "E-mail", ar: "البريد الإلكتروني", it: "Email", zh: "邮箱", hi: "ईमेल", es: "Email", fr: "E-mail", nl: "E-mail", pl: "E-mail" });
    const phoneLabel = t({ de: "Telefonnummer", en: "Phone number", tr: "Telefon numarası", ru: "Телефон", ar: "رقم الهاتف", it: "Numero di telefono", zh: "电话号码", hi: "फोन नंबर", es: "Número de teléfono", fr: "Numéro de téléphone", nl: "Telefoonnummer", pl: "Numer telefonu" });

    return `
      <div class="input-container">
        <input id="ad-strasse" class="modern-input text-left" placeholder="${escapeHtml(t({de:"Straße",en:"Street",tr:"Sokak",ru:"Улица",ar:"الشارع",it:"Via",zh:"街道",hi:"सड़क",es:"Calle",fr:"Rue",nl:"Straat",pl:"Ulica"}))}" value="${escapeHtml(prev.strasse||"")}" autocomplete="address-line1" />
        <input id="ad-hausnummer" class="modern-input text-left" placeholder="${escapeHtml(t({de:"Hausnummer",en:"House number",tr:"Kapı no",ru:"Дом",ar:"رقم المنزل",it:"Civico",zh:"门牌号",hi:"घर नंबर",es:"Número",fr:"Numéro",nl:"Huisnr.",pl:"Nr domu"}))}" value="${escapeHtml(prev.hausnummer||"")}" autocomplete="address-line2" />
        <input id="ad-plz" class="modern-input text-left" placeholder="${escapeHtml(t({de:"PLZ",en:"ZIP",tr:"Posta kodu",ru:"Индекс",ar:"الرمز البريدي",it:"CAP",zh:"邮编",hi:"पिन कोड",es:"CP",fr:"Code postal",nl:"Postcode",pl:"Kod pocztowy"}))}" value="${escapeHtml(prev.plz||"")}" inputmode="numeric" autocomplete="postal-code" />
        <input id="ad-stadt" class="modern-input text-left" placeholder="${escapeHtml(t({de:"Stadt",en:"City",tr:"Şehir",ru:"Город",ar:"المدينة",it:"Città",zh:"城市",hi:"शहर",es:"Ciudad",fr:"Ville",nl:"Stad",pl:"Miasto"}))}" value="${escapeHtml(prev.stadt||"")}" autocomplete="address-level2" />

        <input id="ad-email" class="modern-input text-left" placeholder="${escapeHtml(emailLabel)}" value="${escapeHtml(prev.email||"")}" inputmode="email" autocomplete="email" />
        <div class="phone-wrap" style="margin-top:10px;">
          <div class="phone-prefix">
            <img class="phone-flag-img" src="${escapeHtml(DE_FLAG)}" alt="DE flag"/>
            <span class="phone-code">${escapeHtml(DE_PREFIX)}</span>
          </div>
          <input id="ad-phone-national" class="phone-input" placeholder="${escapeHtml(phoneLabel)}" value="${escapeHtml(prev.phone_national||"")}" inputmode="tel" autocomplete="tel" />
        </div>
      </div>
    `;
  };

  const renderDateInput = (step) => {
    const prev = state.answers[step.id] != null ? String(state.answers[step.id]) : "";
    const ph = t(step.placeholder || { de: "TT.MM.JJJJ" });
    return `
      <div class="input-container">
        <input id="date-input" class="modern-input text-left" placeholder="${escapeHtml(ph)}" value="${escapeHtml(prev)}" inputmode="numeric" autocomplete="off" />
      </div>
    `;
  };

  const renderIbanInput = (step) => {
    const prev = state.answers[step.id] != null ? String(state.answers[step.id]) : "";
    const ph = t(step.placeholder || "");
    const formatted = prev ? normalizeIban(prev).replace(/(.{4})/g, "$1 ").trim() : "";
    return `
      <div class="input-container">
        <input id="iban-input" class="modern-input text-left" placeholder="${escapeHtml(ph)}" value="${escapeHtml(formatted)}" autocomplete="off" />
      </div>
    `;
  };

  const renderSingleChoice = (step) => {
    const options = Array.isArray(step.options) ? step.options : [];
    const selected = state.answers[step.id] != null ? String(state.answers[step.id]) : "";
    return options
      .map((opt) => {
        const isSel = selected && String(opt.value) === selected;
        return `
          <div class="animated-card ${isSel ? "selected-border" : ""}" data-next="${escapeHtml(opt.next || step.next || "")}" data-val="${escapeHtml(opt.value)}">
            <span>${escapeHtml(t(opt.label))}</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </div>
        `;
      })
      .join("");
  };

  const renderSingleChoiceWithHint = (step) => {
    return `
      <div class="hint-card">${escapeHtml(ui("purposeHint"))}</div>
      ${renderSingleChoice(step)}
    `;
  };

  const renderMeterNumberInput = (step) => {
    const prev = state.answers[step.id] != null ? String(state.answers[step.id]) : "";
    const icon = `
      <span class="info-ico" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 10v6"></path>
          <path d="M12 7h.01"></path>
        </svg>
      </span>
    `;
    return `
      <div class="input-container">
        <div class="info-link">
          <button id="meter-info-btn" type="button">${icon}<span>${escapeHtml(ui("infoLink"))}</span></button>
        </div>
        <input id="meter-input" class="modern-input text-left" placeholder="${escapeHtml(t(step.placeholder))}" value="${escapeHtml(prev)}" autocomplete="off" />
      </div>
    `;
  };

  const renderSummary = () => {
    const r = state.orderRow || {};
    const provider = getOrderProviderName();
    const tariff = getOrderTariffName();
    const normalized = computeSummaryNormalized();

    const verbrauchRaw = getOrderVerbrauch();

    const rows = [
      { k: t({ de: "Tarif", en: "Tariff", tr: "Tarife", ru: "Тариф", ar: "التعرفة", it: "Tariffa", zh: "费率", hi: "टैरिफ़", es: "Tarifa", fr: "Tarif", nl: "Tarief", pl: "Taryfa" }), v: tariff },
      { k: t({ de: "Anbieter", en: "Provider", tr: "Sağlayıcı", ru: "Поставщик", ar: "المزوّد", it: "Fornitore", zh: "供应商", hi: "प्रदाता", es: "Proveedor", fr: "Fournisseur", nl: "Aanbieder", pl: "Dostawca" }), v: provider },
      {
        k: t({ de: "Verbrauch", en: "Consumption", tr: "Tüketim", ru: "Потребление", ar: "الاستهلاك", it: "Consumo", zh: "用量", hi: "खपत", es: "Consumo", fr: "Consommation", nl: "Verbruik", pl: "Zużycie" }),
        v: asNumber(verbrauchRaw) != null ? formatVerbrauchKwh(verbrauchRaw) : safeString(verbrauchRaw) ? `${safeString(verbrauchRaw)} kWh` : "",
      },
      { k: t({ de: "Arbeitspreis", en: "Energy price", tr: "Birim fiyat", ru: "Цена за кВт⋅ч", ar: "سعر الطاقة", it: "Prezzo energia", zh: "电量单价", hi: "ऊर्जा दर", es: "Precio energía", fr: "Prix énergie", nl: "Verbruikstarief", pl: "Cena energii" }), v: asNumber(r.arbeitspreis) != null ? formatArbeitspreis(r.arbeitspreis) : safeString(r.arbeitspreis) },
      {
        k: t({ de: "Grundpreis", en: "Base fee", tr: "Sabit ücret", ru: "Абонплата", ar: "الرسوم الأساسية", it: "Quota fissa", zh: "基本费", hi: "बेस फ़ीस", es: "Cuota fija", fr: "Abonnement", nl: "Vastrecht", pl: "Opłata stała" }),
        v: asNumber(r.grundpreis) != null ? formatGrundpreisFromAnnualToMonthly(r.grundpreis) : safeString(r.grundpreis),
      },
      { k: t({ de: "Vertragslaufzeit", en: "Contract term", tr: "Sözleşme süresi", ru: "Срок договора", ar: "مدة العقد", it: "Durata", zh: "合同期限", hi: "अनुबंध अवधि", es: "Duración", fr: "Durée", nl: "Looptijd", pl: "Okres umowy" }), v: normalized.vertragslaufzeit_display || "" },
      { k: t({ de: "Preisgarantie", en: "Price guarantee", tr: "Fiyat garantisi", ru: "Гарантия цены", ar: "ضمان السعر", it: "Garanzia prezzo", zh: "价格保障", hi: "मूल्य गारंटी", es: "Garantía de precio", fr: "Garantie de prix", nl: "Prijs garantie", pl: "Gwarancja ceny" }), v: normalized.preisgarantie_display || "" },
      { k: t({ de: "Jahreskosten", en: "Annual cost", tr: "Yıllık maliyet", ru: "Годовая стоимость", ar: "التكلفة السنوية", it: "Costo annuo", zh: "年费用", hi: "वार्षिक लागत", es: "Coste anual", fr: "Coût annuel", nl: "Jaarkosten", pl: "Koszt roczny" }), v: asNumber(r.jahreskosten) != null ? formatJahreskosten(r.jahreskosten) : safeString(r.jahreskosten) },
      { k: t({ de: "Monatsabschlag", en: "Monthly payment", tr: "Aylık ödeme", ru: "Ежемесячный платёж", ar: "الدفعة الشهرية", it: "Rata mensile", zh: "月预付款", hi: "मासिक भुगतान", es: "Pago mensual", fr: "Mensualité", nl: "Maandtermijn", pl: "Rata miesięczna" }), v: asNumber(r.monatsabschlag) != null ? formatMonatsabschlag(r.monatsabschlag) : safeString(r.monatsabschlag) },
    ];

    const rowsFiltered = rows.filter((x) => safeString(x.v).length > 0);

    const vars = buildTemplateVars();
    const templates = getTemplates();

    const defaultLegalCheckbox = {
      de:
        `Ich bestätige, dass meine Angaben korrekt und vollständig sind und akzeptiere die <a href="{{agb_url}}" target="_blank" rel="noopener">AGB</a> sowie die <a href="{{widerruf_url}}" target="_blank" rel="noopener">Widerrufsbelehrung</a> von <b>{{anbieter}}</b>.`,
      en: `I confirm that my information is correct and complete and I accept the <a href="{{agb_url}}" target="_blank" rel="noopener">terms and conditions</a> as well as the <a href="{{widerruf_url}}" target="_blank" rel="noopener">withdrawal information</a> of <b>{{anbieter}}</b>.`,
    };

    const legalCheckboxRaw = templates?.legal_checkbox_label_i18n ? t(templates.legal_checkbox_label_i18n) : t(defaultLegalCheckbox);
    const legalCheckboxLabel = renderTemplate(legalCheckboxRaw, { ...vars });
    if (state.ewvLegal) {
      const markup = document.createElement("template");
      markup.innerHTML = legalCheckboxLabel;
      const links = Array.from(markup.content.querySelectorAll("a"));
      if (links.length !== 2 || links.some(link => link.href !== state.providerLinks.agb_url) ||
          (!markup.content.textContent.includes(state.ewvLegal.legal_name) ||
           markup.content.textContent.includes(state.ewvLegal.legal_name + " Stolberg"))) {
        const error = new Error("Die Einwilligung enthält keine eindeutigen EWV-Vertragslinks. Bitte kontaktiere uns.");
        error.code = "ewv_contract_docs_unavailable";
        throw error;
      }
    }

    const providerName = getOrderProviderName();
    const mediatorName = getMediatorName();

    const providerDatUrl = normalizeUrl(state.providerLinks.datenschutz_url);
    const mediatorDatUrl = String(
      urlCfg().mediator_datenschutz_url ||
        window.KUNDEN_DATA?.datenschutz_url ||
        (state.ewvLegal ? new URL("/datenschutz", window.location.origin).href : "#")
    ).trim();
    if (state.ewvLegal && !/^https?:\/\//.test(normalizeUrl(mediatorDatUrl))) {
      const error = new Error("Die Datenschutzhinweise des Vermittlers sind nicht verfügbar. Bitte kontaktiere uns.");
      error.code = "ewv_contract_docs_unavailable";
      throw error;
    }

    const providerLink = `<a href="${escapeHtml(providerDatUrl)}" target="_blank" rel="noopener">${escapeHtml(providerName || t({ de: "Anbieter", en: "provider" }))}</a>`;
    const mediatorPrivacyHref = state.ewvLegal ? normalizeUrl(mediatorDatUrl) : mediatorDatUrl;
    if (state.ewvLegal) state.mediatorLinks.datenschutz_url = mediatorPrivacyHref;
    const mediatorLink = `<a href="${escapeHtml(mediatorPrivacyHref)}" target="_blank" rel="noopener">${escapeHtml(mediatorName)}</a>`;

    const privacyI18n = {
      de:
        `Ich bestätige, die Datenschutzerklärungen von ${providerLink} sowie ${mediatorLink} zur Kenntnis genommen zu haben. ` +
        `Ich willige ein, dass meine angegebenen Daten zum Zweck der Tarifvermittlung, Vertragsdurchführung und Kundenbetreuung an den Anbieter übermittelt und dort verarbeitet werden.`,
      en:
        `I confirm that I have read the privacy policies of ${providerLink} and ${mediatorLink}. ` +
        `I consent to my data being transferred to the provider and processed there for brokerage, contract execution, and customer support.`,
      tr:
        `${providerLink} ve ${mediatorLink} gizlilik politikalarını okuduğumu onaylıyorum. ` +
        `Verilerimin tarife aracılığı, sözleşme yürütümü ve müşteri desteği amacıyla sağlayıcıya iletilmesini ve orada işlenmesini kabul ediyorum.`,
      ru:
        `Подтверждаю, что ознакомился(лась) с политикой конфиденциальности ${providerLink} и ${mediatorLink}. ` +
        `Согласен(на) на передачу и обработку данных у поставщика для подбора тарифа, исполнения договора и поддержки.`,
      ar:
        `أؤكد أنني اطلعت على سياسات الخصوصية لدى ${providerLink} و ${mediatorLink}. ` +
        `وأوافق على نقل بياناتي إلى المزوّد ومعالجتها لغرض الوساطة، تنفيذ العقد، وخدمة العملاء.`,
      it:
        `Confermo di aver letto le informative privacy di ${providerLink} e ${mediatorLink}. ` +
        `Acconsento al trasferimento dei miei dati al fornitore e al loro trattamento per mediazione, esecuzione del contratto e assistenza.`,
      zh:
        `我确认已阅读 ${providerLink} 与 ${mediatorLink} 的隐私声明，并同意将我的数据为费率撮合、合同履行与客户服务之目的传输给供应商并由其处理。`,
      hi:
        `मैं पुष्टि करता/करती हूँ कि मैंने ${providerLink} और ${mediatorLink} की गोपनीयता नीतियाँ पढ़ ली हैं। ` +
        `मैं सहमति देता/देती हूँ कि मेरी जानकारी टैरिफ़ मध्यस्थता, अनुबंध निष्पादन और ग्राहक सहायता हेतु प्रदाता को भेजी जाए और वहाँ प्रोसेस की जाए।`,
      es:
        `Confirmo que he leído las políticas de privacidad de ${providerLink} y ${mediatorLink}. ` +
        `Consiento que mis datos se transmitan al proveedor y se traten allí para intermediación, ejecución del contrato y atención al cliente.`,
      fr:
        `Je confirme avoir pris connaissance des politiques de confidentialité de ${providerLink} et ${mediatorLink}. ` +
        `J’accepte que mes données soient transmises au fournisseur et traitées pour la médiation, l’exécution du contrat et le support client.`,
      nl:
        `Ik bevestig dat ik het privacybeleid van ${providerLink} en ${mediatorLink} heb gelezen. ` +
        `Ik geef toestemming dat mijn gegevens aan de aanbieder worden doorgegeven en daar worden verwerkt voor bemiddeling, uitvoering en support.`,
      pl:
        `Potwierdzam, że zapoznałem/-am się z politykami prywatności ${providerLink} oraz ${mediatorLink}. ` +
        `Wyrażam zgodę na przekazanie danych do dostawcy i ich przetwarzanie w celu pośrednictwa, realizacji umowy i obsługi.`,
    };

    const prevCons = state.answers.summary_consents || {};
    const legalChecked = !!prevCons.legal;
    const privacyChecked = !!prevCons.privacy;

    const ct = safeString(state.orderRow?.case_type);
    const isMove = ct === "umzug";

    const cancelAns = state.answers.contract_cancelled || "";
    const cancelVal =
      cancelAns === "ja"
        ? t({ de: "Ja", en: "Yes", tr: "Evet", ru: "Да", ar: "نعم", it: "Sì", zh: "是", hi: "हाँ", es: "Sí", fr: "Oui", nl: "Ja", pl: "Tak" })
        : cancelAns === "nein"
          ? t({ de: "Nein", en: "No", tr: "Hayır", ru: "Нет", ar: "لا", it: "No", zh: "否", hi: "नहीं", es: "No", fr: "Non", nl: "Nee", pl: "Nie" })
          : "";

    const editRows = [
      {
        key: t({ de: "Vertragspartner", en: "Contract partner", tr: "Sözleşme sahibi", ru: "Владелец договора", ar: "صاحب العقد", it: "Intestatario", zh: "签约人", hi: "अनुबंध धारक", es: "Titular", fr: "Titulaire", nl: "Contracthouder", pl: "Strona umowy" }),
        val: `${safeString(state.orderRow?.vorname)} ${safeString(state.orderRow?.nachname)}`.trim(),
        step: "partner",
      },
      {
        key: t({ de: "Adresse", en: "Address", tr: "Adres", ru: "Адрес", ar: "العنوان", it: "Indirizzo", zh: "地址", hi: "पता", es: "Dirección", fr: "Adresse", nl: "Adres", pl: "Adres" }),
        val: `${safeString(state.orderRow?.strasse)} ${safeString(state.orderRow?.hausnummer)}, ${safeString(state.orderRow?.plz)} ${safeString(state.orderRow?.stadt)}`.replace(/\s+,/g, ",").trim(),
        step: "delivery_address",
      },
      {
        key: t({ de: "Wechselgrund", en: "Reason for switching", tr: "Değişim nedeni", ru: "Причина смены", ar: "سبب التبديل", it: "Motivo del cambio", zh: "更换原因", hi: "बदलने का कारण", es: "Motivo del cambio", fr: "Raison du changement", nl: "Reden om te wisselen", pl: "Powód zmiany" }),
        val: translateCaseType(state.orderRow?.case_type),
        step: "purpose",
      },
      {
        key: t({ de: "Kundennummer", en: "Customer number", tr: "Müşteri no", ru: "Номер клиента", ar: "رقم العميل", it: "Numero cliente", zh: "客户号", hi: "ग्राहक नंबर", es: "Nº cliente", fr: "N° client", nl: "Klantnummer", pl: "Nr klienta" }),
        val: safeString(state.orderRow?.kundennummer_aktuell || ""),
        step: "customer_number",
      },
      {
        key: t({ de: "Vertrag gekündigt", en: "Contract cancelled", tr: "Sözleşme iptal edildi", ru: "Договор расторгнут", ar: "تم إلغاء العقد", it: "Contratto disdetto", zh: "合同已取消", hi: "अनुबंध रद्द", es: "Contrato cancelado", fr: "Contrat résilié", nl: "Contract opgezegd", pl: "Umowa wypowiedziana" }),
        val: isMove ? "" : cancelVal,
        step: "contract_cancelled",
      },
      {
        key: t({ de: "Kündigungsdatum", en: "Cancellation date", tr: "İptal tarihi", ru: "Дата расторжения", ar: "تاريخ الإلغاء", it: "Data disdetta", zh: "取消日期", hi: "रद्द करने की तिथि", es: "Fecha de cancelación", fr: "Date de résiliation", nl: "Opzegdatum", pl: "Data wypowiedzenia" }),
        val: isMove ? "" : safeString(state.answers.contract_cancel_date ? toDDMMYYYY(state.answers.contract_cancel_date) : ""),
        step: "contract_cancel_date",
      },
      {
        key: t({ de: "Einzugsdatum", en: "Move-in date", tr: "Taşınma tarihi", ru: "Дата заселения", ar: "تاريخ الانتقال", it: "Data ingresso", zh: "入住日期", hi: "प्रवेश तिथि", es: "Fecha de entrada", fr: "Date d’emménagement", nl: "Inhuisdatum", pl: "Data wprowadzenia" }),
        val: safeString(state.orderRow?.einzugsdatum ? toDDMMYYYY(state.orderRow?.einzugsdatum) : ""),
        step: "move_in_date",
      },
      {
        key: t({ de: "Zählernummer", en: "Meter number", tr: "Sayaç no", ru: "Номер счётчика", ar: "رقم العداد", it: "Numero contatore", zh: "表号", hi: "मीटर नंबर", es: "Nº contador", fr: "N° compteur", nl: "Meternummer", pl: "Numer licznika" }),
        val: safeString(state.orderRow?.meter_number || ""),
        step: "meter_number",
      },
      {
        key: t({ de: "IBAN", en: "IBAN", tr: "IBAN", ru: "IBAN", ar: "IBAN", it: "IBAN", zh: "IBAN", hi: "IBAN", es: "IBAN", fr: "IBAN", nl: "IBAN", pl: "IBAN" }),
        val: safeString(state.orderRow?.iban || ""),
        step: "iban",
      },
    ];

    const editFiltered = editRows.filter((x) => safeString(x.val).length > 0);

    return `
      <div class="summary-card">
        <div class="summary-title">${escapeHtml(t({de:"Tarifübersicht",en:"Tariff overview",tr:"Tarife özeti",ru:"Обзор тарифа",ar:"ملخص التعرفة",it:"Riepilogo tariffa",zh:"费率概览",hi:"टैरिफ़ सारांश",es:"Resumen de tarifa",fr:"Récapitulatif du tarif",nl:"Tariefoverzicht",pl:"Podsumowanie taryfy"}))}</div>
        <div class="summary-grid">
          ${rowsFiltered
            .map(
              (row) => `
              <div class="summary-row">
                <div class="summary-k">${escapeHtml(row.k)}</div>
                <div class="summary-v">${escapeHtml(String(row.v))}</div>
              </div>
            `
            )
            .join("")}
        </div>
      </div>

      <div class="edit-card">
        <div class="edit-title">${escapeHtml(ui("editDetailsTitle"))}</div>
        <div class="summary-grid">
          ${editFiltered
            .map(
              (row) => `
              <div class="edit-row">
                <div class="edit-left">
                  <div class="edit-k">${escapeHtml(row.key)}</div>
                  <div class="edit-v">${escapeHtml(row.val)}</div>
                </div>
                <button class="edit-btn" type="button" data-edit-step="${escapeHtml(row.step)}">${escapeHtml(ui("edit"))}</button>
              </div>
            `
            )
            .join("")}
        </div>
      </div>

      <div style="width:100%; display:flex; flex-direction:column; gap:10px; margin-top: 12px;">
        <label class="consent-row">
          <input type="checkbox" data-consent-id="legal" ${legalChecked ? "checked" : ""} />
          <span class="consent-text">${legalCheckboxLabel}</span>
        </label>

        <label class="consent-row">
          <input type="checkbox" data-consent-id="privacy" ${privacyChecked ? "checked" : ""} />
          <span class="consent-text">${privacyI18n[state.language] || privacyI18n.de}</span>
        </label>
      </div>
    `;
  };

  const renderSignaturePad = () => {
    const templates = getTemplates();
    const vars = buildTemplateVars();

    const hintRaw = templates?.signature_hint_i18n ? t(templates.signature_hint_i18n) : t(UI.signatureHintDefault);
    const hintTemplated = renderTemplate(hintRaw, vars);
    if (state.ewvLegal && (!hintTemplated.includes(state.ewvLegal.legal_name) ||
        hintTemplated.includes(state.ewvLegal.legal_name + " Stolberg"))) {
      const error = new Error("Der Unterschriftshinweis enthält keinen eindeutigen EWV-Rechtsnamen. Bitte kontaktiere uns.");
      error.code = "ewv_contract_docs_unavailable";
      throw error;
    }

    const clearLabel =
      state.language === "de"
        ? "Löschen"
        : t({ en: "Clear", tr: "Sil", ru: "Очистить", ar: "مسح", it: "Cancella", zh: "清除", hi: "हटाएँ", es: "Borrar", fr: "Effacer", nl: "Wissen", pl: "Wyczyść" });

    return `
      <div style="width:100%;">
        <div style="margin-bottom:10px; font-size:0.86rem; color:#475569; font-weight:750; line-height:1.35rem; white-space:pre-line;">
          ${escapeHtml(hintTemplated)}
        </div>

        <div class="sig-shell">
          <div class="sig-topbar">
            <button id="sig-clear" type="button" class="sig-clear-link">${escapeHtml(clearLabel)}</button>
          </div>
          <canvas id="sig-canvas" style="width:100%; height:180px; display:block; border-radius: 14px; background:#f8fafc; border:1px dashed #cbd5e1;"></canvas>
        </div>
      </div>
    `;
  };

  const renderContent = (step) => {
    if (!step) return "";
    if (step.type === "partner_form") return renderPartnerForm();
    if (step.type === "address_form") return renderAddressForm();
    if (step.type === "date_input") return renderDateInput(step);
    if (step.type === "text_input") return renderTextInput(step, state.answers[step.id]);
    if (step.type === "single_choice") return renderSingleChoice(step);
    if (step.type === "single_choice_with_hint") return renderSingleChoiceWithHint(step);
    if (step.type === "meter_number_input") return renderMeterNumberInput(step);
    if (step.type === "iban_input") return renderIbanInput(step);
    if (step.type === "summary_view") return renderSummary();
    if (step.type === "signature_pad") return renderSignaturePad();
    return "";
  };

  // -------------------------
  // Validation per step
  // -------------------------
  const validateStep = (step) => {
    if (!step) return { ok: false, msg: ui("invalid") };

    if (step.type === "partner_form") {
      const anrede = safeString(document.getElementById("p-anrede")?.value).toLowerCase();
      const vorname = safeString(document.getElementById("p-vorname")?.value);
      const nachname = safeString(document.getElementById("p-nachname")?.value);
      const geburtsdatumRaw = safeString(document.getElementById("p-geburtsdatum")?.value);
      const geburtsdatum = toDDMMYYYY(geburtsdatumRaw);

      if (!anrede || !vorname || !nachname || !geburtsdatum) return { ok: false, msg: ui("required") };
      if (!isValidDDMMYYYY(geburtsdatum)) return { ok: false, msg: ui("invalid") };
      return { ok: true, value: { anrede, vorname, nachname, geburtsdatum } };
    }

    if (step.type === "address_form") {
      const strasse = safeString(document.getElementById("ad-strasse")?.value);
      const hausnummer = safeString(document.getElementById("ad-hausnummer")?.value);
      const plz = safeString(document.getElementById("ad-plz")?.value);
      const stadt = safeString(document.getElementById("ad-stadt")?.value);
      const email = safeString(document.getElementById("ad-email")?.value);
      const phoneNational = safeString(document.getElementById("ad-phone-national")?.value);

      if (!strasse || !hausnummer || !plz || !stadt || !email || !phoneNational) return { ok: false, msg: ui("required") };
      if (!/^\d{4,6}$/.test(plz)) return { ok: false, msg: ui("invalid") };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, msg: ui("invalid") };
      const e164 = normalizeToE164DE(phoneNational);
      if (!e164 || !/^\+49\d{6,}$/.test(e164)) return { ok: false, msg: ui("invalid") };

      return { ok: true, value: { strasse, hausnummer, plz, stadt, email, phone_national: normalizeToNationalDE(phoneNational) } };
    }

    if (step.type === "date_input") {
      const raw = safeString(document.getElementById("date-input")?.value);
      const val = toDDMMYYYY(raw);
      if (!val) return { ok: false, msg: ui("required") };
      if (!isValidDDMMYYYY(val)) return { ok: false, msg: ui("invalid") };
      return { ok: true, value: val };
    }

    if (step.type === "text_input") {
      const raw = safeString(document.getElementById("survey-input")?.value);
      if (step.required !== false && !raw) return { ok: false, msg: ui("required") };
      return { ok: true, value: raw };
    }

    if (step.type === "meter_number_input") {
      const raw = safeString(document.getElementById("meter-input")?.value);
      if (!raw) return { ok: false, msg: ui("required") };
      return { ok: true, value: raw };
    }

    if (step.type === "iban_input") {
      const raw = normalizeIban(document.getElementById("iban-input")?.value);
      if (!raw) return { ok: false, msg: ui("required") };
      if (!isValidIban(raw)) return { ok: false, msg: ui("invalid") };
      return { ok: true, value: raw };
    }

    if (step.type === "summary_view") {
      const wrap = document.getElementById("survey-app");
      if (wrap) {
        const legalCb = wrap.querySelector("input[type='checkbox'][data-consent-id='legal']");
        const privacyCb = wrap.querySelector("input[type='checkbox'][data-consent-id='privacy']");
        const legal = !!legalCb?.checked;
        const privacy = !!privacyCb?.checked;
        const next = { ...(state.answers.summary_consents || {}), legal, privacy };
        state.answers.summary_consents = next;

        if (!legal || !privacy) return { ok: false, msg: ui("required") };
        return { ok: true, value: next };
      }
      return { ok: false, msg: ui("invalid") };
    }

    if (step.type === "signature_pad") {
      if (!state.answers.signature && state.sig.hasUnsavedStroke) {
        forceSaveSignatureIfCanvasPresent();
      }
      const v = state.answers.signature || "";
      if (!v) return { ok: false, msg: ui("required") };
      return { ok: true, value: v };
    }

    return { ok: true, value: state.answers[step.id] };
  };

  // -------------------------
  // Signature helpers (force save on back)
  // -------------------------
  const forceSaveSignatureIfCanvasPresent = () => {
    try {
      const canvas = document.getElementById("sig-canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = Math.floor(rect.width * 2);
      exportCanvas.height = Math.floor(rect.height * 2);
      const ectx = exportCanvas.getContext("2d");
      ectx.fillStyle = "#ffffff";
      ectx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ectx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

      const dataUrl = exportCanvas.toDataURL("image/png");
      if (dataUrl && dataUrl.length > 2000) {
        state.answers.signature = dataUrl;
        state.sig.lastAutosaveDataUrl = dataUrl;
        persistBoundValue("closing_signature_data_url", dataUrl);
        state.sig.hasUnsavedStroke = false;
      }
    } catch (e) {
      console.warn("forceSaveSignatureIfCanvasPresent failed:", e?.message || e);
    }
  };

  // -------------------------
  // Navigation
  // -------------------------
  window.surveyBack = function () {
    if (state.currentStep === "signature") forceSaveSignatureIfCanvasPresent();

    if (!state.history.length) return;
    const prev = state.history.pop();
    state.currentStep = prev;
    render();
  };

  const goNext = async () => {
    const step = stepById(state.currentStep);
    if (!step) return;

    if (step.type === "signature_pad") {
      forceSaveSignatureIfCanvasPresent();
    }

    const v = validateStep(step);
    if (!v.ok) {
      showError(v.msg || ui("invalid"));
      return;
    }
    showError("");

    state.answers[step.id] = v.value;

    if (step.type === "partner_form") {
      persistBoundValue("anrede", v.value.anrede);
      persistBoundValue("vorname", v.value.vorname);
      persistBoundValue("nachname", v.value.nachname);
      persistBoundValue("geburtsdatum", v.value.geburtsdatum);
    }
    if (step.type === "address_form") {
      persistBoundValue("strasse", v.value.strasse);
      persistBoundValue("hausnummer", v.value.hausnummer);
      persistBoundValue("plz", v.value.plz);
      persistBoundValue("stadt", v.value.stadt);
      persistBoundValue("email", v.value.email);
      const e164 = normalizeToE164DE(v.value.phone_national);
      persistBoundValue("phone_e164", e164);
    }

    if (step.type === "summary_view") {
      persistBoundValue("consent_accepted", !!v.value.legal);
      persistBoundValue("closing_privacy_accepted", !!v.value.privacy);
    }

    if (step.id === "price_increase_received") {
      const boolVal = v.value === "ja";
      persistBoundValue("preiserhoehung_erhalten", boolVal);
    } else if (step.id === "contract_cancelled") {
      const ct = safeString(state.orderRow?.case_type);
      if (ct !== "umzug") {
        const boolVal = v.value === "ja";
        persistClosingPayloadField("contract_cancelled", boolVal);
        if (!boolVal) persistClosingPayloadField("contract_cancel_date", "");
      }
    } else if (step.id === "contract_cancel_date") {
      const ct = safeString(state.orderRow?.case_type);
      if (ct !== "umzug") {
        persistClosingPayloadField("contract_cancel_date", v.value);
      }
    } else if (step.bind_column) {
      persistBoundValue(step.bind_column, v.value);
    }

    const next = typeof step.next === "function" ? step.next() : step.next;

    if (next === "END") {
      await submitClosing();
      return;
    }

    const ct = safeString(state.orderRow?.case_type);
    if (next === "contract_cancelled" && ct === "umzug") {
      state.history.push(state.currentStep);
      state.currentStep = "meter_known";
      render();
      return;
    }

    if (next === "contract_cancel_date" && ct === "umzug") {
      state.history.push(state.currentStep);
      state.currentStep = "meter_known";
      render();
      return;
    }

    state.history.push(state.currentStep);
    state.currentStep = next;
    render();
  };

  // -------------------------
  // Submit (proxy -> n8n) + redirect
  // -------------------------
  const THANK_YOU_URL = String(urlCfg().closing_success_url || "/auftrag-eingegangen");

  const submitClosing = async () => {
    if (state.isSubmitting) return;
    try {
      await enforceOecherEwvLegalLinks();
      if (state.ewvLegal) { renderSummary(); renderSignaturePad(); }
    } catch (error) {
      const container = document.getElementById("survey-app");
      if (container) container.innerHTML = `<div class="survey-card-container"><p class="survey-question">${escapeHtml(error?.message || "Vertragsunterlagen nicht verfügbar")}</p></div>`;
      return; // Never post an EWV closing with missing/mismatched legal PDFs.
    }
    state.isSubmitting = true;

    const container = document.getElementById("survey-app");
    if (container) {
      container.innerHTML = `
        <div class="survey-card-container">
          <div class="tb-loading">
            <div class="tb-spinner"></div>
            <div style="font-weight:1000; color:#0f172a; text-align:center;">${escapeHtml(ui("successTitle"))}</div>
          </div>
        </div>
      `;
    }

    const submission_id = newSubmissionId();

    const da = state.answers.delivery_address || {};
    const phone_e164 = normalizeToE164DE(da.phone_national || "");

    const signatureDataUrl = safeString(state.answers.signature || "");
    const canonicalMalo = safeString(state.answers.malo || state.answers.malo_id || "");
    const canonicalIban = normalizeIban(state.answers.iban || "");
    if (!canonicalMalo && isMaloRequired()) {
      logValidationWarning("missing-malo", { required: true, hasUuid: !!state.uuid });
    }
    if (!canonicalIban && isIbanRequired()) {
      logValidationWarning("missing-iban", { required: true, hasUuid: !!state.uuid });
    }
    const payload = {
      meta: {
        submission_id,
        session_id: state.sessionId,
        ts: new Date().toISOString(),
        language: state.language,
        uuid: state.uuid,
        location_id: state.locationId,
        client_id: window.KUNDEN_DATA?.client_id ?? null,
      },
      answers: {
        ...state.answers,
        iban: canonicalIban,
        malo: canonicalMalo,
        delivery_address: {
          ...(state.answers.delivery_address || {}),
          phone_e164,
        },
      },
      legacy_signature_data_url: signatureDataUrl,
      closing_signature_data_url: signatureDataUrl,
      provider_links: state.providerLinks,
      mediator_links: state.mediatorLinks,
      order_snapshot: state.ewvLegal ? {
        ...state.orderRow,
        provider_legal_name: state.ewvLegal.legal_name,
        provider_links: { ...state.providerLinks },
        tarif_snapshot: {
          ...state.orderRow.tarif_snapshot,
          provider_legal_name: state.ewvLegal.legal_name,
          provider_links: { ...state.providerLinks },
          legal_document: { ...state.ewvLegal },
        },
      } : state.orderRow || null,
    };

    const proxyUrl =
      window.SURVEY_CONFIG.closingProxyPath ||
      "https://oynhnhkldvpoqhsfirwf.supabase.co/functions/v1/closing-proxy";
    if (!proxyUrl) throw new Error("Missing closing proxy path");

    try {
      if (!isValidUuid(state.uuid)) {
        throw new Error("Missing or invalid uuid");
      }
      if (!signatureDataUrl) {
        logValidationWarning("upload-failure", { reason: "missing-signature-data", hasUuid: !!state.uuid });
        throw new Error("Missing signature data");
      }
      const supabaseClientKey = resolveSupabaseClientKey();
      const headers = { "Content-Type": "application/json" };
      if (supabaseClientKey) {
        headers.apikey = supabaseClientKey;
        headers.Authorization = `Bearer ${supabaseClientKey}`;
      } else {
        console.warn("[closing-survey] no supabase client key found for closing submit");
      }

      console.log("[closing-survey] submitting to closing-proxy");
      const response = await fetch(proxyUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      console.log("[closing-survey] closing-proxy status", response.status);

      let responseJson = null;
      try {
        responseJson = await response.json();
      } catch (_) {
        responseJson = null;
      }
      console.log("[closing-survey] closing-proxy response", responseJson);

      if (!response.ok) {
        logValidationWarning("upload-failure", { status: response.status, hasUuid: !!state.uuid });
        throw new Error(`closing-proxy returned ${response.status}`);
      }
      setTimeout(() => navigateTop(THANK_YOU_URL), 650);
    } catch (e) {
      console.warn("[closing-survey] closing submit failed", e);
      state.isSubmitting = false;
      if (container) {
        container.innerHTML = `
          <div class="survey-card-container">
            <div class="tb-card">
              <div style="font-weight:1000; color:#ef4444; text-align:center; margin-bottom:8px;">${escapeHtml(ui("loadError"))}</div>
              <div style="text-align:center; margin-bottom:12px;">${escapeHtml(ui("invalid"))}</div>
              <div style="display:flex; justify-content:center;">
                <button class="tb-btn" type="button" onclick="window.location.reload()">${escapeHtml(ui("next"))}</button>
              </div>
            </div>
          </div>
        `;
      }
    }
  };

  // -------------------------
  // Behaviors per step
  // -------------------------
  const attachBehaviors = async (step) => {
    if (!step) return;

    if (typeof state.sig.cleanup === "function") {
      try { state.sig.cleanup(); } catch {}
      state.sig.cleanup = null;
    }

    if (step.type === "partner_form") {
      const a = document.getElementById("p-anrede");
      const v = document.getElementById("p-vorname");
      const n = document.getElementById("p-nachname");
      const b = document.getElementById("p-geburtsdatum");

      a?.addEventListener("change", () => {
        const anrede = safeString(a.value).toLowerCase();
        state.answers.partner = { ...(state.answers.partner || {}), anrede };
        persistBoundValue("anrede", anrede);
      });

      v?.addEventListener("input", () => {
        state.answers.partner = { ...(state.answers.partner || {}), vorname: safeString(v.value) };
        persistBoundValue("vorname", safeString(v.value));
      });

      n?.addEventListener("input", () => {
        state.answers.partner = { ...(state.answers.partner || {}), nachname: safeString(n.value) };
        persistBoundValue("nachname", safeString(n.value));
      });

      if (b) {
        await ensureFlatpickr();
        enforceDDMMYYYYTyping(b);

        const loc = langToFlatpickrLocale(state.language);
        const fpLocale = loc && window.flatpickr?.l10ns?.[loc] ? window.flatpickr.l10ns[loc] : null;

        window.flatpickr(b, {
          allowInput: true,
          dateFormat: "d.m.Y",
          defaultDate: isValidDDMMYYYY(b.value) ? b.value : null,
          locale: fpLocale || undefined,
          clickOpens: true,
          monthSelectorType: "dropdown",
          shorthandCurrentMonth: false,
          disableMobile: true,
          onChange: (_selectedDates, dateStr) => {
            b.value = dateStr;
            const val = toDDMMYYYY(dateStr);
            state.answers.partner = { ...(state.answers.partner || {}), geburtsdatum: val };
            persistBoundValue("geburtsdatum", val);
          },
        });

        b.addEventListener("blur", () => {
          b.value = toDDMMYYYY(b.value);
          if (isValidDDMMYYYY(b.value)) {
            state.answers.partner = { ...(state.answers.partner || {}), geburtsdatum: b.value };
            persistBoundValue("geburtsdatum", b.value);
          }
        });
      }
    }

    if (step.type === "date_input") {
      await ensureFlatpickr();
      const input = document.getElementById("date-input");
      if (!input) return;

      enforceDDMMYYYYTyping(input);

      const loc = langToFlatpickrLocale(state.language);
      const fpLocale = loc && window.flatpickr?.l10ns?.[loc] ? window.flatpickr.l10ns[loc] : null;

      window.flatpickr(input, {
        allowInput: true,
        dateFormat: "d.m.Y",
        defaultDate: isValidDDMMYYYY(input.value) ? input.value : null,
        locale: fpLocale || undefined,
        monthSelectorType: "dropdown",
        disableMobile: true,
        onChange: (_selectedDates, dateStr) => {
          input.value = dateStr;
        },
      });

      input.addEventListener("blur", () => {
        input.value = toDDMMYYYY(input.value);
      });
    }

    if (step.type === "address_form") {
      const s = document.getElementById("ad-strasse");
      const h = document.getElementById("ad-hausnummer");
      const p = document.getElementById("ad-plz");
      const c = document.getElementById("ad-stadt");
      const em = document.getElementById("ad-email");
      const ph = document.getElementById("ad-phone-national");

      const sync = () => {
        state.answers.delivery_address = {
          strasse: safeString(s?.value),
          hausnummer: safeString(h?.value),
          plz: safeString(p?.value),
          stadt: safeString(c?.value),
          email: safeString(em?.value),
          phone_national: normalizeToNationalDE(ph?.value),
        };
      };

      s?.addEventListener("input", () => { sync(); persistBoundValue("strasse", safeString(s.value)); });
      h?.addEventListener("input", () => { sync(); persistBoundValue("hausnummer", safeString(h.value)); });
      p?.addEventListener("input", () => { sync(); persistBoundValue("plz", safeString(p.value)); });
      c?.addEventListener("input", () => { sync(); persistBoundValue("stadt", safeString(c.value)); });

      em?.addEventListener("input", () => { sync(); persistBoundValue("email", safeString(em.value)); });

      ph?.addEventListener("input", () => {
        const normalized = normalizeToNationalDE(ph.value);
        if (ph.value !== normalized) ph.value = normalized;
        sync();
        const e164 = normalizeToE164DE(normalized);
        if (e164) persistBoundValue("phone_e164", e164);
      });
    }

    if (step.type === "meter_number_input") {
      const input = document.getElementById("meter-input");
      input?.addEventListener("input", () => {
        state.answers[step.id] = safeString(input.value);
        if (step.bind_column) persistBoundValue(step.bind_column, safeString(input.value));
      });

      const btn = document.getElementById("meter-info-btn");
      btn?.addEventListener("click", () => {
        const { img, text } = meterInfo();
        showOverlay(`
          <img class="tb-ov-img" src="${escapeHtml(img)}" alt="meter info"/>
          <div class="tb-ov-text">${escapeHtml(t(text))}</div>
        `);
      });
    }

    if (step.type === "iban_input") {
      const input = document.getElementById("iban-input");
      if (!input) return;

      const format = (s) => normalizeIban(s).replace(/(.{4})/g, "$1 ").trim();

      input.addEventListener("input", () => {
        state.answers[step.id] = normalizeIban(input.value);
      });

      input.addEventListener("blur", () => {
        const raw = normalizeIban(input.value);
        input.value = format(raw);
        state.answers[step.id] = raw;
        if (step.bind_column) persistBoundValue(step.bind_column, raw);
      });
    }

    if (step.type === "summary_view") {
      const wrap = document.getElementById("survey-app");
      if (!wrap) return;

      wrap.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", (e) => e.stopPropagation());
      });

      const prev = state.answers.summary_consents || {};
      state.answers.summary_consents = { ...prev };

      Array.from(wrap.querySelectorAll("input[type='checkbox'][data-consent-id]")).forEach((cb) => {
        cb.addEventListener("change", () => {
          const id = cb.getAttribute("data-consent-id");
          if (!id) return;
          const next = { ...(state.answers.summary_consents || {}), [id]: !!cb.checked };
          state.answers.summary_consents = next;

          if (id === "legal") persistBoundValue("consent_accepted", !!cb.checked);
          if (id === "privacy") persistBoundValue("closing_privacy_accepted", !!cb.checked);
        });
      });

      Array.from(wrap.querySelectorAll("button[data-edit-step]")).forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault?.();
          e.stopPropagation?.();
          const target = btn.getAttribute("data-edit-step");
          if (!target) return;
          state.history.push(state.currentStep);
          state.currentStep = target;
          render();
        });
      });
    }

    if (step.type === "signature_pad") {
      const canvas = document.getElementById("sig-canvas");
      const btnClear = document.getElementById("sig-clear");
      if (!canvas || !btnClear) return;

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const ctx = canvas.getContext("2d");

      const setup = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#0f172a";

        const saved = state.answers.signature;

        if (saved) {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, rect.width, rect.height);
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
          };
          img.src = saved;
        } else {
          ctx.clearRect(0, 0, rect.width, rect.height);
        }
      };

      let isDown = false;
      let last = null;
      let saveTimer = null;

      const getPos = (evt) => {
        const rect = canvas.getBoundingClientRect();
        const hasTouches = !!evt.touches && evt.touches.length;
        const hasChanged = !!evt.changedTouches && evt.changedTouches.length;
        const src = hasTouches ? evt.touches[0] : hasChanged ? evt.changedTouches[0] : evt;
        const x = (src.clientX) - rect.left;
        const y = (src.clientY) - rect.top;
        return { x, y };
      };

      const doSave = () => {
        try {
          const rect = canvas.getBoundingClientRect();
          const exportCanvas = document.createElement("canvas");
          exportCanvas.width = Math.floor(rect.width * 2);
          exportCanvas.height = Math.floor(rect.height * 2);
          const ectx = exportCanvas.getContext("2d");
          ectx.fillStyle = "#ffffff";
          ectx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
          ectx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

          const dataUrl = exportCanvas.toDataURL("image/png");
          state.answers.signature = dataUrl;
          state.sig.lastAutosaveDataUrl = dataUrl;
          persistBoundValue("closing_signature_data_url", dataUrl);
          state.sig.hasUnsavedStroke = false;
        } catch (e) {
          console.warn("signature save failed", e);
        }
      };

      const scheduleAutosave = () => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(doSave, 240);
      };

      const start = (evt) => {
        evt.preventDefault?.();
        isDown = true;
        last = getPos(evt);

        // ✅ ensure a single tap creates a visible dot (important on mobile)
        try {
          ctx.beginPath();
          ctx.arc(last.x, last.y, 0.8, 0, Math.PI * 2);
          ctx.fillStyle = "#0f172a";
          ctx.fill();
          ctx.closePath();
          state.sig.hasUnsavedStroke = true;
        } catch {}
      };

      const move = (evt) => {
        if (!isDown) return;
        evt.preventDefault?.();
        const p = getPos(evt);
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.closePath();
        last = p;
        state.sig.hasUnsavedStroke = true;
      };

      const end = (evt) => {
        evt.preventDefault?.();
        isDown = false;
        last = null;
        scheduleAutosave();
      };

      const onResize = () => setup();

      // ✅ pointer events first (best for mobile), fallback to touch/mouse
      const hasPointer = "PointerEvent" in window;

      if (hasPointer) {
        canvas.addEventListener("pointerdown", start, { passive: false });
        canvas.addEventListener("pointermove", move, { passive: false });
        window.addEventListener("pointerup", end, { passive: false });
        window.addEventListener("pointercancel", end, { passive: false });
      } else {
        canvas.addEventListener("mousedown", start);
        canvas.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);

        canvas.addEventListener("touchstart", start, { passive: false });
        canvas.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end, { passive: false });
        window.addEventListener("touchcancel", end, { passive: false });
      }

      window.addEventListener("resize", onResize);

      btnClear.addEventListener("click", (e) => {
        e.preventDefault?.();

        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = null;

        isDown = false;
        last = null;

        state.answers.signature = "";
        state.sig.lastAutosaveDataUrl = "";
        state.sig.hasUnsavedStroke = false;
        persistBoundValue("closing_signature_data_url", "");

        const rect = canvas.getBoundingClientRect();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);
      });

      setup();

      state.sig.cleanup = () => {
        try {
          if (saveTimer) clearTimeout(saveTimer);
          saveTimer = null;

          if (hasPointer) {
            canvas.removeEventListener("pointerdown", start);
            canvas.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", end);
            window.removeEventListener("pointercancel", end);
          } else {
            canvas.removeEventListener("mousedown", start);
            canvas.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", end);
            canvas.removeEventListener("touchstart", start);
            canvas.removeEventListener("touchmove", move);
            window.removeEventListener("touchend", end);
            window.removeEventListener("touchcancel", end);
          }

          window.removeEventListener("resize", onResize);
        } catch {}
      };
    }
  };

  // -------------------------
  // Render shell
  // -------------------------
  const render = async () => {
    const step = stepById(state.currentStep);
    const container = document.getElementById("survey-app");
    if (!container) return;

    if (!step) {
      container.innerHTML = `<div style="text-align:center;color:#ef4444;font-weight:900;">${escapeHtml(ui("invalid"))}</div>`;
      return;
    }

    if (["summary_view", "signature_pad"].includes(step.type)) {
      try {
        await enforceOecherEwvLegalLinks();
        // Validate configured consent markup before either consent or signature.
        if (state.ewvLegal) { renderSummary(); renderSignaturePad(); }
      } catch (error) {
        container.innerHTML = `<div class="survey-card-container"><p class="survey-question">${escapeHtml(error?.message || "Vertragsunterlagen nicht verfügbar")}</p></div>`;
        return;
      }
    }
    const showH2 = step.id !== "summary";

    container.innerHTML = `
      <div class="survey-card-container">
        <button onclick="window.surveyBack()" class="btn-back ${state.history.length ? "" : "hidden-v"}">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          ${escapeHtml(ui("back"))}
        </button>

        ${showH2 ? `<h2 class="survey-question">${escapeHtml(t(step.question))}</h2>` : `<div style="height:6px;"></div>`}

        <div style="width:100%">
          ${renderContent(step)}
          <div id="survey-error" class="hidden-v" style="margin-top:10px; font-size:0.9rem; text-align:center; color:#ef4444; font-weight:800;"></div>
        </div>

        ${renderFooter(step)}
      </div>
    `;

    if (step.type === "single_choice" || step.type === "single_choice_with_hint") {
      Array.from(container.querySelectorAll(".animated-card")).forEach((card) => {
        card.addEventListener("click", () => {
          const val = card.getAttribute("data-val") || "";
          const next = card.getAttribute("data-next") || step.next;

          state.answers[step.id] = val;

          if (step.id === "price_increase_received") {
            persistBoundValue("preiserhoehung_erhalten", val === "ja");
          } else if (step.id === "contract_cancelled") {
            const ct = safeString(state.orderRow?.case_type);
            if (ct !== "umzug") {
              const boolVal = val === "ja";
              persistClosingPayloadField("contract_cancelled", boolVal);
              if (!boolVal) persistClosingPayloadField("contract_cancel_date", "");
            }
          } else if (step.bind_column && step.persist_on_select) {
            persistBoundValue(step.bind_column, val);
          }

          showError("");

          const ct = safeString(state.orderRow?.case_type);
          if (next === "contract_cancelled" && ct === "umzug") {
            state.history.push(state.currentStep);
            state.currentStep = "meter_known";
            render();
            return;
          }
          if (next === "contract_cancel_date" && ct === "umzug") {
            state.history.push(state.currentStep);
            state.currentStep = "meter_known";
            render();
            return;
          }

          state.history.push(state.currentStep);
          state.currentStep = next;
          render();
        });
      });
    }

    const btn = document.getElementById("survey-primary-btn");
    if (btn) btn.addEventListener("click", goNext);

    await attachBehaviors(step);
    syncStepViewport();
  };

  // -------------------------
  // Init
  // -------------------------
  const loadOrderRow = async () => {
    if (!state.uuid || !state.locationId) {
      const error = new Error("Diese Tarifempfehlung wurde nicht gefunden.");
      error.code = "offer_not_found";
      throw error;
    }
    const client = supa();
    const { data, error } = await client
      .from("auftraege")
      .select("*")
      .eq("uuid", state.uuid)
      .eq("location_id", state.locationId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const notFoundError = new Error("Diese Tarifempfehlung wurde nicht gefunden.");
      notFoundError.code = "offer_not_found";
      throw notFoundError;
    }
    state.orderRow = data;
    state.orderLoaded = true;
  };

  const init = async () => {
    injectEngineStyles();
    applyClosingTheme();

    state.sessionId = cryptoRandomId();
    readUrlParams();

    if (!state.uuid) {
      document.getElementById("survey-app").innerHTML =
        `<div style="text-align:center;color:#ef4444;font-weight:1000;">${escapeHtml(ui("missingUuid"))}</div>`;
      return;
    }

    try {
      await loadOrderRow();
      state.language = resolveLanguage();

      state.mediatorLinks = {
        datenschutz_url: normalizeUrl(window.KUNDEN_DATA?.datenschutz_url),
        agb_url: normalizeUrl(window.KUNDEN_DATA?.agb_url),
        widerruf_url: normalizeUrl(window.KUNDEN_DATA?.widerruf_url),
      };

      await loadProviderLinks();
      await enforceOecherEwvLegalLinks();

      seedPrefills();

      state.currentStep = "partner";
      state.history = [];

      await render();
    } catch (e) {
      console.error("Init error:", e);
      const message = ["offer_not_found", "ewv_contract_docs_unavailable"].includes(e?.code) ? e.message : ui("loadError");
      document.getElementById("survey-app").innerHTML =
        `<div style="text-align:center;color:#ef4444;font-weight:1000;">${escapeHtml(message)}</div>`;
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
