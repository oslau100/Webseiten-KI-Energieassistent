import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useWebsiteConfig } from "@/lib/websiteConfig";

const Datenschutz = () => {
  const { getText } = useWebsiteConfig();
  const htmlOverride = getText("pages.datenschutz.html", "");
  const legalVars = {
    firma: getText("legal.variables.firma", "Ehiogie Energieassistent"),
    inhaber: getText("legal.variables.inhaber", "Marvin Ehiogie"),
    strasse: getText("legal.variables.strasse", "Vaalser Str. 304B"),
    plz: getText("legal.variables.plz", "52074"),
    ort: getText("legal.variables.ort", "Aachen"),
    land: getText("legal.variables.land", "Deutschland"),
    email: getText("legal.variables.email", "marvin@ehiogie-energieassistent.de"),
  };

  if (htmlOverride) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 pt-36 md:pt-48 pb-16 max-w-4xl">
          <div dangerouslySetInnerHTML={{ __html: htmlOverride }} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-36 md:pt-48 pb-16 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 text-primary">Datenschutzerklärung</h1>
        <div className="space-y-8 text-lg leading-relaxed text-muted-foreground">
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">1. Verantwortlicher</h2><p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p><address className="not-italic mt-2 bg-muted/50 p-4 rounded-lg border border-border"><strong>{legalVars.firma}</strong><br />{legalVars.inhaber}<br />{legalVars.strasse}<br />{legalVars.plz} {legalVars.ort}<br /><a href={`mailto:${legalVars.email}`} className="text-primary hover:underline">{legalVars.email}</a></address></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">2. Allgemeine Hinweise zur Datenverarbeitung</h2><p className="mb-2">Der Schutz deiner persönlichen Daten ist uns wichtig. Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der gesetzlichen Bestimmungen (DSGVO, BDSG).</p><p>Personenbezogene Daten sind alle Daten, mit denen du persönlich identifiziert werden kannst.</p></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">3. Datenerfassung auf dieser Website</h2><h3 className="text-xl font-medium text-foreground mb-2 mt-4">a) Besuch der Website</h3><p className="mb-2">Beim Aufruf unserer Website werden automatisch folgende Daten erfasst:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>IP-Adresse (gekürzt/anonymisiert, sofern möglich)</li><li>Datum und Uhrzeit</li><li>Browsertyp und Version</li><li>Betriebssystem</li><li>Referrer-URL</li></ul><p className="mb-2">Diese Daten dienen der technischen Bereitstellung und Sicherheit der Website.</p><p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO</p></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">4. Hosting</h2><p className="mb-2">Unsere Website wird auf einem eigenen Server betrieben.</p><p>Dabei werden die oben genannten technischen Daten verarbeitet, um einen sicheren und stabilen Betrieb zu gewährleisten.</p></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">5. Nutzung unseres digitalen Energieassistenten</h2><p className="mb-2">Wenn du unseren digitalen Energieassistenten nutzt, werden folgende Daten verarbeitet:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>Angaben zu deinem aktuellen Tarif</li><li>Verbrauchsdaten (falls angegeben)</li><li>Postleitzahl / Region</li><li>Kontaktdaten (z. B. Name, E-Mail-Adresse, Telefonnummer)</li></ul><p className="mb-2">Diese Daten werden verwendet, um:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>passende Tarifempfehlungen zu berechnen</li><li>dich bei Rückfragen oder Serviceanliegen zu kontaktieren</li><li>einen möglichen Anbieterwechsel vorzubereiten und durchzuführen</li></ul><p className="mb-2"><strong>Rechtsgrundlage:</strong></p><ul className="list-disc pl-6 mb-4 space-y-1"><li>Art. 6 Abs. 1 lit. b DSGVO (Vertrag / vorvertragliche Maßnahmen)</li><li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung, soweit erforderlich)</li></ul></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">6. Einsatz von Künstlicher Intelligenz</h2><p className="mb-2">Zur Analyse und Bewertung von Tarifen setzen wir KI-Technologien ein.</p><p className="mb-2">Dabei gilt:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>Es werden keine personenbezogenen Daten an externe KI-Systeme übermittelt.</li><li>Die Verarbeitung erfolgt ausschließlich auf anonymisierter Basis.</li></ul><p>Die KI dient ausschließlich der internen Auswertung und Optimierung von Tarifempfehlungen.</p></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">7. Datenverarbeitung über Supabase</h2><p className="mb-2">Zur Speicherung und Verarbeitung von Daten nutzen wir Supabase, ein Backend-as-a-Service-Anbieter.</p><p className="mb-2"><strong>Anbieter:</strong> Supabase Inc.<br /><strong>Website:</strong> <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://supabase.com</a></p><p className="mb-2">Supabase wird als Auftragsverarbeiter eingesetzt.</p><p className="mb-2">Die Verarbeitung erfolgt:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>verschlüsselt</li><li>ausschließlich zweckgebunden im Rahmen dieser Datenschutzerklärung</li></ul></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">8. E-Mail-Kommunikation (Mailgun)</h2><p className="mb-2">Für den Versand von E-Mails nutzen wir Mailgun.</p><p className="mb-2"><strong>Anbieter:</strong> Mailgun Technologies, Inc.<br /><strong>Website:</strong> <a href="https://www.mailgun.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.mailgun.com</a></p><p className="mb-2">Dabei können folgende Daten verarbeitet werden:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>Name</li><li>E-Mail-Adresse</li><li>Kommunikationsinhalte</li><li>Versand- und Interaktionsdaten</li></ul><p className="mb-2">Die Verarbeitung erfolgt zum Zweck der Kommunikation und im Rahmen deiner Anfrage.</p><p className="mb-2"><strong>Rechtsgrundlage:</strong></p><ul className="list-disc pl-6 mb-4 space-y-1"><li>Art. 6 Abs. 1 lit. a DSGVO</li><li>Art. 6 Abs. 1 lit. b DSGVO</li></ul></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">9. Telefonische Kontaktaufnahme</h2><p className="mb-2">Wir können dich telefonisch kontaktieren, sofern:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>du deine Kontaktdaten angegeben hast</li><li>ein konkreter Zusammenhang mit deiner Anfrage besteht</li></ul><p className="mb-2">Dies dient der:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>Klärung von Fragen</li><li>Unterstützung bei der Tarifauswahl oder beim Wechselprozess</li></ul><p className="mb-2"><strong>Rechtsgrundlage:</strong></p><ul className="list-disc pl-6 mb-4 space-y-1"><li>Art. 6 Abs. 1 lit. b DSGVO</li><li>ggf. Art. 6 Abs. 1 lit. a DSGVO</li></ul></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">10. Cookies</h2><p className="mb-2">Unsere Website verwendet Cookies.</p><p className="mb-2">Dabei handelt es sich ausschließlich um technisch notwendige Cookies, die für den Betrieb der Website erforderlich sind.</p><p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO</p></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">11. Speicherdauer</h2><p>Personenbezogene Daten werden nur so lange gespeichert, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.</p></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">12. Deine Rechte</h2><p className="mb-2">Du hast jederzeit das Recht auf:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>Auskunft</li><li>Berichtigung</li><li>Löschung</li><li>Einschränkung der Verarbeitung</li><li>Datenübertragbarkeit</li><li>Widerruf einer Einwilligung</li></ul></section>
          <section><h2 className="text-2xl font-semibold text-foreground mb-4">13. Sicherheit</h2><p className="mb-2">Wir setzen technische und organisatorische Maßnahmen ein, um deine Daten zu schützen.</p><p className="mb-2">Dazu gehören insbesondere:</p><ul className="list-disc pl-6 mb-4 space-y-1"><li>verschlüsselte Speicherung</li><li>Zugriffsbeschränkungen</li><li>Schutz vor unbefugtem Zugriff</li></ul></section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Datenschutz;
