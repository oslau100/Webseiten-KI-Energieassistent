import { CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-[#0b1221] leading-tight mb-20">
          Deshalb vertrauen{" "}
          <span className="relative inline-block">
            <span className="relative z-10">über 10.000</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-[#42f77a] -z-0"></span>
          </span>
          <br />
          Haushalte TarifButler
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Feature 1 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#42f77a] shrink-0" />
              <h3 className="text-2xl font-bold text-[#0b1221]">
                Kein Vergleich mehr nötig
              </h3>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              Eine sichere Empfehlung statt hunderte Optionen. TarifButler
              filtert den Markt für dich du musst nichts vergleichen oder
              prüfen.
            </p>
          </div>

          {/* Feature 2 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#42f77a] shrink-0" />
              <h3 className="text-2xl font-bold text-[#0b1221]">
                Nur geprüfte Anbieter
              </h3>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              Neue oder auffällig bewertete Anbieter werden sofort ausgefiltert.
              TarifButler empfiehlt nur etablierte Anbieter mit geprüfter
              Zuverlässigkeit und positiver Kundenhistorie.
            </p>
          </div>

          {/* Feature 3 */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#42f77a] shrink-0" />
              <h3 className="text-2xl font-bold text-[#0b1221]">
                Bleibt für dich aktiv
              </h3>
            </div>
            <p className="text-lg text-slate-700 leading-relaxed">
              TarifButler überwacht deine Kündigungsfristen und meldet sich
              automatisch mit neuen Empfehlungen, wenn sich ein Wechsel lohnt.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-20">
          <Button className="bg-[#42f77a] hover:bg-[#42f77a]/90 text-black text-xl px-12 py-8 rounded-full font-bold shadow-lg transition-transform hover:scale-105">
            Jetzt Ersparnis prüfen
          </Button>
        </div>
      </div>
    </section>
  );
};
