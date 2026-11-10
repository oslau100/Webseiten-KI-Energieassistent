import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { openCookieSettings } from "./CookieBar";

const cookieSettingsLabels = {
  de: "Cookie-Einstellungen",
  en: "Cookie settings",
  tr: "Çerez ayarları",
  ru: "Настройки файлов cookie",
  ar: "إعدادات ملفات تعريف الارتباط",
  it: "Impostazioni cookie",
  zh: "Cookie 设置",
  hi: "कुकी सेटिंग्स",
  es: "Configuración de cookies",
  fr: "Paramètres des cookies",
  nl: "Cookie-instellingen",
  pl: "Ustawienia plików cookie",
} as const;

export const Footer = () => {
  const { t, withLang, lang } = useI18n();
  const { getText, design } = useWebsiteConfig();

  const assets = (design.assets as Record<string, string> | undefined) || {};

  return (
    <footer className="bg-muted pt-12 pb-2 md:py-16 border-t">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-start gap-2 -mt-4 md:-mt-8">
              {assets.logo_footer ? (
                <img
                  src={assets.logo_footer}
                  alt={getText("brand.name", "Energieassistent") + " Logo"}
                  className="h-28 md:h-32 w-auto object-contain object-left-top"
                />
              ) : (
                <span className="font-semibold text-foreground pt-6">
                  {getText("brand.name", "Energieassistent")}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {t("footer_rights")}
              <br />
              {getText("brand.name", "Energieassistent")}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">
              {t("footer_contact")}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link
                to={withLang("/rueckruf-buchen")}
                className="hover:text-primary transition-colors block underline underline-offset-4"
              >
                {t("footer_callback")}
              </Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">
              {t("footer_legal")}
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link
                to={withLang("/datenschutz")}
                className="hover:text-primary transition-colors block"
              >
                {t("footer_privacy")}
              </Link>
              <Link
                to={withLang("/impressum")}
                className="hover:text-primary transition-colors block"
              >
                {t("footer_imprint")}
              </Link>
              <button
                type="button"
                onClick={openCookieSettings}
                className="hover:text-primary transition-colors block text-left"
              >
                {getText("cookie.edit_settings", cookieSettingsLabels[lang], lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
