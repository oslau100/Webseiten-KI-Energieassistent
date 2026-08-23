/** Same-origin boundary for the Public Platform Worker.
 * Tenant identity is deliberately not accepted from browser input.
 */
export class AffiliateApiError extends Error {
  constructor(public readonly status: number, message = "Der Dienst ist derzeit nicht erreichbar.") {
    super(message);
  }
}

type JsonRecord = Record<string, unknown>;
const record = (value: unknown): JsonRecord => value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
const text = (value: unknown) => typeof value === "string" ? value : "";
const nullableText = (value: unknown) => typeof value === "string" ? value : null;
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;
const directList = (value: unknown) => Array.isArray(value) ? value : [];

async function request<T>(path: string, init?: RequestInit, parse?: (value: unknown) => T): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new AffiliateApiError(response.status);
  if (response.status === 204) return undefined as T;
  const value: unknown = await response.json();
  return parse ? parse(value) : value as T;
}

export interface AffiliateSession { authenticated: boolean; user: { id: string; name: string; image: string | null; emailVerified: boolean } | null }
export interface AffiliateProfile { id: string; firstName: string; lastName: string; languageCode: string; status: string; memberSince: string }
export interface AffiliateOverview {
  profile: AffiliateProfile;
  program: JsonRecord;
  defaultLink: JsonRecord;
  totals: { referrals: number; availableRewards: number; paidRewards: number };
  referralUrl: string;
}
export interface AffiliateReferral { id: string; status: string; attributedAt: string; tariffRecommendedAt: string | null; closedAt: string | null; confirmedAt: string | null }
export interface AffiliateReward { id: string; referralId: string; status: string; method: string; amount: number; currency: string; voucherLabel: string | null; availableAt: string | null; paidAt: string | null }
export interface AffiliatePayout { id: string; status: string; amount: number; currency: string; paidAt: string | null; createdAt: string }
export interface AffiliatePayoutMethod { id: string; method: string; status: string; maskedIban: string | null; updatedAt: string }

const parseProfile = (value: unknown): AffiliateProfile => {
  const source = record(value);
  return { id: text(source.id), firstName: text(source.firstName), lastName: text(source.lastName), languageCode: text(source.languageCode), status: text(source.status), memberSince: text(source.memberSince) };
};
const parseSession = (value: unknown): AffiliateSession => {
  const source = record(value); const user = record(source.user);
  return { authenticated: source.authenticated === true, user: source.authenticated === true ? { id: text(user.id), name: text(user.name), image: nullableText(user.image), emailVerified: user.emailVerified === true } : null };
};
const parseOverview = (value: unknown): AffiliateOverview => {
  const source = record(value); const totals = record(source.totals);
  return { profile: parseProfile(source.profile), program: record(source.program), defaultLink: record(source.defaultLink), totals: { referrals: number(totals.referrals), availableRewards: number(totals.availableRewards), paidRewards: number(totals.paidRewards) }, referralUrl: text(source.referralUrl) };
};
const post = (path: string, body?: JsonRecord) => request<void>(path, { method: "POST", ...(body ? { body: JSON.stringify(body) } : {}) });

export const affiliateApi = {
  login: (email: string, password: string) => post("/api/auth/login", { email, password }),
  register: (name: string, email: string, password: string, inviteToken?: string) => post("/api/auth/register", { name, email, password, ...(inviteToken ? { inviteToken } : {}) }),
  logout: () => post("/api/auth/logout"),
  session: () => request("/api/auth/session", undefined, parseSession),
  forgotPassword: (email: string) => post("/api/auth/password/forgot", { email }),
  resetPassword: (token: string, newPassword: string) => post("/api/auth/password/reset", { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => post("/api/auth/password/change", { currentPassword, newPassword }),
  activate: (token: string) => post("/api/auth/activate", { token }),
  bootstrapProfile: () => post("/api/affiliate/profile/bootstrap"),
  resolveReferral: (code: string) => request<void>(`/api/affiliate/resolve?code=${encodeURIComponent(code)}`),
  overview: () => request("/api/affiliate/overview", undefined, parseOverview),
  referrals: () => request("/api/affiliate/referrals", undefined, value => directList(value).map(raw => { const item = record(raw); return { id: text(item.id), status: text(item.status), attributedAt: text(item.attributedAt), tariffRecommendedAt: nullableText(item.tariffRecommendedAt), closedAt: nullableText(item.closedAt), confirmedAt: nullableText(item.confirmedAt) }; })),
  rewards: () => request("/api/affiliate/rewards", undefined, value => directList(value).map(raw => { const item = record(raw); return { id: text(item.id), referralId: text(item.referralId), status: text(item.status), method: text(item.method), amount: number(item.amount), currency: text(item.currency), voucherLabel: nullableText(item.voucherLabel), availableAt: nullableText(item.availableAt), paidAt: nullableText(item.paidAt) }; })),
  profile: () => request("/api/affiliate/profile", undefined, parseProfile),
  payouts: () => request("/api/affiliate/payouts", undefined, value => directList(value).map(raw => { const item = record(raw); return { id: text(item.id), status: text(item.status), amount: number(item.amount), currency: text(item.currency), paidAt: nullableText(item.paidAt), createdAt: text(item.createdAt) }; })),
  payoutMethod: () => request<AffiliatePayoutMethod | null>("/api/affiliate/payout-method", undefined, value => { if (value === null) return null; const item = record(value); return { id: text(item.id), method: text(item.method), status: text(item.status), maskedIban: nullableText(item.maskedIban), updatedAt: text(item.updatedAt) }; }),
};
