/* global test expect */

import { DateTime } from "../../src/luxon";

const dt = DateTime.fromJSDate(new Date(1982, 4, 25, 9, 23, 54, 123));

//------
// year/month/day/hour/minute/second/millisecond
//-------
test("DateTime#set() sets Gregorian fields", () => {
  expect(dt.set({ year: 2012 }).year).toBe(2012);
  expect(dt.set({ month: 2 }).month).toBe(2);
  expect(dt.set({ month: 2 }).hour).toBe(9); // this will cross a DST for many people
  expect(dt.set({ day: 5 }).day).toBe(5);
  expect(dt.set({ hour: 4 }).hour).toBe(4);
  expect(dt.set({ minute: 16 }).minute).toBe(16);
  expect(dt.set({ second: 45 }).second).toBe(45);
  expect(dt.set({ millisecond: 86 }).millisecond).toBe(86);
});

test("DateTime#set({ month }) doesn't go to the wrong month", () => {
  const end = DateTime.fromJSDate(new Date(1983, 4, 31)),
    moved = end.set({ month: 4 });
  expect(moved.month).toBe(4);
  expect(moved.day).toBe(30);
});

test("DateTime#set({ year }) doesn't wrap leap years", () => {
  const end = DateTime.fromJSDate(new Date(2012, 1, 29)),
    moved = end.set({ year: 2013 });
  expect(moved.month).toBe(2);
  expect(moved.day).toBe(28);
});

//------
// weekYear/weekNumber/weekday
//------

test("DateTime#set({ weekYear }) sets the date to the same weekNumber/weekday of the target weekYear", () => {
  const modified = dt.set({ weekYear: 2017 });
  expect(modified.weekday).toBe(2); // still tuesday
  expect(modified.weekNumber).toBe(21);
  expect(modified.year).toBe(2017);
  expect(modified.month).toBe(5);
  expect(modified.day).toBe(23); // 2017-W21-2 is the 23
  expect(modified.hour).toBe(9);
  expect(modified.minute).toBe(23);
  expect(modified.second).toBe(54);
  expect(modified.millisecond).toBe(123);
});

test("DateTime#set({ weekNumber }) sets the date to the same weekday of the target weekNumber", () => {
  const modified = dt.set({ weekNumber: 2 });
  expect(modified.weekday).toBe(2); // still tuesday
  expect(modified.year).toBe(1982);
  expect(modified.month).toBe(1);
  expect(modified.day).toBe(12);
  expect(modified.hour).toBe(9);
  expect(modified.minute).toBe(23);
  expect(modified.second).toBe(54);
  expect(modified.millisecond).toBe(123);
});

test("DateTime#set({ weekday }) sets the weekday to this week's matching day", () => {
  const modified = dt.set({ weekday: 1 });
  expect(modified.weekday).toBe(1);
  expect(modified.year).toBe(1982);
  expect(modified.month).toBe(5);
  expect(modified.day).toBe(24); // monday is the previous day
  expect(modified.hour).toBe(9);
  expect(modified.minute).toBe(23);
  expect(modified.second).toBe(54);
  expect(modified.millisecond).toBe(123);
});

test("DateTime#set({ weekday }) handles week year edge cases", () => {
  const endOfWeekIs = (startISO, expectedISO) => {
    const start = DateTime.fromISO(startISO);
    const expected = DateTime.fromISO(expectedISO);
    expect(start.set({ weekday: 7 })).toEqual(expected);
  };

  endOfWeekIs("2016-01-02", "2016-01-03");
  endOfWeekIs("2016-12-29", "2017-01-01");
  endOfWeekIs("2021-01-01", "2021-01-03");
  endOfWeekIs("2028-01-01", "2028-01-02");
});

//------
// year/ordinal
//------
test("DateTime#set({ ordinal }) sets the date to the ordinal within the current year", () => {
  const modified = dt.set({ ordinal: 200 });
  expect(modified.year).toBe(1982);
  expect(modified.month).toBe(7);
  expect(modified.day).toBe(19);
  expect(modified.hour).toBe(9);
  expect(modified.minute).toBe(23);
  expect(modified.second).toBe(54);
  expect(modified.millisecond).toBe(123);
});

//------
// set multiple things
//------

test("DateTime.set does units in increasing size", () => {
  const modified = dt.set({ day: 31, month: 3 });
  expect(modified.month).toBe(3);
  expect(modified.day).toBe(31);
});

//------
// set invalid things
//------
test("DateTime#set throws for invalid units", () => {
  expect(() => dt.set({ glorb: 200 })).toThrow();
});

test("DateTime#set throws for metadata", () => {
  expect(() => dt.set({ zone: "UTC" })).toThrow();
  expect(() => dt.set({ locale: "be" })).toThrow();
  expect(() => dt.set({ invalid: true })).toThrow();
});

test("DateTime#set maintains invalidity", () => {
  expect(DateTime.invalid("because").set({ ordinal: 200 }).isValid).toBe(false);
});
