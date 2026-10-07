import { Facebook, Instagram, Youtube } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { useI18n } from "@/lib/i18n";
import { resolveLocalizedText } from "@/lib/websiteContentResolver";
import { useWebsiteConfig } from "@/lib/websiteConfig";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25h-3.27v13.37a2.89 2.89 0 1 1-2.89-2.89c.24 0 .48.03.7.09V9.69a6.16 6.16 0 0 0-.7-.04A6.17 6.17 0 1 0 15.82 15V8.2a8.1 8.1 0 0 0 4.74 1.53V6.69h-.97Z" />
  </svg>
);

export const About = () => {
  const { lang } = useI18n();
  const { getText, getArray } = useWebsiteConfig();
  const mode = getText("sections.about.mode", "company");
  const name = getText("sections.about.name", "Energieassistent", lang);
  const image = getText("sections.about.image_url", "", lang);
  const role = getText("sections.about.role", "", lang);
  const socialHint = getText("sections.about.social_hint", "", lang);
  const socialLinks = [
    { key: "tiktok", label: "TikTok", Icon: TikTokIcon },
    { key: "youtube", label: "YouTube", Icon: Youtube },
    { key: "facebook", label: "Facebook", Icon: Facebook },
    { key: "instagram", label: "Instagram", Icon: Instagram },
  ].map((link) => ({ ...link, href: getText(`sections.about.social.${link.key}`, "", lang).trim() }))
    .filter((link) => /^https?:\/\//i.test(link.href));
  const legacyParagraphs = Array.from({ length: 6 }, (_, index) => getText(`sections.about.paragraph_${index + 1}`, "", lang));
  const paragraphs = getArray<unknown>("sections.about.paragraphs", legacyParagraphs)
    .map((value) => resolveLocalizedText({ value }, "value", "", lang)).filter((value) => value.trim());
  const hasAside = Boolean(image || socialLinks.length);

  if (mode === "hidden") return null;

  return (
    <section className="py-16 md:py-24 bg-background" data-about-mode={mode === "person" ? "person" : "company"}>
      <div className="container px-4 md:px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{getText("sections.about.headline", "Über den Energieassistenten", lang)}</h2>
        </AnimatedSection>

        <AnimatedSection delay={200} className="bg-muted/30 rounded-3xl overflow-hidden shadow-sm max-w-6xl mx-auto">
          <div className="grid md:grid-cols-12 gap-8 items-center p-8 md:p-12 lg:p-16">
            {hasAside ? <div className="md:col-span-4 lg:col-span-5 flex flex-col items-center text-center space-y-6">
              {image ? <div className={`w-48 h-48 md:w-64 md:h-64 ${mode === "person" ? "rounded-full" : "rounded-3xl"} overflow-hidden border-4 border-background shadow-xl`}>
                <img src={image} alt={getText("sections.about.image_alt", name, lang) || name} className={`w-full h-full ${mode === "person" ? "object-cover" : "object-contain"}`} />
              </div> : null}
              {socialLinks.length ? <div className="space-y-4">
                {socialHint ? <p className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{socialHint}</p> : null}
                <div className="flex justify-center gap-4 text-muted-foreground">
                  {socialLinks.map(({ key, label, href, Icon }) => <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="transition-colors hover:text-primary"><Icon className="h-6 w-6" /></a>)}
                </div>
              </div> : null}
            </div> : null}
            <div className={`${hasAside ? "md:col-span-8 lg:col-span-7" : "md:col-span-12"} space-y-6`}>
              <div>
                {name ? <h3 className="text-2xl font-bold">{name}</h3> : null}
                {role ? <p className="text-primary font-medium">{role}</p> : null}
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
                {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
