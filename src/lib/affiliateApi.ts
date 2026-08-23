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
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;
const list = (value: unknown) => Array.isArray(value) ? value : [];

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

export interface AffiliateSession { authenticated: boolean; user: { name: string; email: string } | null }
export interface AffiliateOverview {
  referralUrl: string;
  metrics: { clicks: number; referrals: number; contracts: number; confirmedContracts: number };
  rewards: { pending: number; available: number; paid: number; currency: string };
}
export interface AffiliateReferral { id: string; name: string; status: string; createdAt: string; lifecycle: string; rewardAmount: number; currency: string }
export interface AffiliateReward { id: string; status: string; amount: number; currency: string; createdAt: string; payoutDate: string }
export interface AffiliateProfile { name: string; email: string }
export interface AffiliatePayout { id: string; amount: number; currency: string; status: string; paidAt: string }
export interface AffiliatePayoutMethod { type: string; accountHolder: string; maskedIban: string; status: string }

const parseSession = (value: unknown): AffiliateSession => {
  const source = record(value); const user = record(source.user);
  return { authenticated: source.authenticated === true, user: source.authenticated === true ? { name: text(user.name), email: text(user.email) } : null };
};
const parseOverview = (value: unknown): AffiliateOverview => {
  const source = record(value); const metrics = record(source.metrics); const rewards = record(source.rewards);
  return { referralUrl: text(source.referralUrl), metrics: { clicks: number(metrics.clicks), referrals: number(metrics.referrals), contracts: number(metrics.contracts), confirmedContracts: number(metrics.confirmedContracts) }, rewards: { pending: number(rewards.pending), available: number(rewards.available), paid: number(rewards.paid), currency: text(rewards.currency) || "EUR" } };
};
const parseCollection = <T>(value: unknown, parse: (item: JsonRecord) => T): T[] => list(record(value).items).map(item => parse(record(item)));
const parseProfile = (value: unknown): AffiliateProfile => { const source = record(value); return { name: text(source.name), email: text(source.email) }; };
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
  overview: () => request("/api/affiliate/overview", undefined, parseOverview),
  referrals: () => request("/api/affiliate/referrals", undefined, value => parseCollection(value, item => ({ id: text(item.id), name: text(item.name), status: text(item.status), createdAt: text(item.createdAt), lifecycle: text(item.lifecycle), rewardAmount: number(item.rewardAmount), currency: text(item.currency) || "EUR" }))),
  rewards: () => request("/api/affiliate/rewards", undefined, value => parseCollection(value, item => ({ id: text(item.id), status: text(item.status), amount: number(item.amount), currency: text(item.currency) || "EUR", createdAt: text(item.createdAt), payoutDate: text(item.payoutDate) }))),
  profile: () => request("/api/affiliate/profile", undefined, parseProfile),
  payouts: () => request("/api/affiliate/payouts", undefined, value => parseCollection(value, item => ({ id: text(item.id), amount: number(item.amount), currency: text(item.currency) || "EUR", status: text(item.status), paidAt: text(item.paidAt) }))),
  payoutMethod: () => request("/api/affiliate/payout-method", undefined, value => { const item = record(value); return { type: text(item.type), accountHolder: text(item.accountHolder), maskedIban: text(item.maskedIban), status: text(item.status) }; }),
};
