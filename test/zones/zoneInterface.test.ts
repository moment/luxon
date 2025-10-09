import { test, expect, describe } from "vitest";
import { DateTime, FixedOffsetZone, IANAZone, SystemZone, Zone } from "../../src/luxon.ts";

test("You can instantiate Zone directly", () => {
  expect(() => new Zone().isValid).toThrow();
});

describe("Zone.isZone", () => {
  class CustomZone extends Zone {
  }

  test.each([
    [() => IANAZone.create("Europe/Berlin"), "IANAZone"],
    [() => FixedOffsetZone.instance(5), "FixedOffsetZone"],
    [() => FixedOffsetZone.utcInstance, "FixedOffsetZone.utcInstance"],
    [() => SystemZone.instance, "SystemZone"],
    [() => new CustomZone(), "CustomZone"],
  ])("Should return true for $1", (value) => {
    expect(Zone.isZone(value())).toBe(true);
  });
  test.for([
    "asdf", "Europe/Berlin", "UTC", "GMT",
    0, 0.5, NaN,
    null, undefined,
    {},
    {
      name: "Europe/Berlin",
      ianaName: "Europe/Berlin",
    },
    true, false,
    [[0]], new Date(0), () => {}, Zone,
    DateTime.fromMillis(0),
  ])("Should return false for $0", (value) => {
    expect(Zone.isZone(value)).toBe(false);
  });
  test.each([
    [new Date(0), "plain  dates"],
    [() => {}, "functions"],
    [Zone, "The Zone class"],
    [DateTime.fromMillis(0), "Other luxon classes"],
  ])("Should return false for $1", (value, _) => {
    expect(Zone.isZone(value)).toBe(false);
  });
});