import { describe,expect,it } from "vitest";
import { zonedLocalToIso } from "./publicBookingTimezone";
describe("public booking timezone",()=>{
 it("converts winter time",()=>expect(zonedLocalToIso("2026-01-15","10:30")).toBe("2026-01-15T09:30:00.000Z"));
 it("converts summer time independently of the device zone",()=>expect(zonedLocalToIso("2026-07-15","10:30")).toBe("2026-07-15T08:30:00.000Z"));
 it("handles the valid side of the spring transition",()=>expect(zonedLocalToIso("2026-03-29","01:30")).toBe("2026-03-29T00:30:00.000Z"));
 it("rejects a nonexistent spring time",()=>expect(()=>zonedLocalToIso("2026-03-29","02:30")).toThrow("NONEXISTENT_LOCAL_TIME"));
 it("chooses the earlier instant during the autumn overlap",()=>expect(zonedLocalToIso("2026-10-25","02:30")).toBe("2026-10-25T00:30:00.000Z"));
 it("accepts explicit zero seconds and roundtrips",()=>expect(zonedLocalToIso("2026-08-04","14:05:00")).toBe("2026-08-04T12:05:00.000Z"));
 it("rejects non-zero seconds instead of truncating",()=>expect(()=>zonedLocalToIso("2026-08-04","14:05:59")).toThrow("INVALID_LOCAL_TIME"));
});
