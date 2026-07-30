import { describe,expect,it } from "vitest";
import { formatBookingDateTime } from "./publicBookingDateTime";

describe("formatBookingDateTime",()=>{
 it("uses natural localized appointment times",()=>{
  const value="2026-07-30T09:00:00Z";
  expect(formatBookingDateTime(value,"de","Europe/Berlin")).toContain("11:00 Uhr");
  expect(formatBookingDateTime(value,"nl","Europe/Berlin")).toContain("11:00 uur");
  expect(formatBookingDateTime(value,"hi","Europe/Berlin")).toMatch(/11:00.*बजे/);
  expect(formatBookingDateTime(value,"en","Europe/Berlin")).toMatch(/11:00\sAM/);
 });
});
