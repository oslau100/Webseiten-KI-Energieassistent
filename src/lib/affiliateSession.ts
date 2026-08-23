import { affiliateApi, type AffiliateSession } from "./affiliateApi";

export type PortalSessionResult = "ready" | "unauthenticated" | "unverified";

export async function establishAffiliatePortalSession(
  api: Pick<typeof affiliateApi, "session" | "bootstrapProfile"> = affiliateApi,
): Promise<{ state: PortalSessionResult; session: AffiliateSession }> {
  const session = await api.session();
  if (!session.authenticated || !session.user) return { state: "unauthenticated", session };
  if (session.user.emailVerified !== true) return { state: "unverified", session };
  await api.bootstrapProfile();
  return { state: "ready", session };
}
