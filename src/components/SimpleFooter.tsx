import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const SimpleFooter = ({ preview = false }: { preview?: boolean }) => {
  const { t, withLang } = useI18n();
  const { getText } = useWebsiteConfig();
  const brandName = getText("brand.name", "Energieassistent");
  const footerClass = preview ? "bg-white py-3 sm:py-4 mt-auto shrink-0" : "bg-muted py-6 border-t mt-auto";
  const gap = preview ? "gap-2" : "gap-4";

  return (
    <footer className={footerClass}>
      <div className={`container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between ${gap}`}>
        <p className="text-sm text-muted-foreground text-center md:text-left">
          © {new Date().getFullYear()} {t("footer_rights")} {brandName}
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link to={withLang("/datenschutz")} className="hover:text-primary transition-colors">{t("footer_privacy")}</Link>
          <Link to={withLang("/impressum")} className="hover:text-primary transition-colors">{t("footer_imprint")}</Link>
        </div>
      </div>
    </footer>
  );
};
