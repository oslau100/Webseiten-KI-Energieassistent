import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";

const steps = [
  {
    step: "Schritt 1:",
    title: "Wir bauen deinen Energieassistent",
    description:
      "Im ersten Schritt richten wir die komplette technische Infrastruktur deines Energieassistent ein – von der Landingpage über die automatisierte Tarifprüfung und Empfehlung bis hin zu KI-gestützter Beratung, Follow-ups, CRM und Dashboard. Alles wird individuell auf deinen Vertrieb abgestimmt.",
    align: "right",
  },
  {
    step: "Schritt 2:",
    title: "Wir schaffen die Grundlage für planbare Abschlüsse",
    description:
      "Damit dein Energieassistent kontinuierlich neue Interessenten und Abschlüsse generieren kann, erhältst du von uns alles, was du dafür brauchst: individuell designte Einwurfkarten, bewährte Content-Strategien für Social Media und konkrete Konzepte für bezahlte Werbung. So entsteht ein planbarer Strom neuer Interessenten und Abschlüsse.",
    align: "left",
  },
  {
    step: "Schritt 3:",
    title: "Wir überwachen und optimieren die Infrastruktur",
    description:
      "Nach der Einrichtung bleibt dein Energieassistent nicht sich selbst überlassen. Wir überwachen und optimieren die technische Infrastruktur kontinuierlich im Hintergrund, damit alles zuverlässig läuft und dein Vertrieb langfristig planbar neue Interessenten und Abschlüsse generieren kann.",
    align: "right",
  },
];

export const CollaborationProcess = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on the middle of the screen
      const scrollPosition = windowHeight / 2;
      const currentPos = scrollPosition - rect.top;
      
      // Clamp between 0 and 1
      const progress = Math.max(0, Math.min(1, currentPos / rect.height));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check on mount
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="py-20 md:py-32 bg-[#FDFDFD]">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-[#1a231c] mb-6 leading-tight">
            So läuft die Zusammenarbeit mit uns ab
          </h2>
          <p className="text-lg md:text-xl text-[#1a231c]/80 leading-relaxed font-medium max-w-3xl mx-auto">
            In 3 einfachen Schritten zu deinem Energieassistent und planbar mehr Abschlüssen
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative max-w-4xl mx-auto" ref={timelineRef}>
          <div className="relative">
            {/* Central Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[2px] bg-[#2a9d4f] md:-translate-x-1/2 z-0"></div>

            {/* Animated Scroll Marker */}
            <div 
              className="absolute left-6 md:left-1/2 w-5 h-5 bg-[#000000] rounded-md -translate-x-1/2 -translate-y-1/2 shadow-md z-20 transition-all duration-75 ease-out"
              style={{ top: `${scrollProgress * 100}%` }}
            ></div>

            {/* Steps */}
            <div className="relative py-8 space-y-16 md:space-y-24 z-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row items-start relative ${
                    step.align === "left" ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Empty space for alternating layout on desktop */}
                  <div className="hidden md:block md:w-1/2 flex-shrink-0"></div>

                  {/* Content Box */}
                  <div
                    className={`w-full md:w-1/2 pl-16 md:pl-0 ${
                      step.align === "left" ? "md:pr-16 lg:pr-24 text-left" : "md:pl-16 lg:pl-24 text-left"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-[#2a9d4f] font-bold text-base md:text-lg tracking-wide">
                        {step.step}
                      </span>
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#1a231c] leading-snug mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-700 text-base md:text-lg leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12 md:mt-16">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base md:text-lg tracking-tighter sm:tracking-normal font-bold px-6 sm:px-12 py-3 sm:py-4 md:px-16 md:py-4 rounded-md transition-all hover:scale-105 h-auto whitespace-normal sm:whitespace-nowrap shadow-lg"
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
