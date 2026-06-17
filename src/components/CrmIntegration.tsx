import { Button } from "./ui/button";

export const CrmIntegration = () => {
  return (
    <section className="py-20 md:py-32 bg-[#FDFDFD]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold mb-6 text-sm transition-colors whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-50" style={{ animationDuration: '3s' }}></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(42,157,79,0.8)]"></span>
            </span>
            Perfektes Zusammenspiel
          </div>
          
          <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-[#1a231c] leading-tight mb-8">
            Energieassistent und CRM<br />arbeiten Hand in Hand
          </h2>
          
          <p className="text-lg md:text-xl text-[#1a231c]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Alle Daten aus deinem Energieassistent laufen automatisch in dein CRM
            und Dashboard ein – übersichtlich, in Echtzeit und sofort verfügbar. Du
            siehst neue Leads, Abschlüsse, Aufgaben und Follow-ups zentral an
            einem Ort und kannst jederzeit selbst aktiv werden, Interessenten
            nachverfolgen oder direkt kontaktieren.
          </p>
        </div>

        <div className="relative rounded-2xl md:rounded-[2rem] p-[3px] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.08)]">
          <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#2a9d4f_50%,transparent_100%)]" />
          <div className="relative bg-white rounded-[14px] md:rounded-[30px] overflow-hidden">
            <img 
              src="https://vibe.filesafe.space/1779705604088859430/attachments/83795923-f5b6-48a7-8560-04923eccea8c.png" 
              alt="CRM Dashboard" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12 md:mt-16">
          <Button
            size="lg"
            className="bg-[#1a231c] text-white hover:bg-[#1a231c]/90 text-sm md:text-base font-bold px-8 py-6 rounded-md shadow-lg transition-all hover:scale-105"
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
