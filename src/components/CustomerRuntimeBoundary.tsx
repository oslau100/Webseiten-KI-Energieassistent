import { useLocation } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useWebsiteConfig } from "@/lib/websiteConfig";

/** Mount no customer pages, loaders, tracking, or funnel effects before readiness. */
export function CustomerRuntimeBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { loading, readiness, notReadyReason, customerRuntime } = useWebsiteConfig();
  const orderContractPending = customerRuntime && !["/", "/jahresrechnung", "/impressum", "/datenschutz", "/rueckruf-buchen"].includes(pathname);
  const blocked = readiness === "NOT_READY" || orderContractPending;
  useEffect(() => {
    if (!customerRuntime || !blocked) return;
    document.title = "NOT_READY";
    document.head.querySelectorAll('meta[name="description"], meta[name="author"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], link[rel="icon"]').forEach(node => node.remove());
  }, [customerRuntime, blocked]);
  if (blocked) {
    return <main role="status" aria-busy={loading} data-readiness="NOT_READY" data-reason={orderContractPending ? "TRANSPORT_NOT_READY" : notReadyReason}><h1>NOT_READY</h1><p>Die Website wird vorbereitet.</p></main>;
  }
  return <>{children}</>;
}
