/* global test expect */

import { DateTime } from "../../src/luxon";

const dtMaker = () =>
    DateTime.fromObject({
      year: 1982,
      month: 5,
      day: 25,
      hour: 9,
      minute: 23,
      second: 54,
      millisecond: 123,
      zone: "utc"
    }),
  dt = dtMaker();

//------
// #toMillis()
//------
test("DateTime#toMillis() returns milliseconds for valid DateTimes", () => {
  const js = dt.toJSDate();
  expect(dt.toMillis()).toBe(js.getTime());
});

test("DateTime#toMillis() returns NaN for invalid DateTimes", () => {
  const invalid = DateTime.invalid("reason");
  expect(invalid.toMillis()).toBe(NaN);
});

//------
// #toSeconds()
//------
test("DateTime#toSeconds() returns seconds for valid DateTimes", () => {
  const js = dt.toJSDate();
  expect(dt.toSeconds()).toBe(js.getTime() / 1000);
});

test("DateTime#toSeconds() returns NaN for invalid DateTimes", () => {
  const invalid = DateTime.invalid("reason");
  expect(invalid.toSeconds()).toBe(NaN);
});

//------
// #valueOf()
//------
test("DateTime#valueOf() just does toMillis()", () => {
  expect(dt.valueOf()).toBe(dt.toMillis());
  const invalid = DateTime.invalid("reason");
  expect(invalid.valueOf()).toBe(invalid.toMillis());
});

//------
// #toJSDate()
//------
test("DateTime#toJSDate() returns a native Date equivalent", () => {
  const js = dt.toJSDate();
  expect(js).toBeInstanceOf(Date);
  expect(js.getTime()).toBe(dt.toMillis());
});

//------
// #toBSON()
//------
test("DateTime#toBSON() return a BSON serializable equivalent", () => {
  const js = dt.toJSDate();
  expect(js).toBeInstanceOf(Date);
  expect(js.getTime()).toBe(dt.toMillis());
});
