import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useWebsiteConfig } from "@/lib/websiteConfig";

const RueckrufAnfordern = () => {
  const { getText } = useWebsiteConfig();

  const title = getText("sections.callback.title", "Rückruf anfordern");
  const description = getText("sections.callback.description", "Wähle einen passenden Termin für deinen Rückruf aus.");
  const calendarUrl = getText("sections.callback.calendar_url", "").trim();
  const disabledText = getText(
    "sections.callback.disabled_text",
    "Der Rückruf-Kalender wird gerade vorbereitet. Bitte nutze vorübergehend die Kontaktmöglichkeiten auf der Webseite.",
  );

  useEffect(() => {
    if (!calendarUrl) return;

    const script = document.createElement("script");
    script.src = "https://link.msgsndr.com/js/form_embed.js";
    script.type = "text/javascript";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [calendarUrl]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main className="container mx-auto px-4 pt-36 md:pt-44 pb-16">
        {calendarUrl ? (
          <iframe
            src={calendarUrl}
            style={{ width: "100%", border: "none", overflow: "hidden", minHeight: "900px" }}
            scrolling="no"
            title={title}
          />
        ) : (
          <section className="max-w-2xl mx-auto rounded-3xl border border-border bg-card p-8 md:p-10 text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{disabledText}</p>
          </section>
        )}
        {calendarUrl && <p className="mt-6 text-center text-muted-foreground">{description}</p>}
      </main>
      <Footer />
    </div>
  );
};

export default RueckrufAnfordern;
