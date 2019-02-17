/* global test expect */

import { Interval, DateTime } from "../../src/luxon";

//------
// #isInterval
//-------
test("Interval.isInterval return true for valid duration", () => {
  const int = Interval.fromDateTimes(DateTime.local(), DateTime.local());
  expect(Interval.isInterval(int)).toBe(true);
});

test("Interval.isInterval return true for invalid duration", () => {
  const int = Interval.invalid("because");
  expect(Interval.isInterval(int)).toBe(true);
});

test("Interval.isInterval return false for primitives", () => {
  expect(Interval.isInterval({})).toBe(false);
  expect(Interval.isInterval(1)).toBe(false);
  expect(Interval.isInterval("")).toBe(false);
  expect(Interval.isInterval(null)).toBe(false);
  expect(Interval.isInterval()).toBe(false);
});
