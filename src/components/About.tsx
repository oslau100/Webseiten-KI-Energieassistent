import { Facebook, Instagram, Youtube } from "lucide-react";
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
                <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{getText("sections.about.social_hint", "Folge mir auf den Sozialen Medien für Tipps rund um Strom & Gas", lang)}</p>
                <div className="flex justify-center gap-4 text-muted-foreground">
                  <a href={getText("sections.about.social.tiktok", "#", lang)} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors"><span className="text-sm font-semibold">TikTok</span></a>
                  <a href={getText("sections.about.social.youtube", "#", lang)} target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors"><Youtube className="h-6 w-6" /></a>
                  <a href={getText("sections.about.social.facebook", "#", lang)} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors"><Facebook className="h-6 w-6" /></a>
                  <a href={getText("sections.about.social.instagram", "#", lang)} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors"><Instagram className="h-6 w-6" /></a>
                </div>
              </div>
            </div>
            <div className="md:col-span-8 lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-2xl font-bold">{getText("sections.about.person_name", "Team", lang)}</h3>
                <p className="text-primary font-medium">{getText("sections.about.role", "Experte für Strom & Gas", lang)}</p>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                <p>{getText("sections.about.paragraph_1", "Wir unterstützen Haushalte dabei, mehr Transparenz beim Thema Strom- und Gastarife zu bekommen und mögliche Einsparungen zu erkennen.", lang)}</p>
                <p>{getText("sections.about.paragraph_2", "In meiner Arbeit habe ich immer wieder gesehen, wie unübersichtlich der Energiemarkt für viele Menschen geworden ist. Unterschiedliche Anbieter, ständig neue Tarife und komplizierte Vertragsbedingungen machen es schwer zu erkennen, welcher Tarif wirklich sinnvoll ist. Viele Haushalte beschäftigen sich deshalb erst dann mit ihrem Energievertrag, wenn eine hohe Nachzahlung kommt oder die Kosten plötzlich steigen.", lang)}</p>
                <p>{getText("sections.about.paragraph_3", "Genau hier setze ich an. Mit dem digitalen Energieassistenten stelle ich ein System zur Verfügung, das Tarife automatisch prüft, Jahresrechnungen analysiert und verständlich zeigt, wo Einsparungen oder Auffälligkeiten liegen. So wird aus einem komplexen Energiethema eine klare und verständliche Lösung.", lang)}</p>
                <p>{getText("sections.about.paragraph_4", "Mein Ziel ist es, so vielen Haushalten wie möglich zu helfen, ihre Energiekosten besser zu verstehen, unnötige Ausgaben zu vermeiden und langfristig Einsparungen zu erzielen ohne komplizierte Vergleiche oder zusätzlichen Aufwand.", lang)}</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
