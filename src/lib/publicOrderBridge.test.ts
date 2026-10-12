import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createPublicOrderBridge, createTenantResolvedOrderTransport, OrderBridgeError,
  type OrderView,
} from "./publicOrderBridge";

const uuid = "123e4567-e89b-42d3-a456-426614174000";
const views: OrderView[] = ["offer", "setting-prefill", "closing-view"];
const secret = "test-only-order-capability";
const dto = { uuid, language: "ar", tariff_name: "Tariff", arbeitspreis: "0.3124" };
const fetchFixture = (body: unknown = dto, status = 200, headers = {}) =>
  vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status, headers }));
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("dormant Public Platform order bridge", () => {
  it("requires an explicit transport even for a valid UUID", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch");
    await expect(createPublicOrderBridge().read("offer", uuid)).rejects.toMatchObject({ code: "TRANSPORT_NOT_READY" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each(views)("POSTs only uuid to the fixed %s route, preserving cookies and cancellation", async view => {
    const fetcher = fetchFixture({ uuid });
    const signal = new AbortController().signal;
    const read = createPublicOrderBridge(createTenantResolvedOrderTransport(fetcher)).read;
    await expect(read(view, uuid, signal)).resolves.toEqual({ uuid });
    expect(fetcher).toHaveBeenCalledExactlyOnceWith(`/api/order/${view}`, {
      method: "POST", signal, credentials: "same-origin", cache: "no-store", redirect: "error",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uuid }),
    });
  });

  it("does not read browser tenant, language, referral, token, or API query overrides", async () => {
    history.replaceState({}, "", `/?location_id=attacker&uuid=other&lang=tr&ref=partner&token=${secret}`);
    window.TB_BOOTSTRAP = { locationId: "attacker", supabaseUrl: "https://attacker.test" };
    const fetcher = fetchFixture();
    try {
      await createPublicOrderBridge(createTenantResolvedOrderTransport(fetcher)).read("offer", uuid);
      expect(JSON.stringify(fetcher.mock.calls)).not.toMatch(/attacker|partner|token|other/);
    } finally { history.replaceState({}, "", "/"); delete window.TB_BOOTSTRAP; }
  });

  it("preserves offer decimals, nulls, language and AI content without inventing a snapshot", async () => {
    const body = { ...dto, monatsabschlag: null, spart: false, abschlaege_pro_jahr: "11",
      ai_content: { blocks: [{ type: "paragraph", text: "Existing content" }] } };
    await expect(createPublicOrderBridge(async () => body).read("offer", uuid)).resolves.toEqual(body);
  });

  it("preserves Setting contact/prefill JSON and submission identifier", async () => {
    const body = { uuid, submission_id: "submission-1", customer_type: "privat",
      email: "test@example.test", phone: null, monthly_current: "120.00",
      priorities: ["price"], answers: { lang: "tr", nested: { accepted: true } } };
    await expect(createPublicOrderBridge(async () => body).read("setting-prefill", uuid)).resolves.toEqual(body);
  });

  it("preserves Closing MaLo, requirement flags, payload, and null signature", async () => {
    const body = { uuid, language: "pl", malo: "DE000123", iban: "DE02120300000000202051",
      iban_pflicht: "true", malo_pflicht: "false", closing_signature_data_url: null,
      closing_privacy_accepted: false, abschlaege_pro_jahr: "12", closing_payload: { accepted: false } };
    await expect(createPublicOrderBridge(async () => body).read("closing-view", uuid)).resolves.toEqual(body);
  });

  it.each(views)("strips unexpected authority, CRM, documents and credentials from %s", async view => {
    const body = { uuid, location_id: "other-tenant", contact_id: "crm", opportunity_id: "crm",
      tarif_snapshot: {}, contract_document_meta: {}, order_token: secret, token: secret };
    await expect(createPublicOrderBridge(async () => body).read(view, uuid)).resolves.toEqual({ uuid });
  });

  it("keeps contact and Closing-only fields out of the offer DTO", async () => {
    const body = { uuid, email: "private", phone: "private", iban: "private", malo: "private",
      closing_payload: {}, answers: {}, iban_pflicht: "true", closing_signature_data_url: null };
    await expect(createPublicOrderBridge(async () => body).read("offer", uuid)).resolves.toEqual({ uuid });
  });

  it.each(["", "bad", `${uuid}&token=${secret}`])("rejects invalid input before transport (%s)", async value => {
    const transport = vi.fn();
    await expect(createPublicOrderBridge(transport).read("offer", value)).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(transport).not.toHaveBeenCalled();
  });

  it("rejects invalid runtime view names in bridge and legacy transport", async () => {
    const fetcher = fetchFixture();
    const transport = createTenantResolvedOrderTransport(fetcher);
    for (const value of ["constructor", "__proto__", "../../other?token=x"]) {
      const view = value as OrderView;
      await expect(createPublicOrderBridge(transport).read(view, uuid)).rejects.toMatchObject({ code: "INVALID_INPUT" });
      await expect(transport({ view, uuid })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    }
    await expect(transport({ view: "offer", uuid: "invalid" })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([null, [], {}, { uuid: "223e4567-e89b-42d3-a456-426614174000" },
    { uuid, language: 4 }, { uuid, arbeitspreis: {} }])("rejects malformed/mismatched responses without exposing them", async body => {
    await expect(createPublicOrderBridge(async () => body).read("offer", uuid)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("compares UUIDs case-insensitively without changing returned data", async () => {
    await expect(createPublicOrderBridge(async () => ({ uuid: uuid.toUpperCase() })).read("offer", uuid))
      .resolves.toEqual({ uuid: uuid.toUpperCase() });
  });

  it("rejects stored signatures in Closing", async () => {
    await expect(createPublicOrderBridge(async () => ({ uuid, closing_signature_data_url: "data:private" }))
      .read("closing-view", uuid)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it.each([[404, "NOT_FOUND"], [401, "ACCESS_DENIED"], [403, "ACCESS_DENIED"],
    [429, "RATE_LIMITED"], [501, "HTTP_ERROR"], [500, "HTTP_ERROR"]])("reports safe status for HTTP %s without retrying", async (status, code) => {
    const fetcher = fetchFixture({ error: secret }, status as number, { "Retry-After": "30" });
    const error = await createPublicOrderBridge(createTenantResolvedOrderTransport(fetcher)).read("offer", uuid).catch(e => e);
    expect(error).toMatchObject({ code, status, retryAfterSeconds: 30 });
    expect(`${error.stack}${JSON.stringify(error)}`).not.toContain(secret);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not expose an arbitrary Retry-After header or malformed JSON", async () => {
    const fetcher = fetchFixture({}, 429, { "Retry-After": secret });
    await expect(createPublicOrderBridge(createTenantResolvedOrderTransport(fetcher)).read("offer", uuid))
      .rejects.toMatchObject({ code: "RATE_LIMITED", retryAfterSeconds: undefined });
    fetcher.mockResolvedValueOnce(new Response(secret));
    await expect(createPublicOrderBridge(createTenantResolvedOrderTransport(fetcher)).read("offer", uuid))
      .rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("sanitizes transport failures without logging, navigation or persistence", async () => {
    const logs = [vi.spyOn(console, "log"), vi.spyOn(console, "error"), vi.spyOn(console, "warn")];
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const href = window.location.href;
    const transport = vi.fn(async () => { throw new Error(secret); });
    const error = await createPublicOrderBridge(transport).read("offer", uuid).catch(e => e);
    expect(error).toBeInstanceOf(OrderBridgeError);
    expect(error.code).toBe("NETWORK_ERROR");
    expect(`${error.stack}${JSON.stringify(error)}`).not.toContain(secret);
    expect(error.cause).toBeUndefined();
    expect(transport).toHaveBeenCalledExactlyOnceWith({ view: "offer", uuid }, undefined);
    expect(storage).not.toHaveBeenCalled();
    logs.forEach(log => expect(log).not.toHaveBeenCalled());
    expect(window.location.href).toBe(href);
  });

  it("cancels before and after transport without publishing data", async () => {
    const controller = new AbortController();
    const transport = vi.fn(async () => { controller.abort(); return dto; });
    await expect(createPublicOrderBridge(transport).read("offer", uuid, controller.signal)).rejects.toMatchObject({ code: "ABORTED" });
    await expect(createPublicOrderBridge(transport).read("offer", uuid, controller.signal)).rejects.toMatchObject({ code: "ABORTED" });
    expect(transport).toHaveBeenCalledTimes(1);
  });

  it("sanitizes fetch rejection and in-flight aborts", async () => {
    const controller = new AbortController();
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error(secret));
    const bridge = createPublicOrderBridge(createTenantResolvedOrderTransport(fetcher));
    await expect(bridge.read("offer", uuid)).rejects.toMatchObject({ code: "NETWORK_ERROR" });
    fetcher.mockImplementationOnce(async () => { controller.abort(); throw new Error(secret); });
    await expect(bridge.read("offer", uuid, controller.signal)).rejects.toMatchObject({ code: "ABORTED" });
  });
});
