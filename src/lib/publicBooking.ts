export const BOOKING_LOCATION_ID = "Ddc0DVM8MT67wmLP3wAA";
export const BOOKING_CALENDAR_SLUG = "rueckruf-buchen";
export const PRIVACY_URL = "https://kromen-energieassistent.de/datenschutz";
const FALLBACK_URL = "https://oynhnhkldvpoqhsfirwf.supabase.co";

type BootstrapWindow = Window & { TB_BOOTSTRAP?: Record<string, string> };
export type BookingErrorCode = "CONFIGURATION_ERROR" | "CALENDAR_NOT_FOUND" | "CALENDAR_DISABLED" | "BOOKING_DISABLED" | "ORIGIN_NOT_ALLOWED" | "RATE_LIMITED" | "MINIMUM_NOTICE_NOT_MET" | "MAXIMUM_ADVANCE_EXCEEDED" | "SLOT_UNAVAILABLE" | "IDEMPOTENCY_CONFLICT" | "CONSENT_REQUIRED" | "VALIDATION_ERROR" | "INTERNAL_ERROR";
export class BookingApiError extends Error { constructor(public code: BookingErrorCode, message = "Booking request failed") { super(message); this.name = "BookingApiError"; } }

export const isLegacyAnonJwt = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) return false;
  try { const payload = JSON.parse(atob(value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); return payload.role === "anon"; } catch { return false; }
};

export function resolveBookingRuntime(href = window.location.href) {
  const query = new URL(href).searchParams;
  const bootstrap = (window as BootstrapWindow).TB_BOOTSTRAP || {};
  const supabaseUrl = [query.get("supabase_url"), bootstrap.supabaseUrl, import.meta.env.VITE_SUPABASE_URL, FALLBACK_URL].find((v) => typeof v === "string" && /^https:\/\//.test(v.trim()))!.trim().replace(/\/$/, "");
  // The build-time anon JWT is deliberately preferred; runtime keys are accepted only after JWT validation.
  const candidates = [import.meta.env.VITE_SUPABASE_ANON_KEY, query.get("supabase_key"), bootstrap.supabaseKey];
  const anonJwt = candidates.find(isLegacyAnonJwt);
  if (!anonJwt) throw new BookingApiError("CONFIGURATION_ERROR", "Die Terminbuchung ist derzeit nicht korrekt konfiguriert.");
  return { supabaseUrl, anonJwt, endpoint: `${supabaseUrl}/functions/v1/booking-proxy` };
}

export async function bookingRequest<T>(body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const { endpoint, anonJwt } = resolveBookingRuntime();
  const response = await fetch(endpoint, { method: "POST", signal, headers: { "Content-Type": "application/json", apikey: anonJwt, Authorization: `Bearer ${anonJwt}` }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.error) throw new BookingApiError((data?.code || data?.error?.code || "INTERNAL_ERROR") as BookingErrorCode);
  return data as T;
}

export const availabilityRange = (today = new Date()) => {
  const start = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(today);
  const endDate = new Date(`${start}T12:00:00Z`); endDate.setUTCDate(endDate.getUTCDate() + 30);
  return { start, end: endDate.toISOString().slice(0, 10) };
};

export const readUtm = (search: string) => {
  const result: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(search)) if (/^utm_[a-z0-9_]{1,24}$/i.test(key) && Object.keys(result).length < 10) result[key.toLowerCase()] = value.slice(0, 200);
  return result;
};

export const normalizePhone = (value: string) => {
  if (/[A-Za-z]/.test(value) || (value.match(/\+/g)?.length ?? 0) > 1 || value.includes("+") && !value.trim().startsWith("+")) return null;
  const prefix = value.trim().startsWith("+") ? "+" : "";
  const digits = value.replace(/\D/g, "");
  return /^\d{7,15}$/.test(digits) ? `${prefix}${digits}` : null;
};
