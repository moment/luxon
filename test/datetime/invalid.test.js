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

test('Addition maintains invalidity', () => {
  expect(organic1.plus({ day: 1 }).isValid).toBe(false);
  expect(organic2.plus({ day: 1 }).isValid).toBe(false);
});

test('Conversion to UTC maintains invalidity', () => {
  expect(organic1.toUTC().isValid).toBe(false);
  expect(organic2.toUTC().isValid).toBe(false);
});

test('startOf() maintains invalidity', () => {
  expect(organic1.startOf('month').isValid).toBe(false);
  expect(organic2.startOf('month').isValid).toBe(false);
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
