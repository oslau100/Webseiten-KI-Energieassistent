import { useEffect } from "react";
import { captureAffiliateReferral } from "@/lib/affiliateReferral";

export function AffiliateReferralCapture() {
  useEffect(() => { void captureAffiliateReferral(); }, []);
  return null;
}
