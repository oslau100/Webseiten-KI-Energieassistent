import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "@/App";

const customerMarkers = /ehiogie|marvin|tn90CyE3XuYFTy4c1M3F|Vaalser|015213603777/i;
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); history.replaceState({}, "", "/"); localStorage.clear(); });

describe("neutral runtime fallback pages", () => {
  it.each(["/", "/jahresrechnung", "/impressum", "/datenschutz", "/tarif"])("does not expose a customer identity or fetch an implicit tenant at %s", async (path) => {
    vi.stubEnv("VITE_LOCATION_ID", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    vi.stubGlobal("scrollTo", vi.fn());
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("[]"));
    history.replaceState({}, "", path);
    const { container } = render(<App />);
    await waitFor(() => expect(document.title).toBe("Energieassistent"));
    expect(container.innerHTML).not.toMatch(customerMarkers);
    expect(document.head.innerHTML).not.toMatch(customerMarkers);
    expect(fetchMock).not.toHaveBeenCalled();
    if (["/impressum", "/datenschutz"].includes(path)) {
      expect(screen.getByText("Die rechtlichen Angaben werden für diesen Standort vorbereitet.")).toBeInTheDocument();
      expect(container.querySelector('a[href="mailto:"]')).toBeNull();
    }
  });
});
