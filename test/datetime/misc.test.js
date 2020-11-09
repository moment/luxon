/* global test expect */
import { DateTime } from "../../src/luxon";

// you hate to see a class like this, but here we are

//------
// #hasSame()
//------

test("DateTime#hasSame() can use milliseconds for exact comparisons", () => {
  const dt = DateTime.now();
  expect(dt.hasSame(dt, "millisecond")).toBe(true);
  expect(dt.hasSame(dt.reconfigure({ locale: "fr" }), "millisecond")).toBe(true);
  expect(dt.hasSame(dt.plus({ milliseconds: 1 }), "millisecond")).toBe(false);
});

test("DateTime#hasSame() checks the unit", () => {
  const dt = DateTime.now();
  expect(dt.hasSame(dt, "day")).toBe(true);
  expect(dt.hasSame(dt.startOf("day"), "day")).toBe(true);
  expect(dt.hasSame(dt.plus({ days: 1 }), "days")).toBe(false);
});

test("DateTime#hasSame() checks high-order units", () => {
  const dt1 = DateTime.fromISO("2001-02-03");
  const dt2 = DateTime.fromISO("2001-05-03");
  expect(dt1.hasSame(dt2, "year")).toBe(true);
  expect(dt1.hasSame(dt2, "month")).toBe(false);
  // Even when days are equal, return false when a higher-order unit differs.
  expect(dt1.hasSame(dt2, "day")).toBe(false);
});

// #584
test("DateTime#hasSame() ignores time offsets and is symmetric", () => {
  const d1 = DateTime.fromISO("2019-10-02T01:02:03.045+03:00", {
    zone: "Europe/Helsinki"
  });
  const d2 = DateTime.fromISO("2019-10-02T01:02:03.045-05:00", {
    zone: "America/Chicago"
  });

  expect(d1.hasSame(d2, "day")).toBe(true);
  expect(d2.hasSame(d1, "day")).toBe(true);
  expect(d1.hasSame(d2, "hour")).toBe(true);
  expect(d2.hasSame(d1, "hour")).toBe(true);
  expect(d1.hasSame(d2, "second")).toBe(true);
  expect(d2.hasSame(d1, "second")).toBe(true);
  expect(d1.hasSame(d2, "millisecond")).toBe(true);
  expect(d2.hasSame(d1, "millisecond")).toBe(true);
});

test("DateTime#hasSame() returns false for invalid DateTimes", () => {
  const dt = DateTime.now(),
    invalid = DateTime.invalid("because");
  expect(dt.hasSame(invalid, "day")).toBe(false);
  expect(invalid.hasSame(invalid, "day")).toBe(false);
  expect(invalid.hasSame(dt, "day")).toBe(false);
});

//------
// #until()
//------

test("DateTime#until() creates an Interval", () => {
  const dt = DateTime.now(),
    other = dt.plus({ days: 1 }),
    i = dt.until(other);

  expect(i.start).toBe(dt);
  expect(i.end).toBe(other);
});

test("DateTime#until() creates an invalid Interval out of an invalid DateTime", () => {
  const dt = DateTime.now(),
    invalid = DateTime.invalid("because");

  expect(invalid.until(invalid).isValid).toBe(false);
  expect(invalid.until(dt).isValid).toBe(false);
  expect(dt.until(invalid).isValid).toBe(false);
});

//------
// #isInLeapYear
//------
test("DateTime#isInLeapYear returns the whether the DateTime's year is in a leap year", () => {
  expect(DateTime.local(2017, 5, 25).isInLeapYear).toBe(false);
  expect(DateTime.local(2020, 5, 25).isInLeapYear).toBe(true);
});

test("DateTime#isInLeapYear returns false for invalid DateTimes", () => {
  expect(DateTime.invalid("because").isInLeapYear).toBe(false);
});

//------
// #daysInYear
//------
test("DateTime#daysInYear returns the number of days in the DateTime's year", () => {
  expect(DateTime.local(2017, 5, 25).daysInYear).toBe(365);
  expect(DateTime.local(2020, 5, 25).daysInYear).toBe(366);
});

test("DateTime#daysInYear returns NaN for invalid DateTimes", () => {
  expect(DateTime.invalid("because").daysInYear).toBeFalsy();
});

//------
// #daysInMonth
//------
test("DateTime#daysInMonth returns the number of days in the DateTime's month", () => {
  expect(DateTime.local(2017, 3, 10).daysInMonth).toBe(31);
  expect(DateTime.local(2017, 6, 10).daysInMonth).toBe(30);
  expect(DateTime.local(2017, 2, 10).daysInMonth).toBe(28);
  expect(DateTime.local(2020, 2, 10).daysInMonth).toBe(29);
});

test("DateTime#daysInMonth returns NaN for invalid DateTimes", () => {
  expect(DateTime.invalid("because").daysInMonth).toBeFalsy();
});

//------
// #weeksInWeekYear
//------
test("DateTime#weeksInWeekYear returns the number of days in the DateTime's year", () => {
  expect(DateTime.local(2004, 5, 25).weeksInWeekYear).toBe(53);
  expect(DateTime.local(2017, 5, 25).weeksInWeekYear).toBe(52);
  expect(DateTime.local(2020, 5, 25).weeksInWeekYear).toBe(53);
});

test("DateTime#weeksInWeekYear returns NaN for invalid DateTimes", () => {
  expect(DateTime.invalid("because").weeksInWeekYear).toBeFalsy();
});
