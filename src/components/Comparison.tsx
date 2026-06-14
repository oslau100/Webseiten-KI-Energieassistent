import { motion } from "framer-motion";
import { Check, XCircle } from "lucide-react";
import { Button } from "./ui/button";

const comparisonLeft = [
  "Du vergleichst hunderte Tarife mühsam selbst und bist am Ende unsicherer als vorher",
  "Du musst Lockangebote, Bonus-Tricks und versteckte Kosten selbst erkennen",
  "Du musst selbst prüfen, ob Anbieter stabil oder risikoreich sind",
  "Du erhältst viele Optionen, aber keine klare sichere Empfehlung",
  "Nach dem Wechsel bist du auf dich gestellt es gibt keine Erinnerung oder Betreuung"
];

const comparisonRight = [
  "TarifButler filtert hunderte Tarife für dich du bekommst eine klare, sichere Empfehlung",
  "Lockangebote, Boni-Tricks und versteckte Kosten werden automatisch für dich ausgeschlossen",
  "TarifButler prüft Anbieter auf Stabilität und Risiko du bekommst nur sichere Anbieter",
  "Du bekommst eine geprüfte Empfehlung statt endlose listen",
  "TarifButler bleibt für dich aktiv überwacht Fristen und meldet sich automatisch mit Empfehlungen"
];

export const Comparison = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-[13px] min-[400px]:text-sm md:text-lg font-bold text-foreground mb-4"
          >
            Vergleichsportale zeigen dir nur Optionen.<br />
            TarifButler gibt dir eine sichere Empfehlung.
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight"
          >
            So unterscheidet sich TarifButler von klassischen Vergleichsportalen
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-16">
          {/* Left Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-[#f4f5f8] rounded-[2rem] p-8 md:p-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-center text-[#0b1221] mb-10">
              Mit Vergleichsportalen
            </h3>
            <ul className="space-y-6">
              {comparisonLeft.map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <XCircle className="w-6 h-6 mt-1 shrink-0 text-white" fill="#0b1221" />
                  <span className="text-lg text-[#0b1221] leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-[#42f77a] rounded-[2rem] p-8 md:p-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-center text-[#0b1221] mb-10">
              Mit TarifButler
            </h3>
            <ul className="space-y-6">
              {comparisonRight.map((text, i) => (
                <li key={i} className="flex items-start gap-4">
                  <Check className="w-6 h-6 mt-1 shrink-0 text-[#0b1221]" strokeWidth={3} />
                  <span className="text-lg text-[#0b1221] leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Button className="bg-[#42f77a] hover:bg-[#42f77a]/90 text-[#0b1221] text-lg px-10 py-7 rounded-full font-bold shadow-lg transition-transform hover:scale-105">
            Jetzt Ersparnis prüfen
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
