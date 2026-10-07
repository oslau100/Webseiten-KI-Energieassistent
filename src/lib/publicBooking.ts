import { getBootstrapConfig, resolveWebsiteRuntime, isLegacyAnonJwt } from "./websiteRuntime";
export { isLegacyAnonJwt } from "./websiteRuntime";
export const BOOKING_CALENDAR_SLUG = "rueckruf-buchen";
export const PRIVACY_URL = "/datenschutz";

export type BookingErrorCode = "CONFIGURATION_ERROR" | "CALENDAR_NOT_FOUND" | "CALENDAR_DISABLED" | "BOOKING_DISABLED" | "ORIGIN_NOT_ALLOWED" | "RATE_LIMITED" | "MINIMUM_NOTICE_NOT_MET" | "MAXIMUM_ADVANCE_EXCEEDED" | "SLOT_UNAVAILABLE" | "IDEMPOTENCY_CONFLICT" | "CONSENT_REQUIRED" | "VALIDATION_ERROR" | "INTERNAL_ERROR";
export class BookingApiError extends Error { constructor(public code: BookingErrorCode, message = "Booking request failed") { super(message); this.name = "BookingApiError"; } }

export function resolveBookingRuntime(href = window.location.href) {
  const bootstrap = getBootstrapConfig();
  const { locationId, supabaseUrl } = resolveWebsiteRuntime({ search: new URL(href).search });
  // booking-proxy still requires a legacy anon JWT; preserve that backend contract.
  const query = new URLSearchParams(import.meta.env.DEV ? new URL(href).search : "");
  const candidates = [import.meta.env.VITE_SUPABASE_ANON_KEY, bootstrap.supabaseAnonKey, bootstrap.supabaseKey, query.get("supabase_key")];
  const anonJwt = candidates.find(isLegacyAnonJwt);
  if (!locationId || !supabaseUrl || !anonJwt) throw new BookingApiError("CONFIGURATION_ERROR", "Die Terminbuchung ist derzeit nicht korrekt konfiguriert.");
  return { locationId, supabaseUrl, anonJwt, endpoint: `${supabaseUrl}/functions/v1/booking-proxy` };
}

export async function bookingRequest<T>(body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const { endpoint, anonJwt, locationId } = resolveBookingRuntime();
  const response = await fetch(endpoint, { method: "POST", signal, headers: { "Content-Type": "application/json", apikey: anonJwt, Authorization: `Bearer ${anonJwt}` }, body: JSON.stringify({ ...body, location_id: locationId }) });
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
