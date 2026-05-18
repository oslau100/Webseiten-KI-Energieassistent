import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const Solution = () => {
  const { t, withLang, lang } = useI18n();
  const { getText } = useWebsiteConfig();
  const imageUrl = getText("sections.solution.image_url", "", lang);
  const imagePosition = getText("sections.solution.image_position", "right", lang);
  const imageLeft = imagePosition === "left";

  const imageContainerClass = imageLeft
    ? "justify-start pl-0 pr-0 lg:order-1 lg:pr-6"
    : "lg:order-2 lg:justify-end";

  const imageClass = imageLeft
    ? "relative z-10 w-full max-w-[500px] md:max-w-[650px] lg:max-w-[850px] xl:max-w-[1000px] h-auto object-contain object-bottom drop-shadow-2xl translate-y-10 md:translate-y-6 lg:translate-y-8 -ml-8 sm:-ml-10 lg:-ml-12 xl:-ml-16 scale-[1.7] md:scale-125 lg:scale-[1.45] origin-bottom"
    : "relative z-10 w-full max-w-[500px] md:max-w-[650px] lg:max-w-[850px] xl:max-w-[1000px] h-auto object-contain object-bottom drop-shadow-2xl translate-y-12 md:translate-y-8 lg:translate-y-12 lg:-mr-12 scale-[1.75] md:scale-125 lg:scale-150 origin-bottom";

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <AnimatedSection className="bg-primary rounded-[2.5rem] shadow-2xl relative">
          <div className="grid lg:grid-cols-2 items-center">
            <div className={`px-6 pt-10 pb-0 md:p-16 lg:p-20 space-y-8 text-primary-foreground z-10 relative ${imageLeft ? "lg:order-2" : "lg:order-1"}`}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl leading-tight">{getText("sections.solution.headline", t("home_solution_h2"), lang)}</h2>
              <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-lg">{getText("sections.solution.body", "Du musst den Tarifmarkt nicht selbst verstehen oder vergleichen. Dein digitaler Energieassistent übernimmt das für dich.", lang)}</p>
              <div className="pt-4">
                <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold w-full sm:w-auto shadow-lg text-primary" asChild>
                  <Link to={withLang("/start")}>{getText("sections.solution.cta_text", t("cta_check_savings"), lang)}</Link>
                </Button>
                <p className="text-xs text-primary-foreground/70 mt-3">{getText("sections.solution.result_note", "Ergebnis in 60 Sekunden - 100% kostenlos", lang)}</p>
              </div>
            </div>
            <div className={`relative h-full min-h-[280px] md:min-h-[350px] lg:min-h-[500px] flex items-end justify-center mt-8 md:mt-0 overflow-hidden ${imageContainerClass}`}>
              {imageUrl ? <img src={imageUrl} alt={getText("sections.solution.image_alt", "Energieassistent", lang)} className={imageClass} /> : null}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
