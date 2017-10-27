/* global test expect */

import { DateTime, Settings } from '../../src/luxon';

const organic1 = DateTime.utc(2014, 13, 33),
  // not an actual Wednesday
  organic2 = DateTime.fromObject({ weekday: 3, year: 1982, month: 5, day: 25 }),
  organic3 = DateTime.fromObject({ year: 1982, month: 5, day: 25, hour: 27 });

test('Explicitly invalid dates are invalid', () => {
  const dt = DateTime.invalid('just because');
  expect(dt.isValid).toBe(false);
  expect(dt.invalidReason).toBe('just because');
});

test('Invalid creations are invalid', () => {
  expect(organic1.isValid).toBe(false);
  expect(organic2.isValid).toBe(false);
  expect(organic3.isValid).toBe(false);
});

test('Lots of other ways to create invalid things', () => {
  expect(DateTime.fromObject({ year: 'hello' }).isValid).toBe(false);
  expect(DateTime.fromObject({ ordinal: 5000 }).isValid).toBe(false);
  expect(DateTime.fromObject({ minute: -6 }).isValid).toBe(false);
  expect(DateTime.fromObject({ millisecond: new Date() }).isValid).toBe(false);
});

test('invalid zones result in invalid dates', () => {
  expect(DateTime.local().setZone('America/Lasers').isValid).toBe(false);
  expect(DateTime.fromObject({ zone: 'America/Lasers' }).isValid).toBe(false);
  expect(DateTime.fromJSDate(new Date(), { zone: 'America/Lasers' }).isValid).toBe(false);
});

test('Invalid tell you why', () => {
  expect(organic1.invalidReason).toBe('month out of range');
  expect(organic2.invalidReason).toBe('mismatched weekday');
  expect(organic3.invalidReason).toBe('hour out of range');
});

test('Addition maintains invalidity', () => {
  expect(organic1.plus({ day: 1 }).isValid).toBe(false);
  expect(organic2.plus({ day: 1 }).isValid).toBe(false);
});

test('Subtraction maintains invalidity', () => {
  expect(organic1.minus({ day: 1 }).isValid).toBe(false);
  expect(organic2.minus({ day: 1 }).isValid).toBe(false);
});

test('endOf maintains invalidity', () => {
  expect(organic1.endOf('day').isValid).toBe(false);
  expect(organic2.endOf('day').isValid).toBe(false);
});

test('startOf maintains invalidity', () => {
  expect(organic1.startOf('day').isValid).toBe(false);
  expect(organic2.startOf('day').isValid).toBe(false);
});

test('Conversion to UTC maintains invalidity', () => {
  expect(organic1.toUTC().isValid).toBe(false);
  expect(organic2.toUTC().isValid).toBe(false);
});

test('startOf() maintains invalidity', () => {
  expect(organic1.startOf('month').isValid).toBe(false);
  expect(organic2.startOf('month').isValid).toBe(false);
});

test('Invalid DateTimes format to nothing', () => {
  expect(organic1.toHTTP()).toBe(null);
  expect(organic1.toRFC2822()).toBe(null);
  expect(organic1.toISO()).toBe(null);
  expect(organic1.toFormat('MMM yyyy')).toBe('Invalid DateTime');
  expect(organic1.toLocaleString()).toBe('Invalid DateTime');
  expect(organic1.toString()).toBe('Invalid DateTime');
});

test('Invalid DateTimes return invalid Dates', () => {
  expect(organic1.toJSDate().valueOf()).toBeFalsy();
});

test('Invalid DateTimes have unhelpful getters', () => {
  expect(organic1.year).toBeFalsy();
  expect(organic1.month).toBeFalsy();
  expect(organic1.day).toBeFalsy();
  expect(organic1.hour).toBeFalsy();
  expect(organic1.minute).toBeFalsy();
  expect(organic1.second).toBeFalsy();
  expect(organic1.millisecond).toBeFalsy();
  expect(organic1.weekYear).toBeFalsy();
  expect(organic1.weekNumber).toBeFalsy();
  expect(organic1.weekday).toBeFalsy();
  expect(organic1.ordinal).toBeFalsy();
  expect(organic1.offset).toBeFalsy();
  expect(organic1.offsetNameShort).toBeFalsy();
  expect(organic1.offsetNameLong).toBeFalsy();
  expect(organic1.valueOf()).toBeFalsy();
});

test('Diffing invalid DateTimes creates invalid Durations', () => {
  expect(organic1.diff(DateTime.local()).isValid).toBe(false);
  expect(DateTime.local().diff(organic1).isValid).toBe(false);
});

test('throwOnInvalid throws', () => {
  try {
    Settings.throwOnInvalid = true;
    expect(() =>
      DateTime.fromObject({
        weekday: 3,
        year: 1982,
        month: 5,
        day: 25
      })
    ).toThrow();
  } finally {
    Settings.throwOnInvalid = false;
  }
});
