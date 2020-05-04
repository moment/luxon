/* global test expect */
import { FixedOffsetZone, IANAZone } from "../../src/luxon";
import { withoutIntl } from "../helpers";

test("IANAZone.create returns a singleton per zone name", () => {
  expect(IANAZone.create("UTC")).toBe(IANAZone.create("UTC"));
  expect(IANAZone.create("America/New_York")).toBe(IANAZone.create("America/New_York"));

  expect(IANAZone.create("UTC")).not.toBe(IANAZone.create("America/New_York"));

  // hold true even for invalid zone names
  expect(IANAZone.create("blorp")).toBe(IANAZone.create("blorp"));
});

test("IANAZone.create should return IANAZone instance", () => {
  const result = IANAZone.create("America/Cancun");
  expect(result).toBeInstanceOf(IANAZone);
});

test("IANAZone.isValidSpecifier", () => {
  expect(IANAZone.isValidSpecifier("America/New_York")).toBe(true);
  expect(IANAZone.isValidSpecifier("Fantasia/Castle")).toBe(true);
  expect(IANAZone.isValidSpecifier("Sport~~blorp")).toBe(false);
  expect(IANAZone.isValidSpecifier(null)).toBe(false);
});

test("IANAZone.isValidZone", () => {
  expect(IANAZone.isValidZone("America/New_York")).toBe(true);
  expect(IANAZone.isValidZone("Fantasia/Castle")).toBe(false);
  expect(IANAZone.isValidZone("Sport~~blorp")).toBe(false);
  expect(IANAZone.isValidZone("")).toBe(false);
});

test("IANAZone.parseGMTOffset returns a number for a valid input", () => {
  expect(IANAZone.parseGMTOffset("Etc/GMT+8")).toBe(-480);
});

test("IANAZone.parseGMTOffset returns null for invalid input", () => {
  expect(IANAZone.parseGMTOffset()).toBe(null);
  expect(IANAZone.parseGMTOffset(null)).toBe(null);
  expect(IANAZone.parseGMTOffset("")).toBe(null);
  expect(IANAZone.parseGMTOffset("foo")).toBe(null);
  expect(IANAZone.parseGMTOffset("Etc/GMT+blorp")).toBe(null);
});

test("IANAZone.type returns a static string", () => {
  expect(new IANAZone("America/Santiago").type).toBe("iana");
  expect(new IANAZone("America/Blorp").type).toBe("iana");
});

test("IANAZone.name returns the zone name passed to the constructor", () => {
  expect(new IANAZone("America/Santiago").name).toBe("America/Santiago");
  expect(new IANAZone("America/Blorp").name).toBe("America/Blorp");
  expect(new IANAZone("foo").name).toBe("foo");
});

test("IANAZone is not universal", () => {
  expect(new IANAZone("America/Santiago").universal).toBe(false);
});

test("IANAZone.offsetName with a long format", () => {
  const zone = new IANAZone("America/Santiago");
  const offsetName = zone.offsetName(1552089600, { format: "long", locale: "en-US" });
  expect(offsetName).toBe("Chile Summer Time");
});

test("IANAZone.offsetName with a short format", () => {
  const zone = new IANAZone("America/Santiago");
  const offsetName = zone.offsetName(1552089600, { format: "short", locale: "en-US" });
  expect(offsetName).toBe("GMT-3");
});

withoutIntl("IANAZone.offsetName returns null", () => {
  const zone = new IANAZone("America/Santiago");
  const offsetName = zone.offsetName(1552089600, { format: "short", locale: "en-US" });
  expect(offsetName).toBe(null);
});

test("IANAZone.formatOffset with a short format", () => {
  const zone = new IANAZone("America/Santiago");
  const offsetName = zone.formatOffset(1552089600, "short");
  expect(offsetName).toBe("-03:00");
});

test("IANAZone.formatOffset with a narrow format", () => {
  const zone = new IANAZone("America/Santiago");
  const offsetName = zone.formatOffset(1552089600, "narrow");
  expect(offsetName).toBe("-3");
});

test("IANAZone.formatOffset with a techie format", () => {
  const zone = new IANAZone("America/Santiago");
  const offsetName = zone.formatOffset(1552089600, "techie");
  expect(offsetName).toBe("-0300");
});

test("IANAZone.formatOffset throws for an invalid format", () => {
  const zone = new IANAZone("America/Santiago");
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
  expect(new IANAZone("UTC").isValid).toBe(true);
  expect(new IANAZone("America/Santiago").isValid).toBe(true);
  expect(new IANAZone("Europe/Paris").isValid).toBe(true);
});

test("IANAZone.isValid returns false for invalid zone names", () => {
  expect(new IANAZone("").isValid).toBe(false);
  expect(new IANAZone("foo").isValid).toBe(false);
  expect(new IANAZone("CEDT").isValid).toBe(false);
  expect(new IANAZone("GMT+2").isValid).toBe(false);
  expect(new IANAZone("America/Blorp").isValid).toBe(false);
  expect(new IANAZone(null).isValid).toBe(false);
});
