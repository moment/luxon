/* global test expect */
import { DateTime } from "../../src/luxon";

const i = DateTime.fromISO("2018-01-01").until(DateTime.fromISO("2018-01-02"));
for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(i))) {
  test(`Interval prototype property ${name} should not throw when addressed`, () => {
    expect(() => Object.getPrototypeOf(i)[name]).not.toThrow();
  });
}
