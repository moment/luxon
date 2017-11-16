/* global test expect */
import { DateTime, Interval } from '../../src/luxon';

const todayAt = h =>
    DateTime.local()
      .startOf('day')
      .set({ hour: h }),
  todayFrom = (h1, h2) => Interval.fromDateTimes(todayAt(h1), todayAt(h2));

test('Interval.set can set the start', () => {
  expect(todayFrom(3, 5).set({ start: todayAt(4) }).start.hour).toBe(4);
});

test('Interval.set can set the end', () => {
  expect(todayFrom(3, 5).set({ end: todayAt(6) }).end.hour).toBe(6);
});

test('Interval.set preserves invalidity', () => {
  const invalid = Interval.invalid('because');
  expect(invalid.set({ start: todayAt(4) }).isValid).toBe(false);
});
