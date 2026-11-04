import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { verifyPrivatePdf } from "@/lib/signing/contract";

export type FinalizedContractBinding = Readonly<{
  locationId: string;
  orderId: string;
  sessionId: string;
  artifactId: string;
}>;

export type FinalizedPdfAuthority = Readonly<{
  binding: FinalizedContractBinding;
  sessionStatus: "finalized";
  artifactStatus: "bound_private_pdf";
  expiresAt: string;
  sha256: string;
}>;

type Unavailable = { status: "unavailable"; reason: "not_wired" | "unauthorized" | "expired" | "revoked" | "unfinalized" | "unbound" | "failed" };
export type FinalizedDownloadReadiness = { status: "pending" } | Unavailable |
  { status: "ready"; authority: FinalizedPdfAuthority };

// No producer or browser override is provided. Only a separately reviewed server
// integration may supply this nominal port. This is NOT an HTTP/API contract.
declare const serverAuthenticatedDownloadAdapter: unique symbol;
export interface FinalizedContractDownloadAdapter {
  readonly [serverAuthenticatedDownloadAdapter]: true;
  readonly readiness: FinalizedDownloadReadiness;
  /** Must authenticate and reauthorize the full binding on EVERY attempt, then
   * return only the finalized private PDF and its server-authenticated proof.
   * Client shape/hash checks below are UX defenses, never server authorization.
   */
  downloadFinalizedPdf(signal: AbortSignal): Promise<Unavailable | {
    status: "ready";
    authority: FinalizedPdfAuthority;
    pdf: Blob;
  }>;
}

const bindingKeys = ["locationId", "orderId", "sessionId", "artifactId"] as const;
function matchesAuthority(authority: FinalizedPdfAuthority | undefined, expected: FinalizedContractBinding | undefined): boolean {
  return Boolean(authority && expected && authority.sessionStatus === "finalized" &&
    authority.artifactStatus === "bound_private_pdf" && authority.binding &&
    bindingKeys.every(key => typeof expected[key] === "string" && expected[key].trim().length > 0 &&
      authority.binding[key] === expected[key]) &&
    /^[a-f0-9]{64}$/.test(authority.sha256) && Date.parse(authority.expiresAt) > Date.now());
}

/** Inert by default. No route supplies an adapter or derives authority from
 * URL, storage, window messages, a signature image, or thank-you page copy.
 * A prop/type cannot establish trust: future wiring still needs audited AuthZ.
 */
export function FinalizedContractDownload({ adapter, binding }: {
  adapter?: FinalizedContractDownloadAdapter | null;
  binding?: FinalizedContractBinding;
}) {
  const [, refresh] = useState(0);
  const readiness = adapter?.readiness;
  const authority = readiness?.status === "ready" ? readiness.authority : undefined;
  useEffect(() => {
    if (!authority) return;
    const check = () => refresh(value => value + 1);
    const timer = window.setInterval(check, 1000);
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
    };
  }, [authority]);
  if (!adapter || typeof adapter.downloadFinalizedPdf !== "function" || !matchesAuthority(authority, binding)) return null;
  return <DownloadControl key={JSON.stringify([binding, authority])} adapter={adapter} authority={authority!} />;
}

function DownloadControl({ adapter, authority }: { adapter: FinalizedContractDownloadAdapter; authority: FinalizedPdfAuthority }) {
  const { t, lang } = useI18n();
  const [state, setState] = useState<"idle" | "busy" | "failed" | "blocked" | "started">("idle");
  const messageId = useId();
  const message = useRef<HTMLParagraphElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const active = useRef<AbortController | null>(null);
  const latestAdapter = useRef(adapter);
  latestAdapter.current = adapter;
  const urls = useRef(new Map<string, number>());

  useEffect(() => {
    setState("idle");
    const ownedUrls = urls.current;
    return () => {
      active.current?.abort();
      active.current = null;
      for (const [url, timer] of ownedUrls) { window.clearTimeout(timer); URL.revokeObjectURL(url); }
      ownedUrls.clear();
    };
  }, [adapter]);
  useEffect(() => {
    if (state === "failed" || state === "blocked") message.current?.focus();
    if (state === "started") button.current?.focus();
  }, [state]);

  async function download() {
    if (active.current || state === "blocked") return;
    if (!matchesAuthority(authority, authority.binding) || adapter.readiness.status !== "ready" ||
      !matchesAuthority(adapter.readiness.authority, authority.binding) || adapter.readiness.authority.sha256 !== authority.sha256) {
      setState("blocked"); return;
    }
    const controller = new AbortController();
    active.current = controller;
    setState("busy");
    const current = () => active.current === controller && !controller.signal.aborted && latestAdapter.current === adapter;
    try {
      const result = await adapter.downloadFinalizedPdf(controller.signal);
      if (!current()) return;
      if (result?.status !== "ready") {
        if (result?.status === "unavailable" && result.reason === "failed") throw new Error("DOWNLOAD_FAILED");
        setState("blocked"); return;
      }
      if (!matchesAuthority(result.authority, authority.binding) || result.authority.sha256 !== authority.sha256) {
        setState("blocked"); return;
      }
      const validPdf = await verifyPrivatePdf(result.pdf, authority.sha256);
      if (!current()) return;
      if (!validPdf) {
        setState("blocked"); return;
      }
      // Expiry/revocation or a changed binding while bytes were checked must fail closed.
      if (adapter.readiness.status !== "ready" || !matchesAuthority(adapter.readiness.authority, authority.binding) ||
        adapter.readiness.authority.sha256 !== authority.sha256 ||
        !matchesAuthority(authority, authority.binding) || !matchesAuthority(result.authority, authority.binding)) {
        setState("blocked"); return;
      }
      const url = URL.createObjectURL(result.pdf);
      // Delay revocation briefly so the browser can consume the local Blob URL.
      const timer = window.setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url); }, 1000);
      urls.current.set(url, timer);
      const link = document.createElement("a");
      link.href = url;
      link.download = "signed-contract.pdf";
      link.hidden = true;
      try { document.body.appendChild(link); link.click(); }
      finally { link.remove(); }
      setState("started");
    } catch {
      if (current()) setState("failed");
    } finally {
      if (active.current === controller) active.current = null;
    }
  }

  return <div lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} translate="no" className="space-y-3" aria-busy={state === "busy"}>
    {state !== "blocked" && <Button ref={button} type="button" disabled={state === "busy"} onClick={() => void download()}
      aria-describedby={state === "idle" ? undefined : messageId} className="h-auto min-h-11 max-w-full whitespace-normal">
      {t(state === "busy" ? "signing_download_busy" : "signing_download")}
    </Button>}
    {state !== "idle" && <p id={messageId} ref={message} tabIndex={-1} role={state === "failed" || state === "blocked" ? "alert" : "status"}>
      {t(state === "busy" ? "signing_download_busy" : state === "failed" ? "signing_download_failed" :
        state === "blocked" ? "signing_download_unavailable" : "signing_download_started")}
    </p>}
  </div>;
}
