import { Button } from "./ui/button";

export const SystemUsage = () => {
  const cards = [
    {
      number: "01",
      title: "Einwurfkarten",
      description:
        "Einwurfkarten mit einem einfachen Ersparnis-Check werden direkt in deiner Zielregion verteilt. Statt an der Tür sofort Druck erzeugen zu müssen, entsteht zuerst Neugier, weil Menschen ihre Ersparnis in 60 Sekunden selbst prüfen und direkt ein Ergebnis erhalten. So erreichst du deutlich mehr Haushalte, baust schnell Sichtbarkeit auf und wirst als Ansprechpartner wahrgenommen.",
    },
    {
      number: "02",
      title: "Virale Kurzvideos",
      description:
        "Über kurze Videos wie Reels, TikToks oder Shorts baust du schnell Reichweite, Vertrauen und Expertenstatus auf. Mit klaren Content-Strategien führst du Menschen direkt in deinen Energieassistenten. So entstehen kontinuierlich neue Interessenten und Abschlüsse – ohne klassischen Vertriebsaufwand.",
    },
    {
      number: "03",
      title: "Bezahlte Werbung",
      description:
        "Durch die niedrige Einstiegshürde und das schnelle Ergebnis für Interessenten erreichst du günstigere Leads und gleichzeitig höhere Abschlussquoten über bezahlte Werbung. So kannst du dein Geschäft planbar skalieren und deutlich mehr Abschlüsse generieren, ohne dass dein Vertriebsaufwand proportional mitwächst.",
    },
    {
      number: "04",
      title: "Empfehlungen",
      description:
        "Deine Interessenten und Kunden erhalten automatisch einen persönlichen Empfehlungslink und können den Energieassistenten ganz einfach weiterempfehlen. Über das integrierte Empfehlungsprogramm entstehen kontinuierlich neue Interessenten aus deinem bestehenden Netzwerk – planbar, nachvollziehbar und nicht dem Zufall überlassen.",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-[#FDFDFD]">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-[#1a231c] leading-tight">
            So generiert dein <span className="text-[#2a9d4f]">Energieassistent</span> planbar neue Interessenten und Abschlüsse
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8 mb-16 relative">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 md:p-10 flex flex-col items-start transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50 sticky md:static md:hover:-translate-y-2"
              style={{ top: `calc(100px + ${index * 20}px)` }}
            >
              <div className="flex items-center justify-center mb-6 w-16 h-16 rounded-2xl bg-[#2a9d4f]/10">
                <span className="text-[28px] md:text-[32px] font-black text-[#2a9d4f] leading-none">
                  {card.number}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1a231c] mb-4">
                {card.title}
              </h3>
              <p className="text-[#1a231c]/80 text-[15px] leading-relaxed font-medium">
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="bg-[#1a231c] text-white hover:bg-[#1a231c]/90 text-sm md:text-base font-bold px-8 py-6 rounded-xl shadow-lg transition-all hover:scale-105"
            asChild
          >
            <a href="https://calendly.com/laurent-digital-info/60min" target="_blank" rel="noopener noreferrer">
              Kostenfreie Potenzialanalyse buchen
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};
