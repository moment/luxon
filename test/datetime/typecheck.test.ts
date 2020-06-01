import { DateTime } from "../../src";

//------
// #isDateTime()
//------
test("DateTime#isDateTime return true for valid DateTime", () => {
  const dt = DateTime.now();
  expect(DateTime.isDateTime(dt)).toBe(true);
});

test("DateTime#isDateTime return false for primitives", () => {
  expect(DateTime.isDateTime({})).toBe(false);
  expect(DateTime.isDateTime({ hours: 60 })).toBe(false);
  expect(DateTime.isDateTime(1)).toBe(false);
  expect(DateTime.isDateTime("")).toBe(false);
  expect(DateTime.isDateTime(null)).toBe(false);
  // @ts-expect-error
  expect(DateTime.isDateTime()).toBe(false);
});
