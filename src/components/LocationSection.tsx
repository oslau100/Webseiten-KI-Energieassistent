import { relaunchAssets } from "@/lib/relaunchAssets";
import Reveal from "@/components/Reveal";
import { MapPin } from "lucide-react";

const LocationSection = () => {
  return (
    <section className="relative bg-white px-6 py-16 md:py-24 border-t border-gray-100 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-stretch">
          {/* Left: Office Collage Image */}
          <Reveal delay={0.1} className="h-full">
            <div className="relative w-full h-full min-h-[320px] md:min-h-[420px] overflow-hidden rounded-2xl">
              <img
                src={relaunchAssets.location}
                alt="Unser Standort – Energieassistent.io Büroräume"
                className="w-full h-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </Reveal>

          {/* Right: Content matching exact image height */}
          <Reveal delay={0.2} className="h-full">
            <div className="flex flex-col justify-center h-full p-2 md:p-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1a5147] mb-4">
                <MapPin className="w-4 h-4 text-[#1a5147]" />
                <span>Standort</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-gray-900 leading-tight mb-4">
                Unser Standort
              </h2>

              <p className="text-base md:text-lg font-medium text-[#1a5147] tracking-tight mb-6">
                Eifelstr. 3 | 52068 Aachen
              </p>

              <div className="h-px w-16 bg-[#1a5147]/20 mb-6" />

              <p className="text-base md:text-lg text-gray-600 leading-relaxed font-normal">
                Von unserem Standort in Aachen aus unterstützen wir
                Energievertriebler in ganz Deutschland dabei, ihren Vertrieb zu
                automatisieren und planbar mehr Abschlüsse zu erzielen.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
