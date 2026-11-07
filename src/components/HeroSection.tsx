import { useState, useEffect } from "react";
import Reveal from "@/components/Reveal";
import { AnimatePresence, motion } from "framer-motion";

const HeroSection = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop or ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Die Chance", href: "#die-chance" },
    { label: "Das Geschäftsmodell", href: "#das-geschaeftsmodell" },
    { label: "Fallstudien", href: "#fallstudien" },
    { label: "Systeme", href: "#systeme" },
    { label: "Über uns", href: "#ueber-uns" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Subtle grid background */}
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

      {/* Header / Navigation */}
      <header className="relative z-30 mx-auto max-w-7xl px-6 pt-6">
        <nav className="flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center shrink-0">
            <img
              src="https://vibe.filesafe.space/1789758049296638029/attachments/838e42f7-e65c-4677-b7b8-452936eb11f7.png"
              alt="Energieassistent.io"
              className="h-8 sm:h-9 w-auto object-contain mix-blend-multiply dark:invert"
            />
          </a>

          {/* Desktop Menu Items: hidden on desktop as requested */}

          {/* Desktop Right Side: Login + CTA */}
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <a
              href="#login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </a>
            <a
              href="https://calendly.com/energieassistent-potentialanalyse/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-md hover:shadow-lg transition-all"
            >
              Erstgespräch vereinbaren
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 8H13M13 8L9 4M13 8L9 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>

          {/* Mobile Right Side: Modern Fancy Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Menü schließen" : "Menü öffnen"}
              aria-expanded={mobileMenuOpen}
              className="relative z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-card border border-border/80 shadow-sm backdrop-blur-md transition-all active:scale-95 hover:border-primary/40 focus:outline-none"
            >
              <div className="relative flex h-4 w-5 flex-col justify-between">
                <span
                  className={`block h-0.5 w-full rounded-full bg-foreground transition-all duration-300 ease-in-out ${
                    mobileMenuOpen
                      ? "translate-y-[7px] rotate-45 bg-primary"
                      : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-3/4 rounded-full bg-foreground transition-all duration-200 ease-in-out ${
                    mobileMenuOpen ? "opacity-0 translate-x-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-full rounded-full bg-foreground transition-all duration-300 ease-in-out ${
                    mobileMenuOpen
                      ? "-translate-y-[7px] -rotate-45 bg-primary"
                      : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Modern Fancy Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-20 z-40 overflow-hidden rounded-3xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl lg:hidden"
            >
              {/* Subtle top glow accent */}
              <div className="pointer-events-none absolute -top-12 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-primary/15 blur-2xl" />

              <div className="relative flex flex-col gap-5">
                {/* Nav Links */}
                <div className="flex flex-col divide-y divide-border/40">
                  {navLinks.map((link, idx) => (
                    <motion.a
                      key={link.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * idx, duration: 0.2 }}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center justify-between py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <span>{link.label}</span>
                      <svg
                        className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M6 3L11 8L6 13"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.a>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-border/60" />

                {/* Action Buttons: Login + Demo CTA */}
                <div className="flex flex-col gap-3 pt-1">
                  <a
                    href="#login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 items-center justify-center rounded-xl border border-border/80 bg-background/60 text-sm font-semibold text-foreground hover:border-primary/50 transition-colors"
                  >
                    Log in
                  </a>
                  <a
                    href="https://calendly.com/energieassistent-potentialanalyse/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md active:scale-[0.99] transition-all"
                  >
                    Erstgespräch vereinbaren
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 8H13M13 8L9 4M13 8L9 12"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-24 pb-20 text-center">
        {/* Eyebrow */}
        <Reveal>
          <span className="mb-6 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Online-Business im Energiemarkt
          </span>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.1}>
          <h1 className="max-w-3xl text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-tight">
            <span className="text-foreground">Launche deinen</span>
            <br />
            <span className="text-primary">Energieassistenten</span>
          </h1>
        </Reveal>

        {/* Subheadline */}
        <Reveal delay={0.2} className="mt-6">
          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            Mit deinem Energieassistenten stellst du Nutzern ein kostenloses
            KI-Tool zur Verfügung, das sich um ihre Strom- und Gastarife kümmert
            und ihnen beim Sparen hilft – während deine Nutzer sparen, verdienst
            du damit Geld.
          </p>
        </Reveal>

        {/* CTA Button */}
        <Reveal delay={0.3} className="mt-10">
          <a
            href="https://calendly.com/energieassistent-potentialanalyse/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
          >
            Kostenloses Erstgespräch vereinbaren
            <svg
              width="18"
              height="18"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8H13M13 8L9 4M13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </Reveal>

        {/* Benefit Bar */}
        <div className="mt-14 w-full max-w-4xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                title: "Millionen potenzielle Kunden",
                subtitle: "Über 40 Mio. Haushalte als bestehender Markt",
              },
              {
                title: "Ein Bedarf, der bereits existiert",
                subtitle:
                  "Ein Service rund um Verträge, die Haushalte ohnehin haben",
              },
              {
                title: "Dein Produkt ist bereits gebaut",
                subtitle: "White Label eingerichtet unter deiner Marke",
              },
            ].map((benefit, i) => (
              <Reveal key={benefit.title} delay={0.4 + i * 0.12}>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <span className="shrink-0 text-primary">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="10" cy="10" r="10" fill="currentColor" />
                        <path
                          d="M6 10.5L8.5 13L14 7.5"
                          stroke="white"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <h3 className="text-sm font-semibold text-foreground leading-snug">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
                    {benefit.subtitle}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;
