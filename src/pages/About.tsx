import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

function AnimatedNumber({ value, suffix = "", prefix = "", format = false }: { value: number, suffix?: string, prefix?: string, format?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number;
      const duration = 2000;
      
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setDisplayValue(Math.floor(easeOut * value));
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    }
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{format ? displayValue.toLocaleString('de-DE') : displayValue}{suffix}</span>;
}

export default function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 text-center py-24 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-foreground">
            TarifButler – dein digitaler Energieassistent
          </h1>
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground">
            <p>
              Wir sind ein junges Startup aus Aachen mit einer klaren Mission:<br />
              Strom- und Gasverträge endlich fair, sicher und einfach machen.<br />
              Wir glauben, dass faire Energiepreise kein Privileg sein dürfen.
            </p>
            <p>
              Jeder Haushalt verdient die Sicherheit, nur das zu zahlen, was wirklich nötig ist – ohne
              Angst vor versteckten Kosten, Lockangeboten oder unklaren Vertragsbedingungen.
            </p>
            <p>
              Mit unserer Technologie helfen wir Haushalten in ganz Deutschland, ihre Tarife automatisch
              zu prüfen, zu optimieren<br />
              und dauerhaft auf dem besten und sichersten Tarif zu bleiben.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 pb-24">
          <div className="max-w-5xl mx-auto border-2 border-primary rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
              <div className="px-4 py-4 md:py-0">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  <AnimatedNumber value={10000} suffix="+" format />
                </h2>
                <p className="text-muted-foreground">Nutzer vertrauen auf<br />TarifButler</p>
              </div>
              <div className="px-4 py-4 md:py-0">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  <AnimatedNumber value={4} suffix="+ Mio. €" />
                </h2>
                <p className="text-muted-foreground">konnten wir bereits an<br />unnötigen Kosten sparen</p>
              </div>
              <div className="px-4 py-4 md:py-0">
                <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
                  <AnimatedNumber value={2023} />
                </h2>
                <p className="text-muted-foreground">Wurde TarifButler<br />gegründet</p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 1 */}
        <section className="bg-[#f8f9fa] py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="order-2 md:order-1 flex justify-center">
                <img
                  src="https://vibe.filesafe.space/1775221216043671236/attachments/bfa1a36b-b51f-44af-a230-ce11213fc6f2.png"
                  alt="Unser Antrieb"
                  className="w-full max-w-lg md:max-w-xl lg:scale-110 object-contain"
                />
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <h2 className="text-3xl md:text-4xl font-extrabold">Unser Antrieb</h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    Der deutsche Energiemarkt ist für viele Verbraucher ein Labyrinth: tausende Tarife, undurchsichtige Boni, schwer lesbare AGBs und ständig neue Anbieter. Wir haben TarifButler gegründet, um das zu ändern. Niemand sollte für Strom oder Gas unnötig zu viel zahlen, nur weil der Markt zu unübersichtlich ist.
                  </p>
                  <p className="font-medium text-foreground">
                    Unsere Mission: Einen einfachen, sicheren Weg zum besten Tarif – ganz ohne Aufwand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature 2 */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-extrabold">Wie TarifButler deinen Tarifwechsel sicher macht</h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    Unsere KI analysiert hunderte Strom- und Gasangebote aus dem gesamten Markt. Dabei prüfen wir nicht nur Preise, sondern auch Anbieterqualität, Vertragsbedingungen und versteckte Kosten. Unklare Tarife, Lockangebote oder Anbieter mit schlechter Reputation werden automatisch aussortiert.
                  </p>
                  <p>
                    Übrig bleibt nur ein geprüfter, sicherer Tarif mit maximaler Ersparnis – den du mit einem Klick übernehmen kannst.
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="https://vibe.filesafe.space/1775221216043671236/attachments/e5695882-b02e-4a37-8933-6b5f2eddfe57.png"
                  alt="Sicherer Tarifwechsel"
                  className="w-full max-w-md object-contain scale-110"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Feature 3 (List) */}
        <section className="bg-[#f8f9fa] py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
              <div className="hidden md:block"></div>
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-extrabold">Was wir für dich tun</h2>
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <p className="text-lg font-medium">Faire & sichere Tarife automatisch finden</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <p className="text-lg font-medium">Deinen Anbieterwechsel digital und stressfrei abwickeln</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <p className="text-lg font-medium">Dauerhaft prüfen, ob sich ein neuer Wechsel lohnt – und dich automatisch informieren</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="bg-[#f8f9fa] py-24 text-center border-t border-border/50">
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            <p className="text-lg font-medium text-foreground">Unser Ziel für die Zukunft</p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#111827] leading-tight">
              Eine Welt, in der jeder Haushalt<br />einen TarifButler hat
            </h2>
            <p className="text-lg md:text-xl text-foreground pt-4 leading-relaxed max-w-2xl mx-auto">
              Wir wollen erreichen, dass kein Haushalt mehr zu viel für
              Strom oder Gas bezahlt. Mit TarifButler wird der
              Tarifwechsel endlich einfach, sicher und selbstverständlich.
              So schaffen wir Vertrauen in einem Markt, der bisher von
              Intransparenz geprägt war.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16">Unsere Werte</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <div className="bg-[#f8f9fa] p-10 rounded-3xl text-center space-y-4">
                <h3 className="text-2xl font-bold">Transparenz statt Tricks</h3>
                <p className="text-lg text-muted-foreground">Wir zeigen offen, wie Entscheidungen entstehen – kein Kleingedrucktes, keine Lockangebote.</p>
              </div>
              <div className="bg-[#f8f9fa] p-10 rounded-3xl text-center space-y-4">
                <h3 className="text-2xl font-bold">Sicherheit vor Ersparnis</h3>
                <p className="text-lg text-muted-foreground">Lieber dauerhaft sparen als kurzfristig verlieren.</p>
              </div>
              <div className="bg-[#f8f9fa] p-10 rounded-3xl text-center space-y-4">
                <h3 className="text-2xl font-bold">Vertrauen & Verantwortung</h3>
                <p className="text-lg text-muted-foreground">Wir handeln wie ein echter Butler: loyal, diskret und im Interesse unseres Nutzers.</p>
              </div>
              <div className="bg-[#f8f9fa] p-10 rounded-3xl text-center space-y-4">
                <h3 className="text-2xl font-bold">Einfachheit als Prinzip</h3>
                <p className="text-lg text-muted-foreground">Energie soll keine Wissenschaft sein – sondern ein Klick.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary py-24 text-center">
          <div className="container mx-auto px-4 max-w-3xl space-y-8">
            <h2 className="text-4xl md:text-5xl font-extrabold text-primary-foreground">
              Starte jetzt mit<br />TarifButler
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Finde heraus, wie viel du sparen kannst –<br />
              kostenlos, sicher und in unter einer Minute.
            </p>
            <Button size="lg" variant="secondary" className="rounded-full text-lg font-bold px-8 h-14 mt-4 text-[#111827] hover:bg-white" asChild>
              <Link to="/tarif-check">Jetzt Ersparnis prüfen</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
