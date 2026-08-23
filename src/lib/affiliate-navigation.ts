const SENSITIVE_QUERY_KEYS = ["token", "inviteToken"] as const;

/** Keeps ordinary navigation context while ensuring auth secrets cannot travel. */
export function safeAffiliateSearch(search: string) {
  const query = new URLSearchParams(search);
  SENSITIVE_QUERY_KEYS.forEach((key) => query.delete(key));
  const value = query.toString();
  return value ? `?${value}` : "";
}

export function affiliateDestination(pathname: string, search: string) {
  return `${pathname}${safeAffiliateSearch(search)}`;
}
