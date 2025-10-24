import { test, expect } from "vitest";
import { DateTime, Interval, Duration, Settings } from "../../src/luxon.ts";
import * as Helpers from "../helpers";
import { InvalidArgumentError, InvalidIntervalError } from "../../src/errors.ts";

const withThrowOnInvalid = Helpers.setUnset("throwOnInvalid");

//------
// .fromObject()
//-------
test("Interval.fromDateTimes creates an interval from datetimes", () => {
  const start = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    end = DateTime.fromObject({ year: 2016, month: 5, day: 27 }),
    int = Interval.fromDateTimes(start, end);

  expect(int.start).toBe(start);
  expect(int.end).toBe(end);
});

test("Interval.fromDateTimes creates an interval from objects", () => {
  const start = { year: 2016, month: 5, day: 25 },
    end = { year: 2016, month: 5, day: 27 },
    int = Interval.fromDateTimes(start, end);

  expect(int.start).toEqual(DateTime.fromObject(start));
  expect(int.end).toEqual(DateTime.fromObject(end));
});

test("Interval.fromDateTimes creates an interval from Dates", () => {
  const start = DateTime.fromObject({
      year: 2016,
      month: 5,
      day: 25,
    }).toJSDate(),
    end = DateTime.fromObject({ year: 2016, month: 5, day: 27 }).toJSDate(),
    int = Interval.fromDateTimes(start, end);

  expect(int.start.toJSDate()).toEqual(start);
  expect(int.end.toJSDate()).toEqual(end);
});

test.for([true, false, null, undefined, "2021-01-01", "hello", 15])(
  "Interval.fromDateTimes throws with invalid input",
  (v) => {
    expect(() => Interval.fromDateTimes(DateTime.now(), v)).toThrow(InvalidArgumentError);
    expect(() => Interval.fromDateTimes(v, DateTime.now())).toThrow(InvalidArgumentError);
    expect(() => Interval.fromDateTimes(v, v)).toThrow(InvalidArgumentError);
  }
);

test("Interval.fromDateTimes throws with start date coming after end date", () => {
  const start = DateTime.fromObject({
      year: 2016,
      month: 5,
      day: 25,
    }).toJSDate(),
    end = DateTime.fromObject({ year: 2016, month: 5, day: 27 }).toJSDate();

  expect(() => Interval.fromDateTimes(end, start)).toThrowLuxonError(
    InvalidIntervalError,
    "interval.endBeforeStart"
  );
});

//------
// .after()
//-------
test("Interval.after takes a duration", () => {
  const start = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.after(start, Duration.fromObject({ days: 3 }));

  expect(int.start).toBe(start);
  expect(int.end.day).toBe(28);
});

test("Interval.after an object", () => {
  const start = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.after(start, { days: 3 });

  expect(int.start).toBe(start);
  expect(int.end.day).toBe(28);
});

//------
// .before()
//-------
test("Interval.before takes a duration", () => {
  const end = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.before(end, Duration.fromObject({ days: 3 }));

  expect(int.start.day).toBe(22);
  expect(int.end).toBe(end);
});

test("Interval.before takes a number and unit", () => {
  const end = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.before(end, { days: 3 });

  expect(int.start.day).toBe(22);
  expect(int.end).toBe(end);
});
