import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useWebsiteConfig } from "@/lib/websiteConfig";

const Impressum = () => {
  const { getText } = useWebsiteConfig();
  const legalStandFallback = new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const htmlOverride = getText("pages.impressum.html", "");
  const legalVars = {
    firma: getText("legal.variables.firma", "Ehiogie Energieassistent"),
    inhaber: getText("legal.variables.inhaber", "Marvin Ehiogie"),
    strasse: getText("legal.variables.strasse", "Vaalser Str. 304B"),
    plz: getText("legal.variables.plz", "52074"),
    ort: getText("legal.variables.ort", "Aachen"),
    land: getText("legal.variables.land", "Deutschland"),
    email: getText("legal.variables.email", "marvin@ehiogie-energieassistent.de"),
    telefon: getText("legal.variables.telefon", "015213603777"),
    stand: getText("legal.variables.stand", legalStandFallback),
  };

  if (htmlOverride) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        <Header />
        <main className="flex-1 container max-w-4xl mx-auto px-4 pt-36 md:pt-48 pb-16">
          <div dangerouslySetInnerHTML={{ __html: htmlOverride }} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-background text-foreground font-sans flex flex-col"><Header /><main className="flex-1 container max-w-4xl mx-auto px-4 pt-36 md:pt-48 pb-16"><h1 className="text-4xl font-bold mb-8 text-primary">Impressum</h1><div className="space-y-8 text-muted-foreground"><section><h2 className="text-2xl font-semibold text-foreground mb-4">Angaben gemäß § 5 DDG</h2><p>{legalVars.firma}<br />{legalVars.inhaber}<br />{legalVars.strasse}<br />{legalVars.plz} {legalVars.ort}<br />{legalVars.land}</p></section><section><h2 className="text-2xl font-semibold text-foreground mb-4">Kontakt</h2><p>Telefon: {legalVars.telefon}<br />E-Mail: <a href={`mailto:${legalVars.email}`} className="text-primary hover:underline">{legalVars.email}</a></p></section><section><h2 className="text-2xl font-semibold text-foreground mb-4">Umsatzsteuer-ID</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />[wird ergänzt]</p></section><section><h2 className="text-2xl font-semibold text-foreground mb-4">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2><p>{legalVars.inhaber}<br />{legalVars.strasse}<br />{legalVars.plz} {legalVars.ort}<br />{legalVars.land}</p></section><section><h2 className="text-2xl font-semibold text-foreground mb-4">Haftung für Inhalte</h2><p className="mb-4">Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p><p>Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.</p></section><section><h2 className="text-2xl font-semibold text-foreground mb-4">Haftung für Links</h2><p className="mb-4">Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p><p className="mb-4">Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.</p><p>Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.</p></section><section><h2 className="text-2xl font-semibold text-foreground mb-4">Urheberrecht</h2><p className="mb-4">Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht.</p><p className="mb-4">Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.</p><p className="mb-4">Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.</p><p>Solltest du trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.</p></section><section><h2 className="text-2xl font-semibold text-foreground mb-4">EU-Streitschlichtung</h2><p className="mb-4">Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br /><a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr/</a></p><p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p></section><p className="text-sm pt-8">Stand: {legalVars.stand}</p></div></main><Footer /></div>
  );
};

export default Impressum;
