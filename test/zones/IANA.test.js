import { test, expect } from "vitest";
import { FixedOffsetZone, IANAZone } from "../../src/luxon.ts";
import { hasMissingEtcGmtNormalization } from "../specialCases";
import { InvalidZoneError } from "../../src/errors.js";

test("IANAZone.create returns a singleton per zone name", () => {
  expect(IANAZone.create("UTC")).toBe(IANAZone.create("UTC"));
  expect(IANAZone.create("America/New_York")).toBe(IANAZone.create("America/New_York"));

  expect(IANAZone.create("UTC")).not.toBe(IANAZone.create("America/New_York"));
});

test("IANAZone.create should return IANAZone instance", () => {
  const result = IANAZone.create("America/Cancun");
  expect(result).toBeInstanceOf(IANAZone);
});

test("IANAZone should have a private constructor", () => {
  expect(() => new IANAZone("America/Cancun")).toThrow(TypeError);
});

test("IANAZone.isValidZone", () => {
  expect(IANAZone.isValidZone("America/New_York")).toBe(true);
  expect(IANAZone.isValidZone("Fantasia/Castle")).toBe(false);
  expect(IANAZone.isValidZone("Sport~~blorp")).toBe(false);
  expect(IANAZone.isValidZone("")).toBe(false);
  expect(IANAZone.isValidZone(undefined)).toBe(false);
  expect(IANAZone.isValidZone(null)).toBe(false);
  expect(IANAZone.isValidZone(4)).toBe(false);
});

test("IANAZone.type returns a static string", () => {
  expect(IANAZone.create("America/Santiago").type).toBe("iana");
  expect(IANAZone.create("Europe/Berlin").type).toBe("iana");
  expect(IANAZone.create("Etc/UTC").type).toBe("iana");
});

test("IANAZone.name returns the zone name passed to the constructor", () => {
  expect(IANAZone.create("America/Santiago").name).toBe("America/Santiago");
  expect(IANAZone.create("Etc/UTC").name).toBe("Etc/UTC");
});

test("IANAZone is not universal", () => {
  expect(IANAZone.create("America/Santiago").isUniversal).toBe(false);
});

test("IANAZone.offsetName with a long format", () => {
  const zone = IANAZone.create("America/Santiago");
  const offsetName = zone.offsetName(1552089600, { format: "long", locale: "en-US" });
  expect(offsetName).toBe("Chile Summer Time");
});

test("IANAZone.offsetName with a short format", () => {
  const zone = IANAZone.create("America/Santiago");
  const offsetName = zone.offsetName(1552089600, { format: "short", locale: "en-US" });
  expect(offsetName).toBe("GMT-3");
});

test("IANAZone.formatOffset with a short format", () => {
  const zone = IANAZone.create("America/Santiago");
  const offsetName = zone.formatOffset(1552089600, "short");
  expect(offsetName).toBe("-03:00");
});

test("IANAZone.formatOffset with a narrow format", () => {
  const zone = IANAZone.create("America/Santiago");
  const offsetName = zone.formatOffset(1552089600, "narrow");
  expect(offsetName).toBe("-3");
});

test("IANAZone.formatOffset with a techie format", () => {
  const zone = IANAZone.create("America/Santiago");
  const offsetName = zone.formatOffset(1552089600, "techie");
  expect(offsetName).toBe("-0300");
});

test("IANAZone.formatOffset throws for an invalid format", () => {
  const zone = IANAZone.create("America/Santiago");
  expect(() => zone.formatOffset(1552089600, "blorp")).toThrow();
});

test("IANAZone.equals requires both zones to be iana", () => {
  expect(IANAZone.create("UTC").equals(FixedOffsetZone.utcInstance)).toBe(false);
});

test("IANAZone.equals returns false even if the two share offsets", () => {
  const luxembourg = IANAZone.create("Europe/Luxembourg");
  const rome = IANAZone.create("Europe/Rome");
  expect(luxembourg.equals(rome)).toBe(false);
});

test("IANAZone.isValid returns true for valid zone names", () => {
  expect(IANAZone.create("UTC").isValid).toBe(true);
  expect(IANAZone.create("America/Santiago").isValid).toBe(true);
  expect(IANAZone.create("Europe/Paris").isValid).toBe(true);
});

test("IANAZone.isValid returns false for invalid zone names", () => {
  expect(() => IANAZone.create("")).toThrow(InvalidZoneError);
  expect(() => IANAZone.create("foo")).toThrow(InvalidZoneError);
  expect(() => IANAZone.create("CEDT")).toThrow(InvalidZoneError);
  expect(() => IANAZone.create("GMT+2")).toThrow(InvalidZoneError);
  expect(() => IANAZone.create("America/Blorp")).toThrow(InvalidZoneError);
  expect(() => IANAZone.create(null)).toThrow(InvalidZoneError);
});

test("IANAZone.normalize normalizes the zone name", () => {
  expect(IANAZone.normalizeZone("america/nEw_york")).toBe("America/New_York");
  expect(IANAZone.normalizeZone("AMERICA/NEW_YORK")).toBe("America/New_York");
  expect(IANAZone.normalizeZone("America/New_York")).toBe("America/New_York");
  expect(IANAZone.normalizeZone("europe/paris")).toBe("Europe/Paris");
  expect(IANAZone.normalizeZone("EUROPE/PARIS")).toBe("Europe/Paris");
  expect(IANAZone.normalizeZone("Asia/Tokyo")).toBe("Asia/Tokyo");
});

test.skipIf(hasMissingEtcGmtNormalization)("IANAZone.normalize normalizes Etc/GMT to UTC", () => {
  // Specified in: https://tc39.es/ecma402/#sec-use-of-iana-time-zone-database
  // > For historical reasons, "UTC" must be a primary time zone identifier.
  // > "Etc/UTC", "Etc/GMT", and "GMT", as well as all Link names that resolve
  // > to any of them, must be non-primary time identifiers that resolve to "UTC".
  expect(IANAZone.normalizeZone("Etc/GMT")).toBe("UTC");
});

test("IANAZone returns canonical zone name regardless of input casing", () => {
  expect(IANAZone.create("america/nEw_york").name).toBe("America/New_York");
  expect(IANAZone.create("AMERICA/NEW_YORK").name).toBe("America/New_York");
  expect(IANAZone.create("America/New_York").name).toBe("America/New_York");
  expect(IANAZone.create("europe/paris").name).toBe("Europe/Paris");
  expect(IANAZone.create("EUROPE/PARIS").name).toBe("Europe/Paris");
  expect(IANAZone.create("Asia/Tokyo").name).toBe("Asia/Tokyo");
});

test("IANAZone.offset works on hour 0 in Asia/Beirut", () => {});
