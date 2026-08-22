/** Same-origin boundary for the future Public Platform Worker.
 * Tenant identity is deliberately not accepted from browser input.
 */
export class AffiliateApiError extends Error {
  constructor(public readonly status: number, message = "Der Dienst ist derzeit nicht erreichbar.") {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new AffiliateApiError(response.status);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const affiliateApi = {
  login: (email: string, password: string) => request<void>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) => request<void>("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  forgotPassword: (email: string) => request<void>("/api/auth/password/forgot", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) => request<void>("/api/auth/password/reset", { method: "POST", body: JSON.stringify({ token, newPassword }) }),
  activate: (token: string) => request<void>("/api/auth/activate", { method: "POST", body: JSON.stringify({ token }) }),
  overview: () => request<unknown>("/api/affiliate/overview"),
};
