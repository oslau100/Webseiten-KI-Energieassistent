import { cn } from "@/lib/utils";
import { forwardRef, type ComponentProps } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

/** Mirrors the dormant customer funnel boundary; never implies a transport exists. */
export const MarketingLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(function MarketingLink(props, ref) {
  const { customerRuntime, getText } = useWebsiteConfig();
  const { lang } = useI18n();
  const path = typeof props.to === "string" ? props.to.split(/[?#]/)[0] : props.to.pathname;
  if (customerRuntime && ["/start", "/tarif", "/rechnung"].includes(path || "")) {
    const email = getText("brand.contact_email", "").trim();
    const label = getText("availability.unavailable", "", lang);
    const contact = getText("availability.contact", "", lang);
    return <span className={cn(props.className, "whitespace-normal h-auto min-h-14 py-4 max-w-full flex-wrap")} data-transport="NOT_READY" role="status">{label}{/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? <> · <a href={`mailto:${email}`} className="underline underline-offset-4">{contact}</a></> : null}</span>;
  }
  return <Link {...props} ref={ref} />;
});
