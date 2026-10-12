/** Reference parsing only. No endpoint, DTO or capability wire format is assumed. */
export const KROMEN_LOCATION_ID = "Ddc0DVM8MT67wmLP3wAA";

type Failure = "invalid_location" | "invalid_order_uuid";
export type KromenOrderReference =
  | { ok: true; locationId: typeof KROMEN_LOCATION_ID; orderUuid: string; authorized: false }
  | { ok: false; reason: Failure; authorized: false };

/**
 * Isolated preparation for a future secure transport; not used by legacy loaders.
 * A UUID identifies an order and never establishes permission to read or submit it.
 * Query credentials, submission IDs and client claims cannot authorize this result.
 */
export function resolveKromenOrderReference(locationId: unknown, search: unknown): KromenOrderReference {
  if (locationId !== KROMEN_LOCATION_ID || typeof search !== "string") {
    return { ok: false, reason: "invalid_location", authorized: false };
  }
  const query = new URLSearchParams(search);
  const locations = query.getAll("location_id");
  if (locations.length > 1 || (locations.length === 1 && locations[0] !== KROMEN_LOCATION_ID)) {
    return { ok: false, reason: "invalid_location", authorized: false };
  }
  const uuids = query.getAll("uuid");
  // Validate canonical UUID shape without guessing a backend UUID version.
  const uuid = uuids.length === 1 ? uuids[0].trim() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
    return { ok: false, reason: "invalid_order_uuid", authorized: false };
  }
  return { ok: true, locationId: KROMEN_LOCATION_ID, orderUuid: uuid, authorized: false };
}

/** Allowlisted diagnostics: never copy a URL, token, UUID, referral or error payload. */
export function kromenOrderDiagnostic(reference: KromenOrderReference) {
  return {
    status: reference.ok === true ? "unverified_reference"
      : reference.reason === "invalid_location" ? "invalid_location" : "invalid_order_uuid",
    authorized: false as const,
  };
}
