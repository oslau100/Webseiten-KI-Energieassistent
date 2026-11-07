import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";

interface StepItem {
  number: number;
  label: string;
  title: string;
  description: string;
  meta?: string;
}

const steps: StepItem[] = [
  {
    number: 1,
    label: "Schritt 1:",
    title: "Deine Marke konfigurieren",
    description:
      "Im Onboarding wirst du von deinem persönlichen Ansprechpartner Schritt für Schritt durch unseren Konfigurator geführt. Dabei legst du unter anderem Name, Branding, Farben, Logo und Domain deines Energieassistenten fest. Wir führen dich durch den gesamten Prozess.",
    meta: "Dein Aufwand: ca. 3 Std.",
  },
  {
    number: 2,
    label: "Schritt 2:",
    title: "Dein Energieassistent wird eingerichtet",
    description:
      "Anschließend übernehmen wir die technische Einrichtung und bringen deinen Energieassistenten startbereit an den Markt. Von der Landingpage über die automatisierte Tarifprüfung und Empfehlung bis hin zu Follow-ups, CRM und Dashboard wird alles auf deinen Vertrieb abgestimmt.",
    meta: "Dauer: ca. 7 Tage",
  },
  {
    number: 3,
    label: "Schritt 3:",
    title: "Deine Nutzergewinnung aktivieren",
    description:
      "Jetzt entscheidest du, über welche unserer Systeme du neue Nutzer gewinnen möchtest – zum Beispiel über Content, Ads oder Empfehlungen. Die Systeme sind bereits vorbereitet und helfen dir dabei, kontinuierlich neue Nachfrage für deinen Energieassistenten aufzubauen.",
  },
  {
    number: 4,
    label: "Schritt 4:",
    title: "Nutzer gewinnen & Umsatz machen",
    description:
      "Dein Energieassistent beginnt jetzt, neue Nutzer zu gewinnen und Tarifprüfungen für dich abzuwickeln. Du erhältst die relevanten Kontakte und kannst daraus neue Abschlüsse und laufenden Umsatz entwickeln – während ein großer Teil des Prozesses im Hintergrund automatisiert läuft.",
    meta: "Dein Aufwand: ab ca. 1 Std./Tag",
  },
  {
    number: 5,
    label: "Schritt 5:",
    title: "Mit uns weiter wachsen",
    description:
      "Du bist auch nach dem Start nicht auf dich allein gestellt. Mit unserer Academy, Community und regelmäßigen Live-Calls bekommst du das Wissen, die Unterstützung und den Austausch, den du brauchst, um deinen Energieassistenten weiterzuentwickeln und dein Geschäft auszubauen.",
  },
];

const StepsTimelineSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 70%", "end 80%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      ref={containerRef}
      id="section-steps"
      className="relative bg-white px-6 py-24 md:py-32 overflow-hidden"
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-16 md:mb-24 text-center flex flex-col items-center">
          <Reveal className="mb-6">
            <span className="inline-block border-b border-dotted border-gray-300 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a5147]">
              Der Ablauf
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="max-w-3xl text-4xl md:text-5xl font-normal tracking-tight leading-tight text-gray-900">
              In 5 Schritten zu deinem eigenen Energieassistenten
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="mt-6">
            <p className="max-w-2xl text-lg text-gray-500 leading-relaxed">
              Von der Einrichtung bis zu den ersten Nutzern – mit einem klaren
              Prozess und wenig Eigenaufwand.
            </p>
          </Reveal>
        </div>

        {/* Vertical Timeline Wrapper */}
        <div className="relative">
          {/* Background Line (Gray) */}
          <div className="absolute left-6 md:left-1/2 top-6 bottom-6 w-0.5 -translate-x-1/2 bg-gray-200" />

          {/* Animated Scroll Line (Brand Green) */}
          <motion.div
            style={{ scaleY }}
            className="absolute left-6 md:left-1/2 top-6 bottom-6 w-0.5 -translate-x-1/2 bg-[#1a5147] origin-top z-10 shadow-[0_0_8px_rgba(26,81,71,0.4)]"
          />

          {/* Timeline Steps */}
          <div className="space-y-16 md:space-y-24 relative z-20">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.number}
                  className="relative flex flex-col md:flex-row items-start md:items-center"
                >
                  {/* Timeline Point / Dot Badge */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.6 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: false, margin: "-100px" }}
                      transition={{ duration: 0.4 }}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white border-2 border-[#1a5147] text-[#1a5147] font-bold text-sm shadow-md"
                    >
                      0{step.number}
                    </motion.div>
                  </div>

                  {/* Step Content */}
                  <div
                    className={`pl-16 md:pl-0 md:w-1/2 w-full ${
                      isEven
                        ? "md:pr-16 md:text-right"
                        : "md:pl-16 md:ml-auto md:text-left"
                    }`}
                  >
                    <Reveal delay={0.1 * index}>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1a5147] block mb-2">
                          {step.label}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-normal tracking-tight text-gray-900 mb-3 leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-normal">
                          {step.description}
                        </p>
                        {step.meta && (
                          <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#1a5147]">
                            {step.meta}
                          </span>
                        )}
                      </div>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <CTAButton className="mt-16 flex justify-center" />
      </div>
    </section>
  );
};

export default StepsTimelineSection;
