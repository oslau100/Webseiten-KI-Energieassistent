import { PageChrome } from "@/components/PageChrome";
import { readFileSync } from "node:fs";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/Header";
import { I18nProvider } from "@/lib/i18n";
import { SectionLayout } from "@/components/SectionLayout";
import { Stats } from "@/components/Stats";
import { Testimonials } from "@/components/Testimonials";
import { MarketingLink } from "@/components/MarketingLink";
import { parseLegalHtml } from "@/lib/legalHtml";
import { websiteSections } from "@/lib/websiteSections";
import { hexToHsl, contrast, websiteThemeTokens } from "@/lib/websiteTheme";
import { resolveLocalizedText } from "@/lib/websiteContentResolver";

const state = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
vi.mock("@/lib/websiteConfig", () => ({ useWebsiteConfig: () => state.value }));
const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter><I18nProvider>{children}</I18nProvider></MemoryRouter>;
function configure() {
  state.value = { customerRuntime:true, design:{assets:{}}, layout:{pages:{home:{sections:["last","first"]}}},
    content:{availability:{translation_pending:{de:"pending",ar:"قيد الإعداد"}}},
    getText:(path:string, fallback:string, lang = "de") => path === "availability.unavailable" ? "Unavailable" : path === "availability.contact" ? "Contact" : path === "brand.contact_email" ? "owner@example.test" : path === "header.language_switch_sr" ? "Choose language" : path === "availability.translation_pending" ? (lang === "ar" ? "قيد الإعداد" : "pending") : fallback,
    getArray:()=>[],
  };
}
afterEach(() => { vi.restoreAllMocks(); localStorage.clear(); document.documentElement.dir="ltr"; });
describe("T08 remediation", () => {
 it("honors ordering, visibility, duplicates, unknown identifiers and empty layouts", () => {
  expect(websiteSections({pages:{home:{sections:["b",{id:"a",visible:false},"b","untrusted"]}}},"home",["a","b"],true)).toEqual(["b"]);
  expect(websiteSections({},"annual",["hero"],true)).toEqual([]);
  expect(websiteSections({},"annual",["hero"],false)).toEqual(["hero"]);
 });
 it("hides explicitly omitted navigation chrome and keeps allowed body order", () => {
  configure();
  const {container}=render(<><PageChrome page="home" id="header"><header>Hidden</header></PageChrome><SectionLayout page="home" ids={["first","last"]}><p>First</p><p>Last</p></SectionLayout></>,{wrapper});
  expect(container.querySelector("header")).toBeNull();
  expect(Array.from(container.querySelectorAll("p"),p=>p.textContent)).toEqual(["Last","First"]);
 });
 it("keeps null children at their registry position", () => {
  configure();
  render(<SectionLayout page="home" ids={["first","last"]}>{null}<p>Last section</p></SectionLayout>,{wrapper});
  expect(screen.getByText("Last section")).toBeInTheDocument();
 });
 it("omits empty testimonials and statistics", () => {
  configure(); const {container}=render(<><Testimonials/><Stats/></>,{wrapper});
  expect(container.querySelector("section")).toBeNull();
  expect(container.querySelector("button")).toBeNull();
 });
 it("keeps blocked CTA non-navigable without public status or contact", () => {
  configure();render(<MarketingLink to="/start?lang=de">Check now</MarketingLink>,{wrapper});
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByRole("link",{name:"Contact"})).toBeNull();
  expect(screen.queryByRole("link",{name:"Check now"})).toBeNull();
 });
 it("opens the language menu, selects Arabic and updates direction without a document reload", async () => {
  configure();render(<Header/>,{wrapper});
  fireEvent.keyDown(screen.getByRole("button",{name:/Choose language/}),{key:"ArrowDown"});
  const arabic=await screen.findByRole("menuitem",{name:/العربية/});
  fireEvent.click(arabic);
  await waitFor(()=>expect(document.documentElement.dir).toBe("rtl"));
  expect(document.documentElement.lang).toBe("ar");expect(localStorage.getItem("site_lang")).toBe("ar");
 });
 it("keeps legal formatting and rejects unsafe HTML, attributes and URLs", () => {
  configure();
  const {container}=render(<div className="prose">{parseLegalHtml('<h1>Title</h1><h2>Details</h2><p>Body</p><ul><li>Item</li></ul><table><tbody><tr><td>Value</td></tr></tbody></table><a href="https://example.test/">Safe</a>')}</div>);
  expect(container.querySelectorAll("h1,h2,p,li,td,a")).toHaveLength(6);
  for(const html of ['<script>bad()</script>','<p onclick="bad()">Bad</p>','<a href="javascript:bad()">Bad</a>'])expect(parseLegalHtml(html)).toBeNull();
 });
 it("never resolves another language when customer translation is absent", () => {
  expect(resolveLocalizedText({title:{de:"Deutsch"}},"title","Missing","ar",false)).toBe("Missing");
 });
 it.each(["oecher-strom","tarivia"])("maps %s palette and legible text from validated hex", slug => {
  const design=JSON.parse(readFileSync(`docs/t08/${slug}/design.json`,"utf8"));
  const tokens=websiteThemeTokens(design);
  expect(tokens["--primary"]).toBe(hexToHsl(design.colors.primary));
  expect(tokens["--cta"]).toBe(hexToHsl(design.colors.cta));
  const primaryText=tokens["--primary-foreground"]===hexToHsl("#000000")?"#000000":"#FFFFFF";
  expect(contrast(primaryText,design.colors.primary)).toBeGreaterThanOrEqual(4.5);
  expect(websiteThemeTokens({colors:{primary:"url(evil)"}})).toEqual({});
 });
});
