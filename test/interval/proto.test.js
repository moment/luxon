import { test, expect } from "vitest";
import { DateTime } from "../../src/luxon.ts";

test.skip("Interval prototype properties should not throw when addressed", () => {
  // TODO: This was added to work around stuff in React DevTools, validate if
  // that still applies
  // https://github.com/moment/luxon/issues/182
  const i = DateTime.fromISO("2018-01-01").until(DateTime.fromISO("2018-01-02"));
  expect(() =>
    Object.getOwnPropertyNames(Object.getPrototypeOf(i)).forEach(
      (name) => Object.getPrototypeOf(i)[name]
    )
  ).not.toThrow();
});
