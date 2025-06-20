/* global test expect */
import { FixedOffsetZone, IANAZone } from "../../src/luxon";
import { INVALID_ZONE_NAME, InvalidArgumentError, InvalidZoneError } from "../../src/errors";

test("IANAZone.create returns a singleton per zone name", () => {
  expect(IANAZone.create("UTC")).toBe(IANAZone.create("UTC"));
  expect(IANAZone.create("America/New_York")).toBe(IANAZone.create("America/New_York"));

  expect(IANAZone.create("UTC")).not.toBe(IANAZone.create("America/New_York"));
});

test("IANAZone.create should return IANAZone instance", () => {
  const result = IANAZone.create("America/Cancun");
  expect(result).toBeInstanceOf(IANAZone);
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
  expect(new IANAZone("America/Santiago").type).toBe("iana");
  expect(new IANAZone("Europe/Berlin").type).toBe("iana");
});

test("IANAZone.name returns the zone name passed to the constructor", () => {
  expect(new IANAZone("America/Santiago").name).toBe("America/Santiago");
  expect(new IANAZone("Europe/Berlin").name).toBe("Europe/Berlin");
});

test("IANAZone is not universal", () => {
  expect(new IANAZone("America/Santiago").isUniversal).toBe(false);
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

test("IANAZone.create throws InvalidZoneError for invalid zone names", () => {
  for (const input of ["", "foo", "CEDT", "GMT+2", "America/Blorb"]) {
    expect(() => IANAZone.create(input)).toThrowLuxonError(InvalidZoneError, INVALID_ZONE_NAME);
  }
});

test("IANAZone.create throws InvalidArgumentError for invalid inputs", () => {
  for (const input of [null, 5, {}, [], undefined, Symbol()]) {
    expect(() => IANAZone.create(input)).toThrow(InvalidArgumentError);
  }
});
