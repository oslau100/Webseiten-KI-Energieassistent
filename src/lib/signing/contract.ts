/** Proposed UI projection, NOT an implemented or authenticated HTTP contract. */
export type BrandKey = "tarivia" | "oecher" | "demo" | "ehiogie";
export type SigningManifest = {
  sessionId: string;
  snapshotHash: string;
  requirementVersion: string;
  expiresAt: string;
  mode: "LIVE" | "TEST_ONLY";
  brand: BrandKey;
  document: { id: string; sha256: string; language: string };
  participants: { id: string; displayName: string; role: "customer" | "account_holder" }[];
  requirements: {
    id: string; participantId: string;
    slot: "contract_signature" | "sepa_mandate_signature" | "tariff_price_confirmation_signature" |
      "advice_confirmation_customer_signature" | "optional_marketing_consent_signature";
    text: string; textLanguage: string; textHash: string;
    required: boolean; capture: "person" | "separate";
  }[];
};
const record = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const exact = (value: Record<string, unknown>, keys: string[]) =>
  Object.keys(value).length === keys.length && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
const id = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0 && value.length <= 200;
const hash = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const locale = (value: unknown): value is string => typeof value === "string" && /^[a-z]{2}(?:-[A-Za-z0-9]{2,8})*$/.test(value);
const includes = (values: readonly string[], value: unknown) => typeof value === "string" && values.includes(value);
const unique = (values: unknown[]) => new Set(values).size === values.length;

/** Shape validation is UX defense only, never proof of authorization or source readiness. */
export function parseSigningManifest(value: unknown): SigningManifest | null {
  if (!record(value) || !exact(value, ["sessionId", "snapshotHash", "requirementVersion", "expiresAt", "mode", "brand", "document", "participants", "requirements"]) ||
    !id(value.sessionId) || !hash(value.snapshotHash) || !id(value.requirementVersion) ||
    typeof value.expiresAt !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value.expiresAt) || !Number.isFinite(Date.parse(value.expiresAt)) ||
    !includes(["LIVE", "TEST_ONLY"], value.mode) || !includes(["tarivia", "oecher", "demo", "ehiogie"], value.brand) ||
    (value.brand === "demo" && value.mode !== "TEST_ONLY")) return null;
  const document = value.document;
  if (!record(document) || !exact(document, ["id", "sha256", "language"]) || !id(document.id) || !hash(document.sha256) || !locale(document.language)) return null;
  if (!Array.isArray(value.participants) || !value.participants.length || value.participants.length > 10 ||
    !value.participants.every(p => record(p) && exact(p, ["id", "displayName", "role"]) && id(p.id) && id(p.displayName) && includes(["customer", "account_holder"], p.role)) ||
    !unique(value.participants.map(p => p.id))) return null;
  if (!Array.isArray(value.requirements) || !value.requirements.length || value.requirements.length > 100 ||
    !value.requirements.every(r => record(r) && exact(r, ["id", "participantId", "slot", "text", "textLanguage", "textHash", "required", "capture"]) &&
      id(r.id) && id(r.participantId) && includes(["contract_signature", "sepa_mandate_signature", "tariff_price_confirmation_signature", "advice_confirmation_customer_signature", "optional_marketing_consent_signature"], r.slot) &&
      typeof r.text === "string" && r.text.trim().length > 0 && r.text.length <= 10000 && locale(r.textLanguage) && hash(r.textHash) &&
      typeof r.required === "boolean" && includes(["person", "separate"], r.capture)) ||
    !unique(value.requirements.map(r => r.id)) || !value.requirements.some(r => r.required)) return null;
  const participants = value.participants;
  const requirements = value.requirements;
  if (requirements.some(r => !participants.some(p => p.id === r.participantId)) ||
    participants.some(p => !requirements.some(r => r.participantId === p.id)) ||
    requirements.some(r => r.slot === "optional_marketing_consent_signature" && r.required)) return null;
  return value as SigningManifest;
}
export type UnavailableReason = "not_wired" | "unauthorized" | "expired" | "superseded" | "invalidated" | "pdf_missing" | "failed" | "already_finalized";
export type SessionResponse = { status: "unavailable"; reason: UnavailableReason } | { status: "review"; manifest: SigningManifest };
export type SignatureStroke = ReadonlyArray<readonly [number, number]>;
export type SignatureApplication = {
  participantId: string;
  requirementId: string;
  declarationHash: string;
  artifactId: string;
};
export type SignatureCaptureRequest = {
  sessionId: string;
  snapshotHash: string;
  participantId: string;
  requirementIds: string[];
  idempotencyKey: string;
  strokes: SignatureStroke[];
};
export type FinalizationRequest = {
  sessionId: string;
  snapshotHash: string;
  documentHash: string;
  requirementVersion: string;
  idempotencyKey: string;
  applications: SignatureApplication[];
};
/** Only a future audited server adapter may implement these ports. No browser authorization flags. */
export interface SigningServerPort {
  loadSession(signal: AbortSignal): Promise<SessionResponse>;
  readPrivatePdf(documentId: string, signal: AbortSignal): Promise<Blob>;
  captureSignature(request: SignatureCaptureRequest, signal: AbortSignal): Promise<
    { status: "unavailable"; reason: UnavailableReason } |
    { status: "artifact"; artifactId: string; artifactHash: string }
  >;
  finalize(request: FinalizationRequest, signal: AbortSignal): Promise<
    { status: "unavailable"; reason: UnavailableReason } |
    { status: "receipt"; receiptId: string; finalDocumentHash: string }
  >;
}

/** Deliberately no fetch, URL, token, storage, environment flag or window override. */
export const inactiveSigningServer: SigningServerPort = Object.freeze({
  async loadSession() { return { status: "unavailable" as const, reason: "not_wired" as const }; },
  async readPrivatePdf() { throw new Error("SIGNING_NOT_WIRED"); },
  async captureSignature() { return { status: "unavailable" as const, reason: "not_wired" as const }; },
  async finalize() { return { status: "unavailable" as const, reason: "not_wired" as const }; },
});

/** Validate bytes from the private server port before creating a local viewer URL. */
export async function verifyPrivatePdf(blob: Blob, sha256: string): Promise<boolean> {
  if (!(blob instanceof Blob) || blob.type !== "application/pdf" || blob.size < 5 || blob.size > 30 * 1024 * 1024 || !/^[a-f0-9]{64}$/.test(sha256)) return false;
  try {
    const bytes = await blob.arrayBuffer();
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") return false;
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("") === sha256;
  } catch { return false; }
}
