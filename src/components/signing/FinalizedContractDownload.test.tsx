import { Blob as NodeBlob } from "node:buffer";
import { createHash, webcrypto } from "node:crypto";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider, LANGUAGES } from "@/lib/i18n";
import { WebsiteConfigProvider } from "@/lib/websiteConfig";
import { signingTranslations } from "@/lib/signing/i18n";
import AuftragEingegangen from "@/pages/AuftragEingegangen";
import {
  FinalizedContractDownload,
  type FinalizedContractBinding,
  type FinalizedContractDownloadAdapter,
  type FinalizedDownloadReadiness,
  type FinalizedPdfAuthority,
} from "./FinalizedContractDownload";

const originalURL = globalThis.URL;
const bytes = "%PDF-1.4\n% TEST_ONLY synthetic contract, no personal data\n%%EOF\n";
const sha256 = createHash("sha256").update(bytes).digest("hex");
const binding: FinalizedContractBinding = {
  locationId: "TEST_ONLY_LOCATION", orderId: "TEST_ONLY_ORDER",
  sessionId: "TEST_ONLY_SESSION", artifactId: "TEST_ONLY_ARTIFACT",
};
const proof = (): FinalizedPdfAuthority => ({
  binding: { ...binding }, sessionStatus: "finalized", artifactStatus: "bound_private_pdf",
  expiresAt: new Date(Date.now() + 60_000).toISOString(), sha256,
});
const pdf = () => new Blob([bytes], { type: "application/pdf" });
function syntheticAdapter(authority = proof()) {
  const download = vi.fn<FinalizedContractDownloadAdapter["downloadFinalizedPdf"]>()
    .mockResolvedValue({ status: "ready", authority, pdf: pdf() });
  const port = { readiness: { status: "ready", authority } as FinalizedDownloadReadiness, downloadFinalizedPdf: download };
  // Deliberate TEST_ONLY cast: production has no adapter producer or injectable route.
  return { adapter: port as unknown as FinalizedContractDownloadAdapter, port, download };
}
function Wrapper({ children, lang = "de", query = "" }: { children: React.ReactNode; lang?: string; query?: string }) {
  return <MemoryRouter initialEntries={[`/auftrag-eingegangen?lang=${lang}${query}`]}>
    <WebsiteConfigProvider><I18nProvider>{children}</I18nProvider></WebsiteConfigProvider>
  </MemoryRouter>;
}
function mount(adapter?: FinalizedContractDownloadAdapter | null, expected = binding) {
  return render(<Wrapper><FinalizedContractDownload adapter={adapter} binding={expected} /></Wrapper>);
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
type DownloadResult = Awaited<ReturnType<FinalizedContractDownloadAdapter["downloadFinalizedPdf"]>>;

beforeEach(() => {
  vi.stubEnv("VITE_LOCATION_ID", "");
  vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
  delete window.TB_BOOTSTRAP;
  localStorage.clear();
  vi.stubGlobal("Blob", NodeBlob);
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("URL", class extends originalURL {
    static createObjectURL = vi.fn(() => "blob:TEST_ONLY_PRIVATE_PDF");
    static revokeObjectURL = vi.fn();
  });
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("NETWORK_DISABLED"));
  vi.spyOn(XMLHttpRequest.prototype, "open").mockImplementation(() => { throw new Error("NETWORK_DISABLED"); });
  vi.stubGlobal("WebSocket", class { constructor() { throw new Error("NETWORK_DISABLED"); } });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  expect(fetch).not.toHaveBeenCalled();
  expect(XMLHttpRequest.prototype.open).not.toHaveBeenCalled();
  localStorage.clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("fail-closed finalized contract download presentation (no server AuthZ claim)", () => {
  it.each([undefined, null])("no adapter (%s) means no CTA or PDF", adapter => {
    const { container } = mount(adapter);
    expect(container).toBeEmptyDOMElement();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it.each(["pending", "not_wired", "unauthorized", "expired", "revoked", "unfinalized", "unbound", "failed"])(
    "%s readiness never offers or requests a download", status => {
      const fixture = syntheticAdapter();
      fixture.port.readiness = status === "pending" ? { status } : {
        status: "unavailable", reason: status as Extract<FinalizedDownloadReadiness, { status: "unavailable" }>["reason"],
      };
      const { container } = mount(fixture.adapter);
      expect(container).toBeEmptyDOMElement();
      expect(fixture.download).not.toHaveBeenCalled();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    },
  );

  it.each(["locationId", "orderId", "sessionId", "artifactId"] as const)("rejects a foreign %s", key => {
    const authority = proof();
    Object.assign(authority, { binding: { ...binding, [key]: "FOREIGN_TEST_ONLY" } });
    const fixture = syntheticAdapter(authority);
    mount(fixture.adapter);
    expect(screen.queryByRole("button")).toBeNull();
    expect(fixture.download).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it.each([
    { sessionStatus: "signed" }, { sessionStatus: "unfinalized" }, { artifactStatus: "signed_unbound" },
    { artifactStatus: "public_pdf" }, { expiresAt: "invalid" }, { expiresAt: "2000-01-01T00:00:00Z" },
    { sha256: "" }, { binding: undefined }, { binding: { ...binding, artifactId: "" } },
  ])("rejects incomplete/stale proof %j", change => {
    const fixture = syntheticAdapter({ ...proof(), ...change } as FinalizedPdfAuthority);
    mount(fixture.adapter);
    expect(screen.queryByRole("button")).toBeNull();
    expect(fixture.download).not.toHaveBeenCalled();
  });

  it("requires the expected context binding as well as proof and an adapter method", () => {
    const fixture = syntheticAdapter();
    const view = render(<Wrapper><FinalizedContractDownload adapter={fixture.adapter} /></Wrapper>);
    expect(screen.queryByRole("button")).toBeNull();
    view.rerender(<Wrapper><FinalizedContractDownload binding={binding}
      adapter={{ readiness: fixture.port.readiness } as FinalizedContractDownloadAdapter} /></Wrapper>);
    expect(screen.queryByRole("button")).toBeNull();
    expect(fixture.download).not.toHaveBeenCalled();
  });

  it("ignores query/UUID, storage, bootstrap and window-message finalization forgeries, including after reload", () => {
    const forged = { status: "ready", authorized: true, finalized: true, authority: proof(), pdfUrl: "/forged.pdf" };
    localStorage.setItem("signing_authorized", "true");
    localStorage.setItem("finalized_contract", JSON.stringify(forged));
    sessionStorage.setItem("finalized_contract", JSON.stringify(forged));
    window.TB_BOOTSTRAP = { ...forged, locationId: binding.locationId };
    window.dispatchEvent(new MessageEvent("message", { data: forged }));
    const query = "&signed=true&finalized=true&session_id=00000000-0000-4000-8000-000000000000&pdf=/forged.pdf";
    const view = render(<Wrapper query={query}><FinalizedContractDownload binding={binding} /></Wrapper>);
    expect(screen.queryByRole("button")).toBeNull();
    view.unmount();
    render(<Wrapper query={query}><FinalizedContractDownload binding={binding} /></Wrapper>);
    expect(screen.queryByRole("button")).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    sessionStorage.clear();
    delete window.TB_BOOTSTRAP;
  });

  it("keeps the existing thank-you page inert despite success copy and browser flags", () => {
    localStorage.setItem("signing_authorized", "true");
    render(<Wrapper query="&signed=true&finalized=true"><AuftragEingegangen /></Wrapper>);
    expect(screen.queryByRole("button", { name: signingTranslations.de.signing_download })).toBeNull();
    expect(screen.getByRole("link", { name: /Startseite/ })).toHaveAttribute("href", "/?lang=de");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  for (const { code } of LANGUAGES) {
    it(`${code}: localized CTA, busy, failure, retry and started message; correct direction`, async () => {
      const fixture = syntheticAdapter();
      const pending = deferred<DownloadResult>();
      fixture.download.mockReturnValueOnce(pending.promise);
      render(<Wrapper lang={code}><FinalizedContractDownload adapter={fixture.adapter} binding={binding} /></Wrapper>);
      const copy = signingTranslations[code];
      const button = screen.getByRole("button", { name: copy.signing_download });
      expect(button.parentElement).toHaveAttribute("lang", code);
      expect(button.parentElement).toHaveAttribute("dir", code === "ar" ? "rtl" : "ltr");
      expect(button).toHaveAttribute("type", "button");
      expect(button.tabIndex).toBe(0);
      button.focus();
      expect(button).toHaveFocus();
      // detail=0 represents activation without a pointing device. Real browser keyboard evidence stays OPEN.
      fireEvent.click(button, { detail: 0 });
      expect(button).toBeDisabled();
      expect(button).toHaveAccessibleName(copy.signing_download_busy);
      expect(screen.getByRole("status")).toHaveTextContent(copy.signing_download_busy);
      await act(async () => pending.reject(new Error("TEST_ONLY_NETWORK_FAILURE")));
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(copy.signing_download_failed);
      expect(alert).toHaveFocus();
      expect(button).toHaveAttribute("aria-describedby", alert.id);
      expect(button).toBeEnabled();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
      fireEvent.click(button);
      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(copy.signing_download_started));
      expect(button).toHaveFocus();
      expect(fixture.download).toHaveBeenCalledTimes(2);
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      fixture.download.mockResolvedValueOnce({ status: "unavailable", reason: "revoked" });
      fireEvent.click(button);
      const blocked = await screen.findByRole("alert");
      expect(blocked).toHaveTextContent(copy.signing_download_unavailable);
      expect(blocked).toHaveFocus();
      expect(screen.queryByRole("button")).toBeNull();
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });
  }

  it("serializes clicks, downloads only validated local bytes and revokes its URL on exit", async () => {
    const fixture = syntheticAdapter();
    const pending = deferred<DownloadResult>();
    fixture.download.mockReturnValueOnce(pending.promise);
    const view = mount(fixture.adapter);
    const button = screen.getByRole("button");
    fireEvent.click(button); fireEvent.click(button);
    expect(fixture.download).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    await act(async () => pending.resolve({ status: "ready", authority: fixture.port.readiness.status === "ready" ? fixture.port.readiness.authority : proof(), pdf: pdf() }));
    await screen.findByText(signingTranslations.de.signing_download_started);
    const link = vi.mocked(HTMLAnchorElement.prototype.click).mock.contexts[0] as HTMLAnchorElement;
    expect(link.href).toBe("blob:TEST_ONLY_PRIVATE_PDF");
    expect(link.download).toBe("signed-contract.pdf");
    expect(link.isConnected).toBe(false);
    expect(document.querySelector("a[download]")).toBeNull();
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:TEST_ONLY_PRIVATE_PDF");
  });

  it.each(["unauthorized", "expired", "revoked", "unfinalized", "unbound"] as const)("server %s response never releases bytes", async reason => {
    const fixture = syntheticAdapter();
    fixture.download.mockResolvedValue({ status: "unavailable", reason });
    mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toHaveTextContent(signingTranslations.de.signing_download_unavailable);
    expect(screen.queryByRole("button")).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
  });

  it.each(["locationId", "orderId", "sessionId", "artifactId", "sha256", "expiresAt", "artifactStatus", "sessionStatus"] as const)(
    "rechecks returned %s instead of trusting initial readiness", async key => {
      const fixture = syntheticAdapter();
      const returned = proof();
      if (key in binding) Object.assign(returned, { binding: { ...binding, [key]: "FOREIGN_TEST_ONLY" } });
      else Object.assign(returned, { [key]: key === "sha256" ? "b".repeat(64) : key === "expiresAt" ? "2000-01-01T00:00:00Z" : "unbound" });
      fixture.download.mockResolvedValue({ status: "ready", authority: returned, pdf: pdf() });
      mount(fixture.adapter);
      fireEvent.click(screen.getByRole("button"));
      await screen.findByRole("alert");
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    },
  );

  it.each(["bad_header", "wrong_hash", "wrong_mime", "empty"])("rejects %s bytes with real hash/header verification", async kind => {
    const fixture = syntheticAdapter();
    const data = kind === "empty" ? "" : kind === "bad_header" ? "NOT_A_PDF" : kind === "wrong_hash" ? `${bytes}tampered` : bytes;
    fixture.download.mockResolvedValue({ status: "ready", authority: proof(), pdf: new Blob([data], { type: kind === "wrong_mime" ? "text/html" : "application/pdf" }) });
    mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("alert");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("expires while pending and discards a late success even if the adapter ignores abort", async () => {
    vi.useFakeTimers();
    const fixture = syntheticAdapter();
    const pending = deferred<DownloadResult>();
    fixture.download.mockReturnValue(pending.promise);
    mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    const signal = fixture.download.mock.calls[0][0];
    await act(async () => { vi.advanceTimersByTime(61_000); });
    expect(screen.queryByRole("button")).toBeNull();
    expect(signal.aborted).toBe(true);
    await act(async () => pending.resolve({ status: "ready", authority: proof(), pdf: pdf() }));
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it.each(["focus", "pageshow"])("rechecks expiry on %s", event => {
    vi.useFakeTimers();
    const fixture = syntheticAdapter();
    mount(fixture.adapter);
    vi.setSystemTime(Date.now() + 61_000);
    act(() => { window.dispatchEvent(new Event(event)); });
    expect(screen.queryByRole("button")).toBeNull();
    expect(fixture.download).not.toHaveBeenCalled();
  });

  it.each(["revoked", "binding_changed", "adapter_replaced", "unmount"])("%s cancels the old request and ignores late bytes", async change => {
    const fixture = syntheticAdapter();
    const pending = deferred<DownloadResult>();
    fixture.download.mockReturnValue(pending.promise);
    const view = mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    const signal = fixture.download.mock.calls[0][0];
    if (change === "unmount") view.unmount();
    else {
      if (change === "revoked") fixture.port.readiness = { status: "unavailable", reason: "revoked" };
      view.rerender(<Wrapper><FinalizedContractDownload
        adapter={change === "adapter_replaced" ? syntheticAdapter().adapter : fixture.adapter}
        binding={change === "binding_changed" ? { ...binding, orderId: "ANOTHER_TEST_ORDER" } : binding} /></Wrapper>);
    }
    expect(signal.aborted).toBe(true);
    await act(async () => pending.resolve({ status: "ready", authority: proof(), pdf: pdf() }));
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("rechecks expiry after byte verification even before the next timer tick", async () => {
    const fixture = syntheticAdapter();
    const data = pdf();
    const read = deferred<ArrayBuffer>();
    vi.spyOn(data, "arrayBuffer").mockReturnValue(read.promise);
    fixture.download.mockResolvedValue({ status: "ready", authority: proof(), pdf: data });
    mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(data.arrayBuffer).toHaveBeenCalled());
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 61_000);
    await act(async () => read.resolve(await pdf().arrayBuffer()));
    await screen.findByRole("alert");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("handles Blob URL creation failure with a safe retry message", async () => {
    vi.mocked(URL.createObjectURL).mockImplementation(() => { throw new Error("TEST_ONLY"); });
    const fixture = syntheticAdapter();
    mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("alert");
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("revokes the temporary Blob URL after the browser consumption delay", async () => {
    const fixture = syntheticAdapter();
    mount(fixture.adapter);
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button"));
    // Poll real asynchronous WebCrypto without advancing the revocation timer.
    await act(async () => {
      await vi.waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled(), { timeout: 1000 });
    });
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:TEST_ONLY_PRIVATE_PDF");
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("does not call the adapter when readiness is revoked before activation", () => {
    const fixture = syntheticAdapter();
    mount(fixture.adapter);
    fixture.port.readiness = { status: "unavailable", reason: "revoked" };
    fireEvent.click(screen.getByRole("button"));
    expect(fixture.download).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("rejects readiness revoked during byte verification without relying on a rerender", async () => {
    const fixture = syntheticAdapter();
    const data = pdf();
    const read = deferred<ArrayBuffer>();
    vi.spyOn(data, "arrayBuffer").mockReturnValue(read.promise);
    fixture.download.mockResolvedValue({ status: "ready", authority: proof(), pdf: data });
    mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(data.arrayBuffer).toHaveBeenCalled());
    fixture.port.readiness = { status: "unavailable", reason: "revoked" };
    await act(async () => read.resolve(await pdf().arrayBuffer()));
    await screen.findByRole("alert");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("does not apply a stale byte-check failure to a replacement adapter", async () => {
    const authority = proof();
    const fixture = syntheticAdapter(authority);
    const replacement = syntheticAdapter(authority);
    const data = pdf();
    const read = deferred<ArrayBuffer>();
    vi.spyOn(data, "arrayBuffer").mockReturnValue(read.promise);
    fixture.download.mockResolvedValue({ status: "ready", authority, pdf: data });
    const view = mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => expect(data.arrayBuffer).toHaveBeenCalled());
    view.rerender(<Wrapper><FinalizedContractDownload adapter={replacement.adapter} binding={binding} /></Wrapper>);
    await act(async () => read.resolve(new TextEncoder().encode("TEST_ONLY_INVALID").buffer));
    expect(screen.getByRole("button")).toBeEnabled();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it("allows a fresh authorized attempt after an adapter reports a technical failure", async () => {
    const fixture = syntheticAdapter();
    fixture.download.mockResolvedValueOnce({ status: "unavailable", reason: "failed" });
    mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toHaveTextContent(signingTranslations.de.signing_download_failed);
    expect(screen.getByRole("button")).toBeEnabled();
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText(signingTranslations.de.signing_download_started);
    expect(fixture.download).toHaveBeenCalledTimes(2);
  });

  it("authorizes every retry and retains no download capability across remount", async () => {
    const fixture = syntheticAdapter();
    const view = mount(fixture.adapter);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText(signingTranslations.de.signing_download_started);
    fixture.download.mockResolvedValue({ status: "unavailable", reason: "revoked" });
    fireEvent.click(screen.getByRole("button"));
    await screen.findByRole("alert");
    expect(screen.queryByRole("button")).toBeNull();
    expect(fixture.download).toHaveBeenCalledTimes(2);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    view.unmount();
    mount();
    expect(screen.queryByRole("button")).toBeNull();
    expect(localStorage.getItem("finalized_contract")).toBeNull();
  });
});
