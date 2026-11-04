import { describe, expect, it } from "vitest";
import { mayRequestSigningSession, parseClosingSigningAck } from "./closingAck";

const valid = {
  schemaVersion: "closing-manifest.v1",
  status: "ACCEPTED_FOR_SIGNING",
  fingerprint: "source-bound-fingerprint",
  signingRequestId: "request-1",
  snapshotId: "snapshot-1",
  documentSha256: "a".repeat(64),
  replayed: false,
};

describe("closing signing ACK shape gate", () => {
  it("accepts only the complete accepted, document-bound ACK", () => {
    expect(parseClosingSigningAck(valid)).toEqual(valid);
    expect(mayRequestSigningSession(valid)).toBe(true);
  });

  it.each([
    [{ ...valid, status: "PENDING" }],
    [{ ...valid, status: "ACCEPTED_FOR_SIGNING", replayed: "yes" }],
    [{ ...valid, documentSha256: "not-a-hash" }],
    [{ ...valid, snapshotId: "" }],
    [{ ...valid, extra: "unbound" }],
    [null],
  ])("rejects incomplete or unexpected response fields", response => {
    expect(parseClosingSigningAck(response)).toBeNull();
    expect(mayRequestSigningSession(response)).toBe(false);
  });

  it("accepts replay only when the full persisted ACK remains bound", () => {
    expect(parseClosingSigningAck({ ...valid, replayed: true })).not.toBeNull();
    expect(parseClosingSigningAck({ ...valid, replayed: true, fingerprint: "" })).toBeNull();
  });
});
