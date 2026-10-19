import { customerRouteAvailable } from "@/lib/customerFunnel";
import { cn } from "@/lib/utils";
import { forwardRef, type ComponentProps } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

/** Navigation and the route boundary share the same configured feature gates. */
type MarketingLinkProps = ComponentProps<typeof Link> & { labelPath?: string };
export const MarketingLink = forwardRef<HTMLAnchorElement, MarketingLinkProps>(function MarketingLink({ labelPath, ...props }, ref) {
  const { customerRuntime, getText, layout } = useWebsiteConfig();
  const { lang } = useI18n();
  const path = typeof props.to === "string" ? props.to.split(/[?#]/)[0] : props.to.pathname;
  const customerCta = customerRuntime && ["/start", "/tarif", "/rechnung", "/start-rechnung"].includes(path || "");
  if (customerRuntime && !customerRouteAvailable(path || "", layout)) {
    const canonicalPath = path === "/rechnung" ? "sections.jahresrechnung.cta" : "i18n.cta_check_savings";
    // Only this Location's configuration supplies customer marketing labels.
    const action = getText(labelPath || canonicalPath, "", lang).trim() || getText(canonicalPath, "", lang).trim();
    // No href, event handlers or focus target: presentation never releases the route gate.
    return action ? <span id={props.id} role="button" aria-disabled="true" data-transport="NOT_READY" data-copy-readiness="READY"
      className={cn(props.className, customerCta && "customer-cta", "pointer-events-none cursor-not-allowed whitespace-normal h-auto min-h-11 py-3 max-w-full text-center", props.className?.includes("h-16") && "min-h-16")}>{action}</span>
      : <span hidden data-transport="NOT_READY" data-copy-readiness="MISSING_LABEL" />;
  }
  return <Link {...props} className={cn(props.className, customerCta && "customer-cta")} ref={ref} />;
});
