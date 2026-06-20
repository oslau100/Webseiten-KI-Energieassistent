import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Star, ArrowDown } from "lucide-react";

const caseStudyData = {
  title: "2.366 Verträge automatisiert abgeschlossen bei nur Ø 56€ pro Abschluss",
  website: "www.tarif-butler.de",
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
  )
};

// Duplicate the data 3 times as requested
const caseStudies = [
  { id: 1, ...caseStudyData },
  { id: 2, ...caseStudyData },
  { id: 3, ...caseStudyData },
];

export const CaseStudies = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => setActiveIndex((p) => (p + 1) % caseStudies.length);
  const prevSlide = () => setActiveIndex((p) => (p - 1 + caseStudies.length) % caseStudies.length);

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
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(42,157,79,0.8)]"></span>
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
                  FALLSTUDIE {caseStudies[activeIndex].id}
                </Badge>
                
                <h3 className="text-[#1a231c] text-2xl md:text-3xl font-bold leading-tight mb-8">
                  {caseStudies[activeIndex].title}
                </h3>

                <div className="bg-gray-100 rounded-2xl p-3 mb-10 w-full flex items-center justify-center">
                  <img 
                    src="https://vibe.filesafe.space/1779705604088859430/attachments/f3190deb-9a68-459a-9666-decfb70c5580.png" 
                    alt="TarifButler App Preview" 
                    className="w-full h-auto object-contain rounded-xl shadow-sm bg-white"
                  />
                </div>
                
                <div className="mt-auto">
                  <div className="flex flex-col items-start mb-3">
                    <span className="text-xs md:text-sm font-bold mb-1 text-[#2a9d4f]">Energieassistent ansehen</span>
                    <ArrowDown className="w-5 h-5 ml-16 animate-bounce text-[#2a9d4f]" />
                  </div>
                  <div className="flex flex-col gap-1 mb-4">
                    <a 
                      href={`https://${caseStudies[activeIndex].website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-[#2a9d4f] transition-colors underline underline-offset-4"
                    >
                      {caseStudies[activeIndex].website}
                    </a>
                    <span className="font-bold text-[#1a231c]">Switch Energy GmbH</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 fill-[#2a9d4f] text-[#2a9d4f]" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="md:col-span-7 flex flex-col gap-8">
                <div>
                  <h4 className="text-[#1a231c] text-xl font-bold mb-3">Ausgangssituation</h4>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {caseStudies[activeIndex].situation}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-[#1a231c] text-xl font-bold mb-3">Ergebnis</h4>
                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                    {caseStudies[activeIndex].result}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <button 
              onClick={prevSlide} 
              className="text-white hover:text-[#2a9d4f] transition-colors p-2"
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
              className="text-white hover:text-[#2a9d4f] transition-colors p-2"
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base md:text-lg tracking-tighter sm:tracking-normal font-bold px-6 sm:px-12 py-3 sm:py-4 md:px-16 md:py-4 rounded-md transition-all hover:scale-105 h-auto whitespace-normal sm:whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.1)]"
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
