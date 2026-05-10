import { type CSSProperties, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWebsiteConfig } from "@/lib/websiteConfig";

const CONSENT_KEY = "cookie-consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
const FALLBACK_PRIMARY_COLOR = "#2563eb";

const getCookieDomain = (hostname: string) => {
  if (hostname === "ehiogie-energieassistent.de" || hostname.endsWith(".ehiogie-energieassistent.de")) {
    return ".ehiogie-energieassistent.de";
  }

  return undefined;
};

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
  const [isVisible, setIsVisible] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(true);
  const { getText, design } = useWebsiteConfig();
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
  }, []);

  const handleAcceptAll = () => {
    setConsentStorage("all");
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    setConsentStorage(marketingAccepted ? "all" : "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/35 flex items-end sm:items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[72vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-4 sm:p-6 overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-3 text-slate-900">{getText("cookie.title", "Privatsphäre-Einstellungen")}</h2>

          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            <p>
              {getText("cookie.copy_intro", "Um Ihnen ein optimales Website-Erlebnis zu bieten, verwendet")}{" "}
              <span className="text-blue-600">{getText("brand.name", "Energieassistent")}</span> {getText("cookie.copy_intro_suffix", "Cookies und ähnliche Technologien.")}
            </p>

            <p>
              <strong>{getText("cookie.essential_label", "Essenzielle Cookies")}</strong> {getText("cookie.essential_copy", "sind für die Funktion der Website notwendig und können nicht deaktiviert werden.")}{" "}
              <strong>{getText("cookie.marketing_label", "Marketing Cookies")}</strong> {getText("cookie.marketing_copy", "helfen uns, Inhalte und Angebote für Sie zu verbessern.")}
            </p>

            <p className="text-xs text-slate-500">
              {getText("cookie.more_info", "Weitere Informationen finden Sie in der")}{" "}
              <Link to="/datenschutz" className="text-blue-600 hover:underline">
                {getText("cookie.privacy_link", "Datenschutzerklärung")}
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-6 bg-white">
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex flex-wrap items-center gap-5 mb-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 text-sm">{getText("cookie.marketing", "Marketing")}</span>
              <Switch checked={marketingAccepted} onCheckedChange={setMarketingAccepted} className="data-[state=checked]:bg-[var(--cookie-primary-color)]" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 text-sm">{getText("cookie.essential", "Essenziell")}</span>
              <Switch checked={true} disabled className="data-[state=checked]:bg-[var(--cookie-primary-color)] disabled:opacity-100" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} />
            </div>
          </div>

          <div className="flex gap-4 mb-4 text-xs text-slate-500">
            <Link to="/datenschutz" className="hover:text-slate-800 transition-colors">
              {getText("cookie.privacy_link", "Datenschutzerklärung")}
            </Link>
            <Link to="/impressum" className="hover:text-slate-800 transition-colors">
              {getText("cookie.imprint_link", "Impressum")}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" className="w-full rounded-full py-5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900" onClick={handleSaveSettings}>
              {getText("cookie.save", "Einstellungen speichern")}
            </Button>
            <Button className="w-full rounded-full py-5 text-sm font-semibold bg-[var(--cookie-primary-color)] hover:brightness-95 text-white" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} onClick={handleAcceptAll}>
              {getText("cookie.accept_all", "Alles akzeptieren")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
