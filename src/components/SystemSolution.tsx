import { Button } from "./ui/button";

export const SystemSolution = () => {
  return (
    <section className="relative w-full py-20 md:py-32 bg-[#000000] text-white overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      ></div>

      <div className="container relative z-10 mx-auto px-4 max-w-[1500px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_700px] xl:grid-cols-[1fr_900px] gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text Content */}
          <div className="space-y-6 max-w-2xl text-center md:text-left mx-auto md:mx-0">
            <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8">
              Der fehlende Baustein in deinem Vertrieb
            </h2>

            <div className="space-y-6 text-white/80 text-[15px] md:text-base leading-relaxed font-medium">
              <p>
                Was dir fehlt, ist ein System, das Interesse weckt, Hürden senkt und bereits vor dem ersten Gespräch Vertrauen aufbaut.
              </p>
              
              <p>
                Genau das übernimmt der Energieassistent für dich. Statt mehr zu klingeln, Budget zu verbrennen oder Interessenten aktiv überzeugen zu müssen, begleitet der Energieassistent den gesamten Prozess automatisiert – von der Tarifprüfung über Beratung und Nachfassen bis hin zum Vertragsabschluss und der Betreuung.
              </p>
              
              <p>
                Durch die niedrige Einstiegshürde und den sofort erkennbaren Nutzen erreichst du deutlich mehr Menschen. So entstehen mehr Interessenten und Abschlüsse – mit weniger Druck, weniger Ablehnung und deutlich weniger manueller Arbeit.
              </p>
            </div>
          </div>

          {/* Right Column: Graphic Representation */}
          <div className="relative w-full max-w-[1000px] mx-auto mt-16 md:mt-12 lg:mt-0 flex items-center justify-center mb-16 sm:mb-0">
            <img 
              src="https://vibe.filesafe.space/1779705604088859430/attachments/921658c1-2ee1-4ae6-a37c-a126410c4d40.png" 
              alt="Automatisiertes Vertriebssystem" 
              className="w-full h-auto object-contain drop-shadow-[0_0_40px_rgba(42,157,79,0.2)] scale-[1.75] sm:scale-[1.3] md:scale-125 lg:scale-[1.35] origin-center"
            />
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="flex justify-center mt-8 sm:mt-24 md:mt-24 relative z-20">
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base md:text-lg tracking-tighter sm:tracking-normal font-bold px-6 sm:px-12 py-3 sm:py-4 md:px-16 md:py-4 rounded-md transition-all hover:scale-105 h-auto whitespace-normal sm:whitespace-nowrap shadow-[0_0_30px_rgba(255,255,255,0.1)]"
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
