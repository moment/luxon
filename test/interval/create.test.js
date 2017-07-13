/* global test expect */
import { DateTime, Interval, Duration } from '../../src/luxon';

//------
// .fromObject()
//-------
test('Interval.fromObject creates an interval from datetimes', () => {
  const start = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    end = DateTime.fromObject({ year: 2016, month: 5, day: 27 }),
    int = Interval.fromDateTimes(start, end);

  expect(int.start()).toBe(start);
  expect(int.end()).toBe(end);
});

test('Interval.fromObject creates an interval from objects', () => {
  const start = { year: 2016, month: 5, day: 25 },
    end = { year: 2016, month: 5, day: 27 },
    int = Interval.fromDateTimes(start, end);

  expect(int.start()).toEqual(DateTime.fromObject(start));
  expect(int.end()).toEqual(DateTime.fromObject(end));
});

test('Interval.fromObject creates an interval from Dates', () => {
  const start = DateTime.fromObject({ year: 2016, month: 5, day: 25 }).toJSDate(),
    end = DateTime.fromObject({ year: 2016, month: 5, day: 27 }).toJSDate(),
    int = Interval.fromDateTimes(start, end);

  expect(int.start().toJSDate()).toEqual(start);
  expect(int.end().toJSDate()).toEqual(end);
});

//------
// .after()
//-------
test('Interval.after takes a duration', () => {
  const start = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.after(start, Duration.fromObject({ days: 3 }));

  expect(int.start()).toBe(start);
  expect(int.end().day).toBe(28);
});

test('Interval.after takes a number and unit', () => {
  const start = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.after(start, 3, 'days');

  expect(int.start()).toBe(start);
  expect(int.end().day).toBe(28);
});

//------
// .before()
//-------
test('Interval.before takes a duration', () => {
  const end = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.before(end, Duration.fromObject({ days: 3 }));

  expect(int.start().day).toBe(22);
  expect(int.end()).toBe(end);
});

test('Interval.before takes a number and unit', () => {
  const end = DateTime.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.before(end, 3, 'days');

  expect(int.start().day).toBe(22);
  expect(int.end()).toBe(end);
});
