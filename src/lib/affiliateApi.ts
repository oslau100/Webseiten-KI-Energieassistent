export class AffiliateApiError extends Error {
  constructor(public status: number, message = "Affiliate API request failed") {
    super(message);
  }
}

export interface AffiliateSession {
  authenticated: boolean;
  user?: {
    email?: string;
    emailVerified: boolean;
  };
}

export type AffiliateDto = Record<string, unknown>;

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
  register: (payload: { name: string; email: string; password: string; inviteToken?: string }) =>
    post<void>("/api/auth/register", payload),
  login: (email: string, password: string) => post<void>("/api/auth/login", { email, password }),
  logout: () => post<void>("/api/auth/logout"),
  session: () => request<AffiliateSession>("/api/auth/session"),
  activate: (token: string) => post<void>("/api/auth/activate", { token }),
  forgotPassword: (email: string) => post<void>("/api/auth/password/forgot", { email }),
  resetPassword: (token: string, newPassword: string) => post<void>("/api/auth/password/reset", { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<void>("/api/auth/password/change", { currentPassword, newPassword }),
  bootstrapProfile: () => post<AffiliateDto>("/api/affiliate/profile/bootstrap"),
  overview: () => request<AffiliateDto>("/api/affiliate/overview"),
  referrals: () => request<AffiliateDto>("/api/affiliate/referrals"),
  rewards: () => request<AffiliateDto>("/api/affiliate/rewards"),
  profile: () => request<AffiliateDto>("/api/affiliate/profile"),
  payouts: () => request<AffiliateDto>("/api/affiliate/payouts"),
  payoutMethod: () => request<AffiliateDto>("/api/affiliate/payout-method"),
};
