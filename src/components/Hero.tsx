import { Check, Star } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#000000] text-foreground pt-0 pb-8 md:pt-0 md:pb-16 px-2 sm:px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.09]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-[1000px] pt-4 md:pt-12">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <Badge 
            className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-full px-3 sm:px-4 py-1.5 md:px-5 md:py-1.5 mb-4 md:mb-8 text-[11px] sm:text-xs md:text-sm tracking-tighter sm:tracking-normal font-semibold transition-colors whitespace-nowrap flex items-center gap-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" style={{ animationDuration: '3s' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(25,80,68,0.8)]"></span>
            </span>
            Für Strom- & Gasvertriebler
          </Badge>

          {/* Headings */}
          <h1 className="hero-headline-shimmer text-[28px] min-[375px]:text-[32px] sm:text-4xl md:text-[42px] lg:text-5xl xl:text-6xl font-bold tracking-tight mb-3 md:mb-6 text-white leading-[1.2] md:leading-tight">
            Mehr Verträge. Weniger Aufwand.
          </h1>

          {/* Paragraph */}
          <p className="text-[18px] sm:text-lg md:text-xl text-gray-300 max-w-[800px] mx-auto mb-5 md:mb-10 leading-snug sm:leading-relaxed tracking-tighter sm:tracking-normal px-1 sm:px-2 md:px-0">
            Mit deinem Energieassistenten gewinnst du einfacher neue Interessenten, die vollautomatisiert beraten, nachgefasst und abgeschlossen werden – ohne Verkaufsdruck, Ablehnung oder manuellen Vertriebsaufwand
          </p>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="hero-cta-wiggle cta-shimmer bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base md:text-lg tracking-tighter sm:tracking-normal font-bold px-6 sm:px-12 py-3 sm:py-4 md:px-16 md:py-4 rounded-md transition-all hover:scale-105 h-auto whitespace-normal sm:whitespace-nowrap w-full sm:w-auto mb-2 min-w-[280px]"
            asChild
          >
            <a href="https://calendly.com/laurent-digital-info/60min" target="_blank" rel="noopener noreferrer" className="text-center">
              Kostenfreie Potenzialanalyse buchen
            </a>
          </Button>

          {/* Social Proof */}
          <div className="flex flex-col items-center mt-2 mb-10 md:mb-16">
            <img 
              src="https://vibe.filesafe.space/1779705604088859430/attachments/eebcb0f6-2c85-4f93-835a-25679b6bf9c9.png" 
              alt="Social Proof" 
              className="h-28 sm:h-32 md:h-[130px] w-auto object-contain"
            />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-10 text-left w-full mt-2 md:mt-0">
            {/* Feature 1 */}
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="bg-white rounded-full p-1 shrink-0 mt-0.5">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" strokeWidth={4} />
              </div>
              <p className="text-[13px] sm:text-sm text-white leading-tight sm:leading-snug tracking-tighter sm:tracking-normal">
                <span className="font-bold">Im D2D- und Online-Vertrieb einsetzbar</span> – ohne Umstellung oder zusätzlichen Aufwand
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="bg-white rounded-full p-1 shrink-0 mt-0.5">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" strokeWidth={4} />
              </div>
              <p className="text-[13px] sm:text-sm text-white leading-tight sm:leading-snug tracking-tighter sm:tracking-normal">
                <span className="font-bold">Macht deinen Vertrieb deutlich einfacher</span> – und bringt dir planbar mehr Abschlüsse
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-3 sm:gap-4 items-start">
              <div className="bg-white rounded-full p-1 shrink-0 mt-0.5">
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary" strokeWidth={4} />
              </div>
              <p className="text-[13px] sm:text-sm text-white leading-tight sm:leading-snug tracking-tighter sm:tracking-normal">
                <span className="font-bold">Maßgeschneidert für deinen Vertrieb</span> – und sofort einsatzbereit
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
