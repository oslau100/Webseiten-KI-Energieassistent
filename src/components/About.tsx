import { Facebook, Instagram, Youtube } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { useI18n } from "@/lib/i18n";

export const About = () => {
  const { t } = useI18n();
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
                <img src="https://vibe.filesafe.space/1774643086282323006/attachments/c0d6a4ae-c0f8-414e-83a4-712227fc30fb.png" alt="Marvin Ehiogie" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Folge mir auf den Sozialen Medien für Tipps rund um Strom & Gas</p>
                <div className="flex justify-center gap-4 text-muted-foreground">
                  <a href="https://www.tiktok.com/@marcel_kromen?_r=1&_t=ZG-95GQrePUCGm" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors"><Youtube className="h-6 w-6" /></a>
                  <a href="https://www.facebook.com/share/1GMo5WR681/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors"><Facebook className="h-6 w-6" /></a>
                  <a href="https://www.instagram.com/marcel_kromen?utm_source=qr&igsh=MTd6NWFrY3FtaGM2Zw==" target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors"><Instagram className="h-6 w-6" /></a>
                  <a href="https://www.tiktok.com/@marcel_kromen?_r=1&_t=ZG-95GQrePUCGm" target="_blank" rel="noopener noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className="h-5 w-5 mt-0.5"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" /></svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="md:col-span-8 lg:col-span-7 space-y-6">
              <div><h3 className="text-2xl font-bold">Marvin Ehiogie</h3><p className="text-primary font-medium">Experte für Strom & Gas</p></div>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                <p>Ich bin Marvin Ehiogie und unterstütze Haushalte dabei, mehr Transparenz beim Thema Strom- und Gastarife zu bekommen und mögliche Einsparungen zu erkennen.</p>
                <p>In meiner Arbeit habe ich immer wieder gesehen, wie unübersichtlich der Energiemarkt für viele Menschen geworden ist. Unterschiedliche Anbieter, ständig neue Tarife und komplizierte Vertragsbedingungen machen es schwer zu erkennen, welcher Tarif wirklich sinnvoll ist. Viele Haushalte beschäftigen sich deshalb erst dann mit ihrem Energievertrag, wenn eine hohe Nachzahlung kommt oder die Kosten plötzlich steigen.</p>
                <p>Genau hier setze ich an. Mit dem digitalen Energieassistenten stelle ich ein System zur Verfügung, das Tarife automatisch prüft, Jahresrechnungen analysiert und verständlich zeigt, wo Einsparungen oder Auffälligkeiten liegen. So wird aus einem komplexen Energiethema eine klare und verständliche Lösung.</p>
                <p>Mein Ziel ist es, so vielen Haushalten wie möglich zu helfen, ihre Energiekosten besser zu verstehen, unnötige Ausgaben zu vermeiden und langfristig Einsparungen zu erzielen ohne komplizierte Vergleiche oder zusätzlichen Aufwand.</p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
