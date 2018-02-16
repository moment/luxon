/* global test expect */

import { DateTime, Duration } from '../../src/luxon';

function createDateTime() {
  return DateTime.fromObject({
    year: 2010,
    month: 2,
    day: 3,

    hour: 4,
    minute: 5,
    second: 6,
    millisecond: 7
  });
}

//------
// #plus()
//------
test('DateTime#plus({ years: 1 }) adds a year', () => {
  const i = createDateTime().plus({ years: 1 });
  expect(i.year).toBe(2011);
});

test('DateTime#plus({quarter: 1}) adds a quarter', () => {
  const i = createDateTime().plus({ quarters: 1 });
  expect(i.quarter).toBe(2);
  expect(i.month).toBe(5);
});

test('DateTime#plus({ months: 1 }) at the end of the month', () => {
  const i = DateTime.fromISO('2018-01-31T10:00'),
    later = i.plus({ months: 1 });
  expect(later.day).toBe(28);
  expect(later.month).toBe(2);
});

test('DateTime#plus({ months: 1 }) at the end of the month in a leap year', () => {
  const i = DateTime.fromISO('2016-01-31T10:00'),
    later = i.plus({ months: 1 });
  expect(later.day).toBe(29);
  expect(later.month).toBe(2);
});

test('DateTime#plus({ months: 13 }) at the end of the month', () => {
  const i = DateTime.fromISO('2015-01-31T10:00'),
    later = i.plus({ months: 13 });
  expect(later.day).toBe(29);
  expect(later.month).toBe(2);
  expect(later.year).toBe(2016);
});

test('DateTime#plus({ days: 1 }) keeps the same time across a DST', () => {
  const i = DateTime.fromISO('2016-03-12T10:00', {
      zone: 'America/Los_Angeles'
    }),
    later = i.plus({ days: 1 });
  expect(later.day).toBe(13);
  expect(later.hour).toBe(10);
});

test('DateTime#plus({ hours: 24 }) gains an hour to spring forward', () => {
  const i = DateTime.fromISO('2016-03-12T10:00', {
      zone: 'America/Los_Angeles'
    }),
    later = i.plus({ hours: 24 });
  expect(later.day).toBe(13);
  expect(later.hour).toBe(11);
});

test('DateTime#plus(Duration) adds the right amount of time', () => {
  const i = DateTime.fromISO('2016-03-12T10:13'),
    later = i.plus(Duration.fromObject({ day: 1, hour: 3, minute: 28 }));
  expect(later.day).toBe(13);
  expect(later.hour).toBe(13);
  expect(later.minute).toBe(41);
});

test('DateTime#plus(multiple) adds the right amount of time', () => {
  const i = DateTime.fromISO('2016-03-12T10:13'),
    later = i.plus({ days: 1, hours: 3, minutes: 28 });
  expect(later.day).toBe(13);
  expect(later.hour).toBe(13);
  expect(later.minute).toBe(41);
});

test('DateTime#plus maintains invalidity', () => {
  expect(DateTime.invalid('because').plus({ day: 1 }).isValid).toBe(false);
});

//------
// #minus()
//------
test('DateTime#minus({ years: 1 }) subtracts a year', () => {
  const dt = createDateTime().minus({ years: 1 });
  expect(dt.year).toBe(2009);
});

test('DateTime#minus({ quarters: 1 }) subtracts a quarter', () => {
  const dt = createDateTime().minus({ quarters: 1 });
  expect(dt.year).toBe(2009);
  expect(dt.quarter).toBe(4);
  expect(dt.month).toBe(11);
});

test('DateTime#minus({ months: 1 }) at the end of the month', () => {
  const i = DateTime.fromISO('2018-03-31T10:00'),
    earlier = i.minus({ months: 1 });
  expect(earlier.day).toBe(28);
  expect(earlier.month).toBe(2);
});

test('DateTime#minus({ months: 1 }) at the end of the month in a leap year', () => {
  const i = DateTime.fromISO('2016-03-31T10:00'),
    earlier = i.minus({ months: 1 });
  expect(earlier.day).toBe(29);
  expect(earlier.month).toBe(2);
});

test('DateTime#minus({ months: 13 }) at the end of the month', () => {
  const i = DateTime.fromISO('2017-03-31T10:00'),
    earlier = i.minus({ months: 13 });
  expect(earlier.day).toBe(29);
  expect(earlier.month).toBe(2);
  expect(earlier.year).toBe(2016);
});

test('DateTime#minus maintains invalidity', () => {
  expect(DateTime.invalid('because').minus({ day: 1 }).isValid).toBe(false);
});

//------
// #startOf()
//------
test("DateTime#startOf('year') goes to the start of the year", () => {
  const dt = createDateTime().startOf('year');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(1);
  expect(dt.day).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime#startOf('quarter') goes to the start of the month", () => {
  const dt = createDateTime().startOf('quarter');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(1);
  expect(dt.day).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime#startOf('month') goes to the start of the month", () => {
  const dt = createDateTime().startOf('month');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(1);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime#startOf('day') goes to the start of the day", () => {
  const dt = createDateTime().startOf('day');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(3);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime#startOf('hour') goes to the start of the hour", () => {
  const dt = createDateTime().startOf('hour');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(3);
  expect(dt.hour).toBe(4);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime#startOf('minute') goes to the start of the minute", () => {
  const dt = createDateTime().startOf('minute');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(3);
  expect(dt.hour).toBe(4);
  expect(dt.minute).toBe(5);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test("DateTime#startOf('second') goes to the start of the second", () => {
  const dt = createDateTime().startOf('second');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(3);
  expect(dt.hour).toBe(4);
  expect(dt.minute).toBe(5);
  expect(dt.second).toBe(6);
  expect(dt.millisecond).toBe(0);
});

test("DateTime#startOf('week') goes to the start of the week", () => {
  // using a different day so that it doesn't end up as the first of the month
  const dt = DateTime.fromISO('2016-03-12T10:00').startOf('week');

  expect(dt.year).toBe(2016);
  expect(dt.month).toBe(3);
  expect(dt.day).toBe(7);
  expect(dt.hour).toBe(0);
  expect(dt.minute).toBe(0);
  expect(dt.second).toBe(0);
  expect(dt.millisecond).toBe(0);
});

test('DateTime#startOf maintains invalidity', () => {
  expect(DateTime.invalid('because').startOf('day').isValid).toBe(false);
});

test('DateTime#startOf throws on invalid units', () => {
  expect(() => DateTime.fromISO('2016-03-12T10:00').startOf('splork')).toThrow();
});

//------
// #endOf()
//------
test("DateTime#endOf('year') goes to the start of the year", () => {
  const dt = createDateTime().endOf('year');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(12);
  expect(dt.day).toBe(31);
  expect(dt.hour).toBe(23);
  expect(dt.minute).toBe(59);
  expect(dt.second).toBe(59);
  expect(dt.millisecond).toBe(999);
});

test("DateTime#endOf('quarter') goes to the end of the quarter", () => {
  const dt = createDateTime().endOf('quarter');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(3);
  expect(dt.day).toBe(31);
  expect(dt.hour).toBe(23);
  expect(dt.minute).toBe(59);
  expect(dt.second).toBe(59);
  expect(dt.millisecond).toBe(999);
});

test("DateTime#endOf('month') goes to the start of the month", () => {
  const dt = createDateTime().endOf('month');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(28);
  expect(dt.hour).toBe(23);
  expect(dt.minute).toBe(59);
  expect(dt.second).toBe(59);
  expect(dt.millisecond).toBe(999);
});

test("DateTime#endOf('day') goes to the start of the day", () => {
  const dt = createDateTime().endOf('day');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(3);
  expect(dt.hour).toBe(23);
  expect(dt.minute).toBe(59);
  expect(dt.second).toBe(59);
  expect(dt.millisecond).toBe(999);
});

test("DateTime#endOf('hour') goes to the start of the hour", () => {
  const dt = createDateTime().endOf('hour');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(3);
  expect(dt.hour).toBe(4);
  expect(dt.minute).toBe(59);
  expect(dt.second).toBe(59);
  expect(dt.millisecond).toBe(999);
});

test("DateTime#endOf('minute') goes to the start of the minute", () => {
  const dt = createDateTime().endOf('minute');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(3);
  expect(dt.hour).toBe(4);
  expect(dt.minute).toBe(5);
  expect(dt.second).toBe(59);
  expect(dt.millisecond).toBe(999);
});

test("DateTime#endOf('second') goes to the start of the second", () => {
  const dt = createDateTime().endOf('second');

  expect(dt.year).toBe(2010);
  expect(dt.month).toBe(2);
  expect(dt.day).toBe(3);
  expect(dt.hour).toBe(4);
  expect(dt.minute).toBe(5);
  expect(dt.second).toBe(6);
  expect(dt.millisecond).toBe(999);
});

test("DateTime#endOf('week') goes to the end of the week", () => {
  // using a different day so that it doesn't end up as the first of the month
  const dt = DateTime.fromISO('2016-03-12T10:00').endOf('week');

  expect(dt.year).toBe(2016);
  expect(dt.month).toBe(3);
  expect(dt.day).toBe(13);
  expect(dt.hour).toBe(23);
  expect(dt.minute).toBe(59);
  expect(dt.second).toBe(59);
  expect(dt.millisecond).toBe(999);
});

test('DateTime#endOf maintains invalidity', () => {
  expect(DateTime.invalid('because').endOf('day').isValid).toBe(false);
});

test('DateTime#endOf throws on invalid units', () => {
  expect(() => DateTime.fromISO('2016-03-12T10:00').endOf('splork')).toThrow();
});
