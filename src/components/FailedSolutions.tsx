import { useState } from "react";
import { Filter, Puzzle } from "lucide-react";

export const FailedSolutions = () => {
  const [activeTab, setActiveTab] = useState(0);

  const cards = [
    {
      tabName: "Der Irrglaube",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="#2a9d4f" />
          <path d="M12 9v4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 17.5h.01" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: "Du brauchst mehr Kontakte oder musst einfach besser verkaufen",
      description:
        "Du denkst vielleicht, dass du nur mehr Kontakte brauchst oder bessere Pitches und Einwandbehandlung, um mehr Verträge abzuschließen.\n\nAlso klingelst du mehr, gibst mehr Druck im Gespräch oder schaltest Ads ohne richtiges System – in der Annahme, dass dadurch automatisch mehr Umsatz entsteht.",
      bgColor: "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50",
      textColor: "text-[#1a231c]",
      descColor: "text-[#1a231c]/90",
    },
    {
      tabName: "Die Sackgasse",
      icon: <Filter className="w-8 h-8 md:w-10 md:h-10 text-[#2a9d4f]" strokeWidth={2.5} fill="#2a9d4f" />,
      title: "Mehr Kontakte oder bessere Verkaufstechniken bringen dich nicht weiter",
      description:
        "Ob mehr Kontakte oder besser pitchen beides wirkt wie eine Lösung, bringt dich aber kaum weiter. Mehr Kontakte erhöhen nur deinen Aufwand, ohne dass automatisch mehr Abschlüsse entstehen.\n\nUnd selbst bessere Pitches oder Einwandbehandlung sorgen meist nur für minimal bessere Quoten – nicht für planbar mehr Ergebnisse.",
      bgColor: "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50",
      textColor: "text-[#1a231c]",
      descColor: "text-[#1a231c]/90",
    },
    {
      tabName: "Die Wahrheit",
      icon: <Puzzle className="w-8 h-8 md:w-10 md:h-10 text-[#2a9d4f]" strokeWidth={2.5} fill="#2a9d4f" />,
      title: "Deine Art der Kundengewinnung ist das eigentliche Problem",
      description:
        "Der Engpass ist nicht die Anzahl deiner Kontakte, sondern wie dein Vertrieb aufgebaut ist.\n\nDie meisten Prozesse im D2D- und Online-Vertrieb erzeugen Ablehnung, Druck und Misstrauen, bevor überhaupt echtes Interesse entsteht. Dein aktueller Ansatz ist nicht darauf ausgelegt, Vertrauen aufzubauen und Hürden zu senken. Genau deshalb bleiben deine Abschlüsse unplanbar und schwer erreichbar.",
      bgColor: "bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50",
      textColor: "text-[#1a231c]",
      descColor: "text-[#1a231c]/90",
    }
  ];

  const activeCard = cards[activeTab];

  return (
    <section className="pt-8 pb-20 md:pt-12 md:pb-32 bg-[#FDFDFD] w-full">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-[#1a231c] mb-6 tracking-tight">
            Warum klassische Lösungsansätze nicht funktionieren
          </h2>
          <p className="text-base md:text-lg text-[#1a231c]/80 leading-relaxed max-w-3xl mx-auto font-medium">
            Viele versuchen, mehr Abschlüsse mit den falschen Ansätzen zu erzwingen – und <br className="hidden md:block" /> bleiben genau deshalb auf der Stelle stehen.
          </p>
        </div>

        {/* Tabs and Card Container */}
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-20 mb-12 md:mb-16">
            {cards.map((card, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className="flex flex-col items-center gap-3 md:gap-4 group"
              >
                <div 
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full transition-colors duration-200 ${
                    activeTab === index ? "bg-[#2a9d4f]" : "bg-[#f1f5f9] group-hover:bg-slate-200"
                  }`} 
                />
                <span className="font-bold text-sm md:text-lg text-[#1a231c]">
                  {card.tabName}
                </span>
              </button>
            ))}
          </div>

          {/* Active Card */}
          <div className={`${activeCard.bgColor} rounded-[2rem] p-8 md:p-12 w-full flex flex-col items-start transition-all duration-300`}>
            <div className="flex items-center justify-center mb-6 md:mb-8 w-16 h-16 rounded-2xl bg-[#2a9d4f]/10">
              {activeCard.icon}
            </div>
            <h3 className={`text-2xl md:text-[28px] font-bold ${activeCard.textColor} mb-6 leading-tight`}>
              {activeCard.title}
            </h3>
            <div className={`${activeCard.descColor} text-[15px] md:text-[17px] leading-relaxed font-medium space-y-4`}>
              {activeCard.description.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
