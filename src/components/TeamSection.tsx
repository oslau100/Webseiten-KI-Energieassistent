import Reveal from "@/components/Reveal";
import { User } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  description: string;
  image?: string;
  isPlaceholder?: boolean;
}

const teamMembers: TeamMember[] = [
  {
    name: "Malte",
    role: "Technologie & Entwicklung",
    description:
      "Malte verantwortet die technische Weiterentwicklung unserer Plattform und Energieassistenten. Er sorgt dafür, dass Systeme, Automationen und neue Funktionen zuverlässig ineinandergreifen und kontinuierlich weiterentwickelt werden.",
    image:
      "https://vibe.filesafe.space/1789758049296638029/attachments/fb40572f-81f1-42f0-99ac-f1cf885c781f.png",
  },
  {
    name: "Tabea",
    role: "Partnerbetreuung & Onboarding",
    description:
      "Tabea begleitet unsere Partner vom persönlichen Onboarding bis in den laufenden Betrieb. Sie ist Ansprechpartnerin bei Fragen, unterstützt bei der Umsetzung und sorgt dafür, dass jeder Partner das System optimal für seine Ziele einsetzen kann.",
    image:
      "https://vibe.filesafe.space/1789758049296638029/attachments/96d68b5a-165a-4173-be4e-58bc25dd2b2c.png",
  },
  {
    name: "Christian",
    role: "Strategieberatung",
    description:
      "Christian ist der erste Ansprechpartner für Interessenten und entwickelt gemeinsam mit ihnen eine passende Strategie für den eigenen Energieassistenten. Im persönlichen Strategiegespräch klärt er Ausgangssituation, Ziele und wie das Geschäftsmodell sinnvoll aufgebaut werden kann.",
    image:
      "https://vibe.filesafe.space/1789758049296638029/attachments/e999cf44-6d0a-4a02-b146-9771e5dd38fa.png",
  },
];

const TeamSection = () => {
  return (
    <section className="relative bg-white px-6 py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Centered Headline */}
        <div className="text-center max-w-3xl mx-auto mb-14 md:mb-20">
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-normal tracking-tight leading-tight text-gray-900">
              Das Kernteam
            </h2>
          </Reveal>
        </div>

        {/* 3 Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {teamMembers.map((member, index) => (
            <Reveal key={index} delay={0.15 * (index + 1)}>
              <div className="flex flex-col h-full items-center text-center">
                {/* Photo / Avatar */}
                <div className="relative aspect-[4/5] w-40 sm:w-44 lg:w-48 overflow-hidden rounded-xl mb-5 flex items-center justify-center">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={`${member.name} – ${member.role}`}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300 w-full h-full bg-gray-50 rounded-xl p-6 text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
                        <User className="w-10 h-10" />
                      </div>
                      <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                        Profil folgt
                      </span>
                    </div>
                  )}
                </div>

                {/* Member Info */}
                <div className="flex flex-col flex-grow items-center">
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-[#1a5147] mt-1 mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed font-normal max-w-xs">
                    {member.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
