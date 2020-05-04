/* global test expect */
/* eslint no-proto: "off" */
import { DateTime } from "../../src/luxon";

test("DateTime prototype properties should not throw when accessed", () => {
  const d = DateTime.now();
  expect(() =>
    Object.getOwnPropertyNames(d.__proto__).forEach(name => d.__proto__[name])
  ).not.toThrow();
});
