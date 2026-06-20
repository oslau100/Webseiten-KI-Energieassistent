import { Calendar, FileSearch, ClipboardCheck } from "lucide-react";
import { Button } from "./ui/button";

export const NextStep = () => {
  return (
    <section className="bg-[#FDFDFD] py-16 md:py-20 px-3 sm:px-4 md:px-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="relative bg-[#000000] rounded-2xl md:rounded-[2rem] px-5 py-10 sm:p-8 md:p-8 lg:p-16 overflow-hidden shadow-2xl">
          {/* Grid Background */}
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
          
          {/* Radial gradient to fade out grid at edges */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]"></div>

          <div className="relative z-10">
            <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16 md:mb-24">
              Was ist Dein nächster<br className="hidden md:block lg:hidden" /> Schritt?
            </h2>

            <div className="relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden lg:block absolute top-10 left-[16.66%] right-[16.66%] h-1.5 bg-[#2a9d4f] z-0"></div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-8">
                {/* Step 1 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#2a9d4f] flex items-center justify-center mb-6 md:mb-8 shadow-[0_0_20px_rgba(42,157,79,0.3)]">
                    <Calendar className="w-10 h-10 text-[#1a231c]" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Termin auswählen</h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-[280px]">
                    Klicke auf den Button und wähle im Kalender einen freien Slot, an dem wir in Ruhe über deinen Vertrieb sprechen können.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#2a9d4f] flex items-center justify-center mb-6 md:mb-8 shadow-[0_0_20px_rgba(42,157,79,0.3)]">
                    <FileSearch className="w-10 h-10 text-[#1a231c]" strokeWidth={2} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">Kurzes Formular ausfüllen</h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-[280px]">
                    Beantworte ein paar Fragen zu deinem aktuellen Vertrieb. So können wir uns gezielt vorbereiten und dir sofort konkrete Ansätze zeigen.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-[#2a9d4f] flex items-center justify-center mb-6 md:mb-8 shadow-[0_0_20px_rgba(42,157,79,0.3)]">
                    <ClipboardCheck className="w-10 h-10 text-[#1a231c]" strokeWidth={2} />
                  </div>
<h3 className="text-xl md:text-2xl font-bold text-white mb-4">Potenzialanalyse</h3>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-[280px]">
                    In einem 30-minütigen Gespräch analysieren wir deinen aktuellen Vertrieb und prüfen gemeinsam, welches Potenzial ein Energieassistent für deine individuelle Situation bietet.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 md:mt-24 flex justify-center w-full">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm sm:text-base md:text-lg font-bold px-4 sm:px-8 py-6 h-auto whitespace-normal text-center rounded-md shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 w-full sm:w-auto max-w-md"
                asChild
              >
                <a href="https://calendly.com/laurent-digital-info/60min" target="_blank" rel="noopener noreferrer">
                  Kostenfreie Potenzialanalyse buchen
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
