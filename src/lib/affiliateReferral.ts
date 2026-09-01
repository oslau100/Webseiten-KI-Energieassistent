import { affiliateApi } from "./affiliateApi";

export async function captureAffiliateReferral(
  location: Pick<Location, "href"> = window.location,
  history: Pick<History, "replaceState" | "state"> = window.history,
): Promise<void> {
  const url = new URL(location.href);
  const code = url.searchParams.get("ref");
  if (code === null) return;

  try {
    await affiliateApi.resolveReferral(code);
  } catch {
    // Attribution is best-effort and must never interrupt the customer funnel.
  } finally {
    url.searchParams.delete("ref");
    history.replaceState(history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }
}
