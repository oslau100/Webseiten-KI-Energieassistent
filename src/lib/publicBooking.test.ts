import { afterEach, describe, expect, it, vi } from "vitest";
import { availabilityRange, bookingRequest, isLegacyAnonJwt, readUtm, resolveBookingRuntime, normalizePhone } from "./publicBooking";
const jwt=()=>`eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify({role:"anon"})).replace(/=/g,"")}.signature`;
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();delete (window as Window & {TB_BOOTSTRAP?:unknown}).TB_BOOTSTRAP;history.replaceState({},"","/");});
describe("booking runtime and client",()=>{
 it("recognizes only legacy anon JWTs",()=>{expect(isLegacyAnonJwt(jwt())).toBe(true);expect(isLegacyAnonJwt("sb_publishable_value")).toBe(false);});
 it("resolves query URL and prefers the environment anon JWT",()=>{vi.stubEnv("VITE_SUPABASE_ANON_KEY",jwt());history.replaceState({},"","/?supabase_url=https://query.test");expect(resolveBookingRuntime().endpoint).toBe("https://query.test/functions/v1/booking-proxy");});
 it("sends the JWT as apikey and bearer",async()=>{const key=jwt();vi.stubEnv("VITE_SUPABASE_ANON_KEY",key);const fetchMock=vi.spyOn(globalThis,"fetch").mockResolvedValue(new Response(JSON.stringify({ok:true}),{status:200}));await bookingRequest({action:"availability"});expect(fetchMock.mock.calls[0][1]).toMatchObject({headers:{apikey:key,Authorization:`Bearer ${key}`}});});
 it("does not call with a publishable key or reveal it",async()=>{vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY","sb_publishable_secret");const fetchMock=vi.spyOn(globalThis,"fetch");expect(()=>resolveBookingRuntime()).toThrow("nicht korrekt konfiguriert");expect(fetchMock).not.toHaveBeenCalled();try{resolveBookingRuntime();}catch(e){expect(String(e)).not.toContain("sb_publishable_secret");}});
 it("filters bounded UTM strings",()=>expect(readUtm("?utm_source=mail&bad=x&utm_%24=no")).toEqual({utm_source:"mail"}));
 it("limits availability to today plus 30 days",()=>expect(availabilityRange(new Date("2026-07-27T12:00:00Z"))).toEqual({start:"2026-07-27",end:"2026-08-26"}));
});

describe("phone normalization",()=>{
 it.each([["123456",null],["1234567","1234567"],["123456789012345","123456789012345"],["1234567890123456",null],["+49 123 456 789","+49123456789"],["(030) 123-4567","0301234567"],["123ABC4567",null],["12+3456789",null]])("normalizes %s",(input,expected)=>expect(normalizePhone(input)).toBe(expected));
});
