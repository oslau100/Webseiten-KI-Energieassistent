import { render,screen,waitFor } from "@testing-library/react";
import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
import App from "@/App";
import { readFileSync } from "node:fs";
const key=`eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({role:"anon"})).replace(/=/g,"")}.signature`;
beforeEach(()=>{vi.stubGlobal("scrollTo",vi.fn());vi.spyOn(console,"error").mockImplementation(()=>{});});
afterEach(()=>{vi.restoreAllMocks();vi.unstubAllEnvs();});
describe("booking routing and legacy removal",()=>{
 it("renders only the new callback page route",async()=>{vi.stubEnv("VITE_SUPABASE_ANON_KEY",key);vi.spyOn(globalThis,"fetch").mockImplementation(url=>Promise.resolve(new Response(String(url).includes("/rest/v1/")?"[]":JSON.stringify({calendar_name:"Rückruf buchen",calendar_slug:"rueckruf-buchen",timezone:"Europe/Berlin",duration_minutes:15,dates:[]}),{status:200})));history.replaceState({},"","/rueckruf-buchen?lang=de");render(<App/>);expect(await screen.findByRole("heading",{name:"Rückruf buchen",level:1})).toBeVisible();expect(screen.getByRole("link",{name:"Rückruf buchen"})).toHaveAttribute("href","/rueckruf-buchen?lang=de");});
 it("lets the removed route reach NotFound without redirect",async()=>{history.replaceState({},"",`/rueckruf-${"anfordern"}?lang=de`);render(<App/>);await waitFor(()=>expect(window.location.pathname).toBe(`/rueckruf-${"anfordern"}`));expect(screen.getByText("404")).toBeVisible();});
 it("contains no legacy integration strings in website sources",()=>{for(const file of ["src/App.tsx","src/components/Footer.tsx","src/pages/RueckrufBuchen.tsx"])for(const marker of ["link."+"msgsndr","lead"+"connectorhq","z0PrnWWb"+"t0PdC4ug1Gcw"])expect(readFileSync(file,"utf8")).not.toContain(marker);});
});
