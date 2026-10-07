import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n";
import { resolveWebsiteConfig, WebsiteConfigProvider, useWebsiteConfig } from "@/lib/websiteConfig";
import type { JsonRecord } from "@/lib/websiteContentResolver";
import Impressum from "./Impressum";
import Datenschutz from "./Datenschutz";

const preparation = "Die rechtlichen Angaben werden für diesen Standort vorbereitet.";
const variables = { firma: "Configured company", email: "contact@example.test" };
const pages = [
  { key: "impressum", Component: Impressum, bodyHeading: "Angaben gemäß § 5 DDG" },
  { key: "datenschutz", Component: Datenschutz, bodyHeading: "4. Hosting" },
];
const ConfigLoaded = () => {
  const { loading } = useWebsiteConfig();
  return <output data-testid="config-loading">{String(loading)}</output>;
};

async function renderPage(page: typeof pages[number], content?: JsonRecord) {
  vi.stubEnv("VITE_LOCATION_ID", "");
  if (content) {
    window.TB_BOOTSTRAP = { locationId: "test-location", supabaseUrl: "https://configuration.test", supabaseKey: "sb_publishable_test" };
  }
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{ webseite_content_config: content }])));
  const { Component, key } = page;
  const result = render(
    <MemoryRouter initialEntries={[`/${key}`]}>
      <WebsiteConfigProvider>
        <I18nProvider><ConfigLoaded /><Component /></I18nProvider>
      </WebsiteConfigProvider>
    </MemoryRouter>,
  );
  await waitFor(() => expect(screen.getByTestId("config-loading")).toHaveTextContent("false"));
  expect(result.container.innerHTML).not.toMatch(/ehiogie|marvin|tn90CyE3XuYFTy4c1M3F|Vaalser|015213603777/i);
  return result;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  delete window.TB_BOOTSTRAP;
  localStorage.clear();
});

describe("legal readiness gate", () => {
  it("defaults the repository readiness flag to false", () => {
    expect(resolveWebsiteConfig().content.legal).toMatchObject({ ready: false });
  });

  for (const page of pages) {
    describe(page.key, () => {
      it("keeps the neutral default in preparation state", async () => {
        await renderPage(page);
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });

      it("does not publish the inherited document with only company and email", async () => {
        await renderPage(page, { legal: { variables } });
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
        expect(screen.queryByText("Unsere Website wird auf einem eigenen Server betrieben.")).not.toBeInTheDocument();
      });

      it("does not infer readiness from a fully populated company record", async () => {
        await renderPage(page, { legal: { variables: { ...variables, inhaber: "Configured owner", strasse: "Test address", plz: "12345", ort: "Test city", land: "Test country", telefon: "123456789" } } });
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });

      it.each([false, "true", 1, null])("does not enable the document for non-boolean-true readiness %j", async (ready) => {
        await renderPage(page, { legal: { ready, variables } });
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });

      it("allows the existing fallback body only with explicit readiness and required values", async () => {
        await renderPage(page, { legal: { ready: true, variables } });
        expect(screen.getByRole("heading", { name: page.bodyHeading })).toBeInTheDocument();
        expect(screen.queryByText(preparation)).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: variables.email })).toHaveAttribute("href", `mailto:${variables.email}`);
      });

      it.each(["firma", "email"])("still requires %s when readiness is true", async (missing) => {
        await renderPage(page, { legal: { ready: true, variables: { ...variables, [missing]: "" } } });
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });

      it("preserves explicit page HTML overrides when not ready and without company variables", async () => {
        await renderPage(page, { legal: { ready: false }, pages: { [page.key]: { html: "<h1>Verified page override</h1>" } } });
        expect(screen.getByRole("heading", { name: "Verified page override" })).toBeInTheDocument();
        expect(screen.queryByText(preparation)).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });
    });
  }
});
