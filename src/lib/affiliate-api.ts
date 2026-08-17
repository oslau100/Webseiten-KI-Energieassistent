/** Same-origin boundary for the future central affiliate service. */
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`/api/${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw new Error("service_unavailable");
  return response.json() as Promise<T>;
};

export const affiliateApi = {
  login: (email: string, password: string) => request("auth/sign-in", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (payload: { name: string; email: string; password: string }) => request("auth/sign-up", { method: "POST", body: JSON.stringify(payload) }),
  forgotPassword: (email: string) => request("auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) => request("auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
  overview: () => request("affiliate/overview"),
};
