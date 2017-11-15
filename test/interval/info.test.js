/* global test expect */
import { DateTime, Interval, Duration } from '../../src/luxon';

const fromISOs = (s, e) => DateTime.fromISO(s).until(DateTime.fromISO(e)),
  todayAt = h =>
    DateTime.local()
      .startOf('day')
      .set({ hour: h });

//------
// #length()
//-------
test('Interval#length defaults to milliseconds', () => {
  const n = DateTime.local(),
    d = n.until(n.plus({ minutes: 1 }));
  expect(d.length()).toBe(60 * 1000);
});

test("Interval#length('days') returns 1 for yesterday", () => {
  expect(
    todayAt(13)
      .minus({ days: 1 })
      .until(todayAt(13))
      .length('days')
  ).toBe(1);
});

test("Interval#length('months') returns the right number of months", () => {
  expect(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('months'))).toBe(197);
});

test("Interval#length('years') returns the right number of years", () => {
  expect(Math.floor(fromISOs('1996-02-17', '2012-08-14').length('years'))).toBe(16);
});

test('Interval#length() returns NaN for invalid intervals', () => {
  const i = Interval.invalid('because');
  expect(i.length('years')).toBeFalsy();
});

//------
// #count()
//-------
test("Interval#count('days') returns 1 inside a day", () => {
  const i = DateTime.fromISO('2016-05-25T03:00').until(DateTime.fromISO('2016-05-25T14:00'));
  expect(i.count('days')).toBe(1);
});

test("Interval#count('days') returns 2 if the interval crosses midnight", () => {
  const i = DateTime.fromISO('2016-05-25T03:00').until(DateTime.fromISO('2016-05-26T14:00'));
  expect(i.count('days')).toBe(2);
});

test("Interval#count('years') returns 1 inside a year", () => {
  const i = DateTime.fromISO('2016-05-25').until(DateTime.fromISO('2016-05-26'));
  expect(i.count('years')).toBe(1);
});

test("Interval#count('years') returns 2 if the interval crosses the new year", () => {
  const i = DateTime.fromISO('2016-05-25').until(DateTime.fromISO('2017-05-26'));
  expect(i.count('years')).toBe(2);
});

test('Interval#count() uses milliseconds by default', () => {
  const i = DateTime.fromISO('2016-05-25T03:00').until(DateTime.fromISO('2016-05-25T14:00'));
  expect(i.count()).toBe(39600001);
});

test('Interval#count() returns NaN for invalid intervals', () => {
  const i = Interval.invalid('because');
  expect(i.count('years')).toBeFalsy();
});

//------
// #toDuration()
//-------
test('Interval#toDuration creates a duration in those units', () => {
  const int = Interval.fromDateTimes(todayAt(9), todayAt(13));

  expect(int.toDuration()).toEqual(Duration.fromMillis(4 * 3600 * 1000));
  expect(int.toDuration('milliseconds')).toEqual(Duration.fromMillis(4 * 3600 * 1000));
  expect(int.toDuration('seconds')).toEqual(Duration.fromObject({ seconds: 4 * 3600 }));
  expect(int.toDuration('minutes')).toEqual(Duration.fromObject({ minutes: 4 * 60 }));
  expect(int.toDuration('hours')).toEqual(Duration.fromObject({ hours: 4 }));
  expect(int.toDuration('days')).toEqual(Duration.fromObject({ days: 1 / 6 }));
  expect(int.toDuration('weeks')).toEqual(Duration.fromObject({ weeks: 1 / (6 * 7) }));
});

test('Interval#toDuration accepts multiple units', () => {
  const int = Interval.fromDateTimes(
    todayAt(9).plus({ minutes: 3 }),
    todayAt(13).plus({ minutes: 47 })
  );

  expect(int.toDuration(['hours', 'minutes'])).toEqual(
    Duration.fromObject({ hours: 4, minutes: 44 })
  );
});

test('Interval#toDuration accepts duration options', () => {
  const int = Interval.fromDateTimes(todayAt(9), todayAt(13)),
    dur = int.toDuration(['hours'], { conversionAccuracy: 'longterm' });
  expect(dur.conversionAccuracy).toBe('longterm');
});

//------
// #contains()
//-------
test('Interval#contains returns true for DateTimes in the interval', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T06:30'))).toBeTruthy();
});

test('Interval#contains returns false for DateTimes after the interval', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T08:30'))).toBeFalsy();
});

test('Interval#contains returns false for DateTimes before the interval', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T05:30'))).toBeFalsy();
});

test('Interval#contains returns true for the start endpoint', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T06:00'))).toBeTruthy();
});

test('Interval#contains returns false for the end endpoint', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T07:00');
  expect(i.contains(DateTime.fromISO('1982-05-25T07:00'))).toBeFalsy();
});

test('Interval#contains returns false for invalid intervals', () => {
  const i = Interval.invalid('because');
  expect(i.contains(DateTime.fromISO('1982-05-25T07:00'))).toBeFalsy();
});

//------
// #isEmpty()
//-------
test('Interval#isEmpty returns true for empty intervals', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T06:00');
  expect(i.isEmpty()).toBeTruthy();
});

test('Interval#isEmpty returns false for non-empty intervals', () => {
  const i = fromISOs('1982-05-25T06:00', '1982-05-25T08:00');
  expect(i.isEmpty()).toBeFalsy();
});

//------
// #isBefore()
//------
test('Interval#isBefore returns true for intervals fully before the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus({ days: 2 }), n.minus({ days: 1 }));
  expect(i.isBefore(n)).toBeTruthy();
});

test('Interval#isBefore returns false for intervals containing the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus({ days: 2 }), n.plus({ days: 2 }));
  expect(i.isBefore(n)).toBeFalsy();
});

test('Interval#isBefore returns false for intervals fully after the input ', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.plus({ days: 2 }), n.plus({ days: 3 }));
  expect(i.isBefore(n)).toBeFalsy();
});

test('Interval#isBefore returns false for intervals starting at the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus({ days: 1 }), n);
  expect(i.isBefore(n)).toBeFalsy();
});

test('Interval#isBefore returns false for invalid intervals', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.invalid('because');
  expect(i.isBefore(n)).toBeFalsy();
});

//------
// #isAfter()
//-------
test('Interval#isAfter returns true for intervals fully after the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.plus({ days: 1 }), n.plus({ days: 2 }));
  expect(i.isAfter(n)).toBeTruthy();
});

test('Interval#isAfter returns false for intervals containing the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus({ day: 2 }), n.plus({ days: 2 }));
  expect(i.isAfter(n)).toBeFalsy();
});

test('Interval#isAfter returns false for fully before the input ', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n.minus({ day: 2 }), n.minus(1, 'day'));
  expect(i.isAfter(n)).toBeFalsy();
});

test('Interval#isAfter returns false for intervals beginning at the input', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n, n.plus({ days: 1 }));
  expect(i.isAfter(n)).toBeFalsy();
});

test('Interval#isAfter returns false for invalid intervals', () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.invalid('because');
  expect(i.isAfter(n)).toBeFalsy();
});

//------
// #hasSame()
//-------
test("Interval#hasSame('day') returns true for durations on the same day", () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n, n.plus({ hours: 5 }));
  expect(i.hasSame('day')).toBeTruthy();
});

test("Interval#hasSame('day') returns true for durations that last until the next day", () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n, n.plus({ hours: 20 }));
  expect(i.hasSame('day')).toBeFalsy();
});

test("Interval#hasSame('day') returns true for durations durations ending at midnight", () => {
  const n = DateTime.fromISO('1982-05-25T06:00'),
    i = Interval.fromDateTimes(n, n.plus({ days: 1 }).startOf('day'));
  expect(i.hasSame('day')).toBeTruthy();
});

test('Interval#hasSame returns false for invalid intervals', () => {
  const i = Interval.invalid('because');
  expect(i.hasSame('day')).toBeFalsy();
});
