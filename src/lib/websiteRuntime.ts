export type BootstrapConfig = {
  locationId?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseKey?: string;
  [key: string]: unknown;
};

export const DEFAULT_SUPABASE_URL = "https://oynhnhkldvpoqhsfirwf.supabase.co";
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const first = (...values: unknown[]) => values.map(text).find(Boolean) || "";

export const isValidLocationId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value) &&
  !/^(secret|placeholder|undefined|null)$/i.test(value);

export const isLegacyAnonJwt = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) return false;
  try {
    const payload = JSON.parse(atob(value.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.role === "anon";
  } catch { return false; }
};

export const isPublicSupabaseKey = (value: unknown): value is string =>
  typeof value === "string" && (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value) || isLegacyAnonJwt(value));

export const getBootstrapConfig = (): BootstrapConfig =>
  typeof window === "undefined" ? {} : window.TB_BOOTSTRAP || {};

export function resolveWebsiteRuntime({
  bootstrap = getBootstrapConfig(),
  env = import.meta.env,
  search = typeof window === "undefined" ? "" : window.location.search,
  development = import.meta.env.DEV,
}: {
  bootstrap?: BootstrapConfig;
  env?: Record<string, unknown>;
  search?: string;
  development?: boolean;
} = {}) {
  // Public URLs must not be able to switch a production site's tenant or API.
  const query = new URLSearchParams(development ? search : "");
  const selectedLocation = first(bootstrap.locationId, env.VITE_LOCATION_ID, query.get("location_id"), query.get("locationId"));
  // An invalid explicit value fails closed instead of selecting a lower-priority tenant.
  const locationId = isValidLocationId(selectedLocation) ? selectedLocation : "";
  const selectedUrl = first(bootstrap.supabaseUrl, env.VITE_SUPABASE_URL, query.get("supabase_url"), DEFAULT_SUPABASE_URL);
  const supabaseUrl = /^https:\/\//.test(selectedUrl) ? selectedUrl.replace(/\/$/, "") : "";
  const selectedKey = first(bootstrap.supabaseAnonKey, bootstrap.supabaseKey, env.VITE_SUPABASE_PUBLISHABLE_KEY, env.VITE_SUPABASE_ANON_KEY, query.get("supabase_key"));
  const supabaseKey = isPublicSupabaseKey(selectedKey) ? selectedKey : "";
  return { locationId, supabaseUrl, supabaseKey };
}

export function initializeLoaderBootstrap() {
  const bootstrap = getBootstrapConfig();
  const runtime = resolveWebsiteRuntime({ bootstrap });
  // Only the resolved, browser-safe values are passed to same-origin iframe loaders.
  window.WEBSITE_LOADER_BOOTSTRAP = { ...bootstrap, ...runtime, supabaseAnonKey: undefined };
}
