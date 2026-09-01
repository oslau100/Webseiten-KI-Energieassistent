export class AffiliateApiError extends Error {
  constructor(public status: number, message = "Affiliate API request failed") {
    super(message);
  }
}

export interface AffiliateUser {
  id: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
}

export interface AffiliateSession {
  authenticated: boolean;
  user?: AffiliateUser | null;
}

export interface AffiliateProfile {
  id: string;
  firstName: string;
  lastName: string;
  languageCode: string;
  status: string;
  memberSince: string;
}

export interface AffiliatePayoutMethod {
  id: string;
  method: string;
  status: string;
  maskedIban: string | null;
  updatedAt: string;
}

export type AffiliateCollectionItem = Record<string, string | number | boolean | null>;
export interface AffiliateOverview {
  profile: AffiliateProfile;
  program: Record<string, unknown> | null;
  defaultLink: Record<string, unknown> | null;
  totals: { referrals: number; availableRewards: number; paidRewards: number };
  referralUrl: string;
}

async function request<T>(path: `/api/${"auth" | "affiliate"}/${string}`, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new AffiliateApiError(response.status);
  if (response.status === 204) return undefined as T;
  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

const post = <T>(path: `/api/${"auth" | "affiliate"}/${string}`, body?: unknown) =>
  request<T>(path, { method: "POST", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export const affiliateApi = {
  register: (payload: { name: string; email: string; password: string; inviteToken?: string }) => post<void>("/api/auth/register", payload),
  login: (email: string, password: string) => post<void>("/api/auth/login", { email, password }),
  logout: () => post<void>("/api/auth/logout"),
  session: () => request<AffiliateSession>("/api/auth/session"),
  activate: (token: string) => post<void>("/api/auth/activate", { token }),
  forgotPassword: (email: string) => post<void>("/api/auth/password/forgot", { email }),
  resetPassword: (token: string, newPassword: string) => post<void>("/api/auth/password/reset", { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => post<void>("/api/auth/password/change", { currentPassword, newPassword }),
  bootstrapProfile: () => post<AffiliateProfile>("/api/affiliate/profile/bootstrap"),
  overview: () => request<AffiliateOverview>("/api/affiliate/overview"),
  referrals: () => request<AffiliateCollectionItem[]>("/api/affiliate/referrals"),
  rewards: () => request<AffiliateCollectionItem[]>("/api/affiliate/rewards"),
  profile: () => request<AffiliateProfile>("/api/affiliate/profile"),
  payouts: () => request<AffiliateCollectionItem[]>("/api/affiliate/payouts"),
  payoutMethod: () => request<AffiliatePayoutMethod | null>("/api/affiliate/payout-method"),
  resolveReferral: (code: string) => request<void>(`/api/affiliate/resolve?code=${encodeURIComponent(code)}`),
};
