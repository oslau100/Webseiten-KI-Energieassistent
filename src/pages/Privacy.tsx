import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-foreground">Datenschutzerklärung</h1>

        <div className="space-y-12 text-muted-foreground leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Verantwortlicher</h2>
            <p className="mb-4">Verantwortlicher für die Verarbeitung personenbezogener Daten im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
            <div className="bg-muted/50 p-6 rounded-xl mb-4">
              <p className="font-medium text-foreground">Switch Energy GmbH</p>
              <p>Eifelstraße 3</p>
              <p>52068 Aachen</p>
              <p>Deutschland</p>
              <p className="mt-4">Geschäftsführer: Osasere Laurent</p>
              <p className="mt-4">Telefon: 0241 5153553</p>
              <p>E-Mail: <a href="mailto:Kontakt@tarif-butler.de" className="text-primary hover:underline">Kontakt@tarif-butler.de</a></p>
              <p>Website: <a href="https://Tarif-Butler.de" className="text-primary hover:underline">https://Tarif-Butler.de</a></p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Allgemeine Hinweise zur Datenverarbeitung</h2>
            <p className="mb-4">Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen. Wir verarbeiten Ihre personenbezogenen Daten ausschließlich im Rahmen der gesetzlichen Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG).</p>
            <p className="mb-4">Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Hierzu zählen beispielsweise:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Name</li>
              <li>Adresse</li>
              <li>Telefonnummer</li>
              <li>E-Mail-Adresse</li>
              <li>IP-Adresse</li>
              <li>Nutzungsverhalten</li>
            </ul>
            <p>Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.</p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Bereitstellung der Website und Server-Logfiles</h2>
            <p className="mb-4">Beim Aufruf unserer Website werden automatisch folgende Daten erfasst:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>IP-Adresse</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Browsertyp und Version</li>
              <li>Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
            </ul>
            <p className="mb-4">Diese Daten werden in Logfiles gespeichert.</p>
            <p className="mb-4">Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse), um:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>die Funktionsfähigkeit der Website sicherzustellen</li>
              <li>die Sicherheit der Systeme zu gewährleisten</li>
              <li>Missbrauch zu verhindern</li>
            </ul>
            <p className="font-semibold text-foreground">Speicherdauer: maximal 14 Tage.</p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Hosting (Cloudflare)</h2>
            <p className="mb-4">Unsere Website wird über Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA bereitgestellt.</p>
            <p className="mb-2 font-medium text-foreground">Cloudflare bietet:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Hosting</li>
              <li>Content Delivery Network (CDN)</li>
              <li>Sicherheitsfunktionen</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Dabei können folgende Daten verarbeitet werden:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>IP-Adresse</li>
              <li>Zugriffsdaten</li>
              <li>Browserinformationen</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Rechtsgrundlage:</p>
            <p className="mb-4">Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherer und schneller Website)</p>
            <p>Cloudflare ist zertifiziert nach dem EU-US Data Privacy Framework.</p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Kontaktaufnahme</h2>
            <p className="mb-2 font-medium text-foreground">Wenn Sie uns kontaktieren per:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Formular</li>
              <li>E-Mail</li>
              <li>Telefon</li>
              <li>Brief</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">werden folgende Daten verarbeitet:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Name</li>
              <li>Telefonnummer</li>
              <li>E-Mail</li>
              <li>Anfrageinhalt</li>
              <li>IP-Adresse (bei Formularen)</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Rechtsgrundlage:</p>
            <p className="mb-4">Art. 6 Abs. 1 lit. b DSGVO (Vertrag / Anfrage)<br />Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</p>
            <p className="mb-2 font-medium text-foreground">Speicherdauer:</p>
            <p>Bis zur vollständigen Bearbeitung der Anfrage und gemäß gesetzlicher Aufbewahrungspflichten.</p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Perspective Funnels (Formularsystem)</h2>
            <p className="mb-4">Wir verwenden Perspective Software GmbH, Müggelstraße 22, 10247 Berlin.</p>
            <p className="mb-2 font-medium text-foreground">Perspective verarbeitet:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Name</li>
              <li>Telefonnummer</li>
              <li>E-Mail</li>
              <li>IP-Adresse</li>
              <li>Formularangaben</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Rechtsgrundlage:</p>
            <p className="mb-4">Art. 6 Abs. 1 lit. b DSGVO<br />Art. 6 Abs. 1 lit. f DSGVO</p>
            <p>Ein Auftragsverarbeitungsvertrag wurde abgeschlossen.</p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Meta Pixel (Facebook Pixel)</h2>
            <p className="mb-4">Wir verwenden Meta Pixel von:<br />Meta Platforms Ireland Limited<br />4 Grand Canal Square<br />Dublin 2, Irland</p>
            <p className="mb-2 font-medium text-foreground">Verarbeitete Daten:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>IP-Adresse</li>
              <li>Browserdaten</li>
              <li>Geräteinformationen</li>
              <li>Nutzerverhalten</li>
              <li>besuchte Seiten</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Zweck:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Analyse der Website</li>
              <li>Messung von Werbekampagnen</li>
              <li>zielgerichtete Werbung</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Rechtsgrundlage:</p>
            <p className="mb-4">Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
            <p>Datenübertragung in die USA möglich. Meta ist zertifiziert nach EU-US Data Privacy Framework.</p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Imgix (Bildoptimierung)</h2>
            <p className="mb-4">Wir verwenden Imgix Inc., San Francisco, USA.</p>
            <p className="mb-2 font-medium text-foreground">Verarbeitete Daten:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>IP-Adresse</li>
              <li>Browserdaten</li>
              <li>Geräteinformationen</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Zweck:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Optimierung der Ladezeiten</li>
              <li>bessere Darstellung von Bildern</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Rechtsgrundlage:</p>
            <p>Art. 6 Abs. 1 lit. f DSGVO</p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">9. Unsplash (Bildinhalte)</h2>
            <p className="mb-4">Wir nutzen Inhalte von Unsplash.</p>
            <p className="mb-2 font-medium text-foreground">Dabei können folgende Daten verarbeitet werden:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>IP-Adresse</li>
              <li>Browserdaten</li>
              <li>Zugriffsdaten</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Rechtsgrundlage:</p>
            <p>Art. 6 Abs. 1 lit. f DSGVO</p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Cookies</h2>
            <p className="mb-4">Unsere Website verwendet Cookies.</p>
            <p className="mb-2 font-medium text-foreground">Cookies dienen dazu:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Website technisch bereitzustellen</li>
              <li>Nutzerfreundlichkeit zu verbessern</li>
              <li>Marketing und Analyse zu ermöglichen</li>
            </ul>
            <p className="mb-2 font-medium text-foreground">Rechtsgrundlage:</p>
            <p className="mb-4">Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)<br />Art. 6 Abs. 1 lit. f DSGVO</p>
            <p>Sie können Cookies jederzeit in den Browser-Einstellungen deaktivieren.</p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Speicherdauer</h2>
            <p className="mb-4">Wir speichern personenbezogene Daten nur solange wie erforderlich oder gesetzlich vorgeschrieben.</p>
            <p>Danach werden sie gelöscht.</p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">12. Ihre Rechte</h2>
            <p className="mb-4">Sie haben folgende Rechte:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Art. 15 DSGVO – Auskunft</li>
              <li>Art. 16 DSGVO – Berichtigung</li>
              <li>Art. 17 DSGVO – Löschung</li>
              <li>Art. 18 DSGVO – Einschränkung</li>
              <li>Art. 20 DSGVO – Datenübertragbarkeit</li>
              <li>Art. 21 DSGVO – Widerspruch</li>
              <li>Art. 7 DSGVO – Widerruf</li>
              <li>Art. 77 DSGVO – Beschwerde</li>
            </ul>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">13. Beschwerderecht bei der Aufsichtsbehörde</h2>
            <p className="mb-4">Zuständige Aufsichtsbehörde:</p>
            <p className="mb-4 font-medium text-foreground">Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen</p>
            <p className="mb-4">Postanschrift:<br />Postfach 20 04 44<br />40102 Düsseldorf</p>
            <p>Telefon: 0211 38424-0<br />Website: <a href="https://www.ldi.nrw.de" className="text-primary hover:underline">https://www.ldi.nrw.de</a></p>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">14. Datensicherheit</h2>
            <p className="mb-4">Wir verwenden technische und organisatorische Maßnahmen, um Ihre Daten zu schützen.</p>
            <p className="mb-2 font-medium text-foreground">Dazu gehören insbesondere:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL-Verschlüsselung</li>
              <li>sichere Server</li>
              <li>Zugriffsbeschränkungen</li>
            </ul>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">15. Aktualität</h2>
            <p className="mb-4">Stand: Februar 2026</p>
            <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
