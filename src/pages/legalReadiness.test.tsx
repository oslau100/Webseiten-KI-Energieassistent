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
        await renderPage(page, { legal: { ready, variables }, pages: { [page.key]: { html: "<h1>Unapproved override</h1>" } } });
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });

      it("does not publish an unreviewed fallback even with explicit readiness", async () => {
        await renderPage(page, { legal: { ready: true, variables } });
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });

      it("renders supplied approved semantic HTML", async () => {
        await renderPage(page, { legal: { ready: true, variables }, pages: { [page.key]: { html: '<h1>Approved document</h1><p><a href="mailto:contact@example.test">Contact</a></p>' } } });
        expect(screen.getByRole("heading", { name: "Approved document" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "mailto:contact@example.test");
      });

      it.each(['<script>alert(1)</script>', '<img src="https://unwanted.test/x" onerror="alert(1)">', '<iframe src="https://unwanted.test"></iframe>', '<svg onload="alert(1)"></svg>', '<p onclick="alert(1)">Unsafe</p>', '<a href="javascript:alert(1)">Unsafe</a>', '<a href="data:text/html,unsafe">Unsafe</a>', '<a href="//unwanted.test">Unsafe</a>', '<a href="https://user:password@unwanted.test">Unsafe</a>', '<p style="background:url(https://unwanted.test)">Unsafe</p>'])("fails closed on unsafe approved HTML %s", async html => {
        const { container } = await renderPage(page, { legal: { ready: true, variables }, pages: { [page.key]: { html: '<h1>Unsafe document</h1>' + html } } });
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: "Unsafe document" })).not.toBeInTheDocument();
        expect(container.querySelector('script,iframe,svg[onload],img[src^="https://unwanted"]')).toBeNull();
      });

      it.each(["firma", "email"])("still requires %s when readiness is true", async (missing) => {
        await renderPage(page, { legal: { ready: true, variables: { ...variables, [missing]: "" } }, pages: { [page.key]: { html: "<h1>Incomplete override</h1>" } } });
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });

      it("blocks explicit page HTML overrides when not ready and without company variables", async () => {
        await renderPage(page, { legal: { ready: false }, pages: { [page.key]: { html: "<h1>Verified page override</h1>" } } });
        expect(screen.queryByRole("heading", { name: "Verified page override" })).not.toBeInTheDocument();
        expect(screen.getByText(preparation)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: page.bodyHeading })).not.toBeInTheDocument();
      });
    });
  }
});
