import { type CSSProperties, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { useI18n } from "@/lib/i18n";
import { resolveWebsiteRuntime } from "@/lib/websiteRuntime";

import { openConsentSettingsEvent, readConsent, setConsentStorage } from "@/lib/cookieConsent";

const FALLBACK_PRIMARY_COLOR = "#2563eb";

export const CookieBar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);
  const { getText: resolveText, design, customerRuntime } = useWebsiteConfig();
  const { lang, withLang } = useI18n();
  const getText = (path: string, fallback: string) => resolveText(path, fallback, lang);
  // Customer optional services require a separate reviewed implementation.
  // Pixel IDs or CRM configuration must never enable this UI or tracking.
  const optionalServicesAvailable = !resolveWebsiteRuntime().identity.customer;
  const primaryColor =
    (design?.colors as Record<string, unknown> | undefined)?.primary?.toString().trim() ||
    FALLBACK_PRIMARY_COLOR;

  useEffect(() => {
    const consent = readConsent();
    setIsVisible(consent === null);
    setMarketingAccepted(consent === "all");
    const reopen = () => {
      setMarketingAccepted(readConsent() === "all");
      setIsVisible(true);
    };
    window.addEventListener(openConsentSettingsEvent, reopen);
    return () => window.removeEventListener(openConsentSettingsEvent, reopen);
  }, []);

  const handleAcceptAll = () => {
    setConsentStorage("all");
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    setConsentStorage(optionalServicesAvailable && marketingAccepted ? "all" : "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const requiredCopy = ["title", "browser_settings", "more_info", "privacy_link", "imprint_link", "essential", "save"];
  if (customerRuntime && requiredCopy.some(key => !getText(`cookie.${key}`, "").trim())) {
    return <span hidden data-copy-readiness="INCOMPLETE" data-copy-section="cookie" />;
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={getText("cookie.title", "Privatsphäre-Einstellungen")} className="fixed inset-0 z-[100] bg-black/35 flex items-end sm:items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[72vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-4 sm:p-6 overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-bold mb-3 text-slate-900">{getText("cookie.title", "Privatsphäre-Einstellungen")}</h2>

          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            {optionalServicesAvailable ? <>
              <p>
                {getText("cookie.copy_intro", "Um Ihnen ein optimales Website-Erlebnis zu bieten, verwendet")}{" "}
                <span className="text-blue-600">{getText("brand.name", "Energieassistent")}</span> {getText("cookie.copy_intro_suffix", "Cookies und ähnliche Technologien.")}
              </p>

              <p>
                <strong>{getText("cookie.essential_label", "Essenzielle Cookies")}</strong> {getText("cookie.essential_copy", "sind für die Funktion der Website notwendig und können nicht deaktiviert werden.")}{" "}
                <strong>{getText("cookie.marketing_label", "Marketing Cookies")}</strong> {getText("cookie.marketing_copy", "helfen uns, Inhalte und Angebote für Sie zu verbessern.")}
              </p>

              <p>{getText("cookie.optional_services", "Optionale Dienste: Google Translate kann zur automatischen Übersetzung Texte und Verbindungsdaten an Google übermitteln; konfigurierte Jotform-Bewertungen übermitteln Verbindungsdaten an Jotform. Dabei kann eine Verarbeitung außerhalb der EU stattfinden. Diese Dienste werden erst nach Ihrer Zustimmung geladen.")}</p>

            </> : <p>
              {getText("cookie.browser_settings", "Diese Website speichert Ihre Spracheinstellung und Ihre Privatsphäre-Einstellungen im Browser. Sie können Ihre Privatsphäre-Einstellungen jederzeit über den Link im Fußbereich erneut öffnen.")}
            </p>}

            <p className="text-xs text-slate-500">
              {getText("cookie.more_info", "Weitere Informationen finden Sie in der")}{" "}
              <Link to={withLang("/datenschutz")} className="text-blue-600 hover:underline">
                {getText("cookie.privacy_link", "Datenschutzerklärung")}
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-6 bg-white">
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex flex-wrap items-center gap-5 mb-4 border border-slate-100">
            {optionalServicesAvailable && <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 text-sm">{getText("cookie.marketing", "Marketing")}</span>
              <Switch aria-label={getText("cookie.marketing", "Marketing")} checked={marketingAccepted} onCheckedChange={setMarketingAccepted} className="data-[state=checked]:bg-[var(--cookie-primary-color)]" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} />
            </div>}
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900 text-sm">{getText("cookie.essential", "Essenziell")}</span>
              <Switch aria-label={getText("cookie.essential", "Essenziell")} checked={true} disabled className="data-[state=checked]:bg-[var(--cookie-primary-color)] disabled:opacity-100" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} />
            </div>
          </div>

          <div className="flex gap-4 mb-4 text-xs text-slate-500">
            <Link to={withLang("/datenschutz")} className="hover:text-slate-800 transition-colors">
              {getText("cookie.privacy_link", "Datenschutzerklärung")}
            </Link>
            <Link to={withLang("/impressum")} className="hover:text-slate-800 transition-colors">
              {getText("cookie.imprint_link", "Impressum")}
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" className="w-full rounded-full py-5 text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-900" onClick={handleSaveSettings}>
              {getText("cookie.save", "Einstellungen speichern")}
            </Button>
            {optionalServicesAvailable && <Button className="w-full rounded-full py-5 text-sm font-semibold bg-[var(--cookie-primary-color)] hover:brightness-95 text-white" style={{ "--cookie-primary-color": primaryColor } as CSSProperties} onClick={handleAcceptAll}>
              {getText("cookie.accept_all", "Alles akzeptieren")}
            </Button>}
          </div>
        </div>
      </div>
    </div>
  );
};
