import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const loader = readFileSync("public/loaders/tarif.html", "utf8");
const locationId = loader.match(/locationId:\s+"([^"]+)"/)?.[1];
const scopeQuerySource = loader.match(/function scopeAuftragQuery[\s\S]*?\n\s{2}}/)?.[0];

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

const rows: Auftrag[] = [
  { uuid: "kromen-uuid", submission_id: "kromen-submission", location_id: locationId! },
  { uuid: "foreign-uuid", submission_id: "foreign-submission", location_id: "foreign-location" },
];

describe("Kromen tariff location isolation", () => {
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
