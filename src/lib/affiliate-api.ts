/** Credentialed, same-origin boundary for the affiliate platform. */
export class AffiliateApiError extends Error {
  constructor(public readonly status: number) {
    super("affiliate_api_error");
  }
}

export interface AffiliateSession {
  authenticated: boolean;
  user?: { id: string; name: string; image: string | null; emailVerified: boolean };
}

export interface AffiliateOverview {
  profile: AffiliateProfile;
  program: unknown;
  defaultLink: unknown;
  totals: { referrals?: number; availableRewards?: number; paidRewards?: number };
  referralUrl?: string;
}

export interface AffiliateReferral { id: string; status: string; attributedAt: string | null; tariffRecommendedAt: string | null; closedAt: string | null; confirmedAt: string | null }
export interface AffiliateReward { id: string; referralId: string; status: string; method: string; amount: number; currency: string; voucherLabel: string | null; availableAt: string | null; paidAt: string | null }
export interface AffiliateProfile { id: string; firstName: string; lastName: string; languageCode: string; status: string; memberSince: string }
export interface AffiliatePayout { id: string; status: string; amount: number; currency: string; paidAt: string | null; createdAt: string }
export interface AffiliatePayoutMethod { id: string; method: string; status: string; maskedIban: string | null; updatedAt: string }

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
  register: (payload: { name: string; email: string; password: string }) => post<void>("auth/register", payload),
  login: (email: string, password: string) => post<void>("auth/login", { email, password }),
  logout: () => post<void>("auth/logout"),
  session: () => request<AffiliateSession>("auth/session"),
  activate: (token: string) => post<void>("auth/activate", { token }),
  forgotPassword: (email: string) => post<void>("auth/password/forgot", { email }),
  resetPassword: (token: string, newPassword: string) => post<void>("auth/password/reset", { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => post<void>("auth/password/change", { currentPassword, newPassword }),
  bootstrapProfile: () => post<void>("affiliate/profile/bootstrap"),
  overview: () => request<AffiliateOverview>("affiliate/overview"),
  referrals: () => request<AffiliateReferral[]>("affiliate/referrals"),
  rewards: () => request<AffiliateReward[]>("affiliate/rewards"),
  profile: () => request<AffiliateProfile>("affiliate/profile"),
  payouts: () => request<AffiliatePayout[]>("affiliate/payouts"),
  payoutMethod: () => request<AffiliatePayoutMethod | null>("affiliate/payout-method"),
  resolveReferral: (code: string) => request<void>(`affiliate/resolve?code=${encodeURIComponent(code)}`),
};
