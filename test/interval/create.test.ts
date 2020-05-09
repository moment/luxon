import { DateTime, Interval, Duration } from "../../src";
import { InvalidArgumentError } from "../../src/errors";

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
      day: 25
    }).toJSDate(),
    end = DateTime.fromObject({ year: 2016, month: 5, day: 27 }).toJSDate(),
    int = Interval.fromDateTimes(start, end);

  expect(int.start.toJSDate()).toEqual(start);
  expect(int.end.toJSDate()).toEqual(end);
});

test("Interval.fromDateTimes rejects missing or invalid arguments", () => {
  const validDate = DateTime.fromObject({ year: 2016, month: 5, day: 25 });
  // @ts-ignore
  expect(() => Interval.fromDateTimes(validDate, null)).toThrow(InvalidArgumentError);
  // @ts-ignore
  expect(() => Interval.fromDateTimes(null, validDate)).toThrow(InvalidArgumentError);
  expect(() => Interval.fromDateTimes(validDate.plus({ days: 1 }), validDate)).toThrow(
    InvalidArgumentError
  );
  // @ts-ignore
  expect(() => Interval.fromDateTimes(DateTime.local(), true)).toThrow(InvalidArgumentError);
});

test("Interval.fromDateTimes throws with start date coming after end date", () => {
  const start = DateTime.fromObject({
      year: 2016,
      month: 5,
      day: 25
    }).toJSDate(),
    end = DateTime.fromObject({ year: 2016, month: 5, day: 27 }).toJSDate();

  expect(() => Interval.fromDateTimes(end, start)).toThrow();
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
