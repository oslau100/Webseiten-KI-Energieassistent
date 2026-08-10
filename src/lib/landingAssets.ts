const STORAGE_ORIGIN = "https://oynhnhkldvpoqhsfirwf.supabase.co";
const ASSET_BASE = `${STORAGE_ORIGIN}/storage/v1/object/public/crm-lp-assets/energieassistent-io`;

export const landingAssets = {
  logo: `${ASSET_BASE}/energieassistent-logo-weiss.webp`,
  socialProof: `${ASSET_BASE}/social-proof.webp`,
  salesSystem: {
    medium: `${ASSET_BASE}/vertriebssystem-1000.webp`,
    large: `${ASSET_BASE}/vertriebssystem-2000.webp`,
  },
  crmDashboard: {
    medium: `${ASSET_BASE}/crm-dashboard-1200.webp`,
    large: `${ASSET_BASE}/crm-dashboard-2000.webp`,
  },
  caseStudies: {
    tarifbutler: `${ASSET_BASE}/fallstudie-tarifbutler.webp`,
    kromen: `${ASSET_BASE}/fallstudie-kromen.webp`,
    ehiogie: `${ASSET_BASE}/fallstudie-ehiogie.webp`,
  },
  about: {
    osasereLaurent: `${ASSET_BASE}/osasere-laurent.webp`,
    locationWuerselen: `${ASSET_BASE}/standort-wuerselen.webp`,
  },
} as const;
