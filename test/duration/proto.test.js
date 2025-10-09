import { test, expect } from "vitest";
import { Duration } from "../../src/luxon.ts";

test("Duration prototype properties should not throw when addressed", () => {
  const d = Duration.fromObject({ hours: 1 });
  expect(() =>
    Object.getOwnPropertyNames(Object.getPrototypeOf(d)).forEach(
      (name) => Object.getPrototypeOf(d)[name]
    )
  ).not.toThrow();
});
