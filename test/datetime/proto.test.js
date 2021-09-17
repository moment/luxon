/* global test expect */
import { DateTime } from "../../mod/Module";

test("DateTime prototype properties should not throw when accessed", () => {
  const d = DateTime.now();
  expect(() =>
    Object.getOwnPropertyNames(d.__proto__).forEach((name) => d.__proto__[name])
  ).not.toThrow();
});
