/** Credentialed, same-origin boundary for the affiliate platform. */
export class AffiliateApiError extends Error {
  constructor(public readonly status: number) {
    super("affiliate_api_error");
  }
}

export interface AffiliateSession {
  authenticated: boolean;
  user?: { name?: string; email?: string; emailVerified?: boolean };
}

export interface AffiliateOverview {
  referralUrl?: string;
  clicks?: number;
  recommendations?: number;
  conversions?: number;
  confirmedConversions?: number;
  pendingReward?: number;
  availableReward?: number;
  paidReward?: number;
  currency?: string;
}

export interface AffiliateReferral { id: string; name?: string; initials?: string; createdAt?: string; status?: string; rewardAmount?: number; currency?: string }
export interface AffiliateReward { id: string; amount?: number; currency?: string; status?: string; earnedAt?: string; programName?: string }
export interface AffiliateProfile { name?: string; email?: string }
export interface AffiliatePayout { id: string; amount?: number; currency?: string; status?: string; createdAt?: string }
export interface AffiliatePayoutMethod { type?: string; maskedIban?: string }

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new AffiliateApiError(response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

const post = <T>(path: string, body?: unknown) => request<T>(path, {
  method: "POST",
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

export const affiliateApi = {
  register: (payload: { name: string; email: string; password: string; inviteToken?: string }) => post<void>("auth/register", payload),
  login: (email: string, password: string) => post<void>("auth/login", { email, password }),
  logout: () => post<void>("auth/logout"),
  session: () => request<AffiliateSession>("auth/session"),
  activate: (token: string) => post<void>("auth/activate", { token }),
  forgotPassword: (email: string) => post<void>("auth/password/forgot", { email }),
  resetPassword: (token: string, newPassword: string) => post<void>("auth/password/reset", { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => post<void>("auth/password/change", { currentPassword, newPassword }),
  bootstrapProfile: () => post<void>("affiliate/profile/bootstrap"),
  overview: () => request<AffiliateOverview>("affiliate/overview"),
  referrals: () => request<AffiliateReferral[] | { referrals: AffiliateReferral[] }>("affiliate/referrals"),
  rewards: () => request<AffiliateReward[] | { rewards: AffiliateReward[] }>("affiliate/rewards"),
  profile: () => request<AffiliateProfile>("affiliate/profile"),
  payouts: () => request<AffiliatePayout[] | { payouts: AffiliatePayout[] }>("affiliate/payouts"),
  payoutMethod: () => request<AffiliatePayoutMethod | null>("affiliate/payout-method"),
};
