import { relaunchAssets } from "@/lib/relaunchAssets";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";

const caseStudies = [
  {
    badge: "FALLSTUDIE 1",
    title: "2.366 Verträge abgeschlossen bei nur Ø 56€ pro Abschluss",
    metrics: [],
    image:
      relaunchAssets.caseStudies.tarifbutler,
    imageAlt: "TarifButler Vorschau",
    link: "www.tarif-butler.de",
    href: "https://www.tarif-butler.de",
    author: "Switch Energy GmbH",
    blocks: [
      {
        heading: "Ausgangssituation",
        text: "Der Vertrieb lief klassisch über D2D mit hoher Ablehnung, wenig Kontrolle und starker Abhängigkeit von Mitarbeitern. Viele haben schnell wieder aufgehört, weil die tägliche Ablehnung zu hoch war.\n\nAbschlüsse waren unregelmäßig und kaum planbar. Mal kamen mehrere Verträge rein, dann wieder gar keine. Ein großer Teil der potenziellen Kunden ging verloren, weil sie nicht erreichbar waren oder abgeblockt haben",
      },
      {
        heading: "Ergebnis",
        text: "Nach der Implementierung des Energieassistenten konnten kontinuierlich neue Interessenten und Abschlüsse unabhängig von einzelnen Mitarbeitern generiert werden. 2.366 Verträge wurden innerhalb von 12 Monaten über bezahlte Werbung gewonnen. Gleichzeitig wurde eine Datenbank mit über 10.000 Leads aufgebaut.\n\nHeute läuft der Vertrieb konstant und planbar mit weniger Mitarbeitern und deutlich höherer Stabilität.",
      },
    ],
  },
  {
    badge: "FALLSTUDIE 2",
    title: "Über 500 Leads & 111 Verträge in den ersten 3 Monaten",
    metrics: [],
    image:
      relaunchAssets.caseStudies.kromen,
    imageAlt: "Energieassistent Vorschau",
    link: "www.kromen-energieassistent.de",
    href: "https://www.kromen-energieassistent.de",
    author: "Marcel Kromen",
    blocks: [
      {
        heading: "Ausgangssituation",
        text: "Marcel gewann seine Kunden bisher ausschließlich über klassischen Door-to-Door-Vertrieb und schrieb damit monatlich zwischen 25 und 40 Verträgen.\n\nSeine Ergebnisse waren jedoch stark davon abhängig, wie viele Menschen er persönlich ansprach und wie erfolgreich die einzelnen Gespräche verliefen. Für mehr Verträge brauchte es entsprechend mehr Zeit auf dem Feld, mehr Gespräche und kontinuierliche Vertriebsarbeit.",
      },
      {
        heading: "Ergebnis",
        text: "Mit seinem Energieassistenten ergänzte Marcel seinen bestehenden Vertrieb um eine zusätzliche digitale Leadquelle. Dafür setzte er Einwurfkarten in seinen Zielgebieten ein, über die Interessenten ihre Tarifprüfung selbstständig starten und direkt ihr persönliches Ergebnis erhalten konnten.\n\nIn den ersten drei Monaten entstanden so über 500 Leads und daraus 111 abgeschlossene Verträge.\n\nHeute gewinnt Marcel zusätzlich zu seinem klassischen D2D-Vertrieb fortlaufend neue Leads und Verträge über seinen Energieassistenten.",
      },
    ],
  },
  {
    badge: "FALLSTUDIE 3",
    title: "Jeden Monat über 50 Verträge mit deutlich weniger Aufwand",
    metrics: [],
    image:
      relaunchAssets.caseStudies.ehiogie,
    imageAlt: "Ehiogie Energieassistent Vorschau",
    link: "www.ehiogie-energieassistent.de",
    href: "https://www.ehiogie-energieassistent.de",
    author: "Marvin Ehiogie",
    blocks: [
      {
        heading: "Ausgangssituation",
        text: "Marvin gewann seine Kunden bisher ausschließlich über klassischen Door-to-Door-Vertrieb und erzielte damit unregelmäßig zwischen 20 und 30 Verträge pro Monat.\n\nIn vielen Gebieten traf er auf bereits häufig angesprochene Haushalte und entsprechend viel Ablehnung. Trotz zusätzlicher Verkaufstrainings blieb es schwierig, konstant neue Gespräche und Abschlüsse zu generieren. Dafür war er häufig sechs bis sieben Stunden täglich auf dem Feld unterwegs.",
      },
      {
        heading: "Ergebnis",
        text: "Über das Partnerprogramm seines Energieassistenten begann Marvin, gezielt lokale Offline-Partner in seiner Region zu gewinnen und ein eigenes Partnernetzwerk aufzubauen. So entstand für ihn ein zusätzlicher Weg zu neuen Leads und Verträgen, ohne jeden Kontakt selbst ansprechen zu müssen.\n\nHeute erzielt Marvin regelmäßig mehr als 50 Verträge pro Monat bei deutlich geringerem persönlichen Vertriebsaufwand. Sein Partnernetzwerk baut er kontinuierlich weiter aus und gewinnt darüber fortlaufend neue Interessenten und Verträge.",
      },
    ],
  },
];

const CaseStudyCard = ({ study }: { study: (typeof caseStudies)[number] }) => (
  <div className="rounded-[28px] md:rounded-[36px] bg-card border border-border/80 p-6 sm:p-10 md:p-12 shadow-sm">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
      {/* Left Column */}
      <div className="lg:col-span-6 flex flex-col">
        {/* Badge */}
        <div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#18483d] text-white">
            {study.badge}
          </span>
        </div>

        {/* Case Study Title */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-3 mb-4 leading-snug">
          {study.title}
        </h3>

        {/* UI Preview Box */}
        <div className="mt-4 rounded-xl border border-border/70 bg-white p-1.5 sm:p-2 shadow-sm overflow-hidden select-none">
          <img
            src={study.image}
            alt={study.imageAlt}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>

        {/* Link and Attribution below */}
        <div className="mt-4 flex flex-col gap-0.5 text-xs">
          <span className="text-primary font-semibold">
            Energieassistent ansehen
          </span>
          <span className="text-primary text-xs">↓</span>
          <a
            href={study.href}
            target="_blank"
            rel="noreferrer"
            className="underline text-foreground hover:text-primary font-medium w-fit mt-1 text-xs sm:text-sm"
          >
            {study.link}
          </a>
          <span className="text-foreground font-bold text-xs mt-0.5">
            {study.author}
          </span>
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-6 flex flex-col justify-start space-y-6 lg:pt-1">
        {study.blocks.map((block) => (
          <div key={block.heading}>
            <h4 className="text-base sm:text-lg font-bold text-foreground mb-1.5">
              {block.heading}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {block.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdsCaseStudiesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? caseStudies.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === caseStudies.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      id="fallstudien"
      className="relative bg-background px-6 py-20 md:py-28 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* Main Section Headline */}
        <Reveal delay={0.1} className="mb-12 flex justify-center">
          <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
            Ergebnisse aus der Praxis
          </h2>
        </Reveal>

        {/* Single Visible Case Study with animation */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              <CaseStudyCard study={caseStudies[currentIndex]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Bar like uploaded screenshot */}
        <div className="mt-8 flex items-center justify-center gap-4 select-none">
          {/* Previous Arrow Button */}
          <button
            onClick={prevSlide}
            aria-label="Vorherige Fallstudie"
            className="flex items-center justify-center w-9 h-9 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Indicators / Progress bars */}
          <div className="flex items-center gap-2">
            {caseStudies.map((_, index) => {
              const isActive = index === currentIndex;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Gehe zu Fallstudie ${index + 1}`}
                  className="py-2 px-0.5 focus:outline-none group"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-10 sm:w-12 bg-foreground"
                        : "w-5 sm:w-6 bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={nextSlide}
            aria-label="Nächste Fallstudie"
            className="flex items-center justify-center w-9 h-9 rounded-full text-foreground/80 hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* CTA */}
        <CTAButton
          text="Kostenlose Demo buchen"
          className="mt-10 flex justify-center"
        />
      </div>
    </section>
  );
};

export default AdsCaseStudiesSection;
