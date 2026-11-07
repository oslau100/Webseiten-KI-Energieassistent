import { relaunchAssets } from "@/lib/relaunchAssets";
import Reveal from "@/components/Reveal";

const Footer = () => {
  const navLinks = [
    { label: "Ads-System", href: "#ads-system" },
    { label: "Energieassistent", href: "#energieassistent" },
    { label: "Fallstudien", href: "#fallstudien" },
    { label: "Ablauf", href: "#ablauf" },
    { label: "Über uns", href: "#ueber-uns" },
  ];

  const legalLinks = [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
  ];

  return (
    <footer className="relative overflow-hidden bg-background text-foreground">
      {/* Subtle grid background (same as hero) */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground) / 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground) / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-8 md:pt-20">
        {/* Top: columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Column 1: Logo + Beschreibung */}
          <Reveal className="sm:col-span-2 md:col-span-1">
            <div className="flex flex-col items-start text-left">
              <a href="/" className="inline-block -ml-3 sm:-ml-3.5">
                <img
                  src={relaunchAssets.logo}
                  alt="Energieassistent.io"
                  className="h-16 sm:h-20 w-auto object-contain object-left mix-blend-multiply dark:invert block"
                />
              </a>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Energieassistent.io ist die Vertriebsplattform für
                Energievertriebler, die eigene Leads gewinnen und ihren
                Vertriebsprozess digitalisieren möchten.
              </p>
            </div>
          </Reveal>

          {/* Column 2: Kontakt */}
          <Reveal delay={0.08}>
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-4">
                Kontakt
              </h3>
              <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                <p>Switch Energy GmbH</p>
                <p>Eifelstr. 3</p>
                <p>52068 Aachen</p>
                <a
                  href="mailto:info@energieassistent.io"
                  className="mt-1 hover:text-primary transition-colors"
                >
                  info@energieassistent.io
                </a>
              </div>
            </div>
          </Reveal>

          {/* Column 3: Navigation */}
          <Reveal delay={0.16}>
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-4">
                Navigation
              </h3>
              <ul className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Column 4: Rechtliches */}
          <Reveal delay={0.24}>
            <div className="flex flex-col">
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-4">
                Rechtliches
              </h3>
              <ul className="flex flex-col gap-3">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Divider */}
        <div className="mt-14 h-px w-full bg-border/40" />

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground/70 text-center sm:text-left">
            © {new Date().getFullYear()} Energieassistent.io — Alle Rechte
            vorbehalten.
          </p>

          <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
            Made in Germany
            <span className="inline-block h-3 w-[1px] bg-border" />
            <span>🇩🇪</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
