/* global test expect */

import {
  Info,
  FixedOffsetZone,
  IANAZone,
  InvalidZone,
  SystemZone,
  Settings,
} from "../../src/luxon";
import { INVALID_ZONE_NAME, InvalidZoneError } from "../../src/errors";

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

test("Info.hasDST returns true for Europe/Andora", () => {
  expect(Info.hasDST("Europe/Andora")).toBe(true);
});

test("Info.hasDST defaults to the global zone", () => {
  Helpers.withDefaultZone("America/Cancun", () => {
    expect(Info.hasDST()).toBe(false);
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

  const invalidZone = new InvalidZone("bumblebee");
  expect(Info.normalizeZone(invalidZone)).toBe(invalidZone);

  const systemZone = SystemZone.instance;
  expect(Info.normalizeZone(systemZone)).toBe(systemZone);
});

test.each([
  ["Local", SystemZone.instance],
  ["System", SystemZone.instance],
  ["UTC", FixedOffsetZone.utcInstance],
  ["GMT", FixedOffsetZone.utcInstance],
  ["Etc/GMT+5", new IANAZone("Etc/GMT+5")],
  ["Etc/GMT-10", new IANAZone("Etc/GMT-10")],
  ["Europe/Paris", new IANAZone("Europe/Paris")],
  [0, FixedOffsetZone.utcInstance],
  [3, FixedOffsetZone.instance(3)],
  [-11, FixedOffsetZone.instance(-11)],
])("Info.normalizeZone converts valid input %p into valid Zone instance", (input, expected) => {
  expect(Info.normalizeZone(input)).toEqual(expected);
});

test("Info.normalizeZone converts unknown name to invalid Zone", () => {
  expect(() => Info.normalizeZone("bumblebee")).toThrowLuxonError(
    InvalidZoneError,
    INVALID_ZONE_NAME
  );
});

test("Info.normalizeZone converts null and undefined to default Zone", () => {
  expect(Info.normalizeZone(null)).toBe(Settings.defaultZone);
  expect(Info.normalizeZone(undefined)).toBe(Settings.defaultZone);
});

// Local zone no longer refers to default one but behaves as system
// As per Docker Container, zone is America/New_York
test("Info.normalizeZone converts local to system Zone", () => {
  expect(Info.normalizeZone("local")).toBe(Settings.defaultZone);
  Helpers.withDefaultZone("America/New_York", () => {
    expect(Info.normalizeZone("local").name).toBe("America/New_York");
  });
});
