import { relaunchAssets } from "@/lib/relaunchAssets";
import Reveal from "@/components/Reveal";

const AboutSection = () => {
  return (
    <section
      id="ueber-uns"
      className="relative bg-white px-6 py-20 md:py-28 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 lg:items-center">
          {/* Headline Block — left on desktop, first on mobile */}
          <div className="lg:col-span-7 flex flex-col text-left">
            <Reveal className="mb-4">
              <span className="inline-block border-b border-dotted border-gray-300 pb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a5147]">
                Über uns
              </span>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="text-4xl md:text-5xl font-normal tracking-tight leading-tight text-gray-900">
                Wer steckt hinter Energieassistent.io
              </h2>
            </Reveal>
          </div>

          {/* Founder Photo & Caption — right column on desktop (spans both rows), between headline and text on mobile */}
          <div className="lg:col-span-5 lg:row-span-2 flex justify-center lg:justify-end">
            <Reveal delay={0.2} className="w-full max-w-lg">
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-lg bg-gray-50 aspect-[4/5]">
                <img
                  src={relaunchAssets.founder}
                  alt="Osasere Laurent – Gründer von Energieassistent.io"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="mt-4 text-left">
                <p className="text-lg font-semibold tracking-tight text-gray-900">
                  Osasere Laurent
                </p>
                <p className="text-sm font-normal text-[#1a5147] mt-0.5">
                  Gründer & Geschäftsführer
                </p>
              </div>
            </Reveal>
          </div>

          {/* Flowing Text — below headline on desktop (left column), after image on mobile */}
          <div className="lg:col-span-7 flex flex-col text-left">
            <Reveal delay={0.2}>
              <div className="space-y-5 text-base md:text-lg text-gray-600 leading-relaxed font-normal">
                <p>
                  Osasere Laurent ist seit über 6 Jahren im Energiemarkt aktiv
                  und hat selbst im Door-to-Door-Vertrieb gestartet. Die
                  Herausforderungen des klassischen Energievertriebs kennt er
                  deshalb aus erster Hand.
                </p>
                <p>
                  Über die Jahre wurden mehrere hundert Verträge persönlich
                  abgeschlossen. Dabei zeigte sich immer wieder dasselbe Muster:
                  Für neue Verträge mussten kontinuierlich neue Menschen
                  angesprochen werden und mehr Wachstum bedeutete meist auch
                  mehr persönliche Vertriebsarbeit. Genau daraus entstand die
                  Idee für den Energieassistenten.
                </p>
                <p>
                  Die ersten Prozesse wurden automatisiert und die Lösung
                  zunächst im eigenen Vertrieb eingesetzt – mit dem Ziel,
                  Interessenten auch digital zu gewinnen und den Weg von der
                  Tarifprüfung bis zum Abschluss zu vereinfachen. Über das
                  System wurden seitdem mehr als 2.000 Verträge abgeschlossen
                  und die Lösung kontinuierlich anhand echter Vertriebspraxis
                  weiterentwickelt.
                </p>
                <p>
                  Heute unterstützt Osasere Energievertriebler dabei, genau
                  dieses System für ihren eigenen Vertrieb einzusetzen – um
                  eigene Leads digital zu gewinnen, Prozesse zu automatisieren
                  und mehr Verträge zu schreiben, ohne dass der persönliche
                  Vertriebsaufwand im gleichen Verhältnis mitwachsen muss.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
