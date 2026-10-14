import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { LANGUAGES, useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const Header = () => {
  const location = useLocation();
  const isIndexPage = location.pathname === "/";
  const isLegalPage = location.pathname === "/impressum" || location.pathname === "/datenschutz";
  const { lang, setLang, t, withLang } = useI18n();
  const { getText, design } = useWebsiteConfig();

  const selectedLanguage = LANGUAGES.find((language) => language.code === lang) ?? LANGUAGES[0];
  const logoUrl = ((design.assets as Record<string, string> | undefined)?.logo_header) || "";
  const logoAlt = getText("brand.name", "Energieassistent");

  return (
    <header className="absolute top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-24 md:h-32 flex items-center justify-between">
        <div className="flex items-center">
          <Link to={withLang("/")}>
            {logoUrl ? <img src={logoUrl} alt={logoAlt} className={`w-auto object-contain max-w-[min(42vw,220px)] ${logoAlt === "Tarivia" ? "max-h-12 md:max-h-16" : "h-20 md:h-28"}`} /> : <span className="font-semibold text-foreground">{logoAlt}</span>}
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {!isLegalPage && (
            <DropdownMenu dir={lang === "ar" ? "rtl" : "ltr"}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 rounded-md px-2 sm:px-3 gap-2 bg-background shadow-sm border-border hover:bg-muted/50 min-w-10">
                  <img src={selectedLanguage.flagUrl} alt={selectedLanguage.label} className="h-4 w-6 object-cover rounded-sm" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  <span className="hidden sm:inline font-semibold uppercase text-sm">{selectedLanguage.code}</span>
                  <ChevronDown className="hidden sm:inline h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">{getText("header.language_switch_sr", "Sprache wechseln", lang)}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((language) => (
                  <DropdownMenuItem key={language.code} onClick={() => setLang(language.code)} className="gap-2">
                    <img src={language.flagUrl} alt={language.label} className="h-4 w-6 object-cover rounded-sm" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    <span className="font-semibold uppercase text-xs">{language.code}</span>
                    <span className="text-xs text-muted-foreground">{language.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!isLegalPage && (
            <Button asChild variant="outline" className="border-primary text-primary-ink hover:bg-primary/5 inline-flex rounded-md font-semibold text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">
              <Link to={isIndexPage ? withLang("/jahresrechnung") : withLang("/")}>{isIndexPage ? t("header_check_bill") : t("header_check_savings")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
