import { customerRouteAvailable } from "@/lib/customerFunnel";
import { cn } from "@/lib/utils";
import { forwardRef, useId, type ComponentProps } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

/** Navigation and the route boundary share the same configured feature gates. */
type MarketingLinkProps = ComponentProps<typeof Link> & { labelPath?: string };
export const MarketingLink = forwardRef<HTMLAnchorElement, MarketingLinkProps>(function MarketingLink({ labelPath, ...props }, ref) {
  const { customerRuntime, getText, layout } = useWebsiteConfig();
  const { lang } = useI18n();
  const statusId = useId();
  const path = typeof props.to === "string" ? props.to.split(/[?#]/)[0] : props.to.pathname;
  const customerCta = customerRuntime && ["/start", "/tarif", "/rechnung", "/start-rechnung"].includes(path || "");
  if (customerRuntime && !customerRouteAvailable(path || "", layout)) {
    const email = getText("brand.contact_email", "").trim();
    const label = getText("availability.unavailable", "", lang).trim();
    const contact = getText("availability.contact", "", lang).trim();
    const hasContact = Boolean(contact && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    const hasStatus = Boolean(label || hasContact);
    const canonicalPath = path === "/rechnung" ? "sections.jahresrechnung.cta" : "i18n.cta_check_savings";
    // Only this Location's configuration supplies customer marketing labels.
    const action = getText(labelPath || canonicalPath, "", lang).trim() || getText(canonicalPath, "", lang).trim();
    return <span className="inline-flex w-full sm:w-auto max-w-full flex-col items-center gap-2 align-middle" data-transport="NOT_READY" data-copy-readiness={action ? "READY" : "MISSING_LABEL"}>
      {action ? <span id={props.id} role="button" aria-disabled="true" aria-describedby={hasStatus ? statusId : undefined}
        className={cn(props.className, customerCta && "customer-cta", "pointer-events-none cursor-not-allowed whitespace-normal h-auto min-h-11 py-3 max-w-full text-center", props.className?.includes("h-16") && "min-h-16")}>{action}</span> : null}
      {hasStatus ? <span id={statusId} role="status" className="block max-w-full text-center text-xs font-normal leading-relaxed">
        {label}
        {hasContact ? <>{label ? " · " : null}<a href={`mailto:${email}`} className="underline underline-offset-4">{contact}</a></> : null}
      </span> : null}
    </span>;
  }
  return <Link {...props} className={cn(props.className, customerCta && "customer-cta")} ref={ref} />;
});
