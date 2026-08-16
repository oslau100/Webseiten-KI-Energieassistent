import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const tarifLoader = readFileSync("public/loaders/tarif.html", "utf8");
const auftragLoader = readFileSync("public/loaders/auftrag.html", "utf8");
const expectedLocationId = "zMzYbmm0fF0pPpuzSBL7";

describe("TarifButler location isolation", () => {
  it("scopes UUID and submission_id offer reads to the configured location", () => {
    expect(tarifLoader).toContain('client.from("auftraege").select("*").eq("location_id",locationId)');
    expect(tarifLoader).toContain('q=uuid?q.eq("uuid",uuid):q.eq("submission_id",submissionId)');
    expect(tarifLoader).toContain(`locationId: "${expectedLocationId}"`);
  });

  it("uses the same neutral response for unknown and cross-location offers", () => {
    expect(tarifLoader).toContain('notFound.code="offer_not_found"');
    expect(tarifLoader).toContain('e?.code==="offer_not_found"');
    expect(tarifLoader.match(/Diese Tarifempfehlung wurde nicht gefunden\./g)).toHaveLength(2);
    expect(tarifLoader).not.toMatch(/gehört (?:nicht )?zu|andere(?:n|r)? Location/i);
  });

  it("passes the trusted location and current UUID to the closing engine runtime", () => {
    expect(auftragLoader).toContain(`locationId: "${expectedLocationId}"`);
    expect(auftragLoader).toContain('locationId: String(bootstrap.locationId || "").trim()');
    expect(auftragLoader).toContain("if (uuidParam) config.uuidOverride = uuidParam");
    expect(auftragLoader).toContain("window.SURVEY_CONFIG = {");
    expect(auftragLoader).toContain("...config,");
    expect(auftragLoader).not.toContain('searchParams.get("location_id")');
  });

  it("does not start closing until UUID ownership has been checked", () => {
    const guard = 'client.from("auftraege").select("uuid").eq("uuid", config.uuidOverride).eq("location_id", config.locationId).maybeSingle()';
    expect(auftragLoader).toContain(guard);
    expect(auftragLoader.indexOf(guard)).toBeLessThan(auftragLoader.indexOf("document.createElement(\"script\")"));
    expect(auftragLoader).toContain('mount.dataset.errorCode = "offer_not_found"');
    expect(auftragLoader).toContain("Diese Tarifempfehlung wurde nicht gefunden.");
  });

  it("does not introduce another customer location into runtime code", () => {
    const runtime = `${tarifLoader}\n${auftragLoader}`;
    expect(runtime).not.toMatch(/Kromen|Ehiogie/i);
  });
});
