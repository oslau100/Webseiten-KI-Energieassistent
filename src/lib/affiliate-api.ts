/** Same-origin boundary for the future central affiliate service. */
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error("service_unavailable");
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const affiliateApi = {
  login: (email: string, password: string) => request<void>("auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload: { name: string; email: string; password: string }) => request<void>("auth/register", { method: "POST", body: JSON.stringify(payload) }),
  activate: (token: string) => request<void>("auth/activate", { method: "POST", body: JSON.stringify({ token }) }),
  forgotPassword: (email: string) => request<void>("auth/password/forgot", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) => request<void>("auth/password/reset", { method: "POST", body: JSON.stringify({ token, newPassword }) }),
  overview: () => request("affiliate/overview"),
};
