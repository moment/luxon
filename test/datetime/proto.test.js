import { test, expect } from "vitest";
import { DateTime } from "../../src/luxon";

test.skip("DateTime prototype properties should not throw when accessed", () => {
  const d = DateTime.now();
  expect(() =>
    Object.getOwnPropertyNames(Object.getPrototypeOf(d)).forEach(
      (name) => Object.getPrototypeOf(d)[name]
    )
  ).not.toThrow();
});
