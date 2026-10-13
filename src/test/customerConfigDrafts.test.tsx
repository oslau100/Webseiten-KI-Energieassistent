import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { LANGUAGES } from "@/lib/i18n";
import { customerConfigReadiness, customerRuntimeBindings, customerPublicAssetOrigin } from "@/lib/customerRuntime";
import type { WebsiteConfig } from "@/lib/websiteConfig";
import { getByPath } from "@/lib/websiteContentResolver";

type AssetEntry = { role: string; configFields: string[]; plannedObjectPath: string; plannedReference: string; source: string; sourceSha256: string; mimeType: string; width: number; height: number; bytes: number; publicUrl: null; deliveryVerified: boolean; preserveOriginalBytes: boolean; approvedMarketingLabels: string[] };
type CustomerPlan = { brand: string; locationId: string; hostname: string; assets: AssetEntry[] };
const read = (file: string) => JSON.parse(readFileSync(`docs/t08/${file}`, "utf8"));
const manifest = read("asset-manifest.json") as { customers: CustomerPlan[] };
const slugs = ["oecher-strom", "tarivia"];
const drafts = slugs.map(slug => ({ content: read(`${slug}/content.json`), design: read(`${slug}/design.json`), layout: read(`${slug}/layout.json`) } as WebsiteConfig));
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
function setPath(config: WebsiteConfig, path: string, value: unknown) {
  const parts = path.split(".");
  const key = parts.pop()!;
  const parent = getByPath(config, parts.join(".")) as Record<string, unknown>;
  parent[key] = value;
}
// Fixture-only approval and delivery. Never modifies the saved drafts or calls Storage.
function readyFixture(index: number) {
  const config = clone(drafts[index]);
  setPath(config, "content.legal.ready", true);
  setPath(config, "content.legal.variables.email", "legal-fixture@example.test");
  for (const entry of manifest.customers[index].assets) {
    for (const field of entry.configFields) setPath(config, field, `${customerPublicAssetOrigin}/storage/v1/object/public/website-assets/${entry.plannedObjectPath}`);
  }
  return config;
}
function mount(index: number, config: WebsiteConfig, rowLocation = manifest.customers[index].locationId, path = "/?lang=de") {
  const { locationId } = manifest.customers[index];
  vi.stubEnv("VITE_LOCATION_ID", locationId);
  vi.stubEnv("DEV", true);
  window.TB_BOOTSTRAP = { locationId, supabaseUrl: "https://config.example.test", supabaseKey: "sb_publishable_fixture" };
  history.replaceState({}, "", path);
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{ location_id: rowLocation,
    webseite_content_config: config.content, webseite_design_config: config.design, webseite_layout_config: config.layout }])));
  return { ...render(<App />), fetcher };
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); delete window.TB_BOOTSTRAP; localStorage.clear(); history.replaceState({}, "", "/"); });

describe.each([0, 1])("operator draft %i", index => {
  const plan = manifest.customers[index];
  const other = manifest.customers[1 - index];
  it("maps the exact runtime identity, palette and every planned asset field", () => {
    expect({ locationId: plan.locationId, hostname: plan.hostname }).toEqual(customerRuntimeBindings[index]);
    expect(drafts[index].content.brand).toMatchObject({ name: plan.brand, contact_email: "info@beconnected-aachen.de" });
    expect(drafts[index].design.colors).toMatchObject(index === 0 ? { primary: "#FFBD59", cta: "#E7AC24" } : { primary: "#102A43", accent: "#38E8A0", white: "#FFFFFF" });
    expect(plan.assets.map(asset => asset.role)).toEqual(["logo", "hero_angled", "section_straight", "about"]);
    for (const asset of plan.assets) {
      const bytes = readFileSync(asset.source);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(asset.sourceSha256);
      expect(bytes.length).toBe(asset.bytes);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
      expect(asset.mimeType).toMatch(/^image\/(png|jpeg|webp)$/);
      expect(asset.plannedObjectPath).toMatch(new RegExp(`^locations/${plan.locationId}/t08/v1/`));
      expect(asset).toMatchObject({ publicUrl: null, deliveryVerified: false, preserveOriginalBytes: true });
      for (const field of asset.configFields) expect(getByPath(drafts[index], field)).toBe(asset.plannedReference);
      if (["hero_angled", "section_straight"].includes(asset.role)) expect(asset.approvedMarketingLabels).toEqual(["177 Tarife", "477 EUR"]);
    }
    expect(getByPath(drafts[index], "design.assets.hero_image")).toContain("hero-angled.jpeg");
    expect(getByPath(drafts[index], "content.sections.solution.image_url")).toContain("section-straight.jpeg");
    expect(getByPath(drafts[index], "content.pages.datenschutz.html")).toMatch(/14 Aktualität/);
    expect(JSON.stringify(drafts[index])).not.toContain(other.locationId);
    expect(drafts[index].layout).toEqual(drafts[1 - index].layout);
  });
  it("keeps unapproved legal HTML and planned references NOT_READY", async () => {
    expect(customerConfigReadiness(drafts[index], plan.locationId)).toBe("LEGAL_NOT_READY");
    const { container, fetcher } = mount(index, drafts[index], plan.locationId, "/impressum?lang=de");
    await waitFor(() => expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "false"));
    expect(screen.getByRole("status")).toHaveAttribute("data-reason", "LEGAL_NOT_READY");
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).not.toContain("ENTWURF");
    expect(fetcher).toHaveBeenCalledOnce();
  });
  it("cannot become ready by legal approval alone", () => {
    const config = clone(drafts[index]);
    setPath(config, "content.legal.ready", true);
    setPath(config, "content.legal.variables.email", "legal-fixture@example.test");
    expect(customerConfigReadiness(config, plan.locationId)).toBe("ASSETS_NOT_READY");
  });
  it("uses operator review legal overrides without asserting legacy infrastructure", () => {
    expect(getByPath(drafts[index], "content.legal.ready")).toBe(false);
    expect(getByPath(drafts[index], "content.legal.variables.firma")).toBe("BeConnected");
    expect(getByPath(drafts[index], "content.legal.variables.email")).toBe("info@beconnected-aachen.de");
    for (const page of ["impressum", "datenschutz"]) {
      const html = getByPath(drafts[index], `content.pages.${page}.html`) as string;
      expect(html).toContain("ENTWURF");
      expect(html).toContain("BeConnected");
      for (const known of ["Einzelunternehmen", "Andy Khelifa", "Heidchenweg 13", "52080 Aachen", "0241 47595243", "info@beconnected-aachen.de", "253125657"]) expect(html).toContain(known);
      expect(html).not.toContain("[zur Prüfung ergänzen]");
      expect(html).not.toMatch(/WordPress|Elementor|Mailgun|eigenen Server|ec\.europa\.eu\/consumers\/odr/i);
    }
  });
  it("renders only its supplied copy and fixture assets after fixture approval", async () => {
    const config = readyFixture(index);
    expect(customerConfigReadiness(config, plan.locationId)).toBe("READY");
    const { container, fetcher } = mount(index, config);
    expect(await screen.findByRole("heading", { name: getByPath(config, "content.sections.hero.headline.de") as string })).toBeInTheDocument();
    const imageSources = Array.from(container.querySelectorAll("img"), image => image.getAttribute("src"));
    for (const asset of plan.assets) expect(imageSources.some(src => src?.endsWith(asset.plannedObjectPath))).toBe(true);
    expect(imageSources.every(src => src?.includes(`/locations/${plan.locationId}/`) || LANGUAGES.some(language => language.flagUrl === src))).toBe(true);
    expect(container.textContent).not.toContain(other.brand);
    expect(screen.getByAltText(getByPath(config, "content.sections.hero.image_alt") as string)).toHaveAttribute("src", `${customerPublicAssetOrigin}/storage/v1/object/public/website-assets/locations/${plan.locationId}/t08/v1/hero-angled.jpeg`);
    expect(screen.getByAltText(getByPath(config, "content.sections.solution.image_alt") as string)).toHaveAttribute("src", `${customerPublicAssetOrigin}/storage/v1/object/public/website-assets/locations/${plan.locationId}/t08/v1/section-straight.jpeg`);
    expect(container.textContent).not.toMatch(/1\.500|1500|600000|Manfred|Marvin|Ehiogie/);
    expect(container.textContent).toContain("Marketingbeispiel mit 177 Tarifen und 477 EUR");
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][0]).toContain(`location_id=eq.${plan.locationId}`);
    expect(screen.getByRole("link", { name: "Jahresabrechnung prüfen" })).toHaveAttribute("href", "/jahresrechnung?lang=de");
    expect(screen.getByRole("heading", { name: "Privatsphäre-Einstellungen" })).toBeInTheDocument();
  });
  it("retains translated system navigation alongside German brand copy", async () => {
    mount(index, readyFixture(index), plan.locationId, "/?lang=en");
    expect(await screen.findByRole("heading", { name: getByPath(drafts[index], "content.sections.hero.headline.de") as string })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Check annual energy bill" })).toHaveAttribute("href", "/jahresrechnung?lang=en");
  });
  it("consumes annual draft copy without fixture calculation results", async () => {
    const { container } = mount(index, readyFixture(index), plan.locationId, "/jahresrechnung?lang=de");
    expect(await screen.findByRole("heading", { name: getByPath(drafts[index], "content.i18n.annual_hero_h1.de") as string })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sind die Werte in der Smartphone-Grafik verbindlich?" }));
    expect(container.textContent).toContain("statischer Marketinginhalt und kein persönliches Berechnungsergebnis");
    expect(container.textContent).not.toMatch(/1500|1\.500|Manfred|Marvin|Ehiogie/);
    expect(container.querySelector("iframe")).toBeNull();
  });
  it("rejects another customer's row rather than falling back to its assets", async () => {
    const { container } = mount(index, readyFixture(1 - index), other.locationId);
    await waitFor(() => expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "false"));
    expect(screen.getByRole("status")).toHaveAttribute("data-reason", "CONFIG_NOT_READY");
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).not.toContain(other.brand);
  });
  it.each(["design.assets.logo_header", "design.assets.logo_footer", "design.assets.hero_image", "content.sections.solution.image_url", "content.sections.about.image_url"])("rejects foreign Location references at %s", field => {
    const config = readyFixture(index);
    for (const foreign of [other.locationId, "unrecognized-location"]) {
      setPath(config, field, `/locations/${foreign}/t08/v1/image.png`);
      expect(customerConfigReadiness(config, plan.locationId)).toBe("ASSETS_NOT_READY");
    }
  });
  it("withholds all consumers for a foreign optional About asset", async () => {
    const config = readyFixture(index);
    setPath(config, "content.sections.about.image_url", getByPath(readyFixture(1 - index), "content.sections.about.image_url"));
    const { container } = mount(index, config);
    await waitFor(() => expect(screen.getByRole("status")).toHaveAttribute("data-reason", "ASSETS_NOT_READY"));
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
  });
  it.each(["design.assets.hero_image", "content.sections.solution.image_url", "content.sections.about.image_url", "design.assets.agency_logo", "content.seo.image_url"])("blocks external HTTPS at %s even with its own Location path", async field => {
    const config = readyFixture(index);
    setPath(config, field, `https://untrusted.example.test/storage/v1/object/public/website-assets/locations/${plan.locationId}/t08/v1/image.png`);
    const { container, fetcher } = mount(index, config);
    await waitFor(() => expect(screen.getByRole("status")).toHaveAttribute("data-reason", "ASSETS_NOT_READY"));
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(fetcher).toHaveBeenCalledOnce(); // No asset GET is mistaken for verification.
  });
  it("rejects encoded foreign namespaces and localized unsafe optional images", () => {
    const config = readyFixture(index);
    setPath(config, "design.assets.hero_image", `/locations%2F${other.locationId}/hero.png`);
    expect(customerConfigReadiness(config, plan.locationId)).toBe("ASSETS_NOT_READY");
    setPath(config, "design.assets.hero_image", `/locations/${plan.locationId}/hero.png`);
    setPath(config, "content.sections.about.image_url", { de: `/locations/${plan.locationId}/about.png`, en: "javascript:alert(1)" });
    expect(customerConfigReadiness(config, plan.locationId)).toBe("ASSETS_NOT_READY");
  });
  it.each(["content", "design", "layout"] as const)("keeps missing %s NOT_READY", bucket => {
    expect(customerConfigReadiness({ ...readyFixture(index), [bucket]: {} }, plan.locationId)).toBe("CONFIG_NOT_READY");
  });
  it.each(["logo_header", "logo_footer", "hero_image"])("keeps missing %s NOT_READY", key => {
    const config = readyFixture(index);
    setPath(config, `design.assets.${key}`, "");
    expect(customerConfigReadiness(config, plan.locationId)).toBe("ASSETS_NOT_READY");
  });
});
