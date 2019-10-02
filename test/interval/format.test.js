/* global test expect */
import { Interval, DateTime } from "../../src/luxon";

const fromISOs = (s, e) =>
    DateTime.fromISO(s, { setZone: true }).until(DateTime.fromISO(e, { setZone: true })),
  interval = fromISOs("1982-05-25T09:00Z", "1983-10-14T13:30Z"),
  invalid = Interval.invalid("because");

//------
// .toString()
//------

test("Interval#toString returns a simple range format", () =>
  expect(interval.toString()).toBe("[1982-05-25T09:00:00.000Z – 1983-10-14T13:30:00.000Z)"));

test("Interval#toString returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toString()).toBe("Invalid Interval"));

//------
// .toISO()
//------

test("Interval#toISO returns a simple ISO format", () =>
  expect(interval.toISO()).toBe("1982-05-25T09:00:00.000Z/1983-10-14T13:30:00.000Z"));

test("Interval#toISO accepts ISO options", () =>
  expect(interval.toISO({ suppressSeconds: true })).toBe("1982-05-25T09:00Z/1983-10-14T13:30Z"));

test("Interval#toISO returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toISO()).toBe("Invalid Interval"));

//------
// .toISODate()
//------

test("Interval#toISODate returns a simple ISO date interval format", () =>
  expect(interval.toISODate()).toBe("1982-05-25/1983-10-14"));

test("Interval#toISODate returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toISODate()).toBe("Invalid Interval"));

//------
// .toISOTime()
//------

test("Interval#toISOTime returns a simple ISO time interval format", () =>
  expect(interval.toISOTime()).toBe("09:00:00.000Z/13:30:00.000Z"));

test("Interval#toISOTime returns an unfriendly string for invalid intervals", () =>
  expect(invalid.toISOTime()).toBe("Invalid Interval"));

test("Interval#toISOTime accepts ISO options", () => {
  expect(interval.toISOTime({ suppressSeconds: true })).toBe("09:00Z/13:30Z");
  expect(interval.toISOTime({ suppressMilliseconds: true })).toBe("09:00:00Z/13:30:00Z");
});

//------
// .toFormat()
//------

test("Interval#toFormat accepts date formats", () => {
  expect(interval.toFormat("EEE, LLL dd, yyyy")).toBe("Tue, May 25, 1982 – Fri, Oct 14, 1983");
  expect(interval.toFormat("HH:mm")).toBe("09:00 – 13:30");
});

test("Interval#toFormat accepts date formats", () => {
  expect(interval.toFormat("EEE, LLL dd, yyyy", { separator: " until " })).toBe(
    "Tue, May 25, 1982 until Fri, Oct 14, 1983"
  );
});

test("Interval#toFormat returns an unfriendly string for invalid intervals", () => {
  expect(invalid.toFormat("EEE, LLL dd, yyyy")).toBe("Invalid Interval");
});
