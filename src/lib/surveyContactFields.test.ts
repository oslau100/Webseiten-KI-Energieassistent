import { describe,expect,it } from "vitest";
import { isValidSurveyEmail,isValidSurveyPhone,normalizeGermanSurveyPhone,normalizeSurveyEmail,SURVEY_EMAIL_PATTERN } from "./surveyContactFields";

describe("shared survey contact rules",()=>{
 it.each(["","plain-address","name@localhost","name @example.de"])('rejects invalid survey email %j',value=>expect(isValidSurveyEmail(value)).toBe(false));
 it("accepts and trims email exactly like the survey submit path",()=>{expect(SURVEY_EMAIL_PATTERN.test("ada@example.de")).toBe(true);expect(isValidSurveyEmail("  ada@example.de  ")).toBe(true);expect(normalizeSurveyEmail("  ada@example.de  ")).toBe("ada@example.de");});
 it.each([
  ["0151 234-56789","+4915123456789"],
  ["+49 151 234 56789","+4915123456789"],
  ["0049 (151) 234/56789","+4915123456789"],
 ])("normalizes German survey phone %s without duplicating the prefix",(value,expected)=>expect(normalizeGermanSurveyPhone(value)).toBe(expected));
 it.each(["12","1111111","1234567","phone"])('rejects invalid survey phone %j',value=>expect(normalizeGermanSurveyPhone(value)).toBeNull());
 it("uses the Rechnung survey validation constraints",()=>{expect(isValidSurveyPhone("0151 234-56789")).toBe(true);expect(isValidSurveyPhone("1111111")).toBe(false);});
});
