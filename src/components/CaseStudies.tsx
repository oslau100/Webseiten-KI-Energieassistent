import { useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";

type CaseStudy = {
  id: number;
  title: string;
  website: string;
  company: string;
  previewImage: string;
  previewImageAlt: string;
  situation: ReactNode;
  result: ReactNode;
};

const caseStudies: CaseStudy[] = [
  {
    id: 1,
    title: "2.366 Verträge automatisiert abgeschlossen bei nur Ø 56€ pro Abschluss",
    website: "www.tarif-butler.de",
    company: "Switch Energy GmbH",
    previewImage: "https://vibe.filesafe.space/1779705604088859430/attachments/f3190deb-9a68-459a-9666-decfb70c5580.png",
    previewImageAlt: "TarifButler App Preview",
    situation: (
      <>
        Der Vertrieb lief klassisch über D2D mit hoher Ablehnung, wenig Kontrolle und starker Abhängigkeit von Mitarbeitern. Viele haben schnell wieder aufgehört, weil die tägliche Ablehnung zu hoch war.
        <br /><br />
        Abschlüsse waren unregelmäßig und kaum planbar. Mal kamen mehrere Verträge rein, dann wieder gar keine. Ein großer Teil der potenziellen Kunden ging verloren, weil sie nicht erreichbar waren oder abgeblockt haben
      </>
    ),
    result: (
      <>
        Nach der Implementierung des Energieassistenten konnten kontinuierlich neue Interessenten und Abschlüsse unabhängig von einzelnen Mitarbeitern generiert werden. 2.366 Verträge wurden innerhalb von 12 Monaten über bezahlte Werbung gewonnen. Gleichzeitig wurde eine Datenbank mit über 10.000 Leads aufgebaut.
        <br /><br />
        Heute läuft der Vertrieb konstant und planbar mit weniger Mitarbeitern und deutlich höherer Stabilität.
      </>
    ),
  },
  {
    id: 2,
    title: "111 Verträge in den ersten 3 Monaten automatisiert über Einwurfkarten abgeschlossen",
    website: "www.kromen-energieassistent.de",
    company: "Kromen Energieassistent",
    previewImage: "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/Fallstudie-Seite-Kromen.png",
    previewImageAlt: "Kromen Energieassistent Vorschau",
    situation: (
      <>
        Marcel gewann seine Kunden ausschließlich über klassischen Door-to-Door-Vertrieb und schrieb damit monatlich zwischen 25 und 40 Verträge.
        <br /><br />
        Seine Ergebnisse waren jedoch stark davon abhängig, wie viele Menschen er antraf und wie erfolgreich die einzelnen Gespräche verliefen. Weil jede erreichte Person direkt zum Abschluss bewegt werden musste, entstanden viel Überzeugungsarbeit und hoher Verkaufsdruck. Das führte regelmäßig zu Ablehnung, Widerrufen und Stornos.
      </>
    ),
    result: (
      <>
        Nach der Implementierung seines Energieassistenten ergänzte Marcel seinen D2D-Vertrieb gezielt mit Einwurfkarten in den Gebieten, in denen er ohnehin unterwegs war. Viele Haushalte kannten ihn dadurch bereits vor dem ersten Gespräch, wodurch er auf mehr Grundvertrauen traf und seine Gespräche deutlich leichter führen konnte.
        <br /><br />
        Gleichzeitig wurden über seinen Energieassistenten in den ersten drei Monaten 111 Verträge automatisiert abgeschlossen – bei nahezu keinen Widerrufen oder Stornos. Parallel erzielte Marcel weiterhin jeden Monat mehr als 30 D2D-Abschlüsse.
        <br /><br />
        Heute gewinnt er neben seinem klassischen D2D-Vertrieb fortlaufend zusätzliche Abschlüsse über seinen Energieassistenten.
      </>
    ),
  },
  {
    id: 3,
    title: "Jeden Monat über 50 Verträge mit deutlich weniger Aufwand",
    website: "www.ehiogie-energieassistent.de",
    company: "Ehiogie Energieassistent",
    previewImage: "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/Fallstudie-Seite-Ehiogie.png",
    previewImageAlt: "Ehiogie Energieassistent Vorschau",
    situation: (
      <>
        Marvin gewann seine Kunden ausschließlich über klassischen D2D-Vertrieb und erzielte damit unregelmäßig zwischen 20 und 30 Verträge pro Monat.
        <br /><br />
        In Gebieten, in denen bereits zahlreiche Vertriebler unterwegs waren, traf er auf genervte Haushalte und viel Ablehnung. Trotz zusätzlicher Verkaufstrainings blieb es schwierig, überhaupt in Gespräche zu kommen und konstant Abschlüsse zu erzielen. Dafür war er häufig sechs bis sieben Stunden täglich unterwegs.
      </>
    ),
    result: (
      <>
        Nach der Implementierung seines Energieassistenten stellte Marvin seinen Vertrieb vollständig auf Einwurfkarten um. Selbst in Gebieten, die er zuvor für praktisch ausgeschöpft hielt, entstanden dadurch automatisierte Abschlüsse und neue Interessenten, die er gezielt telefonisch weiterbearbeiten konnte.
        <br /><br />
        Seit der Umstellung erzielt er jeden Monat mehr als 50 Verträge – mit deutlich weniger Zeitaufwand. Über das integrierte Empfehlungsprogramm gewinnt er zusätzlich neue Interessenten und Kunden.
        <br /><br />
        Heute schreibt Marvin deutlich mehr Verträge, während sein Energieassistent einen großen Teil des Vertriebsprozesses für ihn übernimmt.
      </>
    ),
  },
];

export const CaseStudies = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => setActiveIndex((p) => (p + 1) % caseStudies.length);
  const prevSlide = () => setActiveIndex((p) => (p - 1 + caseStudies.length) % caseStudies.length);
  const activeCaseStudy = caseStudies[activeIndex];

  return (
    <section className="relative bg-[#000000] py-20 overflow-hidden border-t border-white/5">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      ></div>

      <div className="container relative z-10 mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-12">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 rounded-full px-4 py-1.5 font-bold mb-6 text-sm tracking-tight flex items-center gap-2 w-fit mx-auto transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" style={{ animationDuration: '3s' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(25,80,68,0.8)]"></span>
            </span>
            Ergebnisse aus der Praxis
          </Badge>
          <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl leading-tight tracking-tight">
            Unsere Fallstudien
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full max-w-5xl mx-auto">
          {/* Card */}
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50 relative overflow-hidden transition-all duration-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-16">

              {/* Left Column - Meta */}
              <div className="md:col-span-5 flex flex-col items-start h-full">
                <Badge className="bg-primary text-primary-foreground hover:opacity-90 rounded-sm px-3 py-1 font-bold mb-6 text-sm uppercase tracking-wider border-none">
                  FALLSTUDIE {activeCaseStudy.id}
                </Badge>

                <h3 className="text-[#1a231c] text-2xl md:text-3xl font-bold leading-tight mb-8">
                  {activeCaseStudy.title}
                </h3>

                <div className="flex h-[175px] w-full items-center justify-center rounded-2xl bg-gray-100 p-3 md:h-[200px]">
                  <img
                    src={activeCaseStudy.previewImage}
                    alt={activeCaseStudy.previewImageAlt}
                    className="max-h-full w-full rounded-xl bg-white object-contain shadow-sm"
                  />
                </div>

                <div className="mt-8 flex w-full flex-col items-start">
                  <div>
                    <div className="mb-3 flex w-fit flex-col items-center">
                      <span className="text-xs md:text-sm font-bold mb-1 text-[#195044]">Energieassistent ansehen</span>
                      <ArrowDown className="h-5 w-5 animate-bounce text-[#195044]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <a
                        href={`https://${activeCaseStudy.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 underline decoration-1 decoration-gray-300 underline-offset-4 transition-colors hover:text-[#195044] hover:decoration-[#195044] sm:whitespace-nowrap"
                      >
                        {activeCaseStudy.website}
                      </a>
                      <span className="font-bold text-[#1a231c]">{activeCaseStudy.company}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="md:col-span-7 flex flex-col gap-8">
                <div>
                  <h4 className="text-[#1a231c] text-xl font-bold mb-3">Ausgangssituation</h4>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {activeCaseStudy.situation}
                  </p>
                </div>

                <div>
                  <h4 className="text-[#1a231c] text-xl font-bold mb-3">Ergebnis</h4>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {activeCaseStudy.result}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button
              onClick={prevSlide}
              className="text-white hover:text-[#195044] transition-colors p-2"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
            </button>

            <div className="flex gap-3">
              {caseStudies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-12 bg-white" : "w-6 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="text-white hover:text-[#195044] transition-colors p-2"
              aria-label="Next slide"
            >
              <ChevronRight className="w-8 h-8" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12 md:mt-16">
          <Button
            size="lg"
            className="cta-shimmer bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base md:text-lg tracking-tighter sm:tracking-normal font-bold px-6 sm:px-12 py-3 sm:py-4 md:px-16 md:py-4 rounded-md transition-all hover:scale-105 h-auto whitespace-normal sm:whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            asChild
          >
            <a href="https://calendly.com/laurent-digital-info/60min" target="_blank" rel="noopener noreferrer">
              Kostenfreie Potenzialanalyse buchen
            </a>
          </Button>
        </div>

      </div>
    </section>
  );
};
