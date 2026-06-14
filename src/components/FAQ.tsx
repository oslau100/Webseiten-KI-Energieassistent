import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Was kostet mich der Service von Tarifbutler?",
    answer: "TarifButler ist für dich vollständig kostenlos. Du kannst deinen Tarif prüfen, eine Empfehlung erhalten und den Wechsel durchführen, ohne etwas zu bezahlen. TarifButler finanziert sich über eine Provision vom Anbieter, wenn du dich für einen Tarif entscheidest. Für dich entstehen dadurch keine zusätzlichen Kosten.",
  },
  {
    question: "Sind meine Daten sicher?",
    answer: "Ja. Deine Daten werden ausschließlich verwendet, um den passenden Tarif für dich zu finden und den Wechsel durchzuführen. TarifButler verarbeitet deine Angaben vertraulich und gibt sie nur an den neuen Anbieter weiter, wenn du dich aktiv für einen Wechsel entscheidest. Deine Daten werden niemals verkauft oder für andere Zwecke verwendet. Selbstverständlich arbeiten wir zu 100% DSGVO-konform.",
  },
  {
    question: "Wie funktioniert TarifButler?",
    answer: "Du beantwortest zunächst ein paar kurze Fragen zu deinem aktuellen Tarif oder Haushalt. Anschließend analysiert der KI-gestützte TarifButler automatisch verfügbare Tarife, filtert unsichere oder riskante Angebote aus und empfiehlt dir einen geprüften, sicheren Tarif mit möglicher Ersparnis. Du musst nichts vergleichen oder selbst prüfen.",
  },
  {
    question: "Wie funktioniert der Wechsel?",
    answer: "Wenn du dich für den empfohlenen Tarif entscheidest, übernimmt TarifButler den gesamten Wechselprozess für dich. Der neue Anbieter kümmert sich um die Kündigung deines alten Vertrags und die Anmeldung des neuen Tarifs. Du musst nichts weiter tun.",
  },
  {
    question: "Gibt es eine Unterbrechung der Strom- oder Gasversorgung beim Wechsel?",
    answer: "Nein. Deine Versorgung bleibt jederzeit ohne Unterbrechung bestehen. Der Wechsel erfolgt im Hintergrund, während du weiterhin wie gewohnt versorgt wirst. Gesetzlich ist sichergestellt, dass deine Energieversorgung jederzeit gewährleistet ist.",
  },
  {
    question: "Was passiert nach dem Wechsel?",
    answer: "TarifButler bleibt auch nach dem Wechsel für dich aktiv. Dein Tarif wird weiterhin überwacht und du wirst automatisch informiert, wenn zukünftig ein besserer oder günstigerer Tarif verfügbar ist. So wird sichergestellt, dass du langfristig von sicheren und passenden Tarifen profitierst.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl md:text-5xl font-extrabold text-center text-[#0b1221] mb-16"
        >
          Häufig gestellte Fragen
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-100 rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-6 py-6 hover:no-underline bg-[#f4f5f8] text-left text-xl font-bold text-[#0b1221] [&[data-state=open]]:bg-[#f4f5f8] [&[data-state=open]>svg]:rotate-45">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 py-6 text-[#0b1221] text-base leading-relaxed bg-white">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
