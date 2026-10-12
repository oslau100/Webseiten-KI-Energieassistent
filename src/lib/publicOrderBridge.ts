import { z } from "zod";

// Mirrored from KI-Energieassistent workers/public-platform-api/src/order-repository.mjs
// at 64523668b6ee85e0e8f4009a8b949e4cc959ffd0. Keep decimals and SQL-derived
// requirement flags as received; do not reconstruct tarif_snapshot or signatures.
const uuid = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
const text = z.string().nullable().optional();
const numeric = z.union([z.number().finite(), z.string()]).nullable().optional();
const flag = z.boolean().nullable().optional();
const requirement = z.union([z.boolean(), z.enum(["true", "false"])]).nullable().optional();
const json: z.ZodType<JsonValue> = z.lazy(() => z.union([
  z.string(), z.number().finite(), z.boolean(), z.null(), z.array(json), z.record(json),
]));
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const identity = { uuid, energy_type: text, case_type: text, plz: text, stadt: text, vorname: text };
const current = { provider_current: text, verbrauch: numeric };
const tariff = {
  tariff_provider: text, tariff_name: text, oekotarif: flag, laufzeit_monate: numeric,
  preisgarantie_text: text, arbeitspreis: numeric, grundpreis: numeric,
  jahreskosten: numeric, monatsabschlag: numeric, ersparnis: numeric,
};
const contact = { anrede: text, nachname: text, email: text, phone: text };
const schemas = {
  offer: z.object({
    ...identity, ...current, ...tariff, language: text, monthly_current: numeric,
    alt_jahreskosten: numeric, spart: flag, ai_usecase: text,
    ai_content: json.optional(), abschlaege_pro_jahr: numeric,
  }),
  "setting-prefill": z.object({
    ...identity, ...current, ...contact, submission_id: text, customer_type: text,
    monthly_current: numeric, priorities: json.optional(), answers: json.optional(),
  }),
  "closing-view": z.object({
    ...identity, ...current, ...tariff, ...contact, language: text,
    geburtsdatum: text, strasse: text, hausnummer: text,
    preiserhoehung_erhalten: flag, preiserhoehung_datum: text,
    kundennummer_aktuell: text, einzugsdatum: text, meter_status: text,
    meter_number: text, meter_expected_date: text, malo: text, iban: text,
    iban_pflicht: requirement, malo_pflicht: requirement,
    closing_signature_data_url: z.null().optional(), consent_accepted: flag,
    closing_privacy_accepted: flag, closing_payload: json.optional(), abschlaege_pro_jahr: numeric,
  }),
};

export type OrderView = keyof typeof schemas;
export type PublicOrderDtos = { [V in OrderView]: z.infer<(typeof schemas)[V]> };
export type OrderBridgeErrorCode = "TRANSPORT_NOT_READY" | "INVALID_INPUT" | "INVALID_RESPONSE"
  | "NOT_FOUND" | "ACCESS_DENIED" | "RATE_LIMITED" | "HTTP_ERROR" | "NETWORK_ERROR" | "ABORTED";

export class OrderBridgeError extends Error {
  constructor(public readonly code: OrderBridgeErrorCode, public readonly status?: number,
    public readonly retryAfterSeconds?: number) {
    // Never retain response bodies, validation issues, transport errors, or causes:
    // they may contain PII or a future capability. Only safe diagnostics escape.
    super(`Order read failed (${code})`);
    this.name = "OrderBridgeError";
  }
}

/** A capability-aware transport can later close over its in-memory credential.
 * No credential belongs in this request, DTO, survey JSON, or navigation URL.
 * The backend must authorize it; UUID and browser Location are never authority.
 */
export type OrderReadTransport = (
  request: Readonly<{ view: OrderView; uuid: string }>, signal?: AbortSignal,
) => Promise<unknown>;

/** Explicit legacy DTO transport, NOT order authorization. No caller-provided
 * host, Location, headers, or URL overrides; tenant resolution belongs to server.
 * Do not wire into live funnels until the capability backend is accepted/ready.
 */
export function createTenantResolvedOrderTransport(fetcher: typeof fetch = fetch): OrderReadTransport {
  return async ({ view, uuid: orderUuid }, signal) => {
    if (!Object.prototype.hasOwnProperty.call(schemas, view) || !uuid.safeParse(orderUuid).success) {
      throw new OrderBridgeError("INVALID_INPUT");
    }
    let response: Response;
    try {
      response = await fetcher(`/api/order/${view}`, {
        method: "POST", signal, credentials: "same-origin", cache: "no-store",
        redirect: "error", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid: orderUuid }),
      });
    } catch {
      throw new OrderBridgeError(signal?.aborted ? "ABORTED" : "NETWORK_ERROR");
    }
    if (!response.ok) {
      const code = response.status === 404 ? "NOT_FOUND"
        : [401, 403].includes(response.status) ? "ACCESS_DENIED"
          : response.status === 429 ? "RATE_LIMITED" : "HTTP_ERROR";
      const retryAfter = response.headers.get("Retry-After") || "";
      const seconds = /^\d{1,9}$/.test(retryAfter) ? Number(retryAfter) : undefined;
      throw new OrderBridgeError(code, response.status, seconds);
    }
    try { return await response.json(); }
    catch { throw new OrderBridgeError(signal?.aborted ? "ABORTED" : "INVALID_RESPONSE"); }
  };
}

/** Dormant by default. Inject an explicitly reviewed transport to enable reads.
 * Performs one read per call: retries, referral attribution, language selection,
 * survey persistence and redirects remain the caller's existing contracts.
 */
export function createPublicOrderBridge(transport?: OrderReadTransport) {
  return {
    async read<V extends OrderView>(view: V, orderUuid: string, signal?: AbortSignal): Promise<PublicOrderDtos[V]> {
      if (!Object.prototype.hasOwnProperty.call(schemas, view) || !uuid.safeParse(orderUuid).success) {
        throw new OrderBridgeError("INVALID_INPUT");
      }
      if (signal?.aborted) throw new OrderBridgeError("ABORTED");
      if (!transport) throw new OrderBridgeError("TRANSPORT_NOT_READY");
      let data: unknown;
      try { data = await transport(Object.freeze({ view, uuid: orderUuid }), signal); }
      catch (error) {
        if (signal?.aborted) throw new OrderBridgeError("ABORTED");
        if (error instanceof OrderBridgeError) {
          throw new OrderBridgeError(error.code, error.status, error.retryAfterSeconds);
        }
        throw new OrderBridgeError("NETWORK_ERROR");
      }
      if (signal?.aborted) throw new OrderBridgeError("ABORTED");
      const parsed = schemas[view].safeParse(data);
      if (!parsed.success || parsed.data.uuid.toLowerCase() !== orderUuid.toLowerCase()) {
        throw new OrderBridgeError("INVALID_RESPONSE");
      }
      // Zod strips unknown top-level fields, including authority and credentials.
      return parsed.data as PublicOrderDtos[V];
    },
  };
}
