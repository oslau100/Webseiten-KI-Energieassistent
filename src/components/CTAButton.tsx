import Reveal from "@/components/Reveal";

interface CTAButtonProps {
  text?: string;
  className?: string;
  buttonClassName?: string;
  variant?: "primary" | "white";
  delay?: number;
}

const CTAButton = ({
  text = "Kostenloses Erstgespräch vereinbaren",
  className = "",
  buttonClassName = "",
  variant = "primary",
  delay = 0,
}: CTAButtonProps) => {
  const variantStyles =
    variant === "white"
      ? "bg-white text-[#1a5147] hover:bg-gray-100 font-semibold shadow-xl"
      : "bg-primary text-primary-foreground shadow-lg hover:shadow-xl font-medium";

  return (
    <Reveal delay={delay} className={className}>
      <a
        href="https://calendly.com/energieassistent-demo/30min"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-center text-base transition-all ${variantStyles} ${buttonClassName}`}
      >
        {text}
      </a>
    </Reveal>
  );
};

export default CTAButton;
