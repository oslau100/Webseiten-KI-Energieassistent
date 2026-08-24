const CANONICAL_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Records the first Setting attribution through the server-owned attribution
 * cookie. A missing referral (204) is a successful no-op.
 */
export async function recordSettingAttribution(navigationUrl: string): Promise<void> {
  const target = new URL(navigationUrl, window.location.origin);
  if (target.origin !== window.location.origin || target.pathname !== "/tarif") return;

  const auftragUuid = target.searchParams.get("uuid");
  if (!auftragUuid || !CANONICAL_UUID.test(auftragUuid)) return;

  const response = await fetch("/api/funnel/setting-attribution", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ auftrag_uuid: auftragUuid }),
  });

  if (!response.ok) throw new Error("setting_attribution_failed");
}
