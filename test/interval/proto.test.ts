/* eslint no-proto: "off" */
import { DateTime } from "../../src/luxon";

test("Interval prototype properties should not throw when addressed", () => {
  const i = DateTime.fromISO("2018-01-01").until(DateTime.fromISO("2018-01-02"));
  const proto = Object.getPrototypeOf(i);
  expect(() => Object.getOwnPropertyNames(proto).forEach(name => proto[name])).not.toThrow();
});
