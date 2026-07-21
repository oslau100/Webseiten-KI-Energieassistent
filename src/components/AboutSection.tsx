import { Button } from "@/components/ui/button";

export const AboutSection = () => {
  return (
    <section className="bg-[#FDFDFD] py-20 text-slate-900">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Top Row */}
        <div className="mb-16 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="space-y-6 order-2 lg:order-1">
            <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl font-bold text-[#1a231c] hidden lg:block">
              Wer steckt hinter <span className="text-primary">Energieassistent.io</span>
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-slate-700 sm:text-lg">
              <p>
                Osasere Laurent ist seit über 6 Jahren im Energiemarkt aktiv und hat selbst im Door-to-Door-Vertrieb gestartet. Die Herausforderungen des klassischen Vertriebs kennt er daher aus erster Hand.
              </p>
              <p>
                Über die Jahre wurden mehrere hundert Verträge persönlich abgeschlossen. Dabei zeigte sich immer wieder dasselbe Bild: viel Aufwand, wenig Planbarkeit und zu viele verlorene Chancen. Genau daraus entstand die Idee für den Energieassistenten.
              </p>
              <p>
                Die ersten Prozesse wurden automatisiert und die Lösung zunächst im eigenen Vertrieb eingesetzt. Über die Jahre wurden darüber mehr als 2.000 Verträge abgeschlossen. Seitdem wurde das System kontinuierlich weiterentwickelt und in der Praxis immer weiter verbessert.
              </p>
              <p>
                Heute unterstützt Osasere Energievertriebler dabei, genau dieses System für ihren eigenen Vertrieb zu nutzen – um Prozesse zu vereinfachen und Abschlüsse planbarer zu machen.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 order-1 lg:order-2">
            <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl font-bold text-[#1a231c] lg:hidden mb-2 text-center">
              Wer steckt hinter <span className="text-primary">Energieassistent.io</span>
            </h2>
            <div className="relative w-full rounded-2xl shadow-lg bg-white p-3 sm:p-4 h-[400px] min-[400px]:h-[450px] sm:h-[600px]">
              <img
                src="https://vibe.filesafe.space/1779705604088859430/attachments/d4930340-5977-4138-b91e-0909b811de67.png"
                alt="Osasere Laurent"
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
            <div className="text-center sm:text-left mt-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Osasere Laurent</h3>
              <p className="text-[#195044] text-base sm:text-lg mt-1">Gründer & Geschäftsführer</p>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-white">
            <img
              src="https://vibe.filesafe.space/1779705604088859430/attachments/edb61f2b-b1c0-47ac-958f-915654225372.png"
              alt="Unser Standort"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl font-bold text-[#1a231c]">
              Unser Standort
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-slate-700 sm:text-lg">
              <p>
                Adenauerstraße 20A | 52146 Würselen
                <br />
                Von unserem Standort in Würselen aus unterstützen wir Energievertriebler in ganz Deutschland dabei, ihren Vertrieb zu automatisieren und planbar mehr Abschlüsse zu erzielen.
              </p>
            </div>
            <Button 
              size="lg" 
              className="mt-4 cta-shimmer bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base md:text-lg tracking-tighter sm:tracking-normal font-bold px-6 sm:px-12 py-3 sm:py-4 md:px-16 md:py-4 rounded-md transition-all hover:scale-105 h-auto whitespace-normal sm:whitespace-nowrap"
              asChild
            >
              <a href="https://calendly.com/energieassistent-potentialanalyse/30min" target="_blank" rel="noopener noreferrer">
                Kostenfreie Potenzialanalyse buchen
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
