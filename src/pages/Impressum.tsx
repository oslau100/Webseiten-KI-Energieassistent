import React from "react";
import { Footer } from "@/components/Footer";

const Impressum = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col">
      {/* Global Background Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      ></div>
      {/* Radial gradient to fade out grid at edges */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#1a231c_100%)] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex-grow bg-[#FDFDFD] text-[#1a231c] w-full">
          <main className="max-w-4xl mx-auto py-24 px-6 md:px-12">
            <h1 className="text-3xl md:text-5xl font-bold mb-12">Impressum</h1>

            <div className="space-y-10 text-[#1a231c]/80 leading-relaxed">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">Angaben gemäß § 5 DDG</h2>
                <address className="not-italic">
                  energieassistent.io<br />
                  Osasere Laurent<br />
                  Adenauerstraße 20A<br />
                  52146 Würselen<br />
                  Deutschland
                </address>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">Vertreten durch</h2>
                <p>Geschäftsführer: Osasere Laurent</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">Kontakt</h2>
                <p>
                  Telefon: 01773324051<br />
                  E-Mail: <a href="mailto:info@energieassistent.io" className="text-primary hover:underline">info@energieassistent.io</a><br />
                  Website: <a href="https://energieassistent.io" className="text-primary hover:underline">https://energieassistent.io</a>
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
                <address className="not-italic">
                  Osasere Laurent<br />
                  Adenauerstraße 20A<br />
                  52146 Würselen<br />
                  Deutschland
                </address>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">EU-Streitschlichtung</h2>
                <p>
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br />
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr/</a>
                </p>
                <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">Verbraucherstreitbeilegung</h2>
                <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">Haftung für Inhalte</h2>
                <p>Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.</p>
                <p>Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
                <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.</p>
                <p>Eine Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">Haftung für Links</h2>
                <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.</p>
                <p>Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>
                <p>Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">Urheberrecht</h2>
                <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p>
                <p>Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
                <p>Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
                <p>Soweit Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet und entsprechend gekennzeichnet.</p>
                <p>Sollten Sie dennoch auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
              </section>
            </div>
          </main>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Impressum;
