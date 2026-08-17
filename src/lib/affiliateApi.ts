export class AffiliateApiError extends Error {
  constructor(public status: number, message = "Affiliate API request failed") { super(message); }
}

async function request<T>(path: `/api/${"auth" | "affiliate"}/${string}`, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, credentials: "same-origin", headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) throw new AffiliateApiError(response.status);
  return response.json() as Promise<T>;
}

export const affiliateApi = {
  login: (email: string, password: string) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload: { name: string; email: string; password: string }) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  forgotPassword: (email: string) => request("/api/auth/password/forgot", { method: "POST", body: JSON.stringify({ email }) }),
  dashboard: () => request("/api/affiliate/dashboard"),
};
