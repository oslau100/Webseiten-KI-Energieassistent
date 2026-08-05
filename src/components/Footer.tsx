import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const Footer = () => {
  const { t, withLang } = useI18n();
  const { getText, design } = useWebsiteConfig();

  const assets = (design.assets as Record<string, string> | undefined) || {};
  const agencyUrl = getText("brand.agency_url", "").trim();
  const agencyAlt = getText("brand.agency_alt", "Powered by Energieassistent.io").trim();
  const agencyLogo = assets.agency_logo?.trim();
  const showAgencyAttribution = Boolean(agencyUrl && agencyLogo);

  return (
    <footer className="bg-muted pt-12 pb-2 md:py-16 border-t">
      <div className="container px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-start gap-2 -mt-4 md:-mt-8">
              {assets.logo_footer ? <img src={assets.logo_footer} alt={getText("brand.name", "Energieassistent") + " Logo"} className="h-28 md:h-32 w-auto object-contain object-left-top" /> : <span className="font-semibold text-foreground pt-6">{getText("brand.name", "Energieassistent")}</span>}
            </div>
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} {t("footer_rights")}<br />{getText("brand.name", "Energieassistent")}</p>
          </div>
          <div className="space-y-4"><h4 className="font-semibold text-foreground">{t("footer_contact")}</h4><div className="space-y-2 text-sm text-muted-foreground"><Link to={withLang("/rueckruf-buchen")} className="hover:text-primary transition-colors block underline underline-offset-4">{t("footer_callback")}</Link></div></div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">{t("footer_legal")}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to={withLang("/datenschutz")} className="hover:text-primary transition-colors block">{t("footer_privacy")}</Link>
              <Link to={withLang("/impressum")} className="hover:text-primary transition-colors block">{t("footer_imprint")}</Link>
            </div>
            {showAgencyAttribution ? (
              <div className="pt-5">
                <a
                  href={agencyUrl}
                  aria-label={agencyAlt}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-col items-start gap-[6px] text-[10px] font-medium text-muted-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span>Powered by</span>
                  <img src={agencyLogo} alt={agencyAlt} className="h-auto w-[110px] object-contain object-left md:w-[130px]" />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
};
