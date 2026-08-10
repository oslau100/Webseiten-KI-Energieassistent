const LANDING_ASSET_BASE =
  "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/energieassistent-io";

export const landingAssets = {
  logo: `${LANDING_ASSET_BASE}/energieassistent-logo-weiss.webp`,
  socialProof: `${LANDING_ASSET_BASE}/social-proof.webp`,
  systemSolution: {
    width1000: `${LANDING_ASSET_BASE}/vertriebssystem-1000.webp`,
    width2000: `${LANDING_ASSET_BASE}/vertriebssystem-2000.webp`,
  },
  crmDashboard: {
    width1200: `${LANDING_ASSET_BASE}/crm-dashboard-1200.webp`,
    width2000: `${LANDING_ASSET_BASE}/crm-dashboard-2000.webp`,
  },
  caseStudies: {
    tarifbutler: `${LANDING_ASSET_BASE}/fallstudie-tarifbutler.webp`,
    kromen: `${LANDING_ASSET_BASE}/fallstudie-kromen.webp`,
    ehiogie: `${LANDING_ASSET_BASE}/fallstudie-ehiogie.webp`,
  },
  about: {
    founder: `${LANDING_ASSET_BASE}/osasere-laurent.webp`,
    location: `${LANDING_ASSET_BASE}/standort-wuerselen.webp`,
  },
  favicon: `${LANDING_ASSET_BASE}/favicon.svg`,
} as const;
