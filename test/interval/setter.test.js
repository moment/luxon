/* global test expect */
import { Interval } from '../../src/luxon';
import { Helpers } from '../helpers';

const todayFrom = (h1, h2) => Interval.fromDateTimes(Helpers.atHour(h1), Helpers.atHour(h2));

test('Interval.set can set the start', () => {
  expect(todayFrom(3, 5).set({ start: Helpers.atHour(4) }).start.hour).toBe(4);
});

test('Interval.set can set the end', () => {
  expect(todayFrom(3, 5).set({ end: Helpers.atHour(6) }).end.hour).toBe(6);
});

test('Interval.set preserves invalidity', () => {
  const invalid = Interval.invalid('because');
  expect(invalid.set({ start: Helpers.atHour(4) }).isValid).toBe(false);
});
