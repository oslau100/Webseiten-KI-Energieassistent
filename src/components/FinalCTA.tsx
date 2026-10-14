import { Button } from "./ui/button";
import { MarketingLink as Link } from "./MarketingLink";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { AnimatedSection } from "./AnimatedSection";
export function FinalCTA() {
 const { t, lang, withLang } = useI18n();
 const { getText } = useWebsiteConfig();
 return <section className="container px-4 pb-16">        <AnimatedSection delay={300} className="mt-24 bg-primary text-primary-foreground rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl leading-tight">{getText("sections.final_cta.headline", t("home_final_cta_h2"), lang)}</h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
              {getText(
                "sections.final_cta.subline",
                "Prüfe in nur 60 Sekunden, ob und wie viel du aktuell sparen könntest.",
                lang,
              )}
            </p>
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-semibold w-full sm:w-auto shadow-lg text-secondary-foreground" asChild>
              <Link to={withLang("/start")}>{getText("sections.final_cta.cta_text", t("cta_check_savings"), lang)}</Link>
            </Button>
          </div>
        </AnimatedSection></section>;
}
