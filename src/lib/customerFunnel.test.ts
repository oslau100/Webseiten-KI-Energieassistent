import { describe, expect, it } from "vitest";
import { customerRouteAvailable } from "./customerFunnel";

const startRoutes = ["/start", "/rechnungsprüfung", "/rechnungspruefung"];
const invoiceRoutes = ["/rechnung", "/start-rechnung", "/rechnung-fehler", "/fehler-rechnung"];
describe("customer funnel configuration", () => {
  it.each([undefined, null, {}, { features: {} }])("blocks surveys without configuration: %j", layout => {
    for (const path of [...startRoutes, ...invoiceRoutes]) expect(customerRouteAvailable(path, layout ?? undefined)).toBe(false);
  });
  it.each([undefined, null, false, "true", 1, "", {}, []])("requires boolean true rather than truthiness: %j", flag => {
    for (const path of [...startRoutes, ...invoiceRoutes]) expect(customerRouteAvailable(path, { features: { start_survey: flag, rechnung_survey: flag } })).toBe(false);
  });
  it.each([...startRoutes, ...invoiceRoutes])("allows an explicitly released survey: %s", path => {
    expect(customerRouteAvailable(path, { features: { start_survey: true, rechnung_survey: true } })).toBe(true);
  });
  it("releases each survey independently", () => {
    expect(customerRouteAvailable("/start", { features: { rechnung_survey: true } })).toBe(false);
    expect(customerRouteAvailable("/rechnung", { features: { start_survey: true } })).toBe(false);
  });
  it("blocks invoice completion even with an enabled survey until server receipts are verified", () => {
    expect(customerRouteAvailable("/rechnung-eingegangen", { features: { rechnung_survey: true } })).toBe(false);
  });
  it.each(["/tarif", "/auftrag", "/auftrag-eingegangen", "/uebermittelt", "/fehler"])("never releases the order transport via JSON: %s", path => {
    expect(customerRouteAvailable(path)).toBe(false);
    expect(customerRouteAvailable(path, { features: { order_funnel: true, start_survey: true, rechnung_survey: true } })).toBe(false);
  });
  it.each(["/rueckruf", "/rueckruf-buchen"])("keeps the real callback route available: %s", path => {
    expect(customerRouteAvailable(path)).toBe(true);
  });
});
