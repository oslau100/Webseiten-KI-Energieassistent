import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Imprint = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-foreground">Impressum</h1>

        <div className="space-y-12 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Angaben gemäß § 5 DDG:</h2>
            <p className="mb-4">tarif-butler.de ist ein Angebot der</p>
            <div className="bg-muted/50 p-6 rounded-xl mb-4">
              <p className="font-medium text-foreground">Switch Energy GmbH</p>
              <p>Eifelstr. 3</p>
              <p>52068 Aachen</p>
              <p>Deutschland</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Kontakt</h2>
            <p>E-Mail: <a href="mailto:kundenservice@tarif-butler.de" className="text-primary hover:underline">kundenservice@tarif-butler.de</a></p>
            <p>Telefon: 02415153553</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Vertretungsberechtigter</h2>
            <p>Geschäftsführer: Osasere Laurent</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Registereintrag</h2>
            <p>Handelsregister: Amtsgericht Aachen</p>
            <p>Registernummer: HRB 24942</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>Osasere Laurent</p>
            <p>Eifelstr. 3</p>
            <p>52068 Aachen</p>
            <p>Deutschland</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">EU-Streitschlichtung</h2>
            <p className="mb-4">Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr/</a></p>
            <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h2>
            <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Haftung für Inhalte</h2>
            <p className="mb-4">Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
            <p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Haftung für Links</h2>
            <p className="mb-4">Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.</p>
            <p>Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Urheberrecht</h2>
            <p className="mb-4">Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p>
            <p>Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Imprint;
