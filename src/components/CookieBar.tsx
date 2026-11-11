import { type CSSProperties, useEffect, useState } from "react";
import { localizeOecherPublicText } from "@/lib/oecherPageTranslations";
import { useI18n } from "@/lib/i18n";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWebsiteConfig } from "@/lib/websiteConfig";

const CONSENT_KEY = "cookie-consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
const FALLBACK_PRIMARY_COLOR = "#2563eb";

const META_PIXEL_ID = "29052911387700886";
const META_PIXEL_SCRIPT_ID = "oecher-meta-pixel";
export const COOKIE_SETTINGS_OPEN_EVENT = "oecher:open-cookie-settings";

export const openCookieSettings = () => {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_OPEN_EVENT));
};

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: (...args: unknown[]) => void;
  loaded: boolean;
  version: string;
};

type MetaWindow = Window & {
  fbq?: MetaPixelFunction;
  _fbq?: MetaPixelFunction;
  gtag?: (command: string, action: string, settings: Record<string, string>) => void;
};

// Only the recorded opt-in enables marketing scripts for this customer.
const applyMarketingConsent = (accepted: boolean, isOecher: boolean) => {
  // Other tenants retain their own marketing integration and consent contract.
  if (!isOecher) return;
  const consent = accepted ? "granted" : "denied";
  const marketingWindow = window as MetaWindow;
  marketingWindow.gtag?.("consent", "update", {
    ad_storage: consent,
    ad_user_data: consent,
    ad_personalization: consent,
    analytics_storage: consent,
  });

  // This app may share generic components with other customer websites.
  // Only the Öcher tenant owns the Pixel and the offer-event bridge below.
  if (!accepted) {
    marketingWindow.fbq?.("consent", "revoke");
    return;
  }

  if (marketingWindow.fbq) {
    marketingWindow.fbq("consent", "grant");
    window.dispatchEvent(new Event("oecher:marketing-consent-updated"));
    return;
  }

  // Install the Meta base pixel only AFTER an explicit marketing opt-in.
  // UpHex Smart Tracking is intentionally NOT loaded here, avoiding duplicates.
  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  }) as MetaPixelFunction;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  marketingWindow.fbq = fbq;
  marketingWindow._fbq = fbq;

  const script = document.createElement("script");
  script.id = META_PIXEL_SCRIPT_ID;
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
  window.dispatchEvent(new Event("oecher:marketing-consent-updated"));
};

const getCookieDomain = (_hostname: string) => undefined;

const getCookieValue = (name: string) => {
  const prefix = `${name}=`;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }
  return null;
};

const setConsentStorage = (value: "all" | "essential") => {
  localStorage.setItem(CONSENT_KEY, value);

  const cookieParts = [
    `${CONSENT_KEY}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];

  const cookieDomain = getCookieDomain(window.location.hostname);
  if (cookieDomain) {
    cookieParts.push(`Domain=${cookieDomain}`);
  }

  if (window.location.protocol === "https:") {
    cookieParts.push("Secure");
  }

  document.cookie = cookieParts.join("; ");
};

export const CookieBar = () => {
  const { t, withLang, lang } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const { getText, design, tenant } = useWebsiteConfig();
  const isOecher = tenant?.customer === "oecher";
  const cookieText = (path: string, fallback: string) => {
    const value = getText(path, fallback, isOecher ? lang : undefined);
    return isOecher && path.startsWith("cookie.") ? localizeOecherPublicText(value, lang) : value;
  };
  const primaryColor =
    (design?.colors as Record<string, unknown> | undefined)?.primary?.toString().trim() ||
    FALLBACK_PRIMARY_COLOR;

  useEffect(() => {
    const localConsent = localStorage.getItem(CONSENT_KEY);
    const cookieConsent = getCookieValue(CONSENT_KEY);
    const consent = localConsent || cookieConsent;

    if (!consent) {
      setIsVisible(true);
      return;
    }

    if (!localConsent && cookieConsent) {
      localStorage.setItem(CONSENT_KEY, cookieConsent);
    }

    setMarketingAccepted(consent === "all");
    applyMarketingConsent(consent === "all", isOecher);
  }, [isOecher]);

  useEffect(() => {
    const openSettings = () => {
      const consent = localStorage.getItem(CONSENT_KEY) || getCookieValue(CONSENT_KEY);
      setMarketingAccepted(consent === "all");
      setIsVisible(true);
    };

    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, openSettings);
  }, []);

  const handleAcceptAll = () => {
    setConsentStorage("all");
    applyMarketingConsent(true, isOecher);
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    setConsentStorage(marketingAccepted ? "all" : "essential");
    applyMarketingConsent(marketingAccepted, isOecher);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/35 flex items-end sm:items-center justify-center p-3 sm:p-5">
      <div role="dialog" aria-modal="true" aria-labelledby="oecher-cookie-title" className="bg-white rounded-2xl w-full max-w-2xl max-h-[72vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-4 sm:p-6 overflow-y-auto">
          <h2 id="oecher-cookie-title" className="text-lg sm:text-xl font-bold mb-3 text-slate-900">{cookieText("cookie.title", "Privatsphäre-Einstellungen")}</h2>

          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            <p>
              {cookieText("cookie.copy_intro", "Um Ihnen ein optimales Website-Erlebnis zu bieten, verwendet")}{" "}
              <span className="text-blue-600">{cookieText("brand.name", "Energieassistent")}</span> {cookieText("cookie.copy_intro_suffix", "Cookies und ähnliche Technologien.")}
            </p>

            <p>
              <strong>{cookieText("cookie.essential_label", "Essenzielle Cookies")}</strong> {cookieText("cookie.essential_copy", "sind für die Funktion der Website notwendig und können nicht deaktiviert werden.")}{" "}
              <strong>{cookieText("cookie.marketing_label", "Marketing Cookies")}</strong> {cookieText("cookie.marketing_copy", "helfen uns, Inhalte und Angebote für Sie zu verbessern.")}
            </p>

            <p className="text-xs text-slate-500">
              {cookieText("cookie.more_info", "Weitere Informationen finden Sie in der")}{" "}
              <Link to={withLang("/datenschutz")} className="text-blue-600 hover:underline">
                {cookieText("cookie.privacy_link", "Datenschutzerklärung")}
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-6 bg-white">
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex flex-wrap items-center gap-5 mb-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 text-sm">{cookieText("cookie.marketing", "Marketing")}</span>
              <Switch aria-label={t("cookie_marketing")} checked={marketingAccepted} onCheckedChange={setMarketingAccepted} className="data-[state=checked]:bg-[var(--cookie-primary-color)]" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 text-sm">{cookieText("cookie.essential", "Essenziell")}</span>
              <Switch aria-label={t("cookie_essential")} checked={true} disabled className="data-[state=checked]:bg-[var(--cookie-primary-color)] disabled:opacity-100" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} />
            </div>
          </div>

          <div className="flex gap-4 mb-4 text-xs text-slate-500">
            <Link to={withLang("/datenschutz")} className="hover:text-slate-800 transition-colors">
              {cookieText("cookie.privacy_link", "Datenschutzerklärung")}
            </Link>
            <Link to={withLang("/impressum")} className="hover:text-slate-800 transition-colors">
              {cookieText("cookie.imprint_link", "Impressum")}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" className="w-full rounded-full py-5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900" onClick={handleSaveSettings}>
              {cookieText("cookie.save", "Einstellungen speichern")}
            </Button>
            <Button className="w-full rounded-full py-5 text-sm font-semibold bg-[var(--cookie-primary-color)] hover:brightness-95 text-white" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} onClick={handleAcceptAll}>
              {cookieText("cookie.accept_all", "Alles akzeptieren")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
