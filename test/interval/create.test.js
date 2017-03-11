/* global test expect */
import { Instant, Interval, Duration } from '../../dist/cjs/luxon';

//------
// .fromObject()
//-------
test('Interval.fromObject creates an interval', () => {
  const start = Instant.fromObject({ year: 2016, month: 5, day: 25 }),
    end = Instant.fromObject({ year: 2016, month: 5, day: 27 }),
    int = Interval.fromInstants(start, end);

  expect(int.start()).toBe(start);
  expect(int.end()).toBe(end);
});

//------
// .after()
//-------
test('Interval.after takes a duration', () => {
  const start = Instant.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.after(start, Duration.fromObject({ days: 3 }));

  expect(int.start()).toBe(start);
  expect(int.end().day()).toBe(28);
});

test('Interval.after takes a number and unit', () => {
  const start = Instant.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.after(start, 3, 'days');

  expect(int.start()).toBe(start);
  expect(int.end().day()).toBe(28);
});

//------
// .before()
//-------
test('Interval.before takes a duration', () => {
  const end = Instant.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.before(end, Duration.fromObject({ days: 3 }));

  expect(int.start().day()).toBe(22);
  expect(int.end()).toBe(end);
});

test('Interval.before takes a number and unit', () => {
  const end = Instant.fromObject({ year: 2016, month: 5, day: 25 }),
    int = Interval.before(end, 3, 'days');

  expect(int.start().day()).toBe(22);
  expect(int.end()).toBe(end);
});
