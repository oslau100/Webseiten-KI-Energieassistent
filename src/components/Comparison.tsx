import { Check, X } from "lucide-react";
import { Button } from "./ui/button";

export const Comparison = () => {
  const classicItems = [
    "Du bist auf Kaltakquise und Empfehlungen angewiesen",
    "Abschlüsse kommen unregelmäßig und sind kaum planbar",
    "Du musst Interesse erst im Gespräch erzeugen",
    "Viele Kontakte gehen verloren oder werden nicht nachverfolgt",
    "Jeder Abschluss kostet Zeit, Energie und Aufmerksamkeit",
    "Wachstum bedeutet meist mehr Arbeit oder mehr Mitarbeiter",
    "Interessenten fühlen sich oft unter Druck gesetzt"
  ];

  const systemItems = [
    "Interessenten werden neugierig und kommen von selbst auf dich zu",
    "Vertrauen entsteht bereits vor dem ersten Gespräch",
    "Der Energieassistent berät, qualifiziert und fasst automatisch nach",
    "Du machst konstant und planbar neue Abschlüsse",
    "Alle Leads, Aufgaben und Abschlüsse sind zentral organisiert",
    "Ein Großteil des Prozesses läuft automatisch im Hintergrund",
    "Du kannst wachsen, ohne deinen Vertriebsaufwand proportional zu erhöhen"
  ];

  return (
    <section className="py-20 md:py-32 bg-[#FDFDFD]">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-center text-[#1a231c] mb-12 md:mb-16 tracking-tight">
          Klassischer Energievertrieb vs. <span className="text-[#2a9d4f]">Energieassistent</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Classic Side */}
          <div className="bg-white rounded-2xl p-8 md:p-10 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-[#1a231c] mb-8 md:mb-10">
              Klassischer Energievertrieb
            </h3>
            <ul className="space-y-6">
              {classicItems.map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-[#1a231c]" strokeWidth={3} />
                  </div>
                  <span className="text-[#1a231c] font-medium leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* System Side */}
          <div className="bg-[#1a231c] rounded-2xl p-8 md:p-10 lg:p-12 shadow-lg relative overflow-hidden">
            <div 
              className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
              style={{
                backgroundImage: `
                  linear-gradient(to right, #ffffff 1px, transparent 1px),
                  linear-gradient(to bottom, #ffffff 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            ></div>
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#1a231c_100%)] pointer-events-none"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8 md:mb-10">
                Mit Energieassistent
              </h3>
              <ul className="space-y-6">
                {systemItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-4 h-4 text-[#2a9d4f]" strokeWidth={3} />
                    </div>
                    <span className="text-white font-medium leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-16 flex justify-center">
          <Button 
            size="lg" 
            className="bg-[#1a231c] text-white hover:bg-[#1a231c]/90 text-base md:text-lg font-bold px-8 py-6 rounded-md shadow-lg transition-all hover:scale-105"
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
