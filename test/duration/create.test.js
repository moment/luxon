/* global test expect */

import { Duration, Settings } from '../../src/luxon';

//------
// .fromObject()
//-------
test('Duration.fromObject sets all the values', () => {
  const dur = Duration.fromObject({
    years: 1,
    months: 2,
    days: 3,
    hours: 4,
    minutes: 5,
    seconds: 6,
    milliseconds: 7
  });
  expect(dur.years).toBe(1);
  expect(dur.months).toBe(2);
  expect(dur.days).toBe(3);
  expect(dur.hours).toBe(4);
  expect(dur.minutes).toBe(5);
  expect(dur.seconds).toBe(6);
  expect(dur.milliseconds).toBe(7);
});

test('Duration.fromObject accepts a conversionAccuracy', () => {
  const dur = Duration.fromObject({ days: 1, conversionAccuracy: 'longterm' });
  expect(dur.conversionAccuracy).toBe('longterm');
});

test('Duration.fromObject returns invalid duration if the argument is not an object', () => {
  const dur1 = Duration.fromObject();
  expect(dur1.isValid).toBe(false);
  expect(dur1.invalidReason).toBe('invalid input');

  const dur2 = Duration.fromObject(null);
  expect(dur2.isValid).toBe(false);
  expect(dur2.invalidReason).toBe('invalid input');

  const dur3 = Duration.fromObject('foo');
  expect(dur3.isValid).toBe(false);
  expect(dur3.invalidReason).toBe('invalid input');
});

test('Duration.fromObject returns invalid duration if the initial object has no units', () => {
  const dur = Duration.fromObject({});
  expect(dur.isValid).toBe(false);
  expect(dur.invalidReason).toBe('invalid input');
});
