import { useState } from "react";
import Reveal from "@/components/Reveal";

const solutionTags = [
  "Mehrsprachig",
  "Keine Unterlagen nötig",
  "KI-Analyse",
  "1 klare Empfehlung",
  "Digitaler Wechsel",
];

const SolutionSection = () => {
  const [activeTab, setActiveTab] = useState<"ki" | "business">("ki");

  return (
    <section className="relative bg-background px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Eyebrow */}
        <Reveal className="mb-6">
          <div className="inline-flex flex-col border-b border-dotted border-border pb-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              DIE LÖSUNG
            </span>
            <span className="mt-1.5 text-sm md:text-base text-muted-foreground font-medium">
              Wie aus ungenutztem Potenzial ein digitales Geschäftsmodell wird
            </span>
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.1}>
          <h2 className="max-w-3xl text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
            Vom komplizierten Tarifmarkt zum digitalen Geschäftsmodell.
          </h2>
        </Reveal>

        {/* Tab Toggle Bar */}
        <Reveal delay={0.2} className="mt-12 flex justify-center">
          <div className="inline-flex rounded-full p-1.5 bg-card border border-border/80 shadow-sm">
            <button
              onClick={() => setActiveTab("ki")}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === "ki"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Die KI-Lösung
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === "business"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Das Geschäftsmodell
            </button>
          </div>
        </Reveal>

        {/* Tab Content Card */}
        <Reveal delay={0.3} className="mt-8">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 md:p-10 shadow-sm">
            {activeTab === "ki" ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Left Text Column */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl lg:text-[26px] xl:text-[28px] font-bold tracking-tight text-foreground leading-[1.3] mb-5 max-w-lg">
                    Der Energieassistent nimmt genau diese Hürden aus dem
                    Prozess.
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                    Das KI-Tool erfasst die individuelle Situation des Nutzers
                    in wenigen einfachen Schritten – ohne Rechnung, Tarifwissen
                    oder komplizierte Vorbereitung. Es analysiert verfügbare
                    Tarife, filtert ungeeignete Angebote, erklärt die Empfehlung
                    verständlich und führt den Nutzer auf Wunsch bis zum
                    digitalen Wechsel.
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2.5">
                    {solutionTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Visual / GIF Frame */}
                <div className="lg:col-span-6 flex justify-center items-center">
                  <div className="w-full rounded-[24px] bg-muted/30 p-2.5 sm:p-3.5 border border-border/40">
                    <div className="overflow-hidden rounded-2xl border border-border/50 bg-background shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                      <img
                        src="https://vibe.filesafe.space/1789758049296638029/attachments/46fde91b-c82b-4f87-9eae-994b4f1c1925.gif"
                        alt="Energieassistent KI-Lösung Demo"
                        className="w-full h-auto object-cover block"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                {/* Left Text Column */}
                <div className="lg:col-span-6 flex flex-col justify-center">
                  <h3 className="text-xl sm:text-2xl lg:text-[26px] xl:text-[28px] font-bold tracking-tight text-foreground leading-[1.3] mb-5 max-w-lg">
                    Deine Nutzer sparen. Du verdienst. Und der Prozess
                    wiederholt sich.
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                    Du stellst deinen Energieassistenten unter deiner Marke
                    kostenlos zur Verfügung. Nutzer können ihren Tarif prüfen
                    und eine gefundene Ersparnis einfach annehmen – ohne für den
                    Service zu bezahlen. Bei Erfolg erhältst du im Schnitt{" "}
                    <span className="font-semibold text-foreground">
                      150–200 €
                    </span>{" "}
                    Vergütung.
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Danach übernimmt der Energieassistent weiter: Er überwacht
                    Fristen und prüft zum passenden Zeitpunkt automatisch
                    erneut. So gewinnst du einen Nutzer einmal – und kannst mit
                    demselben Nutzer immer wieder verdienen.
                  </p>
                </div>

                {/* Right Interactive Wheel / Diagram Column */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center pt-2 pb-6">
                  {/* Top Badge Pill */}
                  <div className="flex flex-col items-center mb-2">
                    <div className="rounded-full bg-background border border-border/80 px-5 py-2 text-xs sm:text-sm text-muted-foreground shadow-sm">
                      Nutzer einmal gewinnen.{" "}
                      <span className="font-semibold text-primary">
                        Wiederholt verdienen.
                      </span>
                    </div>
                    <div className="h-6 w-px bg-primary/40 my-0.5"></div>
                  </div>

                  {/* Circular Diagram Container */}
                  <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center p-4 my-1">
                    {/* SVG Wheel & Interlocking Chevron Segments */}
                    <svg
                      viewBox="0 0 440 440"
                      className="w-full h-full drop-shadow-md select-none overflow-visible"
                    >
                      <defs>
                        <filter
                          id="centerShadow"
                          x="-30%"
                          y="-30%"
                          width="160%"
                          height="160%"
                        >
                          <feDropShadow
                            dx="0"
                            dy="4"
                            stdDeviation="8"
                            floodColor="#000000"
                            floodOpacity="0.08"
                          />
                        </filter>
                        <filter
                          id="glow"
                          x="-20%"
                          y="-20%"
                          width="140%"
                          height="140%"
                        >
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite
                            in="SourceGraphic"
                            in2="blur"
                            operator="over"
                          />
                        </filter>
                      </defs>

                      {/* 5 Interlocking Chevron Segments */}
                      <g>
                        {/* Segment 1: Top / Tarif prüfen */}
                        <path
                          d="M 220 65 A 155 155 0 0 1 319.8 101.3 L 290 137 L 281.2 147.1 A 95 95 0 0 0 220 125 Z"
                          fill="#18483d"
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                        {/* Segment 2: Top Right / Ersparnis finden */}
                        <path
                          d="M 319.8 101.3 A 155 155 0 0 1 374.8 211.9 L 333 227 L 314.9 215.1 A 95 95 0 0 0 281.2 147.1 Z"
                          fill="#1a4d41"
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                        {/* Outer Glow Highlight Arc on Segment 2 */}
                        <path
                          d="M 323 99 A 158 158 0 0 1 378 210"
                          fill="none"
                          stroke="#48a38d"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          opacity="0.85"
                          filter="url(#glow)"
                        />

                        {/* Segment 3: Right / Ersparnis annehmen */}
                        <path
                          d="M 374.8 211.9 A 155 155 0 0 1 306 348.6 L 273 318 L 272.7 298.8 A 95 95 0 0 0 314.9 215.1 Z"
                          fill="#194a3e"
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />

                        {/* Segment 4: Bottom / Du verdienst (Highlighted Emerald Green) */}
                        <path
                          d="M 306 348.6 A 155 155 0 0 1 143.2 355 L 157 320 L 172.9 302.7 A 95 95 0 0 0 272.7 298.8 Z"
                          fill="#276e5d"
                          className="hover:opacity-95 transition-opacity cursor-pointer"
                        />

                        {/* Segment 5: Left / Automatisch überwachen */}
                        <path
                          d="M 143.2 355 A 155 155 0 0 1 220 65 L 220 125 A 95 95 0 0 0 172.9 302.7 Z"
                          fill="#154237"
                          className="hover:opacity-90 transition-opacity cursor-pointer"
                        />
                      </g>

                      {/* Number 1 + Corner Bracket */}
                      <g transform="translate(244, 142)">
                        <text
                          x="0"
                          y="10"
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="800"
                          fontFamily="sans-serif"
                        >
                          1
                        </text>
                        <path
                          d="M 11 0 L 16 0 L 16 5"
                          stroke="#ffffff"
                          strokeWidth="1.8"
                          fill="none"
                          opacity="0.85"
                        />
                      </g>

                      {/* Number 2 + Corner Bracket */}
                      <g transform="translate(304, 202)">
                        <text
                          x="0"
                          y="10"
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="800"
                          fontFamily="sans-serif"
                        >
                          2
                        </text>
                        <path
                          d="M 11 12 L 11 17 L 6 17"
                          stroke="#ffffff"
                          strokeWidth="1.8"
                          fill="none"
                          opacity="0.85"
                        />
                      </g>

                      {/* Number 3 + Corner Bracket */}
                      <g transform="translate(322, 280)">
                        <text
                          x="0"
                          y="10"
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="800"
                          fontFamily="sans-serif"
                        >
                          3
                        </text>
                        <path
                          d="M 11 12 L 11 17 L 6 17"
                          stroke="#ffffff"
                          strokeWidth="1.8"
                          fill="none"
                          opacity="0.85"
                        />
                      </g>

                      {/* Number 4 + Bracket */}
                      <g transform="translate(228, 328)">
                        <path
                          d="M -5 7 L -10 7 L -5 2"
                          stroke="#ffffff"
                          strokeWidth="1.8"
                          fill="none"
                          opacity="0.85"
                        />
                        <text
                          x="2"
                          y="10"
                          fill="#ffffff"
                          fontSize="16"
                          fontWeight="800"
                          fontFamily="sans-serif"
                        >
                          4
                        </text>
                      </g>

                      {/* Number 5 + Bracket */}
                      <g transform="translate(162, 222)">
                        <path
                          d="M 4 -3 L 4 -8 L 9 -8"
                          stroke="#ffffff"
                          strokeWidth="1.8"
                          fill="none"
                          opacity="0.85"
                        />
                        <text
                          x="0"
                          y="10"
                          fill="#ffffff"
                          fontSize="15"
                          fontWeight="800"
                          fontFamily="sans-serif"
                        >
                          5
                        </text>
                      </g>

                      {/* Center Circle */}
                      <circle
                        cx="220"
                        cy="210"
                        r="88"
                        fill="#f7faf8"
                        filter="url(#centerShadow)"
                      />
                      <circle
                        cx="220"
                        cy="210"
                        r="87"
                        fill="none"
                        stroke="#dbe8e3"
                        strokeWidth="2"
                      />

                      <text
                        x="220"
                        y="200"
                        textAnchor="middle"
                        fill="#18483d"
                        fontSize="20"
                        fontWeight="900"
                        letterSpacing="0.5"
                      >
                        WIN-WIN
                      </text>
                      <text
                        x="220"
                        y="226"
                        textAnchor="middle"
                        fill="#18483d"
                        fontSize="20"
                        fontWeight="900"
                        letterSpacing="0.5"
                      >
                        MODELL
                      </text>
                    </svg>

                    {/* Text Labels Positioned exact to image */}
                    {/* Step 1: Top */}
                    <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 text-center pointer-events-none w-max">
                      <div className="text-sm sm:text-base font-bold text-foreground leading-tight">
                        Tarif prüfen
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Aktuellen Tarif checken
                      </div>
                    </div>

                    {/* Step 2: Top Right */}
                    <div className="absolute top-[35px] right-[-15px] sm:right-[-25px] text-left pointer-events-none max-w-[130px]">
                      <div className="text-sm sm:text-base font-bold text-foreground leading-tight">
                        Ersparnis finden
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Persönliche Empfehlung
                      </div>
                    </div>

                    {/* Step 3: Right */}
                    <div className="absolute top-[52%] right-[-25px] sm:right-[-38px] -translate-y-1/2 text-left pointer-events-none max-w-[130px]">
                      <div className="text-sm sm:text-base font-bold text-foreground leading-tight">
                        Ersparnis annehmen
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Einfach digital
                      </div>
                    </div>

                    {/* Step 4: Bottom */}
                    <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 text-center pointer-events-none w-max">
                      <div className="text-sm sm:text-base font-bold text-primary leading-tight">
                        Du verdienst
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Vergütung bei Erfolg
                      </div>
                    </div>

                    {/* Step 5: Left */}
                    <div className="absolute top-[52%] left-[-30px] sm:left-[-45px] -translate-y-1/2 text-right pointer-events-none max-w-[140px]">
                      <div className="text-sm sm:text-base font-bold text-foreground leading-tight">
                        Automatisch überwachen
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Fristen & Tarif im Blick
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default SolutionSection;
