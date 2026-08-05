export type JsonRecord = Record<string, unknown>;

/**
 * Projektweite Core-Defaults.
 *
 * Für neue Kunden nur diese Datei anpassen/duplizieren,
 * damit die Seite ohne Supabase bereits möglichst nah am Ziel-Content läuft.
 */
export const customerDefaultWebsiteDesignConfig: JsonRecord = {
  colors: {
    primary: "#2563eb",
    text: "#0f172a",
    mutedText: "#64748b",
    background: "#ffffff",
  },
  radius: {
    section: "2.5rem",
  },
  assets: {
    logo_header: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69fb93b70394c985036ed4ae.png",
    logo_footer: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69fb93b70394c985036ed4ae.png",
    hero_image: "https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69d3fcc217d86ef0ca1836e6.png",
    agency_logo: "https://oynhnhkldvpoqhsfirwf.supabase.co/storage/v1/object/public/crm-lp-assets/logo-schwarz-100x100.png",
  },
};

export const customerDefaultWebsiteLayoutConfig: JsonRecord = {
  pages: {
    home: {
      sections: ["header", "hero", "problem", "solution", "how_it_works", "comparison", "testimonials", "about", "stats", "faq", "footer"],
    },
    annual: {
      sections: ["header", "hero", "process", "why", "value", "comparison", "testimonials", "about", "stats", "faq", "final_cta", "footer"],
    },
  },
};

export { customerDefaultWebsiteContentConfig } from "./websiteContentDefaults";