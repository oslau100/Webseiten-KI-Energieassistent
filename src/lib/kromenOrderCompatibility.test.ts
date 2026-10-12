import { describe, expect, it, vi } from "vitest";
import { BOOKING_LOCATION_ID } from "./publicBooking";
import { KROMEN_LOCATION_ID, kromenOrderDiagnostic, resolveKromenOrderReference, type KromenOrderReference } from "./kromenOrderCompatibility";

const uuid = "11111111-2222-4333-8444-555555555555";
const resolve = (search: unknown, location: unknown = KROMEN_LOCATION_ID) => resolveKromenOrderReference(location, search);

describe("isolated Kromen order reference compatibility", () => {
  it("uses the existing Kromen Location identity, never an order UUID as Location", () => {
    expect(KROMEN_LOCATION_ID).toBe(BOOKING_LOCATION_ID);
    expect(resolve(`?uuid=${uuid}`)).toEqual({ ok: true, locationId: KROMEN_LOCATION_ID, orderUuid: uuid, authorized: false });
    expect(resolve(`?uuid=${uuid}`, uuid)).toEqual({ ok: false, reason: "invalid_location", authorized: false });
  });

  it.each([undefined, null, "", "other-location", ` ${KROMEN_LOCATION_ID}`])("fails closed for an untrusted Location: %j", location => {
    expect(resolveKromenOrderReference(location, `?uuid=${uuid}`).ok).toBe(false);
  });

  it.each(["other-location", "", uuid, `${KROMEN_LOCATION_ID}&location_id=${KROMEN_LOCATION_ID}`])("rejects conflicting or ambiguous query Location: %s", location => {
    expect(resolve(`?uuid=${uuid}&location_id=${location}`)).toEqual({ ok: false, reason: "invalid_location", authorized: false });
  });

  it("accepts explicit matching Location and preserves trimmed UUID casing", () => {
    const upperUuid = "ABCDEFAB-1234-5678-ABCD-ABCDEFABCDEF";
    expect(resolve(`?uuid=%20${upperUuid}%20&location_id=${KROMEN_LOCATION_ID}`)).toMatchObject({ ok: true, orderUuid: upperUuid, authorized: false });
  });

  it.each(["", "?uuid=", "?uuid=not-a-uuid", `?uuid=${uuid}&uuid=${uuid}`, "?submission_id=legacy-id", "?uuid=11111111222243338444555555555555", "?uuid=%3Cscript%3E", "?uuid=null"])("fails closed without one canonical order UUID: %s", search => {
    expect(resolve(search)).toEqual({ ok: false, reason: "invalid_order_uuid", authorized: false });
  });

  it.each([undefined, null, {}, 123])("does not coerce malformed runtime input: %j", search => {
    expect(resolve(search).ok).toBe(false);
  });

  it("never derives authorization from UUID, token presence, or client claims", () => {
    const reference = resolve(`?uuid=${uuid}&token=opaque-token&capability=opaque-capability&authorized=true&role=admin&lang=tr&ref=partner`);
    expect(reference).toEqual({ ok: true, locationId: KROMEN_LOCATION_ID, orderUuid: uuid, authorized: false });
    expect(kromenOrderDiagnostic(reference)).toEqual({ status: "unverified_reference", authorized: false });
  });

  it("does not decode credentials, make requests, log, or persist context", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const storageSpy = vi.spyOn(Storage.prototype, "setItem");
    const logSpy = vi.spyOn(console, "log");
    try {
      resolve(`?uuid=${uuid}&token=not-a-jwt`);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(storageSpy).not.toHaveBeenCalled();
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
    }
  });

  it.each([
    `?uuid=${uuid}&token=TOKEN_SENTINEL&access_token=ACCESS_SENTINEL&ref=REF_SENTINEL`,
    "?uuid=TOKEN_SENTINEL&location_id=LOCATION_SENTINEL",
    "?uuid=TOKEN_SENTINEL&lang=LANG_SENTINEL",
  ])("redacts all input values from diagnostics: %s", search => {
    const diagnostic = kromenOrderDiagnostic(resolve(search));
    expect(Object.keys(diagnostic)).toEqual(["status", "authorized"]);
    expect(JSON.stringify(diagnostic)).not.toMatch(/SENTINEL|11111111|Ddc0DVM8/);
  });

  it("does not echo an unexpected runtime error code in diagnostics", () => {
    const malformed = { ok: false, reason: "TOKEN_SENTINEL", authorized: true } as unknown as KromenOrderReference;
    expect(kromenOrderDiagnostic(malformed)).toEqual({ status: "invalid_order_uuid", authorized: false });
  });
});
