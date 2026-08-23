import { affiliateApi } from "@/lib/affiliateApi";
import { useEffect } from "react";

/** Captures the public referral once; all attribution continuity remains server-owned. */
export function AffiliateReferralCapture() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("ref")) return;
    const code = url.searchParams.get("ref") ?? "";

    void affiliateApi.resolveReferral(code).catch(() => undefined).finally(() => {
      const current = new URL(window.location.href);
      current.searchParams.delete("ref");
      window.history.replaceState(window.history.state, "", `${current.pathname}${current.search}${current.hash}`);
    });
  }, []);

  return null;
}
