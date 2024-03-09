/* global test expect */
import { DateTime } from "../../src/luxon";

test("Interval prototype properties should not throw when addressed", () => {
  const i = DateTime.fromISO("2018-01-01").until(DateTime.fromISO("2018-01-02"));
  expect(() =>
    Object.getOwnPropertyNames(Object.getPrototypeOf(i)).forEach((name) => Object.getPrototypeOf(i)[name])
  ).not.toThrow();
});
