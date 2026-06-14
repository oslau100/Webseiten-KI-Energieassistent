import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const BannerCTA = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden min-h-[320px] flex items-center justify-center shadow-lg bg-[#4df07b]"
        >
          {/* Content */}
          <div className="relative z-10 w-full max-w-4xl mx-auto p-8 md:p-16 flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#0b1221] mb-4 leading-tight">
              Verschenke kein Geld mehr an deinen Energieanbieter
            </h2>
            <p className="text-[#0b1221] text-lg md:text-xl mb-8 font-medium">
              Prüfe jetzt in 60 Sekunden, wie viel du aktuell sparst – 100% kostenlos und unverbindlich
            </p>
            <Button
              size="lg"
              className="bg-white text-[#0b1221] hover:bg-gray-50 hover:text-[#0b1221] rounded-full font-bold px-8 py-6 text-lg shadow-sm"
              asChild
            >
              <Link to="/start">Jetzt Ersparnis prüfen</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
