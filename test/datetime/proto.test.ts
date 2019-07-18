/* eslint no-proto: "off" */
import { DateTime } from "../../src/luxon";

test.skip("DateTime prototype properties should not throw when accessed", () => {
  const d = DateTime.now();
  const proto = Object.getPrototypeOf(d);
  expect(() => Object.getOwnPropertyNames(proto).forEach(name => proto[name])).not.toThrow();
});
