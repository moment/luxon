/* global test expect */

import { DateTime } from '../../src/luxon';

const organic1 = DateTime.utc(2014, 13, 33),
  // not an actual Wednesday
  organic2 = DateTime.fromObject({ weekday: 3, year: 1982, month: 5, day: 25 });

test('Explicitly invalid dates are invalid', () => {
  expect(DateTime.invalid().isValid()).toBe(false);
});

test('Invalid creations are invalid', () => {
  expect(organic1.isValid()).toBe(false);
  expect(organic2.isValid()).toBe(false);
});

test('Addition maintains invalidity', () => {
  expect(organic1.plus(1, 'day').isValid()).toBe(false);
  expect(organic2.plus(1, 'day').isValid()).toBe(false);
});

test('Conversion to UTC maintains invalidity', () => {
  expect(organic1.toUTC().isValid()).toBe(false);
  expect(organic2.toUTC().isValid()).toBe(false);
});

test('startOf() maintains invalidity', () => {
  expect(organic1.startOf('month').isValid()).toBe(false);
  expect(organic2.startOf('month').isValid()).toBe(false);
});
