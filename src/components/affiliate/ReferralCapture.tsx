import { affiliateApi } from "@/lib/affiliate-api";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Lets the server own referral attribution; the browser only relays the incoming code once. */
export function ReferralCapture() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("ref");
    if (!code) return;

    const removeReferralParam = () => {
      const current = new URL(window.location.href);
      current.searchParams.delete("ref");
      window.history.replaceState(window.history.state, "", `${current.pathname}${current.search}${current.hash}`);
    };

    void affiliateApi.resolveReferral(code).catch(() => undefined).finally(removeReferralParam);
  }, [location.search]);

  return null;
}
