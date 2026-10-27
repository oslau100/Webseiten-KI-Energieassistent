/** Browser-side shape check for a future persisted closing ACK. This is not auth. */
export type ClosingSigningAck = {
  schemaVersion: "closing-manifest.v1";
  status: "ACCEPTED_FOR_SIGNING";
  fingerprint: string;
  signingRequestId: string;
  snapshotId: string;
  documentSha256: string;
  replayed: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isId = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= 200;

/** Rejects missing, stale-shaped, or unbound responses; caller must still obtain
 * a separately authorized signing session from the server before navigating. */
export function parseClosingSigningAck(value: unknown): ClosingSigningAck | null {
  if (!isRecord(value)) return null;
  const expected = ["schemaVersion", "status", "fingerprint", "signingRequestId", "snapshotId", "documentSha256", "replayed"];
  if (Object.keys(value).length !== expected.length || expected.some(key => !(key in value))) return null;
  if (value.schemaVersion !== "closing-manifest.v1" || value.status !== "ACCEPTED_FOR_SIGNING" ||
    !isId(value.fingerprint) || !isId(value.signingRequestId) || !isId(value.snapshotId) ||
    typeof value.documentSha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.documentSha256) ||
    typeof value.replayed !== "boolean") return null;
  return value as ClosingSigningAck;
}

/** ACK validity is necessary, but never sufficient, for signing authorization. */
export const mayRequestSigningSession = (value: unknown): value is ClosingSigningAck =>
  parseClosingSigningAck(value) !== null;
