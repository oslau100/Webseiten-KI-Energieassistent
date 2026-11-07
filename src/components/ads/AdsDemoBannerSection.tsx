import { relaunchAssets } from "@/lib/relaunchAssets";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";

const AdsDemoBannerSection = () => {
  return (
    <section className="relative bg-background px-6 py-12 md:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <Reveal delay={0.1}>
          <div className="relative overflow-hidden rounded-[28px] md:rounded-[36px] bg-[#1a5147] text-white shadow-xl">
            {/* Background subtle radial glow / pattern */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 p-8 sm:p-12 md:p-14 lg:p-16">
              {/* Left Column: Offer Headline, Subtext & CTA */}
              <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-white/90 mb-4 backdrop-blur-sm">
                  Persönliche Demo
                </span>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-white leading-tight">
                  Lass dir unser System jetzt in einer kostenlosen Demo zeigen!
                </h2>

                <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                  <CTAButton text="Kostenlose Demo buchen" variant="white" />
                </div>
              </div>

              {/* Right Column: Uploaded Image (Consultant/Strategist at Mac with Headset) */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end z-10">
                <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-white/15 bg-white/5 shadow-2xl">
                  <img
                    src={relaunchAssets.demoConsultant}
                    alt="Kostenlose Demo mit unserem Strategieberater"
                    className="w-full h-auto object-cover object-center aspect-square sm:aspect-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AdsDemoBannerSection;
