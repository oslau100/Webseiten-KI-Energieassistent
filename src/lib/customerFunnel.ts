import type { JsonRecord } from "./websiteContentResolver";

/** Customer surveys require explicit release. JSON cannot release the order transport. */
export function customerRouteAvailable(path: string, layout: JsonRecord = {}): boolean {
  const features = (layout.features || {}) as JsonRecord;
  if (["/start", "/rechnungsprüfung", "/rechnungspruefung"].includes(path)) return features.start_survey === true;
  if (["/rechnung", "/start-rechnung", "/rechnung-fehler", "/fehler-rechnung"].includes(path)) return features.rechnung_survey === true;
  // No authenticated server-receipt verifier is wired for customer invoice completion.
  if (path === "/rechnung-eingegangen") return false;
  if (["/tarif", "/auftrag", "/auftrag-eingegangen", "/uebermittelt", "/fehler"].includes(path)) return false;
  return ["/", "/jahresrechnung", "/impressum", "/datenschutz", "/rueckruf", "/rueckruf-buchen"].includes(path);
}
