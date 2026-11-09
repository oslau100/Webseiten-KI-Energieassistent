import { AnimatedSection } from "./AnimatedSection";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const About = () => {
  const { t, lang } = useI18n();
  const { getText } = useWebsiteConfig();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t("home_about_h2")}</h2>
        </AnimatedSection>

        <AnimatedSection delay={200} className="bg-muted/30 rounded-3xl overflow-hidden shadow-sm max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8 items-center p-8 md:p-12 lg:p-16">
            <div className="md:col-span-4 lg:col-span-5 flex flex-col items-center text-center space-y-6">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-background shadow-xl">
                {getText("sections.about.avatar_url", "", lang) ? <img
                  src={getText("sections.about.avatar_url", "", lang)}
                  alt={getText("sections.about.person_name", "Team", lang)}
                  className="w-full h-full object-cover"
                /> : <div className="w-full h-full bg-muted" />}
              </div>
              <div className="space-y-4">
                {getText("sections.about.external_url", "", lang) && (
                  <a href={getText("sections.about.external_url", "", lang)} target="_blank" rel="noopener noreferrer" className="hidden md:inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-foreground hover:text-foreground hover:bg-primary/90">
                    {getText("sections.about.external_label", "Mehr erfahren", lang)}
                  </a>
                )}
              </div>
            </div>
            <div className="md:col-span-8 lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-2xl font-bold">{getText("sections.about.person_name", "Team", lang)}</h3>
                <p className="text-primary font-medium">{getText("sections.about.role", "Experte für Strom & Gas", lang)}</p>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                {[1, 2, 3, 4, 5, 6].map((n) => {
                  const paragraph = getText(`sections.about.paragraph_${n}`, "", lang).trim();
                  return paragraph ? <p key={n}>{paragraph}</p> : null;
                })}
              </div>
              {getText("sections.about.external_url", "", lang) && (
                <a href={getText("sections.about.external_url", "", lang)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex md:hidden items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-foreground hover:text-foreground hover:bg-primary/90">
                  {getText("sections.about.external_label", "Mehr erfahren", lang)}
                </a>
              )}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
