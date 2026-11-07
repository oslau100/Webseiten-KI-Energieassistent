import Footer from "@/components/Footer";

const Datenschutz = () => {
  return (
    <>
      <main className="relative bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Datenschutzerklärung
          </h1>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h2 className="text-base font-semibold text-foreground">
                1. Verantwortlicher
              </h2>
              <p className="mt-2">
                Verantwortlicher für die Verarbeitung personenbezogener Daten im
                Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
              </p>
              <p className="mt-2">
                Switch Energy GmbH
                <br />
                Eifelstr. 3
                <br />
                52068 Aachen
                <br />
                Deutschland
                <br />
                Geschäftsführer: Osasere Laurent
              </p>
              <p className="mt-3">
                E-Mail:{" "}
                <a
                  href="mailto:info@energieassistent.io"
                  className="text-primary hover:underline"
                >
                  info@energieassistent.io
                </a>
                <br />
                Website:{" "}
                <a
                  href="https://energieassistent.io"
                  className="text-primary hover:underline"
                >
                  https://energieassistent.io
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                2. Allgemeine Hinweise zur Datenverarbeitung
              </h2>
              <p className="mt-2">
                Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges
                Anliegen. Wir verarbeiten Ihre personenbezogenen Daten
                ausschließlich im Rahmen der gesetzlichen Vorschriften,
                insbesondere der Datenschutz-Grundverordnung (DSGVO) und des
                Bundesdatenschutzgesetzes (BDSG).
              </p>
              <p className="mt-2">
                Personenbezogene Daten sind alle Daten, mit denen Sie persönlich
                identifiziert werden können.
              </p>
              <p className="mt-2">
                Wir verarbeiten personenbezogene Daten nur, soweit dies zur
                Bereitstellung einer funktionsfähigen Website sowie unserer
                Inhalte und Leistungen erforderlich ist.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                3. Bereitstellung der Website und Server-Logfiles
              </h2>
              <p className="mt-2">
                Beim Aufruf unserer Website werden automatisch folgende Daten
                erfasst:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>IP-Adresse</li>
                <li>Datum und Uhrzeit des Zugriffs</li>
                <li>Browsertyp und Version</li>
                <li>Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
              </ul>
              <p className="mt-2">
                Diese Daten werden in Logfiles gespeichert.
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Rechtsgrundlage:
                </span>
                <br />
                Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">Zweck:</span>
                <br />
                Sicherstellung der Funktionsfähigkeit
                <br />
                Systemsicherheit
                <br />
                Missbrauchsprävention
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Speicherdauer:
                </span>{" "}
                maximal 14 Tage
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                4. Hosting (Cloudflare)
              </h2>
              <p className="mt-2">
                Unsere Website wird über Cloudflare, Inc., 101 Townsend St., San
                Francisco, CA 94107, USA bereitgestellt.
              </p>
              <p className="mt-2">
                Cloudflare bietet Hosting-, CDN- und Sicherheitsleistungen.
              </p>
              <p className="mt-2">
                Dabei können folgende Daten verarbeitet werden:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>IP-Adresse</li>
                <li>Zugriffsdaten</li>
                <li>Browserinformationen</li>
              </ul>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Rechtsgrundlage:
                </span>
                <br />
                Art. 6 Abs. 1 lit. f DSGVO
              </p>
              <p className="mt-2">
                Cloudflare ist nach dem EU-US Data Privacy Framework
                zertifiziert.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                5. Kontaktaufnahme
              </h2>
              <p className="mt-2">
                Wenn Sie uns kontaktieren (z. B. per Formular, E-Mail oder
                Telefon), werden folgende Daten verarbeitet:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Name</li>
                <li>Telefonnummer</li>
                <li>E-Mail-Adresse</li>
                <li>Anfrageinhalt</li>
                <li>IP-Adresse (bei Formularen)</li>
              </ul>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Rechtsgrundlage:
                </span>
                <br />
                Art. 6 Abs. 1 lit. b DSGVO
                <br />
                Art. 6 Abs. 1 lit. f DSGVO
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Speicherdauer:
                </span>
                <br />
                Bis zur abschließenden Bearbeitung sowie gesetzlicher
                Aufbewahrungspflichten
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                6. Calendly (Terminbuchungssystem)
              </h2>
              <p className="mt-2">
                Wir verwenden das Terminbuchungssystem Calendly (Calendly LLC,
                USA).
              </p>
              <p className="mt-2">
                Dabei können folgende Daten verarbeitet werden:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Name</li>
                <li>E-Mail-Adresse</li>
                <li>Telefonnummer (optional)</li>
                <li>Termininformationen</li>
                <li>IP-Adresse</li>
              </ul>
              <p className="mt-2">
                <span className="font-medium text-foreground">Zweck:</span>
                <br />
                Terminorganisation
                <br />
                Durchführung von Beratungsgesprächen
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Rechtsgrundlage:
                </span>
                <br />
                Art. 6 Abs. 1 lit. b DSGVO
                <br />
                Art. 6 Abs. 1 lit. f DSGVO
              </p>
              <p className="mt-2">
                Die Datenverarbeitung kann in den USA erfolgen. Calendly ist
                nach dem EU-US Data Privacy Framework zertifiziert.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                7. Meta Pixel (Facebook Pixel)
              </h2>
              <p className="mt-2">
                Wir verwenden Meta Pixel der Meta Platforms Ireland Limited,
                Dublin, Irland.
              </p>
              <p className="mt-2">Verarbeitet werden:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>IP-Adresse</li>
                <li>Geräte- und Browserdaten</li>
                <li>Nutzungsverhalten</li>
                <li>besuchte Seiten</li>
              </ul>
              <p className="mt-2">
                <span className="font-medium text-foreground">Zweck:</span>
                <br />
                Analyse
                <br />
                Conversion-Tracking
                <br />
                zielgerichtete Werbung
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Rechtsgrundlage:
                </span>
                <br />
                Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                8. Imgix (Bildoptimierung)
              </h2>
              <p className="mt-2">Wir verwenden Imgix Inc., USA.</p>
              <p className="mt-2">Verarbeitete Daten:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>IP-Adresse</li>
                <li>Browserdaten</li>
                <li>Geräteinformationen</li>
              </ul>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Rechtsgrundlage:
                </span>
                <br />
                Art. 6 Abs. 1 lit. f DSGVO
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                9. Unsplash (Bildinhalte)
              </h2>
              <p className="mt-2">Wir nutzen Inhalte von Unsplash.</p>
              <p className="mt-2">
                Dabei können folgende Daten verarbeitet werden:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>IP-Adresse</li>
                <li>Browserdaten</li>
                <li>Zugriffsdaten</li>
              </ul>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Rechtsgrundlage:
                </span>
                <br />
                Art. 6 Abs. 1 lit. f DSGVO
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                10. Cookies &amp; Consent Management
              </h2>
              <p className="mt-2">Unsere Website verwendet Cookies.</p>
              <p className="mt-2">
                Wir nutzen ein Consent-Management-Tool, um Ihre Einwilligungen
                rechtskonform einzuholen.
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">Zwecke:</span>
                <br />
                Technische Bereitstellung
                <br />
                Analyse
                <br />
                Marketing
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">
                  Rechtsgrundlage:
                </span>
                <br />
                Art. 6 Abs. 1 lit. a DSGVO
                <br />
                Art. 6 Abs. 1 lit. f DSGVO
              </p>
              <p className="mt-2">
                Sie können Ihre Einwilligung jederzeit widerrufen.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                11. Speicherdauer
              </h2>
              <p className="mt-2">
                Personenbezogene Daten werden nur so lange gespeichert, wie es
                für die jeweiligen Zwecke erforderlich ist oder gesetzliche
                Aufbewahrungspflichten bestehen.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                12. Ihre Rechte
              </h2>
              <p className="mt-2">Sie haben folgende Rechte:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
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

            <section>
              <h2 className="text-base font-semibold text-foreground">
                13. Beschwerderecht bei der Aufsichtsbehörde
              </h2>
              <p className="mt-2">
                Landesbeauftragte für Datenschutz und Informationsfreiheit
                Nordrhein-Westfalen
              </p>
              <p className="mt-2">
                Postfach 20 04 44
                <br />
                40102 Düsseldorf
                <br />
                Telefon: 0211 38424-0
                <br />
                Website:{" "}
                <a
                  href="https://www.ldi.nrw.de"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://www.ldi.nrw.de
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                14. Datensicherheit
              </h2>
              <p className="mt-2">
                Wir setzen technische und organisatorische Maßnahmen ein, um
                Ihre Daten zu schützen.
              </p>
              <p className="mt-2">Dazu gehören insbesondere:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>SSL-/TLS-Verschlüsselung</li>
                <li>Zugriffsbeschränkungen</li>
                <li>sichere Serverinfrastruktur</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-foreground">
                15. Aktualität
              </h2>
              <p className="mt-2">Stand: April 2026</p>
              <p className="mt-2">
                Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf
                anzupassen.
              </p>
            </section>
          </div>

          <div className="mt-12">
            <a
              href="/"
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Zurück zur Startseite
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Datenschutz;
