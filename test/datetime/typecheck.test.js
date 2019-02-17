/* global test expect */
import { DateTime } from "../../src/luxon";

//------
// #isDateTime()
//------
test("DateTime#isDateTime return true for valid DateTime", () => {
  const dt = DateTime.local();
  expect(DateTime.isDateTime(dt)).toBe(true);
});

test("DateTime#isDateTime return true for invalid DateTime", () => {
  const dt = DateTime.invalid("because");
  expect(DateTime.isDateTime(dt)).toBe(true);
});

test("DateTime#isDateTime return false for primitives", () => {
  expect(DateTime.isDateTime({})).toBe(false);
  expect(DateTime.isDateTime({ hours: 60 })).toBe(false);
  expect(DateTime.isDateTime(1)).toBe(false);
  expect(DateTime.isDateTime("")).toBe(false);
  expect(DateTime.isDateTime(null)).toBe(false);
  expect(DateTime.isDateTime()).toBe(false);
});
