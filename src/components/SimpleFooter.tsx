import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const SimpleFooter = () => {
  const { t, withLang } = useI18n();
  const { getText } = useWebsiteConfig();
  const brandName = getText("brand.name", "Energieassistent");

  return (
    <footer className="bg-muted py-6 border-t mt-auto"><div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4"><p className="text-sm text-muted-foreground text-center md:text-left">© {new Date().getFullYear()} {t("footer_rights")} {brandName}</p><div className="flex gap-4 text-sm text-muted-foreground"><Link to={withLang("/datenschutz")} className="hover:text-primary-ink transition-colors">{t("footer_privacy")}</Link><Link to={withLang("/impressum")} className="hover:text-primary-ink transition-colors">{t("footer_imprint")}</Link></div></div></footer>
  );
};
