import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";

export function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="w-full pt-12 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
          
          {/* Left Side: Mockup Illustration */}
          <motion.div 
            className="relative flex justify-center items-center order-2 lg:order-1 w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img 
              src="https://vibe.filesafe.space/1775221216043671236/attachments/0856683f-3c8c-424e-922e-052fab25ed82.png" 
              alt="TarifButler App Preview" 
              className="w-full max-w-[800px] xl:max-w-[900px] h-auto object-contain scale-[1.9] sm:scale-110 lg:scale-125 mt-8 sm:mt-0"
            />
          </motion.div>

          {/* Right Side: Text Content */}
          <motion.div 
            className="flex flex-col items-center lg:items-start order-1 lg:order-2"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Social Proof Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 sm:gap-3 bg-muted/50 rounded-full px-3 sm:px-4 py-2 mb-8 border border-border/50 max-w-full">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-[#42f77a]"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-[#42f77a]"></span>
              </span>
              <span className="text-[11px] min-[375px]:text-xs sm:text-sm font-semibold text-foreground whitespace-nowrap">
                Über 10.000 zufriedene Nutzer in ganz Deutschland
              </span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1] text-center lg:text-left">
              Der digitale<br />
              Assistent für deine<br />
              Strom- & Gastarife
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-10 max-w-xl leading-relaxed text-center lg:text-left">
              TarifButler prüft hunderte Tarife, filtert Lockangebote und versteckte Risiken automatisch aus und empfiehlt dir einen sicheren Tarif mit echter Ersparnis
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col items-center lg:items-start w-full sm:w-auto">
              <Button size="lg" className="relative overflow-hidden group w-full sm:w-auto rounded-full text-xl font-bold px-12 py-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20" asChild>
                <Link to="/start">
                  <span className="relative z-10">Jetzt Ersparnis prüfen</span>
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12" />
                </Link>
              </Button>
              <p className="text-sm italic text-muted-foreground mt-3 text-center lg:text-left">
                Ergebnis in 60 Sekunden - 100% kostenlos
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
