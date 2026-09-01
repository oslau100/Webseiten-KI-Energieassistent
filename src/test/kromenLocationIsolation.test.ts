import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const closingLoader = readFileSync("public/loaders/auftrag.html", "utf8");
const locationId = loader.match(/locationId:\s+"([^"]+)"/)?.[1];
const scopeQuerySource = loader.match(/function scopeAuftragQuery[\s\S]*?\n\s{2}}/)?.[0];
const closingLocationId = closingLoader.match(/locationId:\s+"([^"]+)"/)?.[1];
const closingScopeQuerySource = closingLoader.match(/function scopeClosingPreflightQuery[\s\S]*?\n\s{4}}/)?.[0];

type Auftrag = { uuid: string; submission_id: string; location_id: string };
type Identifiers = { uuid: string | null; submissionId: string | null };

class Query {
  private filters: Array<[keyof Auftrag, string]> = [];

  constructor(private readonly rows: Auftrag[]) {}

  eq(column: keyof Auftrag, value: string) {
    this.filters.push([column, value]);
    return this;
  }

  limit(count: number) {
    return this.rows
      .filter((row) => this.filters.every(([column, value]) => row[column] === value))
      .slice(0, count);
  }
}

const scopeAuftragQuery = new Function(
  `${scopeQuerySource}; return scopeAuftragQuery;`,
)() as (query: Query, identifiers: Identifiers, customerLocationId: string) => Query;

const scopeClosingPreflightQuery = new Function(
  `${closingScopeQuerySource}; return scopeClosingPreflightQuery;`,
)() as (query: Query, uuid: string, customerLocationId: string) => Query;

const rows: Auftrag[] = [
  { uuid: "kromen-uuid", submission_id: "kromen-submission", location_id: locationId! },
  { uuid: "foreign-uuid", submission_id: "foreign-submission", location_id: "foreign-location" },
];

describe("Kromen tariff location isolation", () => {
  it("keeps the fixed Kromen location and does not accept a location from the URL", () => {
    expect(locationId).toBe("Ddc0DVM8MT67wmLP3wAA");
    expect(closingLocationId).toBe("Ddc0DVM8MT67wmLP3wAA");
    expect(closingLoader).not.toMatch(/searchParams\.get\(["']location_id["']\)/);
    expect([...closingLoader.matchAll(/locationId:\s+"([^"]+)"/g)].map((match) => match[1])).toEqual([
      "Ddc0DVM8MT67wmLP3wAA",
    ]);
  });

  it("loads a Kromen UUID for the configured Kromen location", () => {
    const result = scopeAuftragQuery(new Query(rows), { uuid: "kromen-uuid", submissionId: null }, locationId!).limit(1);
    expect(result).toEqual([rows[0]]);
  });

  it("returns no data for a UUID belonging to another location", () => {
    const result = scopeAuftragQuery(new Query(rows), { uuid: "foreign-uuid", submissionId: null }, locationId!).limit(1);
    expect(result).toEqual([]);
  });

  it("returns the same empty result for an unknown UUID", () => {
    const result = scopeAuftragQuery(new Query(rows), { uuid: "unknown-uuid", submissionId: null }, locationId!).limit(1);
    expect(result).toEqual([]);
    expect(loader).toContain('const NOT_FOUND_TEXT = "Diese Tarifempfehlung wurde nicht gefunden."');
  });

  it("also scopes submission_id lookups to the Kromen location", () => {
    const own = scopeAuftragQuery(new Query(rows), { uuid: null, submissionId: "kromen-submission" }, locationId!).limit(1);
    const foreign = scopeAuftragQuery(new Query(rows), { uuid: null, submissionId: "foreign-submission" }, locationId!).limit(1);
    expect(own).toEqual([rows[0]]);
    expect(foreign).toEqual([]);
  });
});

describe("Kromen closing preflight", () => {
  const notFoundText = "Diese Tarifempfehlung wurde nicht gefunden.";

  it("scopes the Auftrag lookup by UUID and configured location", () => {
    const own = scopeClosingPreflightQuery(new Query(rows), "kromen-uuid", closingLocationId!).limit(1);
    expect(own).toEqual([rows[0]]);
  });

  it("returns the identical neutral not-found result for foreign and unknown UUIDs", () => {
    const foreign = scopeClosingPreflightQuery(new Query(rows), "foreign-uuid", closingLocationId!).limit(1);
    const unknown = scopeClosingPreflightQuery(new Query(rows), "unknown-uuid", closingLocationId!).limit(1);
    expect(foreign).toEqual([]);
    expect(unknown).toEqual(foreign);
    expect(closingLoader).toContain(`const NOT_FOUND_TEXT = "${notFoundText}"`);
  });

  it("requires uuidOverride and runs the preflight before loading the shared engine", () => {
    const uuidGuard = closingLoader.indexOf("if (!config.uuidOverride)");
    const preflight = closingLoader.indexOf("scopeClosingPreflightQuery(", uuidGuard);
    const engineInjection = closingLoader.indexOf('document.createElement("script")');

    expect(uuidGuard).toBeGreaterThan(-1);
    expect(preflight).toBeGreaterThan(uuidGuard);
    expect(engineInjection).toBeGreaterThan(preflight);
    expect(closingLoader).toContain("config.uuidOverride,\n        config.locationId");
  });
});
