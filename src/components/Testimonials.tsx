import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    id: 1,
    title: "900 Euro gespart...",
    text: "Top Dienstleistung habe über 900 Euro gespart. Kein Aufwand und alles lief glatt!",
    source: "Trustpilot",
  },
  {
    id: 2,
    title: "Man kann sich zu 100%...",
    text: "Man kann sich zu 100% auf Tarif butler verlassen es werden immer die besten Tarife gefunden. Habe bereits Strom und Gas wechseln lassen und bin mega zufrieden. Sehr zu empfehlen!!",
    source: "Trustpilot",
  },
  {
    id: 3,
    title: "Das war wirklich einfach...",
    text: "Das war wirklich einfach. Innerhalb von wenigen Minuten war alles erledigt und nun spare ich auch noch Geld!",
    source: "Trustpilot",
  },
  {
    id: 4,
    title: "Da ich seit 10 Jahren...",
    text: "Da ich seit 10 Jahren beim Grundversorger war konnte ich auf einfachste Art und Weise mit Tarif butler eine Menge Geld sparen. Habe es selber immer aufgeschoben und jetzt endlich einen Butler dafür ;-)",
    source: "Trustpilot",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0b1221] leading-tight">
              Was unsere Nutzer über TarifButler sagen
            </h2>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-6">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/2">
                  <div className="bg-[#f8f9fa] rounded-3xl p-8 h-full flex flex-col">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 fill-[#42f77a] text-[#42f77a]" />
                      ))}
                    </div>
                    <h3 className="text-2xl font-bold text-[#0b1221] mb-4">
                      {testimonial.title}
                    </h3>
                    <p className="text-[#0b1221] text-lg leading-relaxed mb-8 flex-grow">
                      {testimonial.text}
                    </p>
                    <div className="font-bold text-[#0b1221]">
                      {testimonial.source}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-[-3rem] border-none bg-transparent hover:bg-transparent text-[#0b1221] [&>svg]:w-8 [&>svg]:h-8" />
              <CarouselNext className="right-[-3rem] border-none bg-transparent hover:bg-transparent text-[#0b1221] [&>svg]:w-8 [&>svg]:h-8" />
            </div>
          </Carousel>
          
          {/* Custom Dots Indicator (Static visual representation for now, as shadcn carousel doesn't have built-in dots without custom state) */}
          <div className="flex justify-center gap-2 mt-12">
            <div className="w-3 h-3 rounded-full bg-[#0b1221]"></div>
            <div className="w-3 h-3 rounded-full bg-[#0b1221]"></div>
            <div className="w-3 h-3 rounded-full bg-[#42f77a]"></div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <Button 
            size="lg" 
            className="bg-[#42f77a] hover:bg-[#3ce06f] text-[#0b1221] font-bold text-xl px-12 py-8 rounded-full shadow-[0_0_40px_rgba(66,247,122,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(66,247,122,0.6)]"
          >
            Jetzt Ersparnis prüfen
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
