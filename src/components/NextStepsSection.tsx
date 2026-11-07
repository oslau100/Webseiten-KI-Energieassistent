import Reveal from "@/components/Reveal";

interface NextStep {
  number: string;
  title: string;
  description: string;
}

const steps: NextStep[] = [
  {
    number: "01",
    title: "Termin auswählen",
    description:
      "Wähle direkt im Kalender einen passenden Termin für dein kostenloses Erstgespräch und sichere dir deinen persönlichen Gesprächstermin.",
  },
  {
    number: "02",
    title: "Kostenloses Erstgespräch",
    description:
      "In einem kurzen Gespräch sprechen wir über deine Situation und Ziele und prüfen gemeinsam, ob eine Zusammenarbeit für beide Seiten sinnvoll ist.",
  },
  {
    number: "03",
    title: "Persönliche Strategieberatung",
    description:
      "Wenn es passt, planen wir gemeinsam deinen Start, zeigen dir die Plattform und besprechen deine individuelle Strategie sowie die nächsten Schritte.",
  },
];

const NextStepsSection = () => {
  return (
    <section className="relative bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Dark green box */}
        <div className="relative overflow-hidden rounded-3xl px-6 py-14 md:px-16 md:py-20 bg-[#1a5147] text-white">
          {/* subtle radial accent */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 0%, transparent 45%)",
            }}
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-12 md:mb-16">
              <Reveal>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-tight text-white">
                  Deine nächsten Schritte
                </h2>
              </Reveal>
            </div>

            {/* Steps with connecting line */}
            <div className="relative">
              {/* Horizontal connecting line (desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-white/25" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {steps.map((step, index) => (
                  <Reveal
                    key={step.number}
                    delay={0.15 * (index + 1)}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Number node */}
                    <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#1a5147] border-2 border-white/40 shadow-lg">
                      <span className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                        {step.number}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-normal tracking-tight leading-snug text-white mb-3 max-w-[260px]">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-white/70 leading-relaxed font-normal max-w-[300px]">
                      {step.description}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-14 md:mt-20 flex justify-center">
              <Reveal delay={0.2}>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-[#1a5147] shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  Kostenloses Erstgespräch vereinbaren
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 8H13M13 8L9 4M13 8L9 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </Reveal>
            </div>

            {/* Mobile-only image under CTA */}
            <div className="mt-8 md:hidden flex justify-center">
              <Reveal delay={0.25}>
                <div className="relative overflow-hidden rounded-2xl max-w-[280px] shadow-2xl border border-white/20">
                  <img
                    src="https://vibe.filesafe.space/1789758049296638029/attachments/ef0a6847-2bce-487c-bfbd-865d9325907b.png"
                    alt="Persönliches Erstgespräch mit Energieassistent.io Berater"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NextStepsSection;
