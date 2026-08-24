import { motion, Variants } from "framer-motion";

const steps = [
  {
    id: 1,
    num: "1",
    title: "TarifButler aktivieren",
    description: "Beantworte ein paar einfache Fragen zu deinem Tarif und Haushalt - keine Rechnungen oder Dokumente nötig, nur starten und durchklicken.",
  },
  {
    id: 2,
    num: "2",
    title: "KI Prüfung",
    description: "TarifButler scannt hunderte Tarife und filtert Lockangebote, unsichere Anbieter und riskante Bedingungen für dich aus.",
  },
  {
    id: 3,
    num: "3",
    title: "Tarifempfehlung erhalten",
    description: "Du erhältst einen sicheren Tarif mit echter Ersparnis - keine Auswahl, kein Vergleichen, nur eine bedenkenlose Entscheidung.",
  },
  {
    id: 4,
    num: "4",
    title: "Wechsel & Betreuung",
    description: "TarifButler übernimmt den kompletten Wechsel für dich und bleibt danach aktiv - überwacht deine Fristen und meldet sich automatisch, wenn ein erneuter Wechsel sinnvoll ist.",
  },
];

export type HowItWorksStep = {
  id: string | number;
  num: string;
  title: string;
  description: string;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export const HowItWorks = ({
  title = "So einfach funktioniert's",
  steps: displayedSteps = steps,
}: {
  title?: string;
  steps?: readonly HowItWorksStep[];
} = {}) => {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-center text-[#0b1221] mb-20"
        >
          {title}
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative border-l-4 border-gray-100 ml-[26px] md:ml-[38px] space-y-12 md:space-y-16 py-4"
        >
          {displayedSteps.map((step) => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className="relative flex flex-row items-start group"
            >
              {/* Circle positioned exactly on the line */}
              <div className="absolute -left-[30px] md:-left-[42px] top-0 flex-shrink-0 flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#42f77a] shadow-[0_0_30px_rgba(66,247,122,0.3)] border-4 border-white transition-transform duration-300 group-hover:scale-110">
                <span className="text-2xl md:text-4xl font-black text-[#0b1221]">
                  {step.num}
                </span>
              </div>
              
              {/* Text content pushed to the right */}
              <div className="pl-10 md:pl-16 pt-1 md:pt-4">
                <h3 className="text-2xl font-bold text-[#0b1221] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#0b1221] text-lg opacity-80 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
