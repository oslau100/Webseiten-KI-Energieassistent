import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";

interface ProviderLogo {
  name: string;
  url: string;
  alt: string;
  className?: string;
}

const PROVIDERS: ProviderLogo[] = [
  {
    name: "LichtBlick",
    url: "https://vibe.filesafe.space/1789758049296638029/attachments/c286fd95-0d97-4e88-98a1-c34ffb1db1ec.webp",
    alt: "LichtBlick Energieanbieter",
    className: "h-9 md:h-11 max-w-[190px]",
  },
  {
    name: "goldgas",
    url: "https://vibe.filesafe.space/1789758049296638029/attachments/b6c00807-a134-4804-bc5d-170a1c87ab5d.webp",
    alt: "goldgas Energieanbieter",
    className: "h-8 md:h-10 max-w-[180px]",
  },
  {
    name: "mark E",
    url: "https://vibe.filesafe.space/1789758049296638029/attachments/22b6ed3a-9eff-4d36-9e36-586e73d89c6b.webp",
    alt: "Mark E Energieanbieter",
    className: "h-8 md:h-10 max-w-[170px]",
  },
  {
    name: "e.on",
    url: "https://vibe.filesafe.space/1789758049296638029/attachments/a372f339-460d-4a5a-b326-9832144f012d.webp",
    alt: "E.ON Energieanbieter",
    className: "h-9 md:h-11 max-w-[150px]",
  },
  {
    name: "E wie einfach",
    url: "https://vibe.filesafe.space/1789758049296638029/attachments/d931171a-c4cf-4866-9af7-a6784654a35f.webp",
    alt: "E wie einfach Energieanbieter",
    className: "h-11 md:h-14 max-w-[210px]",
  },
  {
    name: "Vattenfall",
    url: "https://vibe.filesafe.space/1789758049296638029/assets/d49613e4-9bb6-4025-ab66-9ffef0956144.png",
    alt: "Vattenfall Energieanbieter",
    className: "h-7 md:h-9 max-w-[170px]",
  },
  {
    name: "badenova",
    url: "https://vibe.filesafe.space/1789758049296638029/attachments/79c8a9ee-72f9-4e4a-88db-35c25b902df0.png",
    alt: "badenova Energieanbieter",
    className: "h-9 md:h-11 max-w-[190px] mix-blend-screen",
  },
];

interface ProvidersSectionProps {
  ctaText?: string;
}

const ProvidersSection = ({ ctaText }: ProvidersSectionProps = {}) => {
  // Triple the array so the continuous marquee loops seamlessly
  const marqueeItems = [...PROVIDERS, ...PROVIDERS, ...PROVIDERS];

  return (
    <section className="relative bg-white px-6 py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header content */}
        <div className="mx-auto max-w-3xl text-center mb-12 md:mb-16">
          <Reveal delay={0.1}>
            <div className="inline-flex flex-col items-center mb-6">
              <span className="inline-block border-b border-dotted border-border pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                DISTRIBUTIONSUNABHÄNGIG
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-gray-900 leading-tight">
              Deine Distribution bleibt. Dein Prozess wird digital.
            </h2>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed font-normal">
              Der Energieassistent ist distributionsunabhängig aufgebaut.
              Gängige Distributionstarife können im System gespiegelt und
              priorisiert werden – abgeschlossene Verträge lädst du weiterhin
              über deine bestehende Distribution hoch.
            </p>
          </Reveal>
        </div>

        {/* Marquee Row */}
        <Reveal delay={0.4}>
          <div className="relative w-full overflow-hidden py-4">
            {/* Soft edge gradient masks */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10" />

            <div className="flex w-max items-center gap-10 md:gap-14 animate-marquee hover:[animation-play-state:paused]">
              {marqueeItems.map((provider, idx) => (
                <div
                  key={`${provider.name}-${idx}`}
                  className="flex items-center justify-center min-w-[180px] md:min-w-[220px] h-20 md:h-24 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <img
                    src={provider.url}
                    alt={provider.alt}
                    className={`w-auto object-contain transition-opacity duration-300 opacity-80 hover:opacity-100 ${provider.className ?? "h-8 md:h-10"}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Optional CTA — only shown on /ads page */}
        {ctaText && (
          <div className="mt-12 flex justify-center">
            <CTAButton text={ctaText} />
          </div>
        )}
      </div>
    </section>
  );
};

export default ProvidersSection;
