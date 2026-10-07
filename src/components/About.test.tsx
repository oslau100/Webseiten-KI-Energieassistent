import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveArray, resolveLocalizedText } from "@/lib/websiteContentResolver";
import type { JsonRecord } from "@/lib/websiteContentResolver";

let override: JsonRecord = {};
let lang = "de";
vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ lang }) }));
vi.mock("@/lib/websiteConfig", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/websiteConfig")>();
  return { ...actual, useWebsiteConfig: () => {
    const { content } = actual.resolveWebsiteConfig({ content: { sections: { about: override } } });
    return {
      getText: (path: string, fallback: string, language?: string) => resolveLocalizedText(content, path, fallback, language),
      getArray: <T,>(path: string, fallback: T[]) => resolveArray(content, path, fallback),
    };
  } };
});
import { About } from "./About";
afterEach(() => { override = {}; lang = "de"; });

describe("shared About section", () => {
  it("defaults to neutral company content without a portrait or personal biography", () => {
    const { container } = render(<About />);
    expect(container.querySelector("section")).toHaveAttribute("data-about-mode", "company");
    expect(screen.getByRole("heading", { name: "Energieassistent" })).toBeInTheDocument();
    expect(container.querySelectorAll("img, a")).toHaveLength(0);
    expect(container.textContent).not.toMatch(/Marvin|Ehiogie|Ich habe|Mein Ziel|In meiner Arbeit/);
  });
  it("renders configured company title, logo, role and localized paragraphs", () => {
    lang = "en";
    override = { mode: "company", headline: { en: "About the company" }, name: "Example company", image_url: "/logo.svg", image_alt: "Company logo", role: "Energy team", paragraphs: [{ de: "Deutsch", en: "Company content" }, "Second paragraph"] };
    render(<About />);
    expect(screen.getByRole("heading", { name: "About the company" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Company logo" })).toHaveAttribute("src", "/logo.svg");
    expect(screen.getByText("Energy team")).toBeInTheDocument();
    expect(screen.getByText("Company content")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph")).toBeInTheDocument();
  });
  it("retains legacy person fields without a migration", () => {
    override = { person_name: "Example person", avatar_url: "/portrait.svg", role: "Advisor", paragraph_1: "Configured biography" };
    const { container } = render(<About />);
    expect(container.querySelector("section")).toHaveAttribute("data-about-mode", "person");
    expect(screen.getByRole("heading", { name: "Example person" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Example person" })).toHaveAttribute("src", "/portrait.svg");
    expect(screen.getByText("Configured biography")).toBeInTheDocument();
  });
  it("renders no section in hidden mode", () => {
    override = { mode: "hidden" };
    expect(render(<About />).container).toBeEmptyDOMElement();
  });
  it("omits empty, dead or unsafe socials and their hint, and preserves valid links", () => {
    override = { social: { youtube: "", tiktok: "#", instagram: "javascript:alert(1)", facebook: "  " }, social_hint: "Social hint" };
    const { unmount } = render(<About />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.queryByText("Social hint")).not.toBeInTheDocument();
    unmount();
    override = { social: { youtube: "https://www.youtube.com/@example" }, social_hint: "Social hint" };
    render(<About />);
    expect(screen.getByRole("link", { name: "YouTube" })).toHaveAttribute("href", "https://www.youtube.com/@example");
    expect(screen.getByText("Social hint")).toBeInTheDocument();
  });
});
