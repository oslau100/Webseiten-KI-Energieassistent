import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";

interface StepItem {
  number: number;
  title: string;
  description: string;
}

const steps: StepItem[] = [
  {
    number: 1,
    title: "Deine Vorgaben festlegen",
    description:
      "Wir stimmen dein Branding, die verfügbaren Tarife deiner Distribution und deine Vorgaben für die Tarifempfehlungen gemeinsam ab.",
  },
  {
    number: 2,
    title: "Energieassistent einrichten",
    description:
      "Wir richten dein gesamtes System schlüsselfertig ein – inklusive Tarifprüfung, automatisierter Beratung, digitaler Abschlussstrecke und CRM.",
  },
  {
    number: 3,
    title: "Leadgewinnung starten",
    description:
      "Starte deine vorbereiteten Ads, verteile druckfertige QR-Einwurfkarten oder nutze dein automatisiertes Partnerprogramm.",
  },
  {
    number: 4,
    title: "Leads verwalten und nachfassen",
    description:
      "Neue Leads werden automatisch in deinem CRM erfasst. Du kannst offene Interessenten gezielt nachfassen und deine Akquise schrittweise ausbauen.",
  },
];

const AdsStepsSection = () => {
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
      id="ablauf"
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
          <Reveal delay={0.1}>
            <h2 className="max-w-3xl text-4xl md:text-5xl font-normal tracking-tight leading-tight text-gray-900">
              In 4 Schritten von der Einrichtung zur Leadgewinnung
            </h2>
          </Reveal>
        </div>

        <Reveal className="-mt-8 mb-14 flex justify-center">
          <p className="max-w-3xl text-center text-lg text-gray-500 leading-relaxed">
            Wir richten deinen Energieassistenten individuell für deinen Vertrieb ein. Anschließend kannst du mit
            den fertigen Akquise-Tools starten und deine gewonnenen Leads direkt weiterbearbeiten.
          </p>
        </Reveal>

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
                          Schritt {step.number}:
                        </span>
                        <h3 className="text-xl sm:text-2xl font-normal tracking-tight text-gray-900 mb-3 leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-normal">
                          {step.description}
                        </p>
                      </div>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <CTAButton
          text="Kostenlose Demo buchen"
          className="mt-16 flex justify-center"
        />
      </div>
    </section>
  );
};

export default AdsStepsSection;
