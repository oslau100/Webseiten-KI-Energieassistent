import { describe, expect, it } from "vitest";
import { zonedLocalToIso } from "./publicBookingTimezone";
describe("public booking timezone",()=>{
 it("converts winter and summer independently of the device timezone",()=>{expect(zonedLocalToIso("2026-01-15","10:30")).toBe("2026-01-15T09:30:00.000Z");expect(zonedLocalToIso("2026-07-15","10:30")).toBe("2026-07-15T08:30:00.000Z");});
 it("handles both DST transition days",()=>{expect(zonedLocalToIso("2026-03-29","01:30")).toBe("2026-03-29T00:30:00.000Z");expect(zonedLocalToIso("2026-10-25","02:30")).toBe("2026-10-25T00:30:00.000Z");});
 it("rejects a nonexistent spring time",()=>expect(()=>zonedLocalToIso("2026-03-29","02:30")).toThrow("NONEXISTENT_LOCAL_TIME"));
 it("roundtrips with exact zero seconds",()=>expect(zonedLocalToIso("2026-08-04","14:05:59")).toMatch(/12:05:00\.000Z$/));
});
