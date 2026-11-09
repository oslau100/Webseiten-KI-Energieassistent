/**
 * Cloudflare Pages Functions template: tenant-pinned V1 setting-survey relay.
 * This file is staged in the BACKEND EWV worktree as a template only. It will
 * not serve requests until separately reviewed and installed in the Öcher V1
 * website repository's root /functions directory and deployed.
 *
 * An Origin or browser-provided location_id is NOT a security identity.
 * Server deployment owns the immutable tenant mapping. The relay signs exactly
 * the parsed JSON body forwarded to the existing Supabase setting-proxy.
 */
export type RelayEnvironment = {
  TARIFF_TENANT_PROOF_KEY_B64URL?: string;
  V1_EWV_SUPABASE_ANON_JWT?: string;
};

export type UpstreamFetch = (input: string, init: RequestInit) => Promise<Response>;

const AUDIENCE = "setting-proxy:regional-tariff-v1";
const PROOF_PREFIX = "v1";
const SUPABASE_SETTING_PROXY =
  "https://oynhnhkldvpoqhsfirwf.supabase.co/functions/v1/setting-proxy";
const LOCATION_PATTERN = /^[A-Za-z0-9]{20}$/;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const MAX_BODY_BYTES = 262_144;
const MAX_KEY_BYTES = 64;
const encoder = new TextEncoder();

function errorJson(status: number, code: string): Response {
  return new Response(JSON.stringify({ ok: false, error_code: code }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const value of bytes) s += String.fromCharCode(value);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeB64url(encoded: string | undefined): Uint8Array | null {
  if (!encoded || encoded.length > 4096 || !BASE64URL_PATTERN.test(encoded)) return null;
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - encoded.length % 4) % 4);
    return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
  } catch { return null; }
}

/** Bounded stream reader: Content-Length alone is not trustworthy. */
async function readBoundedJson(request: Request): Promise<unknown> {
  if (!request.body) throw new Error("invalid_json");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) throw new Error("payload_too_large");
      chunks.push(value);
    }
  } catch (error) {
    void reader.cancel().catch(() => {});
    throw error;
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new Error("invalid_json"); }
}

/** Exact matching verifier counterpart: HMAC of `v1.<claimsBase64Url>`. */
export async function signTenantBoundBody(
  body: unknown, pinnedLocationId: string, signingKeyBase64Url: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<string> {
  if (!LOCATION_PATTERN.test(pinnedLocationId)) throw new Error("relay_invalid_tenant");
  const keyBytes = decodeB64url(signingKeyBase64Url);
  if (!keyBytes || keyBytes.length < 32 || keyBytes.length > MAX_KEY_BYTES) throw new Error("relay_key_not_configured");
  if (!Number.isSafeInteger(nowSeconds)) throw new Error("relay_invalid_clock");
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(JSON.stringify(body))));
  const claims = {
    v: 1, aud: AUDIENCE, location_id: pinnedLocationId, body_sha256: b64url(digest),
    iat: nowSeconds, exp: nowSeconds + 60,
  };
  const payloadB64 = b64url(encoder.encode(JSON.stringify(claims)));
  const keyBuffer = new ArrayBuffer(keyBytes.length);
  new Uint8Array(keyBuffer).set(keyBytes);
  const key = await crypto.subtle.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(`${PROOF_PREFIX}.${payloadB64}`)));
  return `${PROOF_PREFIX}.${payloadB64}.${b64url(signature)}`;
}

/**
 * Public form submission, NOT a private login endpoint. Anyone can submit a
 * request to this public site's relay; they can never choose another tenant.
 * Abuse protection (Cloudflare rate limits/bot checks) is a separate gate.
 */
export async function handlePinnedV1SettingRequest(
  request: Request,
  env: RelayEnvironment,
  pinnedLocationId: string,
  upstreamFetch: UpstreamFetch = fetch,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<Response> {
  if (request.method !== "POST") return errorJson(405, "method_not_allowed");
  if (!LOCATION_PATTERN.test(pinnedLocationId)) return errorJson(500, "relay_not_configured");
  const contentType = request.headers.get("Content-Type")?.split(";")[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return errorJson(415, "unsupported_media_type");
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return errorJson(403, "cross_origin_not_allowed");
  if (request.headers.has("x-v1-tariff-tenant-proof")) return errorJson(400, "client_proof_not_accepted");
  const contentLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) return errorJson(413, "payload_too_large");
  const signingKey = env.TARIFF_TENANT_PROOF_KEY_B64URL ?? "";
  const keyBytes = decodeB64url(signingKey);
  const anonJwt = env.V1_EWV_SUPABASE_ANON_JWT ?? "";
  if (!keyBytes || keyBytes.length < 32 || keyBytes.length > MAX_KEY_BYTES ||
      !anonJwt || anonJwt.split(".").length !== 3) {
    return errorJson(503, "relay_not_configured");
  }

  let body: unknown;
  try { body = await readBoundedJson(request); }
  catch (error) { return errorJson(error instanceof Error && error.message === "payload_too_large" ? 413 : 400,
    error instanceof Error && error.message === "payload_too_large" ? "payload_too_large" : "invalid_json"); }
  if (body === null || typeof body !== "object" || Array.isArray(body)) return errorJson(400, "invalid_request_body");
  const meta = (body as Record<string, unknown>).meta;
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return errorJson(400, "missing_meta");
  if (typeof (meta as Record<string, unknown>).location_id !== "string") return errorJson(400, "missing_location_id");
  if ((meta as Record<string, unknown>).location_id !== pinnedLocationId) return errorJson(403, "tenant_mismatch");

  try {
    const signature = await signTenantBoundBody(body, pinnedLocationId, signingKey, nowSeconds);
    // JSON.stringify(parsedBody) is also what the proxy verifier hashes.
    const forwardedBody = JSON.stringify(body);
    const upstream = await upstreamFetch(SUPABASE_SETTING_PROXY, {
      method: "POST", redirect: "manual", body: forwardedBody,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "apikey": anonJwt,
        "Authorization": `Bearer ${anonJwt}`,
        "x-v1-tariff-tenant-proof": signature,
      },
    });
    // Never follow an upstream redirect containing a user-controlled location.
    if (upstream.status >= 300 && upstream.status < 400) return errorJson(502, "unexpected_upstream_redirect");
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    // No keys, upstream responses, request data or PII in exceptions sent to clients.
    return errorJson(502, "relay_upstream_failed");
  }
}
