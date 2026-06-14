import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const CallToAction = () => {
  return (
    <section className="py-12 md:py-24 bg-[#42f77a]">
      <div className="container mx-auto px-4 max-w-5xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold text-[#0b1221] mb-6 leading-tight tracking-tight"
        >
          Die meisten Haushalte zahlen jedes Jahr hunderte
          <br className="hidden md:block" /> Euro zu viel - ohne es zu merken
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-[#0b1221] mb-10 font-medium"
        >
          Finde in 60 Sekunden heraus, ob du zu viel zahlst
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button className="bg-white hover:bg-white/90 text-[#0b1221] text-lg px-10 py-7 rounded-full font-bold shadow-lg transition-transform hover:scale-105" asChild>
            <Link to="/start">Jetzt Ersparnis prüfen</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
