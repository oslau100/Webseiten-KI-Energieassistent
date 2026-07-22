import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const Hero = () => {
  const { t, withLang } = useI18n();
  const { getText, design } = useWebsiteConfig();
  const assets = (design.assets as Record<string, string> | undefined) || {};
  const heroImage = assets.hero_image || "";
  const heroAlt = getText("sections.hero.image_alt", "Energieassistent");
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-background" data-no-translate="true"><div className="container px-4 mx-auto max-w-7xl"><div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 xl:gap-24"><div className="flex-1 text-center lg:text-left z-10 w-full max-w-2xl lg:max-w-none mx-auto"><div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-[11px] sm:text-sm font-semibold mb-8 whitespace-nowrap"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary shrink-0" />{t("hero_badge")}</div><h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tight text-foreground mb-6 leading-[1.1]">{t("hero_headline")}</h1><p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">{t("hero_subline_prefix")} <strong className="text-foreground font-semibold">{t("hero_subline_emphasis")}</strong>{` ${t("hero_subline_suffix")}`}</p><div className="flex flex-col items-center lg:items-start gap-4"><Button size="lg" className="w-full sm:w-auto text-lg h-16 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" asChild><Link to={withLang("/start")}>{t("cta_check_savings")}</Link></Button><span className="text-sm text-muted-foreground">{t("hero_result_note")}</span></div></div><div className="flex-1 relative w-full mx-auto flex items-center justify-center lg:justify-end">{heroImage ? <img src={heroImage} alt={heroAlt} className="w-full max-w-[500px] lg:max-w-[700px] xl:max-w-[850px] scale-[1.3] mt-12 mb-4 sm:scale-100 sm:mt-0 sm:mb-0 lg:scale-110 xl:scale-125 lg:translate-x-8 xl:translate-x-12 lg:origin-right h-auto object-contain relative z-10 drop-shadow-2xl" /> : <div className="w-full max-w-[500px] lg:max-w-[700px] xl:max-w-[850px]" />}</div></div></div></section>
  );
};
