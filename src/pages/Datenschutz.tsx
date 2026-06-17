import React from "react";
import { Footer } from "@/components/Footer";

const Datenschutz = () => {
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
            <h1 className="text-3xl md:text-5xl font-bold mb-12">Datenschutzerklärung</h1>

            <div className="space-y-10 text-[#1a231c]/80 leading-relaxed">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">1. Verantwortlicher</h2>
                <p>
                  Verantwortlicher für die Verarbeitung personenbezogener Daten im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
                </p>
                <address className="not-italic">
                  Osasere Laurent<br />
                  Adenauerstraße 20A<br />
                  52146 Würselen<br />
                  Deutschland
                </address>
                <p>Geschäftsführer: Osasere Laurent</p>
                <p>
                  Telefon: 01773324051<br />
                  E-Mail: <a href="mailto:info@energieassistent.io" className="text-primary hover:underline">info@energieassistent.io</a><br />
                  Website: <a href="https://energieassistent.io" className="text-primary hover:underline">https://energieassistent.io</a>
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">2. Allgemeine Hinweise zur Datenverarbeitung</h2>
                <p>
                  Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen. Wir verarbeiten Ihre personenbezogenen Daten ausschließlich im Rahmen der gesetzlichen Vorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG).
                </p>
                <p>
                  Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                </p>
                <p>
                  Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">3. Bereitstellung der Website und Server-Logfiles</h2>
                <p>Beim Aufruf unserer Website werden automatisch folgende Daten erfasst:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP-Adresse</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Browsertyp und Version</li>
                  <li>Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                </ul>
                <p>Diese Daten werden in Logfiles gespeichert.</p>
                <p><strong>Rechtsgrundlage:</strong><br />Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)</p>
                <p><strong>Zweck:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Sicherstellung der Funktionsfähigkeit</li>
                  <li>Systemsicherheit</li>
                  <li>Missbrauchsprävention</li>
                </ul>
                <p><strong>Speicherdauer:</strong> maximal 14 Tage</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">4. Hosting (Cloudflare)</h2>
                <p>
                  Unsere Website wird über Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA bereitgestellt.
                </p>
                <p>Cloudflare bietet Hosting-, CDN- und Sicherheitsleistungen.</p>
                <p>Dabei können folgende Daten verarbeitet werden:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP-Adresse</li>
                  <li>Zugriffsdaten</li>
                  <li>Browserinformationen</li>
                </ul>
                <p><strong>Rechtsgrundlage:</strong><br />Art. 6 Abs. 1 lit. f DSGVO</p>
                <p>Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">5. Kontaktaufnahme</h2>
                <p>Wenn Sie uns kontaktieren (z. B. per Formular, E-Mail oder Telefon), werden folgende Daten verarbeitet:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name</li>
                  <li>Telefonnummer</li>
                  <li>E-Mail-Adresse</li>
                  <li>Anfrageinhalt</li>
                  <li>IP-Adresse (bei Formularen)</li>
                </ul>
                <p><strong>Rechtsgrundlage:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Art. 6 Abs. 1 lit. b DSGVO</li>
                  <li>Art. 6 Abs. 1 lit. f DSGVO</li>
                </ul>
                <p><strong>Speicherdauer:</strong><br />Bis zur abschließenden Bearbeitung sowie gesetzlicher Aufbewahrungspflichten</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">6. Calendly (Terminbuchungssystem)</h2>
                <p>Wir verwenden das Terminbuchungssystem Calendly (Calendly LLC, USA).</p>
                <p>Dabei können folgende Daten verarbeitet werden:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name</li>
                  <li>E-Mail-Adresse</li>
                  <li>Telefonnummer (optional)</li>
                  <li>Termininformationen</li>
                  <li>IP-Adresse</li>
                </ul>
                <p><strong>Zweck:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Terminorganisation</li>
                  <li>Durchführung von Beratungsgesprächen</li>
                </ul>
                <p><strong>Rechtsgrundlage:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Art. 6 Abs. 1 lit. b DSGVO</li>
                  <li>Art. 6 Abs. 1 lit. f DSGVO</li>
                </ul>
                <p>Die Datenverarbeitung kann in den USA erfolgen. Calendly ist nach dem EU-US Data Privacy Framework zertifiziert.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">7. Meta Pixel (Facebook Pixel)</h2>
                <p>Wir verwenden Meta Pixel der Meta Platforms Ireland Limited, Dublin, Irland.</p>
                <p>Verarbeitet werden:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP-Adresse</li>
                  <li>Geräte- und Browserdaten</li>
                  <li>Nutzungsverhalten</li>
                  <li>besuchte Seiten</li>
                </ul>
                <p><strong>Zweck:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Analyse</li>
                  <li>Conversion-Tracking</li>
                  <li>zielgerichtete Werbung</li>
                </ul>
                <p><strong>Rechtsgrundlage:</strong><br />Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">8. Imgix (Bildoptimierung)</h2>
                <p>Wir verwenden Imgix Inc., USA.</p>
                <p>Verarbeitete Daten:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP-Adresse</li>
                  <li>Browserdaten</li>
                  <li>Geräteinformationen</li>
                </ul>
                <p><strong>Rechtsgrundlage:</strong><br />Art. 6 Abs. 1 lit. f DSGVO</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">9. Unsplash (Bildinhalte)</h2>
                <p>Wir nutzen Inhalte von Unsplash.</p>
                <p>Dabei können folgende Daten verarbeitet werden:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP-Adresse</li>
                  <li>Browserdaten</li>
                  <li>Zugriffsdaten</li>
                </ul>
                <p><strong>Rechtsgrundlage:</strong><br />Art. 6 Abs. 1 lit. f DSGVO</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">10. Cookies & Consent Management</h2>
                <p>Unsere Website verwendet Cookies.</p>
                <p>Wir nutzen ein Consent-Management-Tool, um Ihre Einwilligungen rechtskonform einzuholen.</p>
                <p><strong>Zwecke:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Technische Bereitstellung</li>
                  <li>Analyse</li>
                  <li>Marketing</li>
                </ul>
                <p><strong>Rechtsgrundlage:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Art. 6 Abs. 1 lit. a DSGVO</li>
                  <li>Art. 6 Abs. 1 lit. f DSGVO</li>
                </ul>
                <p>Sie können Ihre Einwilligung jederzeit widerrufen.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">11. Speicherdauer</h2>
                <p>
                  Personenbezogene Daten werden nur so lange gespeichert, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">12. Ihre Rechte</h2>
                <p>Sie haben folgende Rechte:</p>
                <ul className="list-disc pl-6 space-y-1">
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

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">13. Beschwerderecht bei der Aufsichtsbehörde</h2>
                <address className="not-italic">
                  Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen<br /><br />
                  Postfach 20 04 44<br />
                  40102 Düsseldorf<br /><br />
                  Telefon: 0211 38424-0<br />
                  Website: <a href="https://www.ldi.nrw.de" className="text-primary hover:underline">https://www.ldi.nrw.de</a>
                </address>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">14. Datensicherheit</h2>
                <p>Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten zu schützen.</p>
                <p>Dazu gehören insbesondere:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>SSL-/TLS-Verschlüsselung</li>
                  <li>Zugriffsbeschränkungen</li>
                  <li>sichere Serverinfrastruktur</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#1a231c]">15. Aktualität</h2>
                <p>Stand: April 2026</p>
                <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen.</p>
              </section>
            </div>
          </main>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Datenschutz;
