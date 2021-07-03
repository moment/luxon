/* global test expect */
import { FixedOffsetZone, IANAZone } from "../../src/luxon";

test("FixedOffsetZone.utcInstance returns a singleton", () => {
  expect(FixedOffsetZone.utcInstance).toBe(FixedOffsetZone.utcInstance);
});

test("FixedOffsetZone.utcInstance provides valid UTC data", () => {
  expect(FixedOffsetZone.utcInstance.type).toBe("fixed");
  expect(FixedOffsetZone.utcInstance.name).toBe("UTC");
  expect(FixedOffsetZone.utcInstance.offsetName()).toBe("UTC");
  expect(FixedOffsetZone.utcInstance.formatOffset(0, "short")).toBe("+00:00");
  expect(FixedOffsetZone.utcInstance.isUniversal).toBe(true);
  expect(FixedOffsetZone.utcInstance.offset()).toBe(0);
  expect(FixedOffsetZone.utcInstance.isValid).toBe(true);
});

test("FixedOffsetZone.parseSpecifier returns a valid instance from a UTC offset string", () => {
  let zone = FixedOffsetZone.parseSpecifier("UTC+6");
  expect(zone.isValid).toBe(true);
  expect(zone.offset()).toBe(360);
  expect(zone.name).toBe("UTC+6");

  zone = FixedOffsetZone.parseSpecifier("UTC+06");
  expect(zone.isValid).toBe(true);
  expect(zone.offset()).toBe(360);
  expect(zone.name).toBe("UTC+6");

  zone = FixedOffsetZone.parseSpecifier("UTC-6:00");
  expect(zone.isValid).toBe(true);
  expect(zone.offset()).toBe(-360);
  expect(zone.name).toBe("UTC-6");
});

test("FixedOffsetZone.parseSpecifier returns null for invalid data", () => {
  expect(FixedOffsetZone.parseSpecifier()).toBe(null);
  expect(FixedOffsetZone.parseSpecifier(null)).toBe(null);
  expect(FixedOffsetZone.parseSpecifier("")).toBe(null);
  expect(FixedOffsetZone.parseSpecifier("foo")).toBe(null);
  expect(FixedOffsetZone.parseSpecifier("UTC+blorp")).toBe(null);
});

test("FixedOffsetZone.formatOffset is consistent despite the provided timestamp", () => {
  // formatOffset accepts a timestamp to maintain the call signature of the abstract Zone class,
  // but because of the nature of a fixed offset zone instance, the TS is ignored.
  const zone = FixedOffsetZone.instance(-300);
  expect(zone.formatOffset(0, "techie")).toBe("-0500");

  // March 9th 2019. A day before DST started
  expect(zone.formatOffset(1552089600, "techie")).toBe("-0500");

  // March 11th 2019. A day after DST started
  expect(zone.formatOffset(1552280400, "techie")).toBe("-0500");
});

test("FixedOffsetZone.formatOffset prints the correct sign before the offset", () => {
  expect(FixedOffsetZone.instance(-300).formatOffset(0, "short")).toBe("-05:00");
  expect(FixedOffsetZone.instance(-30).formatOffset(0, "short")).toBe("-00:30");
  // Note the negative zero results in a + sign
  expect(FixedOffsetZone.instance(-0).formatOffset(0, "short")).toBe("+00:00");
  expect(FixedOffsetZone.instance(0).formatOffset(0, "short")).toBe("+00:00");
  expect(FixedOffsetZone.instance(30).formatOffset(0, "short")).toBe("+00:30");
  expect(FixedOffsetZone.instance(300).formatOffset(0, "short")).toBe("+05:00");
});

test("FixedOffsetZone.equals requires both zones to be fixed", () => {
  expect(FixedOffsetZone.utcInstance.equals(IANAZone.create("UTC"))).toBe(false);
});

test("FixedOffsetZone.equals compares fixed offset values", () => {
  expect(FixedOffsetZone.utcInstance.equals(FixedOffsetZone.instance(0))).toBe(true);
  expect(FixedOffsetZone.instance(60).equals(FixedOffsetZone.instance(-60))).toBe(false);
});
