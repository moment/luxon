import { describe, expect, test } from "vitest";
import { FixedOffsetZone, IANAZone, Info, Settings, SystemZone } from "../../src/luxon.ts";
import { InvalidZoneError } from "../../src/errors.js";
import * as Helpers from "../helpers.js";

describe("normalizeZone", () => {
  test.each([null, undefined, "default"])("$0 should return the default", (input) => {
    const def = FixedOffsetZone.instance(5);
    expect(Info.normalizeZone(input, def)).toBe(def);
  });

  test.each(["utc", "UTC", "gmt", "GMT"])("Should accept $0 as a special name for UTC", (name) => {
    const result = Info.normalizeZone(name);
    expect(result).toBeInstanceOf(FixedOffsetZone);
    expect(result?.offset(0)).toBe(0);
  });

  test.each(["local", "system", "Local", "System"])(
    "Should accept $0 as a special name for the system zone",
    (name) => {
      const result = Info.normalizeZone(name);
      expect(result).toBeInstanceOf(SystemZone);
    }
  );

  test.each(["Europe/Berlin", "Etc/GMT-10", "Etc/GMT+5", "Europe/Paris"])(
    "Should accept an IANA zone string",
    (name) => {
      const result = Info.normalizeZone(name);
      expect(result).toBeInstanceOf(IANAZone);
      expect(result?.ianaName).toBe(name);
    }
  );

  test("Should throw on invalid IANA zone", () => {
    expect(() => Info.normalizeZone("Foo/Bar")).toThrow(InvalidZoneError);
  });

  test("Should accept an UTC offset specifier", () => {
    const result = Info.normalizeZone("UTC+3");
    expect(result).toBeInstanceOf(FixedOffsetZone);
    expect(result?.offset(0)).toBe(180);
  });

  test.each([180, -660, 0])("Should accept $0 as an offset from UTC", (offset) => {
    const result = Info.normalizeZone(offset);
    expect(result).toBeInstanceOf(FixedOffsetZone);
    expect(result?.offset(0)).toBe(offset);
  });

  test("Should throw on an invalid offset from UTC", () => {
    expect(() => Info.normalizeZone(180.9)).toThrow(InvalidZoneError);
  });

  test.each([true, false, NaN, [[0]], [["Europe/Berlin"]], { toString: () => "Europe/Berlin" }])(
    "Should throw on other invalid inputs: $0",
    (input) => {
      expect(() => Info.normalizeZone(input as never)).toThrow(InvalidZoneError);
    }
  );

  test("Info.normalizeZone returns Zone objects unchanged", () => {
    const fixedOffsetZone = FixedOffsetZone.instance(5);
    expect(Info.normalizeZone(fixedOffsetZone)).toBe(fixedOffsetZone);

    const ianaZone = IANAZone.create("Europe/Paris");
    expect(Info.normalizeZone(ianaZone)).toBe(ianaZone);

    const systemZone = SystemZone.instance;
    expect(Info.normalizeZone(systemZone)).toBe(systemZone);
  });

  test("Info.normalizeZone throws on unknown name", () => {
    expect(() => Info.normalizeZone("bumblebee")).toThrow(InvalidZoneError);
  });

  test("Info.normalizeZone converts null and undefined to default Zone", () => {
    expect(Info.normalizeZone(null)).toBe(Settings.defaultZone);
    expect(Info.normalizeZone(undefined)).toBe(Settings.defaultZone);
  });

  test("Info.normalizeZone converts local to system Zone", () => {
    expect(Info.normalizeZone("local")).toBe(Settings.defaultZone);
    Helpers.withDefaultZone("Europe/Berlin", () => {
      expect(Info.normalizeZone("local").name).toBe("America/New_York");
    });
  });
});
