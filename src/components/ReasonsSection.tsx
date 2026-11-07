import { useState, useEffect } from "react";
import {
  Handshake,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReasonCard {
  id: number;
  icon: React.ElementType;
  title: string;
  description: string;
}

const reasons: ReasonCard[] = [
  {
    id: 1,
    icon: Handshake,
    title: "0 € für Nutzer. Wiederkehrender Wert für dich.",
    description:
      "Der Energieassistent übernimmt Aufgaben, für die sonst Zeit, Wissen und Recherche nötig wären – für den Nutzer komplett kostenlos. Gleichzeitig spart er dem Nutzer bares Geld. Du gewinnst den Nutzer einmal und kannst mit demselben Nutzer typischerweise alle 12–24 Monate erneut verdienen.",
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Hohe Margen",
    description:
      "Das Modell ist digital, automatisiert und hat vergleichsweise geringe laufende Kosten. Gleichzeitig erhältst du bei einer angenommenen Ersparnis im Schnitt rund 150–200 € Vergütung – damit sind attraktive Margen möglich.",
  },
  {
    id: 3,
    icon: Wallet,
    title: "Keine hohe Startinvestition notwendig",
    description:
      "Du startest ohne hohe Einmalzahlung oder Einrichtungsgebühr. Statt mehrere Tausend Euro in Coaching, Softwareentwicklung, Warenbestand oder Geschäftsräume zu investieren, nutzt du eine bereits bestehende Infrastruktur.",
  },
  {
    id: 4,
    icon: ShieldCheck,
    title: "Langfristig & seriös",
    description:
      "Du baust auf einem etablierten Milliardenmarkt mit echtem Grundbedarf auf. Über 40 Mio. Haushalte brauchen Energie – unabhängig von Trends, Hypes oder kurzfristigen Geschäftsmodellen.",
  },
  {
    id: 5,
    icon: Globe,
    title: "Örtlich unabhängig",
    description:
      "Das gesamte Geschäftsmodell läuft digital und lässt sich von überall aus betreiben. Nutzergewinnung, Betreuung und Abwicklung funktionieren online – im Wesentlichen brauchst du dafür nur Laptop oder Smartphone.",
  },
  {
    id: 6,
    icon: Clock,
    title: "Nebenberuflich startbar",
    description:
      "Du bekommst eine fertige White-Label-Lösung, bei der große Teile des Tagesgeschäfts automatisiert laufen. Keine monatelange Lern- oder Technikphase – du kannst parallel zu Job oder bestehender Selbstständigkeit starten.",
  },
];

const ReasonsSection = () => {
  const isMobile = useIsMobile();
  const itemsPerPage = isMobile ? 1 : 3;
  const [currentPage, setCurrentPage] = useState<number>(0);
  const totalPages = Math.ceil(reasons.length / itemsPerPage);

  // Reset page when viewport changes to avoid out-of-range pages
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(0);
    }
  }, [itemsPerPage, currentPage, totalPages]);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleReasons = reasons.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage,
  );

  return (
    <section className="relative bg-background px-6 py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header row with Headline and Arrow Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <Reveal className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
              6 Gründe, warum dieses Geschäftsmodell so besonders ist
            </h2>
          </Reveal>

          {/* Slider Arrow Controls */}
          <Reveal delay={0.1} className="shrink-0 flex items-center gap-3">
            <button
              onClick={prevPage}
              aria-label="Vorherige Gründe"
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${
                currentPage === 0
                  ? "border-border text-muted-foreground/60 hover:border-foreground/30 hover:text-foreground"
                  : "border-border text-foreground hover:border-primary hover:text-primary shadow-sm"
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextPage}
              aria-label="Nächste Gründe"
              className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 ${
                currentPage === totalPages - 1
                  ? "border-primary text-primary shadow-sm"
                  : "border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </Reveal>
        </div>

        {/* Cards Grid / Carousel View */}
        <Reveal delay={0.2}>
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
              >
                {visibleReasons.map((reason, index) => {
                  const isHighlighted = index === 0;
                  const IconComponent = reason.icon;

                  return (
                    <div
                      key={reason.id}
                      className={`flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                        isHighlighted
                          ? "bg-[#1f4d43] text-white shadow-lg"
                          : "bg-card border border-border/80 text-foreground shadow-sm hover:border-primary/40"
                      }`}
                    >
                      {/* Icon Container */}
                      <div className="mb-4">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                            isHighlighted
                              ? "bg-[#2d6156] text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-base sm:text-lg font-bold tracking-tight mb-2 leading-snug ${
                          isHighlighted ? "text-white" : "text-foreground"
                        }`}
                      >
                        {reason.title}
                      </h3>

                      {/* Description */}
                      <p
                        className={`text-sm leading-relaxed ${
                          isHighlighted
                            ? "text-emerald-100/90 font-normal"
                            : "text-muted-foreground font-normal"
                        }`}
                      >
                        {reason.description}
                      </p>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* Pagination Dots */}
        <Reveal delay={0.3} className="mt-10 flex justify-center">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                aria-label={`Gehe zu Seite ${page + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentPage === page
                    ? "w-8 h-2.5 bg-[#1f4d43]"
                    : "w-2.5 h-2.5 bg-border hover:bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ReasonsSection;
