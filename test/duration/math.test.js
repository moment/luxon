/* global test expect */

import { Duration } from '../../src/luxon';

//------
// #plus()
//------
test('Duration#plus add straightforward durations', () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({ hours: 1, seconds: 6, milliseconds: 14 }),
    result = first.plus(second);

  expect(result.hours).toBe(5);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(8);
  expect(result.milliseconds).toBe(14);
});

test('Duration#plus noops empty druations', () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({}),
    result = first.plus(second);

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(2);
});

test('Duration#plus adds negatives', () => {
  const first = Duration.fromObject({ hours: 4, minutes: -12, seconds: -2 }),
    second = Duration.fromObject({ hours: -5, seconds: 6, milliseconds: 14 }),
    result = first.plus(second);

  expect(result.hours).toBe(-1);
  expect(result.minutes).toBe(-12);
  expect(result.seconds).toBe(4);
  expect(result.milliseconds).toBe(14);
});

test('Duration#plus adds single values', () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    result = first.plus(5, 'minutes');

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(17);
  expect(result.seconds).toBe(2);
});

//------
// #minus()
//------
test('Duration#minus subtracts durations', () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    second = Duration.fromObject({ hours: 1, seconds: 6, milliseconds: 14 }),
    result = first.minus(second);

  expect(result.hours).toBe(3);
  expect(result.minutes).toBe(12);
  expect(result.seconds).toBe(-4);
  expect(result.milliseconds).toBe(-14);
});

test('Duration#minus subtracts single values', () => {
  const first = Duration.fromObject({ hours: 4, minutes: 12, seconds: 2 }),
    result = first.minus(5, 'minutes');

  expect(result.hours).toBe(4);
  expect(result.minutes).toBe(7);
  expect(result.seconds).toBe(2);
});
