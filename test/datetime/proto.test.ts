import { test, expect, describe } from "vitest";
import { DateTime } from "../../src/luxon.ts";

// TODO: this test tested questionable behavior that seemed necessary for React Devtools
// Before the 4.0 release, verify that the problem in React no longer exists.
describe.todo("DateTime prototype properties should not throw when accessed", () => {
  const d = DateTime.now();
  test.each(Object.getOwnPropertyNames(Object.getPrototypeOf(d)))("$0", (propertyName) => {
    expect(() => Object.getPrototypeOf(d)[propertyName]).not.toThrow();
  });
});
