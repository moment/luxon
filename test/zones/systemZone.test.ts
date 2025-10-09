import { describe, expect, test } from "vitest";
import { SystemZone } from "../../src/luxon.ts";

describe("SystemZone", () => {
  test("SystemZone is a singleton", () => {
    expect(SystemZone.instance).toBe(SystemZone.instance);
  });
  test("SystemZone cannot be instantiated", () => {
    expect(() => {
      // @ts-ignore
      return new SystemZone();
    }).toThrow(TypeError);
  });
  test("SystemZone equals itself", () => {
    expect(SystemZone.instance.equals(SystemZone.instance)).toBe(true);
  });
});
