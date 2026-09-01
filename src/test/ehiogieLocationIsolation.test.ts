import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const locationId = "tn90CyE3XuYFTy4c1M3F";
const tarifLoader = readFileSync("public/loaders/tarif.html", "utf8");
const auftragLoader = readFileSync("public/loaders/auftrag.html", "utf8");

describe("Ehiogie Phase 0A location isolation", () => {
  it("scopes uuid and submission_id offer reads to the configured location", () => {
    expect(tarifLoader).toContain('client.from("auftraege").select("*").eq("location_id",locationId)');
    expect(tarifLoader).toContain('q=uuid?q.eq("uuid",uuid):q.eq("submission_id",submissionId)');
  });

  it("treats unknown and cross-location offers as the same neutral not-found result", () => {
    expect(tarifLoader).toContain('notFound.code="offer_not_found"');
    expect(tarifLoader).toContain('e.code === "offer_not_found"');
    expect(tarifLoader.match(/Diese Tarifempfehlung wurde nicht gefunden\./g)).toHaveLength(2);
    expect(auftragLoader).toContain('mount.dataset.errorCode = "offer_not_found"');
    expect(auftragLoader).toContain("Diese Tarifempfehlung wurde nicht gefunden.");
    expect(`${tarifLoader}\n${auftragLoader}`).not.toMatch(/gehört (?:nicht )?zu|andere(?:n|r)? Location/i);
  });

  it("validates the closing uuid for Ehiogie before loading the shared engine", () => {
    const scopedRead = 'client.from("auftraege").select("uuid").eq("uuid", config.uuidOverride).eq("location_id", config.locationId).limit(1)';
    expect(auftragLoader).toContain(scopedRead);
    expect(auftragLoader.indexOf(scopedRead)).toBeLessThan(auftragLoader.indexOf("document.createElement(\"script\")"));
  });

  it("provides immutable tenant and uuid inputs to the shared closing contract", () => {
    expect(auftragLoader).toContain(`locationId: "${locationId}"`);
    expect(auftragLoader).toContain('locationId: String(bootstrap.locationId || "").trim()');
    expect(auftragLoader).toContain("if (uuidParam) config.uuidOverride = uuidParam");
    expect(auftragLoader).toContain("window.SURVEY_CONFIG = {");
    expect(auftragLoader).not.toMatch(/locationId:\s*String\([^\n]*(?:searchParams|url\.searchParams)/);
  });

  it("does not introduce another tenant location into runtime loaders", () => {
    const runtime = `${tarifLoader}\n${auftragLoader}`;
    const configuredLocations = [...runtime.matchAll(/locationId:\s*"([A-Za-z0-9]{20})"/g)].map(match => match[1]);
    expect(configuredLocations.length).toBeGreaterThan(0);
    expect(new Set(configuredLocations)).toEqual(new Set([locationId]));
    expect(runtime).not.toMatch(/kromen|tarifbutler/i);
  });
});
