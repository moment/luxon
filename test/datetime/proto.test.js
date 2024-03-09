/* global test expect */
import { DateTime } from "../../src/luxon";

test("DateTime prototype properties should not throw when accessed", () => {
  const d = DateTime.now();
  expect(() =>
    Object.getOwnPropertyNames(Object.getPrototypeOf(d)).forEach((name) => Object.getPrototypeOf(d)[name])
  ).not.toThrow();
});
