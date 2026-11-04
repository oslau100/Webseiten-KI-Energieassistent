import { useEffect, useState } from "react";
import { SigningShell, type SigningPresentation } from "@/components/signing/SigningShell";
import { inactiveSigningServer } from "@/lib/signing/contract";

/** Release-locked entry. No fixture, browser flag or injectable transport on this route. */
export default function Signing() {
  const [state, setState] = useState<SigningPresentation>({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    void inactiveSigningServer.loadSession(controller.signal).then(result => {
      if (!controller.signal.aborted) setState(result.status === "unavailable" ? result : { status: "unavailable", reason: "not_wired" });
    }).catch(() => { if (!controller.signal.aborted) setState({ status: "unavailable", reason: "failed" }); });
    return () => controller.abort();
  }, []);
  return <SigningShell state={state} />;
}
