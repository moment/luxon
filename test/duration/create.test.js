/* global test expect */

import { Duration } from '../../src/luxon';

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
  expect(dur.years()).toBe(1);
  expect(dur.months()).toBe(2);
  expect(dur.days()).toBe(3);
  expect(dur.hours()).toBe(4);
  expect(dur.minutes()).toBe(5);
  expect(dur.seconds()).toBe(6);
  expect(dur.milliseconds()).toBe(7);
});
