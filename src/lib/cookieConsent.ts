import { useEffect, useState } from "react";
import { resolveWebsiteRuntime } from "./websiteRuntime";

export const CONSENT_KEY = "cookie-consent";
export const openConsentSettingsEvent = "website:consent-settings";
const changedEvent = "website:consent-changed";
const maxAge = 60 * 60 * 24 * 180;
type Consent = "all" | "essential";
let reloadStarted = false;
const endOptionalRuntime = () => {
  if (!reloadStarted && !resolveWebsiteRuntime().identity.customer) {
    reloadStarted = true;
    location.reload();
  }
};

function readRecord(): { choice: Consent; expires: number } | null {
  const raw = document.cookie.split(";").map(value => value.trim()).find(value => value.startsWith(`${CONSENT_KEY}=`));
  if (!raw) return null;
  try {
    const [version, choice, expiry] = decodeURIComponent(raw.slice(CONSENT_KEY.length + 1)).split(":");
    const expires = Number(expiry);
    if (version !== "v2" || !["all", "essential"].includes(choice) || !Number.isFinite(expires) || expires <= Date.now()) return null;
    return { choice: choice as Consent, expires };
  } catch { return null; }
}

// The expiring host cookie is authoritative. Old preselected or local-only consent cannot enable third parties.
export const readConsent = (): Consent | null => readRecord()?.choice ?? null;

export function setConsentStorage(choice: Consent) {
  const withdrawing = readConsent() === "all" && choice === "essential";
  if (choice === "all") reloadStarted = false;
  const value = `v2:${choice}:${Date.now() + maxAge * 1000}`;
  try { localStorage.setItem(CONSENT_KEY, value); } catch { /* Cookie remains authoritative. */ }
  document.cookie = `${CONSENT_KEY}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  window.dispatchEvent(new Event(changedEvent));
  // Removing a script cannot undo vendor timers/listeners. A reload ends that runtime.
  if (withdrawing) endOptionalRuntime();
}

export function useOptionalConsent() {
  const [accepted, setAccepted] = useState(() => readConsent() === "all");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let previouslyAccepted = readConsent() === "all";
    const refresh = () => {
      clearTimeout(timer);
      const record = readRecord();
      const next = record?.choice === "all";
      setAccepted(next);
      if (previouslyAccepted && !next) endOptionalRuntime();
      previouslyAccepted = next;
      if (record) timer = setTimeout(refresh, Math.min(record.expires - Date.now() + 1, 2147483647));
    };
    refresh();
    window.addEventListener(changedEvent, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(changedEvent, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return accepted;
}
