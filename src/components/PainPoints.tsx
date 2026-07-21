import { TrendingDown, UserX, ShieldAlert, PieChart, Clock, UserMinus } from "lucide-react";

export const PainPoints = () => {
  const points = [
    {
      title: "Unplanbare Umsätze",
      description:
        "Mal läuft es gut, mal gar nicht – du hast keinen klaren Einfluss darauf, wie viele Abschlüsse wirklich reinkommen.",
      icon: TrendingDown,
    },
    {
      title: "Hohe Ablehnung",
      description:
        "Ob an der Tür oder online – viele blocken direkt ab, bevor du überhaupt erklären kannst, worum es geht.",
      icon: UserX,
    },
    {
      title: "Fehlendes Vertrauen",
      description:
        "Viele Interessenten sind skeptisch, vergleichen parallel oder entscheiden sich am Ende gegen dich, weil das Vertrauen fehlt.",
      icon: ShieldAlert,
    },
    {
      title: "Niedrige Abschlussrate",
      description:
        "Du investierst Zeit oder Geld in Akquise aber nur ein kleiner Teil der Gespräche führt tatsächlich zum Abschluss.",
      icon: PieChart,
    },
    {
      title: "Hoher Aufwand",
      description:
        "Pitchen, Daten sammeln, Einwände behandeln jeder Abschluss kostet dich Zeit, Energie und Nerven – und mehr Umsatz bedeutet einfach nur noch mehr Aufwand.",
      icon: Clock,
    },
    {
      title: "Viele Verlorene Kontakte",
      description:
        "Obwohl genug Potenzial im Markt ist, erreichst du viele Menschen mit deiner aktuellen Arbeitsweise gar nicht oder verlierst sie im Prozess.",
      icon: UserMinus,
    },
  ];

  return (
    <section className="relative w-full pt-20 md:pt-32 pb-16 md:pb-24 bg-[#FDFDFD]">
      {/* Bottom Dark Background with Grid (Overlaps the bottom row of cards by ~1/3) */}
      <div className="absolute bottom-0 left-0 right-0 h-[180px] md:h-[240px] lg:h-[260px] bg-[#000000] z-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24 px-2">
          <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-[#1a231c] mb-6 tracking-tight overflow-visible">
            Kommt dir das <span className="text-[#195044]">im Vertrieb</span> bekannt vor?
          </h2>
          <p className="text-base md:text-lg text-[#1a231c]/80 leading-relaxed max-w-2xl mx-auto font-medium whitespace-normal">
            Die meisten Strom & Gasvertriebler geben täglich Vollgas – kämpfen aber mit unplanbaren Ergebnissen, hoher Ablehnung, viel Aufwand und verlieren dabei einen Großteil ihres Potenzials.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {points.map((point, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50 flex flex-col items-start transition-transform hover:-translate-y-1 duration-300"
            >
              {/* Icon */}
              <div className="flex items-center justify-center mb-6 w-16 h-16 rounded-2xl bg-[#195044]/10">
                <point.icon className="w-8 h-8 md:w-10 md:h-10 text-[#195044]" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-[#1a231c] mb-4">
                {point.title}
              </h3>
              <p className="text-[#1a231c]/80 leading-relaxed text-[15px] font-medium">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
