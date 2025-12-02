import { test, expect, describe } from "vitest";
import { DateTime } from "../../src/luxon.ts";

describe("DateTime prototype properties should not throw when accessed", () => {
  const d = DateTime.now();
  test.each(Object.getOwnPropertyNames(Object.getPrototypeOf(d)))("$0", (propertyName) => {
    expect(() => Object.getPrototypeOf(d)[propertyName]).not.toThrow();
  });
});
