/* global test expect */

import { Info, FixedOffsetZone, IANAZone, SystemZone, Settings } from "../../src/luxon";
import { InvalidZoneError } from "../../src/errors";

const Helpers = require("../helpers");

//------
// .hasDST()
//------

test("Info.hasDST returns true for America/New_York", () => {
  expect(Info.hasDST("America/New_York")).toBe(true);
});

test("Info.hasDST returns false for America/Aruba", () => {
  expect(Info.hasDST("America/Aruba")).toBe(false);
});

test("Info.hasDST returns false for America/Cancun", () => {
  expect(Info.hasDST("America/Cancun")).toBe(false);
});

test("Info.hasDST returns true for Europe/Andorra", () => {
  expect(Info.hasDST("Europe/Andorra")).toBe(true);
});

test("Info.hasDST uses the default zone when none is specified", () => {
  Helpers.withDefaultZone("America/Cancun", () => {
    expect(Info.hasDST()).toBe(false);
  });
  Helpers.withDefaultZone("America/New_York", () => {
    expect(Info.hasDST()).toBe(true);
  });
});

//------
// .isValidIANAZone()
//------

test("Info.isValidIANAZone returns true for valid zones", () => {
  expect(Info.isValidIANAZone("America/Cancun")).toBe(true);
});

test("Info.isValidIANAZone returns true for single-section zones", () => {
  expect(Info.isValidIANAZone("UTC")).toBe(true);
});

test("Info.isValidIANAZone returns false for junk", () => {
  expect(Info.isValidIANAZone("blorp")).toBe(false);
});

test("Info.isValidIANAZone returns false for well-specified but invalid zones", () => {
  expect(Info.isValidIANAZone("America/Blork")).toBe(false);
});

test("Info.isValidIANAZone returns true for valid zones like America/Indiana/Indianapolis", () => {
  expect(Info.isValidIANAZone("America/Indiana/Indianapolis")).toBe(true);
});

test("Info.isValidIANAZone returns false for well-specified but invalid zones like America/Indiana/Blork", () => {
  expect(Info.isValidIANAZone("America/Indiana/Blork")).toBe(false);
});

//------
// .normalizeZone()
//------

test("Info.normalizeZone returns Zone objects unchanged", () => {
  const fixedOffsetZone = FixedOffsetZone.instance(5);
  expect(Info.normalizeZone(fixedOffsetZone)).toBe(fixedOffsetZone);

  const ianaZone = new IANAZone("Europe/Paris");
  expect(Info.normalizeZone(ianaZone)).toBe(ianaZone);

  const sysZone = SystemZone.instance;
  expect(Info.normalizeZone(sysZone)).toBe(sysZone);
});

test.each([
  ["SYSTEM", SystemZone.instance],
  ["Default", SystemZone.instance],
  ["UTC", FixedOffsetZone.utcInstance],
  ["Etc/GMT+5", FixedOffsetZone.instance(-5 * 60)],
  ["Etc/GMT-10", FixedOffsetZone.instance(+10 * 60)],
  ["Europe/Paris", new IANAZone("Europe/Paris")],
  [0, FixedOffsetZone.utcInstance],
  [3, FixedOffsetZone.instance(3)],
  [-11, FixedOffsetZone.instance(-11)]
])("Info.normalizeZone converts valid input %p into valid Zone instance", (input, expected) => {
  expect(Info.normalizeZone(input)).toEqual(expected);
});

test("Info.normalizeZone throws on an invalid zone format", () => {
  expect(() => Info.normalizeZone("%3132400012~")).toThrow(InvalidZoneError);
});

test("Info.normalizeZone converts null and undefined to default Zone", () => {
  Helpers.withDefaultZone("Asia/Tokyo", () => {
    expect(Info.normalizeZone(null)).toBe(Settings.defaultZone);
    expect(Info.normalizeZone(undefined)).toBe(Settings.defaultZone);
  });
});

test("Info.normalizeZone converts 'default' to default Zone", () => {
  expect(Info.normalizeZone("default")).toBe(Settings.defaultZone);
  Helpers.withDefaultZone("Europe/Paris", () => {
    expect(Info.normalizeZone("default").name).toBe("Europe/Paris");
  });
});
