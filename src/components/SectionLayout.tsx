import { Children, Fragment, type ReactNode } from "react";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { useI18n } from "@/lib/i18n";
import { getByPath } from "@/lib/websiteContentResolver";
import { websiteSections } from "@/lib/websiteSections";

export function SectionLayout({ page, ids, children }: { page: "home" | "annual"; ids: readonly string[]; children: ReactNode }) {
  const { layout, content, customerRuntime } = useWebsiteConfig();
  const { lang } = useI18n();
  const arrays: Record<string, string> = page === "home" ? {problem:"problem.items",how_it_works:"how_it_works.items",comparison:"comparison.portals",testimonials:"testimonials.home_reviews",stats:"stats.items",about:"about.paragraphs",faq:"faq.home_items"} : {process:"jahresrechnung.process",why:"jahresrechnung.why",comparison:"jahresrechnung.comparison_self",testimonials:"jahresrechnung.reviews",stats:"stats.items",about:"about.paragraphs"};
  const elements: ReactNode[] = [];
  Children.forEach(children, child => { elements.push(child); });
  const ordered = websiteSections(layout, page, ids, customerRuntime);
  const headerVisible = websiteSections(layout, page, ["header"], customerRuntime).includes("header");
  return <>{ordered.map((id, index) => {
    const path = arrays[id];
    const de = path && (getByPath(content, `sections.${path}.de`) ?? getByPath(content, `sections.${path}`));
    const translated = path && getByPath(content, `sections.${path}.${lang}`);
    const pending = customerRuntime && lang !== "de" && Array.isArray(de) && de.length > 0 && (!Array.isArray(translated) || !translated.length);
    const section = pending ? <section hidden data-copy-readiness="INCOMPLETE" data-translation-pending={id} /> : elements[ids.indexOf(id)];
    return <Fragment key={id}>{index === 0 && id !== "hero" && headerVisible ? <div className="pt-24 md:pt-32">{section}</div> : section}</Fragment>;
  })}</>;
}
