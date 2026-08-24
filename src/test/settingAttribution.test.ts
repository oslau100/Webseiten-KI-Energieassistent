import { beforeEach, describe, expect, it, vi } from "vitest";

import { recordSettingAttribution } from "@/lib/setting-attribution";

describe("recordSettingAttribution", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("sends only the canonical Auftrag UUID to the server endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    await recordSettingAttribution("/tarif?uuid=123e4567-e89b-42d3-a456-426614174000&affiliate=never-send");

    expect(fetchMock).toHaveBeenCalledWith("/api/funnel/setting-attribution", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auftrag_uuid: "123e4567-e89b-42d3-a456-426614174000" }),
    });
  });

  it.each([
    "/auftrag?uuid=123e4567-e89b-42d3-a456-426614174000",
    "/tarif?uuid=not-a-uuid",
    "/tarif?affiliate=code",
    "https://attacker.example/tarif?uuid=123e4567-e89b-42d3-a456-426614174000",
  ])("does not attribute an ineligible navigation: %s", async url => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    await recordSettingAttribution(url);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports technical server failure to its caller", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
    await expect(recordSettingAttribution("/tarif?uuid=123e4567-e89b-42d3-a456-426614174000")).rejects.toThrow("setting_attribution_failed");
  });
});
