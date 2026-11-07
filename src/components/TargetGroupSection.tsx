import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";
import { Briefcase, TrendingUp, Handshake } from "lucide-react";

interface TargetGroup {
  title: string;
  description: string;
  icon: React.ElementType;
}

const targetGroups: TargetGroup[] = [
  {
    title: "Nebenberuflich starten",
    description:
      "Du möchtest dir neben Job oder bestehender Selbstständigkeit ein digitales Geschäftsmodell aufbauen – ohne monatelange Lernphase oder Technik und Prozesse selbst entwickeln zu müssen.",
    icon: Briefcase,
  },
  {
    title: "Energievertrieb digital skalieren",
    description:
      "Du bist bereits in der Energiebranche und arbeitest noch stark über persönliche Beratung, Door-to-Door, Empfehlungen oder manuelle Abläufe – und möchtest digitaler, automatisierter und skalierbarer arbeiten.",
    icon: TrendingUp,
  },
  {
    title: "Mit echtem Mehrwert verdienen",
    description:
      "Du möchtest kein austauschbares oder kurzfristiges Geschäftsmodell, sondern eines mit echtem, dauerhaftem Bedarf. Statt Menschen etwas Teures zu verkaufen, verdienst du daran, dass sie selbst finanziell profitieren.",
    icon: Handshake,
  },
];

const TargetGroupSection = () => {
  return (
    <section className="relative bg-white px-6 py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 md:mb-16 text-center flex flex-col items-center">
          <Reveal delay={0.1}>
            <h2 className="max-w-3xl text-4xl md:text-5xl font-normal tracking-tight leading-tight text-gray-900">
              Für wen ist ein eigener Energieassistent das richtige
              Geschäftsmodell?
            </h2>
          </Reveal>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {targetGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <Reveal key={group.title} delay={0.1 * index}>
                <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#1a5147]/40 hover:shadow-md">
                  <div className="mb-4 flex items-center justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a5147]/10 text-[#1a5147]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-normal tracking-tight text-gray-900 mb-3 leading-snug text-center">
                    {group.title}
                  </h3>

                  <p className="text-sm text-gray-500 leading-relaxed font-normal text-center">
                    {group.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* CTA */}
        <CTAButton className="mt-12 flex justify-center" />
      </div>
    </section>
  );
};

export default TargetGroupSection;
