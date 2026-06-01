import {
  customerDefaultWebsiteContentConfig,
  customerDefaultWebsiteDesignConfig,
  customerDefaultWebsiteLayoutConfig,
  type JsonRecord,
} from "./customerDefaults";

/**
 * Tenant-spezifische Kromen Website-Defaults als getrennte Content-Schicht.
 *
 * Diese Datei kopiert keine Inhalte aus Referenz-Tenants, sondern kapselt die
 * bestehenden Kromen-Fallbacks aus customerDefaults.ts, damit Resolver-Logik
 * und React-Provider getrennt weiterentwickelt werden können.
 */
export const websiteDefaultDesignConfig: JsonRecord = {
  ...customerDefaultWebsiteDesignConfig,
};

export const websiteDefaultLayoutConfig: JsonRecord = {
  ...customerDefaultWebsiteLayoutConfig,
};

export const websiteDefaultContentConfig: JsonRecord = {
  ...customerDefaultWebsiteContentConfig,
};
